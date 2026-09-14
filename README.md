# 🚀 Drug Safety Signal Detector & Regulatory Submission Readiness Checker

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | The Atreides |
| **Track** | AI |
| **Team Lead** | Krina Parikh — krinaparikh227@gmail.com |
| **Members** | Member One, Member Two |

---

## 🎯 Problem Statement

The FDA's FAERS database contains over 20M+ adverse event reports. Historically, signals for dangerous drugs (like Vioxx, which caused 27,000+ heart attacks) were missed due to sheer volume. Separately, drug approval CTD dossiers span 100,000+ pages across 5 modules — a single missing section can cause rejection, costing companies 6–12 months and $50–100M. Both critical problems share the exact same root cause: too much complex data for manual review.

---

## 💡 Solution

We built an IBM Bob-integrated solution with two powerful modes. **(1) Signal Detection:** Automatically clusters adverse event reports and calculates Proportional Reporting Ratio (PRR) statistics to flag emerging safety signals. **(2) Submission Readiness:** Automatically checks a dossier outline against ICH M4 CTD requirements, scores completeness per module, and generates an actionable gap report.

---

## ✨ Key Features

- **Feature 1:** Automated clustering of adverse event reports from the FAERS database.
- **Feature 2:** Proportional Reporting Ratio (PRR) statistical calculation for early signal detection.
- **Feature 3:** Automated dossier outline verification against ICH M4 CTD requirements.
- **Feature 4:** Completeness scoring and gap report generation per CTD module.
- **Feature 5:** Natural language conversational interface via IBM Bob for data interaction.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | Python, JavaScript |
| **Frameworks** | FastAPI, React |
| **IBM Technologies** | watsonx.ai, IBM Bob |
| **Databases** | PostgreSQL |
| **Other** | Docker, Pandas, Scikit-Learn |

---

## 📁 Repository Structure

```
├── src/                  # All source code
├── docs/                 # Written documentation
│   ├── problem-statement.md
│   ├── solution-overview.md
│   ├── architecture.md
│   └── setup-guide.md
├── demo/                 # Demo artifacts
│   ├── screenshots/      # App screenshots
│   └── demo-video-link.txt  # Link to demo video
├── presentation/         # Slide deck
└── submission.yaml       # Structured submission metadata
```

---

## ⚡ How to Run

```bash
# 1. Clone the repo
git clone https://github.com/krinaparikh227/bob-ai-hackathon-the-atreides.git
cd bob-ai-hackathon-the-atreides

# 2. Install dependencies
cd src/backend
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env with your values

# 4. Run the project
uvicorn main:app --reload
```

---

## 🖥️ Demo

| Artifact | Link |
|---|---|
| 📹 Demo Video | [See demo/demo-video-link.txt](demo/demo-video-link.txt) |
| 🌐 Live Demo | [See demo/live-demo-url.txt](demo/live-demo-url.txt) |
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/slides.pdf](presentation/) |

---

## ⚠️ Known Limitations

- The dossier checking currently focuses on structure and outline completeness against ICH M4 CTD, but does not yet deep-read the full textual content of all 100,000+ pages for semantic contradictions.
- PRR calculations are computationally heavy and currently unoptimized for the full 20M+ FAERS dataset in real-time.

---

## 🏅 What We're Most Proud Of

We are most proud of effectively combining robust statistical methods (PRR) with advanced NLP (IBM Bob & watsonx.ai) to solve two highly critical, data-heavy problems in the pharmaceutical industry in a single unified interface.

---
