import { useState } from "react";
import { authRegister, authLogin } from "../api";

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const switchMode = () => {
    setMode(m => (m === "login" ? "register" : "login"));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (mode === "register" && !name.trim()) {
      return setError("Please enter your full name.");
    }
    if (!email.trim()) return setError("Please enter your email.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email.");
    if (!password) return setError("Please enter your password.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      let data;
      if (mode === "register") {
        data = await authRegister(name.trim(), email.trim(), password);
        setSuccess("Account created! Signing you in...");
      } else {
        data = await authLogin(email.trim(), password);
      }
      // Small delay so success message is visible on register
      setTimeout(() => {
        onAuth(data.token, data.user);
      }, mode === "register" ? 600 : 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* Animated background */}
      <div className="auth-bg-grid" />
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      <div className="auth-container">
        {/* Left — Branding panel */}
        <div className="auth-brand">
          <div className="auth-brand-inner">
            <div className="auth-brand-logo">
              <span className="auth-logo-mark">✦</span>
              <span className="auth-logo-text">Craft<em>Folio</em></span>
              <span className="auth-logo-ai">AI</span>
            </div>
            <h1 className="auth-brand-title">Build stunning resumes<br/>with AI power</h1>
            <p className="auth-brand-sub">
              Create ATS-optimized resumes, get AI-powered suggestions, and generate 
              portfolio websites - all in one beautiful flow.
            </p>
            <div className="auth-features">
              <div className="auth-feature">
                <span className="auth-feature-icon">◈</span>
                <div>
                  <div className="auth-feature-title">AI-Powered Writing</div>
                  <div className="auth-feature-desc">Smart summaries & objectives</div>
                </div>
              </div>
              <div className="auth-feature">
                <span className="auth-feature-icon">◉</span>
                <div>
                  <div className="auth-feature-title">3 Premium Templates</div>
                  <div className="auth-feature-desc">Orbital, Axiom & Nocturne</div>
                </div>
              </div>
              <div className="auth-feature">
                <span className="auth-feature-icon">⬡</span>
                <div>
                  <div className="auth-feature-title">Portfolio Generator</div>
                  <div className="auth-feature-desc">One-click deployable website</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Auth form */}
        <div className="auth-form-panel">
          <div className="auth-form-card" key={mode}>
            <div className="auth-form-header">
              <h2 className="auth-form-title">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="auth-form-sub">
                {mode === "login"
                  ? "Sign in to continue building your resume"
                  : "Join CraftFolio to get started"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {mode === "register" && (
                <div className="auth-field" style={{ animationDelay: "0.05s" }}>
                  <label className="auth-label" htmlFor="auth-name">Full Name</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">👤</span>
                    <input
                      id="auth-name"
                      type="text"
                      className="auth-input"
                      placeholder="Monalisa Das"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div className="auth-field" style={{ animationDelay: "0.1s" }}>
                <label className="auth-label" htmlFor="auth-email">Email Address</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">✉</span>
                  <input
                    id="auth-email"
                    type="email"
                    className="auth-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-field" style={{ animationDelay: "0.15s" }}>
                <label className="auth-label" htmlFor="auth-password">Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    id="auth-password"
                    type={showPass ? "text" : "password"}
                    className="auth-input"
                    placeholder={mode === "register" ? "Min. 6 characters" : "Enter your password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete={mode === "register" ? "new-password" : "current-password"}
                  />
                  <button
                    type="button"
                    className="auth-pass-toggle"
                    onClick={() => setShowPass(p => !p)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="auth-msg auth-msg-error">
                  <span>⚠</span> {error}
                </div>
              )}
              {success && (
                <div className="auth-msg auth-msg-success">
                  <span>✓</span> {success}
                </div>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="auth-spinner" />
                ) : mode === "login" ? (
                  "Sign In →"
                ) : (
                  "Create Account →"
                )}
              </button>
            </form>

            <div className="auth-switch">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}
              <button onClick={switchMode} className="auth-switch-btn">
                {mode === "login" ? "Create one" : "Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

        .auth-root {
          min-height: 100vh;
          background: #f5f4f0;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Background effects ── */
        .auth-bg-grid {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: linear-gradient(rgba(14,14,20,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(14,14,20,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .auth-orb {
          position: fixed; border-radius: 50%; filter: blur(100px);
          pointer-events: none; z-index: 0;
        }
        .auth-orb-1 {
          width: 700px; height: 700px; top: -250px; right: -150px;
          background: radial-gradient(circle, rgba(255,77,28,0.12), transparent 70%);
          animation: auth-float 12s ease-in-out infinite;
        }
        .auth-orb-2 {
          width: 500px; height: 500px; bottom: -150px; left: -100px;
          background: radial-gradient(circle, rgba(232,160,32,0.1), transparent 70%);
          animation: auth-float 15s ease-in-out infinite reverse;
        }
        .auth-orb-3 {
          width: 300px; height: 300px; top: 40%; left: 50%;
          background: radial-gradient(circle, rgba(255,77,28,0.06), transparent 70%);
          animation: auth-float 10s ease-in-out infinite 2s;
        }
        @keyframes auth-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }

        /* ── Container ── */
        .auth-container {
          position: relative; z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-width: 1040px;
          width: 92%;
          min-height: 620px;
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(14,14,20,0.08);
          border-radius: 24px;
          box-shadow: 0 24px 80px rgba(14,14,20,0.1), 0 2px 8px rgba(14,14,20,0.04);
          overflow: hidden;
          animation: auth-card-in 0.5s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes auth-card-in {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Brand panel (left) ── */
        .auth-brand {
          background: linear-gradient(145deg, #0e0e14 0%, #1c1c28 50%, #0e0e14 100%);
          padding: 48px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .auth-brand::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 30%, rgba(255,77,28,0.12), transparent 60%),
                      radial-gradient(circle at 80% 80%, rgba(232,160,32,0.08), transparent 50%);
          pointer-events: none;
        }
        .auth-brand-inner { position: relative; z-index: 1; }

        .auth-brand-logo {
          display: flex; align-items: center; gap: 8px; margin-bottom: 32px;
        }
        .auth-logo-mark {
          font-size: 22px; color: #ff4d1c;
          animation: auth-spin 8s linear infinite; display: inline-block;
        }
        @keyframes auth-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .auth-logo-text {
          font-family: 'Syne', sans-serif;
          font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.5px;
        }
        .auth-logo-text em { font-style: normal; color: #ff4d1c; }
        .auth-logo-ai {
          font-size: 9px; font-weight: 700; background: #ff4d1c; color: #fff;
          padding: 2px 6px; border-radius: 4px; letter-spacing: 0.08em; margin-top: -8px;
        }

        .auth-brand-title {
          font-family: 'Syne', sans-serif;
          font-size: 32px; font-weight: 800; color: #fff;
          line-height: 1.2; letter-spacing: -0.5px; margin-bottom: 16px;
        }
        .auth-brand-sub {
          font-size: 14px; color: rgba(255,255,255,0.55);
          line-height: 1.7; margin-bottom: 36px;
        }

        .auth-features { display: flex; flex-direction: column; gap: 16px; }
        .auth-feature {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 12px 14px; border-radius: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.06);
          transition: background 0.2s;
        }
        .auth-feature:hover { background: rgba(255,255,255,0.08); }
        .auth-feature-icon { font-size: 18px; margin-top: 1px; }
        .auth-feature-title { font-size: 13px; font-weight: 600; color: #fff; }
        .auth-feature-desc { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 2px; }

        /* ── Form panel (right) ── */
        .auth-form-panel {
          padding: 48px 44px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .auth-form-card {
          animation: auth-form-in 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes auth-form-in {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .auth-form-header { margin-bottom: 32px; }
        .auth-form-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px; font-weight: 800; color: #0e0e14;
          letter-spacing: -0.5px;
        }
        .auth-form-sub {
          font-size: 14px; color: #9494a8; margin-top: 6px;
        }

        .auth-form { display: flex; flex-direction: column; gap: 18px; }

        .auth-field {
          animation: auth-field-in 0.3s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes auth-field-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .auth-label {
          display: block; font-size: 11px; font-weight: 700; color: #5a5a6e;
          text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;
        }

        .auth-input-wrap {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.9);
          border: 1.5px solid rgba(14,14,20,0.1);
          border-radius: 12px; padding: 0 14px;
          transition: all 0.2s;
        }
        .auth-input-wrap:focus-within {
          border-color: #ff4d1c;
          box-shadow: 0 0 0 3px rgba(255,77,28,0.1);
          background: #fff;
        }
        .auth-input-icon { font-size: 14px; opacity: 0.5; flex-shrink: 0; }

        .auth-input {
          flex: 1; padding: 13px 0; border: none; background: transparent;
          font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0e0e14;
          outline: none;
        }
        .auth-input::placeholder { color: #9494a8; }

        .auth-pass-toggle {
          background: none; border: none; cursor: pointer;
          font-size: 16px; padding: 4px; opacity: 0.5;
          transition: opacity 0.2s;
        }
        .auth-pass-toggle:hover { opacity: 0.8; }

        /* ── Messages ── */
        .auth-msg {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; border-radius: 10px;
          font-size: 13px; font-weight: 500;
          animation: auth-field-in 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .auth-msg-error {
          background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;
        }
        .auth-msg-success {
          background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a;
        }

        /* ── Submit button ── */
        .auth-submit {
          width: 100%; padding: 14px 24px; margin-top: 4px;
          background: linear-gradient(135deg, #0e0e14 0%, #1c1c28 100%);
          color: #fff; border: none; border-radius: 12px;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700;
          cursor: pointer; transition: all 0.25s; position: relative;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          letter-spacing: -0.2px;
        }
        .auth-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(14,14,20,0.2);
        }
        .auth-submit:active { transform: translateY(0); }
        .auth-submit:disabled {
          opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: none;
        }

        .auth-spinner {
          width: 20px; height: 20px;
          border: 2.5px solid rgba(255,255,255,0.2);
          border-top-color: #fff; border-radius: 50%;
          animation: auth-spin-fast 0.6s linear infinite;
        }
        @keyframes auth-spin-fast { to { transform: rotate(360deg); } }

        /* ── Switch mode ── */
        .auth-switch {
          text-align: center; margin-top: 24px;
          font-size: 13px; color: #9494a8;
        }
        .auth-switch-btn {
          background: none; border: none; cursor: pointer;
          color: #ff4d1c; font-weight: 700; font-size: 13px;
          margin-left: 4px; text-decoration: none;
          transition: color 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .auth-switch-btn:hover { color: #e03a0f; text-decoration: underline; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .auth-container {
            grid-template-columns: 1fr;
            max-width: 460px;
            min-height: auto;
          }
          .auth-brand { display: none; }
          .auth-form-panel { padding: 36px 28px; }
          .auth-form-title { font-size: 22px; }
        }

        @media (max-width: 480px) {
          .auth-root { padding: 16px; }
          .auth-container { width: 100%; border-radius: 18px; }
          .auth-form-panel { padding: 28px 20px; }
        }
      `}</style>
    </div>
  );
}
