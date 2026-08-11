import { useEffect, useRef, useState } from "react";
import {
  getPosterUrl,
  getTrendingMovies,
} from "../services/tmdbService";

export default function Trending() {
  const [movies, setMovies] = useState([]);
  const sliderRef = useRef(null);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const results = await getTrendingMovies();

        setMovies(
          results
            .filter((movie) => movie.poster_path)
            .slice(0, 10)
        );
      } catch (error) {
        console.error("Trending movies error:", error);
      }
    };

    loadMovies();
  }, []);

  const scrollRight = () => {
    sliderRef.current?.scrollBy({
      left: 650,
      behavior: "smooth",
    });
  };

  const scrollLeft = () => {
    sliderRef.current?.scrollBy({
      left: -650,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative overflow-hidden bg-[#050505] pb-16 pt-24 md:pb-20 md:pt-28">

      {/* LARGE SHALLOW PURPLE ARC */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[-150px]
          z-0
          h-[220px]
          w-[170%]
          -translate-x-1/2
          rounded-[0_0_50%_50%]
          border-b-[2px]
          border-[#8b5cf6]
          shadow-[0_4px_22px_rgba(139,92,246,0.75)]
        "
      />

      {/* ARC GLOW */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[-145px]
          z-0
          h-[220px]
          w-[170%]
          -translate-x-1/2
          rounded-[0_0_50%_50%]
          border-b-[7px]
          border-violet-500/30
          blur-[12px]
        "
      />

      <div className="relative z-10 mx-auto max-w-[1350px] px-5 md:px-10 lg:px-14">

        <h2 className="mb-7 text-2xl font-semibold text-white md:text-3xl">
          Trending Now
        </h2>

        {/* ARROWS + MOVIES */}
        <div className="flex items-center">

          {/* LEFT EDGE */}
          <div className="hidden shrink-0 items-center justify-center pr-3 md:flex">
            <button
              type="button"
              onClick={scrollLeft}
              aria-label="Scroll left"
              className="
                flex
                h-28
                w-9
                items-center
                justify-center
                rounded-lg
                bg-white/10
                text-3xl
                text-white
                transition
                hover:bg-violet-600
              "
            >
              ‹
            </button>
          </div>

          {/* MOVIE ROW */}
          <div
            ref={sliderRef}
            className="
              flex
              flex-1
              gap-4
              overflow-x-auto
              scroll-smooth
              pb-6
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            {movies.map((movie, index) => (
              <div
                key={movie.id}
                className="
                  group
                  relative
                  min-w-[145px]
                  cursor-pointer
                  py-2
                  sm:min-w-[175px]
                  md:min-w-[200px]
                  lg:min-w-[215px]
                "
              >
                <div className="relative ml-5 overflow-hidden rounded-lg">
                  <img
                    src={getPosterUrl(movie.poster_path)}
                    alt={movie.title}
                    loading="lazy"
                    className="
                      aspect-[2/3]
                      w-full
                      object-cover
                      transition
                      duration-500
                      group-hover:scale-[1.04]
                    "
                  />
                </div>

                <span
                  className="
                    pointer-events-none
                    absolute
                    -left-1
                    bottom-0
                    z-20
                    text-[5.3rem]
                    font-black
                    leading-none
                    text-[#050505]
                    [-webkit-text-stroke:2px_white]
                    sm:text-[6.3rem]
                    md:text-[7rem]
                  "
                >
                  {index + 1}
                </span>
              </div>
            ))}
          </div>

          {/* RIGHT EDGE */}
          <div className="hidden shrink-0 items-center justify-center pl-3 md:flex">
            <button
              type="button"
              onClick={scrollRight}
              aria-label="Scroll right"
              className="
                flex
                h-28
                w-9
                items-center
                justify-center
                rounded-lg
                bg-white/10
                text-3xl
                text-white
                transition
                hover:bg-violet-600
              "
            >
              ›
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}