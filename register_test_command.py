import os
import json
import sys
import urllib.request
from urllib.error import HTTPError


def main():
    app_id = os.getenv('DISCORD_APPLICATION_ID') or '1408145281417216151'
    guild_id = os.getenv('DISCORD_GUILD_ID')
    token = os.getenv('DISCORD_TOKEN')

    if not token:
        print('ERROR: DISCORD_TOKEN not set in environment')
        sys.exit(2)
    if not guild_id:
        print('ERROR: DISCORD_GUILD_ID not set in environment')
        sys.exit(2)

    url = f'https://discord.com/api/v10/applications/{app_id}/guilds/{guild_id}/commands'
    body = {
        'name': 'paf_test_ping',
        'type': 1,
        'description': 'PAF test ping command (temporary)'
    }

    data = json.dumps(body).encode('utf-8')
    req = urllib.request.Request(url, data=data, method='POST')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Authorization', f'Bot {token}')

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            resp_body = resp.read().decode('utf-8')
            print('SUCCESS:', resp.status)
            try:
                print(json.dumps(json.loads(resp_body), indent=2))
            except Exception:
                print(resp_body)
    except HTTPError as e:
        body = e.read().decode('utf-8') if hasattr(e, 'read') else ''
        print('HTTP ERROR', e.code, e.reason)
        try:
            print(json.dumps(json.loads(body), indent=2))
        except Exception:
            print(body)
        sys.exit(1)
    except Exception as e:
        print('ERROR:', str(e))
        sys.exit(1)


if __name__ == '__main__':
    main()
