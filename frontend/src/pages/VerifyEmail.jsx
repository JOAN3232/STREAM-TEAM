import { useState } from "react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  sendVerificationEmail,
} from "../services/authService";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [promotions, setPromotions] = useState(true);

  const isValidEmail =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendLink = async () => {
    if (!isValidEmail || loading || sent) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await sendVerificationEmail(
        email,
        email.split("@")[0]
      );

      setSent(true);
    } catch (error) {
      console.error(
        "Failed to send verification email:",
        error
      );

      setError(
        "We couldn't send your verification email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07050d] text-white">

      {/* =====================================
          AMBIENT BACKGROUND
      ====================================== */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute left-1/2 top-[43%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-700/[0.09] blur-[170px]" />

        <div className="absolute bottom-[-150px] left-1/2 h-[330px] w-[700px] -translate-x-1/2 rounded-full bg-fuchsia-600/[0.04] blur-[160px]" />

      </div>

      {/* =====================================
          NAV
      ====================================== */}

      <header className="relative z-30">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-10 lg:px-14">

          <Link
            to="/"
            className="text-2xl font-bold tracking-[0.16em] text-violet-400 transition hover:text-violet-300 sm:text-3xl"
            style={{
              fontFamily:
                '"Cormorant Garamond", serif',
            }}
          >
            STREAM
          </Link>

          <Link
            to="/login"
            className="text-sm font-semibold text-white/60 transition hover:text-violet-300"
          >
            Sign In
          </Link>

        </div>

      </header>

      {/* =====================================
          PAGE
      ====================================== */}

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-6xl flex-col px-6 pb-10 sm:px-10 lg:px-14">

        {/* TOP ROW */}

        <div className="flex items-center justify-between pt-4">

          <Link
            to={`/register-intro?email=${encodeURIComponent(
              email
            )}`}
            className="group flex items-center gap-3 text-sm text-white/45 transition hover:text-violet-300"
          >
            <span className="text-lg transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>

            <span>Back</span>
          </Link>

          <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-violet-400">
            Step 1 of 3
          </span>

        </div>

        {/* =====================================
            CONTENT
        ====================================== */}

        <div className="flex flex-1 items-center justify-center py-7">

          <div className="relative w-full max-w-[680px] text-center">

            {/* AMBIENT CARD GLOW */}

            <div className="pointer-events-none absolute left-1/2 top-[45%] h-[380px] w-[620px] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/[0.05] blur-[110px]" />

            {/* ICON */}

            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] border border-violet-400/25 bg-violet-500/[0.055] shadow-[0_0_55px_rgba(139,92,246,0.13)] backdrop-blur-xl">

              <svg
                viewBox="0 0 24 24"
                className="h-9 w-9 fill-none stroke-violet-300"
                strokeWidth="1.7"
              >
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="2"
                />

                <path d="m4 7 8 6 8-6" />
              </svg>

            </div>

            {/* LABEL */}

            <p className="relative mt-7 text-[10px] font-semibold uppercase tracking-[0.34em] text-violet-400">
              Email verification
            </p>

            {/* TITLE */}

            <h1
              className="relative mt-4 text-5xl font-semibold leading-[0.98] text-white sm:text-6xl"
              style={{
                fontFamily:
                  '"Cormorant Garamond", serif',
              }}
            >
              {sent
                ? "Check your inbox."
                : "Verify your email."}
            </h1>

            {/* =====================================
                BEFORE SEND
            ====================================== */}

            {!sent ? (
              <>
                <p className="relative mx-auto mt-6 max-w-lg text-sm leading-6 text-white/48 sm:text-base">
                  We&apos;ll send a secure sign-up
                  link to your email so you can
                  continue creating your STREAM
                  account.
                </p>

                {/* EMAIL DISPLAY */}

                <div className="relative mx-auto mt-8 max-w-[560px] rounded-2xl border border-white/[0.08] bg-white/[0.025] px-5 py-4 text-left backdrop-blur-xl">

                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/28">
                    Email address
                  </p>

                  <div className="mt-1 flex items-center justify-between gap-4">

                    <p className="min-w-0 truncate text-sm font-medium text-white/85">
                      {email ||
                        "No email provided"}
                    </p>

                    {isValidEmail && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/[0.08]">

                        <svg
                          viewBox="0 0 24 24"
                          className="h-3.5 w-3.5 fill-none stroke-violet-300"
                          strokeWidth="2"
                        >
                          <path d="m5 12 4 4L19 6" />
                        </svg>

                      </div>
                    )}

                  </div>

                </div>

                {/* INVALID EMAIL */}

                {!isValidEmail && (
                  <div className="relative mx-auto mt-4 max-w-[560px] rounded-xl border border-red-400/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-200">
                    Please go back and enter a valid
                    email address.
                  </div>
                )}

                {/* ERROR */}

                {error && (
                  <div className="relative mx-auto mt-4 max-w-[560px] rounded-xl border border-red-400/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                )}

                {/* PROMOTIONS */}

                <label className="relative mx-auto mt-6 flex max-w-[560px] cursor-pointer items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.018] px-4 py-3 text-left text-sm text-white/45">

                  <input
                    type="checkbox"
                    checked={promotions}
                    onChange={(event) =>
                      setPromotions(
                        event.target.checked
                      )
                    }
                    className="mt-1 h-4 w-4 shrink-0 accent-violet-500"
                  />

                  <span>
                    Send me STREAM recommendations,
                    updates and special offers.
                  </span>

                </label>

                {/* SEND BUTTON */}

                <button
                  type="button"
                  onClick={handleSendLink}
                  disabled={
                    !isValidEmail ||
                    loading ||
                    sent
                  }
                  className="
                    group
                    relative
                    mx-auto
                    mt-7
                    flex
                    h-16
                    w-full
                    max-w-[560px]
                    items-center
                    justify-center
                    rounded-xl

                    bg-gradient-to-r
                    from-[#7b00ff]
                    via-[#a400ff]
                    to-[#d000d7]

                    text-base
                    font-semibold
                    text-white

                    shadow-[0_16px_55px_rgba(126,34,206,0.27)]

                    transition
                    duration-300

                    hover:scale-[1.01]
                    hover:shadow-[0_18px_70px_rgba(168,85,247,0.34)]

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    disabled:hover:scale-100
                  "
                >

                  {loading ? (
                    <span className="flex items-center gap-3">

                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Sending...

                    </span>
                  ) : (
                    <>
                      Send Verification Link

                      <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </>
                  )}

                </button>
              </>
            ) : (
              /* =====================================
                  SENT STATE
              ====================================== */

              <div className="relative">

                <p className="mx-auto mt-6 max-w-lg text-sm leading-6 text-white/48 sm:text-base">
                  We&apos;ve sent a secure
                  verification link to
                </p>

                <p className="mt-1 break-all text-base font-semibold text-white/90">
                  {email}
                </p>

                {/* SENT CARD */}

                <div className="mx-auto mt-8 max-w-[560px] rounded-2xl border border-violet-400/[0.14] bg-violet-500/[0.055] px-5 py-5 text-left backdrop-blur-xl">

                  <div className="flex items-start gap-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/[0.09]">

                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5 fill-none stroke-violet-300"
                        strokeWidth="1.8"
                      >
                        <path d="m5 12 4 4L19 6" />
                      </svg>

                    </div>

                    <div>

                      <p className="text-sm font-medium text-white/90">
                        Verification email sent
                      </p>

                      <p className="mt-1 text-sm leading-6 text-white/40">
                        Open the email and follow the
                        link to set your password and
                        finish creating your STREAM
                        account.
                      </p>

                    </div>

                  </div>

                </div>

                {/* SECURITY NOTE */}

                <div className="mx-auto mt-5 flex max-w-[560px] items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4 text-left">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/[0.07]">

                    <svg
                      viewBox="0 0 24 24"
                      className="h-4.5 w-4.5 fill-none stroke-violet-300"
                      strokeWidth="1.7"
                    >
                      <path d="M12 3 5 6v5c0 5 3.5 8 7 10 3.5-2 7-5 7-10V6l-7-3Z" />
                    </svg>

                  </div>

                  <p className="text-sm leading-5 text-white/38">
                    For your security, only use the
                    link sent directly to your email.
                  </p>

                </div>

                {/* RESEND */}

                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setError("");
                  }}
                  className="mt-7 text-sm font-medium text-violet-300 transition hover:text-violet-200"
                >
                  Didn&apos;t receive it? Send again
                </button>

              </div>
            )}

          </div>

        </div>

      </section>

      {/* BOTTOM ACCENT */}

      <div className="pointer-events-none fixed bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent shadow-[0_-8px_35px_rgba(168,85,247,0.45)]" />

    </main>
  );
}