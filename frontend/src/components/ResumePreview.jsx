import { useRef, useState } from "react";

export default function ResumePreview({ data, template, next, prev }) {
  const resumeRef = useRef();
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  const exportPDF = () => {
    setExporting(true);
    setDone(false);

    // 1. Target the exact HTML of the resume
    const printContent = resumeRef.current.innerHTML;

    // 2. Create an iframe — use off-screen positioning instead of display:none
    //    because some browsers block print() on hidden iframes
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.style.top = "-9999px";
    iframe.style.width = "800px";
    iframe.style.height = "1100px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    // 3. Determine background color based on the selected template
    const bgColor = template === "nocturne" ? "#0a0f1e" : "#ffffff";

    // 4. Write content to the iframe
    const iframeDoc = iframe.contentWindow.document;
    
    // Include Google Fonts link in the head so typography remains perfect
    iframeDoc.write(`
      <html>
        <head>
          <title>${data.personalInfo.name?.replace(/\s+/g, "_") || "Resume"}_CraftFolio</title>
          <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap" rel="stylesheet">
          <style>
            /* Essential print styles */
            body { 
              margin: 0; 
              padding: 0; 
              background-color: ${bgColor}; 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important; 
            }
            @page { size: A4 portrait; margin: 0; }
          </style>
        </head>
        <body>
          <div style="width: 100%; max-width: 800px; margin: 0 auto;">
            ${printContent}
          </div>
        </body>
      </html>
    `);
    
    iframeDoc.close();

    // 5. Wait for fonts to load, then trigger Print
    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.error("Print error:", err);
      }
      
      // Cleanup after the print dialog is closed
      setTimeout(() => {
        if (iframe.parentNode) document.body.removeChild(iframe);
        setExporting(false);
        setDone(true);
      }, 1500);
    }, 1000); 
  };

  return (
    <div>
      <div className="cf-section-header">
        <div className="cf-section-eyebrow">Step 04</div>
        <h1 className="cf-section-title">Your resume, perfected</h1>
        <p className="cf-section-sub">Live preview — every change you make is reflected instantly.</p>
      </div>

      <div className="rp-layout">
        {/* Sidebar controls */}
        <div className="rp-controls">
          <div className="cf-card" style={{ marginBottom: 0 }}>
            <div className="cf-card-head">
              <div className="cf-card-title">Export</div>
            </div>
            <div className="cf-card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                className="cf-btn-accent"
                onClick={exportPDF}
                disabled={exporting}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {exporting ? (
                  <><span className="ai-btn-spinner" style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Exporting...</>
                ) : (
                  <><span>↓</span> Download PDF</>
                )}
              </button>
              {done && (
                <div style={{ padding: "8px 12px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#15803d", textAlign: "center" }}>
                  ✓ PDF saved!
                </div>
              )}
              <div style={{ fontSize: 11, color: "var(--text3)", lineHeight: 1.5, borderTop: "1px solid var(--border2)", paddingTop: 10 }}>
                High-res 2.5× scale export, A4 format, multi-page support
              </div>
            </div>
          </div>

          <div className="cf-card" style={{ marginBottom: 0, marginTop: 16 }}>
            <div className="cf-card-head"><div className="cf-card-title">Checklist</div></div>
            <div className="cf-card-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["Name & email", !!data.personalInfo.name],
                ["Phone number", !!data.personalInfo.phone],
                ["LinkedIn", !!data.personalInfo.linkedin],
                ["GitHub", !!data.personalInfo.github],
                ["Summary / Objective", !!(data.summary || data.objective)],
                ["Education", data.education.some(e => e.college)],
                ["Skills added", data.skills.length >= 5],
                ["Projects", data.projects.some(p => p.title)],
              ].map(([label, ok]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <span style={{ color: ok ? "#22c55e" : "var(--text3)", fontWeight: 700 }}>{ok ? "✓" : "○"}</span>
                  <span style={{ color: ok ? "var(--text)" : "var(--text3)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resume canvas */}
        <div className="rp-canvas">
          <div className="rp-paper-wrap">
            <div className="rp-paper" ref={resumeRef}>
              {template === "orbital" && <TemplateOrbital data={data} />}
              {template === "axiom" && <TemplateAxiom data={data} />}
              {template === "nocturne" && <TemplateNocturne data={data} />}
            </div>
          </div>
        </div>
      </div>

      <div className="cf-nav-footer">
        <button className="cf-btn-ghost" onClick={prev}>← Back</button>
        <button className="cf-btn-accent" onClick={next}>Next: Build Portfolio →</button>
      </div>

      <style>{`
        .rp-layout { display: grid; grid-template-columns: 220px 1fr; gap: 20px; align-items: start; }
        .rp-controls { position: sticky; top: 84px; }
        .rp-canvas { background: #e8e7e3; border-radius: 16px; padding: 24px; min-height: 400px; overflow: auto; }
        .rp-paper-wrap { display: flex; justify-content: center; }
        .rp-paper { width: 100%; max-width: 680px; background: #fff; box-shadow: 0 8px 40px rgba(0,0,0,0.2); }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) { .rp-layout { grid-template-columns: 1fr; } .rp-controls { position: static; } }
      `}</style>
    </div>
  );
}

/* ─── Template: Orbital ──────────────────────────────────────────────────── */
function TemplateOrbital({ data }) {
  const { personalInfo: pi, summary, objective, skills, education, experience, projects, certifications } = data;
  const contact = [pi.email, pi.phone, pi.location].filter(Boolean).join("  ·  ");
  const links = [pi.linkedin, pi.github].filter(Boolean).join("  ·  ");
  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: 11.5, color: "#1a1a2e", lineHeight: 1.55, background: "#fff" }}>
      {/* Header */}
      <div style={{ background: "#0e0e14", color: "#fff", padding: "22px 30px 18px" }}>
        <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.4px", fontFamily: "sans-serif" }}>{pi.name || "Your Name"}</div>
        {contact && <div style={{ fontSize: 10.5, color: "#a0a0c0", marginTop: 5, letterSpacing: "0.02em" }}>{contact}</div>}
        {links && <div style={{ fontSize: 10, color: "#606080", marginTop: 3 }}>{links}</div>}
      </div>
      <div style={{ padding: "18px 30px" }}>
        {/* Summary */}
        {(summary || objective) && (
          <div style={{ marginBottom: 16, padding: "10px 14px", borderLeft: "3px solid #ff4d1c", background: "#fdf9f8", fontSize: 11, lineHeight: 1.7, color: "#2a2a3e" }}>
            {summary || objective}
          </div>
        )}
        {/* Education */}
        {education.some(e => e.college) && (
          <Section title="EDUCATION">
            {education.filter(e => e.college).map(e => (
              <div key={e.id} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, fontSize: 12, fontFamily: "sans-serif" }}>{e.college}</span>
                  <span style={{ fontSize: 10, color: "#666" }}>{e.year}</span>
                </div>
                <div style={{ fontSize: 11, color: "#444" }}>{e.degree}{e.cgpa ? ` · CGPA ${e.cgpa}` : ""}</div>
              </div>
            ))}
          </Section>
        )}
        {/* Skills */}
        {skills.length > 0 && (
          <Section title="SKILLS">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {skills.map(s => (
                <span key={s} style={{ padding: "3px 10px", background: "#f0f0f5", border: "1px solid #e0e0ea", borderRadius: 999, fontSize: 10.5, fontFamily: "sans-serif", color: "#0e0e14" }}>{s}</span>
              ))}
            </div>
          </Section>
        )}
        {/* Experience */}
        {experience.some(e => e.company) && (
          <Section title="EXPERIENCE">
            {experience.filter(e => e.company).map(e => (
              <div key={e.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700, fontSize: 12, fontFamily: "sans-serif" }}>{e.role}</span>
                  <span style={{ fontSize: 10, color: "#666" }}>{e.from}{e.to ? ` – ${e.to}` : ""}</span>
                </div>
                <div style={{ fontSize: 11, color: "#444", marginBottom: 4, fontFamily: "sans-serif" }}>{e.company}</div>
                {e.description && <div style={{ fontSize: 11, color: "#555", whiteSpace: "pre-line", lineHeight: 1.65 }}>{e.description}</div>}
              </div>
            ))}
          </Section>
        )}
        {/* Projects */}
        {projects.some(p => p.title) && (
          <Section title="PROJECTS">
            {projects.filter(p => p.title).map(p => (
              <div key={p.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700, fontSize: 12, fontFamily: "sans-serif" }}>{p.title}</span>
                  {p.tech && <span style={{ fontSize: 10, color: "#888" }}>{p.tech}</span>}
                </div>
                {p.github && <div style={{ fontSize: 10, color: "#ff4d1c" }}>{p.github}</div>}
                {p.description && <div style={{ fontSize: 11, color: "#555", lineHeight: 1.6 }}>{p.description}</div>}
              </div>
            ))}
          </Section>
        )}
        {/* Certs */}
        {certifications.some(c => c.name) && (
          <Section title="CERTIFICATIONS">
            {certifications.filter(c => c.name).map(c => (
              <div key={c.id} style={{ marginBottom: 5, fontSize: 11 }}>
                <span style={{ fontWeight: 600, fontFamily: "sans-serif" }}>{c.name}</span>
                {c.issuer && <span style={{ color: "#666" }}> · {c.issuer}</span>}
                {c.year && <span style={{ color: "#888" }}> · {c.year}</span>}
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

/* ─── Template: Axiom ────────────────────────────────────────────────────── */
function TemplateAxiom({ data }) {
  const { personalInfo: pi, summary, objective, skills, education, experience, projects, certifications } = data;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", fontFamily: "sans-serif", fontSize: 11, color: "#1a1a2e", background: "#fff", minHeight: 600 }}>
      {/* Left sidebar */}
      <div style={{ background: "#0f2d5c", color: "#fff", padding: "24px 16px" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, marginBottom: 14 }}>
          {(pi.name || "?")[0].toUpperCase()}
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.2, marginBottom: 4 }}>{pi.name || "Your Name"}</div>
        <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.55)", marginBottom: 16, lineHeight: 1.7 }}>
          {[pi.email, pi.phone, pi.location, pi.linkedin, pi.github].filter(Boolean).map((v, i) => <div key={i}>{v}</div>)}
        </div>
        {skills.length > 0 && (
          <div>
            <SidebarSection title="SKILLS">
              {skills.map(s => <div key={s} style={{ marginBottom: 3, fontSize: 10.5, color: "rgba(255,255,255,0.75)" }}>{s}</div>)}
            </SidebarSection>
          </div>
        )}
        {certifications.some(c => c.name) && (
          <SidebarSection title="CERTS">
            {certifications.filter(c => c.name).map(c => <div key={c.id} style={{ marginBottom: 3, fontSize: 10, color: "rgba(255,255,255,0.65)" }}>{c.name}</div>)}
          </SidebarSection>
        )}
      </div>
      {/* Right content */}
      <div style={{ padding: "24px 22px" }}>
        {(summary || objective) && (
          <div style={{ marginBottom: 16, fontSize: 11, lineHeight: 1.75, color: "#333", borderBottom: "1px solid #e8e8f0", paddingBottom: 14 }}>
            {summary || objective}
          </div>
        )}
        {experience.some(e => e.company) && (
          <Section title="EXPERIENCE" accent="#c9a84c">
            {experience.filter(e => e.company).map(e => (
              <div key={e.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ fontSize: 12 }}>{e.role}</strong>
                  <span style={{ fontSize: 10, color: "#888" }}>{e.from}{e.to ? ` – ${e.to}` : ""}</span>
                </div>
                <div style={{ color: "#555", marginBottom: 3 }}>{e.company}</div>
                {e.description && <div style={{ color: "#666", whiteSpace: "pre-line", fontSize: 10.5 }}>{e.description}</div>}
              </div>
            ))}
          </Section>
        )}
        {projects.some(p => p.title) && (
          <Section title="PROJECTS" accent="#c9a84c">
            {projects.filter(p => p.title).map(p => (
              <div key={p.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ fontSize: 12 }}>{p.title}</strong>
                  {p.tech && <span style={{ fontSize: 10, color: "#888" }}>{p.tech}</span>}
                </div>
                {p.description && <div style={{ color: "#666", fontSize: 10.5, lineHeight: 1.6 }}>{p.description}</div>}
              </div>
            ))}
          </Section>
        )}
        {education.some(e => e.college) && (
          <Section title="EDUCATION" accent="#c9a84c">
            {education.filter(e => e.college).map(e => (
              <div key={e.id} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ fontSize: 12 }}>{e.college}</strong>
                  <span style={{ fontSize: 10, color: "#888" }}>{e.year}</span>
                </div>
                <div style={{ color: "#555" }}>{e.degree}{e.cgpa ? ` · CGPA ${e.cgpa}` : ""}</div>
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

/* ─── Template: Nocturne ─────────────────────────────────────────────────── */
function TemplateNocturne({ data }) {
  const { personalInfo: pi, summary, objective, skills, education, experience, projects, certifications } = data;
  const contact = [pi.email, pi.phone, pi.location].filter(Boolean).join("  |  ");
  return (
    <div style={{ fontFamily: "'Courier New', 'Courier', monospace", fontSize: 11, color: "#c8d8e8", background: "#0a0f1e", lineHeight: 1.6 }}>
      {/* Background grid via inline style is subtle */}
      <div style={{ padding: "20px 26px 16px", borderBottom: "1px solid rgba(0,212,255,0.2)" }}>
        <div style={{ color: "#00d4ff", fontSize: 22, fontWeight: 900, letterSpacing: "0.04em" }}>{`> ${pi.name || "YOUR_NAME"}`}</div>
        {contact && <div style={{ color: "#546e7a", fontSize: 10, marginTop: 5 }}>{contact}</div>}
        {(pi.linkedin || pi.github) && <div style={{ fontSize: 10, color: "#37474f" }}>{[pi.linkedin, pi.github].filter(Boolean).join("  |  ")}</div>}
      </div>
      <div style={{ padding: "14px 26px" }}>
        {(summary || objective) && (
          <div style={{ marginBottom: 14, padding: "8px 12px", borderLeft: "2px solid #00d4ff", background: "rgba(0,212,255,0.04)", fontSize: 11, color: "#90a4ae", lineHeight: 1.75 }}>
            {summary || objective}
          </div>
        )}
        {skills.length > 0 && (
          <NocSection title="SKILLS">
            <div style={{ color: "#78909c" }}>{skills.join("  ·  ")}</div>
          </NocSection>
        )}
        {experience.some(e => e.company) && (
          <NocSection title="EXPERIENCE">
            {experience.filter(e => e.company).map(e => (
              <div key={e.id} style={{ marginBottom: 10, background: "rgba(255,255,255,0.02)", padding: "8px 10px", borderRadius: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#e0e8f0", fontWeight: 700 }}>{e.role}</span>
                  <span style={{ color: "#455a64", fontSize: 10 }}>{e.from}{e.to ? ` → ${e.to}` : ""}</span>
                </div>
                <div style={{ color: "#546e7a" }}>{e.company}</div>
                {e.description && <div style={{ color: "#607d8b", whiteSpace: "pre-line", fontSize: 10.5, marginTop: 3 }}>{e.description}</div>}
              </div>
            ))}
          </NocSection>
        )}
        {projects.some(p => p.title) && (
          <NocSection title="PROJECTS">
            {projects.filter(p => p.title).map(p => (
              <div key={p.id} style={{ marginBottom: 10, background: "rgba(255,255,255,0.02)", padding: "8px 10px", borderRadius: 4 }}>
                <span style={{ color: "#e0e8f0", fontWeight: 700 }}>{p.title}</span>
                {p.tech && <span style={{ color: "#455a64" }}> [{p.tech}]</span>}
                {p.github && <div style={{ color: "#00d4ff", fontSize: 10 }}>{p.github}</div>}
                {p.description && <div style={{ color: "#607d8b", fontSize: 10.5, marginTop: 3 }}>{p.description}</div>}
              </div>
            ))}
          </NocSection>
        )}
        {education.some(e => e.college) && (
          <NocSection title="EDUCATION">
            {education.filter(e => e.college).map(e => (
              <div key={e.id} style={{ marginBottom: 6 }}>
                <span style={{ color: "#e0e8f0", fontWeight: 700 }}>{e.college}</span>
                <span style={{ color: "#546e7a" }}> · {e.degree}{e.cgpa ? ` · CGPA ${e.cgpa}` : ""} · {e.year}</span>
              </div>
            ))}
          </NocSection>
        )}
        {certifications.some(c => c.name) && (
          <NocSection title="CERTIFICATIONS">
            {certifications.filter(c => c.name).map(c => (
              <div key={c.id} style={{ marginBottom: 4, color: "#78909c" }}>
                <span style={{ color: "#b0bec5" }}>{c.name}</span>
                {c.issuer && <span> · {c.issuer}</span>}
                {c.year && <span> · {c.year}</span>}
              </div>
            ))}
          </NocSection>
        )}
      </div>
    </div>
  );
}

function Section({ title, children, accent = "#ff4d1c" }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        fontSize: 10, fontWeight: 800, letterSpacing: "0.12em",
        color: accent, borderBottom: `1.5px solid ${accent}`,
        paddingBottom: 3, marginBottom: 8, fontFamily: "sans-serif",
      }}>{title}</div>
      {children}
    </div>
  );
}

function SidebarSection({ title, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", marginBottom: 6, textTransform: "uppercase" }}>{title}</div>
      {children}
    </div>
  );
}

function NocSection({ title, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#00d4ff", opacity: 0.7, marginBottom: 8 }}>## {title}</div>
      {children}
    </div>
  );
}
