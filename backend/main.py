from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from Agents.consumption_agent import ConsumptionAgent
from Agents.inventory_agent import InventoryAgent
from Agents.delivery_agent import DeliveryAgent
from utils.zone_mapping import ZONE_MAP
from utils.preprocessing import Preprocessor

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
        # Load inventory data
        inventory_path = Path(__file__).resolve().parent.parent / "Data" / "final_supply_chain_supplier_inventory.xlsx"
        df = pd.read_excel(inventory_path)
        
        # Load zone forecast for demand data
        zone_forecast_path = Path(__file__).resolve().parent.parent / "Data" / "zone_forecast.json"
        with open(zone_forecast_path, "r") as f:
            zone_forecast = json.load(f)

        # Load area forecast for locality-wise demand
        area_forecast_path = Path(__file__).resolve().parent.parent / "Data" / "area_forecast.json"
        with open(area_forecast_path, "r") as f:
            area_forecast = json.load(f)
        
        # Aggregate inventory by zone and category
        zone_inventory = {}
        for _, row in df.iterrows():
            zone = row["zone"]
            category = row["category"]
            product = row["product"]
            stock = row["current_stock"]
            
            if zone not in zone_inventory:
                zone_inventory[zone] = {"rice": 0, "milk": 0}
            
            # Map category and product to rice/milk
            if category == "Rice" or (category == "Grain" and "rice" in product.lower()):
                zone_inventory[zone]["rice"] += stock
            elif category == "Dairy" and product.lower() == "milk":
                zone_inventory[zone]["milk"] += stock
        
        # Calculate demand from zone_forecast
        zone_demand = {}
        for zone, categories in zone_forecast.items():
            zone_demand[zone] = {"rice": 0, "milk": 0}
            
            # Rice demand
            if "grains" in categories and "Rice" in categories["grains"]:
                zone_demand[zone]["rice"] = categories["grains"]["Rice"]
            
            # Milk demand
            if "dairy" in categories and "Milk" in categories["dairy"]:
                zone_demand[zone]["milk"] = categories["dairy"]["Milk"]
        
        # Build zone-wise list with nested localities from area_forecast
        from utils.zone_mapping import ZONE_MAP
        zone_to_areas = {}
        for area, data in area_forecast.items():
            z = ZONE_MAP.get(area, None)
            if z:
                if z not in zone_to_areas:
                    zone_to_areas[z] = []
                zone_to_areas[z].append({
                    "name": area.title(),
                    "households": data.get("households", 0),
                    "demandRice": round(data.get("rice_per_month", 0), 2),
                    "demandMilk": round(data.get("milk_per_week", 0), 2)
                })

        zones = []
        for zone in ["South", "East", "North", "West", "Central"]:
            if zone in zone_inventory or zone in zone_demand:
                inv = zone_inventory.get(zone, {"rice": 0, "milk": 0})
                dem = zone_demand.get(zone, {"rice": 0, "milk": 0})
                zones.append({
                    "name": zone,
                    "inventoryRice": round(inv["rice"], 2),
                    "demandRice": round(dem["rice"], 2),
                    "inventoryMilk": round(inv["milk"], 2),
                    "demandMilk": round(dem["milk"], 2),
                    "localities": zone_to_areas.get(zone, [])
                })

        return {
            "status": "success",
            "localities": zones
        }
    
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


@app.post("/predict")
def predict(user: dict):

    # Normalize frontend key names to what preprocessor expects
    user["vegetableFrequency"] = user.pop("vegFreq", user.get("vegetableFrequency", ""))
    user["groceryFrequency"] = user.pop("groceryFreq", user.get("groceryFrequency", ""))

    # Save human-readable cleaned row
    preprocessor.save_cleaned(user)

    # Save feature-engineered row with proper column alignment
    feature_df = preprocessor.transform(user, save=False)
    preprocessor.update_dataset(feature_df)

    # Consumption Prediction
    consumption_result = consumption.predict(user)

    locality = user["locality"].strip().lower()
    zone = ZONE_MAP.get(locality, "South")

    inventory_result = inventory.run_for_zone(
        zone,
        consumption_result,
        locality=locality
    )

    delivery_result = delivery.run_from_inventory(
        inventory_result
    )

    return {
        "consumption": consumption_result,
        "inventory": inventory_result,
        "delivery": delivery_result,
        "zone": zone
    }