import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { X, Lock, User, Mail, Sparkles, ArrowRight } from "lucide-react";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    quickDemoLogin,
  } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (authModalMode === "login") {
      const res = await login(username, password);
      if (!res.success) {
        setError(res.error);
      }
    } else {
      const res = await register(username, email, password, name);
      if (!res.success) {
        setError(res.error);
      }
    }
    setSubmitting(false);
  };

  const handleDemoLogin = async () => {
    setError("");
    setSubmitting(true);
    const res = await quickDemoLogin();
    if (!res.success) {
      setError(res.error);
    }
    setSubmitting(false);
  };

  return (
    <div className="modal-backdrop" onClick={closeAuthModal}>
      <div
        className="modal-card auth-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={closeAuthModal}>
          <X size={20} />
        </button>

        <div className="auth-modal-header">
          <div className="auth-brand-badge">
            <Sparkles size={16} />
            <span>Cravee Account</span>
          </div>
          <h2>
            {authModalMode === "login"
              ? "Welcome back to Cravee"
              : "Create your food journey"}
          </h2>
          <p>
            {authModalMode === "login"
              ? "Sign in to access your saved cart, addresses, and order history."
              : "Join food lovers across the city for instant hot delivery."}
          </p>
        </div>

        {/* Quick Demo Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={submitting}
          className="btn-demo-banner"
        >
          <Sparkles size={18} className="sparkle-anim" />
          <span>Quick 1-Click Demo Login (Instant Access)</span>
        </button>

        <div className="auth-divider">
          <span>or continue with credentials</span>
        </div>

        {error && <div className="auth-error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {authModalMode === "register" && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Username</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                required
                placeholder="Choose username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-submit-auth"
          >
            <span>
              {submitting
                ? "Processing..."
                : authModalMode === "login"
                ? "Sign In Now"
                : "Create Account"}
            </span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-toggle-footer">
          {authModalMode === "login" ? (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                className="btn-link"
                onClick={() => {
                  setError("");
                  setAuthModalMode("register");
                }}
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                className="btn-link"
                onClick={() => {
                  setError("");
                  setAuthModalMode("login");
                }}
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
