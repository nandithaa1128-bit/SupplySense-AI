import joblib
import traceback
from pathlib import Path

from utils.preprocessing import Preprocessor
from utils.rules import grocery_rule, vegetable_rule
from utils.quantity_estimator import estimate_quantity

# Updated imports for bases and multipliers
from utils.quantity_rules import (
    VEGETABLE_BASE,
    FRUIT_BASE,
    GRAIN_BASE,
    DAIRY_BASE,
    FAMILY_MULTIPLIER,
    VEGETABLE_FREQ_MULTIPLIER,
    GROCERY_FREQ_MULTIPLIER,
)

from utils.items_weights import (  
    VEGETABLE_WEIGHTS,
    FRUIT_WEIGHTS,
    GRAIN_WEIGHTS,
    DAIRY_WEIGHTS,
)


class ConsumptionAgent:

    def __init__(self):
        self.preprocessor = Preprocessor()

        MODEL_PATH = Path(__file__).resolve().parent.parent / "Models"
        self.rice_model = joblib.load(MODEL_PATH / "rice_consumption_rf.pkl")
        self.milk_model = joblib.load(MODEL_PATH / "milk_consumption_xgb.pkl")

    def predict(self, user):
        try:
            df = self.preprocessor.transform(user, save=False)

            rice_input = self.preprocessor.align_to_model(df, self.rice_model)
            milk_input = self.preprocessor.align_to_model(df, self.milk_model)

            rice_prediction = max(
                0, float(self.rice_model.predict(rice_input)[0])
            )
            milk_prediction = max(
                0, float(self.milk_model.predict(milk_input)[0])
            )

            family = int(df["family_size"].iloc[0])

            # Frequency rules need to be evaluated before estimating quantities
            grocery_frequency = grocery_rule(family)
            vegetable_frequency = vegetable_rule(family)

            # Updated quantity estimations using base values and frequency multipliers
            vegetables_quantity = estimate_quantity(
                user.get("vegetables", []),
                family,
                VEGETABLE_BASE,
                FAMILY_MULTIPLIER,
                vegetable_frequency,
                VEGETABLE_FREQ_MULTIPLIER,
                VEGETABLE_WEIGHTS,
            )

            fruits_quantity = estimate_quantity(
                user.get("fruits", []),
                family,
                FRUIT_BASE,
                FAMILY_MULTIPLIER,
                grocery_frequency,
                GROCERY_FREQ_MULTIPLIER,
                FRUIT_WEIGHTS,
            )

            other_grains = [
                grain
                for grain in user.get("grains", [])
                if "rice" not in grain.lower()
            ]
            grains_quantity = estimate_quantity(
                other_grains,
                family,
                GRAIN_BASE,
                FAMILY_MULTIPLIER,
                grocery_frequency,
                GROCERY_FREQ_MULTIPLIER,
                GRAIN_WEIGHTS,
            )

            other_dairy = [
                dairy
                for dairy in user.get("dairy", [])
                if "milk" not in dairy.lower()
            ]
            dairy_quantity = estimate_quantity(
                other_dairy,
                family,
                DAIRY_BASE,
                FAMILY_MULTIPLIER,
                grocery_frequency,
                GROCERY_FREQ_MULTIPLIER,
                DAIRY_WEIGHTS,
            )

            return {
                "status": "success",
                "rice_per_month": round(rice_prediction, 2),
                "milk_per_week": round(milk_prediction, 2),
                "grocery_frequency": grocery_frequency,
                "vegetable_frequency": vegetable_frequency,
                "vegetables": vegetables_quantity,
                "fruits": fruits_quantity,
                "grains": {"Rice": round(rice_prediction, 2), **grains_quantity},
                "dairy": {"Milk": round(milk_prediction, 2), **dairy_quantity},
            }

        except Exception:
            traceback.print_exc()
            return {
                "status": "error", 
                "message": "Consumption Agent Failed"
            }


if __name__ == "__main__":
    sample_user = {
        "houseNumber": "101",
        "name": "Nanditha",
        "phone": "9876543210",
        "familySize": "4",
        "dietType": "Vegetarian",
        "locality": "Vijayanagar",
        "vegetables": ["Onion", "Tomato", "Pumpkin"],
        "fruits": ["Apple", "Banana"],
        "grains": ["Rice", "Ragi"],
        "dairy": ["Milk", "Curd"],
        "riceTypes": ["Sona Masuri"],
        "grocerySource": "Dmart",
        "meatDays": [],
    }

    agent = ConsumptionAgent()
    prediction = agent.predict(sample_user)
    print(prediction)