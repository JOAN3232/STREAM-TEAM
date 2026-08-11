import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="absolute left-0 top-0 z-50 w-full">
      <nav
        className="
          mx-auto
          flex
          max-w-[1350px]
          items-center
          justify-between
          px-5
          py-6
          sm:px-7
          md:px-10
          lg:px-14
        "
      >
        {/* STREAM LOGO */}
        <Link
          to="/"
          className="
            text-2xl
            font-bold
            tracking-[0.08em]
            text-violet-400
            sm:text-3xl
          "
          style={{
            fontFamily: '"Cormorant Garamond", serif',
          }}
        >
          STREAM
        </Link>

        {/* SIGN IN */}
        <Link
          to="/login"
          className="
            rounded-lg
            bg-gradient-to-r
            from-violet-700
            to-violet-500
            px-5
            py-2.5
            text-sm
            font-semibold
            text-white
            shadow-lg
            shadow-violet-950/20
            transition
            duration-300
            hover:from-violet-600
            hover:to-violet-400
          "
        >
          Sign In
        </Link>
      </nav>
    </header>
  );
}