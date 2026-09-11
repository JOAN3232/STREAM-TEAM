const BASE_URL = "https://api.themoviedb.org/3";

const GATEWAY_URL =
  import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:8084";

const options = {
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN?.replace(/\s+/g, "")}`,
    accept: "application/json",
  },
};

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

/* =========================================================
   TRENDING THROUGH API GATEWAY
   ========================================================= */

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

/* =========================================================
   MOVIE DETAILS
   ========================================================= */

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

/* =========================================================
   MOVIE RECOMMENDATIONS
   ========================================================= */

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

/* =========================================================
   IMAGE HELPERS
   ========================================================= */

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

/* =========================================================
   GENERIC TMDB FETCH
   ========================================================= */

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

/* =========================================================
   REMOVE DUPLICATES
   ========================================================= */

const dedupeByMediaAndId = (items) => {
  const seen = new Set();

  return items.filter((item) => {
    if (!item?.id) {
      return false;
    }

    const mediaType =
      item.media_type ||
      (item.first_air_date || item.name
        ? "tv"
        : "movie");

    const key = `${mediaType}:${item.id}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
};

/* =========================================================
   MULTIPLE TMDB PAGES

   TMDB normally returns 20 titles per page.

   3 pages = up to 60 titles
   5 pages = up to 100 titles
   ========================================================= */

const fetchMultiplePages = async (
  basePath,
  pages = 3
) => {
  const requests = Array.from(
    { length: pages },
    (_, index) => {
      const page = index + 1;

      const separator =
        basePath.includes("?")
          ? "&"
          : "?";

      return fetchResults(
        `${basePath}${separator}page=${page}`
      );
    }
  );

  const settled =
    await Promise.allSettled(requests);

  const combined = settled.flatMap(
    (result) =>
      result.status === "fulfilled"
        ? result.value
        : []
  );

  return dedupeByMediaAndId(combined);
};

/* =========================================================
   MEDIA TYPE HELPER
   ========================================================= */

const withMediaType = (
  items,
  mediaType
) =>
  items.map((item) => ({
    ...item,

    media_type:
      item.media_type ||
      mediaType,
  }));

/* =========================================================
   BROWSE CONTENT

   We now fetch MULTIPLE pages instead of only page 1.
   ========================================================= */

export const getBrowseContent = async () => {
  const requests = [
    {
      key: "trending",
      path:
        "/trending/all/week?language=en-US",
      mediaType: null,
      pages: 3,
    },

    {
      key: "popular",
      path:
        "/movie/popular?language=en-US",
      mediaType: "movie",
      pages: 5,
    },

    {
      key: "topRated",
      path:
        "/movie/top_rated?language=en-US",
      mediaType: "movie",
      pages: 3,
    },

    {
      key: "movies",
      path:
        "/movie/now_playing?language=en-US",
      mediaType: "movie",
      pages: 3,
    },

    {
      key: "tv",
      path:
        "/tv/popular?language=en-US",
      mediaType: "tv",
      pages: 5,
    },

    {
      key: "topRatedTv",
      path:
        "/tv/top_rated?language=en-US",
      mediaType: "tv",
      pages: 3,
    },

    {
      key: "airingToday",
      path:
        "/tv/airing_today?language=en-US",
      mediaType: "tv",
      pages: 3,
    },

    {
      key: "action",
      path:
        "/discover/movie?language=en-US&sort_by=popularity.desc&with_genres=28",
      mediaType: "movie",
      pages: 3,
    },

    {
      key: "comedy",
      path:
        "/discover/movie?language=en-US&sort_by=popularity.desc&with_genres=35",
      mediaType: "movie",
      pages: 3,
    },

    {
      key: "drama",
      path:
        "/discover/movie?language=en-US&sort_by=popularity.desc&with_genres=18",
      mediaType: "movie",
      pages: 3,
    },

    {
      key: "horror",
      path:
        "/discover/movie?language=en-US&sort_by=popularity.desc&with_genres=27",
      mediaType: "movie",
      pages: 3,
    },

    {
      key: "romance",
      path:
        "/discover/movie?language=en-US&sort_by=popularity.desc&with_genres=10749",
      mediaType: "movie",
      pages: 3,
    },

    {
      key: "scifi",
      path:
        "/discover/movie?language=en-US&sort_by=popularity.desc&with_genres=878",
      mediaType: "movie",
      pages: 3,
    },

    {
      key: "animation",
      path:
        "/discover/movie?language=en-US&sort_by=popularity.desc&with_genres=16",
      mediaType: "movie",
      pages: 3,
    },

    {
      key: "thriller",
      path:
        "/discover/movie?language=en-US&sort_by=popularity.desc&with_genres=53",
      mediaType: "movie",
      pages: 3,
    },

    {
      key: "documentary",
      path:
        "/discover/movie?language=en-US&sort_by=popularity.desc&with_genres=99",
      mediaType: "movie",
      pages: 2,
    },
  ];

  const settled =
    await Promise.allSettled(
      requests.map((request) =>
        fetchMultiplePages(
          request.path,
          request.pages
        )
      )
    );

  return requests.reduce(
    (
      content,
      request,
      index
    ) => {
      if (
        settled[index].status ===
        "fulfilled"
      ) {
        const typed =
          withMediaType(
            settled[index].value,
            request.mediaType
          );

        content[request.key] =
          dedupeByMediaAndId(
            typed
          ).filter(
            (item) =>
              item.backdrop_path ||
              item.poster_path
          );
      } else {
        console.error(
          `Failed to load ${request.key}:`,
          settled[index].reason
        );

        content[request.key] = [];
      }

      return content;
    },
    {}
  );
};

/* =========================================================
   MOVIE / TV DETAILS
   ========================================================= */

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

/* =========================================================
   MOVIE / TV RECOMMENDATIONS
   ========================================================= */

export const getMediaRecommendations = async (
  mediaType,
  id
) => {
  const type =
    mediaType === "tv"
      ? "tv"
      : "movie";

  const results =
    await fetchResults(
      `/${type}/${id}/recommendations?language=en-US&page=1`
    );

  return withMediaType(
    results,
    type
  );
};