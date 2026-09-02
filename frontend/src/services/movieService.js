
import apiClient from "./apiClient";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

/* =========================================================
   NORMALIZATION
========================================================= */

const normalizeMovie = (movie = {}) => ({
  ...movie,

  id: movie.id,

  title: movie.title || movie.name || "Untitled",

  vote_average:
    movie.rating ??
    movie.vote_average ??
    0,

  release_date:
    movie.releaseDate ||
    movie.release_date ||
    movie.first_air_date ||
    "",

  poster_path:
    movie.poster_path ||
    (movie.posterUrl
      ? movie.posterUrl.replace(`${IMAGE_BASE_URL}/w500`, "")
      : null),

  backdrop_path:
    movie.backdrop_path ||
    (movie.backdropUrl
      ? movie.backdropUrl.replace(`${IMAGE_BASE_URL}/original`, "")
      : null),

  media_type:
    movie.media_type ||
    (movie.first_air_date ? "tv" : "movie"),
});

const normalizeList = (items = []) =>
  Array.isArray(items)
    ? items.map(normalizeMovie)
    : [];

/* =========================================================
   IMAGE HELPERS
========================================================= */

export const getPosterUrl = (posterPath) => {
  if (!posterPath) return null;

  if (
    posterPath.startsWith("http://") ||
    posterPath.startsWith("https://")
  ) {
    return posterPath;
  }

  return `${IMAGE_BASE_URL}/w500${posterPath}`;
};

export const getBackdropUrl = (backdropPath) => {
  if (!backdropPath) return null;

  if (
    backdropPath.startsWith("http://") ||
    backdropPath.startsWith("https://")
  ) {
    return backdropPath;
  }

  return `${IMAGE_BASE_URL}/original${backdropPath}`;
};

/* =========================================================
   MOVIES
========================================================= */

export async function getTrendingMovies() {
  const { data } = await apiClient.get(
    "/api/movies/trending"
  );

  return normalizeList(data);
}

export async function getPopularMovies() {
  const { data } = await apiClient.get(
    "/api/movies/popular"
  );

  return normalizeList(data);
}

export async function getMovieDetails(movieId) {
  const { data } = await apiClient.get(
    `/api/movies/${movieId}`
  );

  return normalizeMovie(data);
}

export async function getMovieVideos(movieId) {
  const { data } = await apiClient.get(
    `/api/movies/${movieId}/videos`
  );

  return data;
}

export async function getMovieRecommendations(movieId) {
  const { data } = await apiClient.get(
    `/api/movies/${movieId}/recommendations`
  );

  return normalizeList(data);
}

/* =========================================================
   SEARCH
========================================================= */

export async function searchMovies(query, page = 1) {
  const cleanQuery = query?.trim();

  if (!cleanQuery) {
    return {
      results: [],
      page: 1,
      totalPages: 0,
      totalResults: 0,
    };
  }

  const { data } = await apiClient.get(
    "/api/movies/search",
    {
      params: {
        q: cleanQuery,
        page,
      },
    }
  );

  /*
   * Backend may return a plain array.
   */
  if (Array.isArray(data)) {
    return {
      results: normalizeList(data),
      page,
      totalPages: data.length >= 20 ? page + 1 : page,
      totalResults: data.length,
    };
  }

  /*
   * Backend/TMDB paginated response.
   */
  return {
    results: normalizeList(
      data.results ||
      data.movies ||
      []
    ),

    page:
      data.page ||
      page,

    totalPages:
      data.totalPages ??
      data.total_pages ??
      data.totalPagesAvailable ??
      1,

    totalResults:
      data.totalResults ??
      data.total_results ??
      data.total ??
      0,
  };
}

/* =========================================================
   TV SERIES
========================================================= */

/**
 * Get a TV series' details.
 *
 * Backend expected:
 * GET /api/movies/tv/{tvId}
 */
export async function getTVDetails(tvId) {
  const { data } = await apiClient.get(
    `/api/movies/tv/${tvId}`
  );

  return data;
}

/**
 * Get a TV season.
 *
 * Backend expected:
 * GET /api/movies/tv/{tvId}/season/{seasonNumber}
 *
 * TMDB equivalent:
 * /tv/{series_id}/season/{season_number}
 */
export async function getTVSeasonDetails(
  tvId,
  seasonNumber
) {
  const { data } = await apiClient.get(
    `/api/movies/tv/${tvId}/season/${seasonNumber}`
  );

  return data;
}

/**
 * Get a single TV episode.
 *
 * Backend expected:
 * GET /api/movies/tv/{tvId}/season/{seasonNumber}/episode/{episodeNumber}
 *
 * TMDB equivalent:
 * /tv/{series_id}/season/{season_number}/episode/{episode_number}
 */
export async function getTVEpisodeDetails(
  tvId,
  seasonNumber,
  episodeNumber
) {
  const { data } = await apiClient.get(
    `/api/movies/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`
  );

  return data;
}

/**
 * Get videos for a TV episode.
 *
 * Backend expected:
 * GET /api/movies/tv/{tvId}/season/{seasonNumber}/episode/{episodeNumber}/videos
 */
export async function getTVEpisodeVideos(
  tvId,
  seasonNumber,
  episodeNumber
) {
  const { data } = await apiClient.get(
    `/api/movies/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}/videos`
  );

  return data;
}

/**
 * Get videos for a TV season.
 */
export async function getTVSeasonVideos(
  tvId,
  seasonNumber
) {
  const { data } = await apiClient.get(
    `/api/movies/tv/${tvId}/season/${seasonNumber}/videos`
  );

  return data;
}

/* =========================================================
   GENERIC MEDIA HELPERS
========================================================= */

export async function getMediaDetails(
  mediaType,
  id
) {
  if (mediaType === "tv") {
    return getTVDetails(id);
  }

  return getMovieDetails(id);
}

export async function getMediaRecommendations(
  mediaType,
  id
) {
  if (mediaType === "tv") {
    /*
     * If your backend later exposes TV recommendations,
     * this can be changed to that endpoint.
     */
    return [];
  }

  return getMovieRecommendations(id);
}

/* =========================================================
   BROWSE
========================================================= */

export async function getBrowseContent() {
  const [
    trending,
    popular,
  ] = await Promise.all([
    getTrendingMovies(),
    getPopularMovies(),
  ]);

  return {
    trending,
    popular,

    topRated: popular,

    movies: trending,

    tv: [],

    action: trending,

    comedy: popular,

    drama: trending,
  };
}
