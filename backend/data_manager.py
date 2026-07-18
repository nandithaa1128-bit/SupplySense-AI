import pandas as pd
import os


CLEAN_DATASET = "Data/cleaned_dataset.csv"
FEATURE_DATASET = "Data/featured_engineering_dataset.csv"


def save_cleaned(clean_user):

    df = pd.read_csv(CLEAN_DATASET)

    df = pd.concat(
        [df, clean_user],
        ignore_index=True
    )

    df.to_csv(CLEAN_DATASET, index=False)


def save_featured(feature_row):

    df = pd.read_csv(FEATURE_DATASET)

    df = pd.concat(
        [df, feature_row],
        ignore_index=True
    )

    df.to_csv(FEATURE_DATASET, index=False)
