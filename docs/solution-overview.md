# Solution Overview

## What We Built

We built the Atreides Food Recommendation System, an intelligent dietary assistant that helps users discover meals tailored to their specific health goals, taste preferences, and dietary restrictions. The system uses natural language processing to understand complex user requests and machine learning to rank the best food options available.

## How It Works

1. User creates a profile specifying dietary restrictions (e.g., vegan, gluten-free) and health goals.
2. User interacts with the system via a natural language chat interface (powered by IBM Bob) to request meal ideas or specify current cravings/constraints (e.g., "I need a quick high-protein lunch under 400 calories").
3. The system processes the request and queries a PostgreSQL database of recipes.
4. The watsonx.ai model analyzes the recipes against the user's constraints and scores them for relevance and compliance.
5. The top recommendations are presented to the user, who can provide feedback to improve future suggestions.

## Architecture Diagram

> See [`architecture.md`](architecture.md) for the detailed diagram.

```
[User] → [React Frontend] → [IBM Bob Interface] → [FastAPI Backend] → [watsonx.ai]
                                                        ↓
                                                 [PostgreSQL DB]
```

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Used watsonx.ai for recipe scoring | Pre-trained models provided excellent natural language understanding of complex ingredient lists and dietary rules out-of-the-box. |
| Integrated IBM Bob for conversational UI | Reduced friction for the user; they don't have to fill out complex search forms, just state what they want naturally. |
| FastAPI for the backend | High performance, built-in async support, and auto-generated API documentation (Swagger). |

## IBM Technologies Used

- **watsonx.ai:** Used the Granite series models via the Python SDK to classify ingredient compatibility with dietary constraints and to generate engaging descriptions for the recommended meals.
- **IBM Bob:** Integrated as the primary conversational agent to handle user intent recognition and manage the dialogue flow.
