# Quick Admin Setup (TL;DR)

## Your Next Steps:

### 1. Get Your Discord ID
- Open Discord
- Enable Developer Mode: Settings → App Settings → Advanced → Developer Mode ✓
- Right-click your username → Copy user ID
- Save it (looks like: `1234567890123456789`)

### 2. Run This Command

**Copy and paste into PowerShell** (replace placeholders):

```powershell
cd c:\Users\Faiza\OneDrive\Desktop\Prep-Axom-Foundry-\paf-bot
python create_admin.py -c PATH_TO_SERVICEACCOUNTKEY -u admin -n "Your Name" -d YOUR_DISCORD_ID
```

**Replace:**
- `PATH_TO_SERVICEACCOUNTKEY` → path to your Firebase JSON (e.g., `C:\Users\Faiza\Downloads\serviceAccountKey.json`)
- `admin` → your admin username (e.g., `faiza`, `siteadmin`)
- `"Your Name"` → your display name
- `YOUR_DISCORD_ID` → your Discord ID from Step 1

**Example:**
```powershell
python create_admin.py -c C:\Users\Faiza\Downloads\serviceAccountKey.json -u faiza_admin -n "Faiza" -d 987654321098765432
```

### 3. Enter Your Password

When prompted: Enter a **strong password** (e.g., `MySecure@Pass123`)

### 4. Access Admin Panel

1. Go to `http://localhost:8000` or your site
2. Click **Admin Panel** link
3. Sign in with username (from Step 2) and password (from Step 3)

### 5. Create More Admins (Optional)

Repeat Step 2 with different usernames for team members.

---

## Commands Reference

| Action | Command |
|--------|---------|
| Create admin (interactive password) | `python create_admin.py -c <path> -u <username> -n <name>` |
| Create admin (with Discord ID) | `python create_admin.py -c <path> -u <username> -n <name> -d <discord_id>` |
| Create admin (password on CLI) | `python create_admin.py -c <path> -u <username> -p <password> -n <name>` |

---

**Questions?** See [SETUP_ADMIN_GUIDE.md](SETUP_ADMIN_GUIDE.md) for detailed troubleshooting.
