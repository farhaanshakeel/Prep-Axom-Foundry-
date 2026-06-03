import discord
from discord.ext import commands
import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv
import asyncio
import pathlib

load_dotenv()

# Firebase init
cred = credentials.Certificate(os.getenv("FIREBASE_CREDENTIALS_FILE"))
firebase_admin.initialize_app(cred)
db = firestore.client()

# Bot setup
intents = discord.Intents.default()
intents.members = True
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents)


def admin_check():
    async def predicate(ctx):
        # Allow Discord server administrators
        try:
            if ctx.author.guild_permissions.administrator:
                return True
        except Exception:
            pass

        # Otherwise check Firestore for a registered user with isAdmin flag matching this discord ID
        try:
            docs = db.collection('registeredUsers').where('discordId', '==', str(ctx.author.id)).where('isAdmin', '==', True).limit(1).get()
            if docs and len(docs) > 0:
                return True
        except Exception:
            pass
        return False
    return commands.check(predicate)

# Load cogs
async def load_cogs():
    cogs_dir = pathlib.Path(__file__).parent / "cogs"
    for cog_file in cogs_dir.glob("*.py"):
        if cog_file.name.startswith("_"):
            continue
        cog_name = f"cogs.{cog_file.stem}"
        try:
            await bot.load_extension(cog_name)
            print(f"✅ Loaded cog: {cog_name}")
        except Exception as e:
            print(f"❌ Failed to load {cog_name}: {e}")


@bot.event
async def on_ready():
    print(f"PAF Bot online as {bot.user}")
    print(f"Serving guild ID: {os.getenv('DISCORD_GUILD_ID')}")
    print(f"Bot ID: {bot.user.id}")
    
    # Ensure top-level hybrid commands are added to the bot's command tree.
    for cmd in [verify_user, check_user, paf_stats, bot_commands]:
        if not bot.tree.get_command(cmd.name):
            bot.tree.add_command(cmd)
            print(f"Added command to tree: {cmd.name}")
    
    # Register or sync application (slash) commands for the configured guild only.
    try:
        guild_id = os.getenv('DISCORD_GUILD_ID')
        if guild_id:
            # Debug: list commands known to the bot before syncing
            local_cmds = [c.name for c in bot.tree.walk_commands()]
            print(f"Local command count before sync: {len(local_cmds)} -> {local_cmds}")
            
            try:
                synced = await bot.tree.sync(guild=discord.Object(id=int(guild_id)))
                print(f"✅ Synced {len(synced)} slash commands to guild {guild_id}: {[s.name for s in synced]}")
                
                # Check if sync returned 0 — if so, bot may not have applications.commands scope
                if len(synced) == 0:
                    print("\n⚠️  WARNING: No commands were registered! This usually means:")
                    print("   1. Bot wasn't invited with 'applications.commands' scope")
                    print("   2. Bot role doesn't have 'Use Application Commands' permission")
                    print(f"\n📋 Re-invite the bot to {guild_id} with this URL:")
                    print(f"   https://discord.com/api/oauth2/authorize?client_id={bot.user.id}&scope=bot%20applications.commands&permissions=268435456")
                    
            except discord.Forbidden as e:
                print(f"❌ Permission denied during sync: {e}")
                print(f"   Ensure the bot has 'Use Application Commands' permission in the guild")
            except Exception as e:
                print(f"❌ Error syncing slash commands: {type(e).__name__}: {e}")
        else:
            # Fallback: do a global sync (may take up to an hour to propagate)
            print("No DISCORD_GUILD_ID set; attempting global sync...")
            synced = await bot.tree.sync()
            print(f"✅ Performed global slash command sync ({len(synced)} commands)")
    except Exception as e:
        print(f"❌ Unexpected error during command sync: {e}")
    
    # Load cogs on startup
    await load_cogs()


async def assign_paf_role(discord_user_id: str) -> dict:
    """
    Called by server.py after OAuth completes.
    Finds the member in the guild and assigns the PAF Student role.
    Returns a result dict with success/error info.
    """
    guild_id = int(os.getenv("DISCORD_GUILD_ID"))
    role_name = os.getenv("DISCORD_ROLE_NAME", "PAF Student")

    guild = bot.get_guild(guild_id)
    if not guild:
        return {"success": False, "error": "Bot not in guild or guild not cached yet"}

    try:
        member = await guild.fetch_member(int(discord_user_id))
    except discord.NotFound:
        return {"success": False, "error": "User not found in guild. They must join the server first."}
    except discord.HTTPException as e:
        return {"success": False, "error": f"Discord API error: {e}"}

    role = discord.utils.get(guild.roles, name=role_name)
    if not role:
        return {"success": False, "error": f'Role "{role_name}" not found in server. Check the role name exactly.'}

    if role in member.roles:
        return {"success": True, "message": "Already has role"}

    try:
        await member.add_roles(role, reason="PAF website verification")
        print(f"Assigned {role_name} to {member.name} ({discord_user_id})")
        return {"success": True, "message": f"Role assigned to {member.display_name}"}
    except discord.Forbidden:
        return {"success": False, "error": "Bot lacks permissions. Make sure bot role is above PAF Student role in server settings."}


@bot.hybrid_command(name="verify", with_app_command=True)
@admin_check()
async def verify_user(ctx, discord_id: str):
    """Admin command: manually trigger role assignment. Usage: /verify 123456789"""
    result = await assign_paf_role(discord_id)
    if result["success"]:
        await ctx.send(f"✅ {result['message']}")
    else:
        await ctx.send(f"❌ {result['error']}")


@bot.hybrid_command(name="checkuser", with_app_command=True)
@admin_check()
async def check_user(ctx, discord_id: str):
    """Check if a Discord ID is verified in Firestore. Usage: /checkuser 123456789"""
    docs = db.collection("registeredUsers") \
              .where("discordId", "==", discord_id) \
              .limit(1).stream()
    user = next((d.to_dict() for d in docs), None)
    if user:
        verified = user.get("discordVerified", False)
        username = user.get("username", "unknown")
        await ctx.send(f"User `{username}` — discordVerified: `{verified}`")
    else:
        await ctx.send("No Firestore record found for that Discord ID.")


@bot.hybrid_command(name="pafstats", with_app_command=True)
@admin_check()
async def paf_stats(ctx):
    """Show count of verified PAF members."""
    verified = db.collection("registeredUsers") \
                 .where("discordVerified", "==", True).stream()
    count = sum(1 for _ in verified)
    await ctx.send(f"Total verified PAF members: **{count}**")


@bot.hybrid_command(name="botcommands", with_app_command=True)
async def bot_commands(ctx):
    """Show available bot command usage."""
    commands_list = [
        "/verify <discord_id> - assign role to a user",
        "/checkuser <discord_id> - check Firestore verification",
        "/pafstats - show verified member count",
        "/pomodo <minutes> <subject> - start a pomodoro",
        "/pomodo_stop - stop your pomodoro",
        "/pomodo_stats - view recent stats"
    ]
    message = "**PAF Bot Commands**\n" + "\n".join(commands_list)
    if getattr(ctx, 'interaction', None) is not None:
        await ctx.interaction.response.send_message(message, ephemeral=True)
    else:
        await ctx.send(message)


def run_bot():
    bot.run(os.getenv("DISCORD_TOKEN"))


if __name__ == "__main__":
    run_bot()