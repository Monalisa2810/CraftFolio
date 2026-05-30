import { useState } from "react";
import { fetchFromServer } from "../api";

const THEMES = [
  {
    id: "developer",
    label: "Developer",
    icon: "💻",
    desc: "Dark, terminal-inspired, cyan accents",
    preview: <DevPreview />,
  },
  {
    id: "corporate",
    label: "Corporate",
    icon: "🏢",
    desc: "Navy & gold, serif headings, trustworthy",
    preview: <CorpPreview />,
  },
  {
    id: "creative",
    label: "Creative",
    icon: "🎨",
    desc: "Terracotta palette, editorial, bold",
    preview: <CreativePreview />,
  },
];

export default function PortfolioGenerator({ data, prev }) {
  const [theme, setTheme] = useState("developer");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [progress, setProgress] = useState(0);

  const generate = async () => {
    setLoading(true);
    setProgress(0);
    setHtml("");
    setGenerated(false);

    // Fake progress animation
    const interval = setInterval(() => setProgress(p => Math.min(p + 4, 90)), 400);

    const result = await fetchFromServer("generate-portfolio", { resumeData: data, theme });

    clearInterval(interval);
    setProgress(100);

    if (result?.html) {
      setHtml(result.html);
      setGenerated(true);
    }
    setLoading(false);
  };

  const download = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.personalInfo.name?.replace(/\s+/g, "_") || "portfolio"}_craftfolio.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => { setHtml(""); setGenerated(false); setProgress(0); };

  return (
    <div>
      <div className="cf-section-header">
        <div className="cf-section-eyebrow">Step 05</div>
        <h1 className="cf-section-title">One-click portfolio website</h1>
        <p className="cf-section-sub">
          AI generates a complete, deployable HTML portfolio using all your resume data. Download it and host it anywhere for free.
        </p>
      </div>

      {!generated ? (
        <>
          {/* Info banner */}
          <div className="pg-banner">
            <div className="pg-banner-icon">⚡</div>
            <div>
              <div className="pg-banner-title">No PDF upload needed</div>
              <div className="pg-banner-text">We use the data you've already entered — name, skills, projects, experience — to generate a full portfolio site in seconds.</div>
            </div>
          </div>

          {/* Theme picker */}
          <div style={{ marginBottom: 28 }}>
            <div className="cf-label" style={{ marginBottom: 14 }}>Choose a theme</div>
            <div className="pg-themes">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`pg-theme-card ${theme === t.id ? "selected" : ""}`}
                >
                  <div className="pg-theme-thumb">{t.preview}</div>
                  <div className="pg-theme-foot">
                    <div className="pg-theme-icon">{t.icon}</div>
                    <div>
                      <div className="pg-theme-name">{t.label}</div>
                      <div className="pg-theme-desc">{t.desc}</div>
                    </div>
                    {theme === t.id && <div className="pg-theme-check">✓</div>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          {!loading ? (
            <button className="cf-btn-accent pg-generate-btn" onClick={generate}>
              <span>🚀</span> Generate My Portfolio Website
            </button>
          ) : (
            <div className="pg-progress-wrap">
              <div className="pg-progress-header">
                <span className="pg-progress-spinner" />
                <span className="pg-progress-label">AI is crafting your portfolio...</span>
                <span className="pg-progress-pct">{progress}%</span>
              </div>
              <div className="pg-progress-bar">
                <div className="pg-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="pg-progress-steps">
                {["Analyzing your data", "Generating HTML structure", "Applying theme", "Adding animations", "Finalizing output"].map((s, i) => (
                  <div key={s} className={`pg-ps-item ${progress > i * 20 ? "done" : ""}`}>
                    <span>{progress > i * 20 ? "✓" : "○"}</span> {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile summary */}
          <div className="pg-data-summary">
            <div className="cf-card-title" style={{ marginBottom: 12 }}>What will be included</div>
            <div className="pg-data-grid">
              {[
                ["Name", data.personalInfo.name || "—"],
                ["Skills", data.skills.length > 0 ? `${data.skills.length} skills` : "None added"],
                ["Projects", `${data.projects.filter(p => p.title).length} project(s)`],
                ["Experience", `${data.experience.filter(e => e.company).length} entry(ies)`],
                ["Summary", data.summary ? "✓ Written" : "Not generated"],
                ["GitHub", data.personalInfo.github || "—"],
              ].map(([k, v]) => (
                <div key={k} className="pg-data-item">
                  <span className="pg-data-key">{k}</span>
                  <span className="pg-data-val">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Generated view */
        <div>
          <div className="pg-success-bar">
            <div className="pg-success-text">
              <span className="pg-success-icon">🎉</span>
              <div>
                <div className="pg-success-title">Portfolio generated!</div>
                <div className="pg-success-sub">Download the HTML file and deploy it anywhere for free.</div>
              </div>
            </div>
            <div className="pg-success-actions">
              <button className="cf-btn-ghost" onClick={reset}>↺ Regenerate</button>
              <button className="cf-btn-accent" onClick={download}>⬇ Download HTML</button>
            </div>
          </div>

          {/* Browser chrome preview */}
          <div className="pg-browser">
            <div className="pg-browser-bar">
              <div className="pg-browser-dots">
                {["#ef4444", "#f59e0b", "#22c55e"].map(c => (
                  <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                ))}
              </div>
              <div className="pg-browser-url">
                {data.personalInfo.name?.toLowerCase().replace(/\s+/g, "") || "yourname"}.github.io
              </div>
              <div style={{ width: 60 }} />
            </div>
            <iframe
              srcDoc={html}
              className="pg-iframe"
              title="Portfolio Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>

          {/* Deploy guide */}
          <div className="pg-deploy-guide">
            <div className="pg-deploy-title">🌐 Deploy for free in 2 minutes</div>
            <div className="pg-deploy-steps">
              {[
                { platform: "Netlify (Easiest)", steps: "Go to netlify.com/drop → Drag & drop your HTML file → Done. Instant URL." },
                { platform: "GitHub Pages", steps: "Create repo → upload HTML as index.html → Settings → Pages → Deploy from main branch." },
                { platform: "Vercel", steps: "npm i -g vercel → vercel in your project folder → follow prompts → live in 30 seconds." },
              ].map((d, i) => (
                <div key={i} className="pg-deploy-item">
                  <div className="pg-deploy-num">{i + 1}</div>
                  <div>
                    <div className="pg-deploy-platform">{d.platform}</div>
                    <div className="pg-deploy-text">{d.steps}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="cf-nav-footer">
        <button className="cf-btn-ghost" onClick={prev}>← Back to Resume</button>
        <div style={{ fontSize: 13, color: "var(--text3)" }}>
          {generated ? "✓ Portfolio ready to deploy!" : "Your portfolio will be built from your resume data"}
        </div>
      </div>

      <style>{`
        .pg-banner {
          display: flex; gap: 14px; align-items: flex-start;
          padding: 16px 18px; background: rgba(232,160,32,0.08);
          border: 1px solid rgba(232,160,32,0.2); border-radius: 12px;
          margin-bottom: 24px;
        }
        .pg-banner-icon { font-size: 20px; flex-shrink: 0; }
        .pg-banner-title { font-weight: 700; font-size: 14px; color: var(--ink); margin-bottom: 3px; }
        .pg-banner-text { font-size: 13px; color: var(--text2); line-height: 1.5; }

        .pg-themes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .pg-theme-card {
          border: 2px solid var(--border); border-radius: 14px;
          overflow: hidden; cursor: pointer; transition: all 0.2s;
          background: #fff; text-align: left;
        }
        .pg-theme-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: var(--shadow-lg); }
        .pg-theme-card.selected { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(255,77,28,0.1); }
        .pg-theme-thumb { height: 100px; overflow: hidden; }
        .pg-theme-foot { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-top: 1px solid var(--border2); }
        .pg-theme-icon { font-size: 20px; flex-shrink: 0; }
        .pg-theme-name { font-family: var(--ff-display); font-size: 14px; font-weight: 700; color: var(--ink); }
        .pg-theme-desc { font-size: 11px; color: var(--text3); }
        .pg-theme-check { margin-left: auto; width: 20px; height: 20px; background: var(--accent); border-radius: 50%; color: #fff; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; }

        .pg-generate-btn { width: 100%; justify-content: center; padding: 16px; font-size: 15px; margin-bottom: 24px; }

        .pg-progress-wrap { padding: 24px; background: rgba(255,255,255,0.8); border: 1px solid var(--border); border-radius: 14px; margin-bottom: 24px; }
        .pg-progress-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .pg-progress-spinner { width: 16px; height: 16px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .pg-progress-label { font-size: 14px; font-weight: 600; color: var(--ink); flex: 1; }
        .pg-progress-pct { font-family: var(--ff-display); font-size: 14px; font-weight: 800; color: var(--accent); }
        .pg-progress-bar { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; margin-bottom: 16px; }
        .pg-progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--gold)); border-radius: 3px; transition: width 0.4s ease; }
        .pg-progress-steps { display: flex; flex-direction: column; gap: 6px; }
        .pg-ps-item { font-size: 12px; color: var(--text3); display: flex; gap: 8px; transition: color 0.3s; }
        .pg-ps-item.done { color: var(--text2); }

        .pg-data-summary { background: rgba(255,255,255,0.6); border: 1px solid var(--border); border-radius: 12px; padding: 18px; margin-top: 20px; }
        .pg-data-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
        .pg-data-item { display: flex; flex-direction: column; gap: 3px; padding: 10px 12px; background: var(--surface2); border-radius: 8px; }
        .pg-data-key { font-size: 10px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.07em; }
        .pg-data-val { font-size: 13px; font-weight: 600; color: var(--ink); }

        .pg-success-bar { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; margin-bottom: 20px; gap: 16px; }
        .pg-success-text { display: flex; align-items: center; gap: 12px; }
        .pg-success-icon { font-size: 24px; }
        .pg-success-title { font-family: var(--ff-display); font-size: 16px; font-weight: 800; color: #14532d; }
        .pg-success-sub { font-size: 12px; color: #166534; }
        .pg-success-actions { display: flex; gap: 10px; flex-shrink: 0; }

        .pg-browser { border-radius: 12px; overflow: hidden; border: 1.5px solid var(--border); box-shadow: var(--shadow-lg); }
        .pg-browser-bar { background: #f1f3f4; padding: 8px 14px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--border); }
        .pg-browser-dots { display: flex; gap: 5px; }
        .pg-browser-url { flex: 1; background: #fff; border: 1px solid var(--border); border-radius: 6px; padding: 4px 10px; font-size: 11px; color: var(--text2); font-family: monospace; text-align: center; }
        .pg-iframe { width: 100%; height: 520px; border: none; display: block; }

        .pg-deploy-guide { margin-top: 20px; padding: 20px; background: rgba(255,255,255,0.7); border: 1px solid var(--border); border-radius: 12px; }
        .pg-deploy-title { font-family: var(--ff-display); font-size: 15px; font-weight: 800; color: var(--ink); margin-bottom: 16px; }
        .pg-deploy-steps { display: flex; flex-direction: column; gap: 12px; }
        .pg-deploy-item { display: flex; gap: 12px; align-items: flex-start; }
        .pg-deploy-num { width: 22px; height: 22px; border-radius: "50%"; background: var(--accent); color: #fff; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border-radius: 50%; }
        .pg-deploy-platform { font-size: 13px; font-weight: 700; color: var(--ink); margin-bottom: 2px; }
        .pg-deploy-text { font-size: 12px; color: var(--text2); line-height: 1.6; }
      `}</style>
    </div>
  );
}

/* ─── SVG theme thumbnail previews ──────────────────────────────────────── */
function DevPreview() {
  return (
    <svg viewBox="0 0 220 100" width="100%" style={{ display: "block" }}>
      <rect width="220" height="100" fill="#0a0f1e" />
      {[0,1,2,3,4,5].map(i => <line key={i} x1={i*44} y1="0" x2={i*44} y2="100" stroke="#ffffff05" strokeWidth="0.5" />)}
      {[0,1,2,3].map(i => <line key={i} x1="0" y1={i*33} x2="220" y2={i*33} stroke="#ffffff05" strokeWidth="0.5" />)}
      <rect x="14" y="14" width="80" height="7" rx="1.5" fill="#00d4ff" opacity="0.85" />
      <rect x="14" y="25" width="50" height="3.5" rx="1" fill="rgba(255,255,255,0.25)" />
      <rect x="14" y="38" width="180" height="0.5" fill="#00d4ff" opacity="0.25" />
      <rect x="14" y="46" width="30" height="3" rx="1" fill="#00d4ff" opacity="0.5" />
      <rect x="14" y="53" width="100" height="2.5" rx="1" fill="rgba(255,255,255,0.15)" />
      <rect x="14" y="59" width="80" height="2.5" rx="1" fill="rgba(255,255,255,0.1)" />
      <rect x="14" y="68" width="30" height="3" rx="1" fill="#00d4ff" opacity="0.5" />
      <rect x="14" y="75" width="120" height="2.5" rx="1" fill="rgba(255,255,255,0.15)" />
      <rect x="14" y="81" width="90" height="2.5" rx="1" fill="rgba(255,255,255,0.1)" />
      <circle cx="200" cy="16" r="16" fill="rgba(0,212,255,0.06)" />
    </svg>
  );
}

function CorpPreview() {
  return (
    <svg viewBox="0 0 220 100" width="100%" style={{ display: "block" }}>
      <rect width="220" height="100" fill="#fff" />
      <rect x="0" y="0" width="220" height="28" fill="#0f2d5c" />
      <rect x="14" y="8" width="72" height="7" rx="1.5" fill="#fff" opacity="0.9" />
      <rect x="14" y="19" width="48" height="3" rx="1" fill="rgba(255,255,255,0.35)" />
      <rect x="160" y="10" width="46" height="3" rx="1" fill="rgba(201,168,76,0.8)" />
      <rect x="160" y="17" width="36" height="3" rx="1" fill="rgba(255,255,255,0.2)" />
      <rect x="14" y="36" width="60" height="3" rx="1" fill="#c9a84c" opacity="0.75" />
      <rect x="14" y="43" width="185" height="2.5" rx="1" fill="#0f2d5c" opacity="0.18" />
      <rect x="14" y="49" width="150" height="2.5" rx="1" fill="#0f2d5c" opacity="0.13" />
      <rect x="14" y="60" width="60" height="3" rx="1" fill="#c9a84c" opacity="0.75" />
      <rect x="14" y="67" width="185" height="2.5" rx="1" fill="#0f2d5c" opacity="0.18" />
      <rect x="14" y="73" width="130" height="2.5" rx="1" fill="#0f2d5c" opacity="0.13" />
      <rect x="14" y="83" width="60" height="3" rx="1" fill="#c9a84c" opacity="0.75" />
      <rect x="14" y="90" width="100" height="2.5" rx="1" fill="#0f2d5c" opacity="0.18" />
    </svg>
  );
}

function CreativePreview() {
  return (
    <svg viewBox="0 0 220 100" width="100%" style={{ display: "block" }}>
      <rect width="220" height="100" fill="#faf7f2" />
      <rect x="0" y="0" width="220" height="40" fill="#e85d3a" />
      <rect x="14" y="9" width="90" height="10" rx="2" fill="#fff" opacity="0.95" />
      <rect x="14" y="23" width="60" height="4" rx="1" fill="rgba(255,255,255,0.55)" />
      <circle cx="190" cy="20" r="16" fill="rgba(255,255,255,0.1)" />
      <rect x="0" y="40" width="220" height="3" fill="#5a7a5a" opacity="0.4" />
      <rect x="14" y="52" width="36" height="4" rx="1" fill="#5a7a5a" opacity="0.7" />
      <rect x="14" y="60" width="185" height="2.5" rx="1" fill="#3a2a1a" opacity="0.18" />
      <rect x="14" y="66" width="140" height="2.5" rx="1" fill="#3a2a1a" opacity="0.13" />
      <rect x="14" y="76" width="36" height="4" rx="1" fill="#e85d3a" opacity="0.6" />
      <rect x="14" y="84" width="160" height="2.5" rx="1" fill="#3a2a1a" opacity="0.18" />
      <rect x="14" y="90" width="120" height="2.5" rx="1" fill="#3a2a1a" opacity="0.13" />
    </svg>
  );
}
