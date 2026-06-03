# Prep Axiom Foundry (PAF)

A competitive prep platform for olympiad training, exams, and community-driven learning.

## Quick Start

### Admin Setup

To create admin accounts and access the admin panel, follow the [Admin Setup Guide](SETUP_ADMIN_GUIDE.md).

### Running the Site Locally

1. **Backend (Bot + Server)**:
   ```powershell
   cd paf-bot
   python server.py
   ```
   Server runs on `http://localhost:8000`

2. **Open the site**: Open `index.html` in your browser (or serve via HTTP)

### Project Structure

- `index.html`, `exams.html`, `members.html`, etc. — Site pages
- `styles.css` — Global styling
- `script.js` — Client-side logic (Firebase auth, UI interactions)
- `paf-bot/` — Discord bot + FastAPI backend
  - `server.py` — FastAPI server + bot runner
  - `bot.py` — Discord bot core
  - `cogs/` — Bot command modules
  - `create_admin.py` — Tool to create admin users

## Documentation

- [Admin Setup Guide](SETUP_ADMIN_GUIDE.md) — Create admin users, configure panel
- [README_ADMIN.md](README_ADMIN.md) — Technical details on admin creation