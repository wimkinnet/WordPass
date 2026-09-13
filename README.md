# Woordenpaspoort v2 🛂

A French ⇄ Dutch vocabulary + sentence trainer for multiple learners, each with
their own private word/sentence library, login, and an admin who can manage
accounts and moderate everyone's content.

## What's new vs v1

- **Login for multiple users** — each person has their own account and their
  own private words/sentences/progress.
- **Sentences**, not just single words — practiced either as a full
  translation, or fill-in-the-blank (one word hidden in the sentence).
- **Admin role** — can create/delete accounts, promote/demote admins, reset
  passwords, see everyone's points/streak, and edit or delete any user's
  words/sentences.

## How accounts work

- **Self-signup is open**: anyone can create an account from the login screen.
- **The very first account ever created automatically becomes admin.** Make
  that account yours (or another parent's) before sharing the sign-up link
  with kids.
- Admins can also create accounts directly (and choose their role) from the
  Admin tab, without needing self-signup.
- There's no email/password-reset flow — if someone forgets their password,
  an admin resets it from the Admin tab.

## Stack

- **Frontend:** React + Vite — GitHub Pages
- **Backend:** Node.js + Express + JWT auth — Render
- **Database:** MongoDB Atlas

```
client/   React app (Vite) — GitHub Pages
server/   Express API      — Render
```

## 1. MongoDB Atlas

Same as before: create a free cluster, a database user, allow network access
from anywhere (`0.0.0.0/0`), and copy the connection string.

## 2. Run locally

```bash
# backend
cd server
cp .env.example .env      # fill in MONGODB_URI and JWT_SECRET
npm install
npm run dev                # http://localhost:4000

# frontend, in a second terminal
cd client
cp .env.example .env       # VITE_API_URL=http://localhost:4000/api
npm install
npm run dev                 # http://localhost:5173
```

Generate a `JWT_SECRET` with something like `openssl rand -hex 32` — this is
what signs login sessions, so keep it private and don't reuse a weak value.

The first account you register locally (or in production) becomes admin.

## 3. Deploy the backend to Render

1. Push this repo to GitHub.
2. In Render, create a **new Web Service** from the repo.
   - Root directory: `server`
   - Build command: `npm install`
   - Start command: `npm start`
3. Environment variables:
   - `MONGODB_URI` — your Atlas connection string
   - `CLIENT_ORIGIN` — your GitHub Pages origin, e.g. `https://<username>.github.io`
     (just the origin, no path — CORS doesn't care about the path)
   - `JWT_SECRET` — a long random string
4. Deploy, note the resulting URL.

## 4. Deploy the frontend to GitHub Pages

The included `.github/workflows/deploy.yml` builds `client/` and publishes it
to Pages automatically on every push to `main`.

1. Repo Settings → **Pages** → Source: **GitHub Actions**.
2. Repo Settings → **Secrets and variables → Actions** → New repository
   secret: `VITE_API_URL` = `https://<your-render-url>/api`.
3. Push to `main`.
4. Live at `https://<username>.github.io/<repo-name>/`.

## First-time setup after deploying

1. Open the live site and **register the first account** — this one becomes
   admin automatically.
2. Log in as that admin, go to the **Admin** tab, and create an account for
   your son (or let him self-register from the login screen — either works).
3. Everyone adds their own words/sentences under their own login and
   practices independently.

## Customizing

- **Add more badges:** `BADGE_CATALOG` in `server/src/badges.js`.
- **Change quiz batch size:** `getNextQuizBatch(10)` in `client/src/pages/Quiz.jsx`.
- **Adjust spaced-repetition timing:** `BOX_INTERVALS_DAYS` in `server/src/scheduling.js`.
- **Change how sentence blanks are chosen:** `pickBlankIndex` in `server/src/routes/quiz.js`
  (currently: any word 4+ letters, chosen at random).
- **Retheme:** design tokens live in `client/src/index.css`.

## Security notes

This is built for a family/small-group setting, not a public product:

- Passwords are hashed (bcrypt) — good.
- Sessions are JWTs stored in the browser's `localStorage` — convenient, but
  means a token is vulnerable if someone runs malicious script in the page
  (XSS). Fine for a small personal app; a production app with untrusted
  content would want httpOnly cookies instead.
- Self-signup has no email verification or CAPTCHA, so anyone who finds the
  URL can create an account. If that's not desired, remove or gate the
  `/api/auth/register` route and have the admin create every account instead.
