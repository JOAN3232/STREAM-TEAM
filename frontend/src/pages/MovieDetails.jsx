import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { addToWatchlist } from "../services/watchlistService";

import {
  getBackdropUrl,
  getMediaDetails,
  getMediaRecommendations,
  getPosterUrl,
  getTVSeasonDetails,
} from "../services/movieService";

export default function MovieDetails() {
  const navigate = useNavigate();

  const { id, mediaType = "movie" } = useParams();

  const isTV = mediaType === "tv";

  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const [selectedSeason, setSelectedSeason] =
    useState(null);

  const [season, setSeason] = useState(null);

  const [loading, setLoading] = useState(true);
  const [seasonLoading, setSeasonLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [watchlistLoading, setWatchlistLoading] =
    useState(false);

  const [watchlistMessage, setWatchlistMessage] =
    useState("");

  /* =====================================================
     LOAD TITLE
  ===================================================== */

  useEffect(() => {
    const loadTitle = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          details,
          recommended,
        ] = await Promise.all([
          getMediaDetails(mediaType, id),
          getMediaRecommendations(mediaType, id),
        ]);

        setMovie(details);

        setRecommendations(
          recommended
            .filter(
              (item) =>
                item.backdrop_path ||
                item.poster_path
            )
            .slice(0, 12)
        );

        /* Automatically select first real season */
        if (
          mediaType === "tv" &&
          details.seasons?.length
        ) {
          const firstSeason =
            details.seasons.find(
              (item) =>
                item.season_number > 0
            ) ||
            details.seasons[0];

          setSelectedSeason(
            firstSeason.season_number
          );
        }
      } catch (err) {
        console.error(
          "STREAM title details error:",
          err
        );

        setError(
          "STREAM could not load this title."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTitle();
  }, [id, mediaType]);

  /* =====================================================
     LOAD SEASON
  ===================================================== */

  useEffect(() => {
    if (!isTV || selectedSeason === null) {
      return;
    }

    const loadSeason = async () => {
      try {
        setSeasonLoading(true);

        const data =
          await getTVSeasonDetails(
            id,
            selectedSeason
          );

        setSeason(data);
      } catch (err) {
        console.error(
          "Season loading error:",
          err
        );

        setSeason(null);
      } finally {
        setSeasonLoading(false);
      }
    };

    loadSeason();
  }, [
    id,
    selectedSeason,
    isTV,
  ]);

  /* =====================================================
     WATCHLIST
  ===================================================== */

  const handleAddToWatchlist = async () => {
    if (!movie?.id || watchlistLoading) {
      return;
    }

    try {
      setWatchlistLoading(true);
      setWatchlistMessage("");

      await addToWatchlist(movie.id);

      setWatchlistMessage(
        "Added to My List."
      );
    } catch (error) {
      setWatchlistMessage(
        error.message ||
          "Could not update My List."
      );
    } finally {
      setWatchlistLoading(false);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06050a] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
      </main>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (!movie) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06050a] px-6 text-white">
        <div className="text-center">
          <p className="text-white/50">
            {error ||
              "Title details could not be loaded."}
          </p>

          <button
            onClick={() => navigate(-1)}
            className="mt-5 rounded-xl border border-white/10 px-5 py-3 text-sm hover:border-violet-400/40"
          >
            ← Go Back
          </button>
        </div>
      </main>
    );
  }

  /* =====================================================
     DISPLAY DATA
  ===================================================== */

  const displayTitle =
    movie.title ||
    movie.name ||
    "Untitled";

  const year =
    (
      movie.release_date ||
      movie.first_air_date ||
      ""
    ).slice(0, 4) || "New";

  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${
        movie.runtime % 60
      }m`
    : "";

  const director =
    movie.credits?.crew?.find(
      (person) =>
        person.job === "Director"
    );

  const cast =
    movie.credits?.cast?.slice(0, 6) ||
    [];

  const seasons =
    movie.seasons?.filter(
      (item) =>
        item.season_number >= 0
    ) || [];

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#06050a] text-white">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="relative min-h-[88vh]">

        {movie.backdrop_path && (
          <img
            src={getBackdropUrl(
              movie.backdrop_path
            )}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        )}

        <div className="absolute inset-0 bg-black/35" />

        <div className="absolute inset-0 bg-gradient-to-r from-[#06050a] via-[#06050a]/65 to-transparent" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#06050a] via-transparent to-black/35" />

        {/* BACK */}

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-6 top-6 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/70 backdrop-blur-xl transition hover:border-violet-400/40 hover:text-white lg:left-10"
        >
          ←
        </button>

        {/* HERO CONTENT */}

        <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-[1480px] items-end px-6 pb-20 pt-28 lg:px-10">

          <div className="max-w-3xl">

            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-violet-300">
              {isTV
                ? "STREAM Series"
                : "STREAM Feature"}
            </p>

            <h1
              className="mt-4 text-5xl font-semibold leading-[0.95] sm:text-6xl lg:text-7xl"
              style={{
                fontFamily:
                  '"Cormorant Garamond", serif',
              }}
            >
              {displayTitle}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-white/55">

              <span>{year}</span>

              <span>•</span>

              {isTV ? (
                <>
                  <span>
                    {movie.number_of_seasons || 0}{" "}
                    {movie.number_of_seasons === 1
                      ? "Season"
                      : "Seasons"}
                  </span>

                  <span>•</span>

                  <span>
                    {movie.number_of_episodes || 0}{" "}
                    Episodes
                  </span>
                </>
              ) : (
                runtime && (
                  <span>{runtime}</span>
                )
              )}

              <span>•</span>

              <span className="text-amber-300">
                ★{" "}
                {movie.vote_average?.toFixed(
                  1
                )}
              </span>

              <span>•</span>

              <span>
                {movie.genres
                  ?.map(
                    (genre) =>
                      genre.name
                  )
                  .join(" • ")}
              </span>

            </div>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
              {movie.overview}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">

              <button
                type="button"
                onClick={() => {
                  if (isTV) {
                    const firstSeason =
                      seasons.find(
                        (s) =>
                          s.season_number > 0
                      ) ||
                      seasons[0];

                    const firstEpisode =
                      1;

                    if (firstSeason) {
                      navigate(
                        `/watch/tv/${movie.id}/${firstSeason.season_number}/${firstEpisode}`
                      );
                    }
                  } else {
                    navigate(
                      `/watch/movie/${movie.id}`
                    );
                  }
                }}
                className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/85"
              >
                ▶{" "}
                {isTV
                  ? "Play Episode 1"
                  : "Play"}
              </button>

              <button
                type="button"
                onClick={
                  handleAddToWatchlist
                }
                disabled={
                  watchlistLoading
                }
                className="rounded-xl border border-white/15 bg-black/30 px-6 py-3 text-sm font-semibold text-white backdrop-blur-xl transition hover:border-violet-400/50 hover:bg-violet-500/10 disabled:opacity-70"
              >
                {watchlistLoading
                  ? "Saving..."
                  : "+ My List"}
              </button>

            </div>

            {watchlistMessage && (
              <p className="mt-4 text-sm text-white/70">
                {watchlistMessage}
              </p>
            )}

          </div>
        </div>
      </section>

      {/* =================================================
          TV SEASONS + EPISODES
      ================================================= */}

      {isTV && seasons.length > 0 && (
        <section className="mx-auto max-w-[1480px] px-6 py-14 lg:px-10">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-violet-300">
                Watch the series
              </p>

              <h2
                className="mt-2 text-3xl font-semibold"
                style={{
                  fontFamily:
                    '"Cormorant Garamond", serif',
                }}
              >
                Seasons & Episodes
              </h2>
            </div>

            {/* SEASON SELECTOR */}

            <select
              value={
                selectedSeason ?? ""
              }
              onChange={(event) =>
                setSelectedSeason(
                  Number(
                    event.target.value
                  )
                )
              }
              className="rounded-xl border border-white/10 bg-[#111018] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400/50"
            >
              {seasons.map((item) => (
                <option
                  key={
                    item.id ||
                    item.season_number
                  }
                  value={
                    item.season_number
                  }
                >
                  {item.name ||
                    `Season ${item.season_number}`}
                </option>
              ))}
            </select>

          </div>

          {/* EPISODES */}

          <div className="mt-8">

            {seasonLoading ? (
              <div className="flex items-center gap-3 py-10 text-sm text-white/40">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
                Loading episodes...
              </div>
            ) : season?.episodes?.length ? (
              <div className="space-y-3">

                {season.episodes.map(
                  (episode) => (
                    <article
                      key={
                        episode.id ||
                        episode.episode_number
                      }
                      className="group flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 transition hover:border-violet-400/30 hover:bg-violet-500/[0.04] sm:flex-row"
                    >

                      {/* STILL */}

                      <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-black sm:w-[270px]">

                        {episode.still_path ? (
                          <img
                            src={getBackdropUrl(
                              episode.still_path
                            )}
                            alt={
                              episode.name
                            }
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-white/20">
                            No image
                          </div>
                        )}

                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/watch/tv/${movie.id}/${season.season_number}/${episode.episode_number}`
                              )
                            }
                            className="flex h-12 w-12 scale-90 items-center justify-center rounded-full bg-white text-black opacity-0 shadow-xl transition group-hover:scale-100 group-hover:opacity-100"
                          >
                            ▶
                          </button>

                        </div>
                      </div>

                      {/* INFO */}

                      <div className="flex min-w-0 flex-1 flex-col justify-center py-2">

                        <div className="flex flex-wrap items-center gap-3">

                          <span className="text-xs font-bold text-violet-300">
                            {episode.episode_number}
                          </span>

                          <h3 className="text-base font-semibold text-white">
                            {episode.name ||
                              `Episode ${episode.episode_number}`}
                          </h3>

                          {episode.runtime && (
                            <span className="text-xs text-white/35">
                              {episode.runtime}m
                            </span>
                          )}

                        </div>

                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/45">
                          {episode.overview ||
                            "Episode description unavailable."}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-white/30">

                          {episode.air_date && (
                            <span>
                              {episode.air_date}
                            </span>
                          )}

                          {episode.vote_average > 0 && (
                            <>
                              <span>•</span>

                              <span className="text-amber-300">
                                ★{" "}
                                {episode.vote_average.toFixed(
                                  1
                                )}
                              </span>
                            </>
                          )}

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/watch/tv/${movie.id}/${season.season_number}/${episode.episode_number}`
                            )
                          }
                          className="mt-4 w-fit rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-violet-400/40 hover:bg-violet-500/10 hover:text-white"
                        >
                          ▶ Watch Episode
                        </button>

                      </div>

                    </article>
                  )
                )}

              </div>
            ) : (
              <p className="py-10 text-sm text-white/40">
                No episodes available for this season.
              </p>
            )}

          </div>
        </section>
      )}

      {/* =================================================
          MOVIE DETAILS / TV DETAILS
      ================================================= */}

      <section className="mx-auto max-w-[1480px] px-6 py-14 lg:px-10">

        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">

          <div>
            {movie.poster_path && (
              <img
                src={getPosterUrl(
                  movie.poster_path
                )}
                alt={displayTitle}
                className="w-full max-w-[320px] rounded-[22px] border border-white/[0.08] object-cover shadow-[0_25px_70px_rgba(0,0,0,0.4)]"
              />
            )}
          </div>

          <div>

            <p className="text-[10px] uppercase tracking-[0.28em] text-violet-300">
              About this title
            </p>

            <h2
              className="mt-3 text-3xl font-semibold"
              style={{
                fontFamily:
                  '"Cormorant Garamond", serif',
              }}
            >
              {displayTitle}
            </h2>

            {movie.tagline && (
              <p className="mt-3 text-sm italic text-white/40">
                “{movie.tagline}”
              </p>
            )}

            <div className="mt-8 space-y-5 text-sm">

              {!isTV && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                    Director
                  </p>

                  <p className="mt-1 text-white/75">
                    {director?.name ||
                      "Not available"}
                  </p>
                </div>
              )}

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                  Cast
                </p>

                <p className="mt-1 leading-6 text-white/75">
                  {cast
                    .map(
                      (person) =>
                        person.name
                    )
                    .join(", ") ||
                    "Not available"}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                  Genres
                </p>

                <p className="mt-1 text-white/75">
                  {movie.genres
                    ?.map(
                      (genre) =>
                        genre.name
                    )
                    .join(", ") ||
                    "Not available"}
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =================================================
          RECOMMENDATIONS
      ================================================= */}

      {recommendations.length > 0 && (
        <section className="mx-auto max-w-[1480px] px-6 pb-24 lg:px-10">

          <p className="text-[10px] uppercase tracking-[0.28em] text-violet-300">
            More like this
          </p>

          <h2
            className="mt-2 text-2xl font-semibold"
            style={{
              fontFamily:
                '"Cormorant Garamond", serif',
            }}
          >
            You might also like
          </h2>

          <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">

            {recommendations.map(
              (item) => {

                const itemType =
                  item.media_type ||
                  mediaType;

                return (
                  <button
                    key={`${itemType}-${item.id}`}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/title/${itemType}/${item.id}`
                      )
                    }
                    className="group text-left"
                  >

                    <div className="aspect-[2/3] overflow-hidden rounded-[16px] border border-white/[0.07] transition duration-300 group-hover:-translate-y-2 group-hover:border-violet-400/35">

                      <img
                        src={getPosterUrl(
                          item.poster_path
                        )}
                        alt={
                          item.title ||
                          item.name
                        }
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />

                    </div>

                    <p className="mt-3 truncate text-sm text-white/75">
                      {item.title ||
                        item.name}
                    </p>

                    <p className="mt-1 text-[10px] text-white/35">
                      {(
                        item.release_date ||
                        item.first_air_date ||
                        ""
                      ).slice(0, 4) ||
                        "New"}
                    </p>

                  </button>
                );
              }
            )}

          </div>
        </section>
      )}

    </main>
  );
}
