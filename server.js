// server.js (or app.js)
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const chatRoute = require("./routes/chatRoute");
const spotifyRoutes = require("./routes/spotify/spotifyRoute");



dotenv.config();

const app = express();
// app.use(cors({
//   origin: "https://praneethalluri.github.io",
//   credentials: true,
// }));

app.use(cors());
app.use(express.json());

app.use("/api", chatRoute); // 💬 Bot routerr
app.use("/api/spotify", spotifyRoutes); 


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
