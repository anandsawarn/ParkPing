import { useState } from "react";
import { apiFetch } from "../utils/api.js";

const ChangePassword = () => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      const data = await apiFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword
        })
      });
      setMessage(data.message || "Password changed successfully.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-xl">
      <div className="card fade-up">
        <h2 className="font-display text-2xl sm:text-3xl">Change password</h2>
        <p className="mt-2 text-sm text-ink/70 dark:text-white/70">Update your account password.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs uppercase tracking-[0.2em]">Current password</label>
            <input
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-darkCard dark:text-white"
              name="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em]">New password</label>
            <input
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-darkCard dark:text-white"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em]">Confirm new password</label>
            <input
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-darkCard dark:text-white"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
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
            {busy ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ChangePassword;
