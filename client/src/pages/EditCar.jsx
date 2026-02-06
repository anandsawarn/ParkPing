import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../utils/api.js";

const EditCar = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    carNumber: "",
    carModel: "",
    carCompany: "",
    carColor: "",
    contactName: "",
    contactPhone: ""
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCar = async () => {
      try {
        const data = await apiFetch(`/api/cars`);
        const car = data.cars?.find((c) => c._id === id);
        if (car) {
          setForm({
            carNumber: car.carNumber,
            carModel: car.carModel,
            carCompany: car.carCompany,
            carColor: car.carColor,
            contactName: car.contactName,
            contactPhone: car.contactPhone
          });
        } else {
          setError("Car not found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCar();
  }, [id]);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      await apiFetch(`/api/cars/${id}`, {
        method: "PUT",
        body: JSON.stringify(form)
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-xl">
        <div className="card">Loading car details...</div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl">
      <div className="card fade-up">
        <h2 className="font-display text-2xl sm:text-3xl">Edit car</h2>
        <p className="mt-2 text-sm text-ink/70 dark:text-white/70">Update vehicle details.</p>

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

          {error ? <p className="text-sm text-clay">{error}</p> : null}

          <div className="flex gap-3">
            <button
              className="flex-1 rounded-2xl bg-ink py-3 text-white dark:bg-white dark:text-ink"
              type="submit"
              disabled={busy}
            >
              {busy ? "Saving..." : "Update car"}
            </button>
            <button
              className="flex-1 rounded-2xl border border-ink/20 bg-white/70 py-3 dark:border-white/20 dark:bg-darkCard/70"
              type="button"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default EditCar;
