const { cmd } = require('../command');

cmd({
    pattern: "add",
    alias: ["a", "invite"],
    desc: "Adds a member to the group",
    category: "admin",
    react: "➕",
    filename: __filename
},
async (conn, mek, m, {
    from, q, isGroup, isBotAdmins, reply, quoted, senderNumber
}) => {
    // Create newsletter-style message function
    const sendNewsletterMessage = async (text, mentions = []) => {
        return conn.sendMessage(from, { 
            text: text,
            contextInfo: {
                mentionedJid: mentions,
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363347365643318@newsletter',
                    newsletterName: '𝗕𝗢𝗬𝗞𝗔-𝗫𝗗 𝗧𝗘𝗖𝗛',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });
    };

    // Check if the command is used in a group
    if (!isGroup) {
        return sendNewsletterMessage("❌ This command can only be used in groups.");
    }

    // Get the bot owner's number dynamically from conn.user.id
    const botOwner = conn.user.id.split(":")[0];
    if (senderNumber !== botOwner) {
        return sendNewsletterMessage("❌ Only the bot owner can use this command.");
    }

    // Check if the bot is an admin
    if (!isBotAdmins) {
        return sendNewsletterMessage("❌ I need to be an admin to use this command.");
    }

    let number;
    if (m.quoted) {
        number = m.quoted.sender.split("@")[0];
    } else if (q && q.includes("@")) {
        number = q.replace(/[@\s]/g, '');
    } else if (q && /^\d+$/.test(q)) {
        number = q;
    } else {
        return sendNewsletterMessage("❌ Please reply to a message, mention a user, or provide a number to add.");
    }

    const jid = number + "@s.whatsapp.net";

    try {
        await conn.groupParticipantsUpdate(from, [jid], "add");
        
        // Success message with image and newsletter style
        await conn.sendMessage(from, { 
            image: { url: 'https://i.ibb.co/7BjSBVP/jpg.jpg' },
            caption: `✅ Successfully added @${number}\n\n_Action performed by bot owner_`,
            contextInfo: {
                mentionedJid: [jid],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363347365643318@newsletter',
                    newsletterName: '𝗕𝗢𝗬𝗞𝗔-𝗫𝗗 𝗧𝗘𝗖𝗛',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });
        
    } catch (error) {
        console.error("Add command error:", error);
        await sendNewsletterMessage("❌ Failed to add the member. Error: " + error.message);
    }
});
