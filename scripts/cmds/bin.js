const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pastebin",
    aliases: ["bin"],
    version: "2.0",
    author: "gay",
    countDown: 5,
    role: 0,
    shortDescription: "Upload any command's code to Shin Pastebin.",
    longDescription: "Uploads the raw source code of any local command to Shin API Pastebin and returns the share link.",
    category: "utility",
    guide: "{pn} <commandName>"
  },

  onStart: async function ({ api, event, args, message }) {
    // 🧩 Author protection
    const encodedAuthor = Buffer.from("gay", "utf8").toString("base64");
    const correctAuthor = Buffer.from(encodedAuthor, "base64").toString("utf8");
    if (this.config.author !== correctAuthor)
      return message.reply("❌ | Author name has been modified — this command is locked.");

    const cmdName = args[0];
    if (!cmdName)
      return message.reply("⚠️ | Please provide the command name. Example:\n`pastebin xn`");

    const cmdPath = path.join(__dirname, `${cmdName}.js`);
    if (!fs.existsSync(cmdPath) || !cmdPath.startsWith(__dirname))
      return message.reply(`❌ | Command "${cmdName}" not found in this folder.`);

    try {
      const code = fs.readFileSync(cmdPath, "utf8");
      const encodedText = encodeURIComponent(code);
      const apiUrl = `https://shin-apis.onrender.com/tools/pastebin?text=${encodedText}`;

      const waitMsg = await message.reply("🌀 Uploading to Shin Pastebin...");

      const res = await axios.get(apiUrl, { timeout: 30000 });
      const data = res.data;

      if (data && data.status === 0 && data.raw) {
        await message.unsend(waitMsg.messageID);
        return message.reply(
          `✅ | Successfully uploaded **${cmdName}.js**\n` +
          `📄 Title: ${cmdName}.js source code\n` +
          `🔗 Raw Link: ${data.raw}`
        );
      } else {
        await message.unsend(waitMsg.messageID);
        return message.reply("❌ | Failed to upload to Pastebin. Please try again later.");
      }
    } catch (err) {
      console.error("[Pastebin Error]", err.message);
      return message.reply("🚨 | An error occurred while reading or uploading the file.");
    
          }
  }
};
