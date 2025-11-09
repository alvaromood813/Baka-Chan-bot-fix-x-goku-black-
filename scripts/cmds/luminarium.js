import axios from "axios";
import fs from "fs-extra";
import path from "path";

export const meta = {
  name: "luminarium",
  aliases: ["lum", "lumi", "lm"], // ✅ Added clean aliases
  version: "1.1.1",
  author: "Farhan",
  description: "Generate creative AI responses using the Luminarium API.",
  category: "ai",
  cooldown: 5,
  prefix: true,
  guide: {
    en: "{pn} <prompt>",
  },
};

export async function onStart({ message, args }) {
  const prompt = args.join(" ");
  if (!prompt)
    return message.reply("⚠️ | Please provide a prompt!\nExample: luminarium Sybou");

  const waitMsg = await message.reply("✨ Generating Luminarium response...");

  try {
    const apiUrl = `https://dev.oculux.xyz/api/luminarium?prompt=${encodeURIComponent(prompt)}`;
    const res = await axios.get(apiUrl, { timeout: 20000 });
    const data = res.data;

    if (!data) return message.reply("❌ | No response received from API.");

    let contentMsg = `🌌 **Luminarium Response**\n\n🪄 Prompt: ${prompt}\n`;

    // === Auto-detect response type ===
    if (data.image) {
      const imgPath = path.join("temp", `luminarium_${Date.now()}.jpg`);
      const image = await axios.get(data.image, { responseType: "arraybuffer" });
      await fs.outputFile(imgPath, image.data);

      contentMsg += `\n🖼️ Caption: ${data.caption || "Generated image."}`;
      await message.reply({
        body: contentMsg,
        attachment: fs.createReadStream(imgPath),
      });
      await fs.remove(imgPath);

    } else if (data.video) {
      const vidPath = path.join("temp", `luminarium_${Date.now()}.mp4`);
      const video = await axios.get(data.video, { responseType: "arraybuffer" });
      await fs.outputFile(vidPath, video.data);

      contentMsg += `\n🎬 Description: ${data.caption || "AI-generated video."}`;
      await message.reply({
        body: contentMsg,
        attachment: fs.createReadStream(vidPath),
      });
      await fs.remove(vidPath);

    } else {
      contentMsg += `\n💡 Output: ${data.text || JSON.stringify(data, null, 2)}`;
      await message.reply(contentMsg);
    }

    await message.unsend(waitMsg.messageID);
  } catch (err) {
    console.error("[Luminarium Error]", err.message);
    await message.reply("🚨 | Error fetching from Luminarium API. Please try again lat
er.");
  }
}
