export default function TemplatePicker({ selected, setSelected, next, prev }) {
  const TEMPLATES = [
    {
      id: "orbital",
      name: "Orbital",
      desc: "Modern · Minimal · Clean",
      tag: "Most Popular",
      thumb: <OrbitalThumb />,
    },
    {
      id: "axiom",
      name: "Axiom",
      desc: "Bold · Two-column · Professional",
      tag: "Best for Tech",
      thumb: <AxiomThumb />,
    },
    {
      id: "nocturne",
      name: "Nocturne",
      desc: "Dark · Developer · Terminal",
      tag: "Unique",
      thumb: <NocturneThumb />,
    },
  ];

  return (
    <div>
      <div className="cf-section-header">
        <div className="cf-section-eyebrow">Step 03</div>
        <h1 className="cf-section-title">Choose your visual identity</h1>
        <p className="cf-section-sub">
          Each template is ATS-optimized and designed to impress. Pick the one that fits your industry.
        </p>
      </div>

      <div className="cf-tpl-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(t.id)}
            className={`cf-tpl-card ${selected === t.id ? "selected" : ""}`}
            style={{ cursor: "pointer", textAlign: "left", width: "100%" }}
          >
            <div className="cf-tpl-thumb" style={{ position: "relative" }}>
              {t.thumb}
              {selected === t.id && (
                <div className="cf-tpl-check">✓</div>
              )}
              <div className="tpl-tag">{t.tag}</div>
            </div>
            <div className="cf-tpl-foot">
              <div className="cf-tpl-name">{t.name}</div>
              <div className="cf-tpl-desc">{t.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="tpl-selected-info">
        <div className="tpl-info-label">Selected:</div>
        <div className="tpl-info-name">{TEMPLATES.find((t) => t.id === selected)?.name}</div>
        <div className="tpl-info-desc">{TEMPLATES.find((t) => t.id === selected)?.desc}</div>
      </div>

      <div className="cf-nav-footer">
        <button className="cf-btn-ghost" onClick={prev}>← Back</button>
        <button className="cf-btn-accent" onClick={next}>Next: Preview →</button>
      </div>

      <style>{`
        .tpl-tag {
          position: absolute; bottom: 10px; left: 10px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.06em;
          background: rgba(14,14,20,0.75); color: #fff;
          padding: 3px 8px; border-radius: 4px;
          backdrop-filter: blur(4px);
        }
        .tpl-selected-info {
          display: flex; align-items: center; gap: 10px; margin-top: 20px;
          padding: 14px 18px; background: var(--accent-bg);
          border: 1px solid rgba(255,77,28,0.2); border-radius: 10px;
        }
        .tpl-info-label { font-size: 11px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.08em; }
        .tpl-info-name { font-family: var(--ff-display); font-size: 15px; font-weight: 800; color: var(--ink); }
        .tpl-info-desc { font-size: 12px; color: var(--text3); }
      `}</style>
    </div>
  );
}

function OrbitalThumb() {
  return (
    <svg viewBox="0 0 200 130" width="100%" style={{ display: "block" }}>
      <rect width="200" height="130" fill="#f8f8f6" />
      <rect x="0" y="0" width="200" height="36" fill="#0e0e14" />
      <rect x="14" y="10" width="80" height="8" rx="2" fill="#fff" opacity="0.9" />
      <rect x="14" y="22" width="52" height="4" rx="1" fill="rgba(255,255,255,0.4)" />
      <rect x="155" y="13" width="30" height="4" rx="1" fill="rgba(255,77,28,0.7)" />
      <rect x="155" y="21" width="22" height="4" rx="1" fill="rgba(255,255,255,0.2)" />
      {/* Divider */}
      <rect x="14" y="46" width="172" height="1" fill="#e5e5e0" />
      {/* Skills row */}
      {[0,1,2,3].map(i => <rect key={i} x={14 + i*38} y="52" width="28" height="7" rx="3" fill="#0e0e14" opacity="0.12" />)}
      {/* Experience */}
      <rect x="14" y="68" width="40" height="4" rx="1" fill="#ff4d1c" opacity="0.7" />
      <rect x="14" y="76" width="110" height="3" rx="1" fill="#0e0e14" opacity="0.25" />
      <rect x="14" y="82" width="90" height="3" rx="1" fill="#0e0e14" opacity="0.15" />
      <rect x="14" y="88" width="120" height="3" rx="1" fill="#0e0e14" opacity="0.15" />
      {/* Projects */}
      <rect x="14" y="100" width="36" height="4" rx="1" fill="#ff4d1c" opacity="0.7" />
      <rect x="14" y="108" width="80" height="3" rx="1" fill="#0e0e14" opacity="0.2" />
      <rect x="14" y="114" width="65" height="3" rx="1" fill="#0e0e14" opacity="0.15" />
    </svg>
  );
}

function AxiomThumb() {
  return (
    <svg viewBox="0 0 200 130" width="100%" style={{ display: "block" }}>
      <rect width="200" height="130" fill="#fff" />
      {/* Left sidebar */}
      <rect x="0" y="0" width="64" height="130" fill="#0f2d5c" />
      <circle cx="32" cy="24" r="14" fill="rgba(255,255,255,0.12)" />
      <rect x="16" y="44" width="32" height="4" rx="1" fill="rgba(255,255,255,0.5)" />
      <rect x="20" y="52" width="24" height="3" rx="1" fill="rgba(255,255,255,0.25)" />
      {/* Sidebar skills */}
      {[0,1,2,3,4].map(i => (
        <g key={i}>
          <rect x="10" y={68 + i * 11} width={`${[42,35,38,30,40][i]}`} height="3" rx="1" fill="rgba(255,255,255,0.2)" />
        </g>
      ))}
      {/* Right content */}
      <rect x="76" y="14" width="60" height="6" rx="1.5" fill="#0f2d5c" opacity="0.8" />
      <rect x="76" y="24" width="100" height="3" rx="1" fill="#0f2d5c" opacity="0.3" />
      <rect x="76" y="30" width="80" height="3" rx="1" fill="#0f2d5c" opacity="0.2" />
      <rect x="76" y="46" width="40" height="3" rx="1" fill="#c9a84c" opacity="0.8" />
      <rect x="76" y="54" width="115" height="2.5" rx="1" fill="#0f2d5c" opacity="0.18" />
      <rect x="76" y="60" width="95" height="2.5" rx="1" fill="#0f2d5c" opacity="0.18" />
      <rect x="76" y="70" width="40" height="3" rx="1" fill="#c9a84c" opacity="0.8" />
      <rect x="76" y="78" width="115" height="2.5" rx="1" fill="#0f2d5c" opacity="0.18" />
      <rect x="76" y="84" width="90" height="2.5" rx="1" fill="#0f2d5c" opacity="0.18" />
      <rect x="76" y="94" width="40" height="3" rx="1" fill="#c9a84c" opacity="0.8" />
      <rect x="76" y="102" width="100" height="2.5" rx="1" fill="#0f2d5c" opacity="0.18" />
      <rect x="76" y="108" width="80" height="2.5" rx="1" fill="#0f2d5c" opacity="0.18" />
    </svg>
  );
}

function NocturneThumb() {
  return (
    <svg viewBox="0 0 200 130" width="100%" style={{ display: "block" }}>
      <rect width="200" height="130" fill="#0a0f1e" />
      {/* Grid lines */}
      {[0,1,2,3,4,5].map(i => <line key={`v${i}`} x1={i*40} y1="0" x2={i*40} y2="130" stroke="#ffffff06" strokeWidth="0.5" />)}
      {[0,1,2,3,4,5].map(i => <line key={`h${i}`} x1="0" y1={i*26} x2="200" y2={i*26} stroke="#ffffff06" strokeWidth="0.5" />)}
      {/* Header */}
      <rect x="14" y="12" width="85" height="7" rx="1.5" fill="#00d4ff" opacity="0.9" />
      <rect x="14" y="23" width="55" height="3.5" rx="1" fill="rgba(255,255,255,0.3)" />
      {/* Glowing accent line */}
      <rect x="14" y="35" width="172" height="1" fill="#00d4ff" opacity="0.3" />
      {/* Mono rows */}
      {[
        [14, 42, 40, "#00d4ff", 0.6],
        [14, 50, 100, "white", 0.18],
        [14, 56, 80, "white", 0.13],
        [14, 66, 36, "#00d4ff", 0.6],
        [14, 74, 110, "white", 0.18],
        [14, 80, 85, "white", 0.13],
        [14, 90, 36, "#00d4ff", 0.6],
        [14, 98, 95, "white", 0.18],
        [14, 104, 70, "white", 0.13],
        [14, 114, 36, "#00d4ff", 0.6],
        [14, 122, 75, "white", 0.18],
      ].map(([x, y, w, fill, op], i) => (
        <rect key={i} x={x} y={y} width={w} height="3" rx="1" fill={fill} opacity={op} />
      ))}
      {/* Corner glow */}
      <circle cx="185" cy="15" r="20" fill="rgba(0,212,255,0.07)" />
    </svg>
  );
}
