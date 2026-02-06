import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../utils/api.js";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token || !email) {
      setError("Invalid reset link.");
      return;
    }

    setBusy(true);

    try {
      await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, email, password })
      });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-lg">
      <div className="card fade-up">
        <h2 className="font-display text-2xl sm:text-3xl">Reset your password</h2>
        <p className="mt-2 text-sm text-ink/70 dark:text-white/70">Enter a new password for your account.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs uppercase tracking-[0.2em]">New password</label>
            <input
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-darkCard dark:text-white"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em]">Confirm password</label>
            <input
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-darkCard dark:text-white"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error ? <p className="text-sm text-clay">{error}</p> : null}

          <button
            className="w-full rounded-2xl bg-ink py-3 text-white dark:bg-white dark:text-ink"
            type="submit"
            disabled={busy}
          >
            {busy ? "Resetting..." : "Reset password"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ResetPassword;
