const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "xn",
    aliases: ["xnxx"],
    version: "1.2",
    author: "Farhan",
    countDown: 10,
    prefix: true,
    description:
      "Generate a custom image with fixed background, overlay image, and title text using a user's avatar.",
    category: "fun",
    guide: {
      en: "{pn}xn [title] [/@mention|uid|reply]",
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

    // 🎵 Title text
    const title =
      args.length > 0 ? args.join(" ") : "No Title Provided";

    try {
      const userInfo = await api.getUserInfo(targetID);
      const name = userInfo[targetID]?.name || "Someone";

      // 🖼️ Fetch profile picture
      const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;

      // 🌐 API endpoint
      const apiUrl = `https://shin-apis.onrender.com/canvas/xnxx?image=${encodeURIComponent(
        avatarUrl
      )}&title=${encodeURIComponent(title)}`;

      console.log(`[XN] Generating for ${name} (${targetID})`);
      console.log(`[XN] API Request → ${apiUrl}`);

      // 📥 Download image
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      if (response.status !== 200)
        throw new Error(`Invalid response status: ${response.status}`);

      // 💾 Save file to cache
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const filePath = path.join(cacheDir, `xnxx_${targetID}_${Date.now()}.png`);
      fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));

      // 💬 Send message
      const message = `🎬 Generated custom XNXX-style image for @${name}\n🖊️ Title: ${title}`;

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
      console.error("❌ Error generating XNXX image:", err);
      api.sendMessage(
        "⚠️ Sorry, I couldn’t generate the image right now. Please try again later.",
        threadID
      );

}
  },
};
