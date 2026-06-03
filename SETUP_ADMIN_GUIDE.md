                      # Admin Setup Guide for PAF Site

This guide walks you through creating admin accounts and accessing the admin panel on the Prep Axiom Foundry site.

---

## Step 1: Prerequisites

You'll need:
- Python 3.10+ installed
- Your Firebase service account JSON file (stored safely locally)
- A Discord user ID for the admin (optional but recommended)

### Check Python Installation

Open PowerShell and run:
```powershell
python --version
```

Should output `Python 3.x.x` or higher.

### Check Python Packages

```powershell
cd c:\Users\Faiza\OneDrive\Desktop\Prep-Axom-Foundry-\paf-bot
pip list | findstr firebase
```

If you don't see `firebase-admin`, install dependencies:
```powershell
python -m pip install -r requirements.txt
```

---

## Step 2: Get Your Discord ID

You'll need your Discord User ID to link the admin account to your Discord profile (optional but recommended for bot privileges).

### How to Get Your Discord ID

1. Open Discord
2. Enable **Developer Mode**: User Settings → App Settings → Advanced → Toggle "Developer Mode"
3. Right-click your username anywhere in Discord
4. Click "Copy user ID"
5. Paste it somewhere safe (looks like: `123456789012345678`)

---

## Step 3: Create Your First Admin User

Use the `create_admin.py` script to add an admin to Firestore.

### From PowerShell:

```powershell
cd c:\Users\Faiza\OneDrive\Desktop\Prep-Axom-Foundry-\paf-bot
python create_admin.py -c path\to\serviceAccountKey.json -u admin -n "Your Name" -d YOUR_DISCORD_ID
```

**Replace:**
- `path\to\serviceAccountKey.json` → the actual path to your Firebase service account JSON
- `admin` → the username you want (e.g., `faiza_admin`, `admin`, `supremeleader`)
- `Your Name` → your display name (e.g., "Faiza")
- `YOUR_DISCORD_ID` → your Discord ID from Step 2 (optional; you can skip `-d YOUR_DISCORD_ID` if you don't have it)

### Example (with password prompt):

```powershell
python create_admin.py -c C:\Users\Faiza\Downloads\serviceAccountKey.json -u faiza_admin -n "Faiza" -d 123456789012345678
```

The script will prompt you to enter a password. **Use a strong password** (e.g., `MyS3cur3P@ss123!`).

### Example (with password on command line):

```powershell
python create_admin.py -c C:\Users\Faiza\Downloads\serviceAccountKey.json -u faiza_admin -p "MyS3cur3P@ss123!" -n "Faiza" -d 123456789012345678
```

**⚠️ Warning:** Avoid putting passwords on the command line if possible — shell history may log it. Use the interactive prompt instead.

### Expected Output

If successful, you'll see:
```
✅ Admin user 'faiza_admin' created in Firestore
```

---

## Step 4: Access the Admin Panel

Once your admin account is created:

1. **Open the site**: http://localhost:8000 (or your deployed domain)
2. **Click Admin Panel** in the navigation menu or go to `/admin.html`
3. **Sign in** with your username and password from Step 3

You should see:
- Admin dashboard
- Ability to manage users
- Ability to configure site settings

---

## Step 5: Create Additional Admin Users (Optional)

Repeat Step 3 with different usernames and passwords for team members:

```powershell
python create_admin.py -c C:\Users\Faiza\Downloads\serviceAccountKey.json -u teamadmin2 -n "Team Member Name"
```

---

## Troubleshooting

### "FIREBASE_CREDENTIALS_FILE not found"

Make sure your service account JSON path is correct:

```powershell
# Check if the file exists
Test-Path "C:\Users\Faiza\Downloads\serviceAccountKey.json"
```

If it doesn't exist, check your Downloads folder or find it by setting the environment variable:

```powershell
$env:FIREBASE_CREDENTIALS_FILE = "C:\path\to\serviceAccountKey.json"
python create_admin.py -u admin -n "Your Name"
```

### "Admin user already exists"

If the username already exists in Firestore, the script won't overwrite it. Use a different username or delete the user from Firestore first (via Firebase Console).

### Admin login not working on the site

1. **Check the browser console** (F12 → Console) for JavaScript errors
2. **Verify Firestore connection**: Check if Firebase is initialized in `script.js`
3. **Check admin document**: In Firebase Console → Firestore → `registeredUsers` collection, verify your admin user document exists with `isAdmin: true`

---

## Security Notes

⚠️ **Important:**

- The current password storage is **plaintext in Firestore** — acceptable for testing/staging only
- **For production**: Migrate to:
  - Hashed passwords (bcrypt) checked server-side
  - Firebase Authentication with custom claims
  - Contact the development team for hardened auth implementation

---

## Next Steps

Once admins are set up:

1. Log into the admin panel
2. Configure site settings, user roles, and exam access
3. Reach out to the team if you need more advanced features (e.g., bulk user imports, moderation tools)

---

## Quick Commands Reference

```powershell
# Create admin with interactive password
python create_admin.py -c path\to\serviceAccountKey.json -u admin_username -n "Display Name"

# Create admin with Discord ID
python create_admin.py -c path\to\serviceAccountKey.json -u admin_username -n "Display Name" -d 123456789012345678

# Create admin with direct password (careful with shell history!)
python create_admin.py -c path\to\serviceAccountKey.json -u admin_username -p "SecurePassword!" -n "Display Name" -d 123456789012345678
```

---

Need help? Reach out to the dev team or check the main README.md for additional resources.
