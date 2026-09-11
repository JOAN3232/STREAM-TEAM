import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getBackdropUrl,
  getMediaDetails,
  getMediaRecommendations,
  getPosterUrl,
} from "../services/tmdbService";

import {
  addToMyList,
  getMyList,
  removeFromMyList,
} from "../services/myListService";
import { getTvSeason } from "../services/tmdbService";

const typeOf = (item) => {
  if (item?.mediaType === "playable") return "playable";
  if (item?.mediaType === "tv" || item?.media_type === "tv") return "tv";
  return "movie";
};

export default function MovieDetails() {
  const navigate = useNavigate();
  const { id, mediaType = "movie" } = useParams();

  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inMyList, setInMyList] = useState(false);

  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [episodesError, setEpisodesError] = useState("");
  const [resumeEpisode, setResumeEpisode] = useState(null);

  const isTV = mediaType === "tv";

  let storedProfile = null;

  try {
    storedProfile = JSON.parse(
      sessionStorage.getItem("stream_active_profile")
    );
  } catch {
    storedProfile = null;
  }

  const activeProfileId = storedProfile?.id || storedProfile?.name || "default";
  const myListKey = `stream_my_list_${activeProfileId}`;
  const continueWatchingKey = `stream_continue_watching_${activeProfileId}`;

  useEffect(() => {
    const loadMovie = async () => {
      try {
        setLoading(true);

        const [details, recommended] = await Promise.all([
          getMediaDetails(mediaType, id),
          getMediaRecommendations(mediaType, id),
        ]);

        setMovie(details);

        setRecommendations(
          recommended
            .filter((item) => item.backdrop_path || item.poster_path)
            .slice(0, 8)
        );

        if (mediaType === "tv") {
          const firstRegularSeason =
            details?.seasons?.find(
              (season) =>
                Number(season.season_number) > 0 &&
                Number(season.episode_count) > 0
            ) ||
            details?.seasons?.find(
              (season) => Number(season.season_number) > 0
            );

          if (firstRegularSeason) {
            setSelectedSeason(Number(firstRegularSeason.season_number));
          }
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [id, mediaType]);

  useEffect(() => {
    if (!isTV || !id || !selectedSeason) return;

    let cancelled = false;

    const loadEpisodes = async () => {
      try {
        setEpisodesLoading(true);
        setEpisodesError("");

        const seasonData = await getTvSeason(id, selectedSeason);

        if (!cancelled) {
          setEpisodes(Array.isArray(seasonData?.episodes) ? seasonData.episodes : []);
        }
      } catch {
        if (!cancelled) {
          setEpisodes([]);
          setEpisodesError("STREAM could not load this season right now.");
        }
      } finally {
        if (!cancelled) setEpisodesLoading(false);
      }
    };

    loadEpisodes();

    return () => {
      cancelled = true;
    };
  }, [id, isTV, selectedSeason]);

  useEffect(() => {
    if (!isTV || !id) {
      setResumeEpisode(null);
      return;
    }

    try {
      const saved =
        JSON.parse(localStorage.getItem(continueWatchingKey)) || [];

      const existing = saved.find(
        (item) =>
          String(item.id || item.contentId) === String(id) &&
          item.mediaType === "tv" &&
          Number(item.season) > 0 &&
          Number(item.episode) > 0
      );

      if (existing) {
        setResumeEpisode({
          season: Number(existing.season),
          episode: Number(existing.episode),
          episodeName: existing.episodeName || "",
        });
      } else {
        setResumeEpisode(null);
      }
    } catch {
      setResumeEpisode(null);
    }
  }, [id, isTV, continueWatchingKey]);

  useEffect(() => {
    const checkMyList = async () => {
      try {
        const backendItems = await getMyList();

        const exists = backendItems.some(
          (saved) =>
            String(saved.contentId) === String(id) &&
            saved.mediaType === mediaType
        );

        setInMyList(exists);
      } catch {
        try {
          const saved = JSON.parse(localStorage.getItem(myListKey)) || [];

          const exists = saved.some(
            (item) =>
              String(item.id) === String(id) && typeOf(item) === mediaType
          );

          setInMyList(exists);
        } catch {
          setInMyList(false);
        }
      }
    };

    checkMyList();
  }, [id, mediaType, myListKey]);

  const toggleMyList = async () => {
    if (!movie) return;

    const contentId = String(movie.id);

    try {
      if (inMyList) {
        await removeFromMyList(mediaType, contentId);
        setInMyList(false);

        try {
          const saved = JSON.parse(localStorage.getItem(myListKey)) || [];

          const next = saved.filter(
            (item) =>
              !(String(item.id) === contentId && typeOf(item) === mediaType)
          );

          localStorage.setItem(myListKey, JSON.stringify(next));
        } catch {
          // Backend remains source of truth
        }
      } else {
        await addToMyList({
          contentId,
          mediaType,
          title: movie.title || movie.name || "Untitled",
          posterPath: movie.poster_path || "",
          backdropPath: movie.backdrop_path || "",
        });

        setInMyList(true);

        try {
          const saved = JSON.parse(localStorage.getItem(myListKey)) || [];

          const exists = saved.some(
            (item) =>
              String(item.id) === contentId && typeOf(item) === mediaType
          );

          if (!exists) {
            localStorage.setItem(
              myListKey,
              JSON.stringify([
                ...saved,
                {
                  ...movie,
                  mediaType,
                  media_type: mediaType,
                },
              ])
            );
          }
        } catch {
          // Backend save already succeeded
        }
      }
    } catch (error) {
      console.error("Failed to update backend My List:", error);
    }
  };

  const regularSeasons = useMemo(
    () =>
      (movie?.seasons || []).filter(
        (season) => Number(season.season_number) > 0
      ),
    [movie]
  );

  const playTVEpisode = (episodeNumber = 1) => {
    navigate(
      `/watch/tv/${movie.id}?season=${selectedSeason}&episode=${episodeNumber}`
    );
  };

  const resumeTVEpisode = () => {
    if (!resumeEpisode || !movie) return;

    navigate(
      `/watch/tv/${movie.id}?season=${resumeEpisode.season}&episode=${resumeEpisode.episode}`
    );
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06050a] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
      </main>
    );
  }

  if (!movie) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#06050a] text-white">
        <p className="text-white/50">Movie details could not be loaded.</p>
      </main>
    );
  }

  const displayTitle = movie.title || movie.name;

  const year =
    (movie.release_date || movie.first_air_date)?.slice(0, 4) || "New";

  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : "";

  const director = movie.credits?.crew?.find(
    (person) => person.job === "Director"
  );

  const cast = movie.credits?.cast?.slice(0, 5) || [];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#06050a] text-white">
      <section className="relative min-h-[88vh]">
        <img
          src={getBackdropUrl(movie.backdrop_path)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06050a] via-[#06050a]/65 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06050a] via-transparent to-black/35" />

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-6 top-6 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/70 backdrop-blur-xl transition hover:border-violet-400/40 hover:text-white lg:left-10"
        >
          ←
        </button>

        <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-[1480px] items-end px-6 pb-20 pt-28 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-violet-300">
              {isTV ? "STREAM Series" : "STREAM Feature"}
            </p>

            <h1
              className="mt-4 text-5xl font-semibold leading-[0.95] sm:text-6xl lg:text-7xl"
              style={{ fontFamily: '"Cormorant Garamond", serif' }}
            >
              {displayTitle}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-white/55">
              <span>{year}</span>
              <span>•</span>

              {runtime && (
                <>
                  <span>{runtime}</span>
                  <span>•</span>
                </>
              )}

              <span className="text-amber-300">
                ★ {movie.vote_average?.toFixed(1)}
              </span>

              <span>•</span>

              <span>
                {movie.genres?.map((genre) => genre.name).join(" • ")}
              </span>
            </div>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
              {movie.overview}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (isTV && resumeEpisode) {
                    resumeTVEpisode();
                    return;
                  }

                  if (isTV) {
                    playTVEpisode(episodes?.[0]?.episode_number || 1);
                    return;
                  }

                  navigate(`/watch/${mediaType}/${movie.id}`);
                }}
                className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/85"
              >
                ▶{" "}
                {isTV && resumeEpisode
                  ? `Resume S${resumeEpisode.season}:E${resumeEpisode.episode}`
                  : isTV
                    ? "Play Episode"
                    : "Play"}
              </button>

              <button
                type="button"
                onClick={toggleMyList}
                className={`rounded-xl border px-6 py-3 text-sm font-semibold backdrop-blur-xl transition ${
                  inMyList
                    ? "border-violet-400/50 bg-violet-500/20 text-violet-200 hover:bg-violet-500/30"
                    : "border-white/15 bg-black/30 text-white hover:border-violet-400/50 hover:bg-violet-500/10"
                }`}
              >
                {inMyList ? "✓ In My List" : "+ My List"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-6 py-14 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <img
              src={getPosterUrl(movie.poster_path)}
              alt={displayTitle}
              className="w-full max-w-[320px] rounded-[22px] border border-white/[0.08] object-cover shadow-[0_25px_70px_rgba(0,0,0,0.4)]"
            />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-violet-300">
              About this title
            </p>

            <h2
              className="mt-3 text-3xl font-semibold"
              style={{ fontFamily: '"Cormorant Garamond", serif' }}
            >
              {displayTitle}
            </h2>

            {movie.tagline && (
              <p className="mt-3 text-sm italic text-white/40">“{movie.tagline}”</p>
            )}

            <div className="mt-8 space-y-5 text-sm">
              {!isTV && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                    Director
                  </p>
                  <p className="mt-1 text-white/75">
                    {director?.name || "Not available"}
                  </p>
                </div>
              )}

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                  Cast
                </p>
                <p className="mt-1 leading-6 text-white/75">
                  {cast.map((person) => person.name).join(", ") || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                  Genres
                </p>
                <p className="mt-1 text-white/75">
                  {movie.genres?.map((genre) => genre.name).join(", ")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isTV && (
        <section className="mx-auto max-w-[1180px] px-6 pb-20 lg:px-10">
          <div className="flex flex-col gap-4 border-b border-white/[0.07] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-violet-300">
                Episodes
              </p>
              <h2
                className="mt-1.5 text-3xl font-semibold"
                style={{ fontFamily: '"Cormorant Garamond", serif' }}
              >
                {displayTitle}
              </h2>
            </div>

            {regularSeasons.length > 0 && (
              <div className="relative">
                <select
                  value={selectedSeason}
                  onChange={(event) =>
                    setSelectedSeason(Number(event.target.value))
                  }
                  className="h-10 min-w-[145px] appearance-none rounded-lg border border-white/10 bg-[#0d0b12] py-0 pl-4 pr-10 text-[11px] font-medium text-white/80 outline-none transition hover:border-violet-400/30 focus:border-violet-400/50"
                >
                  {regularSeasons.map((season) => (
                    <option
                      key={season.id || season.season_number}
                      value={season.season_number}
                    >
                      {season.name || `Season ${season.season_number}`}
                    </option>
                  ))}
                </select>

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40">
                  ▼
                </span>
              </div>
            )}
          </div>

          {episodesLoading && (
            <div className="flex min-h-[180px] items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
            </div>
          )}

          {!episodesLoading && episodesError && (
            <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.05] p-4 text-sm text-red-200/70">
              {episodesError}
            </div>
          )}

          {!episodesLoading && !episodesError && episodes.length > 0 && (
            <div className="divide-y divide-white/[0.06]">
              {episodes.map((episode) => {
                const stillUrl = episode.still_path
                  ? getBackdropUrl(episode.still_path)
                  : getBackdropUrl(movie.backdrop_path);

                return (
                  <button
                    key={episode.id || episode.episode_number}
                    type="button"
                    onClick={() => playTVEpisode(episode.episode_number)}
                    className="group grid w-full grid-cols-[30px_112px_minmax(0,1fr)] items-center gap-3 py-3 text-left transition hover:bg-white/[0.025] sm:grid-cols-[36px_150px_minmax(0,1fr)_55px] sm:gap-4 sm:px-3"
                  >
                    <span
                      className="text-center text-xl font-semibold text-white/25 transition group-hover:text-violet-300 sm:text-2xl"
                      style={{ fontFamily: '"Cormorant Garamond", serif' }}
                    >
                      {String(episode.episode_number).padStart(2, "0")}
                    </span>

                    <div className="relative aspect-video overflow-hidden rounded-md bg-[#111015]">
                      {stillUrl && (
                        <img
                          src={stillUrl}
                          alt={episode.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                        />
                      )}

                      <div className="absolute inset-0 bg-black/10 transition group-hover:bg-black/25" />

                      <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/55 text-[10px] text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
                        ▶
                      </span>
                    </div>

                    <div className="min-w-0 pr-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="truncate text-[12px] font-semibold text-white/80 transition group-hover:text-white sm:text-[13px]">
                          {episode.name || `Episode ${episode.episode_number}`}
                          {resumeEpisode &&
                            resumeEpisode.season === selectedSeason &&
                            resumeEpisode.episode === episode.episode_number && (
                              <span className="ml-2 text-[8px] font-semibold uppercase tracking-[0.16em] text-violet-300">
                                Resume
                              </span>
                            )}
                        </h3>

                        {episode.runtime && (
                          <span className="shrink-0 text-[9px] text-white/30 sm:hidden">
                            {episode.runtime}m
                          </span>
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 text-[9px] leading-[1.55] text-white/32 sm:text-[10px] sm:leading-[1.6]">
                        {episode.overview || "Episode description unavailable."}
                      </p>
                    </div>

                    <div className="hidden text-right sm:block">
                      {episode.runtime && (
                        <span className="text-[10px] text-white/30">
                          {episode.runtime} min
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {!episodesLoading &&
            !episodesError &&
            episodes.length === 0 && (
              <div className="py-14 text-center text-[11px] text-white/30">
                No episodes are available for this season.
              </div>
            )}
        </section>
      )}

      {recommendations.length > 0 && (
        <section className="mx-auto max-w-[1480px] px-6 pb-24 lg:px-10">
          <p className="text-[10px] uppercase tracking-[0.28em] text-violet-300">
            More like this
          </p>

          <h2
            className="mt-2 text-2xl font-semibold"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            You might also like
          </h2>

          <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {recommendations.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(`/title/${mediaType}/${item.id}`)}
                className="group text-left"
              >
                <div className="aspect-[2/3] overflow-hidden rounded-[16px] border border-white/[0.07] transition duration-300 group-hover:-translate-y-2 group-hover:border-violet-400/35">
                  <img
                    src={getPosterUrl(item.poster_path)}
                    alt={item.title || item.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <p className="mt-3 truncate text-sm text-white/75">
                  {item.title || item.name}
                </p>

                <p className="mt-1 text-[10px] text-white/35">
                  {(item.release_date || item.first_air_date)?.slice(0, 4) || "New"}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
