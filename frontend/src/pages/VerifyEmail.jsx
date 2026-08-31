import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resendVerification, verifyEmailToken } from "../services/authService";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState(token ? "verifying" : "pending");
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    let active = true;

    const runVerification = async () => {
      try {
        const data = await verifyEmailToken(token);

        if (!active) return;

        if (data?.token) {
          localStorage.setItem("token", data.token);
        }

        setStatus("success");
        setMessage(data?.message || "Your email has been verified.");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error.message || "Invalid or expired verification token.");
      }
    };

    runVerification();

    return () => {
      active = false;
    };
  }, [token]);

  const handleResend = async () => {
    if (!email || resending) return;

    try {
      setResending(true);
      const data = await resendVerification(email);
      setStatus("resent");
      setMessage(data?.message || "Verification email sent.");
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Could not resend verification email.");
    } finally {
      setResending(false);
    }
  };

  const handleContinue = () => {
    navigate(`/plans?email=${encodeURIComponent(email)}`);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07050d] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[43%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-700/[0.09] blur-[170px]" />
        <div className="absolute bottom-[-150px] left-1/2 h-[330px] w-[700px] -translate-x-1/2 rounded-full bg-fuchsia-600/[0.04] blur-[160px]" />
      </div>

      <header className="relative z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-10 lg:px-14">
          <Link
            to="/"
            className="text-2xl font-bold tracking-[0.16em] text-violet-400 sm:text-3xl"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
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

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-6xl flex-col px-6 pb-8 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between pt-4">
          <Link
            to={email ? `/register-intro?email=${encodeURIComponent(email)}` : "/register-intro"}
            className="group flex items-center gap-3 text-sm text-white/45 transition hover:text-violet-300"
          >
            <span className="text-lg transition-transform duration-300 group-hover:-translate-x-1">←</span>
            <span>Back</span>
          </Link>

          <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-violet-400">
            Step 1 of 3
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center py-5">
          <div className="w-full max-w-[720px] text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] border border-violet-400/35 bg-violet-500/[0.045] shadow-[0_0_55px_rgba(139,92,246,0.12)]">
              {status === "verifying" ? (
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-violet-400/25 border-t-violet-400" />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="h-9 w-9 fill-none stroke-violet-400"
                  strokeWidth="1.7"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
              )}
            </div>

            <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.32em] text-violet-400">
              Email verification
            </p>

            <h1
              className="mt-4 text-5xl font-semibold leading-[0.98] text-white sm:text-6xl"
              style={{ fontFamily: '"Cormorant Garamond", serif' }}
            >
              {status === "verifying" && "Verifying your email."}
              {status === "pending" && "Check your email."}
              {status === "success" && "Email verified."}
              {status === "resent" && "Verification sent again."}
              {status === "error" && "Verification failed."}
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-sm leading-6 text-white/48 sm:text-base">
              {status === "verifying" && "We are validating your verification link now."}
              {status === "pending" && "We sent a verification link to your email address. Open it to activate your account."}
              {status === "success" && (message || "Your email has been verified successfully.")}
              {status === "resent" && (message || "A new verification email has been sent.")}
              {status === "error" && (message || "This verification link is invalid or has expired.")}
            </p>

            {email && (
              <p className="mt-3 break-all text-base font-semibold text-white/90">
                {email}
              </p>
            )}

            <div className="mx-auto mt-7 flex max-w-[600px] items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-5 py-4 text-left backdrop-blur-xl">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/[0.09]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-none stroke-violet-400"
                  strokeWidth="1.7"
                >
                  <path d="M12 3 5 6v5c0 5 3.5 8 7 10 3.5-2 7-5 7-10V6l-7-3Z" />
                  <path d="M12 8v4" />
                  <path d="M12 15h.01" />
                </svg>
              </div>

              <div>
                <p className="text-sm font-medium text-white/90">For your security</p>
                <p className="mt-1 text-sm leading-6 text-white/45">
                  Verification links expire automatically. If your link is invalid or expired, request a new one below.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {status === "success" ? (
                <button
                  type="button"
                  onClick={handleContinue}
                  className="flex h-14 min-w-[220px] items-center justify-center rounded-xl bg-gradient-to-r from-violet-700 via-purple-600 to-fuchsia-600 px-6 font-semibold text-white shadow-[0_12px_45px_rgba(126,34,206,0.25)] transition duration-300 hover:scale-[1.01]"
                >
                  Continue to plans
                  <span className="ml-2">→</span>
                </button>
              ) : (
                email && (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="flex h-14 min-w-[220px] items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-6 font-semibold text-white transition duration-300 hover:border-violet-400/40 hover:bg-violet-500/[0.06] disabled:opacity-60"
                  >
                    {resending ? "Sending..." : "Resend verification email"}
                  </button>
                )
              )}

              <Link
                to="/login"
                className="flex h-14 min-w-[220px] items-center justify-center rounded-xl text-sm font-semibold text-white/65 transition hover:text-violet-300"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
