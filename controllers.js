const cheerio = require("cheerio");

const baseUrl = "https://letterboxd.com/";

const fetchMoviesFromPage = async (username, pageNo, type = "films") => {
  try {
    const res = await fetch(`${baseUrl}${username}/${type}/page/${pageNo}/`);
    const html = await res.text();
    const $ = cheerio.load(html);
    const moviesEachPage = [];

    $("li.poster-container").each(async (idx, element) => {
      const title = $(element).find("div > img").attr("alt").trim();
      const slug = $(element).find("div").attr("data-film-slug").trim();

      const rate =
        $(element)
          .find(".rating")
          .attr("class")
          ?.split(" ")
          .at(-1)
          .split("-")[1] / 2;

      let rateStars = $(element).find(".rating").text().trim();
      rateStars = rateStars.length > 0 ? rateStars : null;

      const liked =
        $(element).find(".poster-viewingdata").children(".like").length > 0;

      moviesEachPage.push({ title, slug, rate, rateStars, liked });
    });

    return moviesEachPage;
  } catch (error) {
    throw error;
  }
};

const fetchTotalPages = async (username, type = "films") => {
  try {
    const res = await fetch(`${baseUrl}${username}/${type}/`);
    const html = await res.text();
    const $ = cheerio.load(html);
    const totalPages = parseInt($("li.paginate-page:last").text().trim());
    return totalPages || 1;
  } catch (error) {
    throw error;
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const response = await fetch(`${baseUrl}${username}/`);
    const html = await response.text();
    const $ = cheerio.load(html);
    const displayName = $("h1.person-display-name").text().trim();
    const avatar = $(".profile-avatar > span > img").attr("src").trim();
    const moviesStat = parseInt(
      $(".profile-statistic > a > .value")
        .first()
        .text()
        .trim()
        .replace(/,/g, "")
    );
    const profile = { username, displayName, avatar, moviesStat };
    res.status(200).json({ status: "success", data: profile });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};

exports.getMovies = async (req, res) => {
  try {
    const { username } = req.params;
    const totalPages = await fetchTotalPages(username);
    const pagePromises = [];

    for (let page = 1; page <= totalPages; page++) {
      pagePromises.push(fetchMoviesFromPage(username, page));
    }

    const movies = (await Promise.all(pagePromises)).flat();

    res
      .status(200)
      .json({ status: "success", results: movies.length, data: movies });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};

exports.getWatchlist = async (req, res) => {
  try {
    const { username } = req.params;
    const totalPages = await fetchTotalPages(username, "watchlist");
    const pagePromises = [];

    for (let page = 1; page <= totalPages; page++) {
      pagePromises.push(fetchMoviesFromPage(username, page, "watchlist"));
    }

    const watchlist = (await Promise.all(pagePromises)).flat();

    res
      .status(200)
      .json({ status: "success", results: watchlist.length, data: watchlist });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};

exports.getMovie = async (req, res) => {
  try {
    const { slug } = req.params;
    const res1 = await fetch(`${baseUrl}ajax/poster/film/${slug}/std/70x105/`);
    // const [res1, res2] = await Promise.all([
    //   fetch(`${baseUrl}ajax/poster/film/${slug}/std/70x105/`),
    //   fetch(`${baseUrl}film/${slug}/`),
    // ]);
    const html1 = await res1.text();
    // const html2 = await res2.text();
    const $1 = cheerio.load(html1);
    // const $2 = cheerio.load(html2);
    const title = $1(".frame").attr("title").trim();
    // const releaseYear = $2(".releaseyear > a").text().trim();
    const poster = $1("img").first().attr("src").split(" ")[0].trim();
    const movie = {
      title,
      poster,
      // releaseYear,
    };
    res.status(200).json({ status: "success", data: movie });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};
