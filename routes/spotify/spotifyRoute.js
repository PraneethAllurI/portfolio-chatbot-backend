const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();



router.get("/login", (req, res) => {
    const scopes = "user-read-playback-state user-modify-playback-state user-read-currently-playing user-top-read streaming";
    const redirect = `https://accounts.spotify.com/authorize?client_id=https://portfolio-chatbot-backend-wj84.onrender.com/api/spotify/callback&response_type=code&redirect_uri=${process.env.REDIRECT_URI}&scope=${encodeURIComponent(scopes)}`;
    res.redirect(redirect);
    console.log("redirected successfully", redirect)
  });
  
  // 🔁 2. Callback to get access + refresh tokens
  router.get("/callback", async (req, res) => {
    const code = req.query.code;
    console.log("👉 Received callback from Spotify");
    console.log("🔑 Authorization Code:", code);
  
    if (!code) {
      return res.status(400).json({ error: "Authorization code missing" });
    }
  
    try {
      const response = await axios.post("https://accounts.spotify.com/api/token", new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: "https://portfolio-chatbot-backend-wj84.onrender.com/api/spotify/callback",
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      }), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
  
      console.log("✅ Access Token Response:", response.data);
  
      res.json({
        access_token,
        refresh_token,
        expires_in,
      });
    } catch (err) {
      console.error("❌ Token exchange error:", err.response?.data || err.message);
      res.status(500).json({ error: "Failed to fetch access token", err : err.response?.data });
    }
  });
  

  //get top 10 tracks

  router.get("/top-tracks", async (req, res) => {
    const access_token = req.headers.authorization?.split(" ")[1]; // Expecting Bearer token
  
    if (!access_token) {
      return res.status(400).json({ error: "Access token required in Authorization header" });
    }
  
    try {
      const response = await axios.get("https://api.spotify.com/v1/me/top/tracks?limit=10", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
  
      const tracks = response.data.items.map(track => ({
        name: track.name,
        id: track.id,
        uri: track.uri,
        artists: track.artists.map(artist => artist.name).join(", "),
        album: track.album.name,
      }));
  
      res.json({ tracks });
    } catch (err) {
      console.error(err.response?.data || err.message);
      res.status(500).json({ error: "Failed to fetch top tracks" });
    }
  });

  //get currently playing song
  
  router.get("/now-playing", async (req, res) => {
    const access_token = req.headers.authorization?.split(" ")[1];
  
    if (!access_token) {
      return res.status(400).json({ error: "Access token required" });
    }
  
    try {
      const response = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
  
      if (response.status === 204 || !response.data) {
        return res.json({ message: "No song is currently playing" });
      }
  
      const data = response.data;
      res.json({
        name: data.item.name,
        id: data.item.id,
        uri: data.item.uri,
        is_playing: data.is_playing,
        artists: data.item.artists.map(a => a.name).join(", "),
      });
    } catch (err) {
      console.error(err.response?.data || err.message);
      res.status(500).json({ error: "Failed to fetch now playing" });
    }
  });

  //play a specific track

  router.put("/play/:trackId", async (req, res) => {
    const access_token = req.headers.authorization?.split(" ")[1];
    const { trackId } = req.params;
  
    if (!access_token) return res.status(400).json({ error: "Access token required" });
  
    try {
      await axios.put("https://api.spotify.com/v1/me/player/play", {
        uris: [`spotify:track:${trackId}`],
      }, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      });
  
      res.json({ message: `Track ${trackId} is now playing` });
    } catch (err) {
      console.error(err.response?.data || err.message);
      res.status(500).json({ error: "Failed to start playback" });
    }
  });

  //pause current song 
  router.put("/stop", async (req, res) => {
    const access_token = req.headers.authorization?.split(" ")[1];
  
    if (!access_token) return res.status(400).json({ error: "Access token required" });
  
    try {
      await axios.put("https://api.spotify.com/v1/me/player/pause", {}, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
  
      res.json({ message: "Playback paused" });
    } catch (err) {
      console.error(err.response?.data || err.message);
      res.status(500).json({ error: "Failed to pause playback" });
    }
  });
  
  
  
  
  module.exports = router;
