const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: 'alldl',
    version: '6.0',
    author: 'Farhan',
    countDown: 2,
    prefix: true,
    adminOnly: false,
    aliases: ['download', 'dl'],
    description: 'Download videos or search videos from TikTok, YouTube, Instagram, Facebook.',
    category: 'media',
    guide: {
      en: '{pn} <url> | {pn} search <keyword>'
    }
  },

  onStart: async function({ message, args, event, threadsData, role }) {
    if (!args[0]) return message.reply("Please provide a URL or search keyword.");

    const cmd = args[0].toLowerCase();

    // Search command
    if (cmd === 'search') {
      const keyword = args.slice(1).join(" ");
      if (!keyword) return message.reply("Please provide a search keyword.");
      return await this.searchVideo({ keyword, message, event });
    }

    // Otherwise, treat as direct URL
    let videoUrl = args.join(" ");
    if (!videoUrl.startsWith('http')) return message.reply("Please provide a valid URL.");

    message.reaction("⏳", event.messageID);
    await this.downloadVideo({ videoUrl, message, event });
  },

  onChat: async function({ event, message, threadsData }) {
    try {
      const threadData = await threadsData.get(event.threadID);
      if (!threadData || !threadData.autoDownload || event.senderID === global.botID) return;

      const urls = event.body.match(/https?:\/\/[^\s]+/g);
      if (!urls || urls.length === 0) return;

      const videoUrl = urls[0];
      if (!videoUrl.startsWith('http')) return;

      message.reaction("⏳", event.messageID);
      await this.downloadVideo({ videoUrl, message, event });
    } catch (err) {
      console.error("onChat error:", err);
    }
  },

  downloadVideo: async function({ videoUrl, message, event }) {
    try {
      // Try primary API
      let apiResponse = null;
      try {
        apiResponse = await axios.get(`https://noobs-api.top/dipto/alldl?url=${encodeURIComponent(videoUrl)}`, { timeout: 10000 });
      } catch {
        // Fallback API
        apiResponse = await axios.get(`https://api.akuari.my.id/downloader/all?link=${encodeURIComponent(videoUrl)}`, { timeout: 10000 });
      }

      const videoData = apiResponse.data;
      if (!videoData || !videoData.result) throw new Error("Invalid API response");

      // Download file (optional: for Goat bots you can also send as stream)
      const stream = await global.utils.getStreamFromURL(videoData.result, 'video.mp4');

      message.reaction("✅", event.messageID);
      message.reply({
        body: `✓ Download Complete\nTitle: ${videoData.title || 'Video'}\nSource: ${videoUrl}`,
        attachment: stream
      });
    } catch (err) {
      message.reaction("❌", event.messageID);
      console.error("Download error:", err);
      message.reply("Failed to download video. Please check the URL or try again later.");
    }
  },

  searchVideo: async function({ keyword, message, event }) {
    try {
      message.reaction("⏳", event.messageID);
      // Example: TikTok search API
      const res = await axios.get(`https://api-v2.tiktokapi.io/search/videos?query=${encodeURIComponent(keyword)}&limit=3`, { timeout: 10000 });
      const videos = res.data.videos || [];
      if (!videos.length) return message.reply("No videos found for your keyword.");

      let text = "Search results:\n";
      for (let i = 0; i < videos.length; i++) {
        text += `\n${i + 1}. ${videos[i].title || 'Untitled'}\n› URL: ${videos[i].url}`;
      }

      message.reaction("✅", event.messageID);
      message.reply(text);
    } catch (err) {
      message.reaction("❌", event.messageID);
      console.error("Search error:", err);
      message.reply("Failed to search videos. Try again later.");
    }
  }
};
