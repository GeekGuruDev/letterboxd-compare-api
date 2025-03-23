const express = require("express");
const cors = require("cors");
const {
  getProfile,
  getMovies,
  getWatchlist,
  getMovie,
  getStatus,
} = require("./controllers");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.get("/profile/:username", getProfile);
app.get("/movies/:username", getMovies);
app.get("/watchlist/:username", getWatchlist);
app.get("/movie/:slug", getMovie);
app.get("/status", getStatus);

setInterval(async () => {
  const res = await fetch("https://letterboxd-compare-api.onrender.com/status");
  const data = await res.json();
  console.log(data.status, ":", data.message);
}, 10 * 60 * 1000);

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
