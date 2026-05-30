import { useState, useEffect } from "react";
import DetailsForm from "./components/DetailsForm";
import AIAssistant from "./components/AIAssistant";
import TemplatePicker from "./components/TemplatePicker";
import ResumePreview from "./components/ResumePreview";
import PortfolioGenerator from "./components/PortfolioGenerator";
import { fetchFromServer } from "./api";

const STEPS = [
  { id: 0, label: "Your Story", icon: "✦", desc: "Personal details" },
  { id: 1, label: "AI Magic", icon: "◈", desc: "Smart assistance" },
  { id: 2, label: "Design", icon: "◉", desc: "Pick your style" },
  { id: 3, label: "Preview", icon: "◎", desc: "Review & export" },
  { id: 4, label: "Portfolio", icon: "⬡", desc: "One-click website" },
];

const INITIAL_DATA = {
  personalInfo: { name: "", email: "", phone: "", linkedin: "", github: "", location: "" },
  summary: "",
  objective: "",
  education: [{ id: 1, college: "", degree: "", cgpa: "", year: "" }],
  experience: [{ id: 1, company: "", role: "", description: "", from: "", to: "" }],
  projects: [{ id: 1, title: "", description: "", tech: "", github: "" }],
  skills: [],
  certifications: [{ id: 1, name: "", issuer: "", year: "" }],
};

export default function App() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(INITIAL_DATA);
  const [template, setTemplate] = useState("orbital");
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Persist to localStorage
    const saved = localStorage.getItem("craftfolio_data");
    if (saved) {
      try { setData(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem("craftfolio_data", JSON.stringify(data));
  }, [data, mounted]);

  const goTo = (i) => setStep(i);
  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const completedSections = [
    data.personalInfo.name.trim().length > 0,
    data.summary.length > 0 || data.objective.length > 0,
    true,
    true,
    true,
  ];

  const saveToCloud = async () => {
    setSaving(true);
    const res = await fetchFromServer("save-resume", { profileData: data });
    if (res?.success) {
      alert("✅ Resume saved to MongoDB Cloud successfully!");
    } else {
      alert("❌ Failed to save to cloud.");
    }
    setSaving(false);
  };

  return (
    <div className="craftfolio-root">
      {/* Animated background */}
      <div className="bg-grid" />
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      {/* Top nav */}
      <header className="cf-header">
        <div className="cf-logo">
          <span className="cf-logo-mark">✦</span>
          <span className="cf-logo-name">Craft<em>Folio</em></span>
          <span className="cf-logo-badge">AI</span>
        </div>

        <nav className="cf-steps">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              className={`cf-step-btn ${step === i ? "active" : ""} ${completedSections[i] && step !== i ? "done" : ""}`}
            >
              <span className="cf-step-icon">{completedSections[i] && i < step ? "✓" : s.icon}</span>
              <span className="cf-step-label">{s.label}</span>
              {i < STEPS.length - 1 && <span className="cf-step-line" />}
            </button>
          ))}
        </nav>

        <div className="cf-header-right" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span className="cf-save-badge"><span className="cf-dot" /> Auto-saved local</span>
          <button 
            onClick={saveToCloud} 
            disabled={saving}
            style={{ padding: "6px 12px", background: "#0e0e14", color: "#fff", borderRadius: "8px", fontSize: "12px", fontWeight: "bold", border: "none", cursor: "pointer" }}
          >
            {saving ? "Saving..." : "☁️ Save to Cloud"}
          </button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="cf-main">
        {/* Left sidebar — step info */}
        <aside className="cf-sidebar">
          <div className="cf-sidebar-inner">
            <div className="cf-step-hero">
              <div className="cf-step-num">{String(step + 1).padStart(2, "0")}</div>
              <div className="cf-step-info">
                <div className="cf-step-title">{STEPS[step].label}</div>
                <div className="cf-step-sub">{STEPS[step].desc}</div>
              </div>
            </div>

            <div className="cf-progress-track">
              <div className="cf-progress-label">Progress</div>
              <div className="cf-progress-bar">
                <div className="cf-progress-fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
              </div>
              <div className="cf-progress-pct">{Math.round(((step + 1) / STEPS.length) * 100)}%</div>
            </div>

            <div className="cf-sidebar-steps">
              {STEPS.map((s, i) => (
                <button key={s.id} onClick={() => goTo(i)} className={`cf-sidebar-step ${step === i ? "active" : ""} ${i < step ? "done" : ""}`}>
                  <span className="csb-icon">{i < step ? "✓" : s.icon}</span>
                  <div>
                    <div className="csb-name">{s.label}</div>
                    <div className="csb-desc">{s.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="cf-sidebar-tip">
              <div className="cf-tip-icon">💡</div>
              <div className="cf-tip-text">
                {step === 0 && "Fill at least your name and email to get started."}
                {step === 1 && "Use AI to generate a summary — it takes 5 seconds and impresses recruiters."}
                {step === 2 && "Each template is optimized for different industries."}
                {step === 3 && "Your resume auto-updates as you change details."}
                {step === 4 && "The portfolio is a full deployable website you can put on GitHub Pages."}
              </div>
            </div>
          </div>
        </aside>

        {/* Content panel */}
        <section className="cf-content">
          <div className={`cf-panel ${mounted ? "panel-in" : ""}`} key={step}>
            {step === 0 && <DetailsForm data={data} setData={setData} next={next} />}
            {step === 1 && <AIAssistant data={data} setData={setData} next={next} prev={prev} />}
            {step === 2 && <TemplatePicker selected={template} setSelected={setTemplate} next={next} prev={prev} />}
            {step === 3 && <ResumePreview data={data} template={template} next={next} prev={prev} />}
            {step === 4 && <PortfolioGenerator data={data} prev={prev} />}
          </div>
        </section>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink: #0e0e14;
          --ink2: #1c1c28;
          --surface: #f5f4f0;
          --surface2: #eeecea;
          --border: rgba(14,14,20,0.1);
          --border2: rgba(14,14,20,0.06);
          --accent: #ff4d1c;
          --accent2: #ff8c5a;
          --accent-bg: rgba(255,77,28,0.08);
          --gold: #e8a020;
          --text: #0e0e14;
          --text2: #5a5a6e;
          --text3: #9494a8;
          --white: #ffffff;
          --shadow: 0 2px 20px rgba(14,14,20,0.08);
          --shadow-lg: 0 8px 40px rgba(14,14,20,0.12);
          --radius: 12px;
          --radius-lg: 18px;
          --ff-display: 'Syne', sans-serif;
          --ff-body: 'DM Sans', sans-serif;
        }

        .craftfolio-root {
          font-family: var(--ff-body);
          background: var(--surface);
          color: var(--text);
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        /* Background */
        .bg-grid {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: linear-gradient(var(--border2) 1px, transparent 1px),
                            linear-gradient(90deg, var(--border2) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .bg-orb {
          position: fixed; border-radius: 50%; filter: blur(80px);
          pointer-events: none; z-index: 0; opacity: 0.35;
        }
        .bg-orb-1 { width: 600px; height: 600px; top: -200px; right: -100px; background: radial-gradient(circle, #ff4d1c22, transparent 70%); }
        .bg-orb-2 { width: 400px; height: 400px; bottom: -100px; left: -50px; background: radial-gradient(circle, #e8a02018, transparent 70%); }

        /* Header */
        .cf-header {
          position: sticky; top: 0; z-index: 100;
          background: rgba(245,244,240,0.92); backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
          padding: 0 32px;
          display: flex; align-items: center; justify-content: space-between;
          height: 64px; gap: 24px;
        }

        .cf-logo { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .cf-logo-mark { font-size: 18px; color: var(--accent); animation: spin-slow 8s linear infinite; display: inline-block; }
        .cf-logo-name { font-family: var(--ff-display); font-size: 20px; font-weight: 800; color: var(--ink); letter-spacing: -0.5px; }
        .cf-logo-name em { font-style: normal; color: var(--accent); }
        .cf-logo-badge { font-size: 9px; font-weight: 700; background: var(--accent); color: #fff; padding: 2px 6px; border-radius: 4px; letter-spacing: 0.08em; margin-top: -8px; }

        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .cf-steps { display: flex; align-items: center; gap: 0; flex: 1; justify-content: center; }
        .cf-step-btn {
          display: flex; align-items: center; gap: 6px;
          background: none; border: none; cursor: pointer;
          padding: 6px 10px; border-radius: 8px;
          font-family: var(--ff-body); font-size: 13px; font-weight: 500;
          color: var(--text3); transition: all 0.2s; position: relative;
        }
        .cf-step-btn:hover { color: var(--text); background: var(--surface2); }
        .cf-step-btn.active { color: var(--accent); font-weight: 700; background: var(--accent-bg); }
        .cf-step-btn.done { color: var(--text2); }
        .cf-step-icon { font-size: 14px; }
        .cf-step-label { white-space: nowrap; }
        .cf-step-line { width: 20px; height: 1px; background: var(--border); margin-left: 10px; flex-shrink: 0; }

        .cf-header-right { flex-shrink: 0; }
        .cf-save-badge { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text3); background: var(--surface2); padding: 5px 12px; border-radius: 999px; border: 1px solid var(--border); }
        .cf-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; animation: pulse-dot 2s ease-in-out infinite; }
        @keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

        /* Main layout */
        .cf-main {
          display: grid; grid-template-columns: 280px 1fr;
          min-height: calc(100vh - 64px);
          position: relative; z-index: 1;
        }

        /* Sidebar */
        .cf-sidebar {
          border-right: 1px solid var(--border);
          background: rgba(255,255,255,0.5);
          backdrop-filter: blur(8px);
          position: sticky; top: 64px;
          height: calc(100vh - 64px);
          overflow-y: auto;
        }
        .cf-sidebar-inner { padding: 28px 20px; display: flex; flex-direction: column; gap: 24px; }

        .cf-step-hero { display: flex; align-items: flex-start; gap: 12px; }
        .cf-step-num { font-family: var(--ff-display); font-size: 48px; font-weight: 800; color: var(--accent); line-height: 1; opacity: 0.25; }
        .cf-step-info { padding-top: 4px; }
        .cf-step-title { font-family: var(--ff-display); font-size: 18px; font-weight: 700; color: var(--ink); }
        .cf-step-sub { font-size: 12px; color: var(--text3); margin-top: 2px; }

        .cf-progress-track {}
        .cf-progress-label { font-size: 11px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
        .cf-progress-bar { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
        .cf-progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--gold)); border-radius: 2px; transition: width 0.5s cubic-bezier(0.4,0,0.2,1); }
        .cf-progress-pct { font-size: 11px; color: var(--text3); margin-top: 4px; text-align: right; }

        .cf-sidebar-steps { display: flex; flex-direction: column; gap: 4px; }
        .cf-sidebar-step {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          background: none; border: none; cursor: pointer; text-align: left;
          transition: all 0.2s; width: 100%;
        }
        .cf-sidebar-step:hover { background: var(--surface2); }
        .cf-sidebar-step.active { background: var(--accent-bg); }
        .cf-sidebar-step.done .csb-icon { color: #22c55e; }
        .csb-icon { font-size: 14px; color: var(--text3); flex-shrink: 0; margin-top: 1px; }
        .cf-sidebar-step.active .csb-icon { color: var(--accent); }
        .csb-name { font-size: 13px; font-weight: 600; color: var(--text); }
        .cf-sidebar-step.active .csb-name { color: var(--accent); }
        .csb-desc { font-size: 11px; color: var(--text3); margin-top: 1px; }

        .cf-sidebar-tip { background: linear-gradient(135deg, var(--accent-bg), rgba(232,160,32,0.06)); border: 1px solid rgba(255,77,28,0.15); border-radius: 12px; padding: 14px; display: flex; gap: 10px; }
        .cf-tip-icon { font-size: 16px; flex-shrink: 0; }
        .cf-tip-text { font-size: 12px; color: var(--text2); line-height: 1.6; }

        /* Content area */
        .cf-content { padding: 40px 48px; overflow-y: auto; }
        .cf-panel { animation: panel-enter 0.3s cubic-bezier(0.4,0,0.2,1); }
        @keyframes panel-enter {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ─── Shared component styles ─────────────────────────────────── */

        .cf-section-header { margin-bottom: 32px; }
        .cf-section-eyebrow { font-size: 11px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 8px; }
        .cf-section-title { font-family: var(--ff-display); font-size: 28px; font-weight: 800; color: var(--ink); letter-spacing: -0.5px; line-height: 1.2; }
        .cf-section-sub { font-size: 14px; color: var(--text2); margin-top: 6px; line-height: 1.6; }

        /* Card */
        .cf-card {
          background: rgba(255,255,255,0.8); backdrop-filter: blur(8px);
          border: 1px solid var(--border); border-radius: var(--radius-lg);
          overflow: hidden; margin-bottom: 20px;
          box-shadow: var(--shadow);
          transition: box-shadow 0.2s;
        }
        .cf-card:hover { box-shadow: var(--shadow-lg); }
        .cf-card-head {
          padding: 16px 22px; border-bottom: 1px solid var(--border2);
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(255,255,255,0.5);
        }
        .cf-card-title { font-family: var(--ff-display); font-size: 15px; font-weight: 700; color: var(--ink); }
        .cf-card-sub { font-size: 12px; color: var(--text3); margin-top: 2px; }
        .cf-card-body { padding: 20px 22px; }

        /* Inputs */
        .cf-field { margin-bottom: 16px; }
        .cf-label { display: block; font-size: 11px; font-weight: 700; color: var(--text2); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 6px; }
        .cf-input, .cf-textarea {
          width: 100%; padding: 11px 14px;
          background: rgba(255,255,255,0.9);
          border: 1.5px solid var(--border);
          border-radius: 10px; font-family: var(--ff-body); font-size: 14px;
          color: var(--text); outline: none; transition: all 0.2s;
          -webkit-appearance: none;
        }
        .cf-input:focus, .cf-textarea:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(255,77,28,0.1);
          background: #fff;
        }
        .cf-input::placeholder, .cf-textarea::placeholder { color: var(--text3); }
        .cf-textarea { resize: vertical; min-height: 88px; line-height: 1.6; }
        .cf-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
        .cf-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0 14px; }

        /* Buttons */
        .cf-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 24px; background: var(--ink); color: #fff;
          border: none; border-radius: 10px; cursor: pointer;
          font-family: var(--ff-body); font-size: 14px; font-weight: 600;
          transition: all 0.2s; letter-spacing: -0.2px;
        }
        .cf-btn-primary:hover { background: var(--ink2); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(14,14,20,0.2); }
        .cf-btn-primary:active { transform: translateY(0); }

        .cf-btn-accent {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 24px; background: var(--accent); color: #fff;
          border: none; border-radius: 10px; cursor: pointer;
          font-family: var(--ff-body); font-size: 14px; font-weight: 700;
          transition: all 0.2s;
        }
        .cf-btn-accent:hover { background: #e03a0f; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(255,77,28,0.3); }
        .cf-btn-accent:disabled { background: #ccc; cursor: not-allowed; transform: none; box-shadow: none; }

        .cf-btn-ghost {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 18px; background: transparent; color: var(--text2);
          border: 1.5px solid var(--border); border-radius: 10px; cursor: pointer;
          font-family: var(--ff-body); font-size: 14px; font-weight: 500;
          transition: all 0.2s;
        }
        .cf-btn-ghost:hover { border-color: var(--ink); color: var(--ink); background: var(--surface2); }

        .cf-btn-add {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 14px; background: transparent; color: var(--accent);
          border: 1.5px dashed rgba(255,77,28,0.4); border-radius: 8px; cursor: pointer;
          font-family: var(--ff-body); font-size: 13px; font-weight: 600;
          transition: all 0.2s; margin-top: 4px;
        }
        .cf-btn-add:hover { background: var(--accent-bg); border-color: var(--accent); }

        .cf-btn-remove {
          padding: 4px 10px; background: transparent; color: #ef4444;
          border: 1px solid rgba(239,68,68,0.3); border-radius: 6px; cursor: pointer;
          font-size: 12px; font-weight: 600; transition: all 0.2s;
        }
        .cf-btn-remove:hover { background: #fef2f2; border-color: #ef4444; }

        /* Entry block */
        .cf-entry {
          background: rgba(245,244,240,0.6);
          border: 1px solid var(--border2); border-radius: 10px;
          padding: 16px; margin-bottom: 12px; position: relative;
        }
        .cf-entry-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .cf-entry-num { font-family: var(--ff-display); font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.1em; }

        /* Skill tags */
        .cf-skill-tag {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; background: var(--ink); color: #fff;
          border-radius: 999px; font-size: 13px; font-weight: 500;
        }
        .cf-skill-remove { background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.6); font-size: 16px; line-height: 1; padding: 0; }
        .cf-skill-remove:hover { color: #fff; }

        /* Suggestion chips */
        .cf-chip {
          padding: 7px 14px; border-radius: 999px; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; border: 1.5px solid transparent;
        }
        .cf-chip-default { background: var(--surface2); color: var(--text2); border-color: var(--border); }
        .cf-chip-default:hover { border-color: var(--accent); color: var(--accent); }
        .cf-chip-added { background: var(--ink); color: #fff; border-color: var(--ink); }

        /* AI button */
        .cf-btn-ai {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 22px;
          background: linear-gradient(135deg, var(--ink) 0%, #2a2a3e 100%);
          color: #fff; border: none; border-radius: 10px; cursor: pointer;
          font-family: var(--ff-body); font-size: 14px; font-weight: 700;
          transition: all 0.2s; position: relative; overflow: hidden;
        }
        .cf-btn-ai::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, var(--accent), var(--gold));
          opacity: 0; transition: opacity 0.3s;
        }
        .cf-btn-ai:hover::before { opacity: 1; }
        .cf-btn-ai span { position: relative; z-index: 1; }
        .cf-btn-ai:disabled { opacity: 0.6; cursor: not-allowed; }
        .cf-btn-ai:disabled::before { opacity: 0; }

        /* Navigation footer */
        .cf-nav-footer {
          display: flex; justify-content: space-between; align-items: center;
          margin-top: 36px; padding-top: 24px; border-top: 1px solid var(--border);
        }

        /* ATS gauge */
        .ats-ring { transform: rotate(-90deg); }
        .ats-track { fill: none; stroke: var(--border); stroke-width: 8; }
        .ats-fill { fill: none; stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1); }

        /* Template cards */
        .cf-tpl-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .cf-tpl-card {
          border: 2px solid var(--border); border-radius: var(--radius-lg);
          overflow: hidden; cursor: pointer; transition: all 0.25s; background: #fff;
        }
        .cf-tpl-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: var(--shadow-lg); }
        .cf-tpl-card.selected { border-color: var(--accent); box-shadow: 0 0 0 4px rgba(255,77,28,0.12); }
        .cf-tpl-thumb { height: 120px; display: flex; align-items: center; justify-content: center; position: relative; }
        .cf-tpl-check { position: absolute; top: 10px; right: 10px; width: 24px; height: 24px; background: var(--accent); border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
        .cf-tpl-foot { padding: 12px 14px; border-top: 1px solid var(--border2); }
        .cf-tpl-name { font-family: var(--ff-display); font-size: 14px; font-weight: 700; color: var(--ink); }
        .cf-tpl-desc { font-size: 11px; color: var(--text3); margin-top: 2px; }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(14,14,20,0.15); border-radius: 3px; }

        @media (max-width: 1024px) {
          .cf-main { grid-template-columns: 1fr; }
          .cf-sidebar { display: none; }
          .cf-content { padding: 24px 20px; }
          .cf-steps { display: none; }
          .cf-grid-2 { grid-template-columns: 1fr; }
          .cf-grid-3 { grid-template-columns: 1fr; }
          .cf-tpl-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
