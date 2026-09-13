import { Router } from "express";
import Sentence from "../models/Sentence.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  const sentences = await Sentence.find({ owner: req.user.id }).sort({ createdAt: -1 });
  res.json(sentences);
});

router.post("/", async (req, res) => {
  const { french, dutch, notes } = req.body;
  if (!french?.trim() || !dutch?.trim()) {
    return res.status(400).json({ error: "Both french and dutch are required." });
  }
  const sentence = await Sentence.create({
    owner: req.user.id,
    french: french.trim(),
    dutch: dutch.trim(),
    notes: (notes || "").trim(),
  });
  res.status(201).json(sentence);
});

router.put("/:id", async (req, res) => {
  const { french, dutch, notes } = req.body;
  const sentence = await Sentence.findOne({ _id: req.params.id, owner: req.user.id });
  if (!sentence) return res.status(404).json({ error: "Sentence not found." });

  if (french?.trim()) sentence.french = french.trim();
  if (dutch?.trim()) sentence.dutch = dutch.trim();
  if (notes !== undefined) sentence.notes = notes.trim();
  await sentence.save();
  res.json(sentence);
});

router.delete("/:id", async (req, res) => {
  const sentence = await Sentence.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  if (!sentence) return res.status(404).json({ error: "Sentence not found." });
  res.json({ ok: true });
});

export default router;
