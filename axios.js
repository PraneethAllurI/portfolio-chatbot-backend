const axios = require("axios");
require("dotenv").config();

const githubAPI = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Authorization: `token ${process.env.GITHUB_TOKEN}`, // ✅ must be 'token' not 'Bearer'
    "User-Agent": "Praneeth-Portfolio-Bot",
    Accept: "application/vnd.github.v3+json",
  },
});

module.exports = githubAPI;
