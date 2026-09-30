from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from Agents.consumption_agent import ConsumptionAgent
from Agents.inventory_agent import InventoryAgent
from Agents.delivery_agent import DeliveryAgent
from utils.zone_mapping import ZONE_MAP
from utils.preprocessing import Preprocessor
from backend.data_manager import save_cleaned, save_featured
import json
import pandas as pd
from pathlib import Path

# Initialize all agents and preprocessor at the top
consumption = ConsumptionAgent()
inventory = InventoryAgent()
delivery = DeliveryAgent()
preprocessor = Preprocessor()

app = FastAPI(title="SupplySense AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "SupplySense AI Backend Running"
    }


@app.get("/inventory-status")
def get_inventory_status():
    try:
        base_path = Path(__file__).resolve().parent.parent

        # ---------------------------------------------------------
        # 1. LOAD LOCALITY-WISE DEMAND
        # ---------------------------------------------------------
        area_forecast_path = base_path / "Data" / "area_forecast.json"

        with open(area_forecast_path, "r", encoding="utf-8") as f:
            area_forecast = json.load(f)

        # ---------------------------------------------------------
        # 2. LOAD SUPPLIER INVENTORY
        #    Inventory is available zone-wise in the Excel file
        # ---------------------------------------------------------
        inventory_path = (
            base_path
            / "Data"
            / "final_supply_chain_supplier_inventory.xlsx"
        )

        inventory_df = pd.read_excel(inventory_path)

        zone_inventory = {}

        for _, row in inventory_df.iterrows():

            zone = str(row["zone"]).strip()
            category = str(row["category"]).strip().lower()
            product = str(row["product"]).strip().lower()

            stock = float(row["current_stock"])

            if zone not in zone_inventory:
                zone_inventory[zone] = {
                    "rice": 0,
                    "milk": 0
                }

            # Rice / rice grain inventory
            if category == "rice" or (
                category == "grain" and "rice" in product
            ):
                zone_inventory[zone]["rice"] += stock

            # Milk inventory
            elif category == "dairy" and product == "milk":
                zone_inventory[zone]["milk"] += stock

        # ---------------------------------------------------------
        # 3. BUILD LOCALITY DATA USING EXISTING ZONE_MAP
        # ---------------------------------------------------------
        zones = {}

        for locality, data in area_forecast.items():

            locality_clean = locality.strip().lower()

            # Use the project's existing mapping
            zone = ZONE_MAP.get(locality_clean)

            # Ignore localities that are not mapped
            if zone is None:
                continue

            if zone not in zones:
                zones[zone] = {
                    "name": zone,
                    "households": 0,
                    "demandRice": 0,
                    "demandMilk": 0,
                    "inventoryRice": zone_inventory.get(
                        zone, {}
                    ).get("rice", 0),
                    "inventoryMilk": zone_inventory.get(
                        zone, {}
                    ).get("milk", 0),
                    "localities": []
                }

            # Extract locality demand
            households = float(data.get("households", 0))
            rice_demand = float(data.get("rice_per_month", 0))
            milk_demand = float(data.get("milk_per_week", 0))

            # Add to zone totals
            zones[zone]["households"] += households
            zones[zone]["demandRice"] += rice_demand
            zones[zone]["demandMilk"] += milk_demand

            # Add locality
            zones[zone]["localities"].append({
                "name": locality,
                "households": households,
                "demandRice": round(rice_demand, 2),
                "demandMilk": round(milk_demand, 2)
            })

        # ---------------------------------------------------------
        # 4. CALCULATE STATUS FOR EACH ZONE
        # ---------------------------------------------------------
        def get_status(inventory, demand):

            if demand <= 0:
                return "Healthy"

            ratio = inventory / demand

            if ratio >= 1:
                return "Healthy"

            elif ratio >= 0.8:
                return "Low Stock"

            else:
                return "Critical"

        # ---------------------------------------------------------
        # 5. FINAL RESPONSE
        # ---------------------------------------------------------
        result = []

        for zone_name, zone_data in zones.items():

            zone_data["households"] = int(
                zone_data["households"]
            )

            zone_data["demandRice"] = round(
                zone_data["demandRice"], 2
            )

            zone_data["demandMilk"] = round(
                zone_data["demandMilk"], 2
            )

            zone_data["inventoryRice"] = round(
                zone_data["inventoryRice"], 2
            )

            zone_data["inventoryMilk"] = round(
                zone_data["inventoryMilk"], 2
            )

            zone_data["statusRice"] = get_status(
                zone_data["inventoryRice"],
                zone_data["demandRice"]
            )

            zone_data["statusMilk"] = get_status(
                zone_data["inventoryMilk"],
                zone_data["demandMilk"]
            )

            # Sort localities alphabetically
            zone_data["localities"].sort(
                key=lambda x: x["name"].lower()
            )

            result.append(zone_data)

        # Sort zones alphabetically
        result.sort(
            key=lambda x: x["name"].lower()
        )

        return {
            "status": "success",
            "zones": result
        }

    except Exception as e:

        return {
            "status": "error",
            "message": str(e)
        }


@app.post("/predict")
def predict(user: dict):
    import traceback
    try:
        # Save cleaned dataset
        try:
            clean_df = preprocessor.engineer(user)
            save_cleaned(clean_df)
        except Exception:
            traceback.print_exc()

        # Save featured dataset
        try:
            feature_df = preprocessor.transform(user, save=False)
            save_featured(feature_df)
        except Exception:
            traceback.print_exc()

        # Consumption Prediction
        consumption_result = consumption.predict(user)

        locality = user.get("locality", "").strip().lower()
        zone = ZONE_MAP.get(locality, "South")

        try:
            inventory_result = inventory.run_for_zone(zone, consumption_result)
        except Exception:
            traceback.print_exc()
            inventory_result = {zone: {}}

        try:
            delivery_result = delivery.run_from_inventory(inventory_result)
        except Exception:
            traceback.print_exc()
            delivery_result = {zone: {}}

        return {
            "consumption": consumption_result,
            "inventory": inventory_result,
            "delivery": delivery_result,
            "zone": zone
        }

    except Exception as e:
        traceback.print_exc()
        return {
            "consumption": {"status": "error", "message": str(e)},
            "inventory": {},
            "delivery": {},
            "zone": "South"
        }