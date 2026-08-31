import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMovieDetails, getPosterUrl } from "../services/movieService";
import { getWatchlist, removeFromWatchlist } from "../services/watchlistService";

export default function MyList() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const watchlist = await getWatchlist();
        const movies = await Promise.all(
          watchlist.map(async (item) => {
            try {
              const movie = await getMovieDetails(item.movieId);
              return { ...movie, watchlistId: item.id, addedAt: item.addedAt };
            } catch {
              return null;
            }
          })
        );
        setItems(movies.filter(Boolean));
      } catch (err) {
        setError(err.message || "Could not load My List.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleRemove = async (movieId) => {
    try {
      await removeFromWatchlist(movieId);
      setItems((current) => current.filter((item) => item.id !== movieId));
    } catch (err) {
      setError(err.message || "Could not remove title.");
    }
  };

  return (
    <main className="min-h-screen bg-[#07060a] text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.18),transparent_45%)] px-6 pb-12 pt-24 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl">
          <button onClick={() => navigate(-1)} className="text-sm text-white/55 transition hover:text-white">← Back</button>
          <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.3em] text-violet-300">Library</p>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl" style={{ fontFamily: '"Cormorant Garamond", serif' }}>My List</h1>
          <p className="mt-4 max-w-2xl text-sm text-white/55 sm:text-base">A curated space for every title you want to come back to. Elegant, personal, and saved to your account.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-14">
        {loading ? <p className="text-white/50">Loading your list...</p> : null}
        {error ? <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}
        {!loading && !items.length ? <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-10 text-center"><p className="text-lg text-white/70">Your list is empty.</p><p className="mt-2 text-sm text-white/40">Add titles from any movie details page to build your personal collection.</p></div> : null}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <article key={item.id} className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_20px_70px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-2 hover:border-violet-400/40">
              <button onClick={() => navigate(`/title/movie/${item.id}`)} className="block w-full text-left">
                <img src={getPosterUrl(item.poster_path)} alt={item.title} className="aspect-[2/3] w-full object-cover" />
                <div className="p-5">
                  <h2 className="truncate text-lg font-semibold">{item.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm text-white/50">{item.overview}</p>
                </div>
              </button>
              <div className="flex items-center justify-between px-5 pb-5">
                <button onClick={() => navigate(`/watch/movie/${item.id}`)} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/80">Play</button>
                <button onClick={() => handleRemove(item.id)} className="text-sm text-white/45 transition hover:text-red-300">Remove</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
