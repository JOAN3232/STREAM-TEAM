import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getBackdropUrl, getBrowseContent, getPosterUrl } from "../services/movieService";

const EMPTY_CONTENT = { trending: [], popular: [], topRated: [], movies: [], tv: [], action: [], comedy: [], drama: [] };
const ROW_LABELS = { trending: "Trending Now", popular: "Popular on STREAM", topRated: "Top Rated", movies: "Movies", tv: "TV Shows", action: "Action", comedy: "Comedy", drama: "Drama" };
const titleOf = (item) => item?.title || item?.name || "Untitled";
const typeOf = (item) => item?.media_type === "tv" ? "tv" : "movie";
const yearOf = (item) => (item?.release_date || item?.first_air_date || "").slice(0, 4);

function Icon({ name }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">{paths[name]}</svg>;
}

function LoadingScreen() {
  return <main className="min-h-screen bg-[#090909] text-white"><div className="h-[72vh] animate-pulse bg-gradient-to-br from-[#262626] to-[#111]"/><div className="-mt-20 space-y-9 px-4 md:px-12">{[1,2,3].map((row) => <div key={row}><div className="mb-3 h-5 w-44 rounded bg-white/10"/><div className="flex gap-2 overflow-hidden">{[1,2,3,4,5,6].map((card) => <div key={card} className="aspect-video w-[240px] shrink-0 rounded bg-white/[.07]"/>)}</div></div>)}</div></main>;
}

function ContentRow({ label, items, navigate }) {
  const rail = useRef(null);
  const scroll = (direction) => rail.current?.scrollBy({ left: rail.current.clientWidth * .85 * direction, behavior: "smooth" });
  if (!items.length) return null;
  return <section id={`row-${label.toLowerCase().replaceAll(" ", "-")}`} className="group/row relative mb-8 scroll-mt-24">
    <h2 className="mb-2 px-4 text-base font-semibold md:px-12 md:text-xl">{label}</h2>
    <div className="relative">
      <button type="button" aria-label={`Scroll ${label} left`} onClick={() => scroll(-1)} className="absolute inset-y-0 left-0 z-30 hidden w-11 items-center justify-center bg-black/65 text-4xl opacity-0 transition group-hover/row:opacity-100 md:flex">‹</button>
      <div ref={rail} className="flex snap-x gap-1.5 overflow-x-auto px-4 pb-7 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:px-12">
        {items.slice(0, 18).map((item) => <article key={`${typeOf(item)}-${item.id}`} className="group/card w-[47%] shrink-0 snap-start sm:w-[32%] md:w-[23%] lg:w-[19%] xl:w-[16%]">
          <button type="button" onClick={() => navigate(`/title/${typeOf(item)}/${item.id}`)} className="relative block w-full overflow-hidden rounded-[3px] bg-[#202020] text-left shadow-md transition duration-300 hover:z-20 hover:scale-[1.045] hover:shadow-2xl">
            <div className="aspect-video"><img src={item.backdrop_path ? getBackdropUrl(item.backdrop_path) : getPosterUrl(item.poster_path)} alt={titleOf(item)} loading="lazy" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} className="h-full w-full object-cover"/></div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-2 pb-2 pt-8 opacity-0 transition group-hover/card:opacity-100"><p className="truncate text-xs font-semibold">{titleOf(item)}</p><div className="mt-1 flex items-center gap-2 text-[9px] text-white/70"><span className="font-bold text-[#e50914]">{Math.round((item.vote_average || 0) * 10)}% Match</span><span>{yearOf(item)}</span><span className="border border-white/45 px-1">HD</span></div></div>
          </button>
        </article>)}
      </div>
      <button type="button" aria-label={`Scroll ${label} right`} onClick={() => scroll(1)} className="absolute inset-y-0 right-0 z-30 hidden w-11 items-center justify-center bg-black/65 text-4xl opacity-0 transition group-hover/row:opacity-100 md:flex">›</button>
    </div>
  </section>;
}

export default function Browse() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const activeProfile = JSON.parse(localStorage.getItem("activeProfile") || "null");
  const profileName = params.get("profile") || activeProfile?.name || "Joan";
  const profileAvatar = activeProfile?.avatarImage || "https://cdn.whitescreen.dev/spider-man-pfp-spider-man-avatar-built-for-strong-identity-and-recognition-agoz-square_hd-0226_800.webp";
  const [content, setContent] = useState(EMPTY_CONTENT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 24); window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll); }, []);
  useEffect(() => { getBrowseContent().then((data) => { setContent(data); if (!Object.values(data).some((items) => items.length)) setError("STREAM could not load titles right now."); }).catch(() => setError("STREAM could not load titles right now.")).finally(() => setLoading(false)); }, []);

  const allTitles = useMemo(() => { const seen = new Set(); return Object.values(content).flat().filter((item) => { const key = `${typeOf(item)}-${item.id}`; if (seen.has(key)) return false; seen.add(key); return true; }); }, [content]);
  const results = query.trim() ? allTitles.filter((item) => titleOf(item).toLowerCase().includes(query.toLowerCase())).slice(0, 12) : [];
  const hero = content.trending.find((item) => item.backdrop_path && typeOf(item) === "movie") || content.popular[0];
  const goToRow = (key) => { document.getElementById(`row-${ROW_LABELS[key].toLowerCase().replaceAll(" ", "-")}`)?.scrollIntoView({ behavior: "smooth" }); };

  if (loading) return <LoadingScreen/>;
  return <main className="min-h-screen overflow-x-hidden bg-[#090909] text-white" onClick={() => { if (noticeOpen) setNoticeOpen(false); if (profileOpen) setProfileOpen(false); }}>
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${scrolled ? "bg-[#090909] shadow-lg" : "bg-gradient-to-b from-black/90 via-black/50 to-transparent"}`}>
      <div className="flex h-16 items-center px-4 md:px-12">
        <button type="button" onClick={() => navigate(`/browse?profile=${encodeURIComponent(profileName)}`)} className="mr-7 text-xl font-black tracking-[.12em] text-[#e50914] md:text-2xl">STREAM</button>
        <nav className="hidden items-center gap-5 lg:flex">{[["Home",null],["TV Shows","tv"],["Movies","movies"],["New & Popular","popular"],["My List","route-my-list"],["Account","route-account"]].map(([label,key]) => <button key={label} type="button" onClick={() => key === "route-my-list" ? navigate("/my-list") : key === "route-account" ? navigate("/account") : key ? goToRow(key) : window.scrollTo({top:0,behavior:"smooth"})} className={`text-[13px] transition hover:text-white/65 ${label === "Home" ? "font-semibold" : "text-white/85"}`}>{label}</button>)}</nav>
        <div className="ml-auto flex items-center gap-3 md:gap-4">
          <div className={`flex items-center overflow-hidden border-white bg-black/75 transition-all ${searchOpen ? "w-44 border px-2 md:w-64" : "w-8 border-0"}`}><button type="button" aria-label="Search" onClick={(event) => { event.stopPropagation(); setSearchOpen((value) => !value); }} className="grid h-9 w-8 shrink-0 place-items-center"><Icon name="search"/></button>{searchOpen && <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Titles" className="w-full bg-transparent px-1 text-sm outline-none placeholder:text-white/50"/>}</div>
          <div className="relative"><button type="button" aria-label="Notifications" onClick={(event) => { event.stopPropagation(); setNoticeOpen((value) => !value); setProfileOpen(false); }} className="relative grid h-9 w-9 place-items-center"><Icon name="bell"/><span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#e50914]"/></button>{noticeOpen && <div onClick={(event) => event.stopPropagation()} className="absolute right-0 top-12 w-72 border-t-2 border-white bg-[#111]/95 shadow-2xl"><div className="border-b border-white/10 p-4"><p className="text-sm font-semibold">New arrivals</p><p className="mt-1 text-xs text-white/55">Fresh titles have been added to STREAM.</p></div><div className="p-4"><p className="text-sm font-semibold">Your weekly picks are ready</p><p className="mt-1 text-xs text-white/55">Explore recommendations selected for {profileName}.</p></div></div>}</div>
          <div className="relative"><button type="button" onClick={(event) => { event.stopPropagation(); setProfileOpen((value) => !value); setNoticeOpen(false); }} className="flex items-center gap-2"><img src={profileAvatar} alt={profileName} className="h-8 w-8 rounded object-cover"/><span className="hidden text-xs md:block">{profileName}</span><span className="text-[9px]">▼</span></button>{profileOpen && <div onClick={(event) => event.stopPropagation()} className="absolute right-0 top-12 w-52 border-t-2 border-white bg-[#111]/95 py-2 text-sm shadow-2xl"><button onClick={() => navigate("/whos-watching")} className="block w-full px-4 py-2 text-left hover:underline">Manage Profiles</button><button onClick={() => navigate("/account")} className="block w-full px-4 py-2 text-left hover:underline">Account</button><button className="block w-full px-4 py-2 text-left hover:underline">Help</button><div className="my-1 border-t border-white/15"/><button onClick={() => { localStorage.removeItem("activeProfile"); navigate("/login"); }} className="block w-full px-4 py-2 text-left hover:underline">Sign Out of STREAM</button></div>}</div>
        </div>
      </div>
    </header>

    {searchOpen && query && <section className="min-h-screen px-4 pb-20 pt-24 md:px-12"><h1 className="mb-6 text-xl">Search results for “{query}”</h1>{results.length ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{results.map((item) => <button key={`${typeOf(item)}-${item.id}`} onClick={() => navigate(`/title/${typeOf(item)}/${item.id}`)} className="text-left"><img src={item.backdrop_path ? getBackdropUrl(item.backdrop_path) : getPosterUrl(item.poster_path)} alt={titleOf(item)} className="aspect-video w-full object-cover"/><p className="mt-2 truncate text-sm">{titleOf(item)}</p></button>)}</div> : <p className="text-white/55">No titles found.</p>}</section>}

    {(!searchOpen || !query) && <>{hero && <section className="relative h-[76vh] min-h-[540px] md:h-[86vh]"><img src={getBackdropUrl(hero.backdrop_path)} alt="" className="absolute inset-0 h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/35 to-transparent"/><div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-transparent to-black/15"/><div className="relative z-10 flex h-full max-w-2xl flex-col justify-center px-4 pt-16 md:px-12"><p className="mb-3 text-xs font-bold uppercase tracking-[.35em] text-[#e50914]">STREAM Original</p><h1 className="text-5xl font-black leading-[.92] drop-shadow-2xl md:text-7xl">{titleOf(hero)}</h1><div className="mt-5 flex items-center gap-3 text-sm"><span className="font-bold text-[#46d369]">{Math.round((hero.vote_average || 0) * 10)}% Match</span><span>{yearOf(hero)}</span><span className="border border-white/50 px-1">HD</span></div><p className="mt-4 line-clamp-3 max-w-xl text-sm leading-6 text-white/90 drop-shadow md:text-lg md:leading-7">{hero.overview}</p><div className="mt-6 flex gap-3"><button onClick={() => navigate(`/watch/${typeOf(hero)}/${hero.id}`)} className="flex items-center gap-2 rounded bg-white px-6 py-2.5 font-bold text-black hover:bg-white/80"><span>▶</span> Play</button><button onClick={() => navigate(`/title/${typeOf(hero)}/${hero.id}`)} className="flex items-center gap-2 rounded bg-[#6d6d6e]/80 px-6 py-2.5 font-bold hover:bg-[#6d6d6e]/55"><Icon name="info"/> More Info</button></div></div><span className="absolute bottom-[18%] right-0 hidden border-l-4 border-white bg-black/45 py-2 pl-4 pr-12 text-sm md:block">16+</span></section>}
      {error && <div className="mx-4 mb-8 rounded border border-[#e50914]/50 bg-[#e50914]/10 p-4 text-sm md:mx-12">{error} Please try again later.</div>}
      <div className="relative z-10 -mt-16 pb-16 md:-mt-28">{Object.entries(ROW_LABELS).map(([key,label]) => <ContentRow key={key} label={label} items={content[key]} navigate={navigate}/>)}</div></>}
  </main>;
}
