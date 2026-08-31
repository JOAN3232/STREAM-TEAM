import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

const slides = [
  {
    image:
      "https://image.tmdb.org/t/p/original/8rpDcsfLJypbO6vREc0547VKqEv.jpg",
    title: "Dune",
    subtitle: "Now Streaming",
  },
  {
    image:
      "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    title: "Interstellar",
    subtitle: "Explore Beyond",
  },
  {
    image:
      "https://image.tmdb.org/t/p/original/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg",
    title: "The Substance",
    subtitle: "Trending Now",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = await loginUser(identifier, password);
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }
      navigate("/whos-watching");
    } catch (err) {
      console.error("Login failed", err);
      setError(err.message || "Could not sign in. Check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08060d] text-white">
      {/* MOBILE MOVIE BACKGROUND */}
      <div className="absolute inset-0 md:hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.title}
            className={`absolute inset-0 transition-all duration-[1400ms] ease-in-out ${
              index === currentSlide
                ? "scale-100 opacity-100"
                : "scale-105 opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt=""
              className="h-full w-full object-cover object-center"
            />
          </div>
        ))}

        <div className="absolute inset-0 bg-black/60" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-[#08060d]/35 to-[#08060d]/90" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(109,40,217,0.14),transparent_65%)]" />
      </div>

      {/* PAGE */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1450px]">

        {/* LEFT SIDE */}
        <section className="flex w-full flex-col px-6 py-8 sm:px-10 md:w-[48%] md:px-14 lg:px-20">
          {/* LOGO */}
          <Link
            to="/"
            className="w-fit text-2xl font-bold tracking-[0.12em] text-violet-400 sm:text-3xl"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
            }}
          >
            STREAM
          </Link>

          {/* BACK UNDER LOGO */}
          <Link
            to="/"
            className="group mt-7 flex w-fit items-center gap-2 text-sm text-white/55 transition hover:text-violet-300"
          >
            <span className="text-lg transition-transform group-hover:-translate-x-1">
              ←
            </span>
            <span>Back</span>
          </Link>

          {/* FORM AREA */}
          <div className="flex flex-1 items-center pt-8 md:pt-10">
            <div className="mx-auto w-full max-w-[430px] md:mx-0">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-violet-400">
                Welcome Back
              </p>

              <h1
                className="text-4xl font-semibold leading-[1.05] text-white sm:text-5xl lg:text-[56px]"
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                }}
              >
                Enter your info
                <br />
                to sign in
              </h1>

              <p className="mt-4 text-sm text-white/55">
                Or get started with a new account.
              </p>

              <form className="mt-9" onSubmit={handleLoginSubmit}>
                <input
                  type="text"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="Email or mobile number"
                  className="h-14 w-full rounded-xl border border-white/20 bg-black/35 px-5 text-sm text-white outline-none backdrop-blur-xl transition placeholder:text-white/45 focus:border-violet-400 focus:bg-black/45 focus:ring-2 focus:ring-violet-500/15"
                  required
                />

                <div className="relative mt-4">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
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
                  <p className="mt-3 text-sm text-red-300">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-4 h-14 w-full rounded-xl bg-gradient-to-r from-violet-700 via-purple-600 to-fuchsia-600 font-semibold text-white shadow-[0_10px_40px_rgba(126,34,206,0.25)] transition duration-300 hover:scale-[1.01] disabled:opacity-70"
                >
                  {submitting ? "Signing in..." : "Continue"}
                  {!submitting && <span className="ml-2">→</span>}
                </button>
              </form>

              <button
                type="button"
                className="mt-7 text-sm text-white/65 transition hover:text-violet-300"
              >
                Get Help ↓
              </button>

              <p className="mt-10 max-w-sm text-xs leading-5 text-white/35">
                This page is protected to help keep your STREAM account secure.
                By continuing, you agree to STREAM&apos;s terms.
              </p>
            </div>
          </div>

          {/* MOBILE INDICATORS */}
          <div className="mb-2 flex justify-center gap-2 md:hidden">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => setCurrentSlide(index)}
                className={`h-[3px] rounded-full transition-all duration-500 ${
                  index === currentSlide
                    ? "w-8 bg-violet-400"
                    : "w-3 bg-white/30"
                }`}
              />
            ))}
          </div>
        </section>

        {/* RIGHT SIDE — DESKTOP */}
        <section className="relative hidden w-[52%] p-6 md:block lg:p-8">
          <div className="relative h-full min-h-[calc(100vh-64px)] overflow-hidden rounded-[38px] border border-white/[0.08]">
            {slides.map((slide, index) => (
              <div
                key={slide.title}
                className={`absolute inset-0 transition-all duration-[1400ms] ease-in-out ${
                  index === currentSlide
                    ? "scale-100 opacity-100"
                    : "scale-105 opacity-0"
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="h-full w-full object-cover object-center"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/10" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
              </div>
            ))}

            {/* BADGE */}
            <div className="absolute right-8 top-8 z-20 rounded-full border border-white/15 bg-black/25 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-white/80 backdrop-blur-xl">
              STREAM Original
            </div>

            {/* MOVIE INFO */}
            <div className="absolute bottom-14 left-12 right-12 z-20">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">
                {slides[currentSlide].subtitle}
              </p>

              <h2
                className="text-5xl font-semibold text-white lg:text-6xl"
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                }}
              >
                {slides[currentSlide].title}
              </h2>

              <div className="mt-7 flex gap-2">
                {slides.map((slide, index) => (
                  <button
                    key={slide.title}
                    type="button"
                    onClick={() => setCurrentSlide(index)}
                    className={`h-[4px] rounded-full transition-all duration-500 ${
                      index === currentSlide
                        ? "w-10 bg-violet-400"
                        : "w-4 bg-white/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* BOTTOM GLOW */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent shadow-[0_-8px_35px_rgba(168,85,247,0.65)]" />
    </main>
  );
}