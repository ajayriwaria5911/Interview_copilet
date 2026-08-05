# ai-service/models/ats_models.py

from pydantic import BaseModel
from typing import List, Optional

class AtsAnalysisRequest(BaseModel):
    resume_text: str
    job_description: Optional[str] = None
    target_role: Optional[str] = None

class AtsAnalysisResponse(BaseModel):
    score: float
    matched_keywords: List[str]
    missing_keywords: List[str]
    suggestions: List[str]
    summary: str
    experience_level: str
    strengths: List[str]
    weaknesses: List[str]

class KeywordExtractionRequest(BaseModel):
    text: str

class KeywordExtractionResponse(BaseModel):
    keywords: List[str]
    skills: List[str]
    experience_level: str