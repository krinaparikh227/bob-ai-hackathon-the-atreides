# Dummy main backend file for validation
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Atreides Food Recommendation System API!"}
