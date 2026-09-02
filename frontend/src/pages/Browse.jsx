import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getBackdropUrl,
  getBrowseContent,
  getPosterUrl,
  searchMovies,
} from "../services/movieService";

const EMPTY_CONTENT = {
  trending: [],
  popular: [],
  topRated: [],
  movies: [],
  tv: [],
  action: [],
  comedy: [],
  drama: [],
};

const ROW_LABELS = {
  trending: "Trending Now",
  popular: "Popular on STREAM",
  topRated: "Top Rated",
  movies: "Movies",
  tv: "TV Shows",
  action: "Action",
  comedy: "Comedy",
  drama: "Drama",
};

const titleOf = (item) =>
  item?.title || item?.name || "Untitled";

const typeOf = (item) =>
  item?.media_type === "tv" ? "tv" : "movie";

const yearOf = (item) =>
  (
    item?.release_date ||
    item?.first_air_date ||
    ""
  ).slice(0, 4);

function Icon({ name }) {
  const paths = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),

    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),

    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7.5v.5" />
      </>
    ),

    close: (
      <>
        <path d="M6 6l12 12" />
        <path d="M18 6 6 18" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function LoadingScreen() {
  return (
    <main className="min-h-screen bg-[#090512] text-white">
      <div className="h-[72vh] animate-pulse bg-gradient-to-br from-[#241044] via-[#120822] to-[#08050d]" />

      <div className="-mt-20 space-y-9 px-4 md:px-12">
        {[1, 2, 3].map((row) => (
          <div key={row}>
            <div className="mb-3 h-5 w-44 rounded bg-purple-500/10" />

            <div className="flex gap-2 overflow-hidden">
              {[1, 2, 3, 4, 5, 6].map((card) => (
                <div
                  key={card}
                  className="aspect-video w-[240px] shrink-0 rounded bg-purple-500/[.07]"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function ContentRow({ label, items, navigate }) {
  const rail = useRef(null);

  const scroll = (direction) => {
    rail.current?.scrollBy({
      left: rail.current.clientWidth * 0.85 * direction,
      behavior: "smooth",
    });
  };

  if (!items?.length) return null;

  return (
    <section
      id={`row-${label
        .toLowerCase()
        .replaceAll(" ", "-")}`}
      className="group/row relative mb-8 scroll-mt-24"
    >
      <h2 className="mb-2 px-4 text-base font-semibold md:px-12 md:text-xl">
        {label}
      </h2>

      <div className="relative">
        <button
          type="button"
          aria-label={`Scroll ${label} left`}
          onClick={() => scroll(-1)}
          className="absolute inset-y-0 left-0 z-30 hidden w-11 items-center justify-center bg-black/65 text-4xl opacity-0 transition group-hover/row:opacity-100 md:flex"
        >
          ‹
        </button>

        <div
          ref={rail}
          className="flex snap-x gap-1.5 overflow-x-auto px-4 pb-7 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:px-12"
        >
          {items.slice(0, 18).map((item) => {
            const image =
              item.backdrop_path
                ? getBackdropUrl(item.backdrop_path)
                : getPosterUrl(item.poster_path);

            return (
              <article
                key={`${typeOf(item)}-${item.id}`}
                className="group/card w-[47%] shrink-0 snap-start sm:w-[32%] md:w-[23%] lg:w-[19%] xl:w-[16%]"
              >
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/title/${typeOf(item)}/${item.id}`
                    )
                  }
                  className="relative block w-full overflow-hidden rounded-[5px] bg-[#171021] text-left shadow-md transition duration-300 hover:z-20 hover:scale-[1.045] hover:shadow-2xl"
                >
                  <div className="aspect-video">
                    {image ? (
                      <img
                        src={image}
                        alt={titleOf(item)}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.visibility =
                            "hidden";
                        }}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center bg-[#171021] text-xs text-white/30">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 to-transparent px-2 pb-2 pt-8 opacity-0 transition group-hover/card:opacity-100">
                    <p className="truncate text-xs font-semibold">
                      {titleOf(item)}
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-[9px] text-white/70">
                      <span className="font-bold text-[#a78bfa]">
                        {Math.round(
                          (item.vote_average || 0) * 10
                        )}
                        % Match
                      </span>

                      <span>{yearOf(item)}</span>

                      <span className="border border-white/45 px-1">
                        HD
                      </span>
                    </div>
                  </div>
                </button>
              </article>
            );
          })}
        </div>

        <button
          type="button"
          aria-label={`Scroll ${label} right`}
          onClick={() => scroll(1)}
          className="absolute inset-y-0 right-0 z-30 hidden w-11 items-center justify-center bg-black/65 text-4xl opacity-0 transition group-hover/row:opacity-100 md:flex"
        >
          ›
        </button>
      </div>
    </section>
  );
}

function SearchCard({ item, navigate }) {
  const image =
    item.backdrop_path
      ? getBackdropUrl(item.backdrop_path)
      : getPosterUrl(item.poster_path);

  return (
    <button
      type="button"
      onClick={() =>
        navigate(
          `/title/${typeOf(item)}/${item.id}`
        )
      }
      className="group overflow-hidden rounded-lg bg-[#130d1d] text-left transition duration-300 hover:-translate-y-1 hover:bg-[#1d1230] hover:shadow-2xl hover:shadow-purple-950/30"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={titleOf(item)}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center bg-[#171021] text-xs text-white/30">
            No image
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] opacity-0 transition group-hover:opacity-100">
          <span className="font-bold text-[#a78bfa]">
            {Math.round(
              (item.vote_average || 0) * 10
            )}
            % Match
          </span>

          <span className="border border-white/40 px-1">
            HD
          </span>
        </div>
      </div>

      <div className="p-3">
        <p className="truncate text-sm font-semibold">
          {titleOf(item)}
        </p>

        <div className="mt-1 flex gap-2 text-xs text-white/45">
          <span>{yearOf(item) || "—"}</span>
          <span>•</span>
          <span>
            {typeOf(item) === "tv"
              ? "TV"
              : "Movie"}
          </span>
        </div>
      </div>
    </button>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const safeTotal = Math.min(totalPages, 500);

  const pages = [];

  let start = Math.max(1, page - 2);
  let end = Math.min(safeTotal, page + 2);

  if (page <= 3) {
    start = 1;
    end = Math.min(5, safeTotal);
  }

  if (page >= safeTotal - 2) {
    start = Math.max(1, safeTotal - 4);
    end = safeTotal;
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-lg border border-purple-400/20 bg-purple-950/20 px-4 py-2 text-sm transition hover:bg-purple-700/20 disabled:cursor-not-allowed disabled:opacity-30"
      >
        Previous
      </button>

      {start > 1 && (
        <>
          <button
            type="button"
            onClick={() => onPageChange(1)}
            className="h-10 w-10 rounded-lg border border-purple-400/20 bg-purple-950/20 text-sm hover:bg-purple-700/20"
          >
            1
          </button>

          {start > 2 && (
            <span className="px-1 text-white/30">
              …
            </span>
          )}
        </>
      )}

      {pages.map((number) => (
        <button
          key={number}
          type="button"
          onClick={() => onPageChange(number)}
          className={`h-10 w-10 rounded-lg border text-sm transition ${
            page === number
              ? "border-purple-400 bg-purple-600 text-white shadow-lg shadow-purple-900/40"
              : "border-purple-400/20 bg-purple-950/20 hover:bg-purple-700/20"
          }`}
        >
          {number}
        </button>
      ))}

      {end < safeTotal && (
        <>
          {end < safeTotal - 1 && (
            <span className="px-1 text-white/30">
              …
            </span>
          )}

          <button
            type="button"
            onClick={() => onPageChange(safeTotal)}
            className="h-10 w-10 rounded-lg border border-purple-400/20 bg-purple-950/20 text-sm hover:bg-purple-700/20"
          >
            {safeTotal}
          </button>
        </>
      )}

      <button
        type="button"
        disabled={page >= safeTotal}
        onClick={() => onPageChange(page + 1)}
        className="rounded-lg border border-purple-400/20 bg-purple-950/20 px-4 py-2 text-sm transition hover:bg-purple-700/20 disabled:cursor-not-allowed disabled:opacity-30"
      >
        Next
      </button>
    </div>
  );
}

export default function Browse() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const activeProfile = JSON.parse(
    localStorage.getItem("activeProfile") || "null"
  );

  const profileName =
    params.get("profile") ||
    activeProfile?.name ||
    "Joan";

  const profileAvatar =
    activeProfile?.avatarImage ||
    "https://cdn.whitescreen.dev/spider-man-pfp-spider-man-avatar-built-for-strong-identity-and-recognition-agoz-square_hd-0226_800.webp";

  const [content, setContent] =
    useState(EMPTY_CONTENT);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [scrolled, setScrolled] =
    useState(false);

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [query, setQuery] =
    useState("");

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [searchResults, setSearchResults] =
    useState([]);

  const [searchPage, setSearchPage] =
    useState(1);

  const [searchTotalPages, setSearchTotalPages] =
    useState(1);

  const [searchTotalResults, setSearchTotalResults] =
    useState(0);

  const [noticeOpen, setNoticeOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  useEffect(() => {
    const onScroll = () =>
      setScrolled(window.scrollY > 24);

    window.addEventListener(
      "scroll",
      onScroll,
      { passive: true }
    );

    return () =>
      window.removeEventListener(
        "scroll",
        onScroll
      );
  }, []);

  useEffect(() => {
    getBrowseContent()
      .then((data) => {
        setContent(data);

        if (
          !Object.values(data).some(
            (items) => items.length
          )
        ) {
          setError(
            "STREAM could not load titles right now."
          );
        }
      })
      .catch(() =>
        setError(
          "STREAM could not load titles right now."
        )
      )
      .finally(() =>
        setLoading(false)
      );
  }, []);

  /*
   * REAL TMDB SEARCH
   *
   * We deliberately DO NOT search `content`.
   *
   * Every search is sent to the backend,
   * which then talks to TMDB.
   */
  useEffect(() => {
    const cleanQuery = query.trim();

    if (!cleanQuery) {
      setSearchResults([]);
      setSearchTotalPages(1);
      setSearchTotalResults(0);
      return;
    }

    let cancelled = false;

    setSearchLoading(true);

    const timer = setTimeout(async () => {
      try {
        const data = await searchMovies(
          cleanQuery,
          searchPage
        );

        if (cancelled) return;

        setSearchResults(data.results);
        setSearchTotalPages(
          data.totalPages || 1
        );
        setSearchTotalResults(
          data.totalResults || data.results.length
        );
      } catch (err) {
        if (cancelled) return;

        setSearchResults([]);
        setSearchTotalPages(1);
        setSearchTotalResults(0);
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, searchPage]);

  const allTitles = useMemo(() => {
    const seen = new Set();

    return Object.values(content)
      .flat()
      .filter((item) => {
        const key = `${typeOf(item)}-${item.id}`;

        if (seen.has(key)) return false;

        seen.add(key);

        return true;
      });
  }, [content]);

  const hero =
    content.trending.find(
      (item) =>
        item.backdrop_path &&
        typeOf(item) === "movie"
    ) ||
    content.popular[0];

  const goToRow = (key) => {
    const label = ROW_LABELS[key];

    if (!label) return;

    document
      .getElementById(
        `row-${label
          .toLowerCase()
          .replaceAll(" ", "-")}`
      )
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const openSearch = () => {
    setSearchOpen(true);

    setTimeout(() => {
      document
        .getElementById("stream-search-input")
        ?.focus();
    }, 50);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
    setSearchResults([]);
    setSearchPage(1);
  };

  const changeSearchPage = (page) => {
    setSearchPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <main
      className="min-h-screen overflow-x-hidden bg-[#090512] text-white"
      onClick={() => {
        if (noticeOpen)
          setNoticeOpen(false);

        if (profileOpen)
          setProfileOpen(false);
      }}
    >
      {/* NAVBAR */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          scrolled
            ? "bg-[#090512]/95 shadow-lg shadow-purple-950/20 backdrop-blur-md"
            : "bg-gradient-to-b from-[#08030f]/95 via-[#08030f]/50 to-transparent"
        }`}
      >
        <div className="flex h-16 items-center px-4 md:px-12">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/browse?profile=${encodeURIComponent(
                  profileName
                )}`
              )
            }
            className="mr-7 text-xl font-black tracking-[.12em] text-[#a855f7] md:text-2xl"
          >
            STREAM
          </button>

          <nav className="hidden items-center gap-5 lg:flex">
            {[
              ["Home", null],
              ["TV Shows", "tv"],
              ["Movies", "movies"],
              ["New & Popular", "popular"],
              ["My List", "route-my-list"],
              ["Account", "route-account"],
            ].map(([label, key]) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  if (
                    key === "route-my-list"
                  ) {
                    navigate("/my-list");
                  } else if (
                    key === "route-account"
                  ) {
                    navigate("/account");
                  } else if (key) {
                    goToRow(key);
                  } else {
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }
                }}
                className={`text-[13px] transition hover:text-purple-300 ${
                  label === "Home"
                    ? "font-semibold text-white"
                    : "text-white/80"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 md:gap-4">
            {/* SEARCH */}
            <button
              type="button"
              aria-label="Search"
              onClick={(event) => {
                event.stopPropagation();
                openSearch();
              }}
              className="grid h-9 w-9 place-items-center transition hover:text-purple-300"
            >
              <Icon name="search" />
            </button>

            {/* NOTIFICATIONS */}
            <div className="relative">
              <button
                type="button"
                aria-label="Notifications"
                onClick={(event) => {
                  event.stopPropagation();

                  setNoticeOpen(
                    (value) => !value
                  );

                  setProfileOpen(false);
                }}
                className="relative grid h-9 w-9 place-items-center hover:text-purple-300"
              >
                <Icon name="bell" />

                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-purple-500" />
              </button>

              {noticeOpen && (
                <div
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                  className="absolute right-0 top-12 w-72 border-t-2 border-purple-500 bg-[#11091c]/95 shadow-2xl backdrop-blur"
                >
                  <div className="border-b border-white/10 p-4">
                    <p className="text-sm font-semibold">
                      New arrivals
                    </p>

                    <p className="mt-1 text-xs text-white/55">
                      Fresh titles have been added
                      to STREAM.
                    </p>
                  </div>

                  <div className="p-4">
                    <p className="text-sm font-semibold">
                      Your weekly picks are ready
                    </p>

                    <p className="mt-1 text-xs text-white/55">
                      Explore recommendations
                      selected for {profileName}.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* PROFILE */}
            <div className="relative">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();

                  setProfileOpen(
                    (value) => !value
                  );

                  setNoticeOpen(false);
                }}
                className="flex items-center gap-2"
              >
                <img
                  src={profileAvatar}
                  alt={profileName}
                  className="h-8 w-8 rounded object-cover"
                />

                <span className="hidden text-xs md:block">
                  {profileName}
                </span>

                <span className="text-[9px]">
                  ▼
                </span>
              </button>

              {profileOpen && (
                <div
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                  className="absolute right-0 top-12 w-52 border-t-2 border-purple-500 bg-[#11091c]/95 py-2 text-sm shadow-2xl backdrop-blur"
                >
                  <button
                    onClick={() =>
                      navigate(
                        "/whos-watching"
                      )
                    }
                    className="block w-full px-4 py-2 text-left hover:bg-purple-500/10"
                  >
                    Manage Profiles
                  </button>

                  <button
                    onClick={() =>
                      navigate("/account")
                    }
                    className="block w-full px-4 py-2 text-left hover:bg-purple-500/10"
                  >
                    Account
                  </button>

                  <button className="block w-full px-4 py-2 text-left hover:bg-purple-500/10">
                    Help
                  </button>

                  <div className="my-1 border-t border-white/10" />

                  <button
                    onClick={() => {
                      localStorage.removeItem(
                        "activeProfile"
                      );

                      navigate("/login");
                    }}
                    className="block w-full px-4 py-2 text-left hover:bg-purple-500/10"
                  >
                    Sign Out of STREAM
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* SEARCH OVERLAY */}
      {searchOpen && (
        <section className="fixed inset-0 z-[100] min-h-screen overflow-y-auto bg-[#08040d]/98 backdrop-blur-md">
          <div className="mx-auto max-w-[1500px] px-4 pb-20 pt-20 md:px-10">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex flex-1 items-center rounded-xl border border-purple-400/30 bg-purple-950/20 px-4 shadow-xl shadow-purple-950/10">
                <Icon name="search" />

                <input
                  id="stream-search-input"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSearchPage(1);
                  }}
                  placeholder="Search movies and TV shows..."
                  className="h-14 w-full bg-transparent px-3 text-base outline-none placeholder:text-white/35 md:text-lg"
                />

                {searchLoading && (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-300/20 border-t-purple-400" />
                )}
              </div>

              <button
                type="button"
                onClick={closeSearch}
                className="grid h-14 w-14 place-items-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10"
              >
                <Icon name="close" />
              </button>
            </div>

            {!query.trim() ? (
              <div className="py-20 text-center">
                <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-purple-600/10 text-purple-400">
                  <Icon name="search" />
                </div>

                <h2 className="text-xl font-semibold">
                  Search the STREAM library
                </h2>

                <p className="mt-2 text-sm text-white/40">
                  Search directly across TMDB titles.
                </p>
              </div>
            ) : searchLoading &&
              !searchResults.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
                {Array.from({
                  length: 14,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-[2/3] animate-pulse rounded-lg bg-purple-500/[.06]"
                  />
                ))}
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-end justify-between">
                  <div>
                    <h1 className="text-2xl font-bold md:text-3xl">
                      Results for{" "}
                      <span className="text-purple-400">
                        “{query}”
                      </span>
                    </h1>

                    <p className="mt-1 text-sm text-white/40">
                      {searchTotalResults
                        ? `${searchTotalResults.toLocaleString()} titles found`
                        : "No titles found"}
                    </p>
                  </div>

                  <span className="hidden text-xs text-white/35 sm:block">
                    Page {searchPage} of{" "}
                    {Math.min(
                      searchTotalPages,
                      500
                    )}
                  </span>
                </div>

                {searchResults.length ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
                    {searchResults.map(
                      (item) => (
                        <SearchCard
                          key={`${typeOf(
                            item
                          )}-${item.id}`}
                          item={item}
                          navigate={navigate}
                        />
                      )
                    )}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <h2 className="text-xl font-semibold">
                      Nothing found
                    </h2>

                    <p className="mt-2 text-sm text-white/40">
                      Try another movie, actor,
                      or title.
                    </p>
                  </div>
                )}

                <Pagination
                  page={searchPage}
                  totalPages={searchTotalPages}
                  onPageChange={
                    changeSearchPage
                  }
                />
              </>
            )}
          </div>
        </section>
      )}

      {/* HERO */}
      {hero && (
        <section className="relative h-[76vh] min-h-[540px] md:h-[86vh]">
          <img
            src={getBackdropUrl(
              hero.backdrop_path
            )}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#090512] via-[#090512]/45 to-transparent" />

          <div className="absolute inset-0 bg-gradient-to-t from-[#090512] via-transparent to-purple-950/10" />

          <div className="relative z-10 flex h-full max-w-2xl flex-col justify-center px-4 pt-16 md:px-12">
            <p className="mb-3 text-xs font-bold uppercase tracking-[.35em] text-purple-400">
              STREAM
            </p>

            <h1 className="text-5xl font-black leading-[.92] drop-shadow-2xl md:text-7xl">
              {titleOf(hero)}
            </h1>

            <div className="mt-5 flex items-center gap-3 text-sm">
              <span className="font-bold text-purple-300">
                {Math.round(
                  (hero.vote_average || 0) * 10
                )}
                % Match
              </span>

              <span>{yearOf(hero)}</span>

              <span className="border border-white/50 px-1">
                HD
              </span>
            </div>

            <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-6 text-white/90 drop-shadow md:text-lg md:leading-7">
              {hero.overview}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() =>
                  navigate(
                    `/watch/${typeOf(
                      hero
                    )}/${hero.id}`
                  )
                }
                className="flex items-center gap-2 rounded bg-white px-6 py-2.5 font-bold text-black hover:bg-white/80"
              >
                <span>▶</span>
                Play
              </button>

              <button
                onClick={() =>
                  navigate(
                    `/title/${typeOf(
                      hero
                    )}/${hero.id}`
                  )
                }
                className="flex items-center gap-2 rounded bg-purple-950/70 px-6 py-2.5 font-bold hover:bg-purple-900"
              >
                <Icon name="info" />
                More Info
              </button>
            </div>
          </div>
        </section>
      )}

      {error && (
        <div className="mx-4 mb-8 rounded border border-purple-500/30 bg-purple-500/10 p-4 text-sm md:mx-12">
          {error}
        </div>
      )}

      {/* HOME ROWS */}
      <div className="relative z-10 -mt-16 pb-16 md:-mt-28">
        {Object.entries(ROW_LABELS).map(
          ([key, label]) => (
            <ContentRow
              key={key}
              label={label}
              items={content[key]}
              navigate={navigate}
            />
          )
        )}
      </div>
    </main>
  );
}
