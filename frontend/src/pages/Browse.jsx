import { useEffect, useMemo, useRef, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import {
  getBackdropUrl,
  getBrowseContent,
  getPosterUrl,
} from "../services/tmdbService";

import {
  addToMyList,
  getMyList,
  removeFromMyList,
} from "../services/myListService";

import {
  getContinueWatching,
  removeFromContinueWatching,
} from "../services/continueWatchingService";

import { playableContent } from "../data/playableContent";

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
  popular: "New & Popular",
  topRated: "Top Rated",
  movies: "Movies",
  tv: "TV Shows",
  action: "Action",
  comedy: "Comedy",
  drama: "Drama",
};

const UI_FONT = {
  fontFamily: '"Manrope", "Inter", "Helvetica Neue", Arial, sans-serif',
};

const DISPLAY_FONT = {
  fontFamily: '"Cormorant Garamond", "Georgia", serif',
};

const titleOf = (item) => item?.title || item?.name || "Untitled";

const typeOf = (item) => {
  if (item?.mediaType === "playable") {
    return "playable";
  }

  if (item?.mediaType === "tv" || item?.media_type === "tv") {
    return "tv";
  }

  return "movie";
};

const yearOf = (item) =>
  (item?.release_date || item?.first_air_date || item?.year || "")
    .toString()
    .slice(0, 4);

/* =========================================================
   ICONS
========================================================= */

function Icon({ name, className = "h-5 w-5" }) {
  const icons = {
    home: (
      <>
        <path d="M3 11 12 3l9 8" />
        <path d="M5 10v11h14V10" />
      </>
    ),

    tv: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="m8 3 4 3 4-3" />
      </>
    ),

    movie: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M8 4v16M16 4v16M3 9h5M16 9h5M3 15h5M16 15h5" />
      </>
    ),

    spark: (
      <path d="m12 3 1.8 4.5L18 9.3l-4.2 1.9L12 16l-1.8-4.8L6 9.3l4.2-1.8L12 3Z" />
    ),

    list: (
      <>
        <path d="M8 6h13M8 12h13M8 18h13" />
        <path d="M3 6h.01M3 12h.01M3 18h.01" />
      </>
    ),

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

    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.1h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1Z" />
      </>
    ),

    chevronLeft: <path d="m15 18-6-6 6-6" />,

    chevronRight: <path d="m9 18 6-6-6-6" />,

    play: <path d="m8 5 11 7-11 7V5Z" fill="currentColor" stroke="none" />,

    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),

    check: <path d="m5 12 4 4L19 6" />,

    more: (
      <>
        <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
      </>
    ),

    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),

    logout: (
      <>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M21 3v18h-7" />
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

/* =========================================================
   LOADING
========================================================= */

function LoadingScreen() {
  return (
    <main className="min-h-screen bg-[#050507] text-white" style={UI_FONT}>
      <div className="fixed inset-y-0 left-0 hidden w-[72px] border-r border-white/[0.05] bg-[#07070a] lg:block" />

      <div className="lg:ml-[72px]">
        <div className="h-[72vh] animate-pulse bg-gradient-to-br from-[#1b1722] via-[#100e14] to-[#050507]" />

        <div className="space-y-14 px-8 pb-24 lg:px-12">
          {[1, 2, 3].map((row) => (
            <div key={row}>
              <div className="mb-5 h-4 w-36 rounded bg-white/[0.08]" />

              <div className="flex gap-5 overflow-hidden">
                {[1, 2, 3, 4, 5, 6].map((card) => (
                  <div
                    key={card}
                    className="aspect-[2/3] w-[180px] shrink-0 rounded-lg bg-white/[0.06]"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={`group relative flex w-full flex-col items-center justify-center gap-1.5 py-3.5 transition ${
        active ? "text-violet-300" : "text-white/30 hover:text-white"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-2 h-[calc(100%-16px)] w-[2px] rounded-r-full bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.7)]" />
      )}

      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
          active ? "bg-violet-500/[0.10]" : "group-hover:bg-white/[0.05]"
        }`}
      >
        <Icon name={icon} className="h-[18px] w-[18px]" />
      </span>

      <span className="text-[8px] font-medium">{label}</span>
    </button>
  );
}


function MobileNavItem({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 transition ${
        active ? "text-violet-300" : "text-white/40"
      }`}
    >
      <Icon name={icon} className="h-[19px] w-[19px]" />

      <span className="max-w-full truncate text-[9px] font-medium">
        {label}
      </span>

      {active && (
        <span className="absolute bottom-1 h-[2px] w-5 rounded-full bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.8)]" />
      )}
    </button>
  );
}

function MobileMenuItem({
  icon,
  title,
  subtitle,
  onClick,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left transition ${
        danger
          ? "text-red-300 hover:bg-red-400/[0.07]"
          : "text-white/75 hover:bg-white/[0.05] hover:text-white"
      }`}
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
          danger ? "bg-red-400/[0.08]" : "bg-violet-400/[0.08]"
        }`}
      >
        <Icon name={icon} className="h-[18px] w-[18px]" />
      </span>

      <span className="min-w-0">
        <span className="block text-[13px] font-semibold">{title}</span>

        {subtitle && (
          <span className="mt-0.5 block text-[9px] text-white/30">
            {subtitle}
          </span>
        )}
      </span>
    </button>
  );
}

/* =========================================================
   CONTINUE WATCHING ROW
========================================================= */

function ContinueWatchingRow({ items, navigate, onRemove }) {
  const rail = useRef(null);

  if (!items?.length) {
    return null;
  }

  const scroll = (direction) => {
    rail.current?.scrollBy({
      left: rail.current.clientWidth * 0.78 * direction,
      behavior: "smooth",
    });
  };

  return (
    <section className="group/continue relative mb-16 lg:mb-[72px]">
      <div className="mb-6 flex items-center gap-2 px-7 sm:px-9 lg:px-12 xl:px-14">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-white/90 lg:text-[18px]">
          Continue Watching
        </h2>

        <Icon name="chevronRight" className="h-3.5 w-3.5 text-violet-400/80" />
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => scroll(-1)}
          className="absolute left-4 top-[122px] z-40 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.08] bg-[#0b0910]/80 text-white/60 opacity-0 shadow-xl backdrop-blur-xl transition-all duration-200 hover:bg-violet-500/25 hover:text-white group-hover/continue:opacity-100 lg:flex"
        >
          <Icon name="chevronLeft" className="h-4 w-4" />
        </button>

        <div
          ref={rail}
          className="flex gap-5 overflow-x-auto px-7 pb-6 sm:px-9 lg:px-12 xl:px-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => {
            const progress = Math.min(
              Math.max(Number(item.progress) || 0, 0),
              100,
            );

            const imageUrl =
              item.backdropUrl ||
              item.posterUrl ||
              (item.backdrop_path
                ? getBackdropUrl(item.backdrop_path)
                : item.poster_path
                  ? getPosterUrl(item.poster_path)
                  : "");

            return (
              <article
                key={`${typeOf(item)}-${item.id}`}
                className="group/card w-[280px] shrink-0"
              >
                <div className="relative aspect-video overflow-hidden rounded-[12px] border border-white/[0.07] bg-[#0b0a0e] shadow-[0_18px_45px_rgba(0,0,0,0.35)] transition duration-300 group-hover/card:-translate-y-1 group-hover/card:border-violet-400/30 group-hover/card:shadow-[0_22px_55px_rgba(0,0,0,0.6)]">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={titleOf(item)}
                      className="h-full w-full object-cover transition duration-500 group-hover/card:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#21152f] via-[#100b17] to-black">
                      <span
                        className="text-3xl font-semibold text-white"
                        style={DISPLAY_FONT}
                      >
                        {titleOf(item)}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/watch/${typeOf(item)}/${item.id}`)
                    }
                    className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white opacity-0 shadow-xl backdrop-blur-md transition duration-300 hover:scale-110 hover:bg-white hover:text-black group-hover/card:opacity-100"
                  >
                    <Icon name="play" className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    title="Remove from Continue Watching"
                    onClick={() => onRemove(item)}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/55 text-[14px] text-white/50 opacity-0 backdrop-blur-md transition hover:bg-red-400/20 hover:text-red-200 group-hover/card:opacity-100"
                  >
                    ×
                  </button>

                  <div className="absolute inset-x-0 bottom-[10px] px-3">
                    <p className="truncate text-[11px] font-semibold text-white">
                      {titleOf(item)}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[8px] text-white/45">
                      <span>Continue watching</span>

                      <span>{Math.round(progress)}%</span>
                    </div>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 h-[4px] bg-white/15">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scroll(1)}
          className="absolute right-4 top-[122px] z-40 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.08] bg-[#0b0910]/80 text-white/60 opacity-0 shadow-xl backdrop-blur-xl transition-all duration-200 hover:bg-violet-500/25 hover:text-white group-hover/continue:opacity-100 lg:flex"
        >
          <Icon name="chevronRight" className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

/* =========================================================
   WATCH ON STREAM
========================================================= */

function PlayableContentRow({ items, navigate }) {
  const rail = useRef(null);

  if (!items?.length) {
    return null;
  }

  const scroll = (direction) => {
    rail.current?.scrollBy({
      left: rail.current.clientWidth * 0.78 * direction,
      behavior: "smooth",
    });
  };

  return (
    <section className="group/playable relative mb-16 lg:mb-[72px]">
      <div className="mb-6 flex items-center justify-between px-7 sm:px-9 lg:px-12 xl:px-14">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-white/90 lg:text-[18px]">
              Watch on STREAM
            </h2>

            <Icon
              name="chevronRight"
              className="h-3.5 w-3.5 text-violet-400/80"
            />
          </div>

          <p className="mt-1.5 text-[9px] text-white/30">
            Full titles available to watch now
          </p>
        </div>

        <span className="rounded-full border border-violet-400/15 bg-violet-500/[0.08] px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-violet-300">
          STREAM
        </span>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => scroll(-1)}
          className="absolute left-4 top-[145px] z-40 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.08] bg-[#0b0910]/80 text-white/60 opacity-0 shadow-xl backdrop-blur-xl transition-all duration-200 hover:bg-violet-500/25 hover:text-white group-hover/playable:opacity-100 lg:flex"
        >
          <Icon name="chevronLeft" className="h-4 w-4" />
        </button>

        <div
          ref={rail}
          className="flex min-h-[325px] gap-5 overflow-x-auto px-7 pb-8 sm:px-9 lg:px-12 xl:px-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <article
              key={item.id}
              className="group/card relative h-[290px] w-[190px] shrink-0 transition-[width,transform] duration-500 ease-out hover:z-30 hover:w-[440px] hover:-translate-y-2"
            >
              <div className="absolute inset-0 flex overflow-hidden rounded-[12px] border border-violet-400/[0.12] bg-[#09080d] shadow-[0_18px_45px_rgba(0,0,0,0.38)] transition-all duration-500 group-hover/card:border-violet-400/40 group-hover/card:shadow-[0_24px_70px_rgba(0,0,0,0.7),0_0_30px_rgba(139,92,246,0.12)]">
                <div className="relative h-full w-[190px] shrink-0 overflow-hidden">
                  {item.posterUrl ? (
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-700 group-hover/card:scale-[1.035]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#21152f] via-[#100b17] to-black px-5 text-center">
                      <div>
                        <span
                          className="text-[11px] font-semibold tracking-[0.25em] text-violet-400"
                          style={DISPLAY_FONT}
                        >
                          STREAM
                        </span>

                        <h3
                          className="mt-4 text-[28px] font-semibold leading-none text-white"
                          style={DISPLAY_FONT}
                        >
                          {item.title}
                        </h3>

                        <p className="mt-3 text-[9px] text-white/35">
                          {item.year}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <span className="absolute left-2 top-2 rounded-[4px] bg-violet-600/90 px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.12em] text-white shadow-lg">
                    Playable
                  </span>

                  <span className="absolute right-2 top-2 rounded-[4px] border border-white/15 bg-black/60 px-1.5 py-[2px] text-[7px] font-medium text-white/80 backdrop-blur">
                    HD
                  </span>
                </div>

                <div className="flex w-[250px] shrink-0 translate-x-5 flex-col justify-center px-5 py-5 opacity-0 transition-all delay-75 duration-500 group-hover/card:translate-x-0 group-hover/card:opacity-100">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-violet-400">
                    Watch on STREAM
                  </p>

                  <h3
                    className="mt-2 line-clamp-2 text-[25px] font-semibold leading-[1] text-white"
                    style={DISPLAY_FONT}
                  >
                    {item.title}
                  </h3>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[9px] font-medium text-white/45">
                    <span>{item.year}</span>

                    <span className="text-white/20">•</span>

                    <span>
                      {Math.floor(item.runtime / 60)}h {item.runtime % 60}m
                    </span>

                    <span className="text-white/20">•</span>

                    <span>HD</span>
                  </div>

                  <p className="mt-3 line-clamp-4 text-[10px] leading-[1.65] text-white/50">
                    {item.description}
                  </p>

                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() => navigate(`/watch/playable/${item.id}`)}
                      className="flex h-9 items-center gap-2 rounded-md bg-white px-4 text-[10px] font-semibold text-black transition hover:bg-white/85"
                    >
                      <Icon name="play" className="h-3 w-3" />
                      Play Movie
                    </button>
                  </div>

                  <p className="mt-4 text-[8px] leading-4 text-white/20">
                    {item.source} • {item.license}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scroll(1)}
          className="absolute right-4 top-[145px] z-40 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.08] bg-[#0b0910]/80 text-white/60 opacity-0 shadow-xl backdrop-blur-xl transition-all duration-200 hover:bg-violet-500/25 hover:text-white group-hover/playable:opacity-100 lg:flex"
        >
          <Icon name="chevronRight" className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

/* =========================================================
   CONTENT ROW
========================================================= */

function ContentRow({ label, items, navigate, myList, onToggleMyList }) {
  const rail = useRef(null);

  if (!items?.length) {
    return null;
  }

  const scroll = (direction) => {
    rail.current?.scrollBy({
      left: rail.current.clientWidth * 0.78 * direction,
      behavior: "smooth",
    });
  };

  return (
    <section
      id={`row-${label.toLowerCase().replaceAll(" ", "-")}`}
      className="group/row relative mb-16 lg:mb-[72px]"
    >
      <div className="mb-6 flex items-center gap-2 px-7 sm:px-9 lg:px-12 xl:px-14">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-white/90 lg:text-[18px]">
          {label}
        </h2>

        <Icon name="chevronRight" className="h-3.5 w-3.5 text-violet-400/80" />
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => scroll(-1)}
          className="absolute left-4 top-[145px] z-40 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.08] bg-[#0b0910]/80 text-white/60 opacity-0 shadow-xl backdrop-blur-xl transition-all duration-200 hover:bg-violet-500/25 hover:text-white group-hover/row:opacity-100 lg:flex"
        >
          <Icon name="chevronLeft" className="h-4 w-4" />
        </button>

        <div
          ref={rail}
          className="flex min-h-[325px] snap-x items-start gap-5 overflow-x-auto px-7 pb-8 sm:px-9 lg:px-12 xl:px-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.slice(0, 20).map((item) => {
            const match = Math.round((item.vote_average || 0) * 10);

            const saved = myList.some(
              (savedItem) =>
                savedItem.id === item.id && typeOf(savedItem) === typeOf(item),
            );

            return (
              <article
                key={`${typeOf(item)}-${item.id}`}
                className="
                    group/card
                    relative
                    h-[290px]
                    w-[190px]
                    shrink-0
                    snap-start
                    transition-[width,transform]
                    duration-500
                    ease-out
                    hover:z-30
                    hover:w-[440px]
                    hover:-translate-y-2
                  "
              >
                <div
                  className="
                      absolute
                      inset-0
                      flex
                      overflow-hidden
                      rounded-[12px]
                      border
                      border-white/[0.07]
                      bg-[#09080d]
                      shadow-[0_18px_45px_rgba(0,0,0,0.38)]
                      transition-all
                      duration-500
                      group-hover/card:border-violet-400/40
                      group-hover/card:shadow-[0_24px_70px_rgba(0,0,0,0.7),0_0_30px_rgba(139,92,246,0.12)]
                    "
                >
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/title/${typeOf(item)}/${item.id}`)
                    }
                    className="relative h-full w-[190px] shrink-0 overflow-hidden text-left"
                  >
                    <img
                      src={
                        item.poster_path
                          ? getPosterUrl(item.poster_path)
                          : getBackdropUrl(item.backdrop_path)
                      }
                      alt={titleOf(item)}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 group-hover/card:scale-[1.035]"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

                    <span className="absolute right-2 top-2 rounded-[4px] border border-white/15 bg-black/60 px-1.5 py-[2px] text-[7px] font-medium text-white/80 backdrop-blur">
                      HD
                    </span>
                  </button>

                  <div className="flex w-[250px] shrink-0 translate-x-5 flex-col justify-center px-5 py-5 opacity-0 transition-all delay-75 duration-500 group-hover/card:translate-x-0 group-hover/card:opacity-100">
                    <h3
                      className="line-clamp-2 text-[25px] font-semibold leading-[1] text-white"
                      style={DISPLAY_FONT}
                    >
                      {titleOf(item)}
                    </h3>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[9px] font-medium text-white/45">
                      {yearOf(item) && (
                        <>
                          <span>{yearOf(item)}</span>

                          <span className="text-white/20">•</span>
                        </>
                      )}

                      <span>16+</span>

                      <span className="text-white/20">•</span>

                      <span>HD</span>
                    </div>

                    <p className="mt-2.5 text-[10px] font-semibold text-violet-300">
                      {match}% Match
                    </p>

                    <p className="mt-3 line-clamp-4 text-[10px] leading-[1.65] text-white/50">
                      {item.overview ||
                        "Discover this title on STREAM and step into a new story."}
                    </p>

                    <div className="mt-5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();

                          navigate(`/watch/${typeOf(item)}/${item.id}`);
                        }}
                        className="flex h-9 items-center gap-2 rounded-md bg-white px-4 text-[10px] font-semibold text-black transition hover:bg-white/85"
                      >
                        <Icon name="play" className="h-3 w-3" />
                        Play
                      </button>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();

                          onToggleMyList(item);
                        }}
                        className={`flex h-9 items-center gap-1.5 rounded-md border px-3.5 text-[10px] font-medium transition ${
                          saved
                            ? "border-violet-400/30 bg-violet-500/20 text-violet-200"
                            : "border-white/[0.08] bg-white/[0.08] text-white/75 hover:border-violet-400/30 hover:bg-violet-500/15 hover:text-white"
                        }`}
                      >
                        <Icon
                          name={saved ? "check" : "plus"}
                          className="h-3.5 w-3.5"
                        />

                        {saved ? "In My List" : "My List"}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/title/${typeOf(item)}/${item.id}`)
                      }
                      className="mt-3 w-fit text-[9px] font-medium text-white/30 transition hover:text-violet-300"
                    >
                      More details →
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scroll(1)}
          className="absolute right-4 top-[145px] z-40 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.08] bg-[#0b0910]/80 text-white/60 opacity-0 shadow-xl backdrop-blur-xl transition-all duration-200 hover:bg-violet-500/25 hover:text-white group-hover/row:opacity-100 lg:flex"
        >
          <Icon name="chevronRight" className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

/* =========================================================
   BROWSE
========================================================= */

export default function Browse() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const profileName = params.get("profile") || "Joan";

  const [content, setContent] = useState(EMPTY_CONTENT);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [searchOpen, setSearchOpen] = useState(false);

  const [query, setQuery] = useState("");

  const [noticeOpen, setNoticeOpen] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);

  const [heroIndex, setHeroIndex] = useState(0);

  const [scrolled, setScrolled] = useState(false);

  const [myListOpen, setMyListOpen] = useState(false);

  const [myList, setMyList] = useState([]);

  const [continueWatching, setContinueWatching] = useState([]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* =======================================================
     ACTIVE PROFILE
  ======================================================= */

  const storedProfile = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("stream_active_profile"));
    } catch {
      return null;
    }
  }, []);

  const activeName = storedProfile?.name || profileName;

  const activeProfileId = storedProfile?.id || storedProfile?.name || "default";

  const continueWatchingKey = `stream_continue_watching_${activeProfileId}`;

  const myListKey = `stream_my_list_${activeProfileId}`;

  /* =======================================================
     LOAD MY LIST
  ======================================================= */

  useEffect(() => {
    const loadMyList = async () => {
      try {
        const backendItems = await getMyList();

        const localItems = JSON.parse(localStorage.getItem(myListKey)) || [];

        const hydrated = backendItems.map((backendItem) => {
          const localMatch = localItems.find(
            (item) =>
              String(item.id) === String(backendItem.contentId) &&
              typeOf(item) === backendItem.mediaType,
          );

          if (localMatch) {
            return localMatch;
          }

          return {
            id: backendItem.contentId,
            title: backendItem.title,
            mediaType: backendItem.mediaType,
            media_type: backendItem.mediaType,
            poster_path: backendItem.posterPath,
            backdrop_path: backendItem.backdropPath,
          };
        });

        setMyList(hydrated);
        localStorage.setItem(myListKey, JSON.stringify(hydrated));
      } catch (error) {
        console.error("Backend My List load failed:", error);

        // Keep the existing local version as a fallback.
        try {
          const saved = JSON.parse(localStorage.getItem(myListKey)) || [];

          setMyList(saved);
        } catch {
          setMyList([]);
        }
      }
    };

    loadMyList();
  }, [myListKey]);
  /* =======================================================
   LOAD CONTINUE WATCHING
======================================================= */

useEffect(() => {
  const loadContinueWatching = async () => {
    try {
      const backendItems = await getContinueWatching();

      const hydrated = backendItems
        .filter(
          (item) =>
            item?.contentId &&
            Number(item.progress) < 95,
        )
        .map((item) => ({
          id: item.contentId,

          mediaType:
            item.mediaType || "playable",

          title:
            item.title || "Untitled",

          overview:
            item.overview || "",

          posterUrl:
            item.posterUrl || "",

          backdropUrl:
            item.backdropUrl || "",

          release_date:
            item.year || "",

          progress:
            Number(item.progress) || 0,

          currentTime:
            Number(item.currentTime) || 0,

          watchedAt:
            item.watchedAt
              ? new Date(item.watchedAt).getTime()
              : Date.now(),
        }))
        .sort(
          (a, b) =>
            (b.watchedAt || 0) -
            (a.watchedAt || 0),
        );

      setContinueWatching(hydrated);

      /*
       * Keep localStorage as a UI/offline cache,
       * but MongoDB is now the source of truth.
       */
      localStorage.setItem(
        continueWatchingKey,
        JSON.stringify(hydrated),
      );
    } catch (error) {
      console.error(
        "Backend Continue Watching load failed:",
        error,
      );

      /*
       * Fallback if backend is temporarily unavailable.
       */
      try {
        const saved =
          JSON.parse(
            localStorage.getItem(
              continueWatchingKey,
            ),
          ) || [];

        const ordered = saved
          .filter(
            (item) =>
              item?.id &&
              Number(item.progress) < 95,
          )
          .sort(
            (a, b) =>
              (b.watchedAt || 0) -
              (a.watchedAt || 0),
          );

        setContinueWatching(ordered);
      } catch {
        setContinueWatching([]);
      }
    }
  };

  loadContinueWatching();

  window.addEventListener(
    "focus",
    loadContinueWatching,
  );

  return () => {
    window.removeEventListener(
      "focus",
      loadContinueWatching,
    );
  };
}, [continueWatchingKey]);

  /* =======================================================
     MY LIST FUNCTIONS
  ======================================================= */

  const toggleMyListItem = async (item) => {
    const mediaType = typeOf(item);
    const contentId = String(item.id);

    const exists = myList.some(
      (saved) => String(saved.id) === contentId && typeOf(saved) === mediaType,
    );

    try {
      if (exists) {
        await removeFromMyList(mediaType, contentId);

        const next = myList.filter(
          (saved) =>
            !(String(saved.id) === contentId && typeOf(saved) === mediaType),
        );

        setMyList(next);

        localStorage.setItem(myListKey, JSON.stringify(next));
      } else {
        await addToMyList({
          contentId,
          mediaType,
          title: titleOf(item),
          posterPath: item.poster_path || "",
          backdropPath: item.backdrop_path || "",
        });

        const itemToSave = {
          ...item,
          mediaType,
          media_type: mediaType,
        };

        const next = [...myList, itemToSave];

        setMyList(next);

        localStorage.setItem(myListKey, JSON.stringify(next));
      }
    } catch (error) {
      console.error("Backend My List update failed:", error);
    }
  };

  const removeContinueWatching = async (item) => {
  const mediaType = typeOf(item);
  const contentId = String(item.id);

  try {
    await removeFromContinueWatching(
      mediaType,
      contentId,
    );

    setContinueWatching((current) => {
      const next = current.filter(
        (saved) =>
          !(
            String(saved.id) ===
              contentId &&
            typeOf(saved) ===
              mediaType
          ),
      );

      localStorage.setItem(
        continueWatchingKey,
        JSON.stringify(next),
      );

      return next;
    });
  } catch (error) {
    console.error(
      "Backend Continue Watching remove failed:",
      error,
    );
  }
};

  const openMyList = () => {
    setMyListOpen(true);
    setSearchOpen(false);
    setQuery("");
    setNoticeOpen(false);
    setProfileOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goHome = () => {
    setMyListOpen(false);
    setSearchOpen(false);
    setQuery("");
    setMobileMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const navigateMobile = (route) => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setQuery("");
    setNoticeOpen(false);
    setProfileOpen(false);
    navigate(route);
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    sessionStorage.removeItem("stream_active_profile");

    setMobileMenuOpen(false);
    setNoticeOpen(false);
    setProfileOpen(false);

    navigate("/login");
  };

  /* =======================================================
     NAVBAR SCROLL
  ======================================================= */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 35);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =======================================================
     FETCH CONTENT
  ======================================================= */

  useEffect(() => {
    getBrowseContent()
      .then((data) => {
        setContent(data);

        if (!Object.values(data).some((items) => items.length)) {
          setError("STREAM could not load titles right now.");
        }
      })
      .catch(() => {
        setError("STREAM could not load titles right now.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /* =======================================================
     HERO
  ======================================================= */

  const heroMovies = useMemo(() => {
    const source = [...content.trending, ...content.popular];

    const seen = new Set();

    return source
      .filter((item) => {
        if (!item?.backdrop_path || seen.has(item.id)) {
          return false;
        }

        seen.add(item.id);

        return true;
      })
      .slice(0, 5);
  }, [content]);

  const hero = heroMovies[heroIndex] || content.popular[0];

  useEffect(() => {
    if (heroMovies.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setHeroIndex((current) =>
        current >= heroMovies.length - 1 ? 0 : current + 1,
      );
    }, 9000);

    return () => clearInterval(interval);
  }, [heroMovies.length]);

  /* =======================================================
     SEARCH
  ======================================================= */

  const allTitles = useMemo(() => {
    const seen = new Set();

    return Object.values(content)
      .flat()
      .filter((item) => {
        const key = `${typeOf(item)}-${item.id}`;

        if (seen.has(key)) {
          return false;
        }

        seen.add(key);

        return true;
      });
  }, [content]);

  const results = query.trim()
    ? allTitles
        .filter((item) =>
          titleOf(item).toLowerCase().includes(query.trim().toLowerCase()),
        )
        .slice(0, 18)
    : [];

  const goToRow = (key) => {
    const label = ROW_LABELS[key];

    if (!label) return;

    setMyListOpen(false);

    setTimeout(() => {
      document
        .getElementById(`row-${label.toLowerCase().replaceAll(" ", "-")}`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const homeActive = !myListOpen;

  return (
    <main
      className="min-h-screen overflow-x-hidden bg-[#050507] text-white"
      style={UI_FONT}
      onClick={() => {
        if (noticeOpen) {
          setNoticeOpen(false);
        }

        if (profileOpen) {
          setProfileOpen(false);
        }
      }}
    >
      {/* SIDEBAR */}

      <aside className="fixed inset-y-0 left-0 z-[70] hidden w-[72px] flex-col border-r border-white/[0.045] bg-[#07070a]/90 backdrop-blur-xl lg:flex">
        <button
          type="button"
          onClick={goHome}
          className="flex h-[78px] items-center justify-center border-b border-white/[0.045]"
        >
          <span
            className="text-[20px] font-semibold text-violet-400"
            style={DISPLAY_FONT}
          >
            S
          </span>
        </button>

        <div className="mt-5 flex-1">
          <SidebarItem
            icon="home"
            label="Home"
            active={homeActive}
            onClick={goHome}
          />

          <SidebarItem
            icon="tv"
            label="TV"
            onClick={() => navigate("/tv-shows")}
          />

          <SidebarItem
            icon="movie"
            label="Movies"
            onClick={() => navigate("/movies")}
          />

          <SidebarItem
            icon="spark"
            label="New"
            onClick={() => navigate("/new-popular")}
          />

          <SidebarItem
            icon="list"
            label="My List"
            active={myListOpen}
            onClick={openMyList}
          />
        </div>
        <SidebarItem
          icon="settings"
          label="Settings"
          onClick={() => navigate("/settings")}
        />
      </aside>

      <div className="lg:ml-[72px]">
        {/* NAVBAR */}

        <header
          className={`fixed left-0 right-0 top-0 z-[60] transition-all duration-500 lg:left-[72px] ${
            scrolled || myListOpen
              ? "border-b border-violet-300/[0.07] bg-[#110a1d]/78 shadow-[0_14px_45px_rgba(0,0,0,0.22)] backdrop-blur-2xl"
              : "bg-gradient-to-b from-black/65 via-black/20 to-transparent"
          }`}
        >
          <div
            className={`flex items-center px-7 transition-all duration-500 sm:px-9 lg:px-12 xl:px-14 ${
              scrolled || myListOpen ? "h-[68px]" : "h-[78px]"
            }`}
          >
            <button
              type="button"
              onClick={goHome}
              className="shrink-0 text-[25px] font-semibold tracking-[0.16em] text-violet-400 transition hover:text-violet-300"
              style={DISPLAY_FONT}
            >
              STREAM
            </button>
            <nav className="ml-16 hidden items-center gap-9 md:flex lg:ml-[72px] lg:gap-10 xl:ml-20">
              {[
                ["Home", null],
                ["TV Shows", "tv"],
                ["Movies", "movies"],
                ["New & Popular", "popular"],
                ["My List", null],
              ].map(([label, key]) => {
                const active =
                  (label === "Home" && !myListOpen) ||
                  (label === "My List" && myListOpen);

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      if (label === "Home") {
                        goHome();
                      } else if (label === "TV Shows") {
                        navigate("/tv-shows");
                      } else if (label === "Movies") {
                        navigate("/movies");
                      } else if (label === "New & Popular") {
                        navigate("/new-popular");
                      } else if (label === "My List") {
                        openMyList();
                      }
                    }}
                    className={`group relative whitespace-nowrap py-2 text-[13px] font-medium tracking-[-0.01em] transition-colors duration-300 lg:text-[14px] ${
                      active ? "text-white" : "text-white/50 hover:text-white"
                    }`}
                  >
                    {label}

                    <span
                      className={`absolute -bottom-1 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300 ${
                        active
                          ? "w-6 opacity-100"
                          : "w-0 opacity-0 group-hover:w-5 group-hover:opacity-100"
                      }`}
                    />
                  </button>
                );
              })}
            </nav>
            <div className="ml-auto flex items-center gap-2.5">
              <div
                className={`flex items-center overflow-hidden rounded-full border transition-all duration-300 ${
                  searchOpen
                    ? "w-[220px] border-violet-300/[0.1] bg-black/25 px-2 xl:w-[250px]"
                    : "w-10 border-transparent"
                }`}
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();

                    setSearchOpen((current) => !current);

                    setMyListOpen(false);

                    if (searchOpen) {
                      setQuery("");
                    }
                  }}
                  className="grid h-10 w-9 shrink-0 place-items-center rounded-full text-white/65 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <Icon name="search" />
                </button>

                {searchOpen && (
                  <input
                    autoFocus
                    value={query}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search STREAM..."
                    className="w-full bg-transparent px-1 text-[12px] text-white outline-none placeholder:text-white/25"
                  />
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();

                    setNoticeOpen((current) => !current);

                    setProfileOpen(false);
                    setMobileMenuOpen(false);
                  }}
                  className="relative grid h-10 w-10 place-items-center rounded-full text-white/65 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <Icon name="bell" />

                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
                </button>

                {noticeOpen && (
                  <div
                    onClick={(event) => event.stopPropagation()}
                    className="absolute right-0 top-12 w-72 overflow-hidden rounded-2xl border border-violet-300/[0.1] bg-[#100a18]/92 shadow-[0_25px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
                  >
                    <div className="border-b border-white/[0.07] p-4">
                      <p className="text-sm font-semibold">New arrivals</p>

                      <p className="mt-1 text-[11px] leading-5 text-white/40">
                        Fresh titles have been added to STREAM.
                      </p>
                    </div>

                    <div className="p-4">
                      <p className="text-sm font-semibold">
                        Picks for {activeName}
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-white/40">
                        New recommendations are ready.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();

                    setProfileOpen((current) => !current);

                    setNoticeOpen(false);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 rounded-full p-1 pr-2.5 transition hover:bg-white/[0.05]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-[10px] font-semibold text-white">
                    {activeName?.charAt(0)?.toUpperCase()}
                  </div>

                  <span className="hidden max-w-[80px] truncate text-[11px] font-medium text-white/70 xl:block">
                    {activeName}
                  </span>

                  <span
                    className={`text-[7px] text-white/35 transition-transform duration-300 ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {profileOpen && (
                  <div
                    onClick={(event) => event.stopPropagation()}
                    className="absolute right-0 top-12 w-52 overflow-hidden rounded-2xl border border-violet-300/[0.1] bg-[#100a18]/92 py-2 text-xs shadow-[0_25px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
                  >
                    <div className="border-b border-white/[0.07] px-4 py-3">
                      <p className="font-semibold">{activeName}</p>

                      <p className="mt-0.5 text-[9px] text-white/30">
                        Active profile
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/whos-watching")}
                      className="block w-full px-4 py-2.5 text-left text-white/60 hover:bg-violet-400/[0.08] hover:text-white"
                    >
                      Switch Profile
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/settings")}
                      className="block w-full px-4 py-2.5 text-left text-white/60 hover:bg-violet-400/[0.08] hover:text-white"
                    >
                      Account & Settings
                    </button>

                    <div className="my-1 border-t border-white/[0.07]" />

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="block w-full px-4 py-2.5 text-left text-red-300/70 hover:bg-red-400/[0.06] hover:text-red-300"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* SEARCH RESULTS */}

        {searchOpen && query && (
          <section className="min-h-screen px-7 pb-24 pt-32 sm:px-9 lg:px-12 xl:px-14">
            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-violet-400">
              Search
            </p>

            <h1
              className="mb-10 mt-3 text-[36px] font-semibold"
              style={DISPLAY_FONT}
            >
              Results for “{query}”
            </h1>

            {results.length ? (
              <div className="grid grid-cols-3 gap-x-5 gap-y-9 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
                {results.map((item) => (
                  <button
                    key={`${typeOf(item)}-${item.id}`}
                    type="button"
                    onClick={() =>
                      navigate(`/title/${typeOf(item)}/${item.id}`)
                    }
                    className="group text-left"
                  >
                    <div className="aspect-[2/3] overflow-hidden rounded-lg bg-white/[0.04]">
                      <img
                        src={
                          item.poster_path
                            ? getPosterUrl(item.poster_path)
                            : getBackdropUrl(item.backdrop_path)
                        }
                        alt={titleOf(item)}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>

                    <p className="mt-2.5 truncate text-[11px] font-medium text-white/65">
                      {titleOf(item)}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40">No titles found.</p>
            )}
          </section>
        )}

        {/* MY LIST */}

        {myListOpen && !searchOpen && (
          <section className="min-h-screen px-7 pb-24 pt-32 sm:px-9 lg:px-12 xl:px-14">
            <div className="mb-12">
              <p className="text-[9px] font-semibold uppercase tracking-[0.34em] text-violet-400">
                Your collection
              </p>

              <h1
                className="mt-3 text-[44px] font-semibold text-white sm:text-[52px]"
                style={DISPLAY_FONT}
              >
                My List
              </h1>

              <p className="mt-3 text-[12px] text-white/35">
                {myList.length
                  ? `${myList.length} saved ${
                      myList.length === 1 ? "title" : "titles"
                    }`
                  : "Save titles you want to come back to."}
              </p>
            </div>

            {myList.length ? (
              <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {myList.map((item) => (
                  <article key={`${typeOf(item)}-${item.id}`} className="group">
                    <div className="relative aspect-[2/3] overflow-hidden rounded-[12px] border border-white/[0.06] bg-[#111015] shadow-[0_14px_40px_rgba(0,0,0,0.35)]">
                      <img
                        src={
                          item.poster_path
                            ? getPosterUrl(item.poster_path)
                            : getBackdropUrl(item.backdrop_path)
                        }
                        alt={titleOf(item)}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-90" />

                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <h3
                          className="line-clamp-2 text-[24px] font-semibold leading-none text-white"
                          style={DISPLAY_FONT}
                        >
                          {titleOf(item)}
                        </h3>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[9px] text-white/45">
                          {yearOf(item) && (
                            <>
                              <span>{yearOf(item)}</span>

                              <span className="text-white/20">•</span>
                            </>
                          )}

                          <span>HD</span>

                          <span className="text-white/20">•</span>

                          <span className="font-medium text-violet-300">
                            {Math.round((item.vote_average || 0) * 10)}% Match
                          </span>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/watch/${typeOf(item)}/${item.id}`)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black"
                          >
                            <Icon name="play" className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/title/${typeOf(item)}/${item.id}`)
                            }
                            className="h-9 rounded-full border border-white/[0.1] bg-white/[0.08] px-4 text-[9px] text-white/75"
                          >
                            Details
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleMyListItem(item)}
                            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.1] bg-black/35 text-white/55"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[430px] items-center justify-center rounded-[24px] border border-dashed border-white/[0.07] bg-white/[0.012]">
                <div className="max-w-sm px-6 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-violet-400/15 bg-violet-500/[0.08] text-violet-300">
                    <Icon name="plus" className="h-5 w-5" />
                  </div>

                  <h2
                    className="mt-5 text-[30px] font-semibold text-white"
                    style={DISPLAY_FONT}
                  >
                    Your list is empty.
                  </h2>

                  <p className="mt-3 text-[12px] leading-6 text-white/35">
                    Hover over any movie or series and add it to your personal
                    STREAM collection.
                  </p>

                  <button
                    type="button"
                    onClick={goHome}
                    className="mt-6 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 py-3 text-[11px] font-semibold text-white"
                  >
                    Explore STREAM
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* HOME */}

        {(!searchOpen || !query) && !myListOpen && (
          <>
            {hero && (
              <section className="relative h-[78vh] min-h-[610px] max-h-[770px] overflow-hidden">
                <img
                  key={hero.id}
                  src={getBackdropUrl(hero.backdrop_path)}
                  alt={titleOf(hero)}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-[#050507] via-[#050507]/72 to-transparent" />

                <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/5 to-black/20" />

                <div className="relative z-10 flex h-full items-center px-7 pt-32 sm:px-9 lg:px-12 lg:pt-36 xl:px-14">
                  <div className="max-w-[590px]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-violet-400">
                      STREAM Original
                    </p>

                    <h1
                      className="mt-6 max-w-[580px] text-[50px] font-semibold leading-[0.92] tracking-[-0.025em] text-white sm:text-[58px] lg:text-[66px] xl:text-[72px]"
                      style={DISPLAY_FONT}
                    >
                      {titleOf(hero)}
                    </h1>

                    <div className="mt-8 flex flex-wrap items-center gap-4 text-[11px] font-medium text-white/45">
                      {yearOf(hero) && <span>{yearOf(hero)}</span>}

                      <span className="rounded border border-white/15 px-1.5 py-[2px]">
                        16+
                      </span>

                      <span className="rounded border border-white/15 px-1.5 py-[2px]">
                        HD
                      </span>

                      <span className="font-semibold text-violet-300">
                        {Math.round((hero.vote_average || 0) * 10)}% Match
                      </span>
                    </div>

                    <p className="mt-7 line-clamp-3 max-w-[470px] text-[13px] font-normal leading-[1.8] text-white/58">
                      {hero.overview}
                    </p>

                    <div className="mt-8 flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/watch/${typeOf(hero)}/${hero.id}`)
                        }
                        className="flex items-center gap-2.5 rounded-md bg-white px-6 py-3 text-[13px] font-semibold text-black"
                      >
                        <Icon name="play" className="h-3 w-3" />
                        Play
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/title/${typeOf(hero)}/${hero.id}`)
                        }
                        className="flex items-center gap-2.5 rounded-md border border-white/[0.08] bg-white/[0.08] px-6 py-3 text-[13px] font-medium text-white"
                      >
                        <Icon name="info" className="h-4 w-4" />
                        More Info
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {error && (
              <div className="mx-7 mb-10 rounded-lg border border-red-400/20 bg-red-400/[0.05] p-3 text-xs text-red-200/75 sm:mx-9 lg:mx-12 xl:mx-14">
                {error}
              </div>
            )}

            <div className="relative z-20 mt-14 pb-28">
              {continueWatching.length > 0 && (
                <ContinueWatchingRow
                  items={continueWatching}
                  navigate={navigate}
                  onRemove={removeContinueWatching}
                />
              )}

              <PlayableContentRow items={playableContent} navigate={navigate} />

              <ContentRow
                label="Trending Now"
                items={content.trending}
                navigate={navigate}
                myList={myList}
                onToggleMyList={toggleMyListItem}
              />

              <ContentRow
                label="New & Popular"
                items={content.popular}
                navigate={navigate}
                myList={myList}
                onToggleMyList={toggleMyListItem}
              />

              <ContentRow
                label={`Top Picks for ${activeName}`}
                items={content.topRated}
                navigate={navigate}
                myList={myList}
                onToggleMyList={toggleMyListItem}
              />

              <ContentRow
                label="Movies"
                items={content.movies}
                navigate={navigate}
                myList={myList}
                onToggleMyList={toggleMyListItem}
              />

              <ContentRow
                label="TV Shows"
                items={content.tv}
                navigate={navigate}
                myList={myList}
                onToggleMyList={toggleMyListItem}
              />

              <ContentRow
                label="Action"
                items={content.action}
                navigate={navigate}
                myList={myList}
                onToggleMyList={toggleMyListItem}
              />

              <ContentRow
                label="Comedy"
                items={content.comedy}
                navigate={navigate}
                myList={myList}
                onToggleMyList={toggleMyListItem}
              />

              <ContentRow
                label="Drama"
                items={content.drama}
                navigate={navigate}
                myList={myList}
                onToggleMyList={toggleMyListItem}
              />
            </div>
          </>
        )}
      </div>

      {/* =====================================================
          MOBILE MORE MENU
      ====================================================== */}

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[85] bg-black/55 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="absolute bottom-[78px] left-3 right-3 overflow-hidden rounded-[24px] border border-violet-300/[0.10] bg-[#100a18]/98 p-3 shadow-[0_-20px_80px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-3 pb-3 pt-1">
              <div>
                <p
                  className="text-lg font-semibold text-violet-300"
                  style={DISPLAY_FONT}
                >
                  STREAM
                </p>

                <p className="mt-0.5 text-[9px] text-white/30">
                  More
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.05] text-sm text-white/50"
              >
                ✕
              </button>
            </div>

            <div className="mt-2">
              <MobileMenuItem
                icon="spark"
                title="New & Popular"
                subtitle="Discover what's trending"
                onClick={() => navigateMobile("/new-popular")}
              />

              <MobileMenuItem
                icon="settings"
                title="Settings"
                subtitle="Manage your STREAM account"
                onClick={() => navigateMobile("/settings")}
              />

              <MobileMenuItem
                icon="user"
                title="Switch Profile"
                subtitle={`Currently watching as ${activeName}`}
                onClick={() => navigateMobile("/whos-watching")}
              />

              <div className="my-2 h-px bg-white/[0.06]" />

              <MobileMenuItem
                icon="logout"
                title="Sign Out"
                subtitle="Sign out of your STREAM account"
                danger
                onClick={handleSignOut}
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
      ====================================================== */}

      <nav className="fixed bottom-0 left-0 right-0 z-[90] flex h-[70px] items-stretch border-t border-violet-300/[0.08] bg-[#09070d]/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:hidden">
        <MobileNavItem
          icon="home"
          label="Home"
          active={!myListOpen}
          onClick={goHome}
        />

        <MobileNavItem
          icon="tv"
          label="TV"
          onClick={() => navigateMobile("/tv-shows")}
        />

        <MobileNavItem
          icon="movie"
          label="Movies"
          onClick={() => navigateMobile("/movies")}
        />

        <MobileNavItem
          icon="list"
          label="My List"
          active={myListOpen}
          onClick={() => navigateMobile("/my-list")}
        />

        <MobileNavItem
          icon="more"
          label="More"
          active={mobileMenuOpen}
          onClick={() => {
            setNoticeOpen(false);
            setProfileOpen(false);
            setMobileMenuOpen((current) => !current);
          }}
        />
      </nav>
    </main>
  );
}
