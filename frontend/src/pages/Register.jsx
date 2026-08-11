import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getBackdropUrl,
  getTrendingMovies,
} from "../services/tmdbService";

export default function Register() {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [searchParams] = useSearchParams();
  const emailFromHome = searchParams.get("email") || "";

  useEffect(() => {
    const loadSlides = async () => {
      try {
        const movies = await getTrendingMovies();

        const movieSlides = movies
          .filter((movie) => movie.backdrop_path)
          .slice(0, 5)
          .map((movie) => ({
            id: movie.id,
            image: getBackdropUrl(movie.backdrop_path),
            title: movie.title || movie.name,
            subtitle: "Trending on STREAM",
          }));

        setSlides(movieSlides);
      } catch (error) {
        console.error("Register slider error:", error);
      }
    };

    loadSlides();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides]);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#08060d] text-white">
      {/* MOBILE BACKGROUND */}
      <div className="absolute inset-0 md:hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
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

        {slides.length === 0 && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#171022] via-[#0b0810] to-[#050505]" />
        )}

        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#08060d]/55 to-[#08060d]/95" />
      </div>

      {/* REGISTER HEADER */}
      <header className="relative z-20 w-full border-b border-white/[0.06] bg-[#08060d]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between px-6 py-5 sm:px-10 lg:px-14">
          <div className="flex items-center gap-5">
            <Link
              to="/"
              className="text-2xl font-bold tracking-[0.12em] text-violet-400 sm:text-3xl"
              style={{
                fontFamily: '"Cormorant Garamond", serif',
              }}
            >
              STREAM
            </Link>

            <Link
              to="/"
              className="group hidden items-center gap-2 text-sm text-white/55 transition hover:text-violet-300 sm:flex"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1">
                ←
              </span>
              <span>Back</span>
            </Link>
          </div>

          <span className="text-[10px] uppercase tracking-[0.28em] text-white/35 sm:text-xs">
            Step 1 of 3
          </span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="relative z-10 mx-auto max-w-[1380px] px-6 py-10 sm:px-10 lg:px-14">
        <div
          className="
            grid
            grid-cols-1
            items-center
            gap-10
            md:grid-cols-[1.05fr_0.95fr]
            lg:gap-16
          "
        >
          {/* LEFT — FORM */}
          <section className="w-full">
            <div className="max-w-[640px]">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-400">
                Join STREAM
              </p>

              <h1
                className="mt-4 text-4xl font-semibold leading-[1.02] sm:text-5xl lg:text-[58px]"
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                }}
              >
                Your next story
                <br />
                starts here.
              </h1>

              <p className="mt-4 max-w-lg text-sm leading-6 text-white/55">
                Create your account and start discovering movies and shows made
                for you.
              </p>

              <form
                className="mt-8"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Full name"
                    className="h-14 w-full rounded-xl border border-white/15 bg-black/30 px-5 text-sm text-white outline-none backdrop-blur-xl transition placeholder:text-white/40 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15"
                  />

                  <input
                    type="email"
                    defaultValue={emailFromHome}
                    placeholder="Email address"
                    className="h-14 w-full rounded-xl border border-white/15 bg-black/30 px-5 text-sm text-white outline-none backdrop-blur-xl transition placeholder:text-white/40 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15"
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    className="h-14 w-full rounded-xl border border-white/15 bg-black/30 px-5 text-sm text-white outline-none backdrop-blur-xl transition placeholder:text-white/40 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15"
                  />

                  <input
                    type="password"
                    placeholder="Confirm password"
                    className="h-14 w-full rounded-xl border border-white/15 bg-black/30 px-5 text-sm text-white outline-none backdrop-blur-xl transition placeholder:text-white/40 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15"
                  />
                </div>

                <button
                  type="button"
                  className="
                    mt-5
                    flex
                    h-14
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-violet-700
                    via-purple-600
                    to-fuchsia-600
                    font-semibold
                    text-white
                    shadow-[0_10px_40px_rgba(126,34,206,0.25)]
                    transition
                    duration-300
                    hover:scale-[1.01]
                  "
                >
                  Continue
                  <span>→</span>
                </button>
              </form>

              <p className="mt-6 text-sm text-white/50">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-violet-400 transition hover:text-violet-300"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </section>

          {/* RIGHT — MOVIE SHOWCASE */}
          <section className="relative hidden items-center justify-center md:flex">
            <div
              className="
                relative
                h-[440px]
                w-full
                max-w-[500px]
                overflow-hidden
                rounded-[34px]
                border
                border-white/[0.08]
                shadow-[0_30px_80px_rgba(0,0,0,0.35)]
                lg:h-[470px]
              "
            >
              {slides.length === 0 && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#201235] via-[#0d0914] to-black" />
              )}

              {slides.map((slide, index) => (
                <div
                  key={slide.id}
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

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />
                </div>
              ))}

              <div className="absolute right-6 top-6 z-20 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white/80 backdrop-blur-xl">
                Your STREAM starts here
              </div>

              {slides.length > 0 && (
                <div className="absolute bottom-8 left-8 right-8 z-20">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-violet-300">
                    {slides[currentSlide]?.subtitle}
                  </p>

                  <h2
                    className="text-4xl font-semibold text-white lg:text-5xl"
                    style={{
                      fontFamily: '"Cormorant Garamond", serif',
                    }}
                  >
                    {slides[currentSlide]?.title}
                  </h2>

                  <div className="mt-5 flex gap-2">
                    {slides.map((slide, index) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => setCurrentSlide(index)}
                        aria-label={`Show ${slide.title}`}
                        className={`h-[4px] rounded-full transition-all duration-500 ${
                          index === currentSlide
                            ? "w-9 bg-violet-400"
                            : "w-3 bg-white/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* MOBILE BACK LINK */}
        <Link
          to="/"
          className="mt-8 flex w-fit items-center gap-2 text-sm text-white/55 sm:hidden"
        >
          ← Back
        </Link>

        {/* MOBILE INDICATORS */}
        {slides.length > 0 && (
          <div className="mt-8 flex justify-center gap-2 md:hidden">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentSlide(index)}
                aria-label={`Show ${slide.title}`}
                className={`h-[3px] rounded-full transition-all duration-500 ${
                  index === currentSlide
                    ? "w-8 bg-violet-400"
                    : "w-3 bg-white/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM GLOW */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent shadow-[0_-8px_35px_rgba(168,85,247,0.65)]" />
    </main>
  );
}