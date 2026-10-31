# ATM Cash Demand Predictor

A data-driven web application that predicts ATM cash withdrawals using a K-Nearest Neighbors (KNN) machine learning model. The application provides a React dashboard, historical withdrawal visualization, and a FastAPI prediction API.

## Features

- Predict ATM withdrawals using three input features.
- View historical withdrawal trends through interactive charts.
- Process input data using a saved StandardScaler.
- REST API built with FastAPI.
- Interactive frontend built with React and Vite.

## Technology Stack

- **Frontend:** React, Vite, Plotly
- **Backend:** Python, FastAPI
- **Data Processing:** Pandas
- **Machine Learning:** Scikit-learn, KNN Regressor, StandardScaler
- **Dataset:** `atm_cash_demand.csv`

## Project Structure

```text
hcl_project_atm_cash_predictor/
├── app.py
├── convert_dataset.py
├── verify_model.py
├── atm_cash_demand.csv
├── knn_atm_model.pkl
├── atm_scaler.pkl
└── frontend/
    └── src/
        └── App.jsx
```

## Run the Backend

Open a terminal in the project folder and run:

```bash
uvicorn app:app --reload
```

Backend URL: http://127.0.0.1:8000

API documentation: http://127.0.0.1:8000/docs

## Run the Frontend

Open a second terminal and run:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: http://localhost:5173

## Prediction Inputs

The API accepts three numerical features:

- `previous_day`
- `previous_week`
- `weekly_average`

Example request:

```json
{
  "previous_day": 30,
  "previous_week": 35,
  "weekly_average": 32
}
```

Example response:

```json
{
  "predicted_withdrawals": 31.3
}
```

*The example response is from a successful API test. Model evaluation metrics require separate verification.*

## Current Status

The backend prediction endpoint and React dashboard have been tested successfully. Historical withdrawal data is displayed for ATM T1.

**Note:** The saved model and scaler were created using a different scikit-learn version from the currently installed version. Compatibility and reported MAE/RMSE values still require verification before production use.
