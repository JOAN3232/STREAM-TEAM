import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getMediaDetails,
} from "../services/tmdbService";

import {
  getPlayableContentById,
  getPlayableVideoUrl,
} from "../data/playableContent";

import {
  getContinueWatching,
  saveContinueWatching as saveContinueWatchingToBackend,
} from "../services/continueWatchingService";

const GATEWAY_URL =
  import.meta.env.VITE_API_GATEWAY_URL ||
  "http://localhost:8084";

export default function Player() {
  const navigate = useNavigate();

  const {
    id,
    mediaType = "movie",
  } = useParams();

  const videoRef = useRef(null);
  const lastSavedSecondRef = useRef(-1);
  const resumeTimeRef = useRef(0);
  const vidSrcSavedRef = useRef("");

  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [embedUrl, setEmbedUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [useTrailer, setUseTrailer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [watchProgress, setWatchProgress] = useState(0);

  const isPlayable =
    mediaType === "playable";

  const isMovie =
    mediaType === "movie";

  /* ======================================
     ACTIVE PROFILE
  ======================================= */

  const activeProfile = useMemo(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem(
          "stream_active_profile"
        )
      );
    } catch {
      return null;
    }
  }, []);

  const profileId =
    activeProfile?.id ||
    activeProfile?.name ||
    "default";

  const continueWatchingKey =
    `stream_continue_watching_${profileId}`;

  /* ======================================
     LOCAL CONTINUE WATCHING
  ======================================= */

  const getLocalContinueWatching = () => {
    try {
      return (
        JSON.parse(
          localStorage.getItem(
            continueWatchingKey
          )
        ) || []
      );
    } catch {
      return [];
    }
  };

  const removeFromLocalCache = () => {
    if (!movie) return;

    try {
      const current =
        getLocalContinueWatching();

      const remaining =
        current.filter(
          (saved) =>
            !(
              String(
                saved.id ||
                saved.contentId
              ) === String(movie.id) &&
              saved.mediaType ===
                "playable"
            )
        );

      localStorage.setItem(
        continueWatchingKey,
        JSON.stringify(remaining)
      );
    } catch (err) {
      console.error(
        "Continue Watching local remove error:",
        err
      );
    }
  };

  const syncLocalCache = (
    progress,
    currentTime
  ) => {
    if (!movie || !isPlayable) {
      return;
    }

    try {
      const current =
        getLocalContinueWatching();

      if (progress >= 95) {
        const remaining =
          current.filter(
            (saved) =>
              !(
                String(
                  saved.id ||
                    saved.contentId
                ) ===
                  String(movie.id) &&
                saved.mediaType ===
                  "playable"
              )
          );

        localStorage.setItem(
          continueWatchingKey,
          JSON.stringify(remaining)
        );

        return;
      }

      const item = {
        id: movie.id,
        contentId: String(movie.id),
        mediaType: "playable",

        title:
          movie.title ||
          "Untitled",

        overview:
          movie.description ||
          movie.overview ||
          "",

        posterUrl:
          movie.posterUrl ||
          "",

        backdropUrl:
          movie.backdropUrl ||
          "",

        release_date:
          movie.year
            ? String(movie.year)
            : "",

        progress:
          Math.round(progress),

        currentTime,

        watchedAt:
          Date.now(),
      };

      const withoutCurrent =
        current.filter(
          (saved) =>
            !(
              String(
                saved.id ||
                  saved.contentId
              ) ===
                String(movie.id) &&
              saved.mediaType ===
                "playable"
            )
        );

      localStorage.setItem(
        continueWatchingKey,
        JSON.stringify(
          [
            item,
            ...withoutCurrent,
          ].slice(0, 20)
        )
      );
    } catch (err) {
      console.error(
        "Continue Watching local cache error:",
        err
      );
    }
  };

  const loadProgressFromLocalCache =
    () => {
      if (!movie) return;

      try {
        const current =
          getLocalContinueWatching();

        const existing =
          current.find(
            (item) =>
              String(
                item.id ||
                  item.contentId
              ) ===
                String(movie.id) &&
              item.mediaType ===
                "playable"
          );

        if (existing) {
          const progress =
            Number(
              existing.progress
            ) || 0;

          const currentTime =
            Number(
              existing.currentTime
            ) || 0;

          setWatchProgress(progress);

          resumeTimeRef.current =
            currentTime;

          const video =
            videoRef.current;

          if (
            video &&
            Number.isFinite(
              video.duration
            ) &&
            currentTime > 0 &&
            currentTime <
              video.duration - 10
          ) {
            video.currentTime =
              currentTime;
          }
        } else {
          setWatchProgress(0);
          resumeTimeRef.current = 0;
        }
      } catch {
        setWatchProgress(0);
        resumeTimeRef.current = 0;
      }
    };

  /* ======================================
     FIND YOUTUBE TRAILER
  ======================================= */

  const findTrailer = (details) => {
    const youtubeVideos =
      details?.videos?.results?.filter(
        (video) =>
          video.site === "YouTube" &&
          video.key
      ) || [];

    return (
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
      youtubeVideos[0] ||
      null
    );
  };

  /* ======================================
     LOAD CONTENT
  ======================================= */

  useEffect(() => {
    let cancelled = false;

    const loadContent = async () => {
      try {
        setLoading(true);
        setError("");
        setTrailerKey(null);
        setEmbedUrl("");
        setVideoUrl("");
        setMovie(null);
        setUseTrailer(false);

        vidSrcSavedRef.current = "";
        resumeTimeRef.current = 0;
        lastSavedSecondRef.current = -1;

        /* ==================================
           NATIVE / CHARADE CONTENT
        ================================== */

        if (isPlayable) {
          const playable =
            getPlayableContentById(id);

          if (!playable) {
            throw new Error(
              "This STREAM title could not be found."
            );
          }

          const resolvedVideoUrl =
            playable.videoUrl ||
            (await getPlayableVideoUrl(
              playable.commonsFile
            ));

          if (cancelled) return;

          setMovie(playable);
          setVideoUrl(
            resolvedVideoUrl
          );

          return;
        }

        /* ==================================
           TMDB DETAILS
        ================================== */

        const details =
          await getMediaDetails(
            mediaType,
            id
          );

        if (cancelled) return;

        setMovie(details);

        /* ==================================
           PREPARE YOUTUBE FALLBACK FIRST
        ================================== */

        const trailer =
          findTrailer(details);

        if (trailer) {
          setTrailerKey(
            trailer.key
          );
        }

        /* ==================================
           MOVIES → VIDSRC
        ================================== */

        if (isMovie) {
          try {
            const response =
              await fetch(
                `${GATEWAY_URL}/api/movies/${id}/videos`
              );

            if (!response.ok) {
              throw new Error(
                `Playback service returned ${response.status}`
              );
            }

            const playback =
              await response.json();

            if (
              !cancelled &&
              playback?.embedUrl
            ) {
              setEmbedUrl(
                playback.embedUrl
              );

              setUseTrailer(false);
            } else if (
              !cancelled &&
              trailer
            ) {
              /*
               * No VidSrc URL returned.
               * Automatically use trailer.
               */
              setUseTrailer(true);
            }
          } catch (playbackError) {
            console.error(
              "VidSrc playback unavailable:",
              playbackError
            );

            /*
             * VidSrc request failed.
             * Automatically switch to YouTube.
             */
            if (
              !cancelled &&
              trailer
            ) {
              setUseTrailer(true);
            }
          }
        } else {
          /*
           * TV isn't wired to VidSrc yet,
           * so continue using trailer.
           */
          if (trailer) {
            setUseTrailer(true);
          }
        }

        if (
          !trailer &&
          !isMovie
        ) {
          setError(
            "No official trailer is available for this title."
          );
        }
      } catch (err) {
        console.error(
          "STREAM player error:",
          err
        );

        if (!cancelled) {
          setError(
            err?.message ||
              "STREAM could not load this title."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadContent();

    return () => {
      cancelled = true;
    };
  }, [
    id,
    mediaType,
    isPlayable,
    isMovie,
  ]);

  /* ======================================
     LOAD NATIVE CONTINUE WATCHING
  ======================================= */

  useEffect(() => {
    if (!movie || !isPlayable) {
      return;
    }

    let cancelled = false;

    const loadSavedProgress =
      async () => {
        try {
          const backendItems =
            await getContinueWatching();

          if (cancelled) return;

          const existing =
            backendItems.find(
              (item) =>
                String(
                  item.contentId
                ) ===
                  String(movie.id) &&
                item.mediaType ===
                  "playable"
            );

          if (existing) {
            const progress =
              Number(
                existing.progress
              ) || 0;

            const currentTime =
              Number(
                existing.currentTime
              ) || 0;

            setWatchProgress(progress);

            resumeTimeRef.current =
              currentTime;

            syncLocalCache(
              progress,
              currentTime
            );

            const video =
              videoRef.current;

            if (
              video &&
              Number.isFinite(
                video.duration
              ) &&
              video.duration > 0 &&
              currentTime > 0 &&
              currentTime <
                video.duration - 10
            ) {
              video.currentTime =
                currentTime;
            }

            return;
          }

          setWatchProgress(0);
          resumeTimeRef.current = 0;

          removeFromLocalCache();
        } catch (err) {
          console.error(
            "Failed to load Continue Watching from backend:",
            err
          );

          loadProgressFromLocalCache();
        }
      };

    loadSavedProgress();

    return () => {
      cancelled = true;
    };
  }, [
    movie,
    isPlayable,
    continueWatchingKey,
  ]);

  /* ======================================
     SAVE NATIVE PROGRESS
  ======================================= */

  const saveProgress = async (
    progress,
    currentTime = 0
  ) => {
    if (!movie || !isPlayable) {
      return;
    }

    const roundedProgress =
      Math.round(progress);

    syncLocalCache(
      roundedProgress,
      currentTime
    );

    try {
      await saveContinueWatchingToBackend({
        contentId:
          String(movie.id),

        mediaType:
          "playable",

        title:
          movie.title ||
          "Untitled",

        overview:
          movie.description ||
          movie.overview ||
          "",

        posterUrl:
          movie.posterUrl ||
          "",

        backdropUrl:
          movie.backdropUrl ||
          "",

        year:
          movie.year
            ? String(movie.year)
            : "",

        progress:
          roundedProgress,

        currentTime,
      });
    } catch (err) {
      console.error(
        "Continue Watching backend save error:",
        err
      );
    }
  };

  /* ======================================
     SAVE VIDSRC TO CONTINUE WATCHING
  ======================================= */

  useEffect(() => {
    if (
      isPlayable ||
      !movie ||
      !embedUrl
    ) {
      return;
    }

    const contentId =
      String(movie.id || id);

    const savedMediaType =
      mediaType || "movie";

    const saveKey =
      `${savedMediaType}:${contentId}`;

    if (
      vidSrcSavedRef.current ===
      saveKey
    ) {
      return;
    }

    vidSrcSavedRef.current =
      saveKey;

    const title =
      movie.title ||
      movie.name ||
      "Untitled";

    const overview =
      movie.overview ||
      movie.description ||
      "";

    const posterUrl =
      movie.posterUrl ||
      movie.poster_path ||
      "";

    const backdropUrl =
      movie.backdropUrl ||
      movie.backdrop_path ||
      "";

    const releaseDate =
      movie.release_date ||
      movie.first_air_date ||
      movie.releaseDate ||
      "";

    const year =
      releaseDate
        ? String(
            releaseDate
          ).slice(0, 4)
        : "";

    /*
     * VidSrc runs in a cross-origin iframe,
     * therefore exact currentTime cannot
     * reliably be read by this page.
     */
    const progress = 1;
    const currentTime = 0;

    const saveVidSrcMovie =
      async () => {
        /* LOCAL CACHE */

        try {
          const current =
            getLocalContinueWatching();

          const item = {
            id: contentId,
            contentId,

            mediaType:
              savedMediaType,

            title,
            overview,

            posterUrl,
            backdropUrl,

            poster_path:
              posterUrl,

            backdrop_path:
              backdropUrl,

            release_date:
              releaseDate ||
              year,

            progress,
            currentTime,

            watchedAt:
              Date.now(),
          };

          const withoutCurrent =
            current.filter(
              (saved) =>
                !(
                  String(
                    saved.id ||
                      saved.contentId
                  ) ===
                    contentId &&
                  saved.mediaType ===
                    savedMediaType
                )
            );

          localStorage.setItem(
            continueWatchingKey,
            JSON.stringify(
              [
                item,
                ...withoutCurrent,
              ].slice(0, 20)
            )
          );
        } catch (err) {
          console.error(
            "VidSrc Continue Watching local cache error:",
            err
          );
        }

        /* MONGODB */

        try {
          await saveContinueWatchingToBackend({
            contentId,

            mediaType:
              savedMediaType,

            title,
            overview,
            posterUrl,
            backdropUrl,
            year,
            progress,
            currentTime,
          });
        } catch (err) {
          console.error(
            "VidSrc Continue Watching backend save error:",
            err
          );
        }
      };

    saveVidSrcMovie();
  }, [
    embedUrl,
    movie,
    id,
    mediaType,
    isPlayable,
    continueWatchingKey,
  ]);

  /* ======================================
     NATIVE VIDEO EVENTS
  ======================================= */

  const handleLoadedMetadata = () => {
    const video =
      videoRef.current;

    if (!video) return;

    const resumeTime =
      resumeTimeRef.current;

    if (
      resumeTime > 0 &&
      Number.isFinite(
        video.duration
      ) &&
      resumeTime <
        video.duration - 10
    ) {
      video.currentTime =
        resumeTime;
    }
  };

  const handleTimeUpdate = () => {
    const video =
      videoRef.current;

    if (
      !video ||
      !video.duration ||
      !Number.isFinite(
        video.duration
      )
    ) {
      return;
    }

    const progress =
      (video.currentTime /
        video.duration) *
      100;

    setWatchProgress(progress);

    const wholeSeconds =
      Math.floor(
        video.currentTime
      );

    if (
      wholeSeconds > 0 &&
      wholeSeconds % 5 === 0 &&
      wholeSeconds !==
        lastSavedSecondRef.current
    ) {
      lastSavedSecondRef.current =
        wholeSeconds;

      saveProgress(
        progress,
        video.currentTime
      );
    }
  };

  const handlePause = () => {
    const video =
      videoRef.current;

    if (
      !video ||
      !video.duration ||
      !Number.isFinite(
        video.duration
      )
    ) {
      return;
    }

    const progress =
      (video.currentTime /
        video.duration) *
      100;

    saveProgress(
      progress,
      video.currentTime
    );
  };

  const handleEnded = () => {
    saveProgress(100, 0);

    setWatchProgress(100);

    resumeTimeRef.current = 0;
  };

  /* ======================================
     SAVE NATIVE BEFORE CLOSE
  ======================================= */

  useEffect(() => {
    return () => {
      const video =
        videoRef.current;

      if (
        !isPlayable ||
        !movie ||
        !video ||
        !video.duration ||
        !Number.isFinite(
          video.duration
        )
      ) {
        return;
      }

      const progress =
        (video.currentTime /
          video.duration) *
        100;

      saveProgress(
        progress,
        video.currentTime
      );
    };
  }, [
    isPlayable,
    movie,
  ]);

  /* ======================================
     LOADING
  ======================================= */

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

  /* ======================================
     ERROR
  ======================================= */

  if (
    !movie ||
    (isPlayable && !videoUrl)
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
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
            Unable to play
          </h1>

          <p className="mt-2 text-sm leading-6 text-white/40">
            {error ||
              "STREAM couldn't load this title."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="mt-6 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm text-white/70"
          >
            ← Go Back
          </button>

        </div>
      </main>
    );
  }

  const showingTrailer =
    !isPlayable &&
    trailerKey &&
    (useTrailer || !embedUrl);

  const showingVidSrc =
    !isPlayable &&
    embedUrl &&
    !useTrailer;

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* ======================================
          NATIVE STREAM PLAYER
      ======================================= */}

      {isPlayable &&
        videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            className="absolute inset-0 h-full w-full bg-black object-contain"
            controls
            autoPlay
            playsInline
            preload="metadata"
            onLoadedMetadata={
              handleLoadedMetadata
            }
            onTimeUpdate={
              handleTimeUpdate
            }
            onPause={
              handlePause
            }
            onEnded={
              handleEnded
            }
          >
            Your browser does not
            support video playback.
          </video>
        )}

      {/* ======================================
          VIDSRC PLAYER
      ======================================= */}

      {showingVidSrc && (
        <iframe
          src={embedUrl}
          title={`${
            movie?.title ||
            movie?.name ||
            "STREAM"
          } playback`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation"
          referrerPolicy="origin"
          className="absolute inset-0 h-full w-full border-0 bg-black"
        />
      )}

      {/* ======================================
          YOUTUBE FALLBACK
      ======================================= */}

      {showingTrailer && (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
          title={`${
            movie?.title ||
            movie?.name ||
            "STREAM"
          } trailer`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0 bg-black"
        />
      )}

      {/* ======================================
          NOTHING AVAILABLE
      ======================================= */}

      {!isPlayable &&
        !showingVidSrc &&
        !showingTrailer && (
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
                  "No playable video or official trailer is available for this title."}
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(-1)
                }
                className="mt-6 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm text-white/70"
              >
                ← Go Back
              </button>

            </div>

          </div>
        )}

      {/* ======================================
          TOP FADE
      ======================================= */}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-black/80 to-transparent" />

      {/* ======================================
          BACK BUTTON
      ======================================= */}

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

      {/* ======================================
          MOVIE / TRAILER SWITCH
      ======================================= */}

      {!isPlayable &&
        embedUrl &&
        trailerKey && (
          <button
            type="button"
            onClick={() =>
              setUseTrailer(
                (current) =>
                  !current
              )
            }
            className="absolute bottom-6 right-6 z-40 rounded-xl border border-white/15 bg-black/75 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/80 shadow-xl backdrop-blur-xl transition hover:border-violet-400/50 hover:bg-violet-500/20 hover:text-white"
          >
            {useTrailer
              ? "← Watch Movie"
              : "Playback unavailable? Watch Trailer"}
          </button>
        )}

      {/* ======================================
          CONTENT INFO
      ======================================= */}

      <div className="pointer-events-none absolute left-[80px] top-5 z-30 hidden sm:block">

        <p className="text-[8px] font-semibold uppercase tracking-[0.3em] text-violet-300">
          {isPlayable ||
          showingVidSrc
            ? "Now Playing"
            : "Official Trailer"}
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

          {isPlayable ? (
            <>
              {movie?.year && (
                <span>
                  {movie.year}
                </span>
              )}

              {movie?.runtime && (
                <>
                  <span>•</span>

                  <span>
                    {Math.floor(
                      movie.runtime /
                        60
                    )}
                    h{" "}
                    {movie.runtime %
                      60}
                    m
                  </span>
                </>
              )}

              <span>•</span>
              <span>STREAM</span>
            </>
          ) : (
            <>
              {(movie?.release_date ||
                movie?.first_air_date ||
                movie?.releaseDate) && (
                <span>
                  {String(
                    movie.release_date ||
                      movie.first_air_date ||
                      movie.releaseDate
                  ).slice(0, 4)}
                </span>
              )}

              {movie?.runtime && (
                <>
                  <span>•</span>

                  <span>
                    {Math.floor(
                      movie.runtime /
                        60
                    )}
                    h{" "}
                    {movie.runtime %
                      60}
                    m
                  </span>
                </>
              )}

              <span>•</span>

              <span>
                {showingVidSrc
                  ? "STREAM"
                  : "STREAM Preview"}
              </span>
            </>
          )}

        </div>

      </div>

      {/* ======================================
          STREAM LOGO
      ======================================= */}

      <div className="pointer-events-none absolute right-6 top-6 z-30">
        <span
          className="text-xl font-semibold tracking-[0.18em] text-white/35"
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