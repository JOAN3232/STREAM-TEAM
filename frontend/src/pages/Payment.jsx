import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { selectPlan } from "../services/authService";

const planDetails = {
  basic: {
    name: "Basic",
    price: "₦2,500",
    quality: "720p",
    devices: "1 device",
  },

  standard: {
    name: "Standard",
    price: "₦4,500",
    quality: "1080p Full HD",
    devices: "2 devices",
  },

  premium: {
    name: "Premium",
    price: "₦7,000",
    quality: "4K + HDR",
    devices: "4 devices",
  },
};

export default function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";
  const planId = searchParams.get("plan") || "standard";

  const plan =
    planDetails[planId] || planDetails.standard;

  const [paymentMethod, setPaymentMethod] =
    useState("paystack");

  const [loading, setLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  /* =========================================
     NAVBAR SCROLL
  ========================================= */

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  /* =========================================
     SAVE PLAN + START PAYSTACK
  ========================================= */

  const handleContinue = async () => {
    if (loading) return;

    if (!email) {
      alert(
        "Your email address is missing. Please sign in again."
      );
      return;
    }

    try {
      setLoading(true);

      /* -----------------------------------------
         1. SAVE SELECTED PLAN TO USER ACCOUNT
      ----------------------------------------- */

      const token = localStorage.getItem("token");

      if (token) {
        await selectPlan(planId);
      }

      /* -----------------------------------------
         2. INITIALIZE PAYSTACK PAYMENT
      ----------------------------------------- */

      const response = await fetch(
        "http://localhost:8081/api/payments/initialize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            plan: planId,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText ||
            "Unable to initialize payment"
        );
      }

      const result = await response.json();

      const authorizationUrl =
        result?.data?.authorization_url;

      if (!authorizationUrl) {
        throw new Error(
          "Payment authorization URL was not returned"
        );
      }

      /* -----------------------------------------
         3. SEND USER TO PAYSTACK
      ----------------------------------------- */

      window.location.href = authorizationUrl;
    } catch (error) {
      console.error(
        "Payment initialization failed:",
        error
      );

      alert(
        "Unable to start payment. Please try again."
      );

      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#07050d] text-white">

      {/* =====================================
          AMBIENT BACKGROUND
      ====================================== */}

      <div className="pointer-events-none fixed inset-0">

        <div className="absolute left-[-120px] top-[150px] h-[420px] w-[420px] rounded-full bg-violet-700/[0.08] blur-[150px]" />

        <div className="absolute bottom-0 right-0 h-[380px] w-[380px] rounded-full bg-fuchsia-700/[0.06] blur-[130px]" />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#07050d]/40 to-[#050407]" />

      </div>

      {/* =====================================
          NAVBAR
      ====================================== */}

      <header
        className={`
          fixed
          left-0
          right-0
          top-0
          z-50
          transition-all
          duration-500
          ${
            isScrolled
              ? "border-b border-white/[0.08] bg-[#09070d]/70 shadow-[0_15px_45px_rgba(0,0,0,0.22)] backdrop-blur-2xl"
              : "border-b border-transparent bg-transparent"
          }
        `}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-10 lg:px-14">

          <Link
            to="/"
            className="text-2xl font-bold tracking-[0.15em] text-violet-400 sm:text-3xl"
            style={{
              fontFamily:
                '"Cormorant Garamond", serif',
            }}
          >
            STREAM
          </Link>

          <Link
            to="/login"
            className="text-sm font-semibold text-white/70 transition hover:text-violet-300"
          >
            Sign In
          </Link>

        </div>
      </header>

      {/* =====================================
          BACK / STEP
      ====================================== */}

      <div className="relative z-20 mx-auto max-w-7xl px-6 pt-[105px] sm:px-10 lg:px-14">

        <div className="flex items-center justify-between">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-sm text-white/50 transition hover:text-violet-300"
          >
            <span className="text-lg transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>

            <span>Back</span>
          </button>

          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-violet-400 sm:text-xs">
            Payment
          </span>

        </div>

      </div>

      {/* =====================================
          CONTENT
      ====================================== */}

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-8 sm:px-10 lg:px-14">

        <div className="text-center">

          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-violet-400">
            Membership payment
          </p>

          <h1
            className="mt-4 text-4xl font-semibold sm:text-5xl"
            style={{
              fontFamily:
                '"Cormorant Garamond", serif',
            }}
          >
            Almost ready to stream.
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/50 sm:text-base">
            Confirm your plan and choose how
            you&apos;d like to pay.
          </p>

        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">

          {/* =================================
              PAYMENT METHODS
          ================================== */}

          <div className="rounded-[28px] border border-white/[0.09] bg-white/[0.025] p-6 backdrop-blur-xl sm:p-8">

            <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">
              Payment method
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Choose how to pay
            </h2>

            <div className="mt-7 space-y-4">

              {/* CARD */}

              <button
                type="button"
                onClick={() =>
                  setPaymentMethod("card")
                }
                className={`flex w-full items-center justify-between rounded-2xl border p-5 text-left transition ${
                  paymentMethod === "card"
                    ? "border-violet-400/70 bg-violet-500/[0.09]"
                    : "border-white/[0.08] bg-black/10 hover:border-white/20"
                }`}
              >
                <div>

                  <p className="font-semibold">
                    Debit or Credit Card
                  </p>

                  <p className="mt-1 text-xs text-white/40">
                    Visa, Mastercard and Verve
                  </p>

                </div>

                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    paymentMethod === "card"
                      ? "border-violet-400"
                      : "border-white/20"
                  }`}
                >
                  {paymentMethod === "card" && (
                    <div className="h-2.5 w-2.5 rounded-full bg-violet-400" />
                  )}
                </div>

              </button>

              {/* PAYSTACK */}

              <button
                type="button"
                onClick={() =>
                  setPaymentMethod("paystack")
                }
                className={`flex w-full items-center justify-between rounded-2xl border p-5 text-left transition ${
                  paymentMethod === "paystack"
                    ? "border-violet-400/70 bg-violet-500/[0.09]"
                    : "border-white/[0.08] bg-black/10 hover:border-white/20"
                }`}
              >
                <div>

                  <p className="font-semibold">
                    Secure Checkout
                  </p>

                  <p className="mt-1 text-xs text-white/40">
                    Pay securely through Paystack
                  </p>

                </div>

                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    paymentMethod === "paystack"
                      ? "border-violet-400"
                      : "border-white/20"
                  }`}
                >
                  {paymentMethod ===
                    "paystack" && (
                    <div className="h-2.5 w-2.5 rounded-full bg-violet-400" />
                  )}
                </div>

              </button>

            </div>

            {/* SECURITY */}

            <div className="mt-7 rounded-2xl border border-white/[0.07] bg-black/15 p-4">

              <p className="text-xs leading-5 text-white/45">
                Payments are processed securely
                through Paystack. STREAM does not
                store your card details.
              </p>

            </div>

          </div>

          {/* =================================
              SUMMARY
          ================================== */}

          <div className="rounded-[28px] border border-violet-400/20 bg-gradient-to-b from-violet-500/[0.08] to-white/[0.025] p-6 backdrop-blur-xl sm:p-8">

            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-300">
              Your membership
            </p>

            <div className="mt-6 flex items-start justify-between gap-4">

              <div>

                <h2 className="text-2xl font-bold">
                  {plan.name}
                </h2>

                <p className="mt-1 text-sm text-white/40">
                  Monthly membership
                </p>

              </div>

              <div className="text-right">

                <p className="text-2xl font-bold">
                  {plan.price}
                </p>

                <p className="mt-1 text-xs text-white/35">
                  / month
                </p>

              </div>

            </div>

            <div className="my-7 h-px bg-white/[0.09]" />

            <div className="space-y-4 text-sm">

              <div className="flex justify-between gap-4">
                <span className="text-white/40">
                  Video quality
                </span>

                <span className="font-medium text-white/80">
                  {plan.quality}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-white/40">
                  Devices
                </span>

                <span className="font-medium text-white/80">
                  {plan.devices}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-white/40">
                  Billing
                </span>

                <span className="font-medium text-white/80">
                  Monthly
                </span>
              </div>

            </div>

            <div className="my-7 h-px bg-white/[0.09]" />

            <div className="flex items-center justify-between">

              <span className="font-semibold">
                Total today
              </span>

              <span className="text-xl font-bold text-violet-300">
                {plan.price}
              </span>

            </div>

            {/* CTA */}

            <button
              type="button"
              onClick={handleContinue}
              disabled={loading}
              className="
                group
                mt-7
                flex
                h-14
                w-full
                items-center
                justify-center
                rounded-xl

                bg-gradient-to-r
                from-[#7b00ff]
                via-[#a400ff]
                to-[#d000d7]

                text-sm
                font-semibold
                text-white

                shadow-[0_15px_45px_rgba(126,34,206,0.28)]

                transition
                duration-300

                hover:scale-[1.01]
                hover:shadow-[0_18px_60px_rgba(168,85,247,0.35)]

                disabled:cursor-wait
                disabled:opacity-60
                disabled:hover:scale-100
              "
            >
              {loading ? (
                <span className="flex items-center gap-3">

                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                  Redirecting to Paystack...

                </span>
              ) : (
                <>
                  Continue Securely

                  <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </>
              )}
            </button>

            <p className="mt-4 text-center text-[10px] leading-5 text-white/30">
              Your selected plan will be linked to
              your STREAM account before checkout.
            </p>

          </div>

        </div>

      </section>

      {/* BOTTOM ACCENT */}

      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-20 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent shadow-[0_-8px_30px_rgba(168,85,247,0.45)]" />

    </main>
  );
}