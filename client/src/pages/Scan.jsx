import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../utils/api.js";

const QUOTES = [
  "Thanks for being the hero of the parking lot.",
  "Small kindness, big parking karma.",
  "Parking peace restored, one scan at a time.",
  "Your scan just made someone's day easier.",
  "Good drivers move mountains, or at least cars."
];

const Scan = () => {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [maskedPhone, setMaskedPhone] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const loadCar = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/api/cars/${id}/public`);
        setCar(data.car);
        setMaskedPhone(data.maskedPhone);
        setContactPhone(data.contactPhone || "");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCar();
  }, [id]);

  useEffect(() => {
    const pick = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(pick);
  }, []);

  const cleanPhone = (value) => value.replace(/[^0-9+]/g, "");

  const handleContact = (method) => {
    if (!contactPhone) {
      setNote("Contact number not available.");
      return;
    }

    const phone = cleanPhone(contactPhone);
    
    if (method === "call") {
      window.location.href = `tel:${phone}`;
      return;
    }
    if (method === "sms") {
      window.location.href = `sms:${phone}`;
      return;
    }
    if (method === "whatsapp") {
      window.location.href = `https://wa.me/${phone}`;
      return;
    }
  };

  const copyPhone = () => {
    if (contactPhone) {
      navigator.clipboard.writeText(contactPhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center">
        <div className="card text-center">
          <p className="text-lg font-semibold">Loading car details...</p>
          <div className="mt-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-moss border-t-clay dark:border-tide dark:border-t-white"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex min-h-screen items-center justify-center px-4">
        <div className="card max-w-md text-center">
          <p className="text-4xl">❌</p>
          <h2 className="mt-4 font-display text-2xl">Car Not Found</h2>
          <p className="mt-2 text-sm text-ink/70 dark:text-white/70">{error}</p>
          <p className="mt-4 text-xs text-ink/50 dark:text-white/50">
            This QR code may be invalid or the car has been removed.
          </p>
        </div>
      </section>
    );
  }

  if (!car) {
    return null;
  }

  return (
    <section className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="card grid-glow fade-up w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-moss dark:text-tide">🅿️ ParkPing</p>
            <h2 className="font-display text-2xl sm:text-3xl">{car.carNumber}</h2>
            <p className="mt-1 text-sm text-ink/70 dark:text-white/70">
              {car.carCompany} {car.carModel} • {car.carColor}
            </p>
          </div>
          <div className="chip dark:border-white/20 dark:bg-darkCard/70">✓ Verified</div>
        </div>

        {/* Car Owner Info */}
        <div className="glass space-y-3 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50 dark:text-white/50">Owner</p>
            <p className="mt-2 text-lg font-semibold text-ink dark:text-white">
              {car.contactName || "Driver"}
            </p>
          </div>
          <div className="border-t border-ink/10 pt-3 dark:border-white/10">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/50 dark:text-white/50">Contact Number</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-lg font-mono font-semibold text-ink dark:text-white">
                {maskedPhone}
              </p>
              <button
                className="rounded-full bg-moss/10 px-3 py-1 text-xs font-semibold text-moss dark:bg-tide/10 dark:text-tide"
                onClick={copyPhone}
                title="Copy full number"
              >
                {copied ? "✓ Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        {/* Friendly Quote */}
        <div className="glass border border-ink/10 bg-white/70 p-4 text-center dark:border-white/10 dark:bg-darkCard/70">
          <p className="text-xs uppercase tracking-[0.3em] text-ink/50 dark:text-white/50">Smile Line</p>
          <p className="mt-2 text-base font-semibold text-ink dark:text-white">{quote}</p>
          
        </div>

       

        {/* Contact Buttons */}
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/70 dark:text-white/70">
            Contact Owner
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              className="flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-4 py-4 font-semibold text-white transition-all hover:bg-blue-600 active:scale-95"
              onClick={() => handleContact("call")}
              title="Call the owner"
            >
              <span className="text-xl">📞</span>
              <span>Call</span>
            </button>
            <button
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-blue-500 px-4 py-4 font-semibold text-blue-500 transition-all hover:bg-blue-50 active:scale-95 dark:hover:bg-blue-500/10"
              onClick={() => handleContact("sms")}
              title="Send SMS"
            >
              <span className="text-xl">💬</span>
              <span>SMS</span>
            </button>
            <button
              className="flex items-center justify-center gap-2 rounded-2xl bg-green-500 px-4 py-4 font-semibold text-white transition-all hover:bg-green-600 active:scale-95"
              onClick={() => handleContact("whatsapp")}
              title="Chat on WhatsApp"
            >
              <span className="text-xl">📱</span>
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Status Message */}
        {note && (
          <div className="rounded-2xl border border-moss/20 bg-moss/5 p-3 text-center text-sm text-moss dark:border-tide/20 dark:bg-tide/5 dark:text-tide">
            {note}
          </div>
        )}

        {/* Mobile Info */}
        <div className="rounded-2xl border border-ink/10 bg-white/50 p-3 text-center text-xs text-ink/60 dark:border-white/10 dark:bg-darkCard/50 dark:text-white/60">
          💡 If direct contact fails, use the "Copy" button and contact manually
        </div>
      </div>
    </section>
  );
};

export default Scan;
