import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getMediaDetails } from "../services/tmdbService";

export default function Player() {
  const navigate = useNavigate();
  const { id, mediaType = "movie" } = useParams();

  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMovie = async () => {
      try {
        setLoading(true);
        setError("");

        const details = await getMediaDetails(mediaType, id);

        setMovie(details);

        const youtubeVideos =
          details?.videos?.results?.filter(
            (video) =>
              video.site === "YouTube" &&
              video.key
          ) || [];

        // Prefer an official trailer.
        const trailer =
          youtubeVideos.find(
            (video) =>
              video.type === "Trailer" &&
              video.official
          ) ||
          youtubeVideos.find(
            (video) =>
              video.type === "Trailer"
          ) ||
          youtubeVideos.find(
            (video) =>
              video.type === "Teaser"
          ) ||
          youtubeVideos[0];

        if (trailer) {
          setTrailerKey(trailer.key);
        } else {
          setError(
            "No official trailer is available for this title."
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

    loadMovie();
  }, [id, mediaType]);

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

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* ======================================
          TRAILER
      ======================================= */}

      {trailerKey ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
          title={`${movie?.title || movie?.name || "STREAM"} trailer`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0 bg-black"
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
              Trailer unavailable
            </h1>

            <p className="mt-2 text-sm leading-6 text-white/40">
              {error ||
                "We couldn't find an official trailer for this movie."}
            </p>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-6 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm text-white/70 transition hover:border-violet-400/40 hover:text-white"
            >
              ← Go Back
            </button>
          </div>
        </div>
      )}

      {/* ======================================
          TOP CINEMATIC FADE
      ======================================= */}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-32 bg-gradient-to-b from-black/90 via-black/35 to-transparent" />

      {/* ======================================
          BACK
      ======================================= */}

      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Go back"
        className="absolute left-5 top-5 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/55 text-xl text-white/80 shadow-lg backdrop-blur-xl transition hover:scale-105 hover:border-violet-400/50 hover:bg-violet-500/15 hover:text-white"
      >
        ←
      </button>

      {/* ======================================
          MOVIE INFORMATION
      ======================================= */}

      <div className="pointer-events-none absolute left-[80px] top-5 z-30 hidden sm:block">
        <p className="text-[8px] font-semibold uppercase tracking-[0.3em] text-violet-300">
          Official Trailer
        </p>

        <h1
          className="mt-1 max-w-[520px] truncate text-xl font-semibold"
          style={{
            fontFamily:
              '"Cormorant Garamond", serif',
          }}
        >
          {movie?.title || movie?.name || "STREAM"}
        </h1>

        <div className="mt-1 flex items-center gap-2 text-[10px] text-white/35">
          {movie?.release_date && (
            <span>
              {movie.release_date.slice(0, 4)}
            </span>
          )}

          {movie?.runtime && (
            <>
              <span>•</span>

              <span>
                {Math.floor(movie.runtime / 60)}h{" "}
                {movie.runtime % 60}m
              </span>
            </>
          )}

          <span>•</span>

          <span>STREAM Preview</span>
        </div>
      </div>

      {/* ======================================
          STREAM LOGO
      ======================================= */}

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
