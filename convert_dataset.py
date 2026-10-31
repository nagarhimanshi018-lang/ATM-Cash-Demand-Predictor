
import csv
from datetime import datetime, timedelta
from pathlib import Path

folder = Path(__file__).resolve().parent
input_file = folder / "nn5_daily_dataset_with_missing_values.tsf"
output_file = folder / "atm_cash_demand.csv"

if not input_file.exists():
    raise FileNotFoundError(
        f"Dataset not found: {input_file}"
    )

rows = []
reading_data = False

with input_file.open("r", encoding="utf-8") as file:
    for line in file:
        line = line.strip()

        if not line:
            continue

        if line.lower() == "@data":
            reading_data = True
            continue

        if not reading_data:
            continue

        parts = line.split(":", 2)

        if len(parts) != 3:
            continue

        atm_id, start_text, values_text = parts

        start_text = start_text.strip()
        start_date = datetime.strptime(
            start_text, "%Y-%m-%d %H-%M-%S"
        )

        values = values_text.split(",")

        for index, value in enumerate(values):
            value = value.strip()

            if not value or value == "?":
                withdrawals = None
            else:
                withdrawals = float(value)

            date = start_date + timedelta(days=index)

            rows.append([
                atm_id.strip(),
                date.strftime("%Y-%m-%d"),
                withdrawals
            ])

with output_file.open("w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerow(["ATM_ID", "Date", "Withdrawals"])
    writer.writerows(rows)

print(f"CSV created: {output_file}")
print(f"Total rows: {len(rows)}")
print("Missing values are preserved for later cleaning.")
