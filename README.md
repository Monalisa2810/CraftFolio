# ✦ CraftFolio AI

> **AI-powered Resume Builder + One-Click Portfolio Generator**
> Build Resume → AI Polish → Export PDF → Generate Portfolio Website

---

## 🗂 Project Structure

```
craftfolio/
├── backend/
│   ├── server.js          # Express API with Anthropic routes
│   ├── package.json
│   └── .env               # Your API key goes here
└── frontend/
    ├── src/
    │   ├── App.jsx                        # Root app, layout, stepper
    │   ├── main.jsx                       # React entry
    │   ├── api.js                         # Centralized API utility
    │   └── components/
    │       ├── DetailsForm.jsx            # Step 1: Personal info, education, etc.
    │       ├── AIAssistant.jsx            # Step 2: Summary, ATS score, skills
    │       ├── TemplatePicker.jsx         # Step 3: Visual template selector
    │       ├── ResumePreview.jsx          # Step 4: Live preview + PDF export
    │       └── PortfolioGenerator.jsx     # Step 5: One-click portfolio
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ⚡ Quick Start

### 1. Clone / unzip the project

```bash
cd craftfolio
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create your `.env` file:
```env
ANTHROPIC_API_KEY=your_api_key_here
PORT=5000
```

Get your API key at: https://console.anthropic.com/

Start the backend:
```bash
npm run dev
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
npm run dev
```

### 4. Open the app

Visit: **http://localhost:5173**

---

## ✨ Features

| Feature | Description |
|---|---|
| **5-Step Wizard** | Guided flow from details → AI → design → preview → portfolio |
| **AI Summary** | Claude generates professional summaries from your profile |
| **AI Objective** | Career objective for freshers |
| **Skill Suggestions** | AI recommends complementary skills |
| **ATS Score Analyzer** | Score + breakdown + improvement tips |
| **3 Resume Templates** | Orbital (minimal), Axiom (two-column), Nocturne (dark) |
| **PDF Export** | High-res 2.5× A4, multi-page support |
| **Portfolio Generator** | Full HTML website in 3 themes, AI-generated |
| **Auto-save** | Data persists in localStorage |

---

## 🤖 AI Endpoints (Backend)

| POST | Description |
|---|---|
| `/api/generate-summary` | Professional summary from profile data |
| `/api/generate-objective` | Career objective for students |
| `/api/suggest-skills` | Skill gap recommendations |
| `/api/ats-score` | ATS score + breakdown + suggestions |
| `/api/generate-portfolio` | Full HTML portfolio site |

---

## 🌐 Deploy Portfolio for Free

Once you download the portfolio HTML:

- **Netlify**: netlify.com/drop → drag & drop → instant URL
- **GitHub Pages**: Upload as `index.html` → Settings → Pages
- **Vercel**: `npx vercel` in the folder

---

## 🎨 Resume Templates

- **Orbital** — Clean, single-column, red accent. Best for most industries.
- **Axiom** — Navy sidebar + gold accents, two-column. Best for corporate/tech.
- **Nocturne** — Dark background, cyan mono. Best for developers.

## 🖼 Portfolio Themes

- **Developer** — Dark, terminal, cyan glows
- **Corporate** — White/navy, serif headings, professional
- **Creative** — Terracotta/sage, editorial, bold typography

---

## 📝 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, vanilla CSS |
| Backend | Node.js, Express |
| AI | Anthropic Claude (claude-opus-4-5) |
| PDF Export | html2canvas + jsPDF (CDN) |
| Storage | Browser localStorage (auto-save) |

---

Built with ✦ by CraftFolio AI
