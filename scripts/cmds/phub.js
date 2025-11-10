const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "phub",
    aliases: ["pornhub"],
    version: "1.0",
    author: "Farhan",
    countDown: 10,
    prefix: true,
    description:
      "Generate a Pornhub-style logo using a user's name or custom text.",
    category: "fun",
    guide: {
      en: "{pn}phub <text1> | <text2> [/@mention|uid|reply]",
    },
  },

  onStart: async ({ api, event, args }) => {
    const { senderID, mentions, messageReply, threadID } = event;
    let targetID = senderID;

    // 🎯 Detect target user
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply && messageReply.senderID) {
      targetID = messageReply.senderID;
    } else if (args[1] && /^\d+$/.test(args[1])) {
      targetID = args[1];
    }

    // 🧩 Split text parts
    const input = args.join(" ").split("|");
    const text1 = input[0]?.trim();
    const text2 = input[1]?.trim();

    if (!text1 || !text2)
      return api.sendMessage(
        "⚠️ Usage:\nphub <text1> | <text2>\n\nExample:\nphub Lance | Ajiro",
        threadID
      );

    try {
      const userInfo = await api.getUserInfo(targetID);
      const name = userInfo[targetID]?.name || "Someone";

      // 🌐 Pornhub API endpoint
      const apiUrl = `https://shin-apis.onrender.com/image/pornhub?text1=${encodeURIComponent(
        text1
      )}&text2=${encodeURIComponent(text2)}`;

      console.log(`[PHUB] Generating logo for ${name} (${targetID})`);
      console.log(`[PHUB] API Request → ${apiUrl}`);

      // 📥 Fetch image
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      if (response.status !== 200)
        throw new Error(`Invalid response: ${response.status}`);

      // 💾 Save file to cache
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const filePath = path.join(cacheDir, `phub_${Date.now()}.png`);
      fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));

      // 💬 Send generated image
      const message = `🍑 Generated Pornhub-style logo for @${name}\n🔤 Text: ${text1} ${text2}`;

      api.sendMessage(
        {
          body: message,
          mentions: [{ tag: `@${name}`, id: targetID }],
          attachment: fs.createReadStream(filePath),
        },
        threadID,
        () => fs.unlinkSync(filePath)
      );
    } catch (err) {
      console.error("❌ Error generating Pornhub image:", err);
      api.sendMessage(
        "⚠️ Sorry, I couldn’t generate the Pornhub logo right now. Please try again later.",
        threadID
      );

}
  },
};
