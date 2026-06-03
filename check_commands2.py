import os
import json
import urllib.request
from dotenv import load_dotenv

load_dotenv()

token = os.getenv('DISCORD_TOKEN')
guild_id = os.getenv('DISCORD_GUILD_ID')
if not token or not guild_id:
    raise SystemExit('Missing DISCORD_TOKEN or DISCORD_GUILD_ID')

app_url = 'https://discord.com/api/v10/applications/@me'
app_req = urllib.request.Request(app_url, headers={
    'Authorization': f'Bot {token}',
    'User-Agent': 'PAFBotChecker/1.0',
})
with urllib.request.urlopen(app_req, timeout=10) as app_resp:
    app_data = json.loads(app_resp.read().decode())
    application_id = app_data.get('id')
    print('application_id', application_id)
    if not application_id:
        raise SystemExit('Could not determine application ID')

for scope in ['guild', 'global']:
    if scope == 'guild':
        url = f'https://discord.com/api/v10/applications/{application_id}/guilds/{guild_id}/commands'
    else:
        url = f'https://discord.com/api/v10/applications/{application_id}/commands'
    req = urllib.request.Request(url, headers={
        'Authorization': f'Bot {token}',
        'User-Agent': 'PAFBotChecker/1.0',
    })
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode())
    print(f'{scope}_count', len(data))
    print([c['name'] for c in data])
