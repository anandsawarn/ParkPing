import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api.js";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const data = await apiFetch("/api/messages");
      setMessages(data.messages || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      await apiFetch("/api/messages", {
        method: "POST",
        body: JSON.stringify({ message: messageText })
      });
      setMessageText("");
      loadMessages();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl">Messages</h2>
        <p className="text-sm text-ink/70 dark:text-white/70">Chat with admin support</p>
      </div>

      {error && <p className="text-sm text-clay">{error}</p>}

      {loading ? (
        <div className="card">Loading messages...</div>
      ) : (
        <div className="card">
          {/* Messages List */}
          <div className="mb-4 space-y-3" style={{ maxHeight: "400px", overflowY: "auto" }}>
            {messages.length === 0 ? (
              <p className="text-center text-sm text-ink/70 dark:text-white/70">
                No messages yet. Send a message to start chatting with admin.
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.isAdminSender ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.isAdminSender
                        ? "bg-clay/10 text-left dark:bg-clay/20"
                        : "bg-moss/10 text-right dark:bg-tide/20"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">
                      {msg.isAdminSender ? "Admin" : "You"}
                    </p>
                    <p className="mt-1 text-sm">{msg.message}</p>
                    <p className="mt-1 text-xs opacity-50">
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Send Message Form */}
          <form onSubmit={sendMessage} className="mt-4 flex gap-3">
            <input
              className="flex-1 rounded-2xl border border-ink/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-darkCard dark:text-white"
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
            />
            <button
              className="rounded-2xl bg-moss px-6 py-3 text-white dark:bg-tide dark:text-ink"
              type="submit"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </section>
  );
};

export default Messages;
