const BASE_URL = "https://api.themoviedb.org/3";

const options = {
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
    accept: "application/json",
  },
};

export const getTrendingMovies = async () => {
  const response = await fetch(
    `${BASE_URL}/trending/movie/week?language=en-US`,
    options
  );

  if (!response.ok) {
    throw new Error("Failed to fetch trending movies");
  }

  const data = await response.json();

  return data.results;
};

export const getPosterUrl = (posterPath) => {
  if (!posterPath) return null;

  return `https://image.tmdb.org/t/p/w500${posterPath}`;
};

export const getBackdropUrl = (backdropPath) => {
  if (!backdropPath) return null;

  return `https://image.tmdb.org/t/p/original${backdropPath}`;
};