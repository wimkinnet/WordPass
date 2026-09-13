// Leitner box intervals in days, indexed by level (0 = newest / hardest, 5 = mastered)
export const BOX_INTERVALS_DAYS = [0, 1, 3, 7, 14, 30];

export function nextReviewDate(level) {
  return new Date(Date.now() + BOX_INTERVALS_DAYS[level] * 24 * 60 * 60 * 1000);
}

export function normalize(str) {
  return (str || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.,!?;:]+$/g, "");
}
