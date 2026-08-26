const BASE_URL = "https://api.themoviedb.org/3";

const GATEWAY_URL =
  import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:8084";

const options = {
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
    accept: "application/json",
  },
};

/*
 * Converts Movie Service responses into the same structure
 * the existing STREAM frontend expects from TMDB.
 *
 * This lets us use the API Gateway without rewriting
 * Hero, Login, Who's Watching, etc.
 */
const normalizeGatewayMovie = (movie) => ({
  ...movie,

  poster_path:
    movie.poster_path ||
    movie.posterUrl ||
    null,

  backdrop_path:
    movie.backdrop_path ||
    movie.backdropUrl ||
    null,

  media_type:
    movie.media_type ||
    movie.mediaType ||
    "movie",

  // Keep the Movie Service fields as well.
  posterUrl:
    movie.posterUrl ||
    movie.poster_path ||
    null,

  backdropUrl:
    movie.backdropUrl ||
    movie.backdrop_path ||
    null,

  mediaType:
    movie.mediaType ||
    movie.media_type ||
    "movie",
});

/*
 * TRENDING MOVIES
 *
 * React
 *   ↓
 * API Gateway
 *   ↓
 * Movie Service
 *   ↓
 * TMDB
 */
export const getTrendingMovies = async () => {
  const response = await fetch(
    `${GATEWAY_URL}/api/movies/trending`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch trending movies through API Gateway: ${response.status}`
    );
  }

  const movies = await response.json();

  if (!Array.isArray(movies)) {
    return [];
  }

  return movies.map(normalizeGatewayMovie);
};

/*
 * MOVIE DETAILS
 *
 * Temporarily still uses TMDB directly until the
 * complete frontend is migrated to Movie Service.
 */
export const getMovieDetails = async (movieId) => {
  const response = await fetch(
    `${BASE_URL}/movie/${movieId}?language=en-US&append_to_response=credits,videos`,
    options
  );

  if (!response.ok) {
    throw new Error("Failed to fetch movie details");
  }

  return response.json();
};

/*
 * MOVIE RECOMMENDATIONS
 */
export const getMovieRecommendations = async (movieId) => {
  const response = await fetch(
    `${BASE_URL}/movie/${movieId}/recommendations?language=en-US&page=1`,
    options
  );

  if (!response.ok) {
    throw new Error("Failed to fetch recommendations");
  }

  const data = await response.json();

  return data.results || [];
};

/*
 * IMAGE HELPERS
 *
 * These support BOTH:
 *
 * /abc123.jpg
 *
 * and
 *
 * https://image.tmdb.org/t/p/original/abc123.jpg
 */
export const getPosterUrl = (posterPath) => {
  if (!posterPath) {
    return null;
  }

  if (
    posterPath.startsWith("http://") ||
    posterPath.startsWith("https://")
  ) {
    return posterPath;
  }

  return `https://image.tmdb.org/t/p/w500${posterPath}`;
};

export const getBackdropUrl = (backdropPath) => {
  if (!backdropPath) {
    return null;
  }

  if (
    backdropPath.startsWith("http://") ||
    backdropPath.startsWith("https://")
  ) {
    return backdropPath;
  }

  return `https://image.tmdb.org/t/p/original${backdropPath}`;
};

/*
 * GENERIC TMDB FETCH
 *
 * Temporarily retained for Browse categories that
 * Movie Service does not yet expose.
 */
const fetchResults = async (path) => {
  const response = await fetch(
    `${BASE_URL}${path}`,
    options
  );

  if (!response.ok) {
    throw new Error(
      `TMDB request failed: ${path}`
    );
  }

  const data = await response.json();

  return data.results || [];
};

const withMediaType = (items, mediaType) =>
  items.map((item) => ({
    ...item,
    media_type:
      item.media_type || mediaType,
  }));

/*
 * BROWSE CONTENT
 *
 * These remain direct TMDB requests temporarily.
 * This protects the existing Browse page while
 * Gateway integration is introduced gradually.
 */
export const getBrowseContent = async () => {
  const requests = [
    [
      "trending",
      "/trending/all/week?language=en-US",
      null,
    ],

    [
      "popular",
      "/movie/popular?language=en-US&page=1",
      "movie",
    ],

    [
      "topRated",
      "/movie/top_rated?language=en-US&page=1",
      "movie",
    ],

    [
      "movies",
      "/movie/now_playing?language=en-US&page=1",
      "movie",
    ],

    [
      "tv",
      "/tv/popular?language=en-US&page=1",
      "tv",
    ],

    [
      "action",
      "/discover/movie?language=en-US&sort_by=popularity.desc&with_genres=28",
      "movie",
    ],

    [
      "comedy",
      "/discover/movie?language=en-US&sort_by=popularity.desc&with_genres=35",
      "movie",
    ],

    [
      "drama",
      "/discover/movie?language=en-US&sort_by=popularity.desc&with_genres=18",
      "movie",
    ],
  ];

  const settled = await Promise.allSettled(
    requests.map(([, path]) =>
      fetchResults(path)
    )
  );

  return requests.reduce(
    (
      content,
      [key, , mediaType],
      index
    ) => {
      if (
        settled[index].status ===
        "fulfilled"
      ) {
        content[key] = withMediaType(
          settled[index].value,
          mediaType
        ).filter(
          (item) =>
            item.backdrop_path ||
            item.poster_path
        );
      } else {
        content[key] = [];
      }

      return content;
    },
    {}
  );
};

/*
 * MOVIE / TV DETAILS
 */
export const getMediaDetails = async (
  mediaType,
  id
) => {
  const type =
    mediaType === "tv"
      ? "tv"
      : "movie";

  const response = await fetch(
    `${BASE_URL}/${type}/${id}?language=en-US&append_to_response=credits,videos`,
    options
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch title details"
    );
  }

  const data = await response.json();

  return {
    ...data,
    media_type: type,
  };
};

/*
 * MOVIE / TV RECOMMENDATIONS
 */
export const getMediaRecommendations = async (
  mediaType,
  id
) => {
  const type =
    mediaType === "tv"
      ? "tv"
      : "movie";

  const results = await fetchResults(
    `/${type}/${id}/recommendations?language=en-US&page=1`
  );

  return withMediaType(
    results,
    type
  );
};