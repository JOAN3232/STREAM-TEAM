import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getBackdropUrl,
  getTrendingMovies,
} from "../services/tmdbService";

import {
  CHARACTER_AVATARS,
  getProfileAvatar,
} from "../data/profileAvatars";

const PROFILE_API = "http://localhost:8081/api/profiles";

/* =========================================
   AVATAR COMPONENT
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
          <span className="text-xl font-semibold text-white">
            {avatar.name.charAt(0)}
          </span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/[0.04]" />
    </div>
  );
}

export default function WhosWatching() {
  const navigate = useNavigate();

  const [backgrounds, setBackgrounds] = useState([]);
  const [currentBackground, setCurrentBackground] =
    useState(0);

  const [profiles, setProfiles] = useState([]);
  const [profilesLoading, setProfilesLoading] =
    useState(true);

  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [kidsProfile, setKidsProfile] =
    useState(false);
  const [error, setError] = useState("");

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [selectedAvatar, setSelectedAvatar] =
    useState(CHARACTER_AVATARS[0]);

  const userId = localStorage.getItem("token");

  /* =========================================
     AUTH
  ========================================= */

  useEffect(() => {
    if (!userId) {
      navigate("/login");
    }
  }, [navigate, userId]);

  /* =========================================
     LOAD PROFILES
  ========================================= */

  useEffect(() => {
    if (!userId) return;

    const loadProfiles = async () => {
      try {
        setProfilesLoading(true);

        const response = await fetch(PROFILE_API, {
          headers: {
            "X-User-Id": userId,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load profiles");
        }

        const data = await response.json();

        const formattedProfiles = data.map(
          (profile) => ({
            ...profile,
            avatar: getProfileAvatar(
              profile.avatarId,
            ),
          }),
        );

        setProfiles(formattedProfiles);
      } catch (error) {
        console.error(
          "Profile loading failed:",
          error,
        );
      } finally {
        setProfilesLoading(false);
      }
    };

    loadProfiles();
  }, [navigate, userId]);

  /* =========================================
     MOVIE BACKGROUNDS
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
            image: getBackdropUrl(
              movie.backdrop_path,
            ),
          }));

        setBackgrounds(available);
      } catch (error) {
        console.error(
          "Who's Watching background error:",
          error,
        );
      }
    };

    loadBackgrounds();
  }, []);

  useEffect(() => {
    if (backgrounds.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBackground((current) =>
        current >= backgrounds.length - 1
          ? 0
          : current + 1,
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
    setSelectedAvatar(CHARACTER_AVATARS[0]);
  };

  /* =========================================
     SAVE PROFILE
  ========================================= */

  const handleSaveProfile = async () => {
    const cleanName = name.trim();

    if (!cleanName) {
      setError("Enter a profile name.");
      return;
    }

    if (cleanName.length > 30) {
      setError(
        "Profile name must be 30 characters or less.",
      );
      return;
    }

    if (!userId) {
      navigate("/login");
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
          "X-User-Id": userId,
        },
        body: JSON.stringify({
          name: cleanName,
          avatarId: selectedAvatar.id,
          kids: kidsProfile,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        let message = "Unable to save profile";

        try {
          const result = await response.json();

          if (result?.message) {
            message = result.message;
          }
        } catch {
          // Keep fallback message.
        }

        throw new Error(message);
      }

      const savedProfile =
        await response.json();

      const formattedProfile = {
        ...savedProfile,
        avatar: getProfileAvatar(
          savedProfile.avatarId,
        ),
      };

      setProfiles((current) => [
        ...current,
        formattedProfile,
      ]);

      setShowModal(false);
      setName("");
      setKidsProfile(false);
      setError("");
      setSelectedAvatar(CHARACTER_AVATARS[0]);
    } catch (error) {
      console.error(
        "Profile creation failed:",
        error,
      );

      setError(
        error?.message ||
          "We couldn't save this profile. Please try again.",
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
        avatarId: profile.avatarId,
        kids: profile.kids,
      }),
    );

    navigate(
      `/browse?profile=${encodeURIComponent(
        profile.name,
      )}`,
    );
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050407] text-white">
      {/* =====================================
          CINEMATIC BACKGROUND
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
            onClick={() =>
              navigate("/whos-watching")
            }
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
          PROFILE PAGE
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
            className="mt-4 text-[44px] font-semibold leading-none tracking-[-0.025em] sm:text-6xl lg:text-[72px]"
            style={{
              fontFamily:
                '"Cormorant Garamond", serif',
            }}
          >
            Who&apos;s watching?
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/55">
            Choose a profile and step back into
            your world of stories.
          </p>

          {/* PROFILE CONTAINER */}

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
                {/* SAVED PROFILES */}

                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() =>
                      handleProfileClick(profile)
                    }
                    className="group w-[108px] sm:w-[126px]"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-[24px] border border-white/10 bg-black/30 shadow-[0_18px_55px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-[1.035] group-hover:border-violet-300/70">
                      <CharacterAvatar
                        avatar={profile.avatar}
                        className="h-full w-full transition duration-500 group-hover:scale-105"
                      />

                      {profile.kids && (
                        <span className="absolute bottom-2.5 right-2.5 rounded-full border border-white/10 bg-black/70 px-2 py-1 text-[7px] font-bold uppercase tracking-wider">
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
                  <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[24px] border border-white/[0.14] bg-white/[0.045] transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-[1.035] group-hover:border-violet-300/60 group-hover:bg-violet-500/[0.12]">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/20 transition duration-500 group-hover:rotate-90">
                      <span className="absolute h-6 w-[1.5px] rounded-full bg-white/60" />
                      <span className="absolute h-[1.5px] w-6 rounded-full bg-white/60" />
                    </div>
                  </div>

                  <p className="mt-3 text-sm font-medium text-white/45 transition group-hover:text-white">
                    Add Profile
                  </p>
                </button>
              </div>
            )}
          </div>

          <div className="mx-auto mt-7 flex max-w-lg items-center justify-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />

            <p className="text-[9px] uppercase tracking-[0.14em] text-white/30">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close modal"
            onClick={closeModal}
            className="absolute inset-0 bg-black/75 backdrop-blur-[6px]"
          />

          <div className="relative z-10 w-full max-w-[760px] overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#0a090e]/95 shadow-[0_35px_120px_rgba(0,0,0,0.85)] backdrop-blur-3xl">
            <div className="pointer-events-none absolute -left-20 -top-28 h-[260px] w-[260px] rounded-full bg-violet-600/[0.13] blur-[90px]" />

            <div className="pointer-events-none absolute -bottom-28 right-0 h-[250px] w-[250px] rounded-full bg-fuchsia-600/[0.08] blur-[90px]" />

            <button
              type="button"
              onClick={closeModal}
              disabled={savingProfile}
              className="absolute right-5 top-5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-lg text-white/45 transition hover:bg-white/10 hover:text-white"
            >
              ×
            </button>

            <div className="relative px-7 py-7 sm:px-9">
              {/* TITLE */}

              <div className="pr-12">
                <p className="text-[9px] font-semibold uppercase tracking-[0.34em] text-violet-300">
                  New profile
                </p>

                <h2
                  className="mt-1.5 text-[34px] font-semibold leading-none text-white"
                  style={{
                    fontFamily:
                      '"Cormorant Garamond", serif',
                  }}
                >
                  Create your space.
                </h2>

                <p className="mt-2 text-xs text-white/35">
                  Choose an avatar and give your
                  profile a name.
                </p>
              </div>

              {/* NAME + CURRENT AVATAR */}

              <div className="mt-6 grid grid-cols-[82px_1fr] items-center gap-5">
                <CharacterAvatar
                  avatar={selectedAvatar}
                  className="h-[82px] w-[82px] rounded-[20px] border border-violet-300/20 shadow-[0_16px_45px_rgba(0,0,0,0.5)]"
                />

                <div>
                  <label className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/30">
                    Profile name
                  </label>

                  <input
                    type="text"
                    value={name}
                    maxLength={30}
                    autoFocus
                    disabled={savingProfile}
                    placeholder="Enter your name"
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
                    className="mt-2 w-full border-0 border-b border-white/15 bg-transparent pb-2.5 text-[16px] text-white outline-none transition placeholder:text-white/20 focus:border-violet-400"
                  />

                  {error && (
                    <p className="mt-1.5 text-[11px] text-red-300">
                      {error}
                    </p>
                  )}
                </div>
              </div>

              {/* AVATAR CHOICES */}

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.27em] text-white/35">
                      Choose your avatar
                    </p>

                    <p className="mt-1 text-[11px] text-white/25">
                      Pick the face for your STREAM
                      profile.
                    </p>
                  </div>

                  <span className="text-[10px] font-medium text-violet-300/70">
                    {selectedAvatar.name}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-8">
                  {CHARACTER_AVATARS.map(
                    (avatar) => {
                      const active =
                        selectedAvatar.id ===
                        avatar.id;

                      return (
                        <button
                          key={avatar.id}
                          type="button"
                          title={avatar.name}
                          disabled={savingProfile}
                          onClick={() =>
                            setSelectedAvatar(
                              avatar,
                            )
                          }
                          className={`group relative aspect-square min-w-0 overflow-hidden rounded-[17px] transition-all duration-300 ${
                            active
                              ? "z-10 scale-[1.06] ring-2 ring-violet-400 ring-offset-2 ring-offset-[#0a090e]"
                              : "opacity-60 hover:-translate-y-1 hover:scale-[1.03] hover:opacity-100"
                          }`}
                        >
                          <CharacterAvatar
                            avatar={avatar}
                            className="h-full w-full rounded-[17px] transition duration-300 group-hover:scale-105"
                          />

                          {active && (
                            <span className="absolute right-1.5 top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white text-[9px] font-black text-black shadow-md">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              {/* BOTTOM */}

              <div className="mt-6 flex flex-col gap-5 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
                {/* KIDS */}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={savingProfile}
                    onClick={() =>
                      setKidsProfile(
                        (current) => !current,
                      )
                    }
                    className={`relative h-[24px] w-[43px] rounded-full transition ${
                      kidsProfile
                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-500"
                        : "bg-white/10"
                    }`}
                    aria-pressed={kidsProfile}
                  >
                    <span
                      className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all ${
                        kidsProfile
                          ? "left-[22px]"
                          : "left-[3px]"
                      }`}
                    />
                  </button>

                  <div>
                    <p className="text-xs font-medium text-white/75">
                      Kids Profile
                    </p>

                    <p className="text-[9px] text-white/25">
                      Age-appropriate recommendations
                    </p>
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={savingProfile}
                    className="px-3 py-2 text-xs font-medium text-white/35 transition hover:text-white disabled:opacity-30"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="group min-w-[145px] rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-5 py-3 text-xs font-semibold text-white shadow-[0_12px_35px_rgba(124,58,237,0.22)] transition hover:scale-[1.025] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border border-white/30 border-t-white" />
                        Creating...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        Create Profile

                        <span className="transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </span>
                    )}
                  </button>
                </div>
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