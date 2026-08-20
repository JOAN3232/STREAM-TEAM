import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import StreamingLayout from "../components/StreamingLayout";

const UI_FONT = {
  fontFamily:
    '"Manrope", "Inter", "Helvetica Neue", Arial, sans-serif',
};

const DISPLAY_FONT = {
  fontFamily:
    '"Cormorant Garamond", "Georgia", serif',
};

export default function Settings() {
  const navigate = useNavigate();

  let storedProfile = null;

  try {
    storedProfile = JSON.parse(
      sessionStorage.getItem("stream_active_profile")
    );
  } catch {
    storedProfile = null;
  }

  const activeName =
    storedProfile?.name || "Profile";

  const email =
    localStorage.getItem("email") || "Not available";

  const [autoplay, setAutoplay] =
    useState(() => {
      const saved =
        localStorage.getItem("stream_autoplay");

      return saved === null
        ? true
        : saved === "true";
    });

  const [reducedMotion, setReducedMotion] =
    useState(() => {
      return (
        localStorage.getItem(
          "stream_reduced_motion"
        ) === "true"
      );
    });

  useEffect(() => {
    localStorage.setItem(
      "stream_autoplay",
      String(autoplay)
    );
  }, [autoplay]);

  useEffect(() => {
    localStorage.setItem(
      "stream_reduced_motion",
      String(reducedMotion)
    );
  }, [reducedMotion]);

  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");

    sessionStorage.removeItem(
      "stream_active_profile"
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
              Manage your STREAM profile and
              playback preferences.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            {/* ACCOUNT */}

            <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-300">
                Account
              </p>

              <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 font-semibold">
                    {activeName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {activeName}
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
                      "/whos-watching"
                    )
                  }
                  className="rounded-xl border border-white/[0.1] px-4 py-2.5 text-xs font-medium text-white/70 transition hover:border-violet-400/40 hover:bg-violet-500/[0.08] hover:text-white"
                >
                  Switch Profile
                </button>
              </div>
            </section>

            {/* PLAYBACK */}

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
                        !current
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
                        !current
                    )
                  }
                />
              </div>
            </section>

            {/* PROFILE DATA */}

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

            {/* SIGN OUT */}

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