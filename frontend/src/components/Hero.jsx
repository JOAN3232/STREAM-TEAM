import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBackdropUrl,
  getTrendingMovies,
} from "../services/tmdbService";

export default function Hero() {
  const navigate = useNavigate();

  const [backgrounds, setBackgrounds] = useState([]);
  const [currentBackground, setCurrentBackground] = useState(0);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadBackgrounds = async () => {
      try {
        const movies = await getTrendingMovies();

        const movieBackgrounds = movies
          .filter((movie) => movie.backdrop_path)
          .slice(0, 7)
          .map((movie) => ({
            id: movie.id,
            image: getBackdropUrl(movie.backdrop_path),
            title: movie.title || movie.name || "Movie",
          }));

        setBackgrounds(movieBackgrounds);
      } catch (error) {
        console.error("Hero background error:", error);
      }
    };

    loadBackgrounds();
  }, []);

  useEffect(() => {
    if (backgrounds.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBackground((prev) =>
        prev === backgrounds.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [backgrounds]);

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };

  const handleGetStarted = () => {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setEmailError("Please enter your email address.");
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    if (loading) return;

    setEmailError("");
    setLoading(true);

    try {
      navigate(
        `/register-intro?email=${encodeURIComponent(cleanEmail)}`
      );
    } catch (error) {
      console.error("Get started error:", error);
      setEmailError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#050505]">
      {backgrounds.map((movie, index) => (
        <div
          key={movie.id}
          className={`absolute inset-0 transition-all duration-[1800ms] ease-in-out ${
            index === currentBackground
              ? "scale-100 opacity-100"
              : "scale-105 opacity-0"
          }`}
        >
          <img
            src={movie.image}
            alt={movie.title}
            className="h-full w-full object-cover object-center brightness-[0.65] contrast-110 saturate-110"
          />
        </div>
      ))}

      {backgrounds.length === 0 && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#160b27] via-[#09060f] to-[#050505]" />
      )}

      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.18),transparent_62%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#050505]/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 pb-20 pt-28 text-center">
        <h1
          className="max-w-4xl text-4xl font-semibold leading-[1.02] text-white sm:text-5xl md:text-6xl lg:text-7xl"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
          }}
        >
          Unlimited movies, shows,
          <br className="hidden sm:block" />
          and stories worth streaming.
        </h1>

        <p className="mt-5 text-base font-medium text-white/90 md:text-xl">
          Watch anywhere. Cancel anytime.
        </p>

        <p className="mt-6 max-w-xl text-sm leading-6 text-white/75 md:text-base">
          Ready to watch? Enter your email to create or restart your membership.
        </p>

        <div className="mt-7 w-full max-w-xl">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);

                if (emailError) {
                  setEmailError("");
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleGetStarted();
                }
              }}
              placeholder="Email address"
              aria-invalid={Boolean(emailError)}
              className={`h-14 w-full rounded-lg border bg-black/50 px-5 text-base text-white outline-none backdrop-blur-md transition placeholder:text-white/50 focus:ring-2 sm:flex-1 ${
                emailError
                  ? "border-red-400 focus:border-red-400 focus:ring-red-500/20"
                  : "border-white/30 focus:border-violet-400 focus:ring-violet-500/20"
              }`}
            />

            <button
              type="button"
              onClick={handleGetStarted}
              disabled={loading}
              className="flex h-14 w-full min-w-[165px] items-center justify-center rounded-lg bg-gradient-to-r from-violet-700 via-purple-600 to-fuchsia-600 px-7 text-base font-semibold text-white shadow-lg shadow-violet-950/30 transition duration-300 hover:scale-[1.02] hover:shadow-violet-900/40 disabled:cursor-wait disabled:opacity-90 sm:w-auto sm:whitespace-nowrap"
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Loading
                </span>
              ) : (
                <>
                  Get Started
                  <span className="ml-2">→</span>
                </>
              )}
            </button>
          </div>

          {emailError && (
            <p className="mt-2 text-left text-sm text-red-300">
              {emailError}
            </p>
          )}
        </div>

        {backgrounds.length > 0 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            {backgrounds.map((movie, index) => (
              <button
                key={movie.id}
                type="button"
                onClick={() => setCurrentBackground(index)}
                aria-label={`Show ${movie.title}`}
                className={`h-[3px] rounded-full transition-all duration-500 ${
                  index === currentBackground
                    ? "w-8 bg-violet-400"
                    : "w-3 bg-white/25"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}