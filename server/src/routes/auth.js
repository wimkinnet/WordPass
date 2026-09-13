import { Router } from "express";
import User from "../models/User.js";
import { signToken, authMiddleware } from "../middleware/auth.js";

const router = Router();

// POST /api/auth/register - self-signup. The very first user ever created
// becomes admin automatically; everyone after that is a regular user.
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username?.trim() || !password || password.length < 4) {
    return res.status(400).json({
      error: "Username and a password of at least 4 characters are required.",
    });
  }

  const normalized = username.trim().toLowerCase();
  const existing = await User.findOne({ username: normalized });
  if (existing) return res.status(409).json({ error: "That username is already taken." });

  const isFirstUser = (await User.countDocuments()) === 0;
  const passwordHash = await User.hashPassword(password);
  const user = await User.create({
    username: normalized,
    passwordHash,
    role: isFirstUser ? "admin" : "user",
  });

  const token = signToken(user);
  res.status(201).json({ token, user: { id: user._id, username: user.username, role: user.role } });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username: (username || "").trim().toLowerCase() });
  if (!user || !(await user.checkPassword(password || ""))) {
    return res.status(401).json({ error: "Incorrect username or password." });
  }
  const token = signToken(user);
  res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
});

// GET /api/auth/me - confirm the current token is valid and get fresh user info
router.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({ id: user._id, username: user.username, role: user.role });
});

export default router;
