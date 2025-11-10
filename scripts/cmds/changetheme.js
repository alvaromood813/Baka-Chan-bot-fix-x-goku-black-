const OpenAI = require("openai");

const THEME_COLORS = {
  MessengerBlue: "196241301102133",
  Viking: "1928399724138152",
  GoldenPoppy: "174636906462322",
  RadicalRed: "2129984390566328",
  LoFi: "1060619084701625",
  Chill: "390127158985345",
  Ocean: "736591620215564",
  Love: "741311439775765",
  Birthday: "621630955405500",
  Autumn: "822549609168155",
  Pride: "1652456634878319",
  Rose: "1257453361255152",
  Sky: "3190514984517598",
  StrangerThings: "1059859811490132",
  LunarNewYear: "357833546030778",
  Default: "3259963564026002"
};

module.exports = {
  config: {
    name: "changetheme",
    aliases: ["theme", "settheme"],
    version: "1.1.0",
    author: "Gtajisan",
    countDown: 5,
    role: 0,
    shortDescription: "AI-based Messenger theme changer",
    category: "group",
    guide: {
      en: "{pn} <description>\nExample: {pn} ocean vibes\n{pn} romantic sunset"
    }
  },

  onStart: async function ({ message, args, api, event }) {
    const userPrompt = args.join(" ");
    if (!userPrompt) return message.reply("Please describe a theme. Example: theme romantic sunset");

    if (!process.env.OPENAI_API_KEY)
      return message.reply("⚠️ Missing OPENAI_API_KEY environment variable.");

    const thinking = await message.reply("🎨 Thinking of the best theme for your vibe...");

    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const themeNames = Object.keys(THEME_COLORS);

      const systemPrompt = `You are a messenger theme picker. From this list: ${themeNames.join(", ")}.
Given a user's description, reply with JSON like {"theme": "ThemeName", "reason": "short reason why"}.
Example: {"theme": "Love", "reason": "because the description mentioned romance"}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 100
      });

      const result = JSON.parse(completion.choices[0].message.content);
      const themeName = result.theme;
      const reason = result.reason || "It matches your description";

      if (!THEME_COLORS[themeName])
        return message.reply(`❌ Invalid theme selected: ${themeName}`);

      await api.changeThreadColor(THEME_COLORS[themeName], event.threadID);

      await message.unsend(thinking.messageID);
      message.reply(`✅ Theme changed to '${themeName}'!\nReason: ${reason}`);

    } catch (error) {
      console.error(error);
      try { await message.unsend(thinking.messageID); } catch {}
      message.reply("❌ Failed to change theme. " + error.message);

    }
  }
};
