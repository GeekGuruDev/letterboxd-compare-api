const express = require("express");
const cors = require("cors");
const {
  getProfile,
  getMovies,
  getWatchlist,
  getMovie,
} = require("./controllers");
const app = express();

app.use(cors());

app.get("/profile/:username", getProfile);
app.get("/movies/:username", getMovies);
app.get("/watchlist/:username", getWatchlist);
app.get("/movie/:slug", getMovie);

app.listen(3000, () => {
  console.log("Server running on port 3000...");
});
