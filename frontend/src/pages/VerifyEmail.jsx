import { useEffect, useState } from "react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";
import { sendVerificationEmail } from "../services/authService";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [promotions, setPromotions] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email.trim()
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSendLink = async () => {
    if (!isValidEmail || loading || sent) return;

    setLoading(true);
    setError("");

    try {
      // Name isn't collected on this page yet — using the email prefix as a placeholder
      await sendVerificationEmail(email, email.split("@")[0]);
      setSent(true);
    } catch (err) {
      console.error("Failed to send verification email", err);
      setError("Couldn't send the email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#07050d] text-white">
      {/* SOFT BACKGROUND GLOW */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[42%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-700/10 blur-[150px]" />

        <div className="absolute bottom-0 left-0 h-[260px] w-[260px] rounded-full bg-fuchsia-600/[0.06] blur-[120px]" />
      </div>

      {/* ==================================
          STICKY NAVBAR
      =================================== */}
      <header
        className={`
          fixed
          left-0
          right-0
          top-0
          z-50
          transition-all
          duration-500
          ${
            isScrolled
              ? "border-b border-white/[0.08] bg-[#09070d]/70 shadow-[0_15px_45px_rgba(0,0,0,0.22)] backdrop-blur-2xl"
              : "border-b border-transparent bg-transparent"
          }
        `}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-10 lg:px-14">
          <Link
            to="/"
            className="text-2xl font-bold tracking-[0.15em] text-violet-400 sm:text-3xl"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
            }}
          >
            STREAM
          </Link>

          <Link
            to="/login"
            className="text-sm font-semibold text-white/70 transition hover:text-violet-300"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* ==================================
          UNDER NAVBAR CONTROLS
      =================================== */}
      <div className="relative z-20 mx-auto max-w-7xl px-6 pt-[105px] sm:px-10 lg:px-14">
        <div className="flex items-center justify-between">
          {/* BACK */}
          <Link
            to={`/register-intro?email=${encodeURIComponent(
              email
            )}`}
            className="group flex items-center gap-2 text-sm text-white/50 transition hover:text-violet-300"
          >
            <span className="text-lg transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>

            <span>Back</span>
          </Link>

          {/* STEP */}
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-violet-400 sm:text-xs">
            Step 1 of 3
          </span>
        </div>
      </div>

      {/* ==================================
          MAIN CONTENT
      =================================== */}
      <section className="relative z-10 flex min-h-[calc(100vh-135px)] items-center justify-center px-6 pb-16 pt-6 sm:px-10">
        <div className="w-full max-w-[560px]">
          {/* ICON */}
          <div className="mb-8 flex justify-center">
            <div
              className="
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-[24px]
                border
                border-violet-400/25
                bg-violet-500/10
                shadow-[0_0_60px_rgba(139,92,246,0.14)]
                backdrop-blur-xl
              "
            >
              <span className="text-3xl text-violet-300">
                ✉
              </span>
            </div>
          </div>

          {/* CENTERED COPY */}
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-400">
              Email verification
            </p>

            <h1
              className="mt-4 text-4xl font-semibold leading-[1.06] sm:text-5xl"
              style={{
                fontFamily: '"Cormorant Garamond", serif',
              }}
            >
              Verify your email.
            </h1>

            <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-white/55 sm:text-base">
              We&apos;ll send a sign-up link to{" "}
              <span className="font-semibold text-white/90">
                {email || "your email address"}
              </span>{" "}
              so you can continue setting up your STREAM account.
            </p>
          </div>

          {/* EMAIL DISPLAY */}
          <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-xl">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
              Email address
            </p>

            <p className="mt-1 break-all text-sm text-white/85">
              {email || "No email provided"}
            </p>
          </div>

          {/* INVALID EMAIL */}
          {!isValidEmail && (
            <div className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              Please go back and enter a valid email address.
            </div>
          )}

          {/* SEND ERROR */}
          {error && (
            <div className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {/* PROMOTIONS */}
          <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm text-white/55">
            <input
              type="checkbox"
              checked={promotions}
              onChange={(e) =>
                setPromotions(e.target.checked)
              }
              className="mt-1 h-4 w-4 accent-violet-500"
            />

            <span>
              Send me STREAM recommendations, updates and special offers.
            </span>
          </label>

          {/* SEND LINK */}
          {!sent && (
            <button
              type="button"
              onClick={handleSendLink}
              disabled={!isValidEmail || loading}
              className="
                mt-7
                flex
                h-14
                w-full
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-r
                from-violet-700
                via-purple-600
                to-fuchsia-600
                font-semibold
                text-white
                shadow-[0_12px_45px_rgba(126,34,206,0.25)]
                transition
                duration-300
                hover:scale-[1.01]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Sending...
                </span>
              ) : (
                <>
                  Send Link
                  <span className="ml-2">→</span>
                </>
              )}
            </button>
          )}

          {/* SENT STATE */}
          {sent && (
            <div className="mt-6 rounded-xl border border-violet-400/15 bg-violet-500/10 px-4 py-4 text-sm leading-6 text-violet-100 backdrop-blur-xl">
              Check your inbox — we've sent a link to <strong>{email}</strong>.
              Click it to set your password and finish creating your account.
            </div>
          )}

          {/* CHANGE EMAIL */}
          <Link
            to="/"
            className="mx-auto mt-7 flex w-fit items-center gap-2 text-sm text-white/40 transition hover:text-violet-300"
          >
            Change email
          </Link>
        </div>
      </section>

      {/* BOTTOM GLOW */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-20 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent shadow-[0_-8px_35px_rgba(168,85,247,0.55)]" />
    </main>
  );
}