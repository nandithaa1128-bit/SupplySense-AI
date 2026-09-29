def estimate_quantity(
    items,
    family_size,
    base_quantity,
    family_multiplier,
    frequency,
    frequency_multiplier,
    weight_map
):

    items = items or []

    if not items:
        return {}

    family_size = min(int(family_size), 6)

    total_quantity = (
        base_quantity
        * family_multiplier[family_size]
        * frequency_multiplier.get(frequency, 1)
    )

    weights = [
        weight_map.get(item.lower(), 1)
        for item in items
    ]

    total_weight = sum(weights)

    estimates = {}

    for item, weight in zip(items, weights):

        estimates[item] = round(
            total_quantity * weight / total_weight,
            2
        )

    return estimates