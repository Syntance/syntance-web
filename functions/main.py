# main.py
from fastapi import FastAPI, HTTPException
from firebase_functions.https_fn import on_request
from firebase_admin import initialize_app, firestore
from typing import List
from datetime import datetime, timedelta

# Importujemy nasze modele danych
# Upewnij się, że plik models.py jest w tym samym folderze
from models import SleepData, DailyBriefing, Insight

# Inicjalizacja Firebase Admin SDK
initialize_app()

# Stworzenie instancji aplikacji FastAPI
app = FastAPI(
    title="Syntance Engine API",
    description="Backend dla aplikacji Syntance, dostarczający inteligentne wnioski.",
    version="1.0.0"
)

# --- API Endpoints ---

@app.get("/hello", summary="Endpoint testowy sprawdzający, czy silnik działa", tags=["Status"])
def hello_world():
    """Zwraca prostą wiadomość o sukcesie."""
    return {"message": "Silnik Syntance działa!"}

@app.post("/users/{user_id}/sleep", summary="Dodaj nowy zapis snu dla użytkownika", status_code=201, tags=["Data"])
def add_sleep_data(user_id: str, data: SleepData):
    """
    Zapisuje nowy rekord danych o śnie do podkolekcji użytkownika w Firestore.
    ID dokumentu to czas rozpoczęcia w formacie ISO dla łatwego sortowania.
    """
    try:
        db = firestore.client()
        doc_id = data.start_time.isoformat()
        db.collection("users").document(user_id).collection("sleep").document(doc_id).set(data.model_dump())
        return {"status": "success", "message": "Dane o śnie zapisane.", "doc_id": doc_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.get("/users/{user_id}/sleep", summary="Pobierz zapisy snu dla użytkownika", response_model=List[SleepData], tags=["Data"])
def get_sleep_data(user_id: str, days: int = 7):
    """
    Pobiera historię snu dla danego użytkownika z Firestore z ostatnich X dni.
    """
    try:
        db = firestore.client()
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        query = db.collection("users").document(user_id).collection("sleep").where("start_time", ">=", start_date).order_by("start_time")
        docs = query.stream()
        
        sleep_history = [SleepData(**doc.to_dict()) for doc in docs]
        return sleep_history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.get("/users/{user_id}/briefing/today", summary="Pobierz dzienny briefing", response_model=DailyBriefing, tags=["Insights"])
def get_daily_briefing(user_id: str):
    """
    Generuje dzienny briefing ('Misja na Dziś' i 'Wnioski z Wczoraj').
    To jest placeholder dla prawdziwego silnika AI.
    """
    # --- TUTAJ W PRZYSZŁOŚCI BĘDZIE MIESZKAĆ PRAWDZIWA INTELIGENCJA ---
    # Logika placeholder dla demonstracji:
    
    # W prawdziwej aplikacji, tutaj pobieralibyśmy dane z Firestore, np.:
    # sleep_data = get_sleep_data(user_id, days=1)
    # calendar_events = fetch_calendar_data(user_id)
    
    sleep_hours = 5.5 
    meeting_count = 6
    
    insights = []
    
    # Prosta logika oparta na regułach, którą zastąpi AI
    if sleep_hours < 6:
        insights.append(Insight(text="Zauważyłem, że spałeś wczoraj bardzo krótko. Pamiętaj o regeneracji.", type="sleep"))
    
    if meeting_count > 4:
        insights.append(Insight(text="Twój wczorajszy kalendarz był wypełniony spotkaniami. To mógł być męczący dzień.", type="productivity"))

    mission = "Dziś masz tylko 2 spotkania. To idealny dzień na pracę w skupieniu."

    return DailyBriefing(mission_for_today=mission, insights_from_yesterday=insights)


# --- Główny Trigger Firebase Functions ---

@on_request()
def syntance_engine(req):
    """
    Główny trigger Firebase Function, który obsługuje całą naszą aplikację FastAPI.
    Wszystkie zapytania do tej funkcji będą przekierowywane do FastAPI.
    """
    return app(req)
