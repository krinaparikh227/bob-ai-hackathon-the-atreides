# 🚀 Atreides Food Recommendation System

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | The Atreides |
| **Track** | AI |
| **Team Lead** | Lead Name — lead@example.com |
| **Members** | Member One, Member Two |

---

## 🎯 Problem Statement

Users struggle to find personalized food recommendations that align with their specific dietary needs and preferences. This leads to decision fatigue and poor nutritional choices, making it difficult to maintain a healthy lifestyle.

---

## 💡 Solution

We built an ML-powered food recommendation engine that uses watsonx.ai to analyze user preferences and generate highly personalized meal suggestions. The system learns from feedback to continuously improve its accuracy and provides an intuitive natural language interface via IBM Bob.

---

## ✨ Key Features

- **Feature 1:** Personalized meal recommendations based on user profiles
- **Feature 2:** Natural language interaction using IBM Bob
- **Feature 3:** Real-time dietary restriction filtering
- **Feature 4:** Nutritional analysis powered by watsonx.ai

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | Python, JavaScript |
| **Frameworks** | FastAPI, React |
| **IBM Technologies** | watsonx.ai, IBM Bob |
| **Databases** | PostgreSQL |
| **Other** | Docker |

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
# Assuming backend in src/backend
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

- Authentication is currently mocked for the hackathon demo.
- The recipe database is limited to North American cuisine.
- Model latency can spike during cold starts.

---

## 🏅 What We're Most Proud Of

We are most proud of the seamless integration with watsonx.ai, which allows for complex reasoning over user dietary constraints in real-time, providing immediate and highly relevant meal suggestions.

---
