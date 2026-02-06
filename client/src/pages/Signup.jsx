import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api.js";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: ""
  });
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
      const data = await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(form)
      });
      localStorage.setItem("pp_token", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-lg">
      <div className="card fade-up">
        <h2 className="font-display text-2xl sm:text-3xl">Create your ParkPing</h2>
        <p className="mt-2 text-sm text-ink/70 dark:text-white/70">Set up your account to register your cars.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs uppercase tracking-[0.2em]">Name</label>
            <input
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-darkCard dark:text-white"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em]">Phone</label>
            <input
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-darkCard dark:text-white"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em]">Email</label>
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
            className="w-full rounded-2xl bg-ink py-3 text-white dark:bg-white dark:text-ink"
            type="submit"
            disabled={busy}
          >
            {busy ? "Creating..." : "Create account"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Signup;
