import { Router } from "express";
import Word from "../models/Word.js";
import Sentence from "../models/Sentence.js";
import { getOrCreateProgress } from "../models/Progress.js";
import { computeEarnedBadgeIds } from "../badges.js";
import { BOX_INTERVALS_DAYS, nextReviewDate, normalize } from "../scheduling.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
router.use(authMiddleware);

function todayStr(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function isYesterday(dateStr, today) {
  const d = new Date(dateStr + "T00:00:00Z");
  const t = new Date(today + "T00:00:00Z");
  return Math.round((t - d) / (1000 * 60 * 60 * 24)) === 1;
}

// Pick a random "blankable" word (length >= 4 once punctuation is stripped)
// from a sentence. Returns null if nothing qualifies, in which case the
// caller should fall back to full-translation mode.
function pickBlankIndex(text) {
  const tokens = text.split(" ");
  const candidates = tokens
    .map((tok, i) => ({ i, clean: tok.replace(/[.,!?;:]/g, "") }))
    .filter((t) => t.clean.length >= 4);
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)].i;
}

function blankedSentence(text, index) {
  const tokens = text.split(" ");
  tokens[index] = "____";
  return tokens.join(" ");
}

// GET /api/quiz/next?count=10 - a mixed batch of due + fresh words AND sentences
router.get("/next", async (req, res) => {
  const count = Math.min(parseInt(req.query.count) || 10, 30);
  const now = new Date();
  const owner = req.user.id;

  const dueWords = await Word.find({ owner, nextReview: { $lte: now } }).sort({ nextReview: 1 });
  const dueSentences = await Sentence.find({ owner, nextReview: { $lte: now } }).sort({ nextReview: 1 });

  let pool = [
    ...dueWords.map((w) => ({ type: "word", doc: w })),
    ...dueSentences.map((s) => ({ type: "sentence", doc: s })),
  ];

  if (pool.length < count) {
    const excludeWordIds = dueWords.map((w) => w._id);
    const excludeSentenceIds = dueSentences.map((s) => s._id);
    const need = count - pool.length;
    const [extraWords, extraSentences] = await Promise.all([
      Word.aggregate([
        { $match: { owner: owner, _id: { $nin: excludeWordIds } } },
        { $sample: { size: Math.ceil(need / 2) } },
      ]),
      Sentence.aggregate([
        { $match: { owner: owner, _id: { $nin: excludeSentenceIds } } },
        { $sample: { size: Math.floor(need / 2) } },
      ]),
    ]);
    pool = pool.concat(
      extraWords.map((w) => ({ type: "word", doc: w })),
      extraSentences.map((s) => ({ type: "sentence", doc: s }))
    );
  }

  // shuffle and trim to count
  pool.sort(() => Math.random() - 0.5);
  pool = pool.slice(0, count);

  const items = pool.map(({ type, doc }) => {
    const direction = Math.random() < 0.5 ? "fr-nl" : "nl-fr";
    const sourceText = direction === "fr-nl" ? doc.french : doc.dutch;

    if (type === "word") {
      return { itemId: doc._id, itemType: "word", direction, prompt: sourceText };
    }

    // sentence: randomly choose full-translation vs fill-in-blank
    const targetText = direction === "fr-nl" ? doc.dutch : doc.french;
    const useBlank = Math.random() < 0.5;
    const blankIndex = useBlank ? pickBlankIndex(targetText) : null;

    if (blankIndex === null) {
      return { itemId: doc._id, itemType: "sentence", mode: "full", direction, prompt: sourceText };
    }
    return {
      itemId: doc._id,
      itemType: "sentence",
      mode: "blank",
      direction,
      prompt: sourceText,
      displaySentence: blankedSentence(targetText, blankIndex),
      blankIndex,
    };
  });

  res.json(items);
});

// POST /api/quiz/answer - grade an answer for a word or sentence
router.post("/answer", async (req, res) => {
  const { itemId, itemType, direction, mode, blankIndex, answer } = req.body;
  const owner = req.user.id;
  const Model = itemType === "sentence" ? Sentence : Word;

  const doc = await Model.findOne({ _id: itemId, owner });
  if (!doc) return res.status(404).json({ error: "Item not found." });

  let correctAnswer;
  if (itemType === "sentence" && mode === "blank") {
    const targetText = direction === "fr-nl" ? doc.dutch : doc.french;
    const tokens = targetText.split(" ");
    correctAnswer = (tokens[blankIndex] || "").replace(/[.,!?;:]/g, "");
  } else {
    correctAnswer = direction === "fr-nl" ? doc.dutch : doc.french;
  }

  const correct = normalize(answer) === normalize(correctAnswer);
  const previousLevel = doc.level;

  doc.level = correct ? Math.min(doc.level + 1, 5) : 0;
  if (correct) doc.correctCount += 1;
  else doc.wrongCount += 1;
  doc.lastReviewed = new Date();
  doc.nextReview = nextReviewDate(doc.level);
  await doc.save();

  const progress = await getOrCreateProgress(owner);
  const today = todayStr();

  progress.totalReviews += 1;
  const base = itemType === "sentence" ? 15 : 10;
  const pointsEarned = correct ? base + previousLevel * 4 : 0;
  progress.points += pointsEarned;

  if (correct) {
    progress.correctReviews += 1;
    progress.currentCorrectStreak += 1;
    progress.bestCorrectStreak = Math.max(progress.bestCorrectStreak, progress.currentCorrectStreak);
  } else {
    progress.currentCorrectStreak = 0;
  }

  if (progress.lastActiveDate !== today) {
    if (progress.lastActiveDate && isYesterday(progress.lastActiveDate, today)) {
      progress.streak += 1;
    } else {
      progress.streak = 1;
    }
    progress.longestStreak = Math.max(progress.longestStreak, progress.streak);
    progress.lastActiveDate = today;
  }

  const [wordCount, sentenceCount, masteredWordCount, masteredSentenceCount] = await Promise.all([
    Word.countDocuments({ owner }),
    Sentence.countDocuments({ owner }),
    Word.countDocuments({ owner, level: 5 }),
    Sentence.countDocuments({ owner, level: 5 }),
  ]);

  const earnedIds = computeEarnedBadgeIds({
    wordCount,
    sentenceCount,
    masteredWordCount,
    masteredSentenceCount,
    progress,
  });
  const alreadyEarned = new Set(progress.earnedBadges.map((b) => b.id));
  const newBadgeIds = earnedIds.filter((id) => !alreadyEarned.has(id));
  newBadgeIds.forEach((id) => progress.earnedBadges.push({ id, earnedAt: new Date() }));

  await progress.save();

  res.json({ correct, correctAnswer, pointsEarned, newBadgeIds, progress });
});

export default router;
