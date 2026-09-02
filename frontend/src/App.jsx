import {
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Trending from "./components/Trending";
import Reasons from "./components/Reasons";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";

import Login from "./pages/Login";
import RegisterIntro from "./pages/RegisterIntro";
import VerifyEmail from "./pages/VerifyEmail";
import Plans from "./pages/Plans";
import Payment from "./pages/Payment";

import WhosWatching from "./pages/WhosWatching";
import Browse from "./pages/Browse";
import MovieDetails from "./pages/MovieDetails";
import Player from "./pages/Player";

import MyList from "./pages/MyList";
import Account from "./pages/Account";

function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <Trending />
        <Reasons />
        <FAQ />
        <Footer />
      </main>
    </>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className="page-transition"
    >
      <Routes location={location}>

        {/* =================================================
            LANDING
        ================================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* =================================================
            AUTH
        ================================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register-intro"
          element={<RegisterIntro />}
        />

        <Route
          path="/verify-email"
          element={<VerifyEmail />}
        />

        {/* =================================================
            PLANS / PAYMENT
        ================================================= */}

        <Route
          path="/plans"
          element={<Plans />}
        />

        <Route
          path="/payment"
          element={<Payment />}
        />

        {/* =================================================
            PROFILES
        ================================================= */}

        <Route
          path="/whos-watching"
          element={<WhosWatching />}
        />

        {/* =================================================
            BROWSE
        ================================================= */}

        <Route
          path="/browse"
          element={<Browse />}
        />

        {/* =================================================
            USER
        ================================================= */}

        <Route
          path="/my-list"
          element={<MyList />}
        />

        <Route
          path="/account"
          element={<Account />}
        />

        {/* =================================================
            TITLE DETAILS

            Old movie URL still works:
            /title/550

            New universal URLs:
            /title/movie/550
            /title/tv/1399
        ================================================= */}

        <Route
          path="/title/:id"
          element={<MovieDetails />}
        />

        <Route
          path="/title/:mediaType/:id"
          element={<MovieDetails />}
        />

        {/* =================================================
            MOVIE WATCH
        ================================================= */}

        <Route
          path="/watch/movie/:id"
          element={<Player />}
        />

        {/* =================================================
            TV EPISODE WATCH

            Example:

            /watch/tv/1399/1/1

            = TV ID 1399
            = Season 1
            = Episode 1
        ================================================= */}

        <Route
          path="/watch/tv/:id/:seasonNumber/:episodeNumber"
          element={<Player />}
        />

        {/* =================================================
            GENERIC WATCH FALLBACK

            Keeps existing links such as:

            /watch/tv/1399
        ================================================= */}

        <Route
          path="/watch/:mediaType/:id"
          element={<Player />}
        />

      </Routes>
    </div>
  );
}
