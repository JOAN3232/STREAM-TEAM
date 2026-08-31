import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBackdropUrl, getTrendingMovies } from "../services/movieService";
import { createProfile, deleteProfile, getProfiles } from "../services/profileService";

const CHARACTER_AVATARS = [
  { id: "spiderman", name: "Spider-Man", category: "Heroes", images: ["https://cdn.whitescreen.dev/spider-man-pfp-spider-man-avatar-built-for-strong-identity-and-recognition-agoz-square_hd-0226_800.webp", "https://avatars.pfptown.com/137/spiderman-pfp-2314.png"] },
  { id: "wednesday", name: "Wednesday", category: "Girls", images: ["https://www.hindustantimes.com/ht-img/img/2025/08/06/1200x1600/wednesday_1754481889556_1754481889786_1754501831171_1754503080142.jpg"] },
  { id: "wonder-woman", name: "Wonder Woman", category: "Girls", images: ["https://e0.pxfuel.com/wallpapers/945/442/desktop-wallpaper-wonder-woman-gal-gadot-gal-gadot-wonder-woman-gal-cute-wonder-woman.jpg"] },
  { id: "harley", name: "Harley Quinn", category: "Girls", images: ["https://conteudo.imguol.com.br/c/entretenimento/1c/2017/08/17/arlequina---margot-robbie-1502981761342_v2_1x1.jpg"] },
  { id: "gwen", name: "Gwen Stacy", category: "Girls", images: ["https://m.media-amazon.com/images/M/MV5BMzE1MTc4OGMtOTU2OC00Zjg1LWJmMjUtNDQzNTQyMDlmOTRlXkEyXkFqcGc%40._V1_.jpg"] },
  { id: "barbie", name: "Barbie", category: "Girls", images: ["https://i.pinimg.com/736x/a4/ed/44/a4ed44bcb3249df6bfecf43072cb0321.jpg"] },
  { id: "batman", name: "Batman", category: "Heroes", images: ["https://cdn.whitescreen.dev/batman-pfp-batman-avatar-with-stoic-expression-and-clean-composition-nocl-square_hd-b252_800.webp"] },
  { id: "deadpool", name: "Deadpool", category: "Heroes", images: ["https://avatarfiles.alphacoders.com/129/129094.jpg"] },
];

function CharacterAvatar({ avatar, className = "" }) {
  const [imageIndex, setImageIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setImageIndex(0);
    setFailed(false);
  }, [avatar?.id]);

  if (!avatar) return null;

  const handleError = () => {
    const next = imageIndex + 1;
    if (next < avatar.images.length) setImageIndex(next);
    else setFailed(true);
  };

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-violet-700 via-purple-700 to-fuchsia-700 ${className}`}>
      {!failed && avatar.images?.[imageIndex] ? (
        <img src={avatar.images[imageIndex]} alt={avatar.name} onError={handleError} referrerPolicy="no-referrer" className="h-full w-full object-cover object-center" />
      ) : (
        <div className="flex h-full w-full items-center justify-center"><span className="text-xl font-semibold text-white/90" style={{ fontFamily: '"Cormorant Garamond", serif' }}>{avatar.name.charAt(0)}</span></div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/[0.04]" />
    </div>
  );
}

export default function WhosWatching() {
  const navigate = useNavigate();
  const [backgrounds, setBackgrounds] = useState([]);
  const [currentBackground, setCurrentBackground] = useState(0);
  const [profiles, setProfiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [kidsProfile, setKidsProfile] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(CHARACTER_AVATARS[0]);
  const [category, setCategory] = useState("All");

  useEffect(() => {
    const load = async () => {
      try {
        const [movies, savedProfiles] = await Promise.all([
          getTrendingMovies(),
          getProfiles(),
        ]);
        const available = movies.filter((movie) => movie.backdrop_path || movie.backdropUrl).slice(0, 8).map((movie) => ({ id: movie.id, image: getBackdropUrl(movie.backdrop_path || movie.backdropUrl) }));
        setBackgrounds(available);
        setProfiles(savedProfiles.map((profile) => ({
          ...profile,
          avatar: {
            id: profile.avatarId,
            name: profile.avatarName,
            category: "Saved",
            images: [profile.avatarImage],
          },
        })));
      } catch (loadError) {
        setError(loadError.message || "Could not load profiles.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (backgrounds.length <= 1) return;
    const interval = setInterval(() => setCurrentBackground((current) => current >= backgrounds.length - 1 ? 0 : current + 1), 6500);
    return () => clearInterval(interval);
  }, [backgrounds.length]);

  const closeModal = () => {
    setShowModal(false);
    setName("");
    setKidsProfile(false);
    setError("");
    setCategory("All");
    setSelectedAvatar(CHARACTER_AVATARS[0]);
  };

  const handleSaveProfile = async () => {
    const cleanName = name.trim();
    if (!cleanName) {
      setError("Enter a profile name.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const saved = await createProfile({
        name: cleanName,
        avatarId: selectedAvatar.id,
        avatarName: selectedAvatar.name,
        avatarImage: selectedAvatar.images[0],
        kids: kidsProfile,
      });
      setProfiles((current) => [...current, {
        ...saved,
        avatar: {
          id: saved.avatarId,
          name: saved.avatarName,
          category: "Saved",
          images: [saved.avatarImage],
        },
      }]);
      closeModal();
    } catch (saveError) {
      setError(saveError.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleProfileClick = (profile) => {
    localStorage.setItem("activeProfile", JSON.stringify({ id: profile.id, name: profile.name, avatarImage: profile.avatar?.images?.[0] || profile.avatarImage, kids: profile.kids }));
    navigate(`/browse?profile=${encodeURIComponent(profile.name)}&profileId=${encodeURIComponent(profile.id)}`);
  };

  const handleDeleteProfile = async (profileId) => {
    try {
      await deleteProfile(profileId);
      setProfiles((current) => current.filter((profile) => profile.id !== profileId));
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete profile.");
    }
  };

  const shownAvatars = useMemo(() => category === "All" ? CHARACTER_AVATARS : CHARACTER_AVATARS.filter((avatar) => avatar.category === category), [category]);
  const categories = ["All", "Girls", "Heroes"];

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050407] text-white">
      <div className="fixed inset-0 overflow-hidden">
        {backgrounds.map((movie, index) => <div key={movie.id} className={`absolute inset-0 transition-all duration-[1800ms] ease-out ${index === currentBackground ? "scale-100 opacity-100" : "scale-[1.02] opacity-0"}`}><img src={movie.image} alt="" className="h-full w-full object-cover object-center" /></div>)}
        {backgrounds.length === 0 && <div className="absolute inset-0 bg-gradient-to-br from-[#171022] via-[#09070f] to-black" />}
        <div className="absolute inset-0 bg-black/42" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#050407]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(5,4,8,0.42)_100%)]" />
      </div>

      <header className="relative z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-10 lg:px-14">
          <button type="button" onClick={() => navigate("/")} className="text-2xl font-bold tracking-[0.15em] text-violet-400 sm:text-3xl" style={{ fontFamily: '"Cormorant Garamond", serif' }}>STREAM</button>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate("/account")} className="text-sm text-white/55 transition hover:text-white">Account</button>
            {profiles.length > 0 && <button type="button" onClick={() => navigate("/account")} className="text-sm text-white/55 transition hover:text-white">Manage Profiles</button>}
          </div>
        </div>
      </header>

      <div className="relative z-30 mx-auto mt-1 w-full max-w-7xl px-6 sm:px-10 lg:px-14">
        <button type="button" onClick={() => navigate(-1)} className="group inline-flex items-center gap-3 text-sm text-white/45 transition hover:text-white"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/20 text-base backdrop-blur-xl transition duration-300 group-hover:-translate-x-1 group-hover:border-violet-400/40 group-hover:bg-violet-500/10">←</span><span className="hidden sm:block">Back</span></button>
      </div>

      <section className="relative z-20 flex min-h-[calc(100vh-120px)] items-center justify-center px-5 pb-20">
        <div className="w-full max-w-5xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-violet-300">Choose a profile</p>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl lg:text-[58px]" style={{ fontFamily: '"Cormorant Garamond", serif' }}>Who&apos;s watching?</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/55 sm:text-base">Choose the identity you want to watch with. Your profiles are now saved to your account.</p>
          {loading ? <p className="mt-6 text-white/55">Loading profiles...</p> : null}
          {error ? <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}

          <div className="mt-10 flex flex-wrap items-start justify-center gap-6">
            {profiles.map((profile) => (
              <div key={profile.id} className="group relative w-[105px] sm:w-[118px]">
                <button type="button" onClick={() => handleProfileClick(profile)} className="w-full">
                  <div className="relative aspect-square overflow-hidden rounded-[20px] border border-white/10 shadow-[0_18px_55px_rgba(0,0,0,0.4)] transition duration-300 group-hover:-translate-y-2 group-hover:border-violet-400/60">
                    <CharacterAvatar avatar={profile.avatar} className="h-full w-full" />
                    {profile.kids && <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-1 text-[7px] font-bold uppercase tracking-wider">Kids</span>}
                  </div>
                  <p className="mt-3 truncate text-sm text-white/70 group-hover:text-white">{profile.name}</p>
                </button>
                <button type="button" onClick={() => handleDeleteProfile(profile.id)} className="mt-2 text-[11px] text-white/35 transition hover:text-red-300">Delete</button>
              </div>
            ))}

            <button type="button" onClick={() => setShowModal(true)} className="group w-[105px] sm:w-[118px]"><div className="flex aspect-square items-center justify-center rounded-[20px] border border-dashed border-white/20 bg-black/20 backdrop-blur-sm transition duration-300 group-hover:-translate-y-2 group-hover:border-violet-400/60 group-hover:bg-violet-500/10"><div className="relative h-10 w-10"><span className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-white/50 group-hover:bg-violet-200" /><span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-white/50 group-hover:bg-violet-200" /></div></div><p className="mt-3 text-sm text-white/45 group-hover:text-white">Add Profile</p></button>
          </div>
        </div>
      </section>

      {showModal && <div className="fixed inset-0 z-[100] grid place-items-center overflow-hidden px-4 py-4"><button type="button" aria-label="Close modal" onClick={closeModal} className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" /><div className="relative z-10 w-full max-w-[720px] overflow-hidden rounded-[24px] border border-white/10 bg-[#0b0910]/92 shadow-[0_35px_120px_rgba(0,0,0,0.75)] backdrop-blur-2xl max-h-[94vh] overflow-y-auto md:max-h-none md:overflow-y-hidden"><div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-violet-600/15 blur-[90px]" /><button type="button" onClick={closeModal} className="absolute right-5 top-5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-lg text-white/50 transition hover:bg-white/10 hover:text-white">×</button><div className="relative p-6 sm:p-7"><div className="pr-12"><p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-violet-300">New profile</p><h2 className="mt-1.5 text-3xl font-semibold" style={{ fontFamily: '"Cormorant Garamond", serif' }}>Add a profile.</h2><p className="mt-1 text-sm text-white/40">Choose a character and give this profile a name.</p></div><div className="mt-5 grid items-center gap-5 sm:grid-cols-[78px_1fr]"><CharacterAvatar avatar={selectedAvatar} className="mx-auto aspect-square w-[76px] rounded-[17px] border border-violet-400/30 sm:mx-0" /><div><label className="text-[9px] font-semibold uppercase tracking-[0.23em] text-white/35">Profile name</label><input type="text" value={name} autoFocus onChange={(event) => { setName(event.target.value); setError(""); }} placeholder="Enter a name" className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-violet-400/60" />{error && <p className="mt-1.5 text-xs text-red-300">{error}</p>}</div></div><div className="mt-5 border-t border-white/[0.07] pt-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[9px] font-semibold uppercase tracking-[0.27em] text-violet-300">Choose your character</p><p className="mt-1 text-xs text-white/30">Pick your STREAM identity.</p></div><div className="flex rounded-full border border-white/10 bg-black/20 p-1">{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`rounded-full px-3 py-1.5 text-[10px] transition ${category === item ? "bg-violet-500/20 text-white" : "text-white/35 hover:text-white"}`}>{item}</button>)}</div></div><div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-8">{shownAvatars.map((avatar) => { const active = selectedAvatar.id === avatar.id; return <button key={avatar.id} type="button" title={avatar.name} onClick={() => setSelectedAvatar(avatar)} className={`group relative aspect-square min-w-0 overflow-hidden rounded-[15px] border transition duration-300 ${active ? "scale-[1.04] border-violet-400 ring-2 ring-violet-500/20" : "border-white/10 opacity-70 hover:-translate-y-1 hover:border-white/30 hover:opacity-100"}`}><CharacterAvatar avatar={avatar} className="h-full w-full" />{active && <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[8px] font-bold">✓</span>}</button>; })}</div></div><div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4"><div><p className="text-sm font-medium">Kids Profile</p><p className="mt-0.5 text-xs text-white/30">Age-appropriate titles only.</p></div><button type="button" onClick={() => setKidsProfile((current) => !current)} className={`relative h-6 w-11 flex-none rounded-full transition ${kidsProfile ? "bg-gradient-to-r from-violet-600 to-fuchsia-500" : "bg-white/10"}`}><span className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition ${kidsProfile ? "left-[22px]" : "left-[3px]"}`} /></button></div><div className="mt-5 flex items-center justify-end gap-2"><button type="button" onClick={closeModal} className="rounded-lg px-4 py-2 text-sm text-white/40 transition hover:bg-white/[0.05] hover:text-white">Cancel</button><button type="button" disabled={saving} onClick={handleSaveProfile} className="rounded-lg bg-gradient-to-r from-violet-700 via-purple-600 to-fuchsia-600 px-5 py-2 text-sm font-semibold shadow-[0_10px_30px_rgba(124,58,237,0.25)] transition hover:scale-[1.02] disabled:opacity-70">{saving ? "Saving..." : "Save Profile"}<span className="ml-2">→</span></button></div></div></div></div>}

      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-20 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent shadow-[0_-8px_30px_rgba(168,85,247,0.45)]" />
    </main>
  );
}
