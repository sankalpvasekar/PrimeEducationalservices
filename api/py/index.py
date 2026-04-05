from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExamCategory(BaseModel):
    id: int
    title: str
    subtitle: str
    is_premium: bool = True

EXAM_CATEGORIES = [
    {"id": 1, "title": "UPSC", "subtitle": "(Prelim + Mains Complete Notes)"},
    {"id": 2, "title": "MPSC", "subtitle": "(Prelim + Mains Complete Notes)"},
    {"id": 3, "title": "NEET", "subtitle": "(Complete Study Notes)"},
    {"id": 4, "title": "JEE", "subtitle": "(Complete Study Notes)"},
    {"id": 5, "title": "MH-CET", "subtitle": "(Complete Study Notes)"},
    {"id": 6, "title": "Police Bharti", "subtitle": "(Complete Study Kit)"},
    {"id": 7, "title": "Talathi Bharti", "subtitle": "(Complete Study Kit)"},
    {"id": 8, "title": "AMVI - RTO", "subtitle": "(Pre + Mains Notes)"},
    {"id": 9, "title": "Agniveer", "subtitle": "(Complete Study Notes)"},
    {"id": 10, "title": "SSC", "subtitle": "(CGL, CHSL, MTS)"},
    {"id": 11, "title": "Banking", "subtitle": "(IBPS, SBI, RBI)"},
    {"id": 12, "title": "Railway", "subtitle": "(RRB NTPC, Group-D)"},
    {"id": 13, "title": "Defence", "subtitle": "(NDA, CDS, Army, Navy, Airforce)"},
    {"id": 14, "title": "TET / CTET / Teacher Bharti", "subtitle": ""},
    {"id": 15, "title": "Speaking English", "subtitle": ""},
    {"id": 16, "title": "Business Ideas", "subtitle": "(Startup Ideas)"},
]

@app.get("/api/py/categories", response_model=List[ExamCategory])
def get_categories():
    return EXAM_CATEGORIES

@app.get("/api/py/categories/{category_id}", response_model=ExamCategory)
def get_category(category_id: int):
    category = next((c for c in EXAM_CATEGORIES if c["id"] == category_id), None)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@app.get("/api/py/health")
def health_check():
    return {"status": "ok", "message": "Python API is running successfully"}
