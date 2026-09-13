import { Router } from "express";
import User from "../models/User.js";
import Word from "../models/Word.js";
import Sentence from "../models/Sentence.js";
import Progress, { getOrCreateProgress } from "../models/Progress.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = Router();
router.use(authMiddleware, adminMiddleware);

// GET /api/admin/users - all users with quick stats
router.get("/users", async (req, res) => {
  const users = await User.find().sort({ createdAt: 1 });
  const rows = await Promise.all(
    users.map(async (u) => {
      const [wordCount, sentenceCount, progress] = await Promise.all([
        Word.countDocuments({ owner: u._id }),
        Sentence.countDocuments({ owner: u._id }),
        getOrCreateProgress(u._id),
      ]);
      return {
        id: u._id,
        username: u.username,
        role: u.role,
        createdAt: u.createdAt,
        wordCount,
        sentenceCount,
        points: progress.points,
        streak: progress.streak,
      };
    })
  );
  res.json(rows);
});

// POST /api/admin/users - admin creates a user with a chosen role
router.post("/users", async (req, res) => {
  const { username, password, role } = req.body;
  if (!username?.trim() || !password || password.length < 4) {
    return res.status(400).json({ error: "Username and a password of at least 4 characters are required." });
  }
  const normalized = username.trim().toLowerCase();
  if (await User.findOne({ username: normalized })) {
    return res.status(409).json({ error: "That username is already taken." });
  }
  const passwordHash = await User.hashPassword(password);
  const user = await User.create({
    username: normalized,
    passwordHash,
    role: role === "admin" ? "admin" : "user",
  });
  res.status(201).json({ id: user._id, username: user.username, role: user.role });
});

// PATCH /api/admin/users/:id - change role and/or reset password
router.patch("/users/:id", async (req, res) => {
  const { role, password } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found." });

  if (role && ["admin", "user"].includes(role)) user.role = role;
  if (password) {
    if (password.length < 4) return res.status(400).json({ error: "Password too short." });
    user.passwordHash = await User.hashPassword(password);
  }
  await user.save();
  res.json({ id: user._id, username: user.username, role: user.role });
});

// DELETE /api/admin/users/:id - remove a user and all their data
router.delete("/users/:id", async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: "You can't delete your own account while logged in as it." });
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found." });
  await Promise.all([
    Word.deleteMany({ owner: user._id }),
    Sentence.deleteMany({ owner: user._id }),
    Progress.deleteOne({ owner: user._id }),
  ]);
  res.json({ ok: true });
});

// GET /api/admin/users/:id/words - moderate a specific user's words
router.get("/users/:id/words", async (req, res) => {
  const words = await Word.find({ owner: req.params.id }).sort({ createdAt: -1 });
  res.json(words);
});

router.put("/words/:id", async (req, res) => {
  const { french, dutch, notes } = req.body;
  const word = await Word.findById(req.params.id);
  if (!word) return res.status(404).json({ error: "Word not found." });
  if (french?.trim()) word.french = french.trim();
  if (dutch?.trim()) word.dutch = dutch.trim();
  if (notes !== undefined) word.notes = notes.trim();
  await word.save();
  res.json(word);
});

router.delete("/words/:id", async (req, res) => {
  const word = await Word.findByIdAndDelete(req.params.id);
  if (!word) return res.status(404).json({ error: "Word not found." });
  res.json({ ok: true });
});

// GET /api/admin/users/:id/sentences - moderate a specific user's sentences
router.get("/users/:id/sentences", async (req, res) => {
  const sentences = await Sentence.find({ owner: req.params.id }).sort({ createdAt: -1 });
  res.json(sentences);
});

router.put("/sentences/:id", async (req, res) => {
  const { french, dutch, notes } = req.body;
  const sentence = await Sentence.findById(req.params.id);
  if (!sentence) return res.status(404).json({ error: "Sentence not found." });
  if (french?.trim()) sentence.french = french.trim();
  if (dutch?.trim()) sentence.dutch = dutch.trim();
  if (notes !== undefined) sentence.notes = notes.trim();
  await sentence.save();
  res.json(sentence);
});

router.delete("/sentences/:id", async (req, res) => {
  const sentence = await Sentence.findByIdAndDelete(req.params.id);
  if (!sentence) return res.status(404).json({ error: "Sentence not found." });
  res.json({ ok: true });
});

export default router;
