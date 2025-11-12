const axios = require('axios');
const base = () => { return "https://tawsif.is-a.dev/downloader/all" }
module.exports = {
  config: {
    name: "alldl",
    aliases: ["fb", "insta", "dl", "download", "tiktok", "video"],
    version: "1.0",
    role: 0,
    author: "Tawsif~",
    countDown: 5,
    category: "media",
    shortDescription: "download videos from Facebook, Instagram and TikTok",
    guide: {
      en: "{pn} <url> | reply to an url"
    }
  },
  onStart: async function ({ message, event, args }) {
  let url;
  const prompt = args.join(" ");
    if (!prompt) {
    if (!event?.messageReply) {
      return message.reply("❌ | provide a URL or reply to one");
}
if (event.messageReply?.attachments[0]?.type == "share" && event.messageReply?.attachments[0]?.facebookUrl) { url = event.messageReply.attachments[0].facebookUrl;
} else { url = event.messageReply.body.split(" ").find(u => u.match(/https:\/\//));
	}
} else { url = args.find(u => u.match(/https:\/\//));
}
if (!url) return message.reply("❌ | invalid URL");
message.reaction("🕔", event.messageID);
try {
       const { data } = await axios.get(`${base()}?url=${encodeURIComponent(url)}`);

if (!data?.success) return message.reaction("❌", event.messageID);
message.reaction("☑️", event.messageID);
       message.reply({ attachment: await global.utils.getStreamFromURL(data.videoUrl),
       body: `Source: ${data.source}\n${!data.title ? "" : "Title: "+ data.title}`
       });
      } catch (error) {
        message.reply("❌ | An error occurred");
      }
   }
};
