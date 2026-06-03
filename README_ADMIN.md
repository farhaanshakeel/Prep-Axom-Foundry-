Creating an admin user for the PAF site (guide)

This repository includes `create_admin.py` — a small helper to add an admin user document to Firestore.

Important security note
- This helper stores the `password` field as provided in Firestore (plaintext). The site currently checks the `password` field client-side. This is insecure for production.
- Recommended: run this only for test / staging, and plan a migration to hashed passwords and server-side authentication.

Prerequisites
- A Firebase service account JSON file. Set its path in the environment variable `FIREBASE_CREDENTIALS_FILE` or pass `--credentials`.
- Python 3.10+ and packages installed from `paf-bot/requirements.txt`.

Install

```bash
python -m pip install -r paf-bot/requirements.txt
```

Create an admin user (example)

```bash
# interactive password prompt
python paf-bot/create_admin.py -c path/to/service-account.json -u siteadmin -n "Site Admin" -d 123456789012345678

# or provide password on CLI (be careful with shell history)
python paf-bot/create_admin.py -c path/to/service-account.json -u siteadmin -p "S3cretPass" -n "Site Admin" -d 123456789012345678
```

What the script does
- Connects to Firestore using the service account
- Adds a document to `registeredUsers` with fields: `username`, `password`, `name`, `isAdmin: true`, `discordId` (optional)
- It will not overwrite an existing user with the same `username`.

After creating the admin
- Visit the admin panel (`admin.html`) and sign in with the username/password you created.
- If you provided `discordId`, the bot will also recognize that Discord account as an admin for privileged commands.

Next steps (recommended)
- Replace plaintext password storage with hashed passwords and verify server-side.
- Alternatively, migrate to Firebase Authentication and use custom claims (`isAdmin` claim) + Firestore security rules.
- If you'd like, I can implement a small server endpoint to check hashed passwords and return a short-lived session token for admin UI.
