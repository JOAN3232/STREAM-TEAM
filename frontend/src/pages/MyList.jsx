import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import StreamingLayout from "../components/StreamingLayout";

import { getPosterUrl } from "../services/tmdbService";

import { getMyList, removeFromMyList } from "../services/myListService";

const UI_FONT = {
  fontFamily: '"Manrope", "Inter", "Helvetica Neue", Arial, sans-serif',
};

const DISPLAY_FONT = {
  fontFamily: '"Cormorant Garamond", "Georgia", serif',
};

const typeOf = (item) => {
  if (item?.mediaType === "playable") {
    return "playable";
  }

  if (
    item?.mediaType === "tv" ||
    item?.media_type === "tv" ||
    item?.first_air_date
  ) {
    return "tv";
  }

  return "movie";
};

const titleOf = (item) => item?.title || item?.name || "Untitled";

const yearOf = (item) =>
  (item?.release_date || item?.first_air_date || item?.year || "")
    .toString()
    .slice(0, 4) || "New";

const imageOf = (item) => {
  if (item?.posterUrl) {
    return item.posterUrl;
  }

  if (item?.poster_path) {
    return getPosterUrl(item.poster_path);
  }

  return "";
};

export default function MyList() {
  const navigate = useNavigate();

  const [myList, setMyList] = useState([]);

  const [search, setSearch] = useState("");

  let storedProfile = null;

  try {
    storedProfile = JSON.parse(sessionStorage.getItem("stream_active_profile"));
  } catch {
    storedProfile = null;
  }

  const activeProfileId =
    storedProfile?.id ||
    storedProfile?._id ||
    storedProfile?.profileId ||
    storedProfile?.name ||
    "default";

  const activeName = storedProfile?.name || "Profile";

  const myListKey = `stream_my_list_${activeProfileId}`;

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
        console.error("Failed to load My List:", error);

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

  const filteredList = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return myList;
    }

    return myList.filter((item) => titleOf(item).toLowerCase().includes(query));
  }, [myList, search]);

const removeFromList = async (item) => {
  const mediaType = typeOf(item);
  const contentId = String(item.id);

  try {
    await removeFromMyList(
      mediaType,
      contentId
    );

    const next = myList.filter(
      (saved) =>
        !(
          String(saved.id) === contentId &&
          typeOf(saved) === mediaType
        )
    );

    setMyList(next);

    localStorage.setItem(
      myListKey,
      JSON.stringify(next)
    );
  } catch (error) {
    console.error(
      "Failed to remove from My List:",
      error
    );
  }
};

  const playItem = (item) => {
    const mediaType = typeOf(item);

    if (mediaType === "playable") {
      navigate(`/watch/playable/${item.id}`);

      return;
    }

    navigate(`/watch/${mediaType}/${item.id}`);
  };

  const openDetails = (item) => {
    const mediaType = typeOf(item);

    if (mediaType === "playable") {
      playItem(item);
      return;
    }

    navigate(`/title/${mediaType}/${item.id}`);
  };

  return (
    <StreamingLayout>
      <main
        className="min-h-screen bg-[#050507] pb-24 pt-[110px] text-white"
        style={UI_FONT}
      >
        <div className="mx-auto max-w-[1500px] px-6 sm:px-8 lg:px-12 xl:px-14">
          {/* HEADER */}

          <div className="flex flex-col gap-6 border-b border-white/[0.06] pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-violet-300">
                Saved for you
              </p>

              <h1
                className="mt-3 text-4xl font-semibold sm:text-5xl"
                style={DISPLAY_FONT}
              >
                My List
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/40">
                Everything {activeName} has saved, all in one place.
              </p>
            </div>

            {myList.length > 0 && (
              <div className="w-full md:w-[280px]">
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search My List..."
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/40 focus:bg-violet-500/[0.05]"
                />
              </div>
            )}
          </div>

          {/* EMPTY LIST */}

          {myList.length === 0 && (
            <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-violet-400/10 bg-violet-500/[0.06] text-3xl text-violet-300">
                +
              </div>

              <h2 className="mt-6 text-3xl font-semibold" style={DISPLAY_FONT}>
                Your list is waiting.
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-white/40">
                Add movies and TV shows you want to watch later and they’ll
                appear here.
              </p>

              <button
                type="button"
                onClick={() => navigate("/browse")}
                className="mt-7 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/85"
              >
                Browse STREAM
              </button>
            </div>
          )}

          {/* NO SEARCH RESULTS */}

          {myList.length > 0 && filteredList.length === 0 && (
            <div className="flex min-h-[45vh] flex-col items-center justify-center text-center">
              <h2 className="text-3xl font-semibold" style={DISPLAY_FONT}>
                Nothing found.
              </h2>

              <p className="mt-3 text-sm text-white/40">
                No saved title matches “{search}”.
              </p>
            </div>
          )}

          {/* GRID */}

          {filteredList.length > 0 && (
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredList.map((item) => {
                const mediaType = typeOf(item);

                const image = imageOf(item);

                return (
                  <article key={`${mediaType}-${item.id}`} className="group">
                    <div className="relative aspect-[2/3] overflow-hidden rounded-[18px] border border-white/[0.07] bg-white/[0.03] shadow-[0_18px_50px_rgba(0,0,0,0.25)] transition duration-300 group-hover:-translate-y-2 group-hover:border-violet-400/30">
                      {image ? (
                        <img
                          src={image}
                          alt={titleOf(item)}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-4 text-center text-xs text-white/30">
                          {titleOf(item)}
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-65 transition group-hover:opacity-90" />

                      <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => playItem(item)}
                            className="flex flex-1 items-center justify-center rounded-lg bg-white px-3 py-2 text-[11px] font-semibold text-black transition hover:bg-white/85"
                          >
                            ▶ Play
                          </button>

                          <button
                            type="button"
                            onClick={() => openDetails(item)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-black/45 text-xs text-white backdrop-blur-md transition hover:border-violet-300/60 hover:bg-violet-500/20"
                          >
                            i
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => openDetails(item)}
                          className="min-w-0 text-left"
                        >
                          <p className="truncate text-sm font-medium text-white/80 transition hover:text-white">
                            {titleOf(item)}
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => removeFromList(item)}
                          title="Remove from My List"
                          className="shrink-0 text-sm text-white/25 transition hover:text-red-300"
                        >
                          ×
                        </button>
                      </div>

                      <div className="mt-1.5 flex items-center gap-2 text-[9px] uppercase tracking-[0.12em] text-white/30">
                        <span>{yearOf(item)}</span>

                        <span>•</span>

                        <span>
                          {mediaType === "tv"
                            ? "TV Show"
                            : mediaType === "playable"
                              ? "STREAM"
                              : "Movie"}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </StreamingLayout>
  );
}
