# Pomodoro Study Timer - Discord Bot Command

## Commands

### `!pomodo [duration] [subject]`
Start a Pomodoro study session.

**Parameters:**
- `duration` (optional, default: 25) — Minutes to study (1-120)
- `subject` (optional, default: "General") — What you're studying

**Examples:**
```
!pomodo                          # 25-minute general study
!pomodo 45 Physics               # 45-minute Physics session
!pomodo 30 "Organic Chemistry"   # Multi-word subject (use quotes)
```

**Features:**
- Timer automatically notifies when done
- Logs all sessions to Firestore
- Tracks completion status

---

### `!pomodo_stop`
Stop your current session early.

**Usage:**
```
!pomodo_stop
```

**Result:**
- Session is logged as "stopped"
- Shows elapsed time

---

### `!pomodo_stats`
View your study statistics.

**Usage:**
```
!pomodo_stats
```

**Displays:**
- Total minutes studied
- Completed sessions count
- Completion rate
- Last 5 recent sessions

---

## Data Storage

All sessions are logged to Firestore in `pomodoro_sessions` collection:

```json
{
  "user_id": "123456789",
  "username": "auvalen",
  "subject": "Mathematics",
  "duration": 1500,           // seconds
  "status": "completed",      // or "stopped"
  "timestamp": "2026-06-03T14:30:00Z",
  "completed": true
}
```

---

## Setup

1. Ensure `discord.py` and `firebase-admin` are in `requirements.txt` ✅
2. Pomodoro cog auto-loads when bot starts
3. Set `DISCORD_GUILD_ID` in `.env`

---

## Features & Roadmap

✅ **Implemented:**
- Basic 25/45/60-minute sessions
- Auto-completion notification
- Manual stop
- Stats tracking
- Firestore logging

🚀 **Planned:**
- Break reminder (5 min)
- Streak tracking
- Weekly study leaderboard
- Subject-based analytics
- Recurring reminders
