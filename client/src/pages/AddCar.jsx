import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api.js";

const AddCar = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    carNumber: "",
    carModel: "",
    carCompany: "",
    carColor: "",
    contactName: "",
    contactPhone: "",
    emergencyContactName: "",
    emergencyContactPhone: ""
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

    const hasEmergencyName = Boolean(form.emergencyContactName.trim());
    const hasEmergencyPhone = Boolean(form.emergencyContactPhone.trim());
    if ((hasEmergencyName && !hasEmergencyPhone) || (!hasEmergencyName && hasEmergencyPhone)) {
      setError("Emergency contact name and phone must be provided together.");
      setBusy(false);
      return;
    }

    try {
      await apiFetch("/api/cars", {
        method: "POST",
        body: JSON.stringify(form)
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-xl">
      <div className="card fade-up">
        <h2 className="font-display text-2xl sm:text-3xl">Register a car</h2>
        <p className="mt-2 text-sm text-ink/70 dark:text-white/70">Add vehicle details to generate a QR.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs uppercase tracking-[0.2em]">Car number</label>
            <input
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-darkCard dark:text-white"
              name="carNumber"
              value={form.carNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em]">Model</label>
            <input
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-darkCard dark:text-white"
              name="carModel"
              value={form.carModel}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em]">Company</label>
            <input
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-darkCard dark:text-white"
              name="carCompany"
              value={form.carCompany}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em]">Color</label>
            <input
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-darkCard dark:text-white"
              name="carColor"
              value={form.carColor}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em]">Contact name</label>
            <input
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-darkCard dark:text-white"
              name="contactName"
              value={form.contactName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em]">Contact phone</label>
            <input
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-darkCard dark:text-white"
              name="contactPhone"
              value={form.contactPhone}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em]">Emergency contact name</label>
            <input
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-darkCard dark:text-white"
              name="emergencyContactName"
              value={form.emergencyContactName}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em]">Emergency contact phone</label>
            <input
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-darkCard dark:text-white"
              name="emergencyContactPhone"
              value={form.emergencyContactPhone}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>

          {error ? <p className="text-sm text-clay">{error}</p> : null}

          <button
            className="w-full rounded-2xl bg-ink py-3 text-white dark:bg-white dark:text-ink"
            type="submit"
            disabled={busy}
          >
            {busy ? "Saving..." : "Save car"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default AddCar;
