import mongoose from "mongoose";

const sentenceSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  french: { type: String, required: true, trim: true },
  dutch: { type: String, required: true, trim: true },
  notes: { type: String, default: "", trim: true },
  level: { type: Number, default: 0, min: 0, max: 5 },
  correctCount: { type: Number, default: 0 },
  wrongCount: { type: Number, default: 0 },
  nextReview: { type: Date, default: () => new Date() },
  lastReviewed: { type: Date, default: null },
  createdAt: { type: Date, default: () => new Date() },
});

export default mongoose.model("Sentence", sentenceSchema);
