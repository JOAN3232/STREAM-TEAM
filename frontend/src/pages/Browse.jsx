import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  getBackdropUrl,
  getTrendingMovies,
} from "../services/tmdbService";

const GENRES = [
  "All",
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Drama",
];

export default function Browse() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const profileName = searchParams.get("profile") || "Joan";

  const [movies, setMovies] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  const [trendingGenre, setTrendingGenre] = useState("All");
  const [movieGenre, setMovieGenre] = useState("All");

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const result = await getTrendingMovies();

        const cleanMovies = result
          .filter(
            (movie) =>
              movie.backdrop_path ||
              movie.poster_path
          )
          .slice(0, 30);

        setMovies(cleanMovies);
      } catch (error) {
        console.error("Browse page movie error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  useEffect(() => {
    if (movies.length <= 1) return;

    const timer = setInterval(() => {
      setHeroIndex((current) =>
        current >= Math.min(movies.length, 6) - 1
          ? 0
          : current + 1
      );
    }, 8500);

    return () => clearInterval(timer);
  }, [movies.length]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 45);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const heroMovie = movies[heroIndex];

  const trendingMovies = useMemo(
    () => movies.slice(0, 10),
    [movies]
  );

  const movieGrid = useMemo(
    () => movies.slice(4, 20),
    [movies]
  );

  const moreForYou = useMemo(
    () => [...movies].reverse().slice(0, 10),
    [movies]
  );

  const continueWatching = movies[3] || movies[0];

  const getTitle = (movie) =>
    movie?.title || movie?.name || "Untitled";

  const getYear = (movie) =>
    movie?.release_date?.slice(0, 4) ||
    movie?.first_air_date?.slice(0, 4) ||
    "New";

  const getRating = (movie) =>
    movie?.vote_average
      ? movie.vote_average.toFixed(1)
      : "8.0";

  const posterUrl = (movie) =>
    movie?.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : getBackdropUrl(movie.backdrop_path);

  const GenreChips = ({
    active,
    setActive,
  }) => (
    <div className="flex flex-wrap items-center gap-2">
      {GENRES.map((genre) => (
        <button
          key={genre}
          type="button"
          onClick={() => setActive(genre)}
          className={`rounded-full px-4 py-2 text-[11px] font-medium transition ${
            active === genre
              ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-[0_8px_25px_rgba(124,58,237,0.25)]"
              : "border border-white/[0.07] bg-white/[0.025] text-white/45 hover:border-white/15 hover:text-white"
          }`}
        >
          {genre}
        </button>
      ))}
    </div>
  );

  const PosterCard = ({ movie }) => (
    <button
      type="button"
      onClick={() =>
        navigate(`/title/${movie.id}`)
      }
      className="group min-w-0 text-left"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-[16px] border border-white/[0.07] bg-white/[0.02] shadow-[0_16px_45px_rgba(0,0,0,0.28)] transition duration-300 group-hover:-translate-y-2 group-hover:border-violet-400/35 group-hover:shadow-[0_22px_60px_rgba(0,0,0,0.45)]">
        <img
          src={posterUrl(movie)}
          alt={getTitle(movie)}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-30 transition group-hover:opacity-80" />

        <div className="absolute bottom-3 left-3 right-3 flex translate-y-4 items-center gap-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[11px] text-black">
            ▶
          </span>

          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-sm text-white backdrop-blur-md">
            +
          </span>
        </div>
      </div>

      <div className="mt-3">
        <p className="truncate text-sm font-medium text-white/85">
          {getTitle(movie)}
        </p>

        <div className="mt-1.5 flex items-center gap-2 text-[10px] text-white/35">
          <span>{getYear(movie)}</span>
          <span>•</span>
          <span className="text-amber-300">
            ★ {getRating(movie)}
          </span>
        </div>
      </div>
    </button>
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050407]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/25 border-t-violet-400" />
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#06050a] text-white">
      {/* =========================================
          NAVBAR
      ========================================== */}

      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "border-b border-white/[0.05] bg-[#07060a]/82 shadow-[0_15px_50px_rgba(0,0,0,0.25)] backdrop-blur-2xl"
            : "bg-gradient-to-b from-black/70 via-black/25 to-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-[1480px] items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => navigate("/browse")}
              className="text-[23px] font-semibold tracking-[0.17em] text-violet-300"
              style={{
                fontFamily:
                  '"Cormorant Garamond", serif',
              }}
            >
              STREAM
            </button>

            <nav className="hidden items-center gap-1 lg:flex">
              {[
                "Home",
                "Movies",
                "Series",
                "My List",
              ].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`rounded-full px-4 py-2 text-[11px] transition ${
                    item === "Home"
                      ? "bg-white/[0.08] text-white"
                      : "text-white/45 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Search"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/50 transition hover:bg-white/[0.05] hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-[17px] w-[17px]"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20L16.6 16.6" />
              </svg>
            </button>

            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-white/50 transition hover:bg-white/[0.05] hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-[17px] w-[17px]"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
                <path d="M10 21h4" />
              </svg>

              <span className="absolute right-[7px] top-[7px] h-[5px] w-[5px] rounded-full bg-fuchsia-500" />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/whos-watching")
              }
              className="ml-1 flex items-center gap-2 rounded-full border border-white/10 bg-black/25 p-1 pr-3 backdrop-blur-xl transition hover:border-violet-400/35"
            >
              <img
                src="https://cdn.whitescreen.dev/spider-man-pfp-spider-man-avatar-built-for-strong-identity-and-recognition-agoz-square_hd-0226_800.webp"
                alt={profileName}
                className="h-8 w-8 rounded-full object-cover"
              />

              <span className="hidden text-[11px] text-white/65 sm:block">
                {profileName}
              </span>

              <span className="text-[9px] text-white/30">
                ▾
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================
          HERO
      ========================================== */}

      <section className="relative min-h-[82vh]">
        {heroMovie && (
          <>
            <img
              src={getBackdropUrl(
                heroMovie.backdrop_path
              )}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
            />

            <div className="absolute inset-0 bg-black/25" />

            <div className="absolute inset-0 bg-gradient-to-r from-[#06050a] via-[#06050a]/55 to-transparent" />

            <div className="absolute inset-0 bg-gradient-to-t from-[#06050a] via-transparent to-black/30" />
          </>
        )}

        <div className="relative z-10 mx-auto flex min-h-[82vh] max-w-[1480px] items-end px-6 pb-20 pt-28 lg:px-10">
          <div className="max-w-[620px]">
            <p className="text-[9px] font-semibold uppercase tracking-[0.35em] text-violet-300">
              Featured on STREAM
            </p>

            <h1
              className="mt-3 text-5xl font-semibold leading-[0.9] sm:text-6xl lg:text-[74px]"
              style={{
                fontFamily:
                  '"Cormorant Garamond", serif',
              }}
            >
              {getTitle(heroMovie)}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-[11px] text-white/50">
              <span>{getYear(heroMovie)}</span>

              <span className="rounded border border-white/15 px-2 py-1">
                HD
              </span>

              <span className="text-amber-300">
                ★ {getRating(heroMovie)}
              </span>

              <span>Action • Drama</span>
            </div>

            <p className="mt-5 max-w-[560px] text-sm leading-6 text-white/65 sm:text-[15px]">
              {heroMovie.overview}
            </p>

            <div className="mt-7 flex items-center gap-3">
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 text-sm font-semibold shadow-[0_12px_35px_rgba(124,58,237,0.22)] transition hover:scale-[1.02]"
              >
                ▶ Watch
              </button>

              <button
                type="button"
                className="flex items-center gap-2 rounded-xl border border-white/12 bg-black/30 px-5 py-3 text-sm text-white/80 backdrop-blur-xl transition hover:border-white/25"
              >
                + Add List
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 md:flex">
          {movies.slice(0, 6).map((movie, index) => (
            <button
              key={movie.id}
              type="button"
              onClick={() => setHeroIndex(index)}
              className={`h-1 rounded-full transition-all ${
                index === heroIndex
                  ? "w-8 bg-violet-400"
                  : "w-4 bg-white/20"
              }`}
            />
          ))}
        </div>
      </section>

      {/* =========================================
          TRENDING
      ========================================== */}

      <section className="mx-auto max-w-[1480px] px-6 py-14 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-white/[0.06] pb-5">
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-violet-300">
              Discover
            </p>

            <h2
              className="mt-1 text-2xl font-semibold"
              style={{
                fontFamily:
                  '"Cormorant Garamond", serif',
              }}
            >
              Trending Now
            </h2>
          </div>

          <GenreChips
            active={trendingGenre}
            setActive={setTrendingGenre}
          />
        </div>

        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
          {trendingMovies
            .slice(0, 6)
            .map((movie) => (
              <PosterCard
                key={movie.id}
                movie={movie}
              />
            ))}
        </div>
      </section>

      {/* =========================================
          MOVIES
      ========================================== */}

      <section className="mx-auto max-w-[1480px] px-6 py-10 lg:px-10">
        <div className="border-b border-white/[0.06] pb-5">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] text-violet-300">
                Explore
              </p>

              <h2
                className="mt-1 text-2xl font-semibold"
                style={{
                  fontFamily:
                    '"Cormorant Garamond", serif',
                }}
              >
                Movies
              </h2>
            </div>

            <GenreChips
              active={movieGenre}
              setActive={setMovieGenre}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-[10px] text-white/25">
              Sort by:
            </span>

            <button className="rounded-full bg-violet-500/15 px-4 py-2 text-[10px] text-violet-200">
              Latest
            </button>

            <button className="rounded-full border border-white/[0.07] px-4 py-2 text-[10px] text-white/35">
              Rating
            </button>

            <button className="rounded-full border border-white/[0.07] px-4 py-2 text-[10px] text-white/35">
              A–Z
            </button>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {movieGrid
            .slice(0, 12)
            .map((movie) => (
              <PosterCard
                key={movie.id}
                movie={movie}
              />
            ))}
        </div>
      </section>

      {/* =========================================
          CONTINUE WATCHING
      ========================================== */}

      {continueWatching && (
        <section className="mx-auto max-w-[1480px] px-6 py-14 lg:px-10">
          <div className="relative overflow-hidden rounded-[26px] border border-white/[0.07] bg-white/[0.02]">
            <img
              src={getBackdropUrl(
                continueWatching.backdrop_path
              )}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/35" />

            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/35 to-transparent" />

            <div className="relative z-10 flex min-h-[350px] items-end px-7 pb-8 pt-20 sm:px-10">
              <div className="max-w-xl">
                <p className="text-[9px] uppercase tracking-[0.28em] text-violet-300">
                  Continue Watching
                </p>

                <h3
                  className="mt-2 text-3xl font-semibold sm:text-4xl"
                  style={{
                    fontFamily:
                      '"Cormorant Garamond", serif',
                  }}
                >
                  {getTitle(continueWatching)}
                </h3>

                <p className="mt-3 text-sm text-white/55">
                  Resume where you left off.
                </p>

                <div className="mt-6 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-white/15">
                  <div className="h-full w-[58%] rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <button className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black">
                    ▶ Resume
                  </button>

                  <span className="text-xs text-white/35">
                    42 min remaining
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================
          MORE FOR YOU
      ========================================== */}

      <section className="mx-auto max-w-[1480px] px-6 pb-24 pt-8 lg:px-10">
        <div>
          <p className="text-[9px] uppercase tracking-[0.3em] text-violet-300">
            Personalised for {profileName}
          </p>

          <h2
            className="mt-1 text-2xl font-semibold"
            style={{
              fontFamily:
                '"Cormorant Garamond", serif',
            }}
          >
            More for You
          </h2>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
          {moreForYou
            .slice(0, 6)
            .map((movie) => (
              <PosterCard
                key={movie.id}
                movie={movie}
              />
            ))}
        </div>
      </section>
    </main>
  );
}