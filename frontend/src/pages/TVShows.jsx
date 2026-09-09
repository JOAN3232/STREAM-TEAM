import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import StreamingLayout from "../components/StreamingLayout";

import {
  getBrowseContent,
  getPosterUrl,
  getBackdropUrl,
} from "../services/tmdbService";

const DISPLAY_FONT = {
  fontFamily:
    '"Cormorant Garamond", "Georgia", serif',
};

const titleOf = (item) =>
  item?.name ||
  item?.title ||
  "Untitled";

const yearOf = (item) =>
  (
    item?.first_air_date ||
    item?.release_date ||
    ""
  ).slice(0, 4);

function Icon({
  name,
  className = "h-5 w-5",
}) {
  const icons = {
    search: (
      <>
        <circle
          cx="11"
          cy="11"
          r="7"
        />

        <path d="m20 20-4-4" />
      </>
    ),

    play: (
      <path
        d="m8 5 11 7-11 7V5Z"
        fill="currentColor"
        stroke="none"
      />
    ),

    info: (
      <>
        <circle
          cx="12"
          cy="12"
          r="9"
        />

        <path d="M12 11v6M12 7.5v.5" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

export default function TVShows() {
  const navigate = useNavigate();

  const [shows, setShows] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [query, setQuery] =
    useState("");

  const [sort, setSort] =
    useState("popular");

  useEffect(() => {
    getBrowseContent()
      .then((data) => {
        const combined = [
          ...(data.tv || []),
          ...(data.popular || []),
          ...(data.topRated || []),
          ...(data.trending || []),
          ...(data.drama || []),
          ...(data.comedy || []),
        ];

        const seen = new Set();

        const uniqueShows =
          combined.filter((item) => {
            if (!item?.id) {
              return false;
            }

            const isTV =
              item.media_type === "tv" ||
              Boolean(
                item.first_air_date
              ) ||
              Boolean(item.name);

            if (!isTV) {
              return false;
            }

            if (
              seen.has(item.id)
            ) {
              return false;
            }

            seen.add(item.id);

            return true;
          });

        setShows(uniqueShows);
      })
      .catch(() => {
        setError(
          "STREAM could not load TV shows right now."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const displayedShows =
    useMemo(() => {
      let result = [...shows];

      if (query.trim()) {
        const search =
          query
            .trim()
            .toLowerCase();

        result =
          result.filter((show) =>
            titleOf(show)
              .toLowerCase()
              .includes(search)
          );
      }

      if (sort === "rating") {
        result.sort(
          (a, b) =>
            (b.vote_average || 0) -
            (a.vote_average || 0)
        );
      }

      if (sort === "newest") {
        result.sort(
          (a, b) =>
            new Date(
              b.first_air_date || 0
            ) -
            new Date(
              a.first_air_date || 0
            )
        );
      }

      if (sort === "popular") {
        result.sort(
          (a, b) =>
            (b.popularity || 0) -
            (a.popularity || 0)
        );
      }

      return result;
    }, [shows, query, sort]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050507] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-400" />

            <p className="text-[9px] uppercase tracking-[0.3em] text-white/30">
              Loading TV Shows
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <StreamingLayout>
      {/* PAGE TOP */}

      <section className="px-7 pb-7 pt-[104px] sm:px-9 lg:px-12 xl:px-14">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-[0.34em] text-violet-400">
              STREAM Catalogue
            </p>

            <h1
              className="mt-2 text-[42px] font-semibold leading-none tracking-[-0.025em] text-white sm:text-[48px]"
              style={DISPLAY_FONT}
            >
              TV Shows
            </h1>

            <p className="mt-3 max-w-[520px] text-[11px] leading-5 text-white/35">
              Explore popular series,
              top-rated shows and new
              favourites on STREAM.
            </p>
          </div>

          <p className="hidden text-[9px] text-white/25 lg:block">
            {displayedShows.length} titles
          </p>
        </div>
      </section>

      {/* CONTROLS */}

      <section className="px-7 pb-8 sm:px-9 lg:px-12 xl:px-14">
        <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.018] p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-[300px]">
            <Icon
              name="search"
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25"
            />

            <input
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
              placeholder="Search TV shows..."
              className="h-10 w-full rounded-xl border border-white/[0.06] bg-[#09090c] pl-10 pr-4 text-[10px] text-white outline-none transition placeholder:text-white/20 focus:border-violet-400/30"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              [
                "popular",
                "Popular",
              ],
              [
                "rating",
                "Top Rated",
              ],
              [
                "newest",
                "Newest",
              ],
            ].map(
              ([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setSort(value)
                  }
                  className={`h-9 rounded-full border px-4 text-[9px] font-medium transition ${
                    sort === value
                      ? "border-violet-400/30 bg-violet-500/15 text-violet-200"
                      : "border-white/[0.06] bg-white/[0.02] text-white/35 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* ERROR */}

      {error && (
        <div className="mx-7 mb-6 rounded-xl border border-red-400/20 bg-red-400/[0.05] p-3 text-[10px] text-red-200/70 sm:mx-9 lg:mx-12 xl:mx-14">
          {error}
        </div>
      )}

      {/* TV GRID */}

      <section className="px-7 pb-28 sm:px-9 lg:px-12 xl:px-14">
        {displayedShows.length ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {displayedShows.map(
              (show) => {
                const match =
                  Math.round(
                    (show.vote_average ||
                      0) * 10
                  );

                return (
                  <article
                    key={show.id}
                    className="group"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden rounded-[12px] border border-white/[0.06] bg-[#111015] shadow-[0_14px_36px_rgba(0,0,0,0.3)] transition duration-300 group-hover:-translate-y-1.5 group-hover:border-violet-400/30 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.55)]">
                      <img
                        src={
                          show.poster_path
                            ? getPosterUrl(
                                show.poster_path
                              )
                            : getBackdropUrl(
                                show.backdrop_path
                              )
                        }
                        alt={titleOf(
                          show
                        )}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/5 to-transparent opacity-55 transition duration-300 group-hover:opacity-95" />

                      <span className="absolute right-2.5 top-2.5 rounded-[4px] border border-white/15 bg-black/60 px-1.5 py-[2px] text-[7px] text-white/80 backdrop-blur">
                        HD
                      </span>

                      <div className="absolute inset-0 flex items-center justify-center gap-2.5 opacity-0 transition duration-300 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/watch/tv/${show.id}`
                            )
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-xl transition hover:scale-110"
                        >
                          <Icon
                            name="play"
                            className="h-3.5 w-3.5"
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/title/tv/${show.id}`
                            )
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur transition hover:scale-110 hover:bg-violet-500/20"
                        >
                          <Icon
                            name="info"
                            className="h-3.5 w-3.5"
                          />
                        </button>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 translate-y-2 p-3.5 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <h3
                          className="line-clamp-2 text-[20px] font-semibold leading-none text-white"
                          style={
                            DISPLAY_FONT
                          }
                        >
                          {titleOf(
                            show
                          )}
                        </h3>

                        <div className="mt-2 flex items-center gap-2 text-[7px] text-white/45">
                          {yearOf(
                            show
                          ) && (
                            <>
                              <span>
                                {yearOf(
                                  show
                                )}
                              </span>

                              <span>
                                •
                              </span>
                            </>
                          )}

                          <span className="font-semibold text-violet-300">
                            {match}%
                            Match
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 px-0.5">
                      <h3 className="truncate text-[10px] font-medium text-white/65">
                        {titleOf(
                          show
                        )}
                      </h3>

                      <div className="mt-1 flex items-center gap-1.5 text-[7px] text-white/25">
                        <span>
                          {yearOf(
                            show
                          )}
                        </span>

                        <span>
                          •
                        </span>

                        <span>
                          Series
                        </span>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        ) : (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <h2
                className="text-[30px] font-semibold"
                style={
                  DISPLAY_FONT
                }
              >
                No TV shows found
              </h2>

              <p className="mt-2 text-[10px] text-white/30">
                Try another search.
              </p>
            </div>
          </div>
        )}
      </section>
    </StreamingLayout>
  );
}