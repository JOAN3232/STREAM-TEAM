import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StreamLoader from "./StreamLoader";

import {
  getBackdropUrl,
  getTrendingMovies,
} from "../services/tmdbService";

export default function Hero() {
  const navigate = useNavigate();

  const [backgrounds, setBackgrounds] = useState([]);
  const [currentBackground, setCurrentBackground] = useState(0);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // LOAD MOVIES FROM TMDB
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
            title: movie.title || movie.name,
          }));

        setBackgrounds(movieBackgrounds);
      } catch (error) {
        console.error("Hero background error:", error);
      }
    };

    loadBackgrounds();
  }, []);

  // AUTO SLIDESHOW
  useEffect(() => {
    if (backgrounds.length === 0) return;

    const interval = setInterval(() => {
      setCurrentBackground((prev) =>
        prev === backgrounds.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [backgrounds]);

  // GET STARTED
  const handleGetStarted = () => {
    if (!email.trim()) return;

    setLoading(true);

    setTimeout(() => {
      navigate(`/register?email=${encodeURIComponent(email)}`);
    }, 1400);
  };

  return (
    <>
      <section className="relative min-h-screen overflow-hidden bg-[#050505]">
        {/* ===============================
            TMDB BACKGROUND SLIDESHOW
        ================================ */}

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
              alt=""
              className="
                h-full
                w-full
                object-cover
                object-center
                brightness-90
                contrast-105
                saturate-105
              "
            />
          </div>
        ))}

        {/* FALLBACK WHILE TMDB LOADS */}
        {backgrounds.length === 0 && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#171022] via-[#0b0810] to-[#050505]" />
        )}

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-black/45" />

        {/* PURPLE CINEMATIC TINT */}
        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_center,rgba(109,40,217,0.13),transparent_65%)]
          "
        />

        {/* TOP/BOTTOM SHADING */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/65" />

        {/* ===============================
            HERO CONTENT
        ================================ */}

        <div
          className="
            relative
            z-10
            mx-auto
            flex
            min-h-screen
            max-w-5xl
            flex-col
            items-center
            justify-center
            px-6
            pb-20
            pt-28
            text-center
          "
        >
          <h1
            className="
              max-w-4xl
              text-4xl
              font-semibold
              leading-[1.02]
              text-white
              sm:text-5xl
              md:text-6xl
              lg:text-7xl
            "
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
            Ready to watch? Enter your email to create or restart your
            membership.
          </p>

          {/* EMAIL + GET STARTED */}
          <div
            className="
              mt-7
              flex
              w-full
              max-w-xl
              flex-col
              gap-3
              sm:flex-row
            "
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleGetStarted();
                }
              }}
              placeholder="Email address"
              className="
                h-14
                w-full
                rounded-lg
                border
                border-white/30
                bg-black/50
                px-5
                text-base
                text-white
                outline-none
                backdrop-blur-md
                transition
                placeholder:text-white/50
                focus:border-violet-400
                focus:ring-2
                focus:ring-violet-500/20
                sm:flex-1
              "
            />

            <button
              type="button"
              onClick={handleGetStarted}
              disabled={loading}
              className="
                h-14
                w-full
                rounded-lg
                bg-gradient-to-r
                from-violet-700
                via-purple-600
                to-fuchsia-600
                px-7
                text-base
                font-semibold
                text-white
                shadow-lg
                shadow-violet-950/30
                transition
                duration-300
                hover:scale-[1.02]
                hover:from-violet-600
                hover:to-fuchsia-500
                disabled:cursor-not-allowed
                disabled:opacity-70
                sm:w-auto
                sm:whitespace-nowrap
              "
            >
              Get Started
              <span className="ml-2">→</span>
            </button>
          </div>

          {/* SLIDE INDICATORS */}
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

        {/* IMPORTANT:
            NO BOTTOM LINE HERE.
            Trending.jsx already owns the purple arc.
        */}
      </section>

      {/* GET STARTED LOADER */}
      {loading && <StreamLoader />}
    </>
  );
}