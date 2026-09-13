import { Router } from "express";
import Word from "../models/Word.js";
import Sentence from "../models/Sentence.js";
import { getOrCreateProgress } from "../models/Progress.js";
import { BADGE_CATALOG } from "../badges.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  const owner = req.user.id;
  const progress = await getOrCreateProgress(owner);
  const [wordCount, sentenceCount, masteredWordCount, masteredSentenceCount] = await Promise.all([
    Word.countDocuments({ owner }),
    Sentence.countDocuments({ owner }),
    Word.countDocuments({ owner, level: 5 }),
    Sentence.countDocuments({ owner, level: 5 }),
  ]);

  const earnedMap = new Map(progress.earnedBadges.map((b) => [b.id, b.earnedAt]));
  const badges = BADGE_CATALOG.map((b) => ({
    id: b.id,
    name: b.name,
    desc: b.desc,
    earned: earnedMap.has(b.id),
    earnedAt: earnedMap.get(b.id) || null,
  }));

  res.json({
    points: progress.points,
    streak: progress.streak,
    longestStreak: progress.longestStreak,
    totalReviews: progress.totalReviews,
    correctReviews: progress.correctReviews,
    wordCount,
    sentenceCount,
    masteredWordCount,
    masteredSentenceCount,
    badges,
  });
});

export default router;
