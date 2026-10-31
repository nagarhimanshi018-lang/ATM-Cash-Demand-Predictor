FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN python -m pip install --no-cache-dir -r requirements.txt

COPY app.py .
COPY auth.py .
COPY database.py .
COPY optimizer.py .
COPY knn_atm_model.pkl .
COPY atm_scaler.pkl .

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]