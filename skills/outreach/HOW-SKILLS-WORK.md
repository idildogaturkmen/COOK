# How Grok bots use skills (short)

A skill is a reusable playbook (`SKILL.md`) any bot can run.

1. Skills live in **Settings → Plugins → Yours** (private skills, or skills from an installed plugin).
2. Turn the skill **on for that bot** (per-agent toggle).
3. In chat, the lead runs it with `/skill-name` or `@skill-name`, or the bot pulls it in when the task matches the skill’s description.

**Bot** = teammate (persona, walls, memory, logins).  
**Skill** = method (steps + templates).

Keep school-specific stuff in the bot. Keep the method generic in the skill.
