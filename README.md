# Letterboxd Compare API

A simple API to compare Letterboxd profiles.

## Endpoints

### GET /profile/:username

Returns a profile object with the following properties:

- `username`: The username of the profile.
- `displayName`: The display name of the profile.
- `avatar`: The avatar URL of the profile.
- `moviesStat`: The number of movies in the profile's film log.

### GET /movies/:username

Returns an array of movie objects with the following properties:

- `title`: The title of the movie.
- `slug`: The slug of the movie.
- `rate`: The rating of the movie (out of 5).
- `rateStars`: The rating of the movie in stars (e.g. "4.5").
- `liked`: A boolean indicating whether the movie has been liked or not.

### GET /watchlist/:username

Returns an array of movie objects with the same properties as the `/movies/:username` endpoint.

## Running the API

The API is written in Node.js and uses Express as its web framework.

To run the API, clone this repository and run `npm install` to install the dependencies. Then, run `npm start` to start the API.

The API listens on port 3000 by default. To change the port, set the `PORT` environment variable.
