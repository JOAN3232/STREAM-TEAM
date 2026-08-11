const reasons = [
  {
    title: "Enjoy on your TV",
    description:
      "Watch on Smart TVs, PlayStation, Xbox, Chromecast, Apple TV, Blu-ray players and more.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <rect x="3" y="5" width="18" height="12" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    title: "Download your shows",
    description:
      "Save your favourites and keep something ready to watch whenever you want.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </svg>
    ),
  },
  {
    title: "Watch everywhere",
    description:
      "Stream unlimited movies and TV shows on your phone, tablet, laptop and TV.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <rect x="2" y="4" width="14" height="10" rx="2" />
        <rect x="16" y="8" width="6" height="12" rx="1.5" />
        <path d="M7 18h4M9 14v4" />
      </svg>
    ),
  },
  {
    title: "Profiles for everyone",
    description:
      "Create personalised spaces so everyone gets recommendations made just for them.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-3 2.5-5 6-5s6 2 6 5" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M15 15.5c.7-.3 1.5-.5 2.3-.5 2.5 0 4.7 1.5 4.7 4" />
      </svg>
    ),
  },
];

export default function Reasons() {
  return (
    <section className="relative overflow-hidden bg-[#050505] px-5 py-20 md:px-10 lg:px-14">
      <div className="mx-auto max-w-[1350px]">
        <div className="mb-10">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.28em] text-violet-400">
            Why STREAM
          </p>

          <h2
            className="text-3xl text-white md:text-4xl"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            More reasons to join
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason, index) => (
            <article
              key={reason.title}
              className="
    group
    relative
    min-h-[340px]
    overflow-hidden
    border
    border-white/[0.08]
    bg-gradient-to-br
    from-[#181127]
    via-[#100d1b]
    to-[#07070b]
    p-8
    transition
    duration-500
    hover:-translate-y-2
    hover:border-violet-500/40
  "
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 42px) 0, 100% 42px, 100% 100%, 0 100%)",
              }}
            >
              <div
                className="
                  absolute
                  -bottom-20
                  -right-16
                  h-48
                  w-48
                  rounded-full
                  bg-violet-600/20
                  blur-3xl
                  transition
                  duration-500
                  group-hover:bg-violet-500/30
                "
              />

              <span className="text-xs tracking-[0.25em] text-white/30">
                0{index + 1}
              </span>

              <div
                className="
                  mt-7
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-violet-400/20
                  bg-violet-500/10
                  text-violet-300
                  shadow-[0_0_30px_rgba(139,92,246,0.12)]
                "
              >
                {reason.icon}
              </div>

              <h3
                className="mt-7 text-2xl text-white"
                style={{ fontFamily: '"Cormorant Garamond", serif' }}
              >
                {reason.title}
              </h3>

              <p className="mt-4 max-w-[260px] text-sm leading-6 text-white/55">
                {reason.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
