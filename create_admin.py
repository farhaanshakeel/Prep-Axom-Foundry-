#!/usr/bin/env python3
import argparse
import os
import getpass
import firebase_admin
from firebase_admin import credentials, firestore


def main():
    p = argparse.ArgumentParser(description='Create an admin user document in Firestore (collection: registeredUsers)')
    p.add_argument('--credentials', '-c', help='Path to Firebase service account JSON file (or set FIREBASE_CREDENTIALS_FILE env)', default=os.getenv('FIREBASE_CREDENTIALS_FILE'))
    p.add_argument('--username', '-u', required=True, help='Admin username')
    p.add_argument('--password', '-p', help='Admin password (if omitted, you will be prompted)')
    p.add_argument('--name', '-n', default='Site Admin', help='Display name')
    p.add_argument('--discord-id', '-d', help='Optional Discord numeric ID to allow bot mapping')
    args = p.parse_args()

    if not args.credentials:
        print('Error: Firebase credentials file path required (--credentials or FIREBASE_CREDENTIALS_FILE env).')
        return

    if not os.path.exists(args.credentials):
        print('Error: credentials file not found:', args.credentials)
        return

    pwd = args.password
    if not pwd:
        pwd = getpass.getpass('Enter admin password (input hidden): ')
        if not pwd:
            print('Error: empty password')
            return

    # Initialize Firebase
    cred = credentials.Certificate(args.credentials)
    try:
        firebase_admin.initialize_app(cred)
    except ValueError:
        # already initialized in this env; ok
        pass
        
    # FIX: Explicitly passing your database name 'default' to match your Firebase Console setup
    db = firestore.client(database_id='default')

    doc = {
        'username': args.username,
        'password': pwd,
        'name': args.name,
        'isAdmin': True,
        'createdAt': firestore.SERVER_TIMESTAMP
    }
    if args.discord_id:
        doc['discordId'] = str(args.discord_id)

    try:
        # Check for existing username
        q = db.collection('registeredUsers').where('username', '==', args.username).limit(1).get()
        if q and len(q) > 0:
            print('A user with this username already exists. Exiting to avoid overwrite.')
            return

        res = db.collection('registeredUsers').add(doc)
        print('Admin user created successfully with document id:', res[1].id)
        if args.discord_id:
            print('Discord ID linked:', args.discord_id)
        print('\nIMPORTANT: This script stores the password in Firestore as provided (plaintext).')
        print('For production, migrate to hashed passwords and server-side authentication. See README_ADMIN.md for guidance.')
    except Exception as e:
        print('Error creating admin user:', e)


if __name__ == '__main__':
    main()
    