// Badges are pure functions of current state, recomputed after every quiz answer.
// ctx = { wordCount, sentenceCount, masteredWordCount, masteredSentenceCount, progress }

export const BADGE_CATALOG = [
  {
    id: "first_word",
    name: "First Stamp",
    desc: "Add your very first word",
    check: (ctx) => ctx.wordCount >= 1,
  },
  {
    id: "ten_words",
    name: "Word Collector",
    desc: "Add 10 words to your passport",
    check: (ctx) => ctx.wordCount >= 10,
  },
  {
    id: "fifty_words",
    name: "Vocabulary Explorer",
    desc: "Add 50 words",
    check: (ctx) => ctx.wordCount >= 50,
  },
  {
    id: "first_sentence",
    name: "First Postcard",
    desc: "Add your very first sentence",
    check: (ctx) => ctx.sentenceCount >= 1,
  },
  {
    id: "ten_sentences",
    name: "Storyteller",
    desc: "Add 10 sentences",
    check: (ctx) => ctx.sentenceCount >= 10,
  },
  {
    id: "streak_3",
    name: "3-Day Traveler",
    desc: "Practice 3 days in a row",
    check: (ctx) => ctx.progress.streak >= 3,
  },
  {
    id: "streak_7",
    name: "Week-Long Journey",
    desc: "Practice 7 days in a row",
    check: (ctx) => ctx.progress.streak >= 7,
  },
  {
    id: "streak_30",
    name: "Globetrotter",
    desc: "Practice 30 days in a row",
    check: (ctx) => ctx.progress.streak >= 30,
  },
  {
    id: "fifty_correct",
    name: "Sharp Ear",
    desc: "50 correct answers in total",
    check: (ctx) => ctx.progress.correctReviews >= 50,
  },
  {
    id: "hundred_correct",
    name: "Border Control Pro",
    desc: "100 correct answers in total",
    check: (ctx) => ctx.progress.correctReviews >= 100,
  },
  {
    id: "perfect_crossing",
    name: "Perfect Crossing",
    desc: "Get 10 correct answers in a row",
    check: (ctx) => ctx.progress.bestCorrectStreak >= 10,
  },
  {
    id: "ten_mastered",
    name: "Master Linguist",
    desc: "Fully master 10 words",
    check: (ctx) => ctx.masteredWordCount >= 10,
  },
  {
    id: "ten_sentences_mastered",
    name: "Fluent Storyteller",
    desc: "Fully master 10 sentences",
    check: (ctx) => ctx.masteredSentenceCount >= 10,
  },
];

export function computeEarnedBadgeIds(ctx) {
  return BADGE_CATALOG.filter((b) => b.check(ctx)).map((b) => b.id);
}
