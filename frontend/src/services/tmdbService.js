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

export const getMovieRecommendations = async (movieId) => {
  const response = await fetch(
    `${BASE_URL}/movie/${movieId}/recommendations?language=en-US&page=1`,
    options
  );

  if (!response.ok) {
    throw new Error("Failed to fetch recommendations");
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

const fetchResults = async (path) => {
  const response = await fetch(`${BASE_URL}${path}`, options);
  if (!response.ok) throw new Error(`TMDB request failed: ${path}`);
  const data = await response.json();
  return data.results || [];
};

const withMediaType = (items, mediaType) =>
  items.map((item) => ({ ...item, media_type: item.media_type || mediaType }));

export const getBrowseContent = async () => {
  const requests = [
    ["trending", "/trending/all/week?language=en-US", null],
    ["popular", "/movie/popular?language=en-US&page=1", "movie"],
    ["topRated", "/movie/top_rated?language=en-US&page=1", "movie"],
    ["movies", "/movie/now_playing?language=en-US&page=1", "movie"],
    ["tv", "/tv/popular?language=en-US&page=1", "tv"],
    ["action", "/discover/movie?language=en-US&sort_by=popularity.desc&with_genres=28", "movie"],
    ["comedy", "/discover/movie?language=en-US&sort_by=popularity.desc&with_genres=35", "movie"],
    ["drama", "/discover/movie?language=en-US&sort_by=popularity.desc&with_genres=18", "movie"],
  ];
  const settled = await Promise.allSettled(requests.map(([, path]) => fetchResults(path)));
  return requests.reduce((content, [key, , mediaType], index) => {
    content[key] = settled[index].status === "fulfilled"
      ? withMediaType(settled[index].value, mediaType).filter((item) => item.backdrop_path || item.poster_path)
      : [];
    return content;
  }, {});
};

export const getMediaDetails = async (mediaType, id) => {
  const type = mediaType === "tv" ? "tv" : "movie";
  const response = await fetch(`${BASE_URL}/${type}/${id}?language=en-US&append_to_response=credits,videos`, options);
  if (!response.ok) throw new Error("Failed to fetch title details");
  return { ...(await response.json()), media_type: type };
};

export const getMediaRecommendations = async (mediaType, id) => {
  const type = mediaType === "tv" ? "tv" : "movie";
  return withMediaType(await fetchResults(`/${type}/${id}/recommendations?language=en-US&page=1`), type);
};
