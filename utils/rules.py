def grocery_rule(family_size):

    if family_size >= 6:
        return "biweekly"

    elif family_size >= 4:
        return "monthly"

    elif family_size >= 2:
        return "monthly"

    else:
        return "monthly"
    
def vegetable_rule(family_size):

    if family_size >= 6:
        return "daily"

    elif family_size >= 4:
        return "semiweekly"

    elif family_size >= 2:
        return "weekly"

    else:
        return "biweekly"