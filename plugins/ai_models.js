const { cmd } = require('../command');
const axios = require('axios');
const moment = require('moment-timezone');

const fakeContact = {
  key: {
    fromMe: false,
    participant: "0@s.whatsapp.net",
    remoteJid: "status@broadcast"
  },
  message: {
    contactMessage: {
      displayName: "BOYKA-XD | BOYKA-XD",
      vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:TREND-X | TREND-X\nORG:TREND-X;\nTEL;type=CELL;type=VOICE;waid=254700000000:+254 700 000000\nEND:VCARD`,
      jpegThumbnail: Buffer.alloc(0)
    }
  }
};

const getContextInfo = (title, url, thumb) => ({
  externalAdReply: {
    showAdAttribution: true,
    title: title,
    body: "BOYKA XD | Multi-Device WhatsApp Bot",
    thumbnailUrl: thumb || "https://i.ibb.co/tp3jnw3s/jpg.jpg",
    sourceUrl: url || "https://github.com/Joshuamambo1/BOYKA-XD"
  },
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363401765045963@newsletter',
    newsletterName: 'BOYKA-XD'
  }
});

const customReplies = (q) => {
  const lower = q.toLowerCase();
  const today = moment().tz("Africa/Gweru");
  if (lower.includes("trend-x")) return "🔥 BOYKA-XD is a Multi-Device WhatsApp Bot made by *Joshuamambo1*.";
  if (lower.includes("Biykaxd")) return "👑BOYKA-XD is the official creator of the *boykaxd* WhatsApp bot.";
  if (lower.includes("channel")) return "📢 Official channel: ‎https://whatsapp.com/channel/0029VaraMtfFcowAKRdDdp1T";
  if (lower.includes("repo") || lower.includes("github")) return "🔗 GitHub repo: https://github.com/Joshuamambo1/BOYKA-XD";
  if (lower.includes("date") || lower.includes("today")) return `📅 Today is ${today.format("dddd, MMMM Do YYYY")}`;
  if (lower.includes("day")) return `📆 Today is *${today.format("dddd")}*`;
  return null;
};

cmd({
  pattern: "ai",
  alias: ["bot", "dj", "gpt", "gpt4", "bing"],
  desc: "Chat with an AI model",
  category: "ai",
  react: "🤖",
  filename: __filename
},
async (conn, mek, m, { q, reply, react }) => {
  try {
    if (!q) return reply("Please provide a message for the AI.\nExample: `.ai Hello`");

    const fixed = customReplies(q);
    if (fixed) return await conn.sendMessage(m.chat, { text: fixed, contextInfo: getContextInfo("AI Response") }, { quoted: fakeContact });

    const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);
    if (!data || !data.message) return reply("AI failed to respond.");

    await conn.sendMessage(m.chat, {
      text: `🤖 *AI Response:*\n\n${data.message}`,
      contextInfo: getContextInfo("AI Response")
    }, { quoted: fakeContact });

  } catch (e) {
    console.error("AI Error:", e);
    reply("❌ Error occurred.");
  }
});

cmd({
  pattern: "openai",
  alias: ["chatgpt", "gpt3", "open-gpt"],
  desc: "Chat with OpenAI",
  category: "ai",
  react: "🧠",
  filename: __filename
},
async (conn, mek, m, { q, reply, react }) => {
  try {
    if (!q) return reply("Please provide a message for OpenAI.\nExample: `.openai Hello`");

    const fixed = customReplies(q);
    if (fixed) return await conn.sendMessage(m.chat, { text: fixed, contextInfo: getContextInfo("OpenAI Response") }, { quoted: fakeContact });

    const apiUrl = `https://vapis.my.id/api/openai?q=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);
    if (!data || !data.result) return reply("OpenAI failed to respond.");

    await conn.sendMessage(m.chat, {
      text: `🧠 *OpenAI Response:*\n\n${data.result}`,
      contextInfo: getContextInfo("OpenAI Response")
    }, { quoted: fakeContact });

  } catch (e) {
    console.error("OpenAI Error:", e);
    reply("❌ Error occurred.");
  }
});

cmd({
  pattern: "deepseek",
  alias: ["deep", "seekai"],
  desc: "Chat with DeepSeek AI",
  category: "ai",
  react: "🧠",
  filename: __filename
},
async (conn, mek, m, { q, reply, react }) => {
  try {
    if (!q) return reply("Please provide a message for DeepSeek AI.\nExample: `.deepseek Hello JoshKing`");

    const fixed = customReplies(q);
    if (fixed) return await conn.sendMessage(m.chat, { text: fixed, contextInfo: getContextInfo("DeepSeek Response") }, { quoted: fakeContact });

    const apiUrl = `https://api.ryzendesu.vip/api/ai/deepseek?text=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);
    if (!data || !data.answer) return reply("DeepSeek failed to respond.");

    await conn.sendMessage(m.chat, {
      text: `🧠 *DeepSeek AI Response:*\n\n${data.answer}`,
      contextInfo: getContextInfo("DeepSeek Response")
    }, { quoted: fakeContact });

  } catch (e) {
    console.error("DeepSeek Error:", e);
    reply("❌ Error occurred.");
  }
});
      
