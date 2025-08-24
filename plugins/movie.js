const axios = require('axios');
const { cmd } = require('../command');
const config = require('../config'); 

cmd({
    pattern: "movie",
    desc: "Fetch detailed information about a movie, including a download link.",
    category: "utility",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
    try {
        const movieName = args.join(' ');
        if (!movieName) {
            return reply("📽️ Please provide the name of the movie.");
        }

        const apiUrl = `https://delirius-apiofc.vercel.app/search/movie?query=${encodeURIComponent(movieName)}`;
        const response = await axios.get(apiUrl);

        const data = response.data;
        if (!data.status || !data.data.length) {
            return reply("🚫 Movie not found.");
        }

        const movie = data.data[0]; // Pehla result le rahe hain
        const downloadLink = `https://delirius-apiofc.vercel.app/download/movie?id=${movie.id}`;

        const movieInfo = `
🎬 *Movie Information* 🎬

🎥 *Title:* ${movie.title}
🗓️ *Release Date:* ${movie.release_date}
🗳️ *Vote Average:* ${movie.vote_average}
👥 *Vote Count:* ${movie.vote_count}
🌍 *Original Language:* ${movie.original_language}
📝 *Overview:* ${movie.overview}
⬇️ *Download Link:* [Click Here](${downloadLink})
`;

        const imageUrl = movie.image || config.ALIVE_IMG;

        await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: `${movieInfo}\n> ©ᴘᴏᴡᴇʀᴇᴅ ʙʏ ‎🫡ᴛᴇʟᴋɪɴɢ sᴜᴘᴘᴏʀᴛ`
        }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }
});
