import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getBackdropUrl,
  getTrendingMovies,
} from "../services/tmdbService";

/* =========================================
   API
========================================= */

const PROFILE_API = "http://localhost:8081/api/profiles";

/* =========================================
   CHARACTER AVATARS
========================================= */

const CHARACTER_AVATARS = [
  {
    id: "spiderman",
    name: "Spider-Man",
    category: "Heroes",
    images: [
      "https://cdn.whitescreen.dev/spider-man-pfp-spider-man-avatar-built-for-strong-identity-and-recognition-agoz-square_hd-0226_800.webp",
      "https://avatars.pfptown.com/137/spiderman-pfp-2314.png",
    ],
  },
  {
    id: "wednesday",
    name: "Wednesday",
    category: "Girls",
    images: [
      "https://www.hindustantimes.com/ht-img/img/2025/08/06/1200x1600/wednesday_1754481889556_1754481889786_1754501831171_1754503080142.jpg",
    ],
  },
  {
    id: "wonder-woman",
    name: "Wonder Woman",
    category: "Girls",
    images: [
      "https://e0.pxfuel.com/wallpapers/945/442/desktop-wallpaper-wonder-woman-gal-gadot-gal-gadot-wonder-woman-gal-cute-wonder-woman.jpg",
    ],
  },
  {
    id: "harley",
    name: "Harley Quinn",
    category: "Girls",
    images: [
      "https://conteudo.imguol.com.br/c/entretenimento/1c/2017/08/17/arlequina---margot-robbie-1502981761342_v2_1x1.jpg",
    ],
  },
  {
    id: "gwen",
    name: "Gwen Stacy",
    category: "Girls",
    images: [
      "https://m.media-amazon.com/images/M/MV5BMzE1MTc4OGMtOTU2OC00Zjg1LWJmMjUtNDQzNTQyMDlmOTRlXkEyXkFqcGc%40._V1_.jpg",
    ],
  },
  {
    id: "barbie",
    name: "Barbie",
    category: "Girls",
    images: [
      "https://i.pinimg.com/736x/a4/ed/44/a4ed44bcb3249df6bfecf43072cb0321.jpg",
    ],
  },
  {
    id: "batman",
    name: "Batman",
    category: "Heroes",
    images: [
      "https://cdn.whitescreen.dev/batman-pfp-batman-avatar-with-stoic-expression-and-clean-composition-nocl-square_hd-b252_800.webp",
    ],
  },
  {
    id: "deadpool",
    name: "Deadpool",
    category: "Heroes",
    images: [
      "https://avatarfiles.alphacoders.com/129/129094.jpg",
    ],
  },
];

/* =========================================
   CHARACTER AVATAR
========================================= */

function CharacterAvatar({ avatar, className = "" }) {
  const [imageIndex, setImageIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setImageIndex(0);
    setFailed(false);
  }, [avatar?.id]);

  if (!avatar) return null;

  const handleError = () => {
    const next = imageIndex + 1;

    if (next < avatar.images.length) {
      setImageIndex(next);
    } else {
      setFailed(true);
    }
  };

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-violet-700 via-purple-700 to-fuchsia-700 ${className}`}
    >
      {!failed && avatar.images?.[imageIndex] ? (
        <img
          src={avatar.images[imageIndex]}
          alt={avatar.name}
          onError={handleError}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span
            className="text-xl font-semibold text-white/90"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
            }}
          >
            {avatar.name.charAt(0)}
          </span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/[0.04]" />
    </div>
  );
}

/* =========================================
   PAGE
========================================= */

export default function WhosWatching() {
  const navigate = useNavigate();

  const [backgrounds, setBackgrounds] = useState([]);
  const [currentBackground, setCurrentBackground] = useState(0);

  const [profiles, setProfiles] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [kidsProfile, setKidsProfile] = useState(false);
  const [error, setError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [selectedAvatar, setSelectedAvatar] = useState(
    CHARACTER_AVATARS[0]
  );

  const [category, setCategory] = useState("All");

  /* =========================================
     LOAD SAVED PROFILES FROM MONGODB
  ========================================= */

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        setProfilesLoading(true);

        const response = await fetch(PROFILE_API);

        if (!response.ok) {
          throw new Error("Unable to load profiles");
        }

        const data = await response.json();

        const formattedProfiles = data.map((profile) => {
          const avatar =
            CHARACTER_AVATARS.find(
              (item) => item.id === profile.avatarId
            ) || CHARACTER_AVATARS[0];

          return {
            ...profile,
            avatar,
          };
        });

        setProfiles(formattedProfiles);
      } catch (error) {
        console.error("Profile loading failed:", error);
      } finally {
        setProfilesLoading(false);
      }
    };

    loadProfiles();
  }, []);

  /* =========================================
     LOAD MOVIE BACKGROUNDS
  ========================================= */

  useEffect(() => {
    const loadBackgrounds = async () => {
      try {
        const movies = await getTrendingMovies();

        const available = movies
          .filter((movie) => movie.backdrop_path)
          .slice(0, 8)
          .map((movie) => ({
            id: movie.id,
            image: getBackdropUrl(movie.backdrop_path),
          }));

        setBackgrounds(available);
      } catch (error) {
        console.error(
          "Who's Watching background error:",
          error
        );
      }
    };

    loadBackgrounds();
  }, []);

  /* =========================================
     BACKGROUND SLIDESHOW
  ========================================= */

  useEffect(() => {
    if (backgrounds.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBackground((current) =>
        current >= backgrounds.length - 1
          ? 0
          : current + 1
      );
    }, 6500);

    return () => clearInterval(interval);
  }, [backgrounds.length]);

  /* =========================================
     MODAL
  ========================================= */

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    if (savingProfile) return;

    setShowModal(false);
    setName("");
    setKidsProfile(false);
    setError("");
    setCategory("All");
    setSelectedAvatar(CHARACTER_AVATARS[0]);
  };

  /* =========================================
     SAVE PROFILE TO MONGODB
  ========================================= */

  const handleSaveProfile = async () => {
    const cleanName = name.trim();

    if (!cleanName) {
      setError("Enter a profile name.");
      return;
    }

    if (savingProfile) return;

    try {
      setSavingProfile(true);
      setError("");

      const response = await fetch(PROFILE_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanName,
          avatarId: selectedAvatar.id,
          kids: kidsProfile,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to save profile");
      }

      const savedProfile = await response.json();

      const formattedProfile = {
        ...savedProfile,
        avatar:
          CHARACTER_AVATARS.find(
            (item) => item.id === savedProfile.avatarId
          ) || selectedAvatar,
      };

      setProfiles((current) => [
        ...current,
        formattedProfile,
      ]);

      setShowModal(false);
      setName("");
      setKidsProfile(false);
      setError("");
      setCategory("All");
      setSelectedAvatar(CHARACTER_AVATARS[0]);
    } catch (error) {
      console.error("Profile creation failed:", error);

      setError(
        "We couldn't save this profile. Please try again."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  /* =========================================
     OPEN PROFILE
  ========================================= */

  const handleProfileClick = (profile) => {
    sessionStorage.setItem(
      "stream_active_profile",
      JSON.stringify({
        id: profile.id,
        name: profile.name,
        avatarId: profile.avatar?.id || profile.avatarId,
        kids: profile.kids,
      })
    );

    navigate(
      `/browse?profile=${encodeURIComponent(
        profile.name
      )}`
    );
  };

  /* =========================================
     FILTER
  ========================================= */

  const categories = ["All", "Girls", "Heroes"];

  const shownAvatars =
    category === "All"
      ? CHARACTER_AVATARS
      : CHARACTER_AVATARS.filter(
          (avatar) => avatar.category === category
        );

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050407] text-white">

      {/* =====================================
          CINEMATIC MOVIE BACKGROUND
      ====================================== */}

      <div className="fixed inset-0 overflow-hidden">
        {backgrounds.map((movie, index) => (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-all duration-[2200ms] ease-out ${
              index === currentBackground
                ? "scale-100 opacity-100"
                : "scale-[1.04] opacity-0"
            }`}
          >
            <img
              src={movie.image}
              alt=""
              className="h-full w-full object-cover object-center"
            />
          </div>
        ))}

        {backgrounds.length === 0 && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#171022] via-[#09070f] to-black" />
        )}

        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/5 to-[#050407]/95" />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(5,4,8,0.22)_55%,rgba(5,4,8,0.82)_100%)]" />

        <div className="absolute left-1/2 top-[48%] h-[450px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-700/[0.08] blur-[130px]" />
      </div>

      {/* =====================================
          HEADER
      ====================================== */}

      <header className="relative z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 sm:px-10 lg:px-14">

          <button
            type="button"
            onClick={() => navigate("/whos-watching")}
            className="group flex items-center gap-3"
          >
            <span
              className="text-2xl font-bold tracking-[0.18em] text-violet-300 transition group-hover:text-violet-200 sm:text-3xl"
              style={{
                fontFamily:
                  '"Cormorant Garamond", serif',
              }}
            >
              STREAM
            </span>

            <span className="hidden h-1 w-1 rounded-full bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.8)] sm:block" />
          </button>

          {profiles.length > 0 && (
            <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-white/40 backdrop-blur-xl">
              {profiles.length}{" "}
              {profiles.length === 1
                ? "Profile"
                : "Profiles"}
            </div>
          )}

        </div>
      </header>

      {/* =====================================
          MAIN CONTENT
      ====================================== */}

      <section className="relative z-20 flex min-h-[calc(100vh-92px)] items-center justify-center px-5 pb-24">

        <div className="w-full max-w-5xl text-center">

          <div className="inline-flex items-center gap-3">

            <span className="h-px w-8 bg-gradient-to-r from-transparent to-violet-300/70" />

            <p className="text-[9px] font-semibold uppercase tracking-[0.42em] text-violet-200 sm:text-[10px]">
              Choose your space
            </p>

            <span className="h-px w-8 bg-gradient-to-l from-transparent to-violet-300/70" />

          </div>

          <h1
            className="mt-4 text-[44px] font-semibold leading-none tracking-[-0.025em] drop-shadow-[0_8px_30px_rgba(0,0,0,0.55)] sm:text-6xl lg:text-[72px]"
            style={{
              fontFamily:
                '"Cormorant Garamond", serif',
            }}
          >
            Who&apos;s watching?
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/55 sm:text-[15px]">
            Choose a profile and step back into your
            world of stories.
          </p>

          {/* =====================================
              PROFILE STAGE
          ====================================== */}

          <div className="mx-auto mt-10 w-fit max-w-full rounded-[32px] border border-white/[0.08] bg-black/[0.16] px-6 py-7 shadow-[0_30px_100px_rgba(0,0,0,0.4)] backdrop-blur-[7px] sm:px-9 sm:py-8">

            {profilesLoading ? (
              <div className="flex min-h-[126px] min-w-[180px] items-center justify-center">

                <div>
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-violet-300" />

                  <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-white/30">
                    Loading profiles
                  </p>
                </div>

              </div>
            ) : (
              <div className="flex max-w-[850px] flex-wrap items-start justify-center gap-6 sm:gap-8">

                {/* EXISTING PROFILES */}

                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() =>
                      handleProfileClick(profile)
                    }
                    className="group w-[108px] sm:w-[126px]"
                  >

                    <div className="relative aspect-square overflow-hidden rounded-[24px] border border-white/10 bg-black/30 shadow-[0_18px_55px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-[1.035] group-hover:border-violet-300/70 group-hover:shadow-[0_24px_70px_rgba(124,58,237,0.23)]">

                      <CharacterAvatar
                        avatar={profile.avatar}
                        className="h-full w-full transition duration-500 group-hover:scale-105"
                      />

                      <div className="pointer-events-none absolute inset-0 opacity-0 ring-1 ring-inset ring-violet-300/40 transition duration-500 group-hover:opacity-100" />

                      {profile.kids && (
                        <span className="absolute bottom-2.5 right-2.5 rounded-full border border-white/10 bg-black/70 px-2 py-1 text-[7px] font-bold uppercase tracking-wider backdrop-blur-md">
                          Kids
                        </span>
                      )}

                    </div>

                    <p className="mt-3 truncate text-sm font-medium text-white/65 transition group-hover:text-white">
                      {profile.name}
                    </p>

                  </button>
                ))}

                {/* ADD PROFILE */}

                <button
                  type="button"
                  onClick={openModal}
                  className="group w-[108px] sm:w-[126px]"
                >

                  <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[24px] border border-white/[0.14] bg-white/[0.045] shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-[1.035] group-hover:border-violet-300/60 group-hover:bg-violet-500/[0.12] group-hover:shadow-[0_24px_70px_rgba(124,58,237,0.22)]">

                    <div className="absolute inset-4 rounded-[18px] bg-gradient-to-br from-white/[0.025] to-violet-500/[0.04]" />

                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/20 transition duration-500 group-hover:rotate-90 group-hover:border-violet-300/40 group-hover:bg-violet-500/10">

                      <span className="absolute h-6 w-[1.5px] rounded-full bg-white/60 transition group-hover:bg-violet-100" />

                      <span className="absolute h-[1.5px] w-6 rounded-full bg-white/60 transition group-hover:bg-violet-100" />

                    </div>

                  </div>

                  <p className="mt-3 text-sm font-medium text-white/45 transition group-hover:text-white">
                    Add Profile
                  </p>

                </button>

              </div>
            )}

          </div>

          {/* DETAIL */}

          <div className="mx-auto mt-7 flex max-w-lg items-center justify-center gap-3">

            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />

            <p className="text-[9px] uppercase tracking-[0.14em] text-white/30 sm:text-[10px]">
              Your watchlist · Your history · Your
              recommendations
            </p>

            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />

          </div>

        </div>
      </section>

      {/* =====================================
          ADD PROFILE MODAL
      ====================================== */}

      {showModal && (
        <div className="fixed inset-0 z-[100] grid place-items-center overflow-hidden px-4 py-4">

          <button
            type="button"
            aria-label="Close modal"
            onClick={closeModal}
            className="absolute inset-0 bg-black/55 backdrop-blur-[3px]"
          />

          <div className="relative z-10 max-h-[94vh] w-full max-w-[720px] overflow-y-auto rounded-[24px] border border-white/10 bg-[#0b0910]/95 shadow-[0_35px_120px_rgba(0,0,0,0.75)] backdrop-blur-2xl md:max-h-none md:overflow-y-hidden">

            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-violet-600/15 blur-[90px]" />

            <button
              type="button"
              onClick={closeModal}
              disabled={savingProfile}
              className="absolute right-5 top-5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-lg text-white/50 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              ×
            </button>

            <div className="relative p-6 sm:p-7">

              {/* HEADER */}

              <div className="pr-12">

                <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-violet-300">
                  New profile
                </p>

                <h2
                  className="mt-1.5 text-3xl font-semibold"
                  style={{
                    fontFamily:
                      '"Cormorant Garamond", serif',
                  }}
                >
                  Add a profile.
                </h2>

                <p className="mt-1 text-sm text-white/40">
                  Choose a character and give this
                  profile a name.
                </p>

              </div>

              {/* PREVIEW + NAME */}

              <div className="mt-5 grid items-center gap-5 sm:grid-cols-[78px_1fr]">

                <CharacterAvatar
                  avatar={selectedAvatar}
                  className="mx-auto aspect-square w-[76px] rounded-[17px] border border-violet-400/30 sm:mx-0"
                />

                <div>

                  <label className="text-[9px] font-semibold uppercase tracking-[0.23em] text-white/35">
                    Profile name
                  </label>

                  <input
                    type="text"
                    value={name}
                    autoFocus
                    disabled={savingProfile}
                    onChange={(event) => {
                      setName(event.target.value);
                      setError("");
                    }}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        !savingProfile
                      ) {
                        handleSaveProfile();
                      }
                    }}
                    placeholder="Enter a name"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/60 disabled:opacity-50"
                  />

                  {error && (
                    <p className="mt-1.5 text-xs text-red-300">
                      {error}
                    </p>
                  )}

                </div>

              </div>

              {/* CHARACTER SELECTOR */}

              <div className="mt-5 border-t border-white/[0.07] pt-4">

                <div className="flex flex-wrap items-center justify-between gap-3">

                  <div>

                    <p className="text-[9px] font-semibold uppercase tracking-[0.27em] text-violet-300">
                      Choose your character
                    </p>

                    <p className="mt-1 text-xs text-white/30">
                      Pick your STREAM identity.
                    </p>

                  </div>

                  <div className="flex rounded-full border border-white/10 bg-black/20 p-1">

                    {categories.map((item) => (
                      <button
                        key={item}
                        type="button"
                        disabled={savingProfile}
                        onClick={() =>
                          setCategory(item)
                        }
                        className={`rounded-full px-3 py-1.5 text-[10px] transition ${
                          category === item
                            ? "bg-violet-500/20 text-white"
                            : "text-white/35 hover:text-white"
                        }`}
                      >
                        {item}
                      </button>
                    ))}

                  </div>

                </div>

                {/* AVATARS */}

                <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-8">

                  {shownAvatars.map((avatar) => {
                    const active =
                      selectedAvatar.id === avatar.id;

                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        title={avatar.name}
                        disabled={savingProfile}
                        onClick={() =>
                          setSelectedAvatar(avatar)
                        }
                        className={`group relative aspect-square min-w-0 overflow-hidden rounded-[15px] border transition duration-300 ${
                          active
                            ? "scale-[1.04] border-violet-400 ring-2 ring-violet-500/20"
                            : "border-white/10 opacity-70 hover:-translate-y-1 hover:border-white/30 hover:opacity-100"
                        }`}
                      >

                        <CharacterAvatar
                          avatar={avatar}
                          className="h-full w-full"
                        />

                        {active && (
                          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[8px] font-bold">
                            ✓
                          </span>
                        )}

                      </button>
                    );
                  })}

                </div>

              </div>

              {/* KIDS PROFILE */}

              <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">

                <div>

                  <p className="text-sm font-medium">
                    Kids Profile
                  </p>

                  <p className="mt-0.5 text-xs text-white/30">
                    Age-appropriate titles only.
                  </p>

                </div>

                <button
                  type="button"
                  disabled={savingProfile}
                  onClick={() =>
                    setKidsProfile(
                      (current) => !current
                    )
                  }
                  className={`relative h-6 w-11 flex-none rounded-full transition ${
                    kidsProfile
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-500"
                      : "bg-white/10"
                  }`}
                >
                  <span
                    className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition ${
                      kidsProfile
                        ? "left-[22px]"
                        : "left-[3px]"
                    }`}
                  />
                </button>

              </div>

              {/* ACTIONS */}

              <div className="mt-5 flex items-center justify-end gap-2">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={savingProfile}
                  className="rounded-lg px-4 py-2 text-sm text-white/40 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="min-w-[135px] rounded-lg bg-gradient-to-r from-violet-700 via-purple-600 to-fuchsia-600 px-5 py-2 text-sm font-semibold shadow-[0_10px_30px_rgba(124,58,237,0.25)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                >
                  {savingProfile ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border border-white/30 border-t-white" />
                      Saving...
                    </span>
                  ) : (
                    <>
                      Save Profile
                      <span className="ml-2">→</span>
                    </>
                  )}
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* BOTTOM GLOW */}

      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-20 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent shadow-[0_-8px_30px_rgba(168,85,247,0.45)]" />

    </main>
  );
}