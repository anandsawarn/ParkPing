import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

const QUOTES = [
  "Please move the vehicle if it is blocking access. Thank you.",
  "Kindly help clear the way. Your cooperation means a lot.",
  "A quick move would help everyone. Thanks for understanding.",
  "Parking ping: please free the path when convenient. Appreciate it.",
  "Your car is in the way. A small move, a big relief. Thanks."
];

const hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const getQuoteForCar = (car) => {
  if (!car || !car._id) {
    return QUOTES[0];
  }

  const index = hashString(car._id) % QUOTES.length;
  return QUOTES[index];
};

const drawWrappedText = (ctx, text, x, y, maxWidth, lineHeight) => {
  const words = text.split(" ");
  let line = "";
  let offsetY = y;

  words.forEach((word) => {
    const testLine = `${line}${word} `;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line.trim(), x, offsetY);
      line = `${word} `;
      offsetY += lineHeight;
    } else {
      line = testLine;
    }
  });

  if (line) {
    ctx.fillText(line.trim(), x, offsetY);
  }
};

const downloadQrWithQuote = (dataUrl, carNumber, quote) => {
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#0066cc");
    gradient.addColorStop(1, "#004c99");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(0, 0, canvas.width, 80);
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px Trebuchet MS";
    ctx.fillText("ParkPing", 40, 55);

    ctx.font = "16px Trebuchet MS";
    ctx.fillText("Smart Parking Contact", 40, canvas.height - 35);

    const qrSize = 240;
    const qrX = canvas.width - qrSize - 50;
    const qrY = (canvas.height - qrSize) / 2;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
    ctx.drawImage(image, qrX, qrY, qrSize, qrSize);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px Trebuchet MS";
    ctx.fillText(carNumber || "CAR", 40, 140);

    ctx.font = "18px Trebuchet MS";
    const maxWidth = canvas.width - qrSize - 120;
    drawWrappedText(ctx, quote, 40, 180, maxWidth, 28);

    ctx.fillStyle = "#ff6b35";
    ctx.font = "bold 16px Trebuchet MS";
    ctx.fillText("SCAN TO CONTACT →", 40, canvas.height - 100);

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `parkping-${carNumber}-fastag.png`;
    link.click();
  };
  image.src = dataUrl;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [qrMap, setQrMap] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: null, // "delete" or "edit"
    carId: null,
    carNumber: null
  });

  useEffect(() => {
    const loadCars = async () => {
      try {
        const data = await apiFetch("/api/cars");
        setCars(data.cars || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, []);

  const handleQr = async (carId) => {
    try {
      const data = await apiFetch(`/api/cars/${carId}/qr`);
      setQrMap((prev) => ({ ...prev, [carId]: data.dataUrl }));
    } catch (err) {
      setError(err.message);
    }
  };

  const openDeleteDialog = (carId, carNumber) => {
    setDialogState({
      isOpen: true,
      type: "delete",
      carId,
      carNumber
    });
  };

  const openEditDialog = (carId, carNumber) => {
    setDialogState({
      isOpen: true,
      type: "edit",
      carId,
      carNumber
    });
  };

  const handleDialogConfirm = async () => {
    const { type, carId } = dialogState;
    setDialogState({ isOpen: false, type: null, carId: null, carNumber: null });

    if (type === "delete") {
      try {
        await apiFetch(`/api/cars/${carId}`, { method: "DELETE" });
        setCars((prev) => prev.filter((c) => c._id !== carId));
      } catch (err) {
        setError(err.message);
      }
    } else if (type === "edit") {
      navigate(`/cars/${carId}/edit`);
    }
  };

  const handleDialogCancel = () => {
    setDialogState({ isOpen: false, type: null, carId: null, carNumber: null });
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl">Owner dashboard</h2>
          <p className="text-sm text-ink/70 dark:text-white/70">Your registered vehicles and QR codes.</p>
        </div>
        <div className="chip dark:border-white/20 dark:bg-darkCard/70">Active</div>
      </div>

      {error ? <p className="text-sm text-clay">{error}</p> : null}

      {loading ? (
        <div className="card">Loading vehicles...</div>
      ) : cars.length === 0 ? (
        <div className="card">No cars yet. Add one to generate a QR code.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {cars.map((car) => (
            <div className="card grid-glow" key={car._id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{car.carNumber}</h3>
                  <p className="text-sm text-ink/70 dark:text-white/70">
                    {car.carCompany} {car.carModel} · {car.carColor}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-moss dark:text-tide">
                    Contact: {car.contactName || "Driver"}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    className="rounded-full border border-ink/20 bg-white/70 px-3 py-2 text-sm sm:px-4 dark:border-white/20 dark:bg-darkCard/70"
                    onClick={() => handleQr(car._id)}
                  >
                    Get QR
                  </button>
                  <button
                    className="rounded-full border border-moss/20 bg-moss/10 px-3 py-2 text-sm text-moss sm:px-4 dark:border-moss/20 dark:bg-moss/10 dark:text-tide"
                    onClick={() => openEditDialog(car._id, car.carNumber)}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-full border border-clay/20 bg-clay/10 px-3 py-2 text-sm text-clay sm:px-4 dark:border-clay/20 dark:bg-clay/10"
                    onClick={() => openDeleteDialog(car._id, car.carNumber)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {qrMap[car._id] ? (
                <div className="mt-4 space-y-4">
                  <div className="fastag-card mx-auto flex items-center justify-between p-4 shadow-glow sm:p-6">
                    <div className="flex-1 space-y-2 text-white">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-white/20 p-1 text-xl">🅿️</div>
                        <p className="font-display text-base font-bold sm:text-lg">ParkPing</p>
                      </div>
                      <p className="text-base font-bold sm:text-xl">{car.carNumber}</p>
                      <p className="text-xs opacity-90 sm:text-sm">{getQuoteForCar(car)}</p>
                      <p className="text-xs font-bold text-accentOrange">SCAN TO CONTACT →</p>
                    </div>
                    <div className="flex-shrink-0">
                      <img
                        className="h-24 w-24 rounded-lg bg-white p-1 sm:h-32 sm:w-32"
                        src={qrMap[car._id]}
                        alt="QR code"
                      />
                    </div>
                  </div>
                  <button
                    className="w-full rounded-full bg-primaryBlue px-4 py-3 text-sm font-semibold text-white sm:w-auto dark:bg-tide dark:text-ink"
                    onClick={() =>
                      downloadQrWithQuote(qrMap[car._id], car.carNumber, getQuoteForCar(car))
                    }
                  >
                    Download FASTag QR
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title={dialogState.type === "delete" ? "Delete car?" : "Edit car?"}
        message={
          dialogState.type === "delete"
            ? `Are you sure you want to delete ${dialogState.carNumber}? This action cannot be undone.`
            : `Do you want to edit ${dialogState.carNumber}?`
        }
        actionText={dialogState.type === "delete" ? "DELETE" : "EDIT"}
        requiresTyping={dialogState.type === "delete"}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />
    </section>
  );
};

export default Dashboard;
