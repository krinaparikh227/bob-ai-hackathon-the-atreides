# Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- [ ] Python 3.10+
- [ ] Node.js 18+
- [ ] PostgreSQL 14+
- [ ] An IBM Cloud account with watsonx.ai access

## Environment Variables

Copy `.env.example` to `.env` in the `src/` directory and fill in the values:

```bash
cd src
cp .env.example .env
```

| Variable | Description | Required |
|---|---|---|
| `WATSONX_API_KEY` | Your IBM watsonx.ai API key | Yes |
| `WATSONX_PROJECT_ID` | Your watsonx.ai project ID | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/krinaparikh227/bob-ai-hackathon-the-atreides.git
cd bob-ai-hackathon-the-atreides

# 2. Install backend dependencies
cd src/backend
pip install -r requirements.txt

# 3. Install frontend dependencies
cd ../frontend
npm install

# 4. Set up the database
cd ../backend
python manage.py migrate
```

## Running the Application

```bash
# Start the backend (from src/backend)
uvicorn main:app --reload

# Start the frontend (in a separate terminal, from src/frontend)
npm run dev
```

The application will be available at: `http://localhost:3000`
The backend API documentation is available at: `http://localhost:8000/docs`

## Running Tests

```bash
cd src/backend
pytest tests/ -v
```

## Quick Demo (Optional)

If you have a demo script or sample data to showcase the project quickly:

```bash
python src/backend/seed_demo_data.py
```

## Troubleshooting

| Issue | Solution |
|---|---|
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` again |
| Database connection refused | Ensure PostgreSQL is running and `DATABASE_URL` is correct |
| watsonx.ai 401 error | Check `WATSONX_API_KEY` in your `.env` file |
