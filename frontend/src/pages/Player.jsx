import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import WatchPlayer from "../components/WatchPlayer";

import { addHistoryEntry } from "../services/historyService";

import {
  getMediaDetails,
  getMovieVideos,
  getTVEpisodeDetails,
  getTVSeasonDetails,
} from "../services/movieService";

export default function Player() {
  const navigate = useNavigate();

  const {
    id,
    mediaType = "movie",
    seasonNumber,
    episodeNumber,
  } = useParams();

  const isTV = mediaType === "tv";

  const season = Number(
    seasonNumber || 0
  );

  const episode = Number(
    episodeNumber || 0
  );

  const [movie, setMovie] =
    useState(null);

  const [episodeData, setEpisodeData] =
    useState(null);

  const [seasonData, setSeasonData] =
    useState(null);

  const [playback, setPlayback] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =====================================================
     LOAD PLAYER
  ===================================================== */

  useEffect(() => {
    const loadPlayer = async () => {
      try {
        setLoading(true);
        setError("");

        if (isTV) {
          const [
            details,
            currentEpisode,
            currentSeason,
          ] = await Promise.all([
            getMediaDetails(
              "tv",
              id
            ),

            getTVEpisodeDetails(
              id,
              season,
              episode
            ),

            getTVSeasonDetails(
              id,
              season
            ),
          ]);

          setMovie(details);

          setEpisodeData(
            currentEpisode
          );

          setSeasonData(
            currentSeason
          );

          /*
           * TV playback is not currently exposed
           * by the existing movie-service backend.
           */
          setPlayback(null);

          try {
            await addHistoryEntry(
              Number(id),
              episode
            );
          } catch (historyError) {
            console.warn(
              "Could not save TV history",
              historyError
            );
          }

          return;
        }

        /* =================================================
           MOVIE PLAYER
        ================================================= */

        const [
          details,
          video,
        ] = await Promise.all([
          getMediaDetails(
            "movie",
            id
          ),

          getMovieVideos(id),
        ]);

        setMovie(details);
        setPlayback(video);

        try {
          await addHistoryEntry(
            Number(id),
            0
          );
        } catch (historyError) {
          console.warn(
            "Could not save watch history",
            historyError
          );
        }

      } catch (err) {
        console.error(
          "STREAM player error:",
          err
        );

        setError(
          "STREAM could not load this title."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPlayer();
  }, [
    id,
    mediaType,
    season,
    episode,
    isTV,
  ]);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">

        <div className="flex flex-col items-center gap-4">

          <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500/25 border-t-violet-400" />

          <p className="text-[9px] uppercase tracking-[0.3em] text-white/35">
            Preparing STREAM
          </p>

        </div>

      </main>
    );
  }

  /* =====================================================
     TV PLAYER
  ===================================================== */

  if (isTV) {
    const episodes =
      seasonData?.episodes || [];

    const currentIndex =
      episodes.findIndex(
        (item) =>
          item.episode_number ===
          episode
      );

    const previousEpisode =
      currentIndex > 0
        ? episodes[currentIndex - 1]
        : null;

    const nextEpisode =
      currentIndex >= 0 &&
      currentIndex <
        episodes.length - 1
        ? episodes[currentIndex + 1]
        : null;

    return (
      <main className="min-h-screen bg-black text-white">

        {/* PLAYER AREA */}

        <section className="relative aspect-video w-full bg-black lg:h-screen lg:aspect-auto">

          <div className="absolute inset-0 flex items-center justify-center">

            <div className="max-w-lg px-6 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/10 text-xl">
                ▶
              </div>

              <h1
                className="mt-6 text-3xl font-semibold"
                style={{
                  fontFamily:
                    '"Cormorant Garamond", serif',
                }}
              >
                {episodeData?.name ||
                  `Episode ${episode}`}
              </h1>

              <p className="mt-2 text-sm text-white/40">
                Season {season} • Episode{" "}
                {episode}
              </p>

              <p className="mt-5 text-sm leading-6 text-white/45">
                {episodeData?.overview ||
                  "Episode information loaded from TMDB."}
              </p>

              <div className="mt-6 rounded-xl border border-violet-400/20 bg-violet-500/[0.06] p-4 text-left text-xs leading-5 text-white/50">
                TV episode playback is not
                connected to the current backend
                yet. The TMDB season and episode
                data is working; the next backend
                step is an authorized TV playback
                endpoint.
              </div>

            </div>

          </div>

          {/* BACK */}

          <button
            type="button"
            onClick={() =>
              navigate(
                `/title/tv/${id}`
              )
            }
            className="absolute left-5 top-5 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/55 text-xl text-white/80 backdrop-blur-xl transition hover:border-violet-400/50 hover:bg-violet-500/15 hover:text-white"
          >
            ←
          </button>

          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/90 via-black/35 to-transparent" />

        </section>

        {/* EPISODE INFORMATION */}

        <section className="mx-auto max-w-[1200px] px-6 py-10">

          <p className="text-[10px] uppercase tracking-[0.3em] text-violet-300">
            {movie?.name}
          </p>

          <h2
            className="mt-2 text-3xl font-semibold"
            style={{
              fontFamily:
                '"Cormorant Garamond", serif',
            }}
          >
            S{season} E{episode}{" "}
            {episodeData?.name
              ? `— ${episodeData.name}`
              : ""}
          </h2>

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/35">

            {episodeData?.air_date && (
              <span>
                {episodeData.air_date}
              </span>
            )}

            {episodeData?.runtime && (
              <>
                <span>•</span>

                <span>
                  {episodeData.runtime}m
                </span>
              </>
            )}

            {episodeData?.vote_average > 0 && (
              <>
                <span>•</span>

                <span className="text-amber-300">
                  ★{" "}
                  {episodeData.vote_average.toFixed(
                    1
                  )}
                </span>
              </>
            )}

          </div>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/50">
            {episodeData?.overview}
          </p>

          {/* EPISODE NAVIGATION */}

          <div className="mt-8 flex flex-wrap gap-3">

            {previousEpisode && (
              <button
                onClick={() =>
                  navigate(
                    `/watch/tv/${id}/${season}/${previousEpisode.episode_number}`
                  )
                }
                className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-white/70 transition hover:border-violet-400/40 hover:text-white"
              >
                ← Previous
              </button>
            )}

            <button
              onClick={() =>
                navigate(
                  `/title/tv/${id}`
                )
              }
              className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-white/70 transition hover:border-violet-400/40 hover:text-white"
            >
              Seasons & Episodes
            </button>

            {nextEpisode && (
              <button
                onClick={() =>
                  navigate(
                    `/watch/tv/${id}/${season}/${nextEpisode.episode_number}`
                  )
                }
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/85"
              >
                Next Episode →
              </button>
            )}

          </div>

        </section>

      </main>
    );
  }

  /* =====================================================
     MOVIE PLAYER
  ===================================================== */

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">

      {playback ? (
        <WatchPlayer
          provider={
            playback.provider
          }
          videoId={
            playback.videoId
          }
          embedUrl={
            playback.embedUrl
          }
          title={`${movie?.title || "STREAM"} player`}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-black px-6">

          <div className="max-w-md text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/10 text-xl">
              !
            </div>

            <h1
              className="mt-5 text-3xl font-semibold"
              style={{
                fontFamily:
                  '"Cormorant Garamond", serif',
              }}
            >
              Playback unavailable
            </h1>

            <p className="mt-2 text-sm leading-6 text-white/40">
              {error ||
                "We couldn't find a playable video for this title."}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="mt-6 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm text-white/70 transition hover:border-violet-400/40 hover:text-white"
            >
              ← Go Back
            </button>

          </div>

        </div>
      )}

      {/* TOP FADE */}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-32 bg-gradient-to-b from-black/90 via-black/35 to-transparent" />

      {/* BACK */}

      <button
        type="button"
        onClick={() =>
          navigate(-1)
        }
        aria-label="Go back"
        className="absolute left-5 top-5 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/55 text-xl text-white/80 shadow-lg backdrop-blur-xl transition hover:scale-105 hover:border-violet-400/50 hover:bg-violet-500/15 hover:text-white"
      >
        ←
      </button>

      {/* TITLE */}

      <div className="pointer-events-none absolute left-[80px] top-5 z-30 hidden sm:block">

        <p className="text-[8px] font-semibold uppercase tracking-[0.3em] text-violet-300">
          Now Watching
        </p>

        <h1
          className="mt-1 max-w-[520px] truncate text-xl font-semibold"
          style={{
            fontFamily:
              '"Cormorant Garamond", serif',
          }}
        >
          {movie?.title ||
            movie?.name ||
            "STREAM"}
        </h1>

        <div className="mt-1 flex items-center gap-2 text-[10px] text-white/35">

          {movie?.release_date && (
            <span>
              {movie.release_date.slice(
                0,
                4
              )}
            </span>
          )}

          {movie?.runtime && (
            <>
              <span>•</span>

              <span>
                {Math.floor(
                  movie.runtime / 60
                )}
                h{" "}
                {movie.runtime % 60}
                m
              </span>
            </>
          )}

          <span>•</span>

          <span>
            STREAM
          </span>

        </div>

      </div>

      {/* LOGO */}

      <div className="pointer-events-none absolute right-6 top-6 z-30">

        <span
          className="text-lg font-semibold tracking-[0.18em] text-white/35"
          style={{
            fontFamily:
              '"Cormorant Garamond", serif',
          }}
        >
          STREAM
        </span>

      </div>

    </main>
  );
}
