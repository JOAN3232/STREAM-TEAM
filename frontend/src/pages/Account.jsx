import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentSubscription, getCurrentUser } from "../services/subscriptionService";
import { getProfiles } from "../services/profileService";

export default function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [me, currentSubscription, accountProfiles] = await Promise.all([
          getCurrentUser(),
          getCurrentSubscription(),
          getProfiles(),
        ]);
        setUser(me);
        setSubscription(currentSubscription);
        setProfiles(accountProfiles);
      } catch (err) {
        setError(err.message || "Could not load account details.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <main className="min-h-screen bg-[#06050a] text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.18),transparent_42%)] px-6 pb-14 pt-24 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-6xl">
          <button onClick={() => navigate(-1)} className="text-sm text-white/55 transition hover:text-white">← Back</button>
          <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.3em] text-violet-300">Account</p>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl" style={{ fontFamily: '"Cormorant Garamond", serif' }}>Membership & Profiles</h1>
          <p className="mt-4 max-w-2xl text-sm text-white/55 sm:text-base">Your streaming identity, subscription, and profiles — all in one cinematic control center.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-12 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-14">
        {loading ? <p className="text-white/50">Loading account...</p> : null}
        {error ? <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}

        {!loading && !error && (
          <>
            <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/35">Account owner</p>
              <h2 className="mt-3 text-2xl font-semibold">{user?.email || "Unknown"}</h2>
              <p className="mt-2 text-sm text-white/45">User ID: {user?.id}</p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs text-white/40">Plan</p><p className="mt-2 text-lg font-semibold text-violet-200">{subscription?.plan || "Not selected"}</p></div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs text-white/40">Status</p><p className="mt-2 text-lg font-semibold text-emerald-300">{subscription?.status || "PENDING"}</p></div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs text-white/40">Profiles</p><p className="mt-2 text-lg font-semibold">{profiles.length}</p></div>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <p className="text-[10px] uppercase tracking-[0.24em] text-violet-300">Profiles</p>
              <h2 className="mt-3 text-2xl font-semibold">Who’s watching</h2>
              <div className="mt-6 space-y-4">
                {profiles.map((profile) => (
                  <div key={profile.id} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <img src={profile.avatarImage} alt={profile.name} className="h-14 w-14 rounded-2xl object-cover" />
                    <div>
                      <p className="font-semibold">{profile.name}</p>
                      <p className="text-sm text-white/45">{profile.kids ? "Kids Profile" : "Standard Profile"}</p>
                    </div>
                  </div>
                ))}
                {!profiles.length && <p className="text-sm text-white/45">No profiles created yet.</p>}
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
