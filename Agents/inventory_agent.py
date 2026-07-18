import json
import math
from collections import defaultdict
import pandas as pd

from utils.supplier_priority import SUPPLIER_PRIORITY
from utils.zone_priority import ZONE_PRIORITY
from utils.zone_mapping import LOCALITY_COORDS


def _haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))


class InventoryAgent:

    def __init__(self):
        self.inventory = pd.read_excel(
            "Data/final_supply_chain_supplier_inventory.xlsx"
        )
        self.inventory["current_stock"] = self.inventory[
            "current_stock"
        ].astype(float)

        with open("Data/zone_forecast.json", "r") as f:
            self.zone_forecast = json.load(f)

        with open("Data/area_forecast.json", "r") as f:
            self.area_forecast = json.load(f)

    def get_suppliers(self, product):
        return self.inventory[self.inventory["product"] == product].copy()

    def allocate(self, product, quantity, customer_zone, locality=None):
        suppliers = self.get_suppliers(product)

        if suppliers.empty:
            return [], quantity

        # Only use available suppliers
        suppliers = suppliers[suppliers["availability_status"] == "Available"].copy()
        if suppliers.empty:
            return [], quantity

        # Filter by customer zone first, then fall back via zone priority
        zone_suppliers = suppliers[suppliers["zone"] == customer_zone].copy()
        if zone_suppliers.empty:
            preferred_zones = ZONE_PRIORITY.get(customer_zone, [])
            for fallback_zone in preferred_zones:
                zone_suppliers = suppliers[suppliers["zone"] == fallback_zone].copy()
                if not zone_suppliers.empty:
                    break
        if zone_suppliers.empty:
            zone_suppliers = suppliers.copy()

        # Compute distance from user locality to each warehouse
        user_coords = LOCALITY_COORDS.get(locality, None) if locality else None
        if user_coords:
            zone_suppliers["_dist"] = zone_suppliers.apply(
                lambda r: _haversine(user_coords[0], user_coords[1], r["latitude"], r["longitude"]),
                axis=1
            )
            zone_suppliers = zone_suppliers.sort_values(
                by=["_dist", "priority", "supplier_rating", "current_stock"],
                ascending=[True, True, False, False],
            )
        else:
            zone_suppliers = zone_suppliers.sort_values(
                by=["priority", "supplier_rating", "current_stock"],
                ascending=[True, False, False],
            )

        remaining = quantity
        allocation = []

        for idx, row in zone_suppliers.iterrows():
            if remaining <= 0:
                break

            available = row["current_stock"]
            supplied = min(available, remaining)

            allocation.append(
                {
                    "supplier": row["supplier_name"],
                    "warehouse": row["warehouse"],
                    "supplier_zone": row["zone"],
                    "customer_zone": customer_zone,
                    "lead_time": row["lead_time_hours"],
                    "supplied": round(supplied, 2),
                }
            )

            remaining -= supplied
            self.inventory.loc[idx, "current_stock"] -= supplied

        return allocation, remaining

    def run(self):
        report = {}

        for zone, demand in self.zone_forecast.items():
            report[zone] = {}

            for category in ["vegetables", "fruits", "grains", "dairy"]:
                report[zone][category] = {}

                if category not in demand:
                    continue

                for product, qty in demand[category].items():
                    # Zone tracking parameter included
                    allocation, remaining = self.allocate(product, qty, zone)

                    report[zone][category][product] = {
                        "required": qty,
                        "allocated": allocation,
                        "remaining": remaining,
                    }

        return report

    def run_for_zone(self, customer_zone, consumption_result=None, locality=None):
        report = {}
        
        # Use consumption_result if provided, otherwise fall back to zone_forecast
        if consumption_result and consumption_result.get("status") == "success":
            demand = {
                "vegetables": consumption_result.get("vegetables", {}),
                "fruits": consumption_result.get("fruits", {}),
                "grains": consumption_result.get("grains", {}),
                "dairy": consumption_result.get("dairy", {}),
            }
        else:
            demand = self.zone_forecast.get(customer_zone, {})
        
        report[customer_zone] = {}

        for category in ["vegetables", "fruits", "grains", "dairy"]:
            report[customer_zone][category] = {}

            if category not in demand:
                continue

            for product, qty in demand[category].items():
                allocation, remaining = self.allocate(
                    product,
                    qty,
                    customer_zone,
                    locality=locality
                )

                report[customer_zone][category][product] = {
                    "required": qty,
                    "allocated": allocation,
                    "remaining": remaining,
                }

        return report

    def save(self, report):
        with open("Data/inventory_report.json", "w") as f:
            json.dump(report, f, indent=4)


if __name__ == "__main__":
    agent = InventoryAgent()
    report = agent.run()
    agent.save(report)
    print("Inventory Allocation Complete")