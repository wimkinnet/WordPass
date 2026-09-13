import { Router } from "express";
import Word from "../models/Word.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  const words = await Word.find({ owner: req.user.id }).sort({ createdAt: -1 });
  res.json(words);
});

router.post("/", async (req, res) => {
  const { french, dutch, notes } = req.body;
  if (!french?.trim() || !dutch?.trim()) {
    return res.status(400).json({ error: "Both french and dutch are required." });
  }
  const word = await Word.create({
    owner: req.user.id,
    french: french.trim(),
    dutch: dutch.trim(),
    notes: (notes || "").trim(),
  });
  res.status(201).json(word);
});

router.put("/:id", async (req, res) => {
  const { french, dutch, notes } = req.body;
  const word = await Word.findOne({ _id: req.params.id, owner: req.user.id });
  if (!word) return res.status(404).json({ error: "Word not found." });

  if (french?.trim()) word.french = french.trim();
  if (dutch?.trim()) word.dutch = dutch.trim();
  if (notes !== undefined) word.notes = notes.trim();
  await word.save();
  res.json(word);
});

router.delete("/:id", async (req, res) => {
  const word = await Word.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  if (!word) return res.status(404).json({ error: "Word not found." });
  res.json({ ok: true });
});

export default router;
