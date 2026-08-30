import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { setPassword as setPasswordApi } from "../services/authService";

export default function SetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const data = await setPasswordApi(token, password);
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (err) {
      console.error("Set password failed", err);
      setError("This link may have expired. Please request a new one.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#08060d] text-white px-6">
        <p className="text-white/60">
          Missing verification token. Please use the link from your email, or{" "}
          <Link to="/" className="text-violet-400 hover:underline">start over</Link>.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#08060d] text-white px-6">
      <div className="w-full max-w-[420px]">
        <h1
          className="text-4xl font-semibold mb-2"
          style={{ fontFamily: '"Cormorant Garamond", serif' }}
        >
          Set your password
        </h1>
        <p className="text-white/55 text-sm mb-8">
          Choose a password to finish setting up your STREAM account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="h-14 w-full rounded-xl border border-white/20 bg-black/35 px-5 text-sm text-white outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15"
            required
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
            className="h-14 w-full rounded-xl border border-white/20 bg-black/35 px-5 text-sm text-white outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15"
            required
          />

          {error && <p className="text-sm text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="h-14 w-full rounded-xl bg-gradient-to-r from-violet-700 via-purple-600 to-fuchsia-600 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Saving..." : "Set Password & Continue"}
          </button>
        </form>
      </div>
    </main>
  );
}