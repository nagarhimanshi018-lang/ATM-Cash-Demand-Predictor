# ATM Cash Demand Predictor
An intelligent, data-driven application designed to predict ATM cash demand and support cash allocation decisions using Machine Learning and optimization techniques.

## Project Overview
The ATM Cash Demand Predictor helps estimate future ATM cash requirements using historical withdrawal patterns. It combines a K-Nearest Neighbors (KNN) machine learning model with an interactive dashboard and an optimization module.
The application allows users to log in, generate demand predictions, review prediction history, and receive cash allocation recommendations.

## Key Features
- **User Authentication:** User registration and login with JWT-based authentication.
- **ATM Cash Demand Prediction:** Predicts cash demand using a trained KNN model.
- **Historical Data Analysis:** Displays historical ATM demand trends through visualizations.
- **Prediction History:** Stores and retrieves previous predictions.
- **Cash Allocation Optimization:** Uses Google OR-Tools to recommend cash allocation based on predicted demand and available cash.
- **Model Evaluation:** Displays model performance metrics.
- **Containerized Application:** Runs frontend, backend, and database using Docker Compose.

## Technology Stack
| Component | Technology |
|---|---|
| Frontend | React.js |
| Backend | Python, FastAPI |
| Database | MySQL 8.0 |
| Machine Learning | Scikit-learn, KNN |
| Data Processing | Pandas, NumPy |
| Optimization | Google OR-Tools |
| Authentication | JWT |
| Visualization | Plotly |
| Deployment | Docker, Docker Compose, Nginx |

## Machine Learning Approach
The project uses the K-Nearest Neighbors (KNN) algorithm to estimate ATM cash demand.

### Input Features
- Previous Day
- Previous Week
- Weekly Average
The input features are scaled using a saved preprocessing scaler before being passed to the trained model.

### Model Performance
| Evaluation Metric | Result |
|---|---:|
| Mean Absolute Error (MAE) | 4.9364 |
| Root Mean Squared Error (RMSE) | 6.2783 |
These metrics represent the model evaluation results from the project.

## System Architecture
The application follows a three-tier architecture:
1. **Presentation Layer:** React frontend served through Nginx.
2. **Application Layer:** FastAPI handles authentication, prediction, history, and optimization requests.
3. **Data Layer:** MySQL stores user information and prediction history.
The KNN model and OR-Tools optimizer are integrated into the backend. Docker Compose manages the application containers.

## Project Structure
```text
ATM-Cash-Demand-Predictor/
│
├── app.py
├── auth.py
├── database.py
├── optimizer.py
├── convert_dataset.py
├── verify_model.py
│
├── atm_cash_demand.csv
├── knn_atm_model.pkl
├── atm_scaler.pkl
│
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .gitignore
│
├── database/
│   └── init/
│       └── 01-init.sql
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── package-lock.json
    └── src/
        ├── App.jsx
        ├── App.css
        ├── index.css
        └── main.jsx
```

## Installation and Execution
### Prerequisites
- Python
- Docker Desktop
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/nagarhimanshi018-lang/ATM-Cash-Demand-Predictor.git
cd ATM-Cash-Demand-Predictor
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory.
```env
DB_NAME=atm_cash_predictor
DB_PASSWORD=your_mysql_password
JWT_SECRET_KEY=your_secret_key
```
Use strong private values. Do not upload this file to GitHub.

### 3. Start the Application
```bash
docker compose up --build
```
Docker Compose starts the MySQL database, FastAPI backend, and React frontend.

### 4. Access the Application
| Service | URL |
|---|---|
| Frontend Dashboard | http://localhost:8080|
| FastAPI Backend | http://127.0.0.1:8000 |
| API Documentation | http://127.0.0.1:8000/docs |

## Database
The project uses MySQL 8.0.
The database manages:
- User registration and authentication data.
- ATM prediction records.
- Prediction history.

## Optimization Module
The project integrates Google OR-Tools to support cash allocation recommendations.
It uses predicted demand and available cash as inputs to recommend an allocation that meets the estimated requirement.

## Future Enhancements
- Integration with real-time ATM transaction data.
- Advanced time-series forecasting models.
- Multi-ATM cash distribution optimization.
- Denomination-wise cash allocation.
- Cloud deployment and monitoring.

## Author
**Himanshi**
B.Tech – Electrical and Computer Engineering
ABES Engineering College

## Project Repository
[ATM Cash Demand Predictor – GitHub](https://github.com/nagarhimanshi018-lang/ATM-Cash-Demand-Predictor)

## 🚀 Live Demo
Live Application: https://joseph-phones-harper-hampshire.trycloudflare.com
API Documentation: https://mission-throughout-historic-norfolk.trycloudflare.com/docs
