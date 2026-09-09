import { Routes, Route, useLocation } from "react-router-dom";

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
import SetPassword from "./pages/SetPassword";
import Payment from "./pages/Payment";
import PaymentCallback from "./pages/PaymentCallback";
import WhosWatching from "./pages/WhosWatching";
import TVShows from "./pages/TVShows";
import NewPopular from "./pages/New-Poplular";
import MyList from "./pages/MyList";
import Settings from "./pages/Settings";

import Browse from "./pages/Browse";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import Player from "./pages/Player";

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
    <div key={location.pathname} className="page-transition">
      <Routes location={location}>
        {/* PUBLIC */}

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register-intro" element={<RegisterIntro />} />

        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route path="/set-password" element={<SetPassword />} />

        <Route path="/plans" element={<Plans />} />

        <Route path="/payment" element={<Payment />} />

        <Route path="/payment/callback" element={<PaymentCallback />} />

        {/* STREAM APP */}

        <Route path="/whos-watching" element={<WhosWatching />} />

        <Route path="/browse" element={<Browse />} />

        <Route path="/movies" element={<Movies />} />

        {/* DETAILS */}

        <Route path="/title/:id" element={<MovieDetails />} />

        <Route path="/title/:mediaType/:id" element={<MovieDetails />} />

        {/* PLAYER */}

        <Route path="/watch/movie/:id" element={<Player />} />

        <Route path="/watch/:mediaType/:id" element={<Player />} />

        <Route path="/tv-shows" element={<TVShows />} />

        <Route path="/new-popular" element={<NewPopular />} />

        <Route path="/my-list" element={<MyList />} />

        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  );
}
