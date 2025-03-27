const cheerio = require("cheerio");

const baseUrl = "https://letterboxd.com/";

const fetchMoviesFromPage = async (url, pageNo) => {
  try {
    const res = await fetch(`${url}/page/${pageNo}/`);
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
    console.log("ERROR: ", error);
    throw error;
  }
};

const fetchReviewsFromPage = async (url, pageNo) => {
  try {
    const res = await fetch(`${url}/page/${pageNo}/`);
    const html = await res.text();
    const $ = cheerio.load(html);
    const reviewsEachPage = [];

    $("li.viewing-poster-container").each(async (idx, element) => {
      const movie_title = $(element)
        .find(".film-detail-content > h2 > a")
        .text()
        .trim();
      const movie_slug = $(element).find("div").attr("data-film-slug").trim();

      const releaseYear = $(element)
        .find(".film-detail-content > h2 > small > a")
        .text()
        .trim();

      const rate =
        $(element)
          .find(".rating")
          .attr("class")
          ?.split(" ")
          .at(-1)
          .split("-")[1] / 2;

      const watchedDate = $(element).find("._nobr").text().trim();

      const review = $(element).find(".js-review-body").text().trim();

      const liked =
        $(element).find(".attribution").children(".icon-liked").length > 0;

      let rateStars = $(element).find(".rating").text().trim();
      rateStars = rateStars.length > 0 ? rateStars : null;

      reviewsEachPage.push({
        movie_title,
        movie_slug,
        watchedDate,
        liked,
        releaseYear,
        rate,
        rateStars,
        review,
      });
    });

    return reviewsEachPage;
  } catch (error) {
    console.log("ERROR: ", error);
    throw error;
  }
};

const fetchTotalPages = async (url) => {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);
    const totalPages = parseInt($("li.paginate-page:last").text().trim());
    return totalPages || 1;
  } catch (error) {
    console.log("ERROR: ", error);
    throw error;
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    console.log("Getting profile of:", username);
    const response = await fetch(`${baseUrl}${username}/`);
    const html = await response.text();
    const $ = cheerio.load(html);
    const displayName = $("h1.person-display-name").text().trim();
    const avatar = $(".profile-avatar > span > img").attr("src").trim();
    const moviesCount = parseInt(
      $(".profile-statistic > a > .value")
        .first()
        .text()
        .trim()
        .replace(/,/g, "")
    );
    const profile = { username, displayName, avatar, moviesCount };
    res.status(200).json({ status: "success", data: profile });
  } catch (err) {
    console.log("ERROR: ", err);
    res.status(400).json({ status: "fail", message: err });
  }
};

exports.getMovies = async (req, res) => {
  try {
    const { username } = req.params;
    const url = `${baseUrl}${username}/films/`;
    const totalPages = await fetchTotalPages(url);

    const pagePromises = [];
    for (let page = 1; page <= totalPages; page++) {
      pagePromises.push(fetchMoviesFromPage(url, page));
    }

    const movies = (await Promise.all(pagePromises)).flat();

    res
      .status(200)
      .json({ status: "success", results: movies.length, data: movies });
  } catch (err) {
    console.log("ERROR: ", err);
    res.status(400).json({ status: "fail", message: err });
  }
};

exports.getWatchlist = async (req, res) => {
  try {
    const { username } = req.params;
    const url = `${baseUrl}${username}/watchlist/`;
    const totalPages = await fetchTotalPages(url);

    const pagePromises = [];
    for (let page = 1; page <= totalPages; page++) {
      pagePromises.push(fetchMoviesFromPage(url, page));
    }

    const watchlist = (await Promise.all(pagePromises)).flat();

    res
      .status(200)
      .json({ status: "success", results: watchlist.length, data: watchlist });
  } catch (err) {
    console.log("ERROR: ", err);
    res.status(400).json({ status: "fail", message: err });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { username } = req.params;
    const url = `${baseUrl}${username}/films/reviews/`;
    const totalPages = await fetchTotalPages(url);
    const pagePromises = [];
    for (let page = 1; page <= totalPages; page++) {
      pagePromises.push(fetchReviewsFromPage(url, page));
    }
    const reviews = (await Promise.all(pagePromises)).flat();

    res
      .status(200)
      .json({ status: "success", results: reviews.length, data: reviews });
  } catch (err) {
    console.log("ERROR: ", err);
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
    console.log("ERROR: ", err);
    res.status(400).json({ status: "fail", message: err });
  }
};

exports.getStatus = (req, res) => {
  res.status(200).json({ status: "success", message: "API is running" });
};
