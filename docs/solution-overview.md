# Solution Overview

## What We Built

We built a dual-mode IBM Bob solution specifically designed to handle the massive data complexities in the pharmaceutical lifecycle. It acts as both a **Drug Safety Signal Detector** and a **Regulatory Submission Readiness Checker**. 

## How It Works

**Mode 1: Signal Detection**
1. The system ingests structured and unstructured adverse event reports from the FDA's FAERS database.
2. watsonx.ai is used to cluster similar unstructured narratives and map them to standardized medical dictionaries (MedDRA).
3. The backend calculates the Proportional Reporting Ratio (PRR) for drug-event pairs to statistically flag emerging safety signals.
4. Alerts are surfaced via the IBM Bob conversational interface for pharmacovigilance teams to review.

**Mode 2: Submission Readiness**
1. Users upload their draft CTD (Common Technical Document) dossier outlines.
2. The system parses the 5 modules and checks the hierarchy and presence of sections against strict ICH M4 CTD requirements.
3. The backend scores the completeness of each module.
4. A detailed, actionable gap report is generated, highlighting exactly which required sections are missing or structurally invalid.

## Architecture Diagram

> See [`architecture.md`](architecture.md) for the detailed diagram.

```
[User] → [React Frontend] → [IBM Bob Interface] → [FastAPI Backend] → [watsonx.ai]
                                                        ↓
                                       [FAERS DB & CTD Rules (PostgreSQL)]
```

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Dual-mode architecture | Both problems (pharmacovigilance and regulatory submission) share the same root challenge: processing overwhelming amounts of complex text. Combining them showcases the versatility of the AI engine. |
| PRR Statistical Calculation | PRR is an industry-standard method for disproportionate reporting analysis; pairing it with AI clustering vastly reduces false positives. |
| IBM Bob as the core UI | Allows users to simply ask "What are the gaps in Module 3?" or "Show me emerging signals for Drug X" rather than navigating complex analytical dashboards. |

## IBM Technologies Used

- **watsonx.ai:** Used to perform NLP clustering on unstructured FAERS adverse event narratives and to parse complex structural rules for the CTD dossiers.
- **IBM Bob:** Serves as the natural language interface, allowing users to query signal detection statistics and request gap reports seamlessly.
