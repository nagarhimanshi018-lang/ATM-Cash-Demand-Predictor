from optimizer import optimize_cash
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.security import OAuth2PasswordBearer
from auth import verify_token
from auth import hash_password, verify_password, create_access_token
from sqlalchemy import text
from database import engine
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
from pathlib import Path

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = verify_token(token)

    if payload is None or payload.get("sub") is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    return payload["sub"]

app = FastAPI(title="ATM Cash Demand Predictor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent

model = joblib.load(BASE_DIR / "knn_atm_model.pkl")
scaler = joblib.load(BASE_DIR / "atm_scaler.pkl")


class ATMInput(BaseModel):
    previous_day: float
    previous_week: float
    weekly_average: float
class RegisterInput(BaseModel):
    username: str
    email: str
    password: str


class LoginInput(BaseModel):
    username: str
    password: str   
@app.get("/")
def home():
    return {"message": "ATM Cash Demand Predictor API is running"}
@app.post("/register")
def register_user(data: RegisterInput):
    with engine.begin() as connection:
        existing_user = connection.execute(
            text("SELECT id FROM users WHERE username = :username"),
            {"username": data.username}
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Username already exists"
            )

        connection.execute(
            text("""
                INSERT INTO users (username, email, hashed_password)
                VALUES (:username, :email, :hashed_password)
            """),
            {
                "username": data.username,
                "email": data.email,
                "hashed_password": hash_password(data.password)
            }
        )

    return {"message": "User registered successfully"}


@app.post("/login")
def login_user(data: OAuth2PasswordRequestForm = Depends()):
    with engine.connect() as connection:
        user = connection.execute(
            text("""
                SELECT id, username, hashed_password
                FROM users
                WHERE username = :username
            """),
            {"username": data.username}
        ).mappings().first()

    if not user or not verify_password(
        data.password, user["hashed_password"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    token = create_access_token({"sub": user["username"]})

    return {
        "access_token": token,
        "token_type": "bearer"
    }
    with engine.connect() as connection:
        user = connection.execute(
            text("""
                SELECT id, username, hashed_password
                FROM users
                WHERE username = :username
            """),
            {"username": data.username}
        ).mappings().first()

    if not user or not verify_password(
        data.password, user["hashed_password"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    token = create_access_token({"sub": user["username"]})

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@app.get("/history")
def get_history():
    query = text("""
        SELECT date, withdrawals
        FROM atm_withdrawals
        WHERE atm_id = 'T1'
          AND withdrawals IS NOT NULL
        ORDER BY date DESC
        LIMIT 30
    """)

    with engine.connect() as connection:
        rows = connection.execute(query).fetchall()

    rows.reverse()

    return {
        "dates": [row.date.strftime("%Y-%m-%d") for row in rows],
        "withdrawals": [round(float(row.withdrawals), 2) for row in rows]
    }


@app.post("/predict")
def predict_demand(
    data: ATMInput,
    current_user: str = Depends(get_current_user)
):
    input_data = pd.DataFrame([{
        "Previous_Day": data.previous_day,
        "Previous_Week": data.previous_week,
        "Weekly_Average": data.weekly_average
    }])

    scaled_data = scaler.transform(input_data)
    prediction = float(model.predict(scaled_data)[0])
    prediction = round(prediction, 2)

    query = text("""
        INSERT INTO prediction_history
        (previous_day, previous_week, weekly_average, predicted_demand)
        VALUES (:previous_day, :previous_week, :weekly_average, :predicted_demand)
    """)

    with engine.begin() as connection:
        connection.execute(query, {
            "previous_day": data.previous_day,
            "previous_week": data.previous_week,
            "weekly_average": data.weekly_average,
            "predicted_demand": prediction
        })

    return {
        "predicted_demand": prediction,
        "message": "Prediction generated and saved successfully"
    }



@app.get("/predictions")
def get_predictions(current_user: str = Depends(get_current_user)):
    query = text("""
        SELECT id, previous_day, previous_week,
               weekly_average, predicted_demand, created_at
        FROM prediction_history
        ORDER BY id DESC
        LIMIT 50
    """)
    with engine.connect() as connection:
        rows = connection.execute(query).mappings().all()

    return [dict(row) for row in rows]


class OptimizationInput(BaseModel):
    predicted_demand: float
    available_cash: float


@app.post("/optimize")
def optimize_atm_cash(
    data: OptimizationInput,
    current_user: str = Depends(get_current_user)
):
    recommended_cash = optimize_cash(
        data.predicted_demand,
        data.available_cash
    )

    if recommended_cash is None:
        raise HTTPException(
            status_code=400,
            detail="Unable to find an optimal cash allocation"
        )

    return {
        "predicted_demand": data.predicted_demand,
        "available_cash": data.available_cash,
        "recommended_cash": recommended_cash
    }