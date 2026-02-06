import { useState } from "react";
import { apiFetch } from "../utils/api.js";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);

    try {
      const data = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email })
      });
      setMessage(data.message || "Password reset instructions sent to your email.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-lg">
      <div className="card fade-up">
        <h2 className="font-display text-2xl sm:text-3xl">Forgot password</h2>
        <p className="mt-2 text-sm text-ink/70 dark:text-white/70">
          Enter your email and we'll send you a reset link.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs uppercase tracking-[0.2em]">Email</label>
            <input
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-darkCard dark:text-white"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error ? <p className="text-sm text-clay">{error}</p> : null}
          {message ? <p className="text-sm text-moss">{message}</p> : null}

          <button
            className="w-full rounded-2xl bg-ink py-3 text-white dark:bg-white dark:text-ink"
            type="submit"
            disabled={busy}
          >
            {busy ? "Sending..." : "Send reset link"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ForgotPassword;
