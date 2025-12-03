# models.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class SleepData(BaseModel):
    """Reprezentuje pojedynczy zapis sesji snu."""
    start_time: datetime = Field(..., description="The start time of the sleep session.")
    end_time: datetime = Field(..., description="The end time of the sleep session.")
    quality_score: int = Field(..., gt=0, le=100, description="A sleep quality score from 1-100.")
    phases: Optional[dict] = Field(None, description="Optional dictionary for sleep phase data (e.g., deep, rem).")

class Insight(BaseModel):
    """Reprezentuje pojedynczy wniosek wygenerowany przez silnik."""
    text: str
    type: str # np. "sleep", "productivity"

class DailyBriefing(BaseModel):
    """Kompletny obiekt dziennego briefingu."""
    mission_for_today: str
    insights_from_yesterday: List[Insight]

