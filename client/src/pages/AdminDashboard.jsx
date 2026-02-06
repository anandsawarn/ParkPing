import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api.js";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, totalCars: 0, totalMessages: 0, unreadMessages: 0 });
  const [users, setUsers] = useState([]);
  const [cars, setCars] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState("stats");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userMessages, setUserMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    const token = localStorage.getItem("pp_admin_token");
    if (!token) {
      navigate("/admin");
      return;
    }

    try {
      setLoading(true);
      
      // Always load stats
      const statsData = await apiFetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(statsData);

      if (activeTab === "users") {
        const usersData = await apiFetch("/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(usersData.users || []);
      } else if (activeTab === "cars") {
        const carsData = await apiFetch("/api/admin/cars", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCars(carsData.cars || []);
      } else if (activeTab === "messages") {
        const messagesData = await apiFetch("/api/admin/messages", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(messagesData.messages || []);
        
        // Mark messages as read
        await apiFetch("/api/admin/messages/read", {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Refresh stats to update unread count
        const updatedStats = await apiFetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(updatedStats);
      }
    } catch (err) {
      setError(err.message);
      if (err.message.includes("token") || err.message.includes("denied")) {
        localStorage.removeItem("pp_admin_token");
        navigate("/admin");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("pp_admin_token");
    navigate("/admin");
  };

  const loadUserConversation = async (userId) => {
    const token = localStorage.getItem("pp_admin_token");
    try {
      const data = await apiFetch(`/api/admin/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserMessages(data.messages || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setUserMessages([]);
    loadUserConversation(user._id);
  };

  const sendMessage = async () => {
    if (!selectedUser || !messageText.trim()) return;

    const token = localStorage.getItem("pp_admin_token");
    try {
      await apiFetch("/api/admin/messages", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ receiverId: selectedUser._id, message: messageText })
      });
      setMessageText("");
      alert("Message sent successfully!");
      // Reload conversation
      loadUserConversation(selectedUser._id);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl sm:text-3xl">Admin Dashboard</h2>
            {stats.unreadMessages > 0 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-clay text-xs font-bold text-white animate-pulse">
                {stats.unreadMessages}
              </span>
            )}
          </div>
          <p className="text-sm text-ink/70 dark:text-white/70">
            Manage users, cars, and messages
            {stats.unreadMessages > 0 && (
              <span className="ml-2 font-semibold text-clay">
                · {stats.unreadMessages} new message{stats.unreadMessages > 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-full border border-moss/20 bg-moss/10 px-4 py-2 text-sm text-moss dark:border-tide/20 dark:bg-tide/10 dark:text-tide"
            onClick={() => navigate("/")}
          >
            🏠 Go to Website
          </button>
          <button
            className="rounded-full border border-clay/20 bg-clay/10 px-4 py-2 text-sm text-clay"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-clay">{error}</p>}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {["stats", "users", "cars", "messages"].map((tab) => (
          <button
            key={tab}
            className={`relative rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === tab
                ? "bg-moss text-white dark:bg-tide dark:text-ink"
                : "border border-ink/20 bg-white/70 dark:border-white/20 dark:bg-darkCard/70"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === "messages" && stats.unreadMessages > 0 && (
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-clay text-xs text-white">
                {stats.unreadMessages}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card">Loading...</div>
      ) : (
        <>
          {/* Stats Tab */}
          {activeTab === "stats" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <button
                className="card group relative cursor-pointer text-center transition-all hover:scale-105 hover:shadow-xl"
                onClick={() => setActiveTab("users")}
              >
                <div className="mb-3 text-4xl">👥</div>
                <div className="text-3xl font-bold text-moss dark:text-tide">{stats.totalUsers}</div>
                <p className="mt-2 text-sm uppercase tracking-[0.2em]">Total Users</p>
                <p className="mt-1 text-xs text-ink/50 dark:text-white/50">Click to view</p>
              </button>

              <button
                className="card group relative cursor-pointer text-center transition-all hover:scale-105 hover:shadow-xl"
                onClick={() => setActiveTab("cars")}
              >
                <div className="mb-3 text-4xl">🚗</div>
                <div className="text-3xl font-bold text-moss dark:text-tide">{stats.totalCars}</div>
                <p className="mt-2 text-sm uppercase tracking-[0.2em]">Total Cars</p>
                <p className="mt-1 text-xs text-ink/50 dark:text-white/50">Click to view</p>
              </button>

              <button
                className="card group relative cursor-pointer text-center transition-all hover:scale-105 hover:shadow-xl"
                onClick={() => setActiveTab("messages")}
              >
                <div className="mb-3 text-4xl">💬</div>
                <div className="text-3xl font-bold text-moss dark:text-tide">{stats.totalMessages}</div>
                <p className="mt-2 text-sm uppercase tracking-[0.2em]">Total Messages</p>
                <p className="mt-1 text-xs text-ink/50 dark:text-white/50">Click to view</p>
              </button>

              <button
                className="card group relative cursor-pointer text-center transition-all hover:scale-105 hover:shadow-xl"
                onClick={() => setActiveTab("messages")}
              >
                {stats.unreadMessages > 0 && (
                  <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-clay text-xs font-bold text-white animate-pulse">
                    {stats.unreadMessages}
                  </div>
                )}
                <div className="mb-3 text-4xl">🔔</div>
                <div className="text-3xl font-bold text-clay">{stats.unreadMessages}</div>
                <p className="mt-2 text-sm uppercase tracking-[0.2em]">New Messages</p>
                <p className="mt-1 text-xs text-ink/50 dark:text-white/50">Click to view</p>
              </button>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="card space-y-4">
              <h3 className="text-lg font-semibold">All Users ({users.length})</h3>
              {users.length === 0 ? (
                <p className="text-sm text-ink/70 dark:text-white/70">No users yet</p>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user._id} className="flex items-center justify-between rounded-xl border border-ink/10 bg-white/50 p-3 dark:border-white/10 dark:bg-darkCard/50">
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-ink/70 dark:text-white/70">{user.email}</p>
                        <p className="text-xs text-ink/50 dark:text-white/50">{user.phone}</p>
                      </div>
                      <button
                        className="rounded-full bg-moss/10 px-3 py-1 text-xs text-moss dark:bg-tide/10 dark:text-tide"
                        onClick={() => handleUserSelect(user)}
                      >
                        💬 View Messages
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* User Conversation Modal */}
              {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur p-4">
                  <div className="card mx-auto w-full max-w-2xl space-y-4" style={{ maxHeight: "80vh", overflow: "hidden" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lg">{selectedUser.name}</p>
                        <p className="text-sm text-ink/70 dark:text-white/70">{selectedUser.email}</p>
                      </div>
                      <button
                        className="rounded-full border border-clay/20 bg-clay/10 px-3 py-1 text-sm text-clay"
                        onClick={() => {
                          setSelectedUser(null);
                          setUserMessages([]);
                          setMessageText("");
                        }}
                      >
                        Close ✕
                      </button>
                    </div>

                    {/* Messages List */}
                    <div className="space-y-3" style={{ maxHeight: "400px", overflowY: "auto" }}>
                      {userMessages.length === 0 ? (
                        <p className="text-center text-sm text-ink/70 dark:text-white/70">
                          No messages yet with this user
                        </p>
                      ) : (
                        userMessages.map((msg) => (
                          <div
                            key={msg._id}
                            className={`flex ${msg.isAdminSender ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                msg.isAdminSender
                                  ? "bg-clay/10 text-right dark:bg-clay/20"
                                  : "bg-moss/10 text-left dark:bg-tide/20"
                              }`}
                            >
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">
                                {msg.isAdminSender ? "Admin" : selectedUser.name}
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
                    <div className="border-t border-ink/10 pt-4 dark:border-white/10">
                      <textarea
                        className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-darkCard dark:text-white"
                        rows="3"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type your message..."
                      />
                      <button
                        className="mt-2 w-full rounded-xl bg-moss py-2 text-white dark:bg-tide dark:text-ink"
                        onClick={sendMessage}
                      >
                        Send Message
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cars Tab */}
          {activeTab === "cars" && (
            <div className="card space-y-4">
              <h3 className="text-lg font-semibold">All Cars ({cars.length})</h3>
              {cars.length === 0 ? (
                <p className="text-sm text-ink/70 dark:text-white/70">No cars registered yet</p>
              ) : (
                <div className="space-y-3">
                  {cars.map((car) => (
                    <div key={car._id} className="rounded-xl border border-ink/10 bg-white/50 p-3 dark:border-white/10 dark:bg-darkCard/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{car.carNumber}</p>
                          <p className="text-sm text-ink/70 dark:text-white/70">
                            {car.carCompany} {car.carModel} · {car.carColor}
                          </p>
                          <p className="text-xs text-moss dark:text-tide">
                            Owner: {car.userId?.name} ({car.userId?.email})
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === "messages" && (
            <div className="card space-y-4">
              <h3 className="text-lg font-semibold">All Messages ({messages.length})</h3>
              {messages.length === 0 ? (
                <p className="text-sm text-ink/70 dark:text-white/70">No messages yet</p>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div 
                      key={msg._id} 
                      className={`rounded-xl border p-3 ${
                        !msg.isRead && msg.receiverId === "admin"
                          ? "border-clay/30 bg-clay/5 dark:border-clay/30 dark:bg-clay/10"
                          : "border-ink/10 bg-white/50 dark:border-white/10 dark:bg-darkCard/50"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`flex-shrink-0 rounded-full p-2 text-xs ${msg.isAdminSender ? "bg-clay/20" : "bg-moss/20"}`}>
                          {msg.isAdminSender ? "👨‍💼" : "👤"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-ink/70 dark:text-white/70">
                              {msg.isAdminSender
                                ? `Admin → ${msg.receiverId?.name || "User"}`
                                : `${msg.senderId?.name || "User"} → Admin`}
                            </p>
                            {!msg.isRead && msg.receiverId === "admin" && (
                              <span className="rounded-full bg-clay px-2 py-0.5 text-xs font-bold text-white">
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm">{msg.message}</p>
                          <p className="mt-1 text-xs text-ink/50 dark:text-white/50">
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default AdminDashboard;
