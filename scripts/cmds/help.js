/**
 * Baka-Chan Bot V2 — Help Command
 * ✦ Developed by: NTKhang • MD Tawsif • Farhan
 * ✦ Style: Futuristic terminal aesthetic
 */

const fs = require("fs");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

const BANNER_PATH = path.join(process.cwd(), "assets", "baka-intro.mp4"); // Optional video or image
const DO_NOT_DELETE = "✦ BAKA-CHAN ✦";

const TAGLINES = [
  "⚡ Power up your chat with Baka-Chan!",
  "🧠 Smart, sleek, and ready for action!",
  "💫 Built for legends — driven by command!",
  "🔥 Unleash full control of your bot!",
  "🎮 Explore. Command. Conquer."
];

const SEPARATORS = {
  top: "✦━━━━━━━━━━━━━━━━━━━━✦",
  bottom: "✦━━━━━━━━━━━━━━━━━━━━✦"
};

module.exports = {
  config: {
    name: "help",
    version: "3.0",
    author: "NTKhang • MD Tawsif • Farhan",
    countDown: 5,
    role: 0,
    shortDescription: { en: "List all commands or details of one" },
    longDescription: { en: "View categorized commands or inspect a specific command's details, usage, and role." },
    category: "info",
    guide: { en: "{pn} [command name | page number]" },
    priority: 1
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);
    const tagline = TAGLINES[Math.floor(Math.random() * TAGLINES.length)];

    // ─── NO ARG: SHOW COMMAND LIST ─────────────────────────────
    if (args.length === 0) {
      let msg = `
${SEPARATORS.top}
           𝗕𝗔𝗞𝗔-𝗖𝗛𝗔𝗡 𝗕𝗢𝗧  
${SEPARATORS.bottom}
${tagline}

`;

      // Categorize commands
      const categories = {};
      for (const [name, cmd] of commands) {
        if (cmd.config.role > role) continue;
        const category = cmd.config.category || "Misc";
        if (!categories[category]) categories[category] = [];
        categories[category].push(name);
      }

      // Sort and display neatly
      Object.keys(categories)
        .sort()
        .forEach((cat) => {
          const cmds = categories[cat].sort();
          msg += `╭── ✦ ${cat.toUpperCase()} ✦ ──╮\n`;
          for (let i = 0; i < cmds.length; i += 3) {
            const line = cmds
              .slice(i, i + 3)
              .map((cmd) => `✧ ${cmd}`)
              .join("   ");
            msg += `│ ${line}\n`;
          }
          msg += `╰─────────────────────╯\n`;
        });

      msg += `
╭── ✦ BOT INFO ✦ ──╮
│ 📜 Total Cmds: ${commands.size}
│ 💡 Usage: ${prefix}help <cmd>
│ 👑 Owner: Farhan (frnwot)
│ 🌐 fb.com/share/1BMmLwy1JY/
│ ${DO_NOT_DELETE}
╰───────────────────╯
`;

      return sendWithOptionalMedia(message, msg, BANNER_PATH);
    }

    // ─── ARG PRESENT: SHOW SPECIFIC COMMAND ────────────────────
    const commandName = args[0].toLowerCase();
    const command = commands.get(commandName) || commands.get(aliases.get(commandName));

    if (!command) {
      return message.reply(`⚠️ Command "${commandName}" not found. Try using "${prefix}help" to see all commands.`);
    }

    const cfg = command.config;
    const roleText = getRoleText(cfg.role);
    const author = cfg.author || "Unknown";
    const longDesc = cfg.longDescription?.en || cfg.shortDescription?.en || "No description provided.";
    const usage = (cfg.guide?.en || "No usage guide available.")
      .replace(/\{p\}|\{prefix\}/g, prefix)
      .replace(/\{n\}|\{name\}/g, cfg.name)
      .replace(/\{pn\}/g, prefix + cfg.name);

    const aliasesList = cfg.aliases?.length ? cfg.aliases.join(", ") : "None";
    const cooldown = cfg.countDown ? `${cfg.countDown}s` : "1s";

    const infoMsg = `
${SEPARATORS.top}
        𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗗𝗘𝗧𝗔𝗜𝗟𝗦  
${SEPARATORS.bottom}

📌 Name: ${cfg.name}
📖 Description: ${longDesc}
📂 Aliases: ${aliasesList}
⚙️ Version: ${cfg.version || "1.0"}
🛡️ Role: ${roleText}
⏱️ Cooldown: ${cooldown}
👤 Author: ${author}
💡 Usage: ${usage}

${SEPARATORS.bottom}
`;

    return sendWithOptionalMedia(message, infoMsg, BANNER_PATH);
  }
};

// ─── Utility Functions ─────────────────────────────────────────

function getRoleText(role) {
  switch (role) {
    case 0:
      return "0 ✦ All Users";
    case 1:
      return "1 ✦ Group Admins";
    case 2:
      return "2 ✦ Bot Admins";
    case 3:
      return "3 ✦ Super Admins";
    default:
      return "Unknown Role";
  }
}

function sendWithOptionalMedia(message, body, mediaPath) {
  try {
    if (fs.existsSync(mediaPath)) {
      return message.reply({
        body,
        attachment: fs.createReadStream(mediaPath)
      });
    } else {
      return message.reply(body);
    }
  } catch (err) {
    console.error("Help message send error:", err);
    return message.reply(body);
  }
}
