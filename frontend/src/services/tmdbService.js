import { moviesApiUrl } from "./api";

const normalizeGatewayMovie = (movie) => {
  if (!movie || typeof movie !== "object") {
    return null;
  }

  return {
    ...movie,
    poster_path: movie.poster_path || movie.posterUrl || null,
    backdrop_path: movie.backdrop_path || movie.backdropUrl || null,
    media_type: movie.media_type || movie.mediaType || "movie",
    posterUrl: movie.posterUrl || movie.poster_path || null,
    backdropUrl: movie.backdropUrl || movie.backdrop_path || null,
    mediaType: movie.mediaType || movie.media_type || "movie",
  };
};

const normalizeMovies = (data) => {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(normalizeGatewayMovie).filter(Boolean);
};

const gatewayGet = async (path) => {
  const response = await fetch(moviesApiUrl(path));

  if (!response.ok) {
    let message = `STREAM API request failed: ${response.status}`;

    try {
      const errorData = await response.json();

      if (errorData?.message) {
        message = `STREAM API request failed: ${errorData.message}`;
      }
    } catch {
      // Ignore invalid/non-JSON error responses.
    }

    throw new Error(message);
  }

  return response.json();
};

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

  const cleanPath = posterPath.startsWith("/")
    ? posterPath
    : `/${posterPath}`;

  return `https://image.tmdb.org/t/p/w500${cleanPath}`;
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

  const cleanPath = backdropPath.startsWith("/")
    ? backdropPath
    : `/${backdropPath}`;

  return `https://image.tmdb.org/t/p/original${cleanPath}`;
};

export const getTrendingMovies = async () => {
  const data = await gatewayGet("/trending");
  return normalizeMovies(data);
};

export const getPopularMovies = async () => {
  const data = await gatewayGet("/popular");
  return normalizeMovies(data);
};

export const getPopularTv = async () => {
  const data = await gatewayGet("/tv/popular");
  return normalizeMovies(data);
};

export const getMovieDetails = async (movieId) => {
  if (!movieId) {
    throw new Error("Movie ID is required.");
  }

  const data = await gatewayGet(`/${movieId}`);

  return {
    ...normalizeGatewayMovie(data),
    media_type: "movie",
    mediaType: "movie",
  };
};

export const getMovieRecommendations = async (movieId) => {
  if (!movieId) {
    return [];
  }

  const data = await gatewayGet(`/${movieId}/recommendations`);

  return normalizeMovies(data).map((movie) => ({
    ...movie,
    media_type: movie.media_type || "movie",
    mediaType: movie.mediaType || "movie",
  }));
};

export const getMediaDetails = async (mediaType, id) => {
  if (!id) {
    throw new Error("Media ID is required.");
  }

  const type = mediaType === "tv" ? "tv" : "movie";
  const endpoint = type === "tv" ? `/tv/${id}` : `/${id}`;
  const data = await gatewayGet(endpoint);

  return {
    ...normalizeGatewayMovie(data),
    media_type: type,
    mediaType: type,
  };
};

export const getMediaRecommendations = async (mediaType, id) => {
  if (!id) {
    return [];
  }

  const type = mediaType === "tv" ? "tv" : "movie";

  if (type === "movie") {
    const data = await gatewayGet(`/${id}/recommendations`);
    return normalizeMovies(data);
  }

  const tvDetails = await gatewayGet(`/tv/${id}`);
  return normalizeMovies(tvDetails?.recommendations).map((item) => ({
    ...item,
    media_type: item.media_type || "tv",
    mediaType: item.mediaType || "tv",
  }));
};

export const getBrowseContent = async () => {
  const data = await gatewayGet("/catalog");

  if (!data || typeof data !== "object") {
    return {};
  }

  const normalized = {};

  Object.entries(data).forEach(([key, value]) => {
    normalized[key] = Array.isArray(value)
      ? normalizeMovies(value)
      : value;
  });

  return normalized;
};

export const searchMovies = async (query, page = 1) => {
  if (!query?.trim()) {
    return [];
  }

  const params = new URLSearchParams({
    q: query.trim(),
    page: String(page),
    type: "movie",
  });

  const data = await gatewayGet(`/search?${params.toString()}`);

  if (data && Array.isArray(data.results)) {
    return normalizeMovies(data.results);
  }

  return normalizeMovies(data);
};

export const searchTvShows = async (query, page = 1) => {
  if (!query?.trim()) {
    return [];
  }

  const params = new URLSearchParams({
    q: query.trim(),
    page: String(page),
    type: "tv",
  });

  const data = await gatewayGet(`/search?${params.toString()}`);

  if (data && Array.isArray(data.results)) {
    return normalizeMovies(data.results).map((item) => ({
      ...item,
      media_type: "tv",
      mediaType: "tv",
    }));
  }

  return normalizeMovies(data).map((item) => ({
    ...item,
    media_type: "tv",
    mediaType: "tv",
  }));
};

export const searchAllMedia = async (query, page = 1) => {
  if (!query?.trim()) {
    return [];
  }

  const params = new URLSearchParams({
    q: query.trim(),
    page: String(page),
    type: "all",
  });

  const data = await gatewayGet(`/search?${params.toString()}`);

  if (data && Array.isArray(data.results)) {
    return normalizeMovies(data.results);
  }

  return normalizeMovies(data);
};

export const getTvSeason = async (id, seasonNumber) => {
  if (!id || !seasonNumber) {
    throw new Error("TV season details require a title ID and season number.");
  }

  return gatewayGet(`/tv/${id}/season/${seasonNumber}`);
};

export const getTvEpisode = async (id, seasonNumber, episodeNumber) => {
  if (!id || !seasonNumber || !episodeNumber) {
    throw new Error(
      "TV episode details require a title ID, season number, and episode number.",
    );
  }

  return gatewayGet(`/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}`);
};

export const getMovieVideos = async (id) => {
  if (!id) {
    throw new Error("Movie playback requires a title ID.");
  }

  return gatewayGet(`/${id}/videos`);
};
