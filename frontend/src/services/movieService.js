import apiClient from "./apiClient";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

/* =========================================================
   NORMALIZATION
========================================================= */

const normalizeMovie = (movie = {}) => {

  const mediaType =
    movie.mediaType ||
    movie.media_type ||
    (
      movie.first_air_date ||
      movie.firstAirDate ||
      (
        movie.name &&
        !movie.title
      )
        ? "tv"
        : "movie"
    );

  return {
    ...movie,

    title:
      movie.title ||
      movie.name ||
      "Untitled",

    name:
      movie.name ||
      movie.title ||
      "Untitled",

    vote_average:
      movie.rating ??
      movie.vote_average ??
      0,

    release_date:
      movie.releaseDate ||
      movie.release_date ||
      "",

    first_air_date:
      movie.firstAirDate ||
      movie.first_air_date ||
      "",

    poster_path:
      movie.poster_path ||
      movie.posterPath ||
      (
        movie.posterUrl
          ? movie.posterUrl.replace(
              `${IMAGE_BASE_URL}/w500`,
              ""
            )
          : null
      ),

    backdrop_path:
      movie.backdrop_path ||
      movie.backdropPath ||
      (
        movie.backdropUrl
          ? movie.backdropUrl.replace(
              `${IMAGE_BASE_URL}/original`,
              ""
            )
          : null
      ),

    media_type:
      mediaType,
  };
};

const normalizeList = (
  items = []
) => {

  return items.map(
    normalizeMovie
  );
};

/* =========================================================
   IMAGES
========================================================= */

export const getPosterUrl = (
  posterPath
) => {

  if (!posterPath) {
    return null;
  }

  if (
    posterPath.startsWith(
      "http://"
    ) ||
    posterPath.startsWith(
      "https://"
    )
  ) {

    return posterPath;
  }

  return `${IMAGE_BASE_URL}/w500${posterPath}`;
};

export const getBackdropUrl = (
  backdropPath
) => {

  if (!backdropPath) {
    return null;
  }

  if (
    backdropPath.startsWith(
      "http://"
    ) ||
    backdropPath.startsWith(
      "https://"
    )
  ) {

    return backdropPath;
  }

  return `${IMAGE_BASE_URL}/original${backdropPath}`;
};

/* =========================================================
   MOVIES
========================================================= */

export async function getTrendingMovies() {

  const { data } =
    await apiClient.get(
      "/api/movies/trending"
    );

  return normalizeList(data);
}

export async function getPopularMovies() {

  const { data } =
    await apiClient.get(
      "/api/movies/popular"
    );

  return normalizeList(data);
}

/* =========================================================
   TV
========================================================= */

export async function getPopularTVShows() {

  const { data } =
    await apiClient.get(
      "/api/movies/tv/popular"
    );

  return normalizeList(data);
}

/* =========================================================
   SEARCH
========================================================= */

/*
 * type:
 *
 * all
 * movie
 * tv
 *
 * Backend returns:
 *
 * {
 *   results: [],
 *   page: 1,
 *   totalPages: 20,
 *   totalResults: 1000
 * }
 */

export async function searchMovies(
  query,
  page = 1,
  type = "all"
) {

  if (!query?.trim()) {

    return {
      results: [],
      page: 1,
      total_pages: 0,
      total_results: 0,
    };
  }

  const { data } =
    await apiClient.get(
      "/api/movies/search",
      {
        params: {
          q: query.trim(),
          page,
          type,
        },
      }
    );

  return {
    ...data,

    results:
      normalizeList(
        data?.results || []
      ),

    page:
      data?.page ??
      page,

    total_pages:
      data?.totalPages ??
      data?.total_pages ??
      0,

    total_results:
      data?.totalResults ??
      data?.total_results ??
      0,
  };
}

/* =========================================================
   MOVIE DETAILS
========================================================= */

export async function getMovieDetails(
  movieId
) {

  const { data } =
    await apiClient.get(
      `/api/movies/${movieId}`
    );

  return normalizeMovie(data);
}

export async function getMovieVideos(
  movieId
) {

  const { data } =
    await apiClient.get(
      `/api/movies/${movieId}/videos`
    );

  return data;
}

export async function getMovieRecommendations(
  movieId
) {

  const { data } =
    await apiClient.get(
      `/api/movies/${movieId}/recommendations`
    );

  return normalizeList(data);
}

/* =========================================================
   TV DETAILS
========================================================= */

export async function getTVDetails(
  tvId
) {

  const { data } =
    await apiClient.get(
      `/api/movies/tv/${tvId}`
    );

  return {
    ...normalizeMovie({
      ...data,
      media_type: "tv",
    }),

    media_type: "tv",

    seasons:
      data.seasons ||
      [],

    number_of_seasons:
      data.number_of_seasons ||
      0,

    number_of_episodes:
      data.number_of_episodes ||
      0,

    credits:
      data.credits ||
      {},

    videos:
      data.videos ||
      {},

    recommendations:
      data.recommendations ||
      [],
  };
}

/* =========================================================
   TV SEASON
========================================================= */

export async function getTVSeasonDetails(
  tvId,
  seasonNumber
) {

  const { data } =
    await apiClient.get(
      `/api/movies/tv/${tvId}/season/${seasonNumber}`
    );

  return data;
}

/* =========================================================
   TV EPISODE
========================================================= */

export async function getTVEpisodeDetails(
  tvId,
  seasonNumber,
  episodeNumber
) {

  const { data } =
    await apiClient.get(
      `/api/movies/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`
    );

  return data;
}

/* =========================================================
   TV RECOMMENDATIONS
========================================================= */

export async function getTVRecommendations(
  tvId
) {

  const { data } =
    await apiClient.get(
      `/api/movies/tv/${tvId}/recommendations`
    );

  return normalizeList(data || []);
}

/* =========================================================
   BROWSE
========================================================= */

export async function getBrowseContent() {

  const [
    trending,
    popular,
    tv,
  ] = await Promise.all([

    getTrendingMovies(),

    getPopularMovies(),

    getPopularTVShows(),
  ]);

  return {

    trending,

    popular,

    topRated:
      popular,

    movies:
      popular,

    tv,

    action:
      trending,

    comedy:
      popular,

    drama:
      trending,
  };
}

/* =========================================================
   UNIVERSAL DETAILS
========================================================= */

export async function getMediaDetails(
  mediaType,
  id
) {

  if (
    mediaType === "tv"
  ) {

    return getTVDetails(id);
  }

  return getMovieDetails(id);
}

/* =========================================================
   UNIVERSAL RECOMMENDATIONS
========================================================= */

export async function getMediaRecommendations(
  mediaType,
  id
) {

  if (
    mediaType === "tv"
  ) {

    return getTVRecommendations(id);
  }

  return getMovieRecommendations(id);
}
