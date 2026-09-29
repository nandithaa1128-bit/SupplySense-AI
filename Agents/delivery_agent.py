import json
from datetime import datetime, timedelta

from utils.delivery_time import ZONE_DELIVERY_TIME


class DeliveryAgent:

    def __init__(self):
        with open("Data/inventory_report.json", "r") as f:
            self.inventory = json.load(f)

    def estimate(self, supplier):
        pickup = supplier["supplier_zone"]
        delivery = supplier["customer_zone"]

        hours = ZONE_DELIVERY_TIME.get((pickup, delivery), 6)

        dispatch = datetime.now()
        eta = dispatch + timedelta(hours=hours)

        return {
            "dispatch_time": dispatch.strftime("%I:%M %p"),
            "estimated_delivery": eta.strftime("%I:%M %p"),
            "travel_hours": hours,
        }

    def get_delivery_partner(self, supplier_name):
        supplier = supplier_name.lower()

        if "nandini" in supplier or "amul" in supplier:
            return "Refrigerated Van"
        elif "poultry" in supplier or "seafood" in supplier:
            return "Frozen Vehicle"
        elif "farm" in supplier or "fpo" in supplier:
            return "Farm Logistics"
        elif "market" in supplier or "grain" in supplier or "rice" in supplier:
            return "Truck"
        else:
            return "Own Fleet"

    def get_status(self, travel_hours):
        if travel_hours <= 2:
            return "Out For Delivery"
        elif travel_hours <= 4:
            return "Packed"
        else:
            return "Preparing"

    def run(self):
        report = {}

        for zone, zone_data in self.inventory.items():
            report[zone] = {}

            for category, products in zone_data.items():
                report[zone][category] = {}

                for product, details in products.items():
                    deliveries = []

                    for supplier in details["allocated"]:
                        eta = self.estimate(supplier)

                        deliveries.append(
                            {
                                "supplier": supplier["supplier"],
                                "warehouse": supplier["warehouse"],
                                "supplier_zone": supplier["supplier_zone"],
                                "customer_zone": supplier["customer_zone"],
                                "quantity": supplier["supplied"],
                                "dispatch_time": eta["dispatch_time"],
                                "estimated_delivery": eta["estimated_delivery"],
                                "travel_hours": eta["travel_hours"],
                                "delivery_partner": self.get_delivery_partner(
                                    supplier["supplier"]
                                ),
                                "status": self.get_status(eta["travel_hours"]),
                            }
                        )

                    report[zone][category][product] = deliveries

        return report

    def run_from_inventory(self, inventory_report):
        self.inventory = inventory_report
        return self.run()

    def save(self, report):
        with open("Data/delivery_schedule.json", "w") as f:
            json.dump(report, f, indent=4)


if __name__ == "__main__":
    agent = DeliveryAgent()
    report = agent.run()
    agent.save(report)

    print("=" * 50)
    print("Delivery Schedule Generated Successfully")
    print("=" * 50)