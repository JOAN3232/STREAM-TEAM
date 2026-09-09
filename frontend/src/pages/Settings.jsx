import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import StreamingLayout from "../components/StreamingLayout";

import {
  CHARACTER_AVATARS,
  getProfileAvatar,
} from "../data/profileAvatars";

const PROFILE_API = "http://localhost:8081/api/profiles";

const UI_FONT = {
  fontFamily:
    '"Manrope", "Inter", "Helvetica Neue", Arial, sans-serif',
};

const DISPLAY_FONT = {
  fontFamily:
    '"Cormorant Garamond", "Georgia", serif',
};

function CharacterAvatar({
  avatar,
  className = "",
}) {
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

export default function Settings() {
  const navigate = useNavigate();

  const userId = localStorage.getItem("token");

  const storedProfile = useMemo(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem(
          "stream_active_profile",
        ),
      );
    } catch {
      return null;
    }
  }, []);

  const email =
    localStorage.getItem("email") || "Not available";

  const [activeProfile, setActiveProfile] =
    useState(storedProfile);

  const [profileName, setProfileName] = useState(
    storedProfile?.name || "",
  );

  const [selectedAvatar, setSelectedAvatar] =
    useState(
      getProfileAvatar(
        storedProfile?.avatarId,
      ),
    );

  const [kidsProfile, setKidsProfile] =
    useState(Boolean(storedProfile?.kids));

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [profileMessage, setProfileMessage] =
    useState("");

  const [profileError, setProfileError] =
    useState("");

  const [autoplay, setAutoplay] = useState(() => {
    const saved = localStorage.getItem(
      "stream_autoplay",
    );

    return saved === null
      ? true
      : saved === "true";
  });

  const [reducedMotion, setReducedMotion] =
    useState(() => {
      return (
        localStorage.getItem(
          "stream_reduced_motion",
        ) === "true"
      );
    });

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    if (!storedProfile?.id) {
      navigate("/whos-watching");
    }
  }, [
    navigate,
    storedProfile?.id,
    userId,
  ]);

  useEffect(() => {
    localStorage.setItem(
      "stream_autoplay",
      String(autoplay),
    );
  }, [autoplay]);

  useEffect(() => {
    localStorage.setItem(
      "stream_reduced_motion",
      String(reducedMotion),
    );
  }, [reducedMotion]);

  const handleSaveProfile = async () => {
    const cleanName = profileName.trim();

    if (!cleanName) {
      setProfileError(
        "Profile name is required.",
      );
      setProfileMessage("");
      return;
    }

    if (cleanName.length > 30) {
      setProfileError(
        "Profile name must be 30 characters or less.",
      );
      setProfileMessage("");
      return;
    }

    if (!activeProfile?.id) {
      setProfileError(
        "No active profile was found.",
      );
      setProfileMessage("");
      return;
    }

    if (!userId) {
      navigate("/login");
      return;
    }

    if (savingProfile) return;

    try {
      setSavingProfile(true);
      setProfileError("");
      setProfileMessage("");

      const response = await fetch(
        `${PROFILE_API}/${activeProfile.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-User-Id": userId,
          },
          body: JSON.stringify({
            name: cleanName,
            avatarId: selectedAvatar.id,
            kids: kidsProfile,
          }),
        },
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("email");

        sessionStorage.removeItem(
          "stream_active_profile",
        );

        navigate("/login");
        return;
      }

      if (!response.ok) {
        let message =
          "We couldn't update this profile.";

        try {
          const result =
            await response.json();

          if (result?.message) {
            message = result.message;
          }
        } catch {
          // Use fallback message.
        }

        throw new Error(message);
      }

      const updatedProfile =
        await response.json();

      const nextActiveProfile = {
        id: updatedProfile.id,
        name: updatedProfile.name,
        avatarId:
          updatedProfile.avatarId,
        kids: updatedProfile.kids,
      };

      sessionStorage.setItem(
        "stream_active_profile",
        JSON.stringify(
          nextActiveProfile,
        ),
      );

      setActiveProfile(
        nextActiveProfile,
      );

      setProfileName(
        updatedProfile.name,
      );

      setSelectedAvatar(
        getProfileAvatar(
          updatedProfile.avatarId,
        ),
      );

      setKidsProfile(
        Boolean(updatedProfile.kids),
      );

      setProfileMessage(
        "Profile updated successfully.",
      );
    } catch (error) {
      console.error(
        "Profile update failed:",
        error,
      );

      setProfileError(
        error?.message ||
          "We couldn't update this profile.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");

    sessionStorage.removeItem(
      "stream_active_profile",
    );

    navigate("/login");
  };

  return (
    <StreamingLayout>
      <main
        className="min-h-screen bg-[#050507] pb-28 pt-[96px] text-white sm:pt-[110px]"
        style={UI_FONT}
      >
        <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-12">
          {/* HEADER */}

          <div className="border-b border-white/[0.07] pb-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-violet-300">
              STREAM
            </p>

            <h1
              className="mt-3 text-4xl font-semibold sm:text-5xl"
              style={DISPLAY_FONT}
            >
              Settings
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/40">
              Manage your STREAM account,
              subscription, profile and playback
              preferences.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            {/* =================================================
                ACCOUNT
            ================================================= */}

            <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-300">
                Account
              </p>

              <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <CharacterAvatar
                    avatar={getProfileAvatar(
                      activeProfile?.avatarId,
                    )}
                    className="h-12 w-12 shrink-0 rounded-full"
                  />

                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {activeProfile?.name ||
                        "Profile"}
                    </p>

                    <p className="mt-1 truncate text-xs text-white/35">
                      {email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/whos-watching",
                    )
                  }
                  className="rounded-xl border border-white/[0.1] px-4 py-2.5 text-xs font-medium text-white/70 transition hover:border-violet-400/40 hover:bg-violet-500/[0.08] hover:text-white"
                >
                  Switch Profile
                </button>
              </div>
            </section>

            {/* =================================================
                EDIT PROFILE
            ================================================= */}

            <section className="relative overflow-hidden rounded-2xl border border-violet-400/[0.12] bg-gradient-to-br from-violet-500/[0.06] via-white/[0.025] to-fuchsia-500/[0.035] p-5 sm:p-7">
              <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

              <div className="relative">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-300">
                    Edit Profile
                  </p>

                  <h2
                    className="mt-3 text-2xl font-semibold"
                    style={DISPLAY_FONT}
                  >
                    Make this profile yours
                  </h2>

                  <p className="mt-2 max-w-xl text-xs leading-6 text-white/40">
                    Update the name, avatar and
                    profile type for the active
                    STREAM profile.
                  </p>
                </div>

                <div className="mt-7 grid gap-7 lg:grid-cols-[160px_1fr]">
                  {/* CURRENT AVATAR */}

                  <div>
                    <CharacterAvatar
                      avatar={selectedAvatar}
                      className="aspect-square w-full rounded-[24px] border border-violet-300/20 shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
                    />

                    <p className="mt-3 text-center text-[10px] font-medium text-white/35">
                      {selectedAvatar.name}
                    </p>
                  </div>

                  {/* FORM */}

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
                      Profile name
                    </label>

                    <input
                      type="text"
                      value={profileName}
                      maxLength={30}
                      disabled={savingProfile}
                      onChange={(event) => {
                        setProfileName(
                          event.target.value,
                        );

                        setProfileError("");
                        setProfileMessage("");
                      }}
                      className="mt-2 w-full rounded-xl border border-white/[0.08] bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-violet-400/40"
                    />

                    <div className="mt-6">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
                            Avatar
                          </p>

                          <p className="mt-1 text-[11px] text-white/25">
                            Choose the face for
                            this profile.
                          </p>
                        </div>

                        <span className="text-[10px] font-medium text-violet-300">
                          {
                            selectedAvatar.name
                          }
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
                                key={
                                  avatar.id
                                }
                                type="button"
                                title={
                                  avatar.name
                                }
                                disabled={
                                  savingProfile
                                }
                                onClick={() => {
                                  setSelectedAvatar(
                                    avatar,
                                  );

                                  setProfileError(
                                    "",
                                  );

                                  setProfileMessage(
                                    "",
                                  );
                                }}
                                className={`group relative aspect-square overflow-hidden rounded-[16px] transition-all duration-300 ${
                                  active
                                    ? "scale-[1.05] ring-2 ring-violet-400 ring-offset-2 ring-offset-[#09090c]"
                                    : "opacity-55 hover:-translate-y-1 hover:opacity-100"
                                }`}
                              >
                                <CharacterAvatar
                                  avatar={
                                    avatar
                                  }
                                  className="h-full w-full rounded-[16px]"
                                />

                                {active && (
                                  <span className="absolute right-1.5 top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white text-[9px] font-black text-black">
                                    ✓
                                  </span>
                                )}
                              </button>
                            );
                          },
                        )}
                      </div>
                    </div>

                    {/* KIDS PROFILE */}

                    <div className="mt-6 flex items-center justify-between gap-5 rounded-xl border border-white/[0.06] bg-black/20 p-4">
                      <div>
                        <p className="text-sm font-medium">
                          Kids Profile
                        </p>

                        <p className="mt-1 text-[11px] leading-5 text-white/35">
                          Mark this as a profile
                          intended for younger
                          viewers.
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={
                          savingProfile
                        }
                        onClick={() => {
                          setKidsProfile(
                            (current) =>
                              !current,
                          );

                          setProfileError(
                            "",
                          );

                          setProfileMessage(
                            "",
                          );
                        }}
                        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                          kidsProfile
                            ? "bg-violet-600"
                            : "bg-white/[0.12]"
                        }`}
                        aria-pressed={
                          kidsProfile
                        }
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                            kidsProfile
                              ? "left-6"
                              : "left-1"
                          }`}
                        />
                      </button>
                    </div>

                    {profileError && (
                      <div className="mt-4 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-xs text-red-300">
                        {profileError}
                      </div>
                    )}

                    {profileMessage && (
                      <div className="mt-4 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3 text-xs text-emerald-300">
                        {profileMessage}
                      </div>
                    )}

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <button
                        type="button"
                        onClick={
                          handleSaveProfile
                        }
                        disabled={
                          savingProfile
                        }
                        className="rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-5 py-3 text-xs font-semibold text-white shadow-[0_10px_30px_rgba(124,58,237,0.2)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingProfile
                          ? "Saving..."
                          : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            "/whos-watching",
                          )
                        }
                        disabled={
                          savingProfile
                        }
                        className="rounded-xl border border-white/[0.08] bg-black/20 px-5 py-3 text-xs font-medium text-white/60 transition hover:border-violet-400/30 hover:text-white disabled:opacity-40"
                      >
                        Manage Profiles
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                SUBSCRIPTION & BILLING
            ================================================= */}

            <section className="relative overflow-hidden rounded-2xl border border-violet-400/[0.12] bg-gradient-to-br from-violet-500/[0.07] via-white/[0.025] to-fuchsia-500/[0.04] p-5 sm:p-7">
              <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

              <div className="relative">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-300">
                  Subscription & Billing
                </p>

                <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                  <div className="max-w-xl">
                    <h2
                      className="text-2xl font-semibold text-white"
                      style={DISPLAY_FONT}
                    >
                      Manage your STREAM
                      membership
                    </h2>

                    <p className="mt-2 text-xs leading-6 text-white/40">
                      View available plans,
                      choose the membership that
                      works for you and continue
                      securely to payment.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/[0.07] bg-black/20 px-3 py-1.5 text-[9px] font-medium text-white/45">
                        Basic
                      </span>

                      <span className="rounded-full border border-white/[0.07] bg-black/20 px-3 py-1.5 text-[9px] font-medium text-white/45">
                        Standard
                      </span>

                      <span className="rounded-full border border-violet-400/20 bg-violet-500/[0.08] px-3 py-1.5 text-[9px] font-medium text-violet-300">
                        Premium
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/plans")
                    }
                    className="shrink-0 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-5 py-3 text-xs font-semibold text-white shadow-[0_10px_30px_rgba(124,58,237,0.2)] transition hover:brightness-110"
                  >
                    View Plans & Billing
                  </button>
                </div>
              </div>
            </section>

            {/* =================================================
                PLAYBACK
            ================================================= */}

            <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-300">
                Playback
              </p>

              <div className="mt-6 divide-y divide-white/[0.06]">
                <SettingToggle
                  title="Autoplay"
                  description="Automatically continue playback when supported."
                  enabled={autoplay}
                  onChange={() =>
                    setAutoplay(
                      (current) =>
                        !current,
                    )
                  }
                />

                <SettingToggle
                  title="Reduce motion"
                  description="Use fewer interface animations and transitions."
                  enabled={reducedMotion}
                  onChange={() =>
                    setReducedMotion(
                      (current) =>
                        !current,
                    )
                  }
                />
              </div>
            </section>

            {/* =================================================
                STREAM DATA
            ================================================= */}

            <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-300">
                Your STREAM data
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/my-list")
                  }
                  className="rounded-xl border border-white/[0.07] bg-black/20 p-4 text-left transition hover:border-violet-400/30 hover:bg-violet-500/[0.05]"
                >
                  <p className="text-sm font-semibold">
                    My List
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-white/35">
                    View titles saved by this
                    profile.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/browse")
                  }
                  className="rounded-xl border border-white/[0.07] bg-black/20 p-4 text-left transition hover:border-violet-400/30 hover:bg-violet-500/[0.05]"
                >
                  <p className="text-sm font-semibold">
                    Continue Watching
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-white/35">
                    Return to your current
                    watching activity.
                  </p>
                </button>
              </div>
            </section>

            {/* =================================================
                PROFILE MANAGEMENT
            ================================================= */}

            <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-300">
                Profiles
              </p>

              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    Manage watching profiles
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-white/35">
                    Create or switch between
                    profiles connected to your
                    STREAM account.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/whos-watching",
                    )
                  }
                  className="shrink-0 rounded-xl border border-white/[0.08] bg-black/20 px-4 py-2.5 text-xs font-medium text-white/65 transition hover:border-violet-400/30 hover:text-white"
                >
                  Manage Profiles
                </button>
              </div>
            </section>

            {/* =================================================
                SIGN OUT
            ================================================= */}

            <section className="rounded-2xl border border-red-400/[0.08] bg-red-400/[0.02] p-5 sm:p-7">
              <p className="font-semibold">
                Sign out of STREAM
              </p>

              <p className="mt-2 text-xs leading-5 text-white/35">
                You can sign back in anytime
                using your STREAM account.
              </p>

              <button
                type="button"
                onClick={signOut}
                className="mt-5 rounded-xl border border-red-400/20 px-5 py-2.5 text-xs font-semibold text-red-300 transition hover:bg-red-400/[0.08]"
              >
                Sign Out
              </button>
            </section>
          </div>
        </div>
      </main>
    </StreamingLayout>
  );
}

function SettingToggle({
  title,
  description,
  enabled,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-5 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="mt-1 max-w-lg text-[11px] leading-5 text-white/35">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          enabled
            ? "bg-violet-600"
            : "bg-white/[0.12]"
        }`}
        aria-pressed={enabled}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}