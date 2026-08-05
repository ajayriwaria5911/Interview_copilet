# ai-service/services/ats_service.py

import os
import re
from typing import List, Tuple
from models.ats_models import AtsAnalysisRequest, AtsAnalysisResponse

# Common tech skills database
TECH_SKILLS = [
    "python", "java", "javascript", "typescript", "react", "angular",
    "vue", "spring", "spring boot", "node.js", "express", "django",
    "flask", "fastapi", "sql", "mongodb", "postgresql", "mysql",
    "redis", "docker", "kubernetes", "aws", "azure", "gcp", "git",
    "ci/cd", "rest api", "graphql", "microservices", "html", "css",
    "tailwind", "linux", "agile", "scrum", "machine learning",
    "deep learning", "tensorflow", "pytorch", "pandas", "numpy",
    "data analysis", "data science", "nlp", "computer vision"
]

# Required resume sections
REQUIRED_SECTIONS = [
    "experience", "education", "skills", "projects",
    "achievements", "certifications", "summary", "objective"
]

# Action verbs for strong resume
ACTION_VERBS = [
    "developed", "implemented", "designed", "built", "created",
    "managed", "led", "optimized", "improved", "increased",
    "reduced", "delivered", "launched", "architected", "deployed"
]


class AtsService:

    def analyze_resume(self, request: AtsAnalysisRequest) -> AtsAnalysisResponse:
        text = request.resume_text.lower()

        # Step 1 — Detect skills
        matched_skills = self._detect_skills(text)

        # Step 2 — Detect sections
        matched_sections, missing_sections = self._detect_sections(text)

        # Step 3 — Keyword matching with job description
        matched_keywords, missing_keywords = self._match_keywords(
            text, request.job_description, matched_skills, matched_sections
        )

        # Step 4 — Calculate score
        score = self._calculate_score(
            matched_skills, matched_sections,
            text, request.job_description
        )

        # Step 5 — Detect experience level
        experience_level = self._detect_experience_level(text)

        # Step 6 — Generate suggestions
        suggestions = self._generate_suggestions(
            matched_sections, missing_sections,
            matched_skills, score, text
        )

        # Step 7 — Identify strengths and weaknesses
        strengths = self._identify_strengths(matched_skills, matched_sections, text)
        weaknesses = self._identify_weaknesses(missing_sections, matched_skills, score)

        # Step 8 — Generate summary
        summary = self._generate_summary(score, len(matched_skills), experience_level)

        return AtsAnalysisResponse(
            score=round(score, 2),
            matched_keywords=matched_keywords,
            missing_keywords=missing_keywords[:10],
            suggestions=suggestions,
            summary=summary,
            experience_level=experience_level,
            strengths=strengths,
            weaknesses=weaknesses
        )

    def _detect_skills(self, text: str) -> List[str]:
        return [skill for skill in TECH_SKILLS if skill in text]

    def _detect_sections(self, text: str) -> Tuple[List[str], List[str]]:
        matched = []
        missing = []
        for section in REQUIRED_SECTIONS:
            if section in text:
                matched.append(section)
            else:
                missing.append(section)
        return matched, missing

    def _match_keywords(
        self,
        text: str,
        job_description: str,
        matched_skills: List[str],
        matched_sections: List[str]
    ) -> Tuple[List[str], List[str]]:

        matched_keywords = list(matched_skills) + matched_sections

        if job_description:
            jd_lower = job_description.lower()
            jd_words = set(re.findall(r'\b\w+\b', jd_lower))
            resume_words = set(re.findall(r'\b\w+\b', text))

            jd_keywords = [
                w for w in jd_words
                if len(w) > 3 and w not in ['with', 'this', 'that', 'have', 'will']
            ]

            for keyword in jd_keywords:
                if keyword in resume_words and keyword not in matched_keywords:
                    matched_keywords.append(keyword)

            missing_keywords = [
                k for k in jd_keywords
                if k not in resume_words and k not in matched_keywords
            ][:10]
        else:
            missing_skills = [s for s in TECH_SKILLS if s not in matched_skills][:10]
            missing_keywords = missing_skills

        return matched_keywords, missing_keywords

    def _calculate_score(
        self,
        matched_skills: List[str],
        matched_sections: List[str],
        text: str,
        job_description: str
    ) -> float:

        # Section score (30%)
        section_score = (len(matched_sections) / len(REQUIRED_SECTIONS)) * 30

        # Skills score (40%)
        skill_score = min((len(matched_skills) / 10) * 40, 40)

        # Action verbs score (15%)
        action_count = sum(1 for verb in ACTION_VERBS if verb in text)
        action_score = min((action_count / 5) * 15, 15)

        # Job description match score (15%)
        jd_score = 0
        if job_description:
            jd_lower = job_description.lower()
            jd_words = set(re.findall(r'\b\w+\b', jd_lower))
            resume_words = set(re.findall(r'\b\w+\b', text))
            if jd_words:
                match_ratio = len(jd_words & resume_words) / len(jd_words)
                jd_score = match_ratio * 15
        else:
            jd_score = 10

        total = section_score + skill_score + action_score + jd_score
        return min(total, 100)

    def _detect_experience_level(self, text: str) -> str:
        if any(x in text for x in ["10+ years", "senior", "lead", "architect", "principal"]):
            return "Senior"
        elif any(x in text for x in ["5+ years", "mid-level", "intermediate", "3+ years"]):
            return "Mid-Level"
        elif any(x in text for x in ["fresher", "graduate", "intern", "entry", "0-2 years"]):
            return "Entry-Level"
        return "Mid-Level"

    def _generate_suggestions(
        self,
        matched_sections: List[str],
        missing_sections: List[str],
        matched_skills: List[str],
        score: float,
        text: str
    ) -> List[str]:

        suggestions = []

        if "summary" not in matched_sections and "objective" not in matched_sections:
            suggestions.append("Add a compelling professional summary at the top")

        if "achievements" not in matched_sections:
            suggestions.append("Include quantifiable achievements with numbers and metrics")

        if "certifications" not in matched_sections:
            suggestions.append("Add relevant certifications to strengthen your profile")

        if len(matched_skills) < 5:
            suggestions.append("Add more technical skills relevant to your target role")

        action_count = sum(1 for verb in ACTION_VERBS if verb in text)
        if action_count < 3:
            suggestions.append("Use strong action verbs like 'developed', 'implemented', 'led'")

        if score < 60:
            suggestions.append("Use more industry-standard keywords throughout your resume")
            suggestions.append("Tailor your resume specifically for the target job description")

        if score < 80:
            suggestions.append("Quantify your achievements with specific numbers and percentages")

        suggestions.append("Keep resume to 1-2 pages for optimal ATS performance")
        suggestions.append("Use standard section headings that ATS systems recognize")

        return suggestions[:8]

    def _identify_strengths(
        self,
        matched_skills: List[str],
        matched_sections: List[str],
        text: str
    ) -> List[str]:

        strengths = []

        if len(matched_skills) >= 8:
            strengths.append(f"Strong technical skill set with {len(matched_skills)} skills detected")

        if "experience" in matched_sections:
            strengths.append("Work experience section is present and structured")

        if "education" in matched_sections:
            strengths.append("Educational background is clearly mentioned")

        if "projects" in matched_sections:
            strengths.append("Projects section demonstrates practical experience")

        action_count = sum(1 for verb in ACTION_VERBS if verb in text)
        if action_count >= 3:
            strengths.append("Uses strong action verbs effectively")

        if not strengths:
            strengths.append("Resume has basic structure in place")

        return strengths

    def _identify_weaknesses(
        self,
        missing_sections: List[str],
        matched_skills: List[str],
        score: float
    ) -> List[str]:

        weaknesses = []

        if missing_sections:
            weaknesses.append(f"Missing sections: {', '.join(missing_sections[:3])}")

        if len(matched_skills) < 5:
            weaknesses.append("Insufficient technical skills mentioned")

        if score < 60:
            weaknesses.append("Low keyword density for ATS optimization")

        if "achievements" in missing_sections:
            weaknesses.append("No quantifiable achievements mentioned")

        return weaknesses