from collections import defaultdict
import json
from pathlib import Path
from Agents.consumption_agent import ConsumptionAgent
import pandas as pd
from utils.zone_mapping import ZONE_MAP


class DemandForecastAgent:

    def __init__(self):
        self.agent = ConsumptionAgent()
        self.dataset = pd.read_csv("Data/cleaned_dataset.csv")
        self.zone_forecast = defaultdict(dict)

        print("=" * 50)
        print("Demand Forecast Agent Loaded")
        print("=" * 50)
        print(f"Total Households : {len(self.dataset)}")

    def row_to_user(self, row):
        def split_items(value):
            if pd.isna(value):
                return []
            return [
                item.strip().title()
                for item in str(value).split(";")
                if item.strip()
            ]

        return {
            "houseNumber": str(row["house_number"]),
            "name": row["name"],
            "phone": str(row["phone_number"]),
            "familySize": str(int(float(row["family_size"]))),
            "dietType": row["diet_type"],
            "locality": row["area"],
            "meatDays": split_items(row["meat_days"]),
            "vegetables": split_items(row["vegetables"]),
            "fruits": split_items(row["fruits"]),
            "grains": split_items(row["food_grains"]),
            "dairy": split_items(row["dairy_products"]),
            "riceTypes": split_items(row["rice_type"]),
            "grocerySource": row["grocery_source"],
        }

    def household_predictions(self):
        predictions = []

        for index, row in self.dataset.iterrows():
            # Check for missing family_size to avoid potential ValueError downstream
            if pd.isna(row["family_size"]):
                print(f"Skipping row {index} - Missing family size")
                continue

            user = self.row_to_user(row)
            prediction = self.agent.predict(user)

            prediction["zone"] = row["area"]
            prediction["house_number"] = row["house_number"]
            predictions.append(prediction)

        return predictions

    def aggregate_by_area(self, predictions):
        area_forecast = {}

        for prediction in predictions:
            if prediction["status"] != "success":
                continue

            area = prediction["zone"].strip().lower()

            if area not in area_forecast:
                area_forecast[area] = {
                    "households": 0,
                    "rice_per_month": 0,
                    "milk_per_week": 0,
                    "vegetables": defaultdict(float),
                    "fruits": defaultdict(float),
                    "grains": defaultdict(float),
                    "dairy": defaultdict(float),
                }

            current = area_forecast[area]
            current["households"] += 1
            current["rice_per_month"] += prediction["rice_per_month"]
            current["milk_per_week"] += prediction["milk_per_week"]

            for item, qty in prediction["vegetables"].items():
                current["vegetables"][item] += qty

            for item, qty in prediction["fruits"].items():
                current["fruits"][item] += qty

            for item, qty in prediction["grains"].items():
                current["grains"][item] += qty

            for item, qty in prediction["dairy"].items():
                current["dairy"][item] += qty

        # Convert nested defaultdicts into standard clean dicts before returning
        for area_data in area_forecast.values():
            area_data["vegetables"] = dict(area_data["vegetables"])
            area_data["fruits"] = dict(area_data["fruits"])
            area_data["grains"] = dict(area_data["grains"])
            area_data["dairy"] = dict(area_data["dairy"])

        return area_forecast

    def aggregate_by_zone(self, area_forecast):
        zone_forecast = {}

        for area_name, data in area_forecast.items():
            zone = ZONE_MAP.get(area_name.strip().lower(), "Unknown")

            if zone not in zone_forecast:
                zone_forecast[zone] = {
                    "areas": 0,
                    "households": 0,
                    "rice_per_month": 0,
                    "milk_per_week": 0,
                    "vegetables": defaultdict(float),
                    "fruits": defaultdict(float),
                    "grains": defaultdict(float),
                    "dairy": defaultdict(float),
                }

            current = zone_forecast[zone]
            current["areas"] += 1
            current["households"] += data["households"]
            current["rice_per_month"] += data["rice_per_month"]
            current["milk_per_week"] += data["milk_per_week"]

            for item, qty in data["vegetables"].items():
                current["vegetables"][item] += qty

            for item, qty in data["fruits"].items():
                current["fruits"][item] += qty

            for item, qty in data["grains"].items():
                current["grains"][item] += qty

            for item, qty in data["dairy"].items():
                current["dairy"][item] += qty

        for zone in zone_forecast.values():
            zone["vegetables"] = dict(zone["vegetables"])
            zone["fruits"] = dict(zone["fruits"])
            zone["grains"] = dict(zone["grains"])
            zone["dairy"] = dict(zone["dairy"])

        return zone_forecast

    def save_forecasts(self, area_forecast, zone_forecast):
        output_folder = Path("Data")
        output_folder.mkdir(exist_ok=True)

        with open(
            output_folder / "area_forecast.json", "w", encoding="utf-8"
        ) as f:
            json.dump(area_forecast, f, indent=4)

        with open(
            output_folder / "zone_forecast.json", "w", encoding="utf-8"
        ) as f:
            json.dump(zone_forecast, f, indent=4)

        print("\nForecast files saved successfully!")
        print("Data/area_forecast.json")
        print("Data/zone_forecast.json")


if __name__ == "__main__":
    agent = DemandForecastAgent()
    predictions = agent.household_predictions()
    area_forecast = agent.aggregate_by_area(predictions)
    zone_forecast = agent.aggregate_by_zone(area_forecast)
    agent.save_forecasts(area_forecast, zone_forecast)

    print("\nUnknown Areas:\n")
    for area in area_forecast:
        if area.strip().lower() not in ZONE_MAP:
            print(area)
            print()
            print("Zones Found :", list(zone_forecast.keys()))
            print()

    print("South Zone Data:")
    print(zone_forecast.get("South", "South Zone not found"))