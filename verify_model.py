
from pathlib import Path
import joblib
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error
from math import sqrt

BASE_DIR = Path(__file__).resolve().parent

# Load the existing dataset and saved model
df = pd.read_csv(BASE_DIR / "atm_cash_demand.csv")
model = joblib.load(BASE_DIR / "knn_atm_model.pkl")
scaler = joblib.load(BASE_DIR / "atm_scaler.pkl")

print("Dataset shape:", df.shape)
print("Dataset columns:", df.columns.tolist())
print("\nSaved model:", type(model).__name__)
print("Saved scaler:", type(scaler).__name__)

print("\nIMPORTANT:")
print("The original training/test split is not saved in this script.")
print("We cannot reliably recalculate the original MAE and RMSE")
print("until we reconstruct the exact training procedure.")
print("\nModel feature count:", model.n_features_in_)
print("Scaler feature count:", scaler.n_features_in_)
print("Scaler feature names:", scaler.feature_names_in_)
print("\nATM IDs:", df["ATM_ID"].unique())

atm1 = df[df["ATM_ID"] == "T1"].copy()
atm1["Date"] = pd.to_datetime(atm1["Date"])
atm1 = atm1.sort_values("Date")

print("ATM T1 rows:", len(atm1))
print("ATM T1 missing withdrawals:", atm1["Withdrawals"].isna().sum())
print("ATM T1 valid withdrawals:", atm1["Withdrawals"].notna().sum())
print("\nModel parameters:")
print(model.get_params())

print("\nScaler parameters:")
print("Mean:", scaler.mean_)
print("Scale:", scaler.scale_)

print("\nModel training sample count:")
print(model.n_samples_fit_)
print("\nATM T1 date range:")
print("Start:", atm1["Date"].min())
print("End:", atm1["Date"].max())

print("\nFirst 10 valid withdrawals:")
print(atm1[["Date", "Withdrawals"]].head(10).to_string(index=False))

print("\nLast 10 valid withdrawals:")
print(atm1[["Date", "Withdrawals"]].tail(10).to_string(index=False))