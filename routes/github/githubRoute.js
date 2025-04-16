const express = require("express");
const router = express.Router();
const githubAPI = require("../../axios");
require("dotenv").config();

const GITHUB_USERNAME = process.env.GITHUB_USERNAME;

// 1️⃣ GET /api/github → Get profile data
router.get("/", async (req, res) => {
  try {
    const userRes = await githubAPI.get(`/users/${GITHUB_USERNAME}`);
    const reposRes = await githubAPI.get(`/users/${GITHUB_USERNAME}/repos`);

    res.json({
      profile: userRes.data,
      repositories: reposRes.data.map((repo) => ({
        name: repo.name,
        url: repo.html_url,
        description: repo.description,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
      })),
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch GitHub data", details: error.message });
  }
});

// 2️⃣ GET /api/github/:repoName → Get repo-specific data
router.get("/:repoName", async (req, res) => {
  const { repoName } = req.params;
  try {
    const repoRes = await githubAPI.get(
      `/repos/${GITHUB_USERNAME}/${repoName}`
    );
    res.json(repoRes.data);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to fetch repository data",
        details: error.message,
      });
  }
});

// 3️⃣ POST /api/github/:repoName/issues → Create issue
router.post("/:repoName/issues", async (req, res) => {
  const { repoName } = req.params;
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: "Title and body are required" });
  }

  try {
    const issueRes = await githubAPI.post(
      `/repos/${GITHUB_USERNAME}/${repoName}/issues`, 
      {
        title,
        body,
      }
    );

    res.status(201).json({
      message: "Issue created successfully",
      issue_url: issueRes.data.html_url,
    });
  } catch (error) {
    console.log(
      "issue in repo:",
      `${process.env.GITHUB_USERNAME}/${repoName}`
    );
    console.log("Using token:", process.env.GITHUB_TOKEN?.slice(0, 10) + "...");

    res
      .status(500)
      .json({ error: "Failed to create issue", details: error.response.data });
  }
});

module.exports = router;
