# ai-service/routers/questions.py

from fastapi import APIRouter, HTTPException  # pyright: ignore[reportMissingImports]
from models.question_models import (
    QuestionGenerationRequest,
    QuestionGenerationResponse,
    FeedbackGenerationRequest,
    FeedbackGenerationResponse,
)
from services.question_service import QuestionService

router = APIRouter(prefix="/questions", tags=["Question Generation"])
question_service = QuestionService()


@router.post("/generate", response_model=QuestionGenerationResponse)
async def generate_questions(request: QuestionGenerationRequest):
    """
    Generate interview questions based on job role, topic, and experience level
    """
    try:
        if not request.job_role or not request.topic:
            raise HTTPException(
                status_code=400,
                detail="job_role and topic are required"
            )

        if request.num_questions < 1 or request.num_questions > 20:
            raise HTTPException(
                status_code=400,
                detail="num_questions must be between 1 and 20"
            )

        result = question_service.generate_questions(request)
        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/feedback", response_model=FeedbackGenerationResponse)
async def generate_feedback(request: FeedbackGenerationRequest):
    """
    Generate AI feedback for a user's answer
    """
    try:
        result = question_service.generate_feedback(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/topics")
async def get_available_topics():
    """
    Get list of available topics for question generation
    """
    return {
        "topics": [
            "Java Spring Boot",
            "React Frontend",
            "Node.js Backend",
            "Python Django",
            "Data Structures",
            "System Design",
            "DevOps",
            "Machine Learning",
            "Database Design",
            "Microservices",
        ],
        "interview_types": ["TECHNICAL", "BEHAVIORAL", "CODING"],
        "difficulty_levels": ["EASY", "MEDIUM", "HARD"],
        "experience_levels": ["Entry-Level", "Mid-Level", "Senior"],
    }


@router.get("/health")
async def health():
    return {"status": "UP", "service": "question-generation"}