import os
import hmac
import hashlib
import asyncio
from urllib.parse import urlencode

import httpx
import uvicorn
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from firebase_admin import firestore
from dotenv import load_dotenv

load_dotenv()

import bot as paf_bot

app = FastAPI()

DISCORD_CLIENT_ID = os.getenv("DISCORD_CLIENT_ID")
DISCORD_CLIENT_SECRET = os.getenv("DISCORD_CLIENT_SECRET")
DISCORD_REDIRECT_URI = os.getenv("DISCORD_REDIRECT_URI")
SECRET_KEY = os.getenv("SECRET_KEY")

db = firestore.client()


def make_state(username: str) -> str:
    sig = hmac.new(SECRET_KEY.encode(), username.encode(), hashlib.sha256).hexdigest()[:16]
    return f"{username}:{sig}"


def verify_state(state: str):
    try:
        username, sig = state.rsplit(":", 1)
        expected = hmac.new(SECRET_KEY.encode(), username.encode(), hashlib.sha256).hexdigest()[:16]
        if hmac.compare_digest(sig, expected):
            return username
    except Exception:
        pass
    return None


@app.get("/auth/start")
async def auth_start(username: str):
    docs = db.collection("registeredUsers").where("username", "==", username).limit(1).stream()
    user_doc = next((d for d in docs), None)
    if not user_doc:
        raise HTTPException(status_code=403, detail="Username not registered")

    state = make_state(username)
    params = urlencode({
        "client_id": DISCORD_CLIENT_ID,
        "redirect_uri": DISCORD_REDIRECT_URI,
        "response_type": "code",
        "scope": "identify",
        "state": state,
    })
    return RedirectResponse(f"https://discord.com/api/oauth2/authorize?{params}")


@app.get("/auth/callback")
async def auth_callback(request: Request):
    code = request.query_params.get("code")
    state = request.query_params.get("state")
    error = request.query_params.get("error")

    if error:
        return HTMLResponse(_page("Authorization cancelled", "You declined Discord access. <a href='/'>Go back</a>.", success=False))

    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing code or state")

    username = verify_state(state)
    if not username:
        raise HTTPException(status_code=400, detail="Invalid state — possible CSRF")

    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://discord.com/api/oauth2/token",
            data={
                "client_id": DISCORD_CLIENT_ID,
                "client_secret": DISCORD_CLIENT_SECRET,
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": DISCORD_REDIRECT_URI,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

    if token_resp.status_code != 200:
        return HTMLResponse(_page("OAuth failed", "Could not get Discord token. Try again.", success=False))

    access_token = token_resp.json().get("access_token")

    async with httpx.AsyncClient() as client:
        user_resp = await client.get(
            "https://discord.com/api/users/@me",
            headers={"Authorization": f"Bearer {access_token}"},
        )

    if user_resp.status_code != 200:
        return HTMLResponse(_page("Failed", "Could not fetch Discord profile.", success=False))

    discord_user = user_resp.json()
    discord_id = discord_user["id"]
    discord_tag = f"{discord_user['username']}#{discord_user.get('discriminator', '0')}"

    docs = db.collection("registeredUsers").where("username", "==", username).limit(1).stream()
    user_doc = next((d for d in docs), None)

    if not user_doc:
        return HTMLResponse(_page("Error", "User record disappeared — contact admin.", success=False))

    user_doc.reference.update({
        "discordId": discord_id,
        "discordTag": discord_tag,
        "discordVerified": True,
    })

    result = await paf_bot.assign_paf_role(discord_id)

    if result["success"]:
        return HTMLResponse(_page(
            "Verified! 🎉",
            f"Welcome <strong>{discord_tag}</strong>! You've been given the <strong>PAF Student</strong> role.",
            success=True,
        ))
    else:
        return HTMLResponse(_page(
            "Almost there!",
            f"Discord linked as <strong>{discord_tag}</strong>, but role assignment failed: {result['error']}<br><br>"
            "Make sure you've <strong>joined the PAF Discord server</strong> first, then re-verify.",
            success=False,
        ))


@app.get("/health")
async def health():
    return {"status": "ok"}


def _page(title: str, message: str, success: bool) -> str:
    color = "#22c55e" if success else "#ef4444"
    icon = "✅" if success else "⚠️"
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title} — PAF</title>
  <style>
    body {{ font-family: system-ui, sans-serif; background: #0f0f0f; color: #e5e5e5;
           display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }}
    .card {{ background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px;
             padding: 2.5rem 2rem; max-width: 420px; width: 90%; text-align: center; }}
    .icon {{ font-size: 2.5rem; margin-bottom: 1rem; }}
    h1 {{ font-size: 1.4rem; margin: 0 0 0.75rem; color: {color}; }}
    p {{ line-height: 1.6; color: #aaa; margin: 0 0 1.5rem; }}
    a {{ color: {color}; text-decoration: none; font-weight: 500; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">{icon}</div>
    <h1>{title}</h1>
    <p>{message}</p>
    <a href="https://prepaxiomfoundry.in">← Back to PAF</a>
  </div>
</body>
</html>"""


def start():
    async def main():
        config = uvicorn.Config(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)), loop="asyncio")
        server = uvicorn.Server(config)
        await asyncio.gather(
            server.serve(),
            asyncio.to_thread(paf_bot.run_bot),
        )
    asyncio.run(main())


if __name__ == "__main__":
    start()

def start():
    async def main():
        config = uvicorn.Config(app, host='0.0.0.0', port=int(os.getenv('PORT', 8000)), loop='asyncio')
        server = uvicorn.Server(config)
        await asyncio.gather(server.serve(), asyncio.to_thread(paf_bot.run_bot))
    asyncio.run(main())

if __name__ == '__main__':
    start()
