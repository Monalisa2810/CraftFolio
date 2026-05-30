import { useState } from "react";
import { fetchFromServer } from "../api";

export default function AIAssistant({ data, setData, next, prev }) {
  const [loading, setLoading] = useState({
    summary: false, objective: false, skills: false, ats: false,
  });
  const [errors, setErrors] = useState({
    summary: null, objective: null, skills: null, ats: null,
  });
  const [suggestions, setSuggestions] = useState([]);
  const [ats, setAts] = useState(null);
  const [activeCard, setActiveCard] = useState("summary");

  const setL = (k, v) => setLoading((l) => ({ ...l, [k]: v }));
  const setE = (k, v) => setErrors((e) => ({ ...e, [k]: v }));

  const genSummary = async () => {
    setL("summary", true);
    setE("summary", null);
    const result = await fetchFromServer("generate-summary", { profileData: data });
    if (result?.text) {
      setData({ ...data, summary: result.text });
    } else {
      setE("summary", "Failed to generate summary. Make sure the backend server is running.");
    }
    setL("summary", false);
  };

  const genObjective = async () => {
    setL("objective", true);
    setE("objective", null);
    const result = await fetchFromServer("generate-objective", { profileData: data });
    if (result?.text) {
      setData({ ...data, objective: result.text });
    } else {
      setE("objective", "Failed to generate objective. Make sure the backend server is running.");
    }
    setL("objective", false);
  };

  const genSkills = async () => {
    setL("skills", true);
    setE("skills", null);
    const result = await fetchFromServer("suggest-skills", { skills: data.skills });
    if (result?.suggestions) {
      setSuggestions(result.suggestions);
    } else {
      setE("skills", "Failed to get skill suggestions. Make sure the backend server is running.");
    }
    setL("skills", false);
  };

  const runATS = async () => {
    setL("ats", true);
    setE("ats", null);
    const result = await fetchFromServer("ats-score", { profileData: data });
    if (result?.score) {
      setAts(result);
    } else {
      setE("ats", "Failed to analyze resume. Make sure the backend server is running.");
    }
    setL("ats", false);
  };

  const addSuggestion = (s) => {
    if (!data.skills.includes(s)) setData({ ...data, skills: [...data.skills, s] });
  };

  const CARDS = [
    { id: "summary", label: "Summary", icon: "◉" },
    { id: "objective", label: "Objective", icon: "◈" },
    { id: "skills", label: "Skills AI", icon: "✦" },
    { id: "ats", label: "ATS Score", icon: "⬡" },
  ];

  return (
    <div>
      <div className="cf-section-header">
        <div className="cf-section-eyebrow">Step 02</div>
        <h1 className="cf-section-title">Let AI do the heavy lifting</h1>
        <p className="cf-section-sub">
          Generate a professional summary, check your ATS score, and get skill recommendations.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="df-tabs" style={{ marginBottom: 24 }}>
        {CARDS.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCard(c.id)}
            className={`df-tab ${activeCard === c.id ? "df-tab-active" : ""}`}
          >
            <span>{c.icon}</span> {c.label}
          </button>
        ))}
      </div>

      {/* Summary */}
      {activeCard === "summary" && (
        <div className="cf-card">
          <div className="cf-card-head">
            <div>
              <div className="cf-card-title">Professional Summary</div>
              <div className="cf-card-sub">3 sentences that make recruiters read on</div>
            </div>
            <AIButton onClick={genSummary} loading={loading.summary} label="Generate Summary" />
          </div>
          <div className="cf-card-body">
            {!data.summary && !loading.summary && !errors.summary && (
              <div className="ai-empty">
                <div className="ai-empty-icon">◈</div>
                <div className="ai-empty-text">Click Generate to create a summary from your profile data</div>
              </div>
            )}
            {loading.summary && <AILoading text="Crafting your professional story..." />}
            {errors.summary && !loading.summary && <AIError message={errors.summary} onRetry={genSummary} />}
            {data.summary && !loading.summary && (
              <div>
                <div className="ai-result-badge">✨ AI Generated - edit as needed</div>
                <textarea
                  className="cf-textarea ai-textarea"
                  value={data.summary}
                  onChange={(e) => setData({ ...data, summary: e.target.value })}
                />
                <div className="ai-char-count">{data.summary.length} characters · {data.summary.split(" ").length} words</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Objective */}
      {activeCard === "objective" && (
        <div className="cf-card">
          <div className="cf-card-head">
            <div>
              <div className="cf-card-title">Career Objective</div>
              <div className="cf-card-sub">For freshers - replaces summary on resume</div>
            </div>
            <AIButton onClick={genObjective} loading={loading.objective} label="Generate Objective" />
          </div>
          <div className="cf-card-body">
            {!data.objective && !loading.objective && !errors.objective && (
              <div className="ai-empty">
                <div className="ai-empty-icon">◎</div>
                <div className="ai-empty-text">Click Generate to create a targeted career objective</div>
              </div>
            )}
            {loading.objective && <AILoading text="Writing your career objective..." />}
            {errors.objective && !loading.objective && <AIError message={errors.objective} onRetry={genObjective} />}
            {data.objective && !loading.objective && (
              <div>
                <div className="ai-result-badge">✨ AI Generated - edit as needed</div>
                <textarea
                  className="cf-textarea ai-textarea"
                  value={data.objective}
                  onChange={(e) => setData({ ...data, objective: e.target.value })}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Skill suggestions */}
      {activeCard === "skills" && (
        <div className="cf-card">
          <div className="cf-card-head">
            <div>
              <div className="cf-card-title">AI Skill Recommendations</div>
              <div className="cf-card-sub">Based on your existing skill set</div>
            </div>
            <AIButton onClick={genSkills} loading={loading.skills} label="Get Suggestions" />
          </div>
          <div className="cf-card-body">
            {/* Current skills */}
            {data.skills.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div className="cf-label" style={{ marginBottom: 10 }}>Your current skills</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {data.skills.map((s) => (
                    <span key={s} className="cf-skill-tag">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {!suggestions.length && !loading.skills && !errors.skills && (
              <div className="ai-empty">
                <div className="ai-empty-icon">✦</div>
                <div className="ai-empty-text">AI will suggest complementary skills based on your profile</div>
              </div>
            )}
            {loading.skills && <AILoading text="Analyzing your tech stack..." />}
            {errors.skills && !loading.skills && <AIError message={errors.skills} onRetry={genSkills} />}
            {suggestions.length > 0 && !loading.skills && (
              <div>
                <div className="cf-label" style={{ marginBottom: 12 }}>Suggested skills - click to add</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => addSuggestion(s)}
                      className={`cf-chip ${data.skills.includes(s) ? "cf-chip-added" : "cf-chip-default"}`}
                    >
                      {data.skills.includes(s) ? "✓ " : "+ "}{s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ATS Score */}
      {activeCard === "ats" && (
        <div className="cf-card">
          <div className="cf-card-head">
            <div>
              <div className="cf-card-title">ATS Score Analyzer</div>
              <div className="cf-card-sub">Check how well your resume passes automated screening</div>
            </div>
            <AIButton onClick={runATS} loading={loading.ats} label="Analyze Resume" />
          </div>
          <div className="cf-card-body">
            {!ats && !loading.ats && !errors.ats && (
              <div className="ai-empty">
                <div className="ai-empty-icon">⬡</div>
                <div className="ai-empty-text">Run the analysis to get your ATS compatibility score</div>
              </div>
            )}
            {loading.ats && <AILoading text="Scanning your resume against ATS algorithms..." />}
            {errors.ats && !loading.ats && <AIError message={errors.ats} onRetry={runATS} />}
            {ats && !loading.ats && (
              <div>
                {/* Score display */}
                <div className="ats-result-header">
                  <div className="ats-gauge-wrap">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle className="ats-track" cx="60" cy="60" r="50" />
                      <circle
                        className="ats-fill"
                        cx="60" cy="60" r="50"
                        style={{
                          stroke: ats.score >= 80 ? "#22c55e" : ats.score >= 60 ? "#f59e0b" : "#ef4444",
                          strokeDasharray: `${2 * Math.PI * 50}`,
                          strokeDashoffset: `${2 * Math.PI * 50 * (1 - ats.score / 100)}`,
                          transform: "rotate(-90deg)", transformOrigin: "60px 60px",
                        }}
                      />
                      <text x="60" y="55" textAnchor="middle" style={{ fill: "var(--ink)", fontFamily: "var(--ff-display)", fontSize: 24, fontWeight: 800 }}>{ats.score}</text>
                      <text x="60" y="72" textAnchor="middle" style={{ fill: "var(--text3)", fontFamily: "var(--ff-body)", fontSize: 11 }}>/ 100</text>
                    </svg>
                    <div className="ats-grade" style={{ color: ats.score >= 80 ? "#22c55e" : ats.score >= 60 ? "#f59e0b" : "#ef4444" }}>
                      {ats.grade}
                    </div>
                  </div>

                  {/* Breakdown bars */}
                  {ats.breakdown && (
                    <div className="ats-breakdown">
                      {Object.entries(ats.breakdown).map(([k, v]) => (
                        <div key={k} className="ats-bar-row">
                          <div className="ats-bar-label">{k.charAt(0).toUpperCase() + k.slice(1)}</div>
                          <div className="ats-bar-track">
                            <div className="ats-bar-fill" style={{ width: `${v}%`, background: v >= 80 ? "#22c55e" : v >= 60 ? "#f59e0b" : "#ef4444" }} />
                          </div>
                          <div className="ats-bar-val">{v}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Suggestions */}
                <div className="ats-suggestions">
                  <div className="ats-sugg-title">💡 How to improve</div>
                  {ats.suggestions?.map((s, i) => (
                    <div key={i} className="ats-sugg-item">
                      <span className="ats-sugg-num">{String(i + 1).padStart(2, "0")}</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="cf-nav-footer">
        <button className="cf-btn-ghost" onClick={prev}>← Back</button>
        <button className="cf-btn-accent" onClick={next}>Next: Design →</button>
      </div>

      <style>{`
        .ai-empty {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 40px 20px; gap: 12px; color: var(--text3);
        }
        .ai-empty-icon { font-size: 28px; opacity: 0.4; }
        .ai-empty-text { font-size: 14px; text-align: center; }

        .ai-loading { display: flex; align-items: center; gap: 12px; padding: 20px; }
        .ai-spinner {
          width: 20px; height: 20px; border: 2px solid var(--border);
          border-top-color: var(--accent); border-radius: 50%;
          animation: spin 0.7s linear infinite; flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ai-loading-text { font-size: 13px; color: var(--text2); }

        .ai-result-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 700; color: var(--gold);
          background: rgba(232,160,32,0.1); border: 1px solid rgba(232,160,32,0.25);
          padding: 4px 10px; border-radius: 999px; margin-bottom: 12px;
        }
        .ai-textarea { min-height: 100px; font-size: 14px; line-height: 1.7; }
        .ai-char-count { font-size: 11px; color: var(--text3); margin-top: 6px; text-align: right; }

        .ai-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 18px;
          background: linear-gradient(135deg, var(--ink), #2d2d44);
          color: #fff; border: none; border-radius: 9px; cursor: pointer;
          font-family: var(--ff-body); font-size: 13px; font-weight: 700;
          transition: all 0.2s; white-space: nowrap;
        }
        .ai-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(14,14,20,0.25); }
        .ai-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }
        .ai-btn-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }

        .ats-result-header { display: flex; gap: 28px; align-items: flex-start; margin-bottom: 20px; }
        .ats-gauge-wrap { display: flex; flex-direction: column; align-items: center; gap: 6px; flex-shrink: 0; }
        .ats-grade { font-family: var(--ff-display); font-size: 22px; font-weight: 800; }
        .ats-breakdown { flex: 1; display: flex; flex-direction: column; gap: 10px; justify-content: center; }
        .ats-bar-row { display: flex; align-items: center; gap: 10px; }
        .ats-bar-label { font-size: 12px; font-weight: 600; color: var(--text2); width: 100px; flex-shrink: 0; }
        .ats-bar-track { flex: 1; height: 6px; background: var(--surface2); border-radius: 3px; overflow: hidden; }
        .ats-bar-fill { height: 100%; border-radius: 3px; transition: width 1s cubic-bezier(0.4,0,0.2,1); }
        .ats-bar-val { font-size: 12px; font-weight: 700; color: var(--text); width: 28px; text-align: right; }

        .ats-suggestions {
          background: rgba(245,244,240,0.8); border: 1px solid var(--border2);
          border-radius: 12px; padding: 18px;
        }
        .ats-sugg-title { font-family: var(--ff-display); font-size: 14px; font-weight: 700; color: var(--ink); margin-bottom: 14px; }
        .ats-sugg-item { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 10px; font-size: 13px; color: var(--text2); line-height: 1.6; }
        .ats-sugg-num { font-family: var(--ff-display); font-size: 11px; font-weight: 800; color: var(--accent); background: var(--accent-bg); padding: 2px 7px; border-radius: 4px; flex-shrink: 0; margin-top: 1px; }

        .df-tabs {
          display: flex; gap: 6px; flex-wrap: wrap; padding: 6px;
          background: rgba(255,255,255,0.6); border: 1px solid var(--border);
          border-radius: 12px; backdrop-filter: blur(8px);
        }
        .df-tab {
          display: flex; align-items: center; gap: 5px;
          padding: 7px 14px; border-radius: 8px; border: none;
          background: transparent; cursor: pointer;
          font-family: var(--ff-body); font-size: 13px; font-weight: 500;
          color: var(--text2); transition: all 0.15s;
        }
        .df-tab:hover { background: var(--surface2); color: var(--ink); }
        .df-tab-active { background: var(--ink) !important; color: #fff !important; font-weight: 700; }

        .ai-error {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 14px 16px; background: #fef2f2;
          border: 1.5px solid #fecaca; border-radius: 10px; margin-top: 4px;
        }
        .ai-error-icon { font-size: 18px; flex-shrink: 0; }
        .ai-error-text { font-size: 13px; color: #991b1b; line-height: 1.5; flex: 1; }
        .ai-error-retry {
          padding: 6px 14px; background: #ef4444; color: #fff;
          border: none; border-radius: 6px; cursor: pointer;
          font-size: 12px; font-weight: 700; white-space: nowrap;
          transition: all 0.2s; flex-shrink: 0;
        }
        .ai-error-retry:hover { background: #dc2626; transform: translateY(-1px); }
      `}</style>
    </div>
  );
}

function AIButton({ onClick, loading, label }) {
  return (
    <button className="ai-btn" onClick={onClick} disabled={loading}>
      {loading ? <span className="ai-btn-spinner" /> : <span>✨</span>}
      <span>{loading ? "Generating..." : label}</span>
    </button>
  );
}

function AILoading({ text }) {
  return (
    <div className="ai-loading">
      <div className="ai-spinner" />
      <span className="ai-loading-text">{text}</span>
    </div>
  );
}

function AIError({ message, onRetry }) {
  return (
    <div className="ai-error">
      <span className="ai-error-icon">⚠️</span>
      <span className="ai-error-text">{message}</span>
      <button className="ai-error-retry" onClick={onRetry}>Retry</button>
    </div>
  );
}
