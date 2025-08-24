const { cmd } = require('../command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const fetch = require('node-fetch');

// Newsletter configuration
const newsletterConfig = {
    contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363347365643318@newsletter',
            newsletterName: 'BOYKA-XD 𝐌𝐄𝐃𝐈𝐀',
            serverMessageId: 143
        }
    }
};

// MP4 video download with enhanced features
cmd({ 
    pattern: "mp4", 
    alias: ["video", "ytvideo"], 
    react: "🎥", 
    desc: "Download YouTube videos in MP4 format", 
    category: "media", 
    use: '.mp4 <YouTube URL or search query>', 
    filename: __filename 
}, async (conn, mek, m, { from, reply, q, sender }) => { 
    try { 
        if (!q) return reply("❌ Please provide a YouTube URL or video name.\nExample: .mp4 baby shark");

        // Show searching status
        await reply("🔍 Searching for video... Please wait...");

        const yt = await ytsearch(q, { limit: 1 });
        if (!yt.results.length) return reply("❌ No videos found for your query!");

        const video = yt.results[0];
        const apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(video.url)}`;
        
        // Show downloading status
        await reply("⬇️ Downloading video... This may take a moment...");

        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (!data?.result?.download_url) {
            return reply("❌ Video download failed. The service might be temporarily unavailable.");
        }

        const videoInfo = `
📹 *YouTube Video Downloader*

🎬 *Title:* ${video.title}
⏱️ *Duration:* ${video.timestamp}
👁️ *Views:* ${video.views}
👤 *Channel:* ${video.author.name}
🔗 *URL:* ${video.url}

⚡ *Powered by ʙᴏʏᴋᴀ xᴅ*`;

        // Send video with caption and newsletter context
        await conn.sendMessage(from, { 
            video: { 
                url: data.result.download_url,
                mimetype: "video/mp4"
            }, 
            caption: videoInfo,
            ...newsletterConfig
        }, { quoted: mek });

    } catch (error) {
        console.error("MP4 Download Error:", error);
        reply(`❌ An error occurred: ${error.message}\nPlease try again later.`);
    }
});

// MP3 song download with enhanced features
cmd({ 
    pattern: "song", 
    alias: ["play", "mp3", "ytmusic"], 
    react: "🎶", 
    desc: "Download YouTube audio in MP3 format", 
    category: "media", 
    use: '.song <song name or YouTube link>', 
    filename: __filename 
}, async (conn, mek, m, { from, reply, q, sender }) => { 
    try {
        if (!q) return reply("❌ Please provide a song name or YouTube link.\nExample: .song despacito");

        // Show searching status
        await reply("🔍 Searching for song... Please wait...");

        const yt = await ytsearch(q, { limit: 1 });
        if (!yt.results.length) return reply("❌ No songs found for your query!");

        const song = yt.results[0];
        const apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(song.url)}`;
        
        // Show downloading status
        await reply("⬇️ Downloading audio... This may take a moment...");

        const res = await fetch(apiUrl);
        const data = await res.json();

        if (!data?.result?.downloadUrl) {
            return reply("❌ Audio download failed. The service might be temporarily unavailable.");
        }

        // Enhanced audio message with newsletter context
        await conn.sendMessage(from, {
            audio: { 
                url: data.result.downloadUrl,
                mimetype: "audio/mpeg"
            },
            fileName: `${song.title.substring(0, 50)}.mp3`,
            ptt: false,
            contextInfo: {
                ...newsletterConfig.contextInfo,
                externalAdReply: {
                    title: song.title.length > 25 ? `${song.title.substring(0, 22)}...` : song.title,
                    body: "🎵 ʙᴏʏᴋᴀ xᴅ Music Downloader",
                    mediaType: 1,
                    thumbnailUrl: song.thumbnail.replace('default.jpg', 'hqdefault.jpg'),
                    sourceUrl: song.url,
                    mediaUrl: song.url,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });

    } catch (error) {
        console.error("MP3 Download Error:", error);
        reply(`❌ An error occurred: ${error.message}\nPlease try again later.`);
    }
});
