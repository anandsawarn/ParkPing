import { useEffect, useState } from "react";
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
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("signup");
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);

    try {
      if (step === "signup") {
        const data = await apiFetch("/api/auth/signup", {
          method: "POST",
          body: JSON.stringify(form)
        });
        if (data.needsVerification) {
          setStep("verify");
          setCooldown(30);
          setMessage("OTP sent to your email.");
          return;
        }
      }

      if (step === "verify") {
        const data = await apiFetch("/api/auth/verify-signup-otp", {
          method: "POST",
          body: JSON.stringify({ email: form.email, otp })
        });
        localStorage.setItem("pp_token", data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const resendOtp = async () => {
    setError("");
    setMessage("");
    setBusy(true);

    try {
      await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setCooldown(30);
      setMessage("OTP resent to your email.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  return (
    <section className="mx-auto max-w-lg">
      <div className="card fade-up">
        <h2 className="font-display text-2xl sm:text-3xl">Create your ParkPing</h2>
        <p className="mt-2 text-sm text-ink/70 dark:text-white/70">Set up your account to register your cars.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {step === "signup" ? (
            <>
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
            </>
          ) : (
            <>
              <div>
                <label className="text-xs uppercase tracking-[0.2em]">Email</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-ink/70 dark:border-white/10 dark:bg-darkCard dark:text-white/80"
                  name="email"
                  type="email"
                  value={form.email}
                  disabled
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em]">OTP</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-darkCard dark:text-white"
                  name="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
                <p className="mt-2 text-xs text-ink/60 dark:text-white/60">OTP is valid for 10 minutes.</p>
              </div>
              <button
                className="w-full rounded-2xl border border-ink/20 bg-white/70 py-3 text-ink dark:border-white/20 dark:bg-darkCard/70 dark:text-white"
                type="button"
                onClick={resendOtp}
                disabled={busy || cooldown > 0}
              >
                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
              </button>
            </>
          )}

          {error ? <p className="text-sm text-clay">{error}</p> : null}
          {message ? <p className="text-sm text-moss">{message}</p> : null}

          <button
            className="w-full rounded-2xl bg-ink py-3 text-white dark:bg-white dark:text-ink"
            type="submit"
            disabled={busy}
          >
            {busy ? "Please wait..." : step === "signup" ? "Create account" : "Verify OTP"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Signup;
