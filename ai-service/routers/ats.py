# ai-service/routers/ats.py

from fastapi import APIRouter, HTTPException
from models.ats_models import (
    AtsAnalysisRequest,
    AtsAnalysisResponse,
    KeywordExtractionRequest,
    KeywordExtractionResponse
)
from services.ats_service import AtsService
import re

router = APIRouter(prefix="/ats", tags=["ATS Analysis"])
ats_service = AtsService()


@router.post("/analyze", response_model=AtsAnalysisResponse)
async def analyze_resume(request: AtsAnalysisRequest):
    """
    Analyze resume text and return ATS score with detailed feedback
    """
    try:
        if not request.resume_text or len(request.resume_text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Resume text is too short or empty"
            )
        result = ats_service.analyze_resume(request)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/extract-keywords", response_model=KeywordExtractionResponse)
async def extract_keywords(request: KeywordExtractionRequest):
    """
    Extract keywords and skills from text
    """
    try:
        text = request.text.lower()

        from services.ats_service import TECH_SKILLS
        skills = [s for s in TECH_SKILLS if s in text]
        words = re.findall(r'\b[a-z]{4,}\b', text)
        common = {'with', 'this', 'that', 'have', 'will', 'from', 'they', 'been'}
        keywords = list(set([w for w in words if w not in common]))[:20]

        if any(x in text for x in ["senior", "lead", "10+ years"]):
            level = "Senior"
        elif any(x in text for x in ["fresher", "graduate", "intern"]):
            level = "Entry-Level"
        else:
            level = "Mid-Level"

        return KeywordExtractionResponse(
            keywords=keywords,
            skills=skills,
            experience_level=level
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health():
    return {"status": "UP", "service": "ats-analysis"}