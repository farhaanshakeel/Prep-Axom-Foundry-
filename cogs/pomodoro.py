import discord
from discord.ext import commands, tasks
import firebase_admin
from firebase_admin import firestore
import asyncio
import time
from datetime import datetime

db = firestore.client()

class Pomodoro(commands.Cog):
    """Pomodoro Study Timer with Firestore Logging"""
    
    def __init__(self, bot):
        self.bot = bot
        self.sessions = {}  # {user_id: {"start": time, "duration": secs, "subject": str, "message": Message}}
    
    @commands.command(name="pomodo")
    async def pomodoro(self, ctx, duration: int = 25, subject: str = "General"):
        """Start a Pomodoro study session. Usage: !pomodo [minutes] [subject]
        Example: !pomodo 25 Mathematics
        """
        user_id = str(ctx.author.id)
        
        if user_id in self.sessions:
            await ctx.send(f"⏸️ You already have an active session! Use `!pomodo stop` to end it.")
            return
        
        if duration < 1 or duration > 120:
            await ctx.send("❌ Duration must be between 1 and 120 minutes.")
            return
        
        duration_seconds = duration * 60
        session_data = {
            "start": time.time(),
            "duration": duration_seconds,
            "subject": subject,
            "user_id": user_id,
            "username": ctx.author.name
        }
        self.sessions[user_id] = session_data
        
        embed = discord.Embed(
            title=f"🍅 Pomodoro Timer Started",
            description=f"**Subject:** {subject}\n**Duration:** {duration} minutes",
            color=discord.Color.red()
        )
        embed.set_footer(text=f"Started by {ctx.author.name}")
        msg = await ctx.send(embed=embed)
        session_data["message"] = msg
        
        # Schedule timer callback
        asyncio.create_task(self._timer_callback(ctx, user_id, duration_seconds, subject))
    
    async def _timer_callback(self, ctx, user_id: str, duration_seconds: int, subject: str):
        """Handle timer and logging"""
        try:
            await asyncio.sleep(duration_seconds)
            
            if user_id not in self.sessions:
                return  # Session was stopped manually
            
            session = self.sessions.pop(user_id)
            
            # Log to Firestore
            await self._log_session_to_firestore(user_id, session, "completed")
            
            # Notify user
            member = ctx.guild.get_member(int(user_id))
            embed = discord.Embed(
                title="🎉 Pomodoro Session Complete!",
                description=f"Great work on **{subject}**!\n\nTake a 5-minute break and come back refreshed.",
                color=discord.Color.green()
            )
            await ctx.send(f"{member.mention if member else f'<@{user_id}>'}", embed=embed)
            
        except Exception as e:
            print(f"Pomodoro timer error: {e}")
    
    @commands.command(name="pomodo_stop")
    async def stop_pomodoro(self, ctx):
        """Stop your current Pomodoro session. Usage: !pomodo_stop"""
        user_id = str(ctx.author.id)
        
        if user_id not in self.sessions:
            await ctx.send("❌ You don't have an active Pomodoro session.")
            return
        
        session = self.sessions.pop(user_id)
        elapsed = time.time() - session["start"]
        
        # Log stopped session
        await self._log_session_to_firestore(user_id, session, "stopped", elapsed)
        
        minutes = int(elapsed // 60)
        embed = discord.Embed(
            title="⏹️ Session Stopped",
            description=f"**Subject:** {session['subject']}\n**Studied:** {minutes} minutes",
            color=discord.Color.orange()
        )
        await ctx.send(embed=embed)
    
    @commands.command(name="pomodo_stats")
    async def pomodoro_stats(self, ctx):
        """View your Pomodoro study statistics. Usage: !pomodo_stats"""
        user_id = str(ctx.author.id)
        
        try:
            docs = db.collection("pomodoro_sessions") \
                      .where("user_id", "==", user_id) \
                      .order_by("timestamp", direction=firestore.Query.DESCENDING) \
                      .limit(10).stream()
            
            sessions = [d.to_dict() for d in docs]
            
            if not sessions:
                await ctx.send("📊 No study sessions recorded yet. Start with `!pomodo`!")
                return
            
            total_minutes = sum(int(s.get("duration", 0) // 60) for s in sessions)
            completed = sum(1 for s in sessions if s.get("status") == "completed")
            
            stats_text = f"**📊 Your Stats (Last 10 Sessions)**\n"
            stats_text += f"• Total Studied: **{total_minutes}** minutes\n"
            stats_text += f"• Completed Sessions: **{completed}**\n"
            stats_text += f"• Completion Rate: **{int(completed/len(sessions)*100)}%**\n\n"
            stats_text += "**Recent Sessions:**\n"
            
            for i, s in enumerate(sessions[:5], 1):
                duration = int(s.get("duration", 0) // 60)
                status = "✅" if s.get("status") == "completed" else "⏸️"
                subject = s.get("subject", "General")
                stats_text += f"{i}. {status} {subject} — {duration} min\n"
            
            embed = discord.Embed(
                title="Study Statistics",
                description=stats_text,
                color=discord.Color.blue()
            )
            await ctx.send(embed=embed)
        
        except Exception as e:
            await ctx.send(f"❌ Error fetching stats: {str(e)}")
    
    async def _log_session_to_firestore(self, user_id: str, session: dict, status: str, elapsed: float = None):
        """Log study session to Firestore"""
        try:
            duration = elapsed if elapsed else session["duration"]
            
            db.collection("pomodoro_sessions").add({
                "user_id": user_id,
                "username": session.get("username"),
                "subject": session.get("subject", "General"),
                "duration": int(duration),
                "status": status,
                "timestamp": datetime.now(),
                "completed": status == "completed"
            })
        except Exception as e:
            print(f"Error logging session: {e}")


async def setup(bot):
    await bot.add_cog(Pomodoro(bot))
