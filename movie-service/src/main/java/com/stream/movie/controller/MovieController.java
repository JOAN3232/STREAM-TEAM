import apiClient from "./apiClient";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN;

const tmdbHeaders = {
  accept: "application/json",
  Authorization: `Bearer ${TMDB_TOKEN}`,
};

const normalizeMovie = (movie = {}) => ({
  ...movie,

  title: movie.title || movie.name || "Untitled",

  name: movie.name || movie.title || "Untitled",

  vote_average: movie.rating ?? movie.vote_average ?? 0,

  release_date:
    movie.releaseDate ||
    movie.release_date ||
    "",

  first_air_date:
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
    (movie.first_air_date || movie.name ? "tv" : "movie"),
});

const normalizeList = (items = []) =>
  items.map(normalizeMovie);

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

/* =========================================================
   SEARCH
   Searches both MOVIES + TV directly through TMDB.
========================================================= */

export async function searchMovies(
  query,
  page = 1
) {
  if (!query?.trim()) {
    return {
      results: [],
      page: 1,
      total_pages: 0,
      total_results: 0,
    };
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/search/multi?query=${encodeURIComponent(
      query.trim()
    )}&include_adult=false&language=en-US&page=${page}`,
    {
      headers: tmdbHeaders,
    }
  );

  if (!response.ok) {
    throw new Error(
      `TMDB search failed: ${response.status}`
    );
  }

  const data = await response.json();

  const filtered = (data.results || []).filter(
    (item) =>
      item.media_type === "movie" ||
      item.media_type === "tv"
  );

  return {
    ...data,
    results: normalizeList(filtered),
  };
}

/* =========================================================
   MOVIE DETAILS
========================================================= */

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
   TV DETAILS
========================================================= */

export async function getTVDetails(tvId) {
  const response = await fetch(
    `${TMDB_BASE_URL}/tv/${tvId}?language=en-US&append_to_response=credits,videos,recommendations`,
    {
      headers: tmdbHeaders,
    }
  );

  if (!response.ok) {
    throw new Error(
      `TMDB TV details failed: ${response.status}`
    );
  }

  const data = await response.json();

  return {
    ...normalizeMovie({
      ...data,
      media_type: "tv",
    }),

    media_type: "tv",

    seasons: data.seasons || [],

    number_of_seasons:
      data.number_of_seasons || 0,

    number_of_episodes:
      data.number_of_episodes || 0,

    credits: data.credits || {},

    videos: data.videos || {},

    recommendations:
      data.recommendations?.results || [],
  };
}

/* =========================================================
   TV SEASON DETAILS
========================================================= */

export async function getTVSeasonDetails(
  tvId,
  seasonNumber
) {
  const response = await fetch(
    `${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}?language=en-US`,
    {
      headers: tmdbHeaders,
    }
  );

  if (!response.ok) {
    throw new Error(
      `TMDB season request failed: ${response.status}`
    );
  }

  return response.json();
}

/* =========================================================
   TV EPISODE DETAILS
========================================================= */

export async function getTVEpisodeDetails(
  tvId,
  seasonNumber,
  episodeNumber
) {
  const response = await fetch(
    `${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}?language=en-US`,
    {
      headers: tmdbHeaders,
    }
  );

  if (!response.ok) {
    throw new Error(
      `TMDB episode request failed: ${response.status}`
    );
  }

  return response.json();
}

/* =========================================================
   TV RECOMMENDATIONS
========================================================= */

export async function getTVRecommendations(tvId) {
  const response = await fetch(
    `${TMDB_BASE_URL}/tv/${tvId}/recommendations?language=en-US&page=1`,
    {
      headers: tmdbHeaders,
    }
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();

  return normalizeList(data.results || []);
}

/* =========================================================
   BROWSE
========================================================= */

export async function getBrowseContent() {
  const [trending, popular] = await Promise.all([
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

/* =========================================================
   UNIVERSAL DETAILS
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

/* =========================================================
   UNIVERSAL RECOMMENDATIONS
========================================================= */

export async function getMediaRecommendations(
  mediaType,
  id
) {
  if (mediaType === "tv") {
    return getTVRecommendations(id);
  }

  return getMovieRecommendations(id);
}
