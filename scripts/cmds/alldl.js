const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// Optional base API config (fallback ready)
const baseApiUrl = async () => {
  try {
    const base = await axios.get(
      `https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`
    );
    return base.data.api || "https://universaldownloaderapi.vercel.app";
  } catch {
    return "https://universaldownloaderapi.vercel.app";
  }
};

module.exports = {
  config: {
    name: "alldl",
    aliases: ["dl", "download"],
    version: "2.5",
    author: "Farhan",
    countDown: 2,
    role: 0,
    category: "MEDIA",
    description: {
      en: "Download videos or music from TikTok, YouTube, Instagram, Twitter, Facebook, and more.",
    },
    guide: {
      en: "{pn} <video_url> or reply to a message containing one",
    },
  },

  onStart: async function ({ api, args, event }) {
    try {
      const replied = event.messageReply?.body;
      const inputUrl = replied || args[0];

      if (!inputUrl)
        return api.setMessageReaction("❌", event.messageID, () => {}, true);

      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      // 🌐 Detect platform automatically
      const domain = new URL(inputUrl).hostname;
      let platform = "";
      if (domain.includes("tiktok")) platform = "tiktok";
      else if (domain.includes("youtube") || domain.includes("youtu.be"))
        platform = "youtube";
      else if (domain.includes("facebook") || domain.includes("fb.watch"))
        platform = "meta";
      else if (domain.includes("instagram")) platform = "meta";
      else if (domain.includes("twitter") || domain.includes("x.com"))
        platform = "twitter";
      else if (domain.includes("reddit")) platform = "reddit";
      else if (domain.includes("pinterest")) platform = "pinterest";
      else if (domain.includes("threads")) platform = "threads";
      else if (domain.includes("soundcloud")) platform = "soundcloud";
      else if (domain.includes("spotify")) platform = "spotify";
      else if (domain.includes("capcut")) platform = "capcut";
      else platform = "tiktok"; // default fallback

      // 🧭 Build request URL
      const apiBase = await baseApiUrl();
      const requestUrl = `${apiBase}/api/${platform}?url=${encodeURIComponent(
        inputUrl
      )}`;

      console.log(`[ALLDL] Platform: ${platform}`);
      console.log(`[ALLDL] Request → ${requestUrl}`);

      const { data } = await axios.get(requestUrl, { timeout: 30000 });
      if (!data || !data.success)
        throw new Error("No valid download link returned from API.");

      // Extract media URL
      const mediaUrl =
        data.url ||
        data.video ||
        data.video_url ||
        data.audio ||
        data.music ||
        data.result ||
        data.download ||
        null;

      if (!mediaUrl)
        throw new Error("No downloadable media found in API response.");

      // Prepare cache dir
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      // Set file extension
      const ext = mediaUrl.includes(".mp3") ? "mp3" : "mp4";
      const filePath = path.join(cacheDir, `alldl_${Date.now()}.${ext}`);

      // Download file
      const file = await axios.get(mediaUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(file.data));

      // Send file
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      api.sendMessage(
        {
          body: `✅ | Download Complete!\n📱 Platform: ${platform}\n🔗 Source: ${inputUrl}`,
          attachment: fs.createReadStream(filePath),
        },
        event.threadID,
        () => fs.unlinkSync(filePath),
        event.messageID
      );
    } catch (error) {
      console.error("[ALLDL ERROR]", error.message);
      api.setMessageReaction("❎", event.messageID, () => {}, true);
      api.sendMessage(
        `❌ Error: ${error.message}`,
        event.threadID,
        event.messageID
      );
    }
  },
};
