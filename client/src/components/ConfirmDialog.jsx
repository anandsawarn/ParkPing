import { useState } from "react";

const ConfirmDialog = ({ isOpen, title, message, actionText, onConfirm, onCancel, requiresTyping = false }) => {
  const [inputValue, setInputValue] = useState("");

  const isConfirmDisabled = requiresTyping && inputValue.toLowerCase() !== actionText.toLowerCase();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur">
      <div className="card mx-4 max-w-sm space-y-4">
        <h3 className="font-display text-xl sm:text-2xl">{title}</h3>
        <p className="text-sm text-ink/70 dark:text-white/70">{message}</p>

        {requiresTyping && (
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.2em]">
              Type "<span className="font-semibold text-clay">{actionText}</span>" to confirm
            </p>
            <input
              className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-darkCard dark:text-white"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Type ${actionText}...`}
              autoFocus
            />
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            className="flex-1 rounded-2xl border border-ink/20 bg-white/70 py-3 dark:border-white/20 dark:bg-darkCard/70"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className={`flex-1 rounded-2xl py-3 text-white ${
              isConfirmDisabled ? "bg-clay/50 cursor-not-allowed" : "bg-clay"
            }`}
            onClick={() => {
              onConfirm();
              setInputValue("");
            }}
            disabled={isConfirmDisabled}
          >
            {actionText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
