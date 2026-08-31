import apiClient from "./apiClient";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

const normalizeMovie = (movie = {}) => ({
  ...movie,
  title: movie.title || movie.name || "Untitled",
  vote_average: movie.rating ?? movie.vote_average ?? 0,
  release_date: movie.releaseDate || movie.release_date || "",
  poster_path: movie.poster_path || (movie.posterUrl ? movie.posterUrl.replace(`${IMAGE_BASE_URL}/w500`, "") : null),
  backdrop_path: movie.backdrop_path || (movie.backdropUrl ? movie.backdropUrl.replace(`${IMAGE_BASE_URL}/original`, "") : null),
  media_type: movie.media_type || "movie",
});

const normalizeList = (items = []) => items.map(normalizeMovie);

export const getPosterUrl = (posterPath) => {
  if (!posterPath) return null;
  if (posterPath.startsWith("http://") || posterPath.startsWith("https://")) return posterPath;
  return `${IMAGE_BASE_URL}/w500${posterPath}`;
};

export const getBackdropUrl = (backdropPath) => {
  if (!backdropPath) return null;
  if (backdropPath.startsWith("http://") || backdropPath.startsWith("https://")) return backdropPath;
  return `${IMAGE_BASE_URL}/original${backdropPath}`;
};

export async function getTrendingMovies() {
  const { data } = await apiClient.get("/api/movies/trending");
  return normalizeList(data);
}

export async function getPopularMovies() {
  const { data } = await apiClient.get("/api/movies/popular");
  return normalizeList(data);
}

export async function searchMovies(query) {
  const { data } = await apiClient.get("/api/movies/search", {
    params: { q: query },
  });
  return normalizeList(data);
}

export async function getMovieDetails(movieId) {
  const { data } = await apiClient.get(`/api/movies/${movieId}`);
  return normalizeMovie(data);
}

export async function getMovieVideos(movieId) {
  const { data } = await apiClient.get(`/api/movies/${movieId}/videos`);
  return data;
}

export async function getMovieRecommendations(movieId) {
  const { data } = await apiClient.get(`/api/movies/${movieId}/recommendations`);
  return normalizeList(data);
}

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

export async function getMediaDetails(mediaType, id) {
  if (mediaType && mediaType !== "movie") {
    throw new Error("Only movie playback is currently supported by the backend.");
  }
  return getMovieDetails(id);
}

export async function getMediaRecommendations(mediaType, id) {
  if (mediaType && mediaType !== "movie") {
    return [];
  }
  return getMovieRecommendations(id);
}
