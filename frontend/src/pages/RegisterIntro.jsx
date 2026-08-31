import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

export default function RegisterIntro() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const presetEmail = params.get("email") || "";

  const [email, setEmail] = useState(presetEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleContinue = async () => {
    setError("");

    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setSubmitting(true);
      await registerUser({
        email: email.trim(),
        password,
      });
      navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setError(err.message || "Could not create your account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#07050d] text-white">
      {/* HEADER */}
      <header className="border-b border-white/[0.07]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-10 lg:px-14">
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

      {/* CONTENT */}
      <section className="flex min-h-[calc(100vh-90px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-[560px]">
          {/* DEVICE ICONS */}
          <div className="mb-10 flex items-end justify-center gap-4 text-violet-400">
            <div className="h-10 w-16 rounded-md border-2 border-current" />

            <div className="relative h-14 w-20 rounded-md border-2 border-current">
              <span className="absolute -bottom-2 left-1/2 h-2 w-8 -translate-x-1/2 border-b-2 border-current" />
            </div>

            <div className="flex items-end gap-1">
              <div className="h-9 w-6 rounded border-2 border-current" />
              <div className="h-12 w-7 rounded border-2 border-current" />
            </div>
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-400">
            Step 1 of 3
          </p>

          <h1
            className="mt-4 text-4xl font-semibold leading-[1.04] sm:text-5xl lg:text-[58px]"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
            }}
          >
            Finish setting up
            <br />
            your account.
          </h1>

          <p className="mt-5 max-w-md text-sm leading-6 text-white/55 sm:text-base">
            You&apos;re only a few steps away from unlimited movies, shows
            and stories on STREAM.
          </p>

          {email && (
            <div className="mt-7 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                Continue with
              </p>

              <p className="mt-1 break-all text-sm text-white/80">
                {email}
              </p>
            </div>
          )}

          <div className="mt-7 space-y-4">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              className="h-14 w-full rounded-xl border border-white/20 bg-black/35 px-5 text-sm text-white outline-none backdrop-blur-xl transition placeholder:text-white/45 focus:border-violet-400 focus:bg-black/45 focus:ring-2 focus:ring-violet-500/15"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create password"
                className="h-14 w-full rounded-xl border border-white/20 bg-black/35 px-5 pr-14 text-sm text-white outline-none backdrop-blur-xl transition placeholder:text-white/45 focus:border-violet-400 focus:bg-black/45 focus:ring-2 focus:ring-violet-500/15"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex w-14 items-center justify-center text-white/50 transition hover:text-violet-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-300">{error}</p>
            )}

            <button
              type="button"
              disabled={submitting}
              onClick={handleContinue}
              className="flex h-14 w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-700 via-purple-600 to-fuchsia-600 font-semibold text-white shadow-[0_12px_45px_rgba(126,34,206,0.25)] transition duration-300 hover:scale-[1.01] disabled:opacity-70"
            >
              {submitting ? "Creating account..." : "Continue"}
              {!submitting && <span className="ml-2">→</span>}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}