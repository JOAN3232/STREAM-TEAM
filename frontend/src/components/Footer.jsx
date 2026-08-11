const footerLinks = [
  "FAQ",
  "Help Centre",
  "Account",
  "Media Centre",
  "Investor Relations",
  "Jobs",
  "Ways to Watch",
  "Terms of Use",
  "Privacy",
  "Cookie Preferences",
  "Contact Us",
  "Speed Test",
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#050505] px-5 pb-10 pt-10 md:px-10 lg:px-14">

      {/* FINAL CTA */}
      <div className="relative mx-auto mb-20 max-w-[1100px] overflow-hidden rounded-[32px] border border-violet-500/20 bg-gradient-to-br from-[#1b102d] via-[#100c19] to-[#07070a] px-6 py-14 text-center md:px-12 md:py-16">

        {/* GLOW */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[350px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[120px]" />

        <div className="relative z-10">

          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-violet-400">
            Start watching
          </p>

          <h2
            className="mx-auto max-w-2xl text-4xl leading-tight text-white md:text-5xl"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
            }}
          >
            Ready for your next story?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/55 md:text-base">
            Enter your email to create your STREAM account and start exploring.
          </p>

          {/* EMAIL */}
          <div className="mx-auto mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Email address"
              className="
                h-14
                w-full
                rounded-lg
                border
                border-white/20
                bg-black/30
                px-5
                text-white
                outline-none
                backdrop-blur-md
                placeholder:text-white/40
                focus:border-violet-400
                focus:ring-2
                focus:ring-violet-500/20
                sm:flex-1
              "
            />

            <button
              type="button"
              className="
                h-14
                w-full
                rounded-lg
                bg-gradient-to-r
                from-violet-700
                to-violet-500
                px-7
                font-semibold
                text-white
                transition
                duration-300
                hover:scale-[1.02]
                hover:from-violet-600
                hover:to-violet-400
                sm:w-auto
              "
            >
              Get Started
              <span className="ml-2">→</span>
            </button>
          </div>

        </div>
      </div>

      {/* FOOTER CONTENT */}
      <div className="mx-auto max-w-[1100px] border-t border-white/[0.08] pt-12">

        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <h3
              className="text-3xl font-bold text-violet-400"
              style={{
                fontFamily: '"Cormorant Garamond", serif',
              }}
            >
              STREAM
            </h3>

            <p className="mt-2 text-sm text-white/40">
              Stories worth streaming.
            </p>
          </div>

          <p className="text-sm text-white/50">
            Questions? Contact us.
          </p>

        </div>

        {/* LINKS */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 md:grid-cols-4">
          {footerLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm text-white/45 underline-offset-4 transition hover:text-violet-300 hover:underline"
            >
              {link}
            </a>
          ))}
        </div>

        {/* BOTTOM */}
        <div className="mt-14 flex flex-col gap-3 border-t border-white/[0.06] pt-7 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between">

          <p>
            © {new Date().getFullYear()} STREAM
          </p>

          <p>
            Built for entertainment.
          </p>

        </div>

      </div>
    </footer>
  );
}