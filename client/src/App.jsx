import { useState } from "react";
import { Routes, Route, Navigate, Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "./context/ThemeContext.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AddCar from "./pages/AddCar.jsx";
import EditCar from "./pages/EditCar.jsx";
import Scan from "./pages/Scan.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import Messages from "./pages/Messages.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

const isAuthed = () => Boolean(localStorage.getItem("pp_token"));
const isAdminAuthed = () => Boolean(localStorage.getItem("pp_admin_token"));

const ProtectedRoute = ({ children }) => {
  if (!isAuthed()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminProtectedRoute = ({ children }) => {
  if (!isAdminAuthed()) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("pp_token");
    navigate("/login");
  };

  const isScanPage = location.pathname.startsWith("/scan/");
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-stone text-ink transition-colors dark:bg-darkBg dark:text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-10 h-80 w-80 rounded-full bg-tide/50 blur-3xl"></div>
        <div className="absolute top-40 right-10 h-72 w-72 rounded-full bg-moss/40 blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 h-64 w-64 rounded-full bg-clay/30 blur-3xl"></div>
      </div>

      {!isScanPage && !isAdminPage && (
        <header className="sticky top-0 z-30 border-b border-ink/10 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-darkCard/70">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-6">
            <Link to="/" className="flex items-center gap-2 sm:gap-3" onClick={() => setIsMenuOpen(false)}>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-moss/20 text-xl sm:h-10 sm:w-10 sm:text-2xl dark:bg-moss/40">
                🅿️
              </div>
              <div className="hidden sm:block">
                <p className="text-xs uppercase tracking-[0.3em] text-moss dark:text-moss">ParkPing</p>
                <h1 className="font-display text-xl">Smart Contact</h1>
              </div>
            </Link>
            <nav className="flex items-center gap-2 text-sm font-semibold sm:gap-4">
              <button
                onClick={toggleTheme}
                className="rounded-full border border-ink/20 bg-white/70 p-2 dark:border-white/20 dark:bg-darkCard/70"
                title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              >
                {theme === "light" ? "🌙" : "☀️"}
              </button>
              <button
                className="rounded-full border border-ink/20 bg-white/70 px-3 py-2 text-xs sm:hidden dark:border-white/20 dark:bg-darkCard/70"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                aria-expanded={isMenuOpen}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? "Close" : "Menu"}
              </button>
              {isAuthed() ? (
                <>
                  <Link className="hidden hover:text-clay sm:inline dark:hover:text-tide" to="/dashboard">
                    Dashboard
                  </Link>
                  <Link className="hidden hover:text-clay sm:inline dark:hover:text-tide" to="/cars/new">
                    Add car
                  </Link>
                  <Link className="hidden hover:text-clay sm:inline dark:hover:text-tide" to="/messages">
                    Messages
                  </Link>
                  <Link className="hidden hover:text-clay sm:inline dark:hover:text-tide" to="/change-password">
                    Security
                  </Link>
                  <button
                    className="hidden rounded-full border border-ink/20 bg-white/70 px-3 py-2 text-xs sm:inline-flex sm:px-4 sm:text-sm dark:border-white/20 dark:bg-darkCard/70"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link className="hidden hover:text-clay sm:inline dark:hover:text-tide" to="/">
                    Home
                  </Link>
                  <Link className="hidden hover:text-clay sm:inline dark:hover:text-tide" to="/login">
                    Login
                  </Link>
                  <Link className="hidden rounded-full bg-ink px-3 py-2 text-xs text-white sm:inline-flex sm:px-4 sm:text-sm dark:bg-white dark:text-ink" to="/signup">
                    Get started
                  </Link>
                </>
              )}
            </nav>
          </div>
          {isMenuOpen && (
            <div className="border-t border-ink/10 bg-white/80 px-4 pb-4 pt-2 text-sm dark:border-white/10 dark:bg-darkCard/80 sm:hidden">
              <div className="flex flex-col gap-3 font-semibold">
                {isAuthed() ? (
                  <>
                    <Link className="hover:text-clay dark:hover:text-tide" to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      Dashboard
                    </Link>
                    <Link className="hover:text-clay dark:hover:text-tide" to="/cars/new" onClick={() => setIsMenuOpen(false)}>
                      Add car
                    </Link>
                    <Link className="hover:text-clay dark:hover:text-tide" to="/messages" onClick={() => setIsMenuOpen(false)}>
                      Messages
                    </Link>
                    <Link className="hover:text-clay dark:hover:text-tide" to="/change-password" onClick={() => setIsMenuOpen(false)}>
                      Security
                    </Link>
                    <button
                      className="rounded-full border border-ink/20 bg-white/70 px-3 py-2 text-left text-xs dark:border-white/20 dark:bg-darkCard/70"
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link className="hover:text-clay dark:hover:text-tide" to="/" onClick={() => setIsMenuOpen(false)}>
                      Home
                    </Link>
                    <Link className="hover:text-clay dark:hover:text-tide" to="/login" onClick={() => setIsMenuOpen(false)}>
                      Login
                    </Link>
                    <Link
                      className="rounded-full bg-ink px-3 py-2 text-center text-xs text-white dark:bg-white dark:text-ink"
                      to="/signup"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get started
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </header>
      )}

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <Routes>
          <Route path="/" element={isAuthed() ? <Navigate to="/dashboard" replace /> : <Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cars/new"
            element={
              <ProtectedRoute>
                <AddCar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cars/:id/edit"
            element={
              <ProtectedRoute>
                <EditCar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route path="/scan/:id" element={<Scan />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
