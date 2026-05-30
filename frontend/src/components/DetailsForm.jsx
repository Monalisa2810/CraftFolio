import { useState } from "react";

export default function DetailsForm({ data, setData, next }) {
  const [activeSection, setActiveSection] = useState("personal");

  const updPI = (k, v) => setData({ ...data, personalInfo: { ...data.personalInfo, [k]: v } });

  const addItem = (section, template) =>
    setData({ ...data, [section]: [...data[section], { ...template, id: Date.now() }] });

  const removeItem = (section, id) =>
    setData({ ...data, [section]: data[section].filter((x) => x.id !== id) });

  const updItem = (section, id, k, v) =>
    setData({ ...data, [section]: data[section].map((x) => x.id === id ? { ...x, [k]: v } : x) });

  const addSkill = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      const skill = e.target.value.trim();
      if (!data.skills.includes(skill)) setData({ ...data, skills: [...data.skills, skill] });
      e.target.value = "";
    }
  };

  const removeSkill = (s) => setData({ ...data, skills: data.skills.filter((x) => x !== s) });

  const SECTIONS = [
    { id: "personal", label: "Personal", icon: "◉" },
    { id: "education", label: "Education", icon: "◈" },
    { id: "experience", label: "Experience", icon: "✦" },
    { id: "projects", label: "Projects", icon: "⬡" },
    { id: "skills", label: "Skills", icon: "◎" },
    { id: "certifications", label: "Certs", icon: "✧" },
  ];

  const canProceed = data.personalInfo.name.trim() && data.personalInfo.email.trim();

  return (
    <div>
      <div className="cf-section-header">
        <div className="cf-section-eyebrow">Step 01</div>
        <h1 className="cf-section-title">Tell us your story</h1>
        <p className="cf-section-sub">Fill in your details - your resume builds live as you type.</p>
      </div>

      {/* Section tabs */}
      <div className="df-tabs">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`df-tab ${activeSection === s.id ? "df-tab-active" : ""}`}
          >
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      {/* Personal */}
      {activeSection === "personal" && (
        <div className="cf-card">
          <div className="cf-card-head">
            <div>
              <div className="cf-card-title">Personal Information</div>
              <div className="cf-card-sub">How recruiters will contact you</div>
            </div>
          </div>
          <div className="cf-card-body">
            <div className="cf-grid-2">
              <Field label="Full Name *" value={data.personalInfo.name} onChange={(v) => updPI("name", v)} placeholder="Monalisa Das" />
              <Field label="Email *" value={data.personalInfo.email} onChange={(v) => updPI("email", v)} placeholder="monalisa@email.com" />
              <Field label="Phone" value={data.personalInfo.phone} onChange={(v) => updPI("phone", v)} placeholder="+91 98765 43210" />
              <Field label="Location" value={data.personalInfo.location} onChange={(v) => updPI("location", v)} placeholder="Ahmedabad, India" />
              <Field label="LinkedIn URL" value={data.personalInfo.linkedin} onChange={(v) => updPI("linkedin", v)} placeholder="linkedin.com/in/monalisadas" />
              <Field label="GitHub URL" value={data.personalInfo.github} onChange={(v) => updPI("github", v)} placeholder="github.com/monalisadas" />
            </div>
          </div>
        </div>
      )}

      {/* Education */}
      {activeSection === "education" && (
        <div className="cf-card">
          <div className="cf-card-head">
            <div>
              <div className="cf-card-title">Education</div>
              <div className="cf-card-sub">Your academic background</div>
            </div>
            <button className="cf-btn-add" onClick={() => addItem("education", { college: "", degree: "", cgpa: "", year: "" })}>
              + Add More
            </button>
          </div>
          <div className="cf-card-body">
            {data.education.map((e, i) => (
              <div className="cf-entry" key={e.id}>
                <div className="cf-entry-header">
                  <span className="cf-entry-num">Education #{i + 1}</span>
                  {data.education.length > 1 && (
                    <button className="cf-btn-remove" onClick={() => removeItem("education", e.id)}>Remove</button>
                  )}
                </div>
                <div className="cf-grid-2">
                  <Field label="College / University" value={e.college} onChange={(v) => updItem("education", e.id, "college", v)} placeholder="VIT Chennai" />
                  <Field label="Degree & Branch" value={e.degree} onChange={(v) => updItem("education", e.id, "degree", v)} placeholder="B.Tech Computer Science" />
                  <Field label="CGPA / Percentage" value={e.cgpa} onChange={(v) => updItem("education", e.id, "cgpa", v)} placeholder="8.7" />
                  <Field label="Graduation Year" value={e.year} onChange={(v) => updItem("education", e.id, "year", v)} placeholder="2028" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {activeSection === "experience" && (
        <div className="cf-card">
          <div className="cf-card-head">
            <div>
              <div className="cf-card-title">Work Experience</div>
              <div className="cf-card-sub">Internships, jobs, freelance work</div>
            </div>
            <button className="cf-btn-add" onClick={() => addItem("experience", { company: "", role: "", description: "", from: "", to: "" })}>
              + Add More
            </button>
          </div>
          <div className="cf-card-body">
            {data.experience.map((e, i) => (
              <div className="cf-entry" key={e.id}>
                <div className="cf-entry-header">
                  <span className="cf-entry-num">Experience #{i + 1}</span>
                  {data.experience.length > 1 && (
                    <button className="cf-btn-remove" onClick={() => removeItem("experience", e.id)}>Remove</button>
                  )}
                </div>
                <div className="cf-grid-2">
                  <Field label="Company" value={e.company} onChange={(v) => updItem("experience", e.id, "company", v)} placeholder="Google" />
                  <Field label="Role / Title" value={e.role} onChange={(v) => updItem("experience", e.id, "role", v)} placeholder="Software Engineer Intern" />
                  <Field label="From" value={e.from} onChange={(v) => updItem("experience", e.id, "from", v)} placeholder="Jan 2024" />
                  <Field label="To" value={e.to} onChange={(v) => updItem("experience", e.id, "to", v)} placeholder="Jun 2024 / Present" />
                </div>
                <Field
                  label="Description (use • bullets for best ATS results)"
                  value={e.description}
                  onChange={(v) => updItem("experience", e.id, "description", v)}
                  placeholder={"• Built REST APIs with Node.js, reducing latency by 35%\n• Led feature development serving 10K+ daily users"}
                  multiline
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {activeSection === "projects" && (
        <div className="cf-card">
          <div className="cf-card-head">
            <div>
              <div className="cf-card-title">Projects</div>
              <div className="cf-card-sub">Your best technical work</div>
            </div>
            <button className="cf-btn-add" onClick={() => addItem("projects", { title: "", description: "", tech: "", github: "" })}>
              + Add More
            </button>
          </div>
          <div className="cf-card-body">
            {data.projects.map((p, i) => (
              <div className="cf-entry" key={p.id}>
                <div className="cf-entry-header">
                  <span className="cf-entry-num">Project #{i + 1}</span>
                  {data.projects.length > 1 && (
                    <button className="cf-btn-remove" onClick={() => removeItem("projects", p.id)}>Remove</button>
                  )}
                </div>
                <div className="cf-grid-2">
                  <Field label="Project Title" value={p.title} onChange={(v) => updItem("projects", p.id, "title", v)} placeholder="CraftFolio AI" />
                  <Field label="Tech Stack" value={p.tech} onChange={(v) => updItem("projects", p.id, "tech", v)} placeholder="React, Node.js, MongoDB" />
                </div>
                <Field label="GitHub / Live Link" value={p.github} onChange={(v) => updItem("projects", p.id, "github", v)} placeholder="github.com/username/project" />
                <Field label="Description" value={p.description} onChange={(v) => updItem("projects", p.id, "description", v)} placeholder="An AI-powered platform that helps users build professional resumes and generate portfolio websites in one click..." multiline />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {activeSection === "skills" && (
        <div className="cf-card">
          <div className="cf-card-head">
            <div>
              <div className="cf-card-title">Skills</div>
              <div className="cf-card-sub">Type a skill and press Enter</div>
            </div>
          </div>
          <div className="cf-card-body">
            <div className="df-skill-wrap">
              {data.skills.map((s) => (
                <span key={s} className="cf-skill-tag">
                  {s}
                  <button className="cf-skill-remove" onClick={() => removeSkill(s)}>×</button>
                </span>
              ))}
              <input
                className="cf-input df-skill-input"
                placeholder={data.skills.length === 0 ? "React, Python, Docker... (press Enter after each)" : "Add more..."}
                onKeyDown={addSkill}
                style={{ flex: "1 1 180px", minWidth: 180 }}
              />
            </div>
            <p className="df-skill-hint">
              💡 Add 8–12 skills for best ATS performance. Use the AI step to get suggestions.
            </p>
          </div>
        </div>
      )}

      {/* Certifications */}
      {activeSection === "certifications" && (
        <div className="cf-card">
          <div className="cf-card-head">
            <div>
              <div className="cf-card-title">Certifications</div>
              <div className="cf-card-sub">Optional but impressive</div>
            </div>
            <button className="cf-btn-add" onClick={() => addItem("certifications", { name: "", issuer: "", year: "" })}>
              + Add More
            </button>
          </div>
          <div className="cf-card-body">
            {data.certifications.map((c, i) => (
              <div className="cf-entry" key={c.id}>
                <div className="cf-entry-header">
                  <span className="cf-entry-num">Cert #{i + 1}</span>
                  {data.certifications.length > 1 && (
                    <button className="cf-btn-remove" onClick={() => removeItem("certifications", c.id)}>Remove</button>
                  )}
                </div>
                <div className="cf-grid-3">
                  <Field label="Certificate Name" value={c.name} onChange={(v) => updItem("certifications", c.id, "name", v)} placeholder="AWS Solutions Architect" />
                  <Field label="Issuing Body" value={c.issuer} onChange={(v) => updItem("certifications", c.id, "issuer", v)} placeholder="Amazon Web Services" />
                  <Field label="Year" value={c.year} onChange={(v) => updItem("certifications", c.id, "year", v)} placeholder="2024" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="cf-nav-footer">
        <div style={{ fontSize: 13, color: "var(--text3)" }}>
          {!canProceed ? "⚠ Add your name and email to continue" : "✓ Looking good! Ready for AI magic."}
        </div>
        <button className="cf-btn-accent" onClick={next} disabled={!canProceed}>
          Next: AI Magic →
        </button>
      </div>

      <style>{`
        .df-tabs {
          display: flex; gap: 6px; flex-wrap: wrap;
          margin-bottom: 20px; padding: 6px;
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
        .df-skill-wrap {
          display: flex; flex-wrap: wrap; gap: 8px;
          padding: 12px; background: var(--surface); border: 1.5px solid var(--border);
          border-radius: 10px; min-height: 56px; align-items: center;
        }
        .df-skill-input { border: none !important; background: transparent !important; padding: 4px 8px !important; box-shadow: none !important; }
        .df-skill-input:focus { box-shadow: none !important; }
        .df-skill-hint { font-size: 12px; color: var(--text3); margin-top: 10px; line-height: 1.5; }
      `}</style>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, multiline }) {
  return (
    <div className="cf-field">
      <label className="cf-label">{label}</label>
      {multiline ? (
        <textarea className="cf-textarea" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input className="cf-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}
