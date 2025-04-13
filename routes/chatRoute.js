// routes/chatRoute.js
const express = require("express");
const axios = require("axios");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../db.json");
const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));
const allowedKeywords = data.allowedKeywords;

const isPortfolioRelated = (message) => {
  const lowerCaseMsg = message.toLowerCase();
  return allowedKeywords.some((keyword) => lowerCaseMsg.includes(keyword));
};

const getLocalBotReply = (message) => {
  const lowerMessage = message.toLowerCase();
  for (let item of data.keywords) {
    if (lowerMessage.includes(item.keyword.toLowerCase())) {
      return item.reply;
    }
  }
  return "🤖 I’m here to chat about Praneeth’s portfolio. Try asking about his skills, projects, or experience!";
};

router.post("/test", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  // If message is not relevant to portfolio
  if (!isPortfolioRelated(message)) {
    return res.json({
      reply:
        "🤖 I’m here to chat about Praneeth’s portfolio. Try asking about his skills, projects, or experience!",
    });
  }

  // Try OpenAI first
  const messages = [
    {
      role: "system",
      content:
        "You are Praneeth's personal portfolio assistant. Only answer questions related to his skills, projects, and experience. If the question is off-topic, politely decline.",
    },
    {
      role: "user",
      content: message,
    },
  ];

  try {
    console.log("Api call done");
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("OpenAI API Response:", response.data);
    const aiReply = response.data.choices?.[0]?.message?.content;
    if (aiReply && aiReply.length > 0) {
      return res.json({ reply: aiReply.trim() });
    } else {
      // If OpenAI gives no valid reply, fallback
      const localReply = getLocalBotReply(message);
      return res.json({ reply: localReply });
    }
  } catch (err) {
    console.error("OpenAI error, falling back to local bot:", err.message);
    const localReply = getLocalBotReply(message);
    return res.json({ reply: localReply });
  }
});

module.exports = router;