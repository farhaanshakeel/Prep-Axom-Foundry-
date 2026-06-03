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
    try:
        bot.tree.clear_commands(guild=None) # Clears local memory
        await bot.tree.sync()               # Wipes Discord's servers
        print("💥 SUCCESS: All global slash commands have been wiped clean!")
    except Exception as e:
        print(f"Error wiping commands: {e}")
    
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


@bot.command(name="verify")
@commands.has_permissions(administrator=True)
async def verify_user(ctx, discord_id: str):
    """Admin command: manually trigger role assignment. Usage: !verify 123456789"""
    result = await assign_paf_role(discord_id)
    if result["success"]:
        await ctx.send(f"✅ {result['message']}")
    else:
        await ctx.send(f"❌ {result['error']}")


@bot.command(name="checkuser")
@commands.has_permissions(administrator=True)
async def check_user(ctx, discord_id: str):
    """Check if a Discord ID is verified in Firestore. Usage: !checkuser 123456789"""
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


@bot.command(name="pafstats")
@commands.has_permissions(administrator=True)
async def paf_stats(ctx):
    """Show count of verified PAF members."""
    verified = db.collection("registeredUsers") \
                 .where("discordVerified", "==", True).stream()
    count = sum(1 for _ in verified)
    await ctx.send(f"Total verified PAF members: **{count}**")


def run_bot():
    bot.run(os.getenv("DISCORD_TOKEN"))


if __name__ == "__main__":
    run_bot()