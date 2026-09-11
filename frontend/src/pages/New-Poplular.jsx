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
  item?.title ||
  item?.name ||
  "Untitled";

const yearOf = (item) =>
  (
    item?.release_date ||
    item?.first_air_date ||
    ""
  ).slice(0, 4);

const mediaTypeOf = (item) => {
  if (item?.media_type === "tv") {
    return "tv";
  }

  if (
    item?.first_air_date &&
    !item?.release_date
  ) {
    return "tv";
  }

  return "movie";
};

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

export default function NewPopular() {
  const navigate = useNavigate();

  const [titles, setTitles] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [query, setQuery] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  useEffect(() => {
    getBrowseContent()
      .then((data) => {
        const combined = [
          ...(data.popular || []),
          ...(data.trending || []),
          ...(data.topRated || []),
          ...(data.movies || []),
          ...(data.tv || []),
          ...(data.action || []),
          ...(data.comedy || []),
          ...(data.drama || []),
        ];

        const seen = new Set();

        const uniqueTitles =
          combined.filter((item) => {
            if (!item?.id) {
              return false;
            }

            const key =
              `${mediaTypeOf(item)}-${item.id}`;

            if (seen.has(key)) {
              return false;
            }

            seen.add(key);

            return true;
          });

        uniqueTitles.sort(
          (a, b) =>
            (b.popularity || 0) -
            (a.popularity || 0)
        );

        setTitles(uniqueTitles);
      })
      .catch(() => {
        setError(
          "STREAM could not load New & Popular right now."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const displayedTitles =
    useMemo(() => {
      let result = [...titles];

      if (filter === "movies") {
        result =
          result.filter(
            (item) =>
              mediaTypeOf(item) ===
              "movie"
          );
      }

      if (filter === "tv") {
        result =
          result.filter(
            (item) =>
              mediaTypeOf(item) ===
              "tv"
          );
      }

      if (filter === "new") {
        const currentYear =
          new Date().getFullYear();

        result =
          result.filter((item) => {
            const year = Number(
              yearOf(item)
            );

            return (
              year >= currentYear - 1
            );
          });

        result.sort(
          (a, b) =>
            new Date(
              b.release_date ||
                b.first_air_date ||
                0
            ) -
            new Date(
              a.release_date ||
                a.first_air_date ||
                0
            )
        );
      }

      if (query.trim()) {
        const search =
          query
            .trim()
            .toLowerCase();

        result =
          result.filter((item) =>
            titleOf(item)
              .toLowerCase()
              .includes(search)
          );
      }

      return result;
    }, [titles, filter, query]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050507] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-400" />

            <p className="text-[9px] uppercase tracking-[0.3em] text-white/30">
              Loading New & Popular
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
              Discover what everyone
              is watching
            </p>

            <h1
              className="mt-2 text-[42px] font-semibold leading-none tracking-[-0.025em] text-white sm:text-[48px]"
              style={DISPLAY_FONT}
            >
              New & Popular
            </h1>

            <p className="mt-3 max-w-[540px] text-[11px] leading-5 text-white/35">
              Trending titles, fresh
              releases and the most
              popular entertainment on
              STREAM.
            </p>
          </div>

          <p className="hidden text-[9px] text-white/25 lg:block">
            {displayedTitles.length} titles
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
              placeholder="Search titles..."
              className="h-10 w-full rounded-xl border border-white/[0.06] bg-[#09090c] pl-10 pr-4 text-[10px] text-white outline-none transition placeholder:text-white/20 focus:border-violet-400/30"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              ["all", "All"],
              ["new", "New Releases"],
              ["movies", "Movies"],
              ["tv", "TV Shows"],
            ].map(
              ([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setFilter(value)
                  }
                  className={`h-9 rounded-full border px-4 text-[9px] font-medium transition ${
                    filter === value
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

      {/* GRID */}

      <section className="px-7 pb-28 sm:px-9 lg:px-12 xl:px-14">
        {displayedTitles.length ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {displayedTitles.map(
              (item, index) => {
                const mediaType =
                  mediaTypeOf(item);

                const match =
                  Math.round(
                    (item.vote_average ||
                      0) * 10
                  );

                return (
                  <article
                    key={`${mediaType}-${item.id}`}
                    className="group"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden rounded-[12px] border border-white/[0.06] bg-[#111015] shadow-[0_14px_36px_rgba(0,0,0,0.3)] transition duration-300 group-hover:-translate-y-1.5 group-hover:border-violet-400/30 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.55)]">
                      <img
                        src={
                          item.poster_path
                            ? getPosterUrl(
                                item.poster_path
                              )
                            : getBackdropUrl(
                                item.backdrop_path
                              )
                        }
                        alt={titleOf(
                          item
                        )}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/5 to-transparent opacity-55 transition duration-300 group-hover:opacity-95" />

                      {index < 10 && (
                        <span className="absolute left-2.5 top-2.5 rounded-md border border-violet-400/20 bg-violet-600/80 px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.1em] text-white backdrop-blur">
                          Top {index + 1}
                        </span>
                      )}

                      <span className="absolute right-2.5 top-2.5 rounded-[4px] border border-white/15 bg-black/60 px-1.5 py-[2px] text-[7px] text-white/80 backdrop-blur">
                        {mediaType ===
                        "tv"
                          ? "SERIES"
                          : "HD"}
                      </span>

                      <div className="absolute inset-0 flex items-center justify-center gap-2.5 opacity-0 transition duration-300 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/watch/${mediaType}/${item.id}`
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
                              `/title/${mediaType}/${item.id}`
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
                            item
                          )}
                        </h3>

                        <div className="mt-2 flex items-center gap-2 text-[7px] text-white/45">
                          {yearOf(
                            item
                          ) && (
                            <>
                              <span>
                                {yearOf(
                                  item
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
                          item
                        )}
                      </h3>

                      <div className="mt-1 flex items-center gap-1.5 text-[7px] text-white/25">
                        <span>
                          {yearOf(
                            item
                          )}
                        </span>

                        <span>
                          •
                        </span>

                        <span>
                          {mediaType ===
                          "tv"
                            ? "Series"
                            : "Movie"}
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
                No titles found
              </h2>

              <p className="mt-2 text-[10px] text-white/30">
                Try another search or filter.
              </p>
            </div>
          </div>
        )}
      </section>
    </StreamingLayout>
  );
}