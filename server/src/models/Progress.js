import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  points: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: String, default: null }, // "YYYY-MM-DD"
  totalReviews: { type: Number, default: 0 },
  correctReviews: { type: Number, default: 0 },
  currentCorrectStreak: { type: Number, default: 0 },
  bestCorrectStreak: { type: Number, default: 0 },
  earnedBadges: [
    {
      id: String,
      earnedAt: Date,
    },
  ],
});

const Progress = mongoose.model("Progress", progressSchema);

export async function getOrCreateProgress(ownerId) {
  let progress = await Progress.findOne({ owner: ownerId });
  if (!progress) {
    progress = await Progress.create({ owner: ownerId });
  }
  return progress;
}

export default Progress;
