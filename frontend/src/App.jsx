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
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/register-intro"
          element={<RegisterIntro />}
        />

        <Route
          path="/verify-email"
          element={<VerifyEmail />}
        />

        <Route
          path="/plans"
          element={<Plans />}
        />

        <Route 
        path="/set-password" 
        element={<SetPassword />} 
        />

        <Route
          path="/payment"
          element={<Payment />}
        />
      </Routes>
    </div>
  );
}