import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getBackdropUrl,
  getPosterUrl,
  getTvDetails,
  getTvSeason,
} from "../services/movieService";

export default function TvDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [season, setSeason] = useState(1);
  const [seasonData, setSeasonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const data = await getTvDetails(id);

        if (!cancelled) {
          setShow(data);

          const firstSeason =
            data.seasons?.find(
              (item) => item.season_number > 0
            )?.season_number ?? 1;

          setSeason(firstSeason);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Could not load this series.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!show) return;

    let cancelled = false;

    async function loadSeason() {
      try {
        setSeasonLoading(true);

        const data = await getTvSeason(
          id,
          season
        );

        if (!cancelled) {
          setSeasonData(data);
        }
      } catch {
        if (!cancelled) {
          setSeasonData(null);
        }
      } finally {
        if (!cancelled) {
          setSeasonLoading(false);
        }
      }
    }

    loadSeason();

    return () => {
      cancelled = true;
    };
  }, [id, season, show]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090511] text-white grid place-items-center">
        Loading series...
      </main>
    );
  }

  if (error || !show) {
    return (
      <main className="min-h-screen bg-[#090511] text-white grid place-items-center">
        <p>{error || "Series not found."}</p>
      </main>
    );
  }

  const title = show.name || show.title || "Untitled";

  const seasons =
    show.seasons?.filter(
      (item) => item.season_number >= 0
    ) || [];

  return (
    <main className="min-h-screen bg-[#090511] text-white">
      <section className="relative min-h-[70vh] overflow-hidden">
        {show.backdrop_path && (
          <img
            src={getBackdropUrl(show.backdrop_path)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-[#090511] via-[#090511]/70 to-transparent" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#090511] via-transparent to-[#090511]/20" />

        <div className="relative z-10 flex min-h-[70vh] items-end px-6 pb-16 md:px-12">
          <div className="max-w-3xl">
            <button
              onClick={() => navigate(-1)}
              className="mb-8 text-sm text-white/70 hover:text-white"
            >
              ← Back
            </button>

            <p className="mb-3 text-xs font-bold uppercase tracking-[.3em] text-purple-400">
              TV Series
            </p>

            <h1 className="text-5xl font-black md:text-7xl">
              {title}
            </h1>

            <div className="mt-5 flex flex-wrap gap-4 text-sm text-white/70">
              {show.first_air_date && (
                <span>
                  {show.first_air_date.slice(0, 4)}
                </span>
              )}

              {show.vote_average && (
                <span className="text-green-400">
                  {Math.round(show.vote_average * 10)}% Match
                </span>
              )}
            </div>

            {show.overview && (
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/75 md:text-base">
                {show.overview}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="px-6 py-10 md:px-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold">
            Episodes
          </h2>

          <select
            value={season}
            onChange={(event) =>
              setSeason(Number(event.target.value))
            }
            className="rounded-lg border border-purple-500/40 bg-[#160d24] px-4 py-3 text-sm outline-none focus:border-purple-400"
          >
            {seasons.map((item) => (
              <option
                key={item.id || item.season_number}
                value={item.season_number}
              >
                {item.name || `Season ${item.season_number}`}
              </option>
            ))}
          </select>
        </div>

        {seasonLoading ? (
          <div className="py-16 text-center text-white/50">
            Loading episodes...
          </div>
        ) : (
          <div className="space-y-3">
            {seasonData?.episodes?.map((episode) => (
              <article
                key={episode.id}
                className="group overflow-hidden rounded-xl border border-white/10 bg-white/[.04] transition hover:border-purple-500/40 hover:bg-white/[.07]"
              >
                <div className="flex flex-col gap-4 p-4 md:flex-row">
                  <div className="w-full shrink-0 md:w-64">
                    {episode.still_path ? (
                      <img
                        src={getBackdropUrl(
                          episode.still_path
                        )}
                        alt={episode.name}
                        className="aspect-video w-full rounded-lg object-cover"
                      />
                    ) : (
                      <div className="aspect-video rounded-lg bg-white/10" />
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-purple-400">
                        E{episode.episode_number}
                      </span>

                      <h3 className="text-lg font-bold">
                        {episode.name}
                      </h3>
                    </div>

                    {episode.air_date && (
                      <p className="mt-1 text-xs text-white/40">
                        {episode.air_date}
                      </p>
                    )}

                    {episode.overview && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/55">
                        {episode.overview}
                      </p>
                    )}

                    <button
                      onClick={() =>
                        navigate(
                          `/watch/tv/${id}/${season}/${episode.episode_number}`
                        )
                      }
                      className="mt-5 w-fit rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-bold transition hover:bg-purple-500"
                    >
                      ▶ Play Episode
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {!seasonData?.episodes?.length && (
              <p className="py-16 text-center text-white/50">
                No episodes found for this season.
              </p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}x
