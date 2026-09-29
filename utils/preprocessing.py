from pathlib import Path
import pandas as pd

from utils.rules import grocery_rule, vegetable_rule

from utils.zone_mapping import ZONE_MAP
from utils.diet_mapping import DIET_MAPPING
from utils.frequency_mapping import FREQUENCY_MAP

from utils.vegetable_mapping import VEGETABLE_MAPPING
from utils.fruit_mapping import FRUIT_MAPPING
from utils.grain_mapping import GRAIN_MAPPING
from utils.dairy_mapping import DAIRY_MAPPING
from utils.grocery_mapping import STORE_MAPPING
from utils.rice_mapping import RICE_MAPPING


DATASET_PATH = "Data/featured_engineering_dataset.csv"


ID_COLUMNS = [
    "house_number",
    "name",
    "phone_number",
    "area",
    "meat_days"
]


class ValidationError(Exception):
    pass


class Preprocessor:

    def validate(self, user):
        required = [
            "familySize",
            "dietType",
            "locality"
        ]

        for field in required:
            if not user.get(field):
                raise ValidationError(f"{field} is required")

        family = str(user["familySize"]).strip()

        if family != "6+":
            try:
                float(family)
            except ValueError:
                raise ValidationError("Invalid family size")

    def _family_size(self, value):
        value = str(value).strip()

        if value == "6+":
            return 6

        return max(1, int(float(value)))

    def _encode_multiselect(self, selected, mapping, prefix):
        encoded = {}
        selected = selected or []

        for item in selected:
            item = str(item).strip()
            feature = mapping.get(
                item,
                item.lower()
                    .strip()
                    .replace("&", "and")
                    .replace("/", "_")
                    .replace("-", "_")
                    .replace(" ", "_")
            )
            encoded[f"{prefix}_{feature}"] = 1

        return encoded

    def _encode_single(self, value, mapping, prefix):
        encoded = {}
        value = str(value).strip().lower()
        
        mapped = mapping.get(
            value,
            value.replace("&", "and")
                 .replace("/", "_")
                 .replace("-", "_")
                 .replace(" ", "_")
        )
        
        unique_features = set(mapping.values())

        for feature in unique_features:
            encoded[f"{prefix}_{feature}"] = int(feature == mapped)

        return encoded

    def _frequency(self, label):
        if not label:
            return 0

        label = str(label).strip().lower()

        return FREQUENCY_MAP.get(label, 0)

    def save_cleaned(self, user):
        path = Path("Data/cleaned_dataset.csv")

        row = {
            "house_number": user.get("houseNumber", ""),
            "name": user.get("name", ""),
            "phone_number": user.get("phone", ""),
            "locality": user.get("locality", ""),
            "family_size": user.get("familySize", ""),
            "diet_type": user.get("dietType", ""),
            "meat_days": ";".join(user.get("meatDays", [])),
            "vegetables": ";".join(user.get("vegetables", [])),
            "fruits": ";".join(user.get("fruits", [])),
            "grains": ";".join(user.get("grains", [])),
            "rice_types": ";".join(user.get("riceTypes", [])),
            "dairy": ";".join(user.get("dairy", [])),
            "daily_rice": user.get("dailyRice", ""),
            "monthly_rice": user.get("monthlyRice", ""),
            "weekly_milk": user.get("weeklyMilk", ""),
            "grocery_source": user.get("grocerySource", ""),
            "vegetable_frequency": user.get("vegetableFrequency", ""),
            "grocery_frequency": user.get("groceryFrequency", "")
        }

        df = pd.DataFrame([row])

        if path.exists():
            old = pd.read_csv(path)
            df = pd.concat([old, df], ignore_index=True)

        df.to_csv(path, index=False)

    def engineer(self, user):
        self.validate(user)
        row = {}
        
        family_size = self._family_size(user["familySize"])
        row["family_size"] = family_size
        row["house_number"] = user.get("houseNumber", "")
        row["name"] = user.get("name", "")
        row["phone_number"] = user.get("phone", "")
        row["area"] = user.get("locality", "")
        
        meat_days = user.get("meatDays", [])
        row["meat_days"] = ";".join(meat_days)
        
        locality = user["locality"].strip().lower()
        zone = ZONE_MAP.get(locality, "Unknown")

        print(f"DEBUG: Locality='{locality}' -> Zone='{zone}'")

        browse_zones = ["North", "South", "East", "West", "Central", "Unknown"]
        for z in browse_zones:
            row[f"zone_{z}"] = int(zone == z)

        diet = DIET_MAPPING.get(
            user["dietType"].strip().lower(),
            user["dietType"].strip().lower()
        )
        
        diets = set(DIET_MAPPING.values())
        for d in diets:
            row[f"diet_{d}"] = int(d == diet)

        row.update(
            self._encode_multiselect(
                user.get("vegetables"),
                VEGETABLE_MAPPING,
                "veg"
            )
        )

        row.update(
            self._encode_multiselect(
                user.get("fruits"),
                FRUIT_MAPPING,
                "fruit"
            )
        )

        row.update(
            self._encode_multiselect(
                user.get("grains"),
                GRAIN_MAPPING,
                "grain"
            )
        )

        row.update(
            self._encode_multiselect(
                user.get("dairy"),
                DAIRY_MAPPING,
                "dairy"
            )
        )

        row.update(
            self._encode_multiselect(
                user.get("riceTypes"),
                RICE_MAPPING,
                "rice"
            )
        )

        store = str(user.get("grocerySource", "")).strip().lower()
        row.update(
            self._encode_single(
                store,
                STORE_MAPPING,
                "store"
            )
        )

        row["vegetable_count"] = len(user.get("vegetables", []))
        row["fruit_count"] = len(user.get("fruits", []))
        row["grain_count"] = len(user.get("grains", []))
        row["dairy_count"] = len(user.get("dairy", []))
        row["store_count"] = 1 if user.get("grocerySource") else 0

        grocery = user.get("groceryFrequency") or grocery_rule(family_size)
        vegetable = user.get("vegetableFrequency") or vegetable_rule(family_size)
        
        print("Rule Grocery :", grocery)
        print("Rule Vegetable :", vegetable)
        print("Encoded Grocery :", self._frequency(grocery))
        print("Encoded Vegetable :", self._frequency(vegetable))
        
        row["grocery_frequency"] = self._frequency(grocery)
        row["vegetable_frequency"] = self._frequency(vegetable)

        return pd.DataFrame([row])

    def update_dataset(self, df):     
        path = Path(DATASET_PATH)

        if not path.exists():
            df.to_csv(path, index=False)
            return

        dataset = pd.read_csv(path)

        for col in df.columns:
            if col not in dataset.columns:
                dataset[col] = 0

        for col in dataset.columns:
            if col not in df.columns:
                df[col] = 0

        df = df[dataset.columns]
        dataset = pd.concat([dataset, df], ignore_index=True)
        dataset.to_csv(path, index=False)

    def align_to_model(self, df, model):
        expected = list(getattr(model, "feature_names_in_", df.columns))
        model_df = df.reindex(columns=expected, fill_value=0)
        return model_df

    def transform(self, user, save=True):
        if save:
            self.save_cleaned(user)

        df = self.engineer(user)

        if save:
            self.update_dataset(df)

        return df