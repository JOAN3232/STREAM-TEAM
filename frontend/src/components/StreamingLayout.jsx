import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const UI_FONT = {
  fontFamily: '"Manrope", "Inter", "Helvetica Neue", Arial, sans-serif',
};

const DISPLAY_FONT = {
  fontFamily: '"Cormorant Garamond", "Georgia", serif',
};

function Icon({ name, className = "h-5 w-5" }) {
  const icons = {
    home: (
      <>
        <path d="M3 11 12 3l9 8" />
        <path d="M5 10v11h14V10" />
      </>
    ),

    movie: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M8 4v16M16 4v16M3 9h5M16 9h5M3 15h5M16 15h5" />
      </>
    ),

    tv: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="m8 3 4 3 4-3" />
      </>
    ),

    spark: (
      <path d="m12 3 1.8 4.5L18 9.3l-4.2 1.9L12 16l-1.8-4.8L6 9.3l4.2-1.8L12 3Z" />
    ),

    list: (
      <>
        <path d="M8 6h13M8 12h13M8 18h13" />
        <path d="M3 6h.01M3 12h.01M3 18h.01" />
      </>
    ),

    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.1h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1Z" />
      </>
    ),

    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),

    more: (
      <>
        <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
      </>
    ),

    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),

    logout: (
      <>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M21 3v18h-7" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`group relative flex w-full flex-col items-center justify-center gap-1.5 py-3.5 transition ${
        active ? "text-violet-300" : "text-white/30 hover:text-white"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-2 h-[calc(100%-16px)] w-[2px] rounded-r-full bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.7)]" />
      )}

      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
          active
            ? "bg-violet-500/[0.10]"
            : "group-hover:bg-white/[0.05]"
        }`}
      >
        <Icon name={icon} className="h-[18px] w-[18px]" />
      </span>

      <span className="text-[8px] font-medium">{label}</span>
    </button>
  );
}

function MobileNavItem({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 transition ${
        active ? "text-violet-300" : "text-white/40"
      }`}
    >
      <Icon name={icon} className="h-[19px] w-[19px]" />

      <span className="max-w-full truncate text-[9px] font-medium">
        {label}
      </span>

      {active && (
        <span className="absolute bottom-1 h-[2px] w-5 rounded-full bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.8)]" />
      )}
    </button>
  );
}

function MobileMenuItem({
  icon,
  title,
  subtitle,
  onClick,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left transition ${
        danger
          ? "text-red-300 hover:bg-red-400/[0.07]"
          : "text-white/75 hover:bg-white/[0.05] hover:text-white"
      }`}
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
          danger
            ? "bg-red-400/[0.08]"
            : "bg-violet-400/[0.08]"
        }`}
      >
        <Icon name={icon} className="h-[18px] w-[18px]" />
      </span>

      <span className="min-w-0">
        <span className="block text-[13px] font-semibold">
          {title}
        </span>

        {subtitle && (
          <span className="mt-0.5 block text-[9px] text-white/30">
            {subtitle}
          </span>
        )}
      </span>
    </button>
  );
}

export default function StreamingLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  let storedProfile = null;

  try {
    storedProfile = JSON.parse(
      sessionStorage.getItem("stream_active_profile")
    );
  } catch {
    storedProfile = null;
  }

  const activeName = storedProfile?.name || "Profile";

  const pathname = location.pathname;

  const isHome = pathname === "/browse";
  const isMovies = pathname === "/movies";
  const isTV = pathname === "/tv-shows";
  const isNew = pathname === "/new-popular";
  const isMyList = pathname === "/my-list";
  const isSettings = pathname === "/settings";

  const isMoreActive =
    isNew || isSettings || mobileMenuOpen;

  const goMyList = () => {
    setMobileMenuOpen(false);
    navigate("/my-list");
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    sessionStorage.removeItem("stream_active_profile");

    setMobileMenuOpen(false);
    setProfileOpen(false);

    navigate("/login");
  };

  const navigateMobile = (route) => {
    setMobileMenuOpen(false);
    setNoticeOpen(false);
    setProfileOpen(false);
    navigate(route);
  };

  return (
    <main
      className="min-h-screen bg-[#050507] text-white"
      style={UI_FONT}
      onClick={() => {
        setNoticeOpen(false);
        setProfileOpen(false);
      }}
    >
      {/* =====================================
          DESKTOP SIDEBAR
      ====================================== */}

      <aside className="fixed inset-y-0 left-0 z-[70] hidden w-[72px] flex-col border-r border-white/[0.045] bg-[#07070a]/90 backdrop-blur-xl lg:flex">
        <button
          type="button"
          onClick={() => navigate("/browse")}
          className="flex h-[78px] items-center justify-center border-b border-white/[0.045]"
        >
          <span
            className="text-[20px] font-semibold text-violet-400"
            style={DISPLAY_FONT}
          >
            S
          </span>
        </button>

        <div className="mt-5 flex-1">
          <SidebarItem
            icon="home"
            label="Home"
            active={isHome}
            onClick={() => navigate("/browse")}
          />

          <SidebarItem
            icon="tv"
            label="TV"
            active={isTV}
            onClick={() => navigate("/tv-shows")}
          />

          <SidebarItem
            icon="movie"
            label="Movies"
            active={isMovies}
            onClick={() => navigate("/movies")}
          />

          <SidebarItem
            icon="spark"
            label="New"
            active={isNew}
            onClick={() => navigate("/new-popular")}
          />

          <SidebarItem
            icon="list"
            label="My List"
            active={isMyList}
            onClick={goMyList}
          />

          <SidebarItem
            icon="settings"
            label="Settings"
            active={isSettings}
            onClick={() => navigate("/settings")}
          />
        </div>
      </aside>

      {/* =====================================
          TOP NAVBAR
      ====================================== */}

      <header className="fixed left-0 right-0 top-0 z-[60] border-b border-violet-300/[0.07] bg-[#110a1d]/78 shadow-[0_14px_45px_rgba(0,0,0,0.22)] backdrop-blur-2xl lg:left-[72px]">
        <div className="flex h-[64px] items-center px-4 sm:h-[68px] sm:px-7 lg:px-12 xl:px-14">
          <button
            type="button"
            onClick={() => navigate("/browse")}
            className="shrink-0 text-[20px] font-semibold tracking-[0.14em] text-violet-400 transition hover:text-violet-300 sm:text-[25px] sm:tracking-[0.16em]"
            style={DISPLAY_FONT}
          >
            STREAM
          </button>

          {/* DESKTOP LINKS */}

          <nav className="ml-12 hidden items-center gap-7 md:flex lg:ml-[72px] lg:gap-10 xl:ml-20">
            {[
              ["Home", "/browse"],
              ["TV Shows", "/tv-shows"],
              ["Movies", "/movies"],
              ["New & Popular", "/new-popular"],
            ].map(([label, route]) => {
              const active = pathname === route;

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => navigate(route)}
                  className={`group relative whitespace-nowrap py-2 text-[12px] font-medium transition-colors duration-300 lg:text-[14px] ${
                    active
                      ? "text-white"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  {label}

                  <span
                    className={`absolute -bottom-1 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300 ${
                      active
                        ? "w-6 opacity-100"
                        : "w-0 opacity-0 group-hover:w-5 group-hover:opacity-100"
                    }`}
                  />
                </button>
              );
            })}

            <button
              type="button"
              onClick={goMyList}
              className={`group relative whitespace-nowrap py-2 text-[12px] font-medium transition-colors duration-300 lg:text-[14px] ${
                isMyList
                  ? "text-white"
                  : "text-white/50 hover:text-white"
              }`}
            >
              My List
            </button>
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2.5">

            {/* NOTIFICATION */}

            <div className="relative">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();

                  setNoticeOpen((current) => !current);
                  setProfileOpen(false);
                  setMobileMenuOpen(false);
                }}
                className="relative grid h-9 w-9 place-items-center rounded-full text-white/65 transition hover:bg-white/[0.05] hover:text-white sm:h-10 sm:w-10"
              >
                <Icon
                  name="bell"
                  className="h-[18px] w-[18px]"
                />

                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-fuchsia-400 sm:right-2 sm:top-2" />
              </button>

              {noticeOpen && (
                <div
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                  className="absolute right-0 top-11 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-violet-300/[0.1] bg-[#100a18]/95 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:top-12 sm:w-72"
                >
                  <p className="text-sm font-semibold">
                    New arrivals
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-white/40">
                    Fresh titles have been added to STREAM.
                  </p>
                </div>
              )}
            </div>

            {/* PROFILE */}

            <div className="relative">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();

                  setProfileOpen(
                    (current) => !current
                  );

                  setNoticeOpen(false);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 rounded-full p-1 transition hover:bg-white/[0.05] sm:pr-2.5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-[10px] font-semibold">
                  {activeName
                    ?.charAt(0)
                    ?.toUpperCase()}
                </div>

                <span className="hidden max-w-[80px] truncate text-[11px] font-medium text-white/70 xl:block">
                  {activeName}
                </span>

                <span
                  className={`hidden text-[7px] text-white/35 transition-transform sm:block ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {profileOpen && (
                <div
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                  className="absolute right-0 top-11 w-52 overflow-hidden rounded-2xl border border-violet-300/[0.1] bg-[#100a18]/95 py-2 text-xs shadow-[0_25px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:top-12"
                >
                  <div className="border-b border-white/[0.07] px-4 py-3">
                    <p className="font-semibold">
                      {activeName}
                    </p>

                    <p className="mt-0.5 text-[9px] text-white/30">
                      Active profile
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/whos-watching")
                    }
                    className="block w-full px-4 py-2.5 text-left text-white/60 hover:bg-violet-400/[0.08] hover:text-white"
                  >
                    Switch Profile
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/settings")
                    }
                    className="block w-full px-4 py-2.5 text-left text-white/60 hover:bg-violet-400/[0.08] hover:text-white"
                  >
                    Account & Settings
                  </button>

                  <div className="my-1 border-t border-white/[0.07]" />

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="block w-full px-4 py-2.5 text-left text-red-300/70 hover:bg-red-400/[0.06] hover:text-red-300"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* =====================================
          PAGE CONTENT
      ====================================== */}

      <div className="pb-[82px] lg:ml-[72px] lg:pb-0">
        {children}
      </div>

      {/* =====================================
          MOBILE MORE OVERLAY
      ====================================== */}

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[85] bg-black/55 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            className="absolute bottom-[72px] left-3 right-3 overflow-hidden rounded-[24px] border border-violet-300/[0.10] bg-[#100a18]/98 p-3 shadow-[0_-20px_80px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
          >
            {/* MENU HEADER */}

            <div className="flex items-center justify-between border-b border-white/[0.06] px-3 pb-3 pt-1">
              <div>
                <p
                  className="text-lg font-semibold text-violet-300"
                  style={DISPLAY_FONT}
                >
                  STREAM
                </p>

                <p className="mt-0.5 text-[9px] text-white/30">
                  More
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.05] text-sm text-white/50"
              >
                ✕
              </button>
            </div>

            <div className="mt-2">
              <MobileMenuItem
                icon="spark"
                title="New & Popular"
                subtitle="Discover what's trending"
                onClick={() =>
                  navigateMobile("/new-popular")
                }
              />

              <MobileMenuItem
                icon="settings"
                title="Settings"
                subtitle="Manage your STREAM account"
                onClick={() =>
                  navigateMobile("/settings")
                }
              />

              <MobileMenuItem
                icon="user"
                title="Switch Profile"
                subtitle={`Currently watching as ${activeName}`}
                onClick={() =>
                  navigateMobile("/whos-watching")
                }
              />

              <div className="my-2 h-px bg-white/[0.06]" />

              <MobileMenuItem
                icon="logout"
                title="Sign Out"
                subtitle="Sign out of your STREAM account"
                danger
                onClick={handleSignOut}
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================
          MOBILE BOTTOM NAVIGATION
      ====================================== */}

      <nav className="fixed bottom-0 left-0 right-0 z-[90] flex h-[70px] items-stretch border-t border-violet-300/[0.08] bg-[#09070d]/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:hidden">

        <MobileNavItem
          icon="home"
          label="Home"
          active={isHome}
          onClick={() =>
            navigateMobile("/browse")
          }
        />

        <MobileNavItem
          icon="tv"
          label="TV"
          active={isTV}
          onClick={() =>
            navigateMobile("/tv-shows")
          }
        />

        <MobileNavItem
          icon="movie"
          label="Movies"
          active={isMovies}
          onClick={() =>
            navigateMobile("/movies")
          }
        />

        <MobileNavItem
          icon="list"
          label="My List"
          active={isMyList}
          onClick={goMyList}
        />

        <MobileNavItem
          icon="more"
          label="More"
          active={isMoreActive}
          onClick={() => {
            setNoticeOpen(false);
            setProfileOpen(false);

            setMobileMenuOpen(
              (current) => !current
            );
          }}
        />
      </nav>
    </main>
  );
}