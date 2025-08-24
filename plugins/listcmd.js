const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');
const moment = require('moment-timezone');

cmd({
  pattern: "listmenu",
  alias: ["commandlist", "help"],
  desc: "Fetch and display all available bot commands",
  category: "system",
  filename: __filename,
}, async (Void, m, text, { prefix }) => {
  try {
    const commandDir = path.join(__dirname, '../plugins');
    const commandFiles = fs.readdirSync(commandDir).filter(file => file.endsWith('.js'));

    let totalCommands = 0;
    let commandList = [];

    for (const file of commandFiles) {
      const filePath = path.join(commandDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const matches = content.match(/pattern:\s*["'`](.*?)["'`]/g);
      
      if (matches) {
        const extracted = matches.map(x => x.split(':')[1].replace(/["'`,]/g, '').trim());
        totalCommands += extracted.length;
        commandList.push(`📁 *${file}*\n${extracted.map(cmd => `⦿ ${cmd}`).join('\n')}`);
      }
    }

    const time = moment().tz('Africa/Gweru').format('HH:mm:ss');
    const date = moment().tz('Africa/Gweru').format('dddd, MMMM Do YYYY');

    const caption = `╭━━〔 *𝗕𝗢𝗬𝗞𝗔-𝗫𝗗* 〕━━⬣
┃ 👑 *Total Commands:* ${totalCommands}
┃ 📅 *Date:* ${date}
┃ ⏰ *Time:* ${time}
┃ 🤖 *Prefix:* ${prefix}
╰━━━━━━━━━━━━━━━━━━━━⬣\n\n${commandList.join('\n\n')}`;

    await Void.sendMessage(m.chat, {
      image: { url: "https://i.ibb.co/7BjSBVP/jpg.jpg" },
      caption,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363347365643318@newsletter",
          newsletterName: "𝗕𝗢𝗬𝗞𝗔-𝗫𝗗 𝗧𝗘𝗖𝗛",
          serverMessageId: 2
        },
        externalAdReply: {
          title: "𝗕𝗢𝗬𝗞𝗔-𝗫𝗗",
          body: `ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝗕𝗢𝗬𝗞𝗔-𝗫𝗗 𝗧𝗘𝗖𝗛`,
          mediaType: 1
        }
      }
    }, { quoted: m });
  } catch (err) {
    console.error(err);
    await m.reply('❌ Error: Could not fetch the command list.');
  }
});
