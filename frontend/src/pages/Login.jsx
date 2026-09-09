import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { loginUser } from "../services/authService";
import {
  getBackdropUrl,
  getTrendingMovies,
} from "../services/tmdbService";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [identifier, setIdentifier] = useState(
    searchParams.get("email") || ""
  );

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagesLoading, setImagesLoading] = useState(true);

  useEffect(() => {
    const loadSlides = async () => {
      try {
        setImagesLoading(true);

        const movies = await getTrendingMovies();

        const movieSlides = movies
          .filter((movie) => movie.backdrop_path)
          .slice(0, 7)
          .map((movie) => ({
            id: movie.id,
            image: getBackdropUrl(movie.backdrop_path),
            title:
              movie.title ||
              movie.name ||
              "Now Streaming",
            subtitle: "Trending on STREAM",
          }));

        setSlides(movieSlides);
        setCurrentSlide(0);
      } catch (err) {
        console.error(
          "Unable to load login backgrounds:",
          err
        );

        setSlides([
          {
            id: "fallback",
            image:
              "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
            title: "STREAM",
            subtitle: "Stories worth streaming",
          },
        ]);
      } finally {
        setImagesLoading(false);
      }
    };

    loadSlides();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((current) =>
        current >= slides.length - 1
          ? 0
          : current + 1
      );
    }, 5500);

    return () => clearInterval(interval);
  }, [slides.length]);

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    const cleanEmail = identifier.trim();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      setError("");

      const data = await loginUser(
        cleanEmail,
        password
      );

      if (!data?.token) {
        throw new Error(
          "The server did not return an authentication token."
        );
      }

      localStorage.setItem("token", data.token);

      if (data.email) {
        localStorage.setItem("email", data.email);
      } else {
        localStorage.setItem("email", cleanEmail);
      }

      sessionStorage.removeItem(
        "stream_active_profile"
      );

      navigate("/whos-watching", {
        replace: true,
      });
    } catch (err) {
      console.error("Login failed:", err);

      const message = String(
        err?.response?.data?.message ||
          err?.message ||
          ""
      ).toLowerCase();

      if (
        message.includes("password") ||
        message.includes("invalid") ||
        message.includes("credentials") ||
        message.includes("status 401") ||
        message.includes("status 403") ||
        message.includes("status 500") ||
        err?.response?.status === 401 ||
        err?.response?.status === 403 ||
        err?.response?.status === 500
      ) {
        setError(
          "Incorrect email or  password. Please try again."
        );
      } else if (
        message.includes("not found") ||
        message.includes("account") ||
        message.includes("user") ||
        message.includes("email") ||
        err?.response?.status === 404
      ) {
        setError(
          "We couldn't find an account with that email."
        );
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const activeSlide =
    slides[currentSlide] || null;

  return (
    <main className="relative h-screen overflow-hidden bg-[#08060d] text-white">
      {/* MOBILE BACKGROUND */}
      <div className="absolute inset-0 md:hidden">
        {slides.map((slide, index) => (
          <div
            key={`${slide.id}-${index}`}
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

        {imagesLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#160b27] via-[#08060d] to-black" />
        )}

        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-[#08060d]/35 to-[#08060d]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(109,40,217,0.14),transparent_65%)]" />
      </div>

      {/* PAGE */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1450px]">
        {/* LEFT SIDE */}
        <section className="flex h-full w-full flex-col overflow-y-auto px-6 py-6 sm:px-10 md:w-[50%] md:overflow-hidden md:px-12 lg:px-16">
          <Link
            to="/"
            className="w-fit text-2xl font-bold tracking-[0.12em] text-violet-400 sm:text-3xl"
            style={{
              fontFamily:
                '"Cormorant Garamond", serif',
            }}
          >
            STREAM
          </Link>

          <Link
            to="/"
            className="group mt-4 flex w-fit items-center gap-2 text-sm text-white/55 transition hover:text-violet-300"
          >
            <span className="text-lg transition-transform group-hover:-translate-x-1">
              ←
            </span>
            <span>Back</span>
          </Link>

          <div className="flex min-h-0 flex-1 items-center py-5">
            <div className="mx-auto w-full max-w-[420px] md:mx-0">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-violet-400">
                Welcome Back
              </p>

              <h1
                className="text-4xl font-semibold leading-[0.98] text-white sm:text-5xl lg:text-[52px]"
                style={{
                  fontFamily:
                    '"Cormorant Garamond", serif',
                }}
              >
                Enter your info
                <br />
                to sign in
              </h1>

              <p className="mt-3 text-sm text-white/55">
                Continue where you left off.
              </p>

              <form
                className="mt-7"
                onSubmit={handleLoginSubmit}
              >
                <input
                  type="email"
                  value={identifier}
                  disabled={loading}
                  autoComplete="email"
                  onChange={(event) => {
                    setIdentifier(
                      event.target.value
                    );

                    if (error) {
                      setError("");
                    }
                  }}
                  placeholder="Email address"
                  className="h-[52px] w-full rounded-xl border border-white/20 bg-black/35 px-5 text-sm text-white outline-none backdrop-blur-xl transition placeholder:text-white/45 focus:border-violet-400 focus:bg-black/45 focus:ring-2 focus:ring-violet-500/15 disabled:opacity-60"
                  required
                />

                <input
                  type="password"
                  value={password}
                  disabled={loading}
                  autoComplete="current-password"
                  onChange={(event) => {
                    setPassword(
                      event.target.value
                    );

                    if (error) {
                      setError("");
                    }
                  }}
                  placeholder="Password"
                  className="mt-3 h-[52px] w-full rounded-xl border border-white/20 bg-black/35 px-5 text-sm text-white outline-none backdrop-blur-xl transition placeholder:text-white/45 focus:border-violet-400 focus:bg-black/45 focus:ring-2 focus:ring-violet-500/15 disabled:opacity-60"
                  required
                />

                {error && (
                  <div className="mt-3 rounded-lg border border-red-400/15 bg-red-500/[0.08] px-4 py-3">
                    <p className="text-xs leading-5 text-red-200">
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 flex h-[52px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-700 via-purple-600 to-fuchsia-600 font-semibold text-white shadow-[0_10px_40px_rgba(126,34,206,0.25)] transition duration-300 hover:scale-[1.01] disabled:cursor-wait disabled:opacity-60 disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                      Signing in...
                    </span>
                  ) : (
                    <>
                      Sign In
                      <span className="ml-2">
                        →
                      </span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 flex items-center justify-between gap-4">
                <button
                  type="button"
                  className="text-sm text-white/55 transition hover:text-violet-300"
                >
                  Get Help
                </button>

                <Link
                  to="/"
                  className="text-sm text-white/55 transition hover:text-violet-300"
                >
                  New to STREAM?
                </Link>
              </div>

              <p className="mt-6 max-w-sm text-[11px] leading-5 text-white/30">
                This page is protected to help keep
                your STREAM account secure.
              </p>
            </div>
          </div>

          {slides.length > 1 && (
            <div className="mb-1 flex justify-center gap-2 md:hidden">
              {slides.map((slide, index) => (
                <button
                  key={`${slide.id}-mobile`}
                  type="button"
                  onClick={() =>
                    setCurrentSlide(index)
                  }
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
        </section>

        {/* RIGHT SIDE */}
        <section className="relative hidden h-full w-[50%] p-5 md:block lg:p-6">
          <div className="relative h-full max-h-[calc(100vh-40px)] overflow-hidden rounded-[30px] border border-white/[0.08] shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
            {slides.map((slide, index) => (
              <div
                key={`${slide.id}-desktop`}
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

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/5" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-transparent" />
              </div>
            ))}

            {imagesLoading && (
              <div className="absolute inset-0 bg-gradient-to-br from-[#171022] via-[#0c0812] to-black" />
            )}

            <div className="absolute right-6 top-6 z-20 rounded-full border border-white/15 bg-black/25 px-4 py-2 text-[9px] font-medium uppercase tracking-[0.2em] text-white/80 backdrop-blur-xl">
              STREAM
            </div>

            {activeSlide && (
              <div className="absolute bottom-9 left-9 right-9 z-20">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-violet-300">
                  {activeSlide.subtitle}
                </p>

                <h2
                  className="text-4xl font-semibold text-white lg:text-5xl"
                  style={{
                    fontFamily:
                      '"Cormorant Garamond", serif',
                  }}
                >
                  {activeSlide.title}
                </h2>

                {slides.length > 1 && (
                  <div className="mt-5 flex gap-2">
                    {slides.map(
                      (slide, index) => (
                        <button
                          key={`${slide.id}-indicator`}
                          type="button"
                          onClick={() =>
                            setCurrentSlide(
                              index
                            )
                          }
                          aria-label={`Show ${slide.title}`}
                          className={`h-[3px] rounded-full transition-all duration-500 ${
                            index === currentSlide
                              ? "w-9 bg-violet-400"
                              : "w-4 bg-white/30"
                          }`}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent shadow-[0_-8px_35px_rgba(168,85,247,0.65)]" />
    </main>
  );
}