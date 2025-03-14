const express = require("express");
const cors = require("cors");
const {
  getProfile,
  getMovies,
  getWatchlist,
  getMovie,
} = require("./controllers");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/profile/:username", getProfile);
app.get("/movies/:username", getMovies);
app.get("/watchlist/:username", getWatchlist);
app.get("/movie/:slug", getMovie);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});
