export default function StreamLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#07050b]">
      {/* Background glow */}
      <div className="absolute h-[350px] w-[350px] rounded-full bg-violet-700/20 blur-[120px]" />

      {/* Logo */}
      <div className="relative flex flex-col items-center">
        <h1
          className="animate-pulse text-4xl font-bold tracking-[0.18em] text-violet-400 sm:text-5xl"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
          }}
        >
          STREAM
        </h1>

        {/* Loading line */}
        <div className="mt-6 h-[2px] w-28 overflow-hidden rounded-full bg-white/10">
          <div className="stream-loading-line h-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-400" />
        </div>

        <p className="mt-4 text-[10px] uppercase tracking-[0.35em] text-white/30">
          Your story is loading
        </p>
      </div>
    </div>
  );
}