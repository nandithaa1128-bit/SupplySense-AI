import json
from collections import defaultdict
import pandas as pd

from utils.supplier_priority import SUPPLIER_PRIORITY
from utils.zone_priority import ZONE_PRIORITY


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

    def allocate(self, product, quantity, customer_zone):
        suppliers = self.get_suppliers(product)

        if suppliers.empty:
            return [], quantity

        # Filter suppliers by customer zone FIRST
        zone_suppliers = suppliers[suppliers["zone"] == customer_zone]
        
        # If no suppliers in customer zone, fall back to all suppliers
        if zone_suppliers.empty:
            zone_suppliers = suppliers
        
        category = zone_suppliers.iloc[0]["category"]

        # Supplier Priority
        preferred_suppliers = SUPPLIER_PRIORITY.get(category, [])

        zone_suppliers["supplier_order"] = zone_suppliers["supplier_name"].apply(
            lambda x: preferred_suppliers.index(x)
            if x in preferred_suppliers
            else 999
        )

        # Zone Priority
        preferred_zones = ZONE_PRIORITY.get(customer_zone, [])

        zone_suppliers["zone_order"] = zone_suppliers["zone"].apply(
            lambda z: preferred_zones.index(z) if z in preferred_zones else 999
        )

        zone_suppliers = zone_suppliers.sort_values(
            by=["supplier_order", "zone_order", "current_stock"],
            ascending=[True, True, False],
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

    def run_for_zone(self, customer_zone, consumption_result=None):
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
                    customer_zone
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