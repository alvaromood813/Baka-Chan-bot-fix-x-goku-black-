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
const axios = require('axios');

module.exports = {
  config: {
    name: 'alldl',
    version: '6.3',
    author: 'Farhan',
    countDown: 2,
    prefix: true,
    adminOnly: false,
    aliases: ['download', 'dl'],
    description: 'Fetch video URL from many platforms (TikTok, Instagram, YouTube, Facebook…) using universal API.',
    category: 'media',
    guide: {
      en: '{pn} <url>'
    }
  },

  onStart: async function({ message, args, event }) {
    if (!args[0]) return message.reply("❌ Please provide a video URL.");

    const videoUrl = args.join(" ");
    if (!videoUrl.startsWith('http')) return message.reply("❌ Invalid URL. Please provide a proper link.");

    await message.reaction("⏳", event.messageID);

    try {
      const fetchedUrl = await this.fetchVideoURL(videoUrl);

      await message.reaction("✅", event.messageID);
      return message.reply(`🎬 Video URL fetched:\n${fetchedUrl}`);
    } catch (err) {
      await message.reaction("❌", event.messageID);
      console.error("Fetch error:", err);
      return message.reply("⚠️ Failed to fetch video. Please check the URL or try again later.");
    }
  },

  onChat: async function({ event, message }) {
    try {
      const urls = event.body.match(/https?:\/\/[^\s]+/g);
      if (!urls || urls.length === 0) return;

      const videoUrl = urls[0];
      if (!videoUrl.startsWith('http')) return;

      await message.reaction("⏳", event.messageID);
      const fetchedUrl = await this.fetchVideoURL(videoUrl);
      await message.reaction("✅", event.messageID);
      return message.reply(`🎬 Video URL fetched:\n${fetchedUrl}`);
    } catch (err) {
      await message.reaction("❌", event.messageID);
      console.error("onChat fetch error:", err);
    }
  },

  fetchVideoURL: async function(videoUrl) {
    try {
      // Example of universal API usage
      const apiKey = process.env.UNIVERSAL_DL_API_KEY;  // set your key in env
      const apiEndpoint = `https://api.apify.com/v2/acts/wilcode~all-social-media-video-downloader/run-sync-get-input?token=${apiKey}`;
      const payload = {
        "url": videoUrl
      };
      const res = await axios.post(apiEndpoint, payload, { timeout: 15000 });

      if (res.data && res.data.output && res.data.output.downloadUrl) {
        return res.data.output.downloadUrl;
      }

      throw new Error("No download URL found from API");
    } catch (err) {
      throw err;
    }
  }
};
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
