import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const DEMO_CODE = "123456";
const INITIAL_TIMER = 58;

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [timer, setTimer] = useState(INITIAL_TIMER);
  const [verified, setVerified] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (verified || timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, verified]);

  const handleCodeChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    const nextCode = [...code];
    nextCode[index] = digit;

    setCode(nextCode);
    setVerifyError("");

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const nextCode = ["", "", "", "", "", ""];

    pasted.split("").forEach((digit, index) => {
      nextCode[index] = digit;
    });

    setCode(nextCode);
    setVerifyError("");

    const focusIndex = Math.min(pasted.length, 5);

    setTimeout(() => {
      inputRefs.current[focusIndex]?.focus();
    }, 50);
  };

  const handleVerify = () => {
    const enteredCode = code.join("");

    if (enteredCode.length !== 6) {
      setVerifyError("Enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setVerifyError("");

    setTimeout(() => {
      setLoading(false);

      if (enteredCode !== DEMO_CODE) {
        setVerifyError("That verification code is incorrect. Please try again.");
        return;
      }

      setVerified(true);
    }, 700);
  };

  const handleResend = () => {
    if (timer > 0 || loading) return;

    setTimer(INITIAL_TIMER);
    setCode(["", "", "", "", "", ""]);
    setVerifyError("");

    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  };

  const handleContinue = () => {
    navigate(`/plans?email=${encodeURIComponent(email)}`);
  };

  const formattedTimer = `00:${String(timer).padStart(2, "0")}`;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07050d] text-white">
      {/* AMBIENT BACKGROUND */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[43%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-700/[0.09] blur-[170px]" />

        <div className="absolute bottom-[-150px] left-1/2 h-[330px] w-[700px] -translate-x-1/2 rounded-full bg-fuchsia-600/[0.04] blur-[160px]" />
      </div>

      {/* NAV */}
      <header className="relative z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-10 lg:px-14">
          <Link
            to="/"
            className="text-2xl font-bold tracking-[0.16em] text-violet-400 sm:text-3xl"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
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

      {/* PAGE */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-6xl flex-col px-6 pb-8 sm:px-10 lg:px-14">
        {/* TOP ROW */}
        <div className="flex items-center justify-between pt-4">
          {!verified ? (
            <Link
              to={`/register-intro?email=${encodeURIComponent(email)}`}
              className="group flex items-center gap-3 text-sm text-white/45 transition hover:text-violet-300"
            >
              <span className="text-lg transition-transform duration-300 group-hover:-translate-x-1">
                ←
              </span>

              <span>Back</span>
            </Link>
          ) : (
            <span />
          )}

          <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-violet-400">
            Step 1 of 3
          </span>
        </div>

        {/* CONTENT */}
        <div className="flex flex-1 items-center justify-center py-5">
          {!verified ? (
            /* ==========================
               VERIFICATION STATE
            ========================== */
            <div className="w-full max-w-[720px] text-center">
              {/* ICON */}
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] border border-violet-400/35 bg-violet-500/[0.045] shadow-[0_0_55px_rgba(139,92,246,0.12)]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-9 w-9 fill-none stroke-violet-400"
                  strokeWidth="1.7"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
              </div>

              {/* LABEL */}
              <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.32em] text-violet-400">
                Email verification
              </p>

              {/* TITLE */}
              <h1
                className="mt-4 text-5xl font-semibold leading-[0.98] text-white sm:text-6xl"
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                }}
              >
                Verify your email.
              </h1>

              {/* DESCRIPTION */}
              <p className="mx-auto mt-6 max-w-lg text-sm leading-6 text-white/48 sm:text-base">
                We&apos;ve sent a 6-digit verification code to
              </p>

              <p className="mt-1 break-all text-base font-semibold text-white/90">
                {email || "your email address"}
              </p>

              <p className="mt-7 text-sm text-white/40 sm:text-base">
                Enter the code below to continue.
              </p>

              {/* OTP */}
              <div className="mt-7 flex justify-center gap-2 sm:gap-4">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      inputRefs.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) =>
                      handleCodeChange(index, e.target.value)
                    }
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="
                      h-16
                      w-12
                      rounded-xl
                      border
                      border-white/[0.14]
                      bg-white/[0.025]
                      text-center
                      text-2xl
                      font-semibold
                      text-white
                      outline-none
                      transition
                      duration-300

                      focus:border-violet-400
                      focus:bg-violet-500/[0.05]
                      focus:ring-2
                      focus:ring-violet-500/15

                      sm:h-[72px]
                      sm:w-16
                    "
                  />
                ))}
              </div>

              {/* ERROR */}
              {verifyError && (
                <p className="mt-4 text-sm text-red-300">
                  {verifyError}
                </p>
              )}

              {/* RESEND */}
              <div className="mt-7 text-sm text-white/40 sm:text-base">
                <span>Didn&apos;t receive the code? </span>

                {timer > 0 ? (
                  <>
                    <span className="font-medium text-violet-300">
                      Resend code
                    </span>

                    <span className="mx-2 text-white/20">•</span>

                    <span>{formattedTimer}</span>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="font-medium text-violet-300 transition hover:text-violet-200"
                  >
                    Resend code
                  </button>
                )}
              </div>

              {/* SECURITY */}
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
                  <p className="text-sm font-medium text-white/90">
                    For your security
                  </p>

                  <p className="mt-1 text-sm text-white/40">
                    The verification code will expire in 10 minutes.
                  </p>
                </div>
              </div>

              {/* VERIFY BUTTON */}
              <button
                type="button"
                onClick={handleVerify}
                disabled={loading}
                className="
                  group
                  mx-auto
                  mt-7
                  flex
                  h-16
                  w-full
                  max-w-[600px]
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

                  disabled:cursor-wait
                  disabled:opacity-60
                "
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Verifying...
                  </span>
                ) : (
                  <>
                    Verify Email

                    <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>

              {/* DEMO */}
              <p className="mt-4 text-xs text-white/20">
                Demo verification code:{" "}
                <span className="tracking-[0.16em] text-violet-300/70">
                  123456
                </span>
              </p>
            </div>
          ) : (
            /* ==========================
               SUCCESS STATE
            ========================== */
            <div className="relative mx-auto w-full max-w-[720px] text-center">
              {/* SUCCESS AMBIENT GLOW */}
              <div className="pointer-events-none absolute left-1/2 top-16 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-600/[0.09] blur-[110px]" />

              {/* CHECK ICON */}
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/[0.055] shadow-[0_0_50px_rgba(139,92,246,0.12)]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7 fill-none stroke-violet-300"
                  strokeWidth="1.8"
                >
                  <path d="m5 12 4 4L19 6" />
                </svg>
              </div>

              {/* LABEL */}
              <p className="relative mt-7 text-[10px] font-semibold uppercase tracking-[0.34em] text-violet-400">
                Verification complete
              </p>

              {/* TITLE */}
              <h1
                className="relative mt-4 text-5xl font-semibold leading-[0.98] text-white sm:text-6xl"
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                }}
              >
                You&apos;re verified.
              </h1>

              {/* DESCRIPTION */}
              <p className="relative mx-auto mt-5 max-w-md text-sm leading-6 text-white/45 sm:text-base">
                Your email has been confirmed successfully.
                <br />
                You&apos;re one step closer to your STREAM experience.
              </p>

              {/* VERIFIED EMAIL */}
              <div className="relative mx-auto mt-8 max-w-[520px] rounded-2xl border border-white/[0.08] bg-white/[0.025] px-5 py-4 text-left backdrop-blur-xl">
                <div className="flex items-center justify-between gap-5">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/28">
                      Verified email
                    </p>

                    <p className="mt-1 truncate text-sm font-medium text-white/85">
                      {email}
                    </p>
                  </div>

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/[0.08]">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 fill-none stroke-violet-300"
                      strokeWidth="2"
                    >
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={handleContinue}
                className="
                  group
                  relative
                  mx-auto
                  mt-7
                  flex
                  h-16
                  w-full
                  max-w-[520px]
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

                  shadow-[0_16px_55px_rgba(126,34,206,0.28)]

                  transition
                  duration-300

                  hover:scale-[1.01]
                  hover:shadow-[0_18px_70px_rgba(168,85,247,0.35)]
                "
              >
                Continue Setup

                <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </button>

              {/* NEXT STEP */}
              <div className="relative mt-5 flex items-center justify-center gap-2 text-xs text-white/25">
                <span className="h-1 w-1 rounded-full bg-violet-400/70" />
                <span>Next: choose your STREAM plan</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* BOTTOM ACCENT */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent shadow-[0_-8px_35px_rgba(168,85,247,0.45)]" />
    </main>
  );
}