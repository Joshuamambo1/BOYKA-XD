const axios = require("axios");
const { cmd } = require("../command");


cmd({
    pattern: "ecocashmenu",
    alias: ["ecocash"],
    desc: "menu the bot",
    category: "menu",
    react: "🎀",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let dec = `*╭───❍ᴛᴇʟᴋɪɴɢ sᴜᴘᴘᴏʀᴛ🥹🫡❍*
‎*├⬡ .ᴇᴄᴏᴄᴀsʜ*
‎*├⬡ .263777756184*
‎*╰───────────────❍*`;

        await conn.sendMessage(
            from,
            {
                image: { url: `https://ibb.co/T5M9Ztb.jpg` },
                caption: dec,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363347365643318@newsletter',
                        newsletterName: "ᴇᴄᴏᴄᴀsʜ  𝐏𝐀𝐘𝐌𝐄𝐍𝐓",
                        serverMessageId: 143
                    }
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});
