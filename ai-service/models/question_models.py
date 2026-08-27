# ai-service/models/question_models.py

from pydantic import BaseModel  # type: ignore[import-not-found]
from typing import List, Optional

class QuestionGenerationRequest(BaseModel):
    job_role: str
    topic: str
    interview_type: str  # TECHNICAL, BEHAVIORAL, CODING
    experience_level: str  # Entry-Level, Mid-Level, Senior
    num_questions: int = 10
    difficulty: Optional[str] = "MEDIUM"  # EASY, MEDIUM, HARD
    previous_questions: Optional[List[str]] = []

class GeneratedQuestion(BaseModel):
    question_text: str
    expected_answer: str
    difficulty: str
    type: str
    topic: str
    hints: Optional[List[str]] = []
    follow_up: Optional[str] = None

class QuestionGenerationResponse(BaseModel):
    job_role: str
    topic: str
    interview_type: str
    experience_level: str
    questions: List[GeneratedQuestion]
    total_generated: int

class FeedbackGenerationRequest(BaseModel):
    question: str
    user_answer: str
    job_role: str
    interview_type: str
    experience_level: str

class FeedbackGenerationResponse(BaseModel):
    feedback: str
    strengths: List[str]
    weaknesses: List[str]
    improvements: List[str]
    score: float
    model_answer: str