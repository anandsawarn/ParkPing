import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api.js";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const data = await apiFetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify(form)
      });

      localStorage.setItem("pp_admin_token", data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex min-h-[80vh] items-center justify-center">
      <div className="card mx-auto w-full max-w-md fade-up">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-clay/20 text-3xl">
            🔐
          </div>
          <h2 className="font-display text-2xl sm:text-3xl">Admin Login</h2>
          <p className="mt-2 text-sm text-ink/70 dark:text-white/70">
            Access the admin dashboard
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs uppercase tracking-[0.2em]">Admin Email</label>
            <input
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-darkCard dark:text-white"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em]">Password</label>
            <input
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-darkCard dark:text-white"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error ? <p className="text-sm text-clay">{error}</p> : null}

          <button
            className="w-full rounded-2xl bg-clay py-3 text-white"
            type="submit"
            disabled={busy}
          >
            {busy ? "Logging in..." : "Login as Admin"}
          </button>

          <button
            className="w-full rounded-2xl border border-ink/20 bg-white/70 py-3 dark:border-white/20 dark:bg-darkCard/70"
            type="button"
            onClick={() => navigate("/")}
          >
            ← Back to Website
          </button>
        </form>
      </div>
    </section>
  );
};

export default AdminLogin;
