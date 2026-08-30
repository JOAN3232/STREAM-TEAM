import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: "₦2,500",
    quality: "720p",
    devices: "1 device",
    downloads: "1 device",
    description: "Simple streaming for one.",
  },
  {
    id: "standard",
    name: "Standard",
    price: "₦4,500",
    quality: "1080p Full HD",
    devices: "2 devices",
    downloads: "2 devices",
    description: "The sweet spot for everyday streaming.",
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "₦7,000",
    quality: "4K + HDR",
    devices: "4 devices",
    downloads: "6 devices",
    description: "The complete STREAM experience.",
  },
];

export default function Plans() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";

  const [selectedPlan, setSelectedPlan] =
    useState("standard");

  const [isScrolled, setIsScrolled] =
    useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  const selected =
    plans.find(
      (plan) => plan.id === selectedPlan
    ) || plans[1];

  const handleContinue = () => {
    navigate(
      `/payment?email=${encodeURIComponent(
        email
      )}&plan=${selectedPlan}`
    );
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#07050d] text-white">
      {/* ==============================
          BACKGROUND
      ============================== */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[32%] h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-violet-700/[0.12] blur-[160px]" />

        <div className="absolute -left-32 bottom-0 h-[340px] w-[340px] rounded-full bg-fuchsia-700/[0.06] blur-[130px]" />

        <div className="absolute -right-32 top-32 h-[360px] w-[360px] rounded-full bg-indigo-700/[0.05] blur-[130px]" />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#07050d]/40 to-[#050407]" />
      </div>

      {/* ==============================
          FIXED NAVBAR
      ============================== */}
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

      {/* ==============================
          BACK + STEP
      ============================== */}
      <div className="relative z-20 mx-auto max-w-7xl px-6 pt-[105px] sm:px-10 lg:px-14">
        <div className="flex items-center justify-between">
          {/* BACK */}
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

          {/* STEP */}
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-violet-400 sm:text-xs">
            Step 2 of 3
          </span>
        </div>
      </div>

      {/* ==============================
          CONTENT
      ============================== */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-8 sm:px-10 lg:px-14">
        {/* HEADING */}
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-violet-400">
            Choose your plan
          </p>

          <h1
            className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl"
            style={{
              fontFamily:
                '"Cormorant Garamond", serif',
            }}
          >
            Pick what works for you.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/55 sm:text-base">
            Choose a plan now and change it
            whenever you want.
          </p>

          {/* BENEFITS */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/45 sm:text-sm">
            <span>✓ No commitments</span>
            <span>✓ Cancel anytime</span>
            <span>✓ Change plans anytime</span>
          </div>
        </div>

        {/* ==============================
            PLAN CARDS
        ============================== */}
        <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
          {plans.map((plan) => {
            const active =
              selectedPlan === plan.id;

            return (
              <button
                key={plan.id}
                type="button"
                onClick={() =>
                  setSelectedPlan(plan.id)
                }
                className={`
                  group
                  relative
                  overflow-hidden
                  rounded-[26px]
                  border
                  p-6
                  text-left
                  transition
                  duration-300
                  ${
                    active
                      ? "border-violet-400/80 bg-violet-500/[0.1] shadow-[0_0_55px_rgba(139,92,246,0.17)] md:-translate-y-2"
                      : "border-white/[0.09] bg-white/[0.025] hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.04]"
                  }
                `}
              >
                {/* ACTIVE GLOW */}
                {active && (
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/[0.08] via-transparent to-fuchsia-500/[0.05]" />
                )}

                {/* MOST POPULAR */}
                {plan.popular ? (
                  <div className="mb-5 inline-flex rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-300">
                    Most Popular
                  </div>
                ) : (
                  <div className="mb-5 h-[23px]" />
                )}

                {/* SELECTED CHECK */}
                <div
                  className={`
                    absolute
                    right-5
                    top-5
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    border
                    text-xs
                    transition
                    ${
                      active
                        ? "border-violet-400 bg-violet-500 text-white"
                        : "border-white/15 bg-white/[0.03] text-transparent"
                    }
                  `}
                >
                  ✓
                </div>

                {/* PLAN NAME */}
                <p className="relative text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
                  {plan.name}
                </p>

                {/* PRICE */}
                <div className="relative mt-4">
                  <span className="text-3xl font-bold">
                    {plan.price}
                  </span>

                  <span className="ml-2 text-xs text-white/35">
                    / month
                  </span>
                </div>

                {/* DESCRIPTION */}
                <p className="relative mt-3 min-h-[40px] text-sm leading-5 text-white/45">
                  {plan.description}
                </p>

                <div className="relative my-6 h-px bg-white/[0.08]" />

                {/* DETAILS */}
                <div className="relative space-y-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-white/40">
                      Video quality
                    </span>

                    <span className="font-semibold text-white/85">
                      {plan.quality}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-white/40">
                      Watch on
                    </span>

                    <span className="font-semibold text-white/85">
                      {plan.devices}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-white/40">
                      Downloads
                    </span>

                    <span className="font-semibold text-white/85">
                      {plan.downloads}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ==============================
            SELECTED PLAN
        ============================== */}
        <div className="mx-auto mt-8 max-w-3xl rounded-[22px] border border-white/[0.08] bg-white/[0.025] px-5 py-4 backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                Selected plan
              </p>

              <p className="mt-1 text-sm font-semibold text-white/85">
                {selected.name} ·{" "}
                {selected.price}/month
              </p>
            </div>

            <p className="text-xs text-white/40">
              {selected.quality} ·{" "}
              {selected.devices}
            </p>
          </div>
        </div>

        {/* ==============================
            CONTINUE
        ============================== */}
        <div className="mx-auto mt-6 max-w-xl">
          <button
            type="button"
            onClick={handleContinue}
            className="flex h-14 w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-700 via-purple-600 to-fuchsia-600 font-semibold text-white shadow-[0_12px_45px_rgba(126,34,206,0.28)] transition duration-300 hover:scale-[1.01]"
          >
            Continue with {selected.name}

            <span className="ml-2">
              →
            </span>
          </button>

          <p className="mt-4 text-center text-xs text-white/30">
            UI demo only — no payment will be
            charged.
          </p>
        </div>
      </section>

      {/* BOTTOM GLOW */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-20 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent shadow-[0_-8px_35px_rgba(168,85,247,0.55)]" />
    </main>
  );
}