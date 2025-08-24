const config = require("../config");
const { cmd } = require("../command");
const { getGroupAdmins, fetchJson } = require("../lib/functions");

// Join Requests Command
cmd({
    pattern: "joinrequests",
    desc: "Get list of participants who requested to join the group",
    react: '📋',
    category: 'group',
    filename: __filename
}, async (conn, mek, m, { from, reply, isGroup }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in group chats");
        
        const pendingRequests = await conn.groupRequestParticipantsList(from);
        if (!pendingRequests || pendingRequests.length === 0) {
            return reply("ℹ️ No pending join requests");
        }

        let message = "📋 *Pending Join Requests*\n\n";
        const mentions = [];
        
        pendingRequests.forEach(user => {
            const userId = user.jid;
            message += `• @${userId.split('@')[0]}\n`;
            mentions.push(userId);
        });

        await conn.sendMessage(from, {
            text: message,
            mentions,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (error) {
        console.error("JoinRequests Error:", error);
        reply("❌ Failed to fetch join requests. Please try again.");
    }
});

// Approve/Reject All Requests Command
cmd({
    pattern: "allreq",
    desc: "Approve or reject all join requests",
    react: '✅',
    category: "group",
    use: ".allreq <approve/reject>",
    filename: __filename
}, async (conn, mek, m, { from, reply, isGroup, args }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in group chats");
        
        const action = args[0]?.toLowerCase();
        if (!action || !['approve', 'reject'].includes(action)) {
            return reply("ℹ️ Usage: .allreq <approve/reject>");
        }

        const pendingRequests = await conn.groupRequestParticipantsList(from);
        if (!pendingRequests || pendingRequests.length === 0) {
            return reply("ℹ️ No pending join requests to process");
        }

        const userIds = pendingRequests.map(user => user.jid);
        await conn.groupRequestParticipantsUpdate(from, userIds, action);

        reply(`✅ Successfully ${action}ed all ${userIds.length} join requests`, {
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        });

    } catch (error) {
        console.error("AllReq Error:", error);
        reply("❌ Failed to process join requests. Please try again.");
    }
});

// Disappearing Messages Command
cmd({
    pattern: "disappear",
    alias: ['dm'],
    desc: "Turn on/off disappearing messages",
    react: "🌪️",
    category: "main",
    use: ".disappear <on/off> [24h/7d/90d]",
    filename: __filename
}, async (conn, mek, m, { from, reply, isGroup, isAdmins, args }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups");
        if (!isAdmins) return reply("❌ Only admins can change disappearing messages");

        const action = args[0]?.toLowerCase();
        
        if (action === 'on') {
            const duration = args[1]?.toLowerCase();
            let seconds;
            
            switch (duration) {
                case "24h": seconds = 86400; break;
                case "7d": seconds = 604800; break;
                case "90d": seconds = 7776000; break;
                default: 
                    return reply("❌ Invalid duration! Use 24h, 7d, or 90d");
            }

            await conn.groupSettingUpdate(from, 'disappearing_messages', seconds);
            reply(`✅ Disappearing messages enabled for ${duration}`, {
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true
                }
            });
            
        } else if (action === 'off') {
            await conn.groupSettingUpdate(from, 'disappearing_messages', false);
            reply("✅ Disappearing messages disabled", {
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true
                }
            });
            
        } else {
            reply("ℹ️ Usage: .disappear <on/off> [24h/7d/90d]");
        }
    } catch (error) {
        console.error("Disappear Error:", error);
        reply("❌ Failed to update disappearing messages");
    }
});

// Mute/Unmute Group Commands
cmd({
    pattern: "mute",
    alias: ["close", "f_mute"],
    desc: "Change group to admins-only messaging",
    react: '🔇',
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, reply, isGroup, isAdmins, isBotAdmins }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups");
        if (!isAdmins) return reply("❌ Only admins can mute the group");
        if (!isBotAdmins) return reply("❌ Bot needs admin privileges");

        await conn.groupSettingUpdate(from, 'announcement');
        reply("🔇 Group chat is now muted (admins only)", {
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        });

    } catch (error) {
        console.error("Mute Error:", error);
        reply("❌ Failed to mute group");
    }
});

cmd({
    pattern: "unmute",
    alias: ["open", 'f_unmute'],
    desc: "Change group to allow all members to message",
    react: '🔊',
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, reply, isGroup, isAdmins, isBotAdmins }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups");
        if (!isAdmins) return reply("❌ Only admins can unmute the group");
        if (!isBotAdmins) return reply("❌ Bot needs admin privileges");

        await conn.groupSettingUpdate(from, "not_announcement");
        reply("🔊 Group chat is now unmuted (all members)", {
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        });

    } catch (error) {
        console.error("Unmute Error:", error);
        reply("❌ Failed to unmute group");
    }
});

// Group Lock/Unlock Commands
cmd({
    pattern: "lockgs",
    alias: ["lockgsettings"],
    desc: "Lock group settings (admins only)",
    react: '🔒',
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, reply, isGroup, isAdmins, isBotAdmins }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups");
        if (!isAdmins) return reply("❌ Only admins can lock settings");
        if (!isBotAdmins) return reply("❌ Bot needs admin privileges");

        await conn.groupSettingUpdate(from, 'locked');
        reply("🔒 Group settings are now locked (admins only)", {
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        });

    } catch (error) {
        console.error("LockGS Error:", error);
        reply("❌ Failed to lock group settings");
    }
});

cmd({
    pattern: "unlockgs",
    alias: ['unlockgsettings'],
    desc: "Unlock group settings (all members)",
    react: '🔓',
    category: 'group',
    filename: __filename
}, async (conn, mek, m, { from, reply, isGroup, isAdmins, isBotAdmins }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups");
        if (!isAdmins) return reply("❌ Only admins can unlock settings");
        if (!isBotAdmins) return reply("❌ Bot needs admin privileges");

        await conn.groupSettingUpdate(from, "unlocked");
        reply("🔓 Group settings are now unlocked", {
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        });

    } catch (error) {
        console.error("UnlockGS Error:", error);
        reply("❌ Failed to unlock group settings");
    }
});

// Group Management Commands
cmd({
    pattern: "updategname",
    alias: ["upgname", 'gname'],
    desc: "Change group name",
    react: '✏️',
    category: 'group',
    use: '.updategname <new name>',
    filename: __filename
}, async (conn, mek, m, { from, reply, isGroup, isAdmins, isBotAdmins, q }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups");
        if (!isAdmins) return reply("❌ Only admins can change group name");
        if (!isBotAdmins) return reply("❌ Bot needs admin privileges");
        if (!q) return reply("ℹ️ Please provide the new group name");

        await conn.groupUpdateSubject(from, q);
        reply("✅ Group name updated successfully", {
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        });

    } catch (error) {
        console.error("UpdateGName Error:", error);
        reply("❌ Failed to update group name");
    }
});

cmd({
    pattern: "updategdesc",
    alias: ['upgdesc', "gdesc"],
    desc: "Change group description",
    react: '📝',
    category: "group",
    use: ".updategdesc <new description>",
    filename: __filename
}, async (conn, mek, m, { from, reply, isGroup, isAdmins, isBotAdmins, q }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups");
        if (!isAdmins) return reply("❌ Only admins can change group description");
        if (!isBotAdmins) return reply("❌ Bot needs admin privileges");
        if (!q) return reply("ℹ️ Please provide the new group description");

        await conn.groupUpdateDescription(from, q);
        reply("✅ Group description updated successfully", {
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        });

    } catch (error) {
        console.error("UpdateGDesc Error:", error);
        reply("❌ Failed to update group description");
    }
});

// Group Invite Commands
cmd({
    pattern: "invite",
    alias: ['grouplink', "glink"],
    desc: "Get group invite link",
    react: "🖇️",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, reply, isGroup, isAdmins, isBotAdmins }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups");
        if (!isAdmins) return reply("❌ Only admins can get invite link");
        if (!isBotAdmins) return reply("❌ Bot needs admin privileges");

        const code = await conn.groupInviteCode(from);
        reply(`🖇️ Group Invite Link:\nhttps://chat.whatsapp.com/${code}`, {
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        });

    } catch (error) {
        console.error("Invite Error:", error);
        reply("❌ Failed to get group invite link");
    }
});

cmd({
    pattern: "revoke",
    alias: ["revokegrouplink", "resetglink"],
    desc: "Reset group invite link",
    react: "🔄",
    category: 'group',
    filename: __filename
}, async (conn, mek, m, { from, reply, isGroup, isAdmins, isBotAdmins }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups");
        if (!isAdmins) return reply("❌ Only admins can reset invite link");
        if (!isBotAdmins) return reply("❌ Bot needs admin privileges");

        await conn.groupRevokeInvite(from);
        reply("✅ Group invite link has been reset", {
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        });

    } catch (error) {
        console.error("Revoke Error:", error);
        reply("❌ Failed to reset group invite link");
    }
});

// Member Management Commands
cmd({
    pattern: "kick2",
    alias: ["remove"],
    desc: "Remove participant from group",
    react: '🚪',
    category: "group",
    use: ".kick @user",
    filename: __filename
}, async (conn, mek, m, { from, reply, isGroup, isAdmins, isBotAdmins, mentionedJid }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups");
        if (!isAdmins) return reply("❌ Only admins can remove members");
        if (!isBotAdmins) return reply("❌ Bot needs admin privileges");
        
        const userId = mentionedJid?.[0] || m.quoted?.sender;
        if (!userId) return reply("ℹ️ Please mention or quote the user to kick");

        await conn.groupParticipantsUpdate(from, [userId], "remove");
        reply(`✅ User @${userId.split('@')[0]} has been removed`, { 
            mentions: [userId],
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        });

    } catch (error) {
        console.error("Kick Error:", error);
        reply("❌ Failed to remove user from group");
    }
});

cmd({
    pattern: "promote2",
    alias: ["addadmin"],
    desc: "Promote member to admin",
    react: '⬆️',
    category: 'group',
    use: ".promote @user",
    filename: __filename
}, async (conn, mek, m, { from, reply, isGroup, isAdmins, isBotAdmins, mentionedJid, participants }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups");
        if (!isAdmins) return reply("❌ Only admins can promote members");
        if (!isBotAdmins) return reply("❌ Bot needs admin privileges");
        
        const userId = mentionedJid?.[0] || m.quoted?.sender;
        if (!userId) return reply("ℹ️ Please mention or quote the user to promote");

        const admins = await getGroupAdmins(participants);
        if (admins.includes(userId)) return reply("ℹ️ User is already an admin");

        await conn.groupParticipantsUpdate(from, [userId], "promote");
        reply(`✅ User @${userId.split('@')[0]} is now an admin`, { 
            mentions: [userId],
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        });

    } catch (error) {
        console.error("Promote Error:", error);
        reply("❌ Failed to promote user");
    }
});

cmd({
    pattern: "demote2",
    alias: ["removeadmin"],
    desc: "Demote admin to member",
    react: '⬇️',
    category: "group",
    use: ".demote @user",
    filename: __filename
}, async (conn, mek, m, { from, reply, isGroup, isAdmins, isBotAdmins, mentionedJid, participants }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups");
        if (!isAdmins) return reply("❌ Only admins can demote members");
        if (!isBotAdmins) return reply("❌ Bot needs admin privileges");
        
        const userId = mentionedJid?.[0] || m.quoted?.sender;
        if (!userId) return reply("ℹ️ Please mention or quote the user to demote");

        const admins = await getGroupAdmins(participants);
        if (!admins.includes(userId)) return reply("ℹ️ User is not an admin");

        await conn.groupParticipantsUpdate(from, [userId], "demote");
        reply(`✅ User @${userId.split('@')[0]} is no longer an admin`, { 
            mentions: [userId],
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        });

    } catch (error) {
        console.error("Demote Error:", error);
        reply("❌ Failed to demote user");
    }
});

// Tagging Commands
cmd({
    pattern: "tagall2",
    alias: ["all", "f_tagall"],
    desc: "Tag all group members",
    react: '🔊',
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, reply, isGroup, isAdmins, isBotAdmins, participants }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups");
        if (!isAdmins) return reply("❌ Only admins can tag all members");
        if (!isBotAdmins) return reply("❌ Bot needs admin privileges");

        let message = "📢 *Attention Everyone!* \n\n";
        const mentions = participants.map(p => p.id);
        
        mentions.forEach(userId => {
            message += `@${userId.split('@')[0]} `;
        });

        await conn.sendMessage(from, {
            text: message,
            mentions,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (error) {
        console.error("TagAll Error:", error);
        reply("❌ Failed to tag all members");
    }
});

cmd({
    pattern: "hidetag2",
    alias: ["tag", "f_tag"],
    desc: "Tag all members with hidden notification",
    react: '🔇',
    category: "group",
    use: ".hidetag <message>",
    filename: __filename
}, async (conn, mek, m, { from, reply, isGroup, isAdmins, isBotAdmins, participants, q }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups");
        if (!isAdmins) return reply("❌ Only admins can use hidetag");
        if (!isBotAdmins) return reply("❌ Bot needs admin privileges");
        if (!q) return reply("ℹ️ Please provide a message to send");

        const mentions = participants.map(p => p.id);
        await conn.sendMessage(from, {
            text: q,
            mentions,
            ephemeralExpiration: 604800, // 7 days
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (error) {
        console.error("Hidetag Error:", error);
        reply("❌ Failed to send hidetag message");
    }
});

// Group Info Command
cmd({
    pattern: 'ginfo',
    alias: ["groupinfo"],
    desc: "Get group information",
    react: 'ℹ️',
    category: "group",
    filename: __filename
}, async (conn, mek, m, { from, reply, isGroup }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups");

        const metadata = await conn.groupMetadata(from);
        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(from, "image");
        } catch {
            ppUrl = "https://i.ibb.co/7BjSBVP/jpg.jpg"; // Default group icon
        }

        const infoText = `
*${metadata.subject}*

👥 *Participants:* ${metadata.size}
👑 *Owner:* @${metadata.owner.split('@')[0]}
📝 *Description:* ${metadata.desc || "None"}
🆔 *Group ID:* ${metadata.id}

${config.FOOTER || "Powered by BOYKAXD-SUPPORT"}
`.trim();

        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption: infoText,
            mentions: [metadata.owner],
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (error) {
        console.error("GInfo Error:", error);
        reply("❌ Failed to get group information");
    }
});
