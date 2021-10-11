# This script merges demographic customers' information with the rfm
# values and the correspondent cluster value.

# Import needed libraries
import pandas as pd
import numpy as np

def customer_summary():

    # Read data from needed csv into dataframe
    path = "src/static/dataset/"
    cst_data = pd.read_csv(path+"Customer.csv")
    rfm_data = pd.read_csv(path+"rfm_data.csv")
    pca_data = pd.read_csv(path+"pca_kmeans_data.csv")

    # Merge demographic data with cluster info (if some cust id are in cstdata but not in pca they are not taken)
    customers = pd.merge(cst_data, pca_data[["cust_id", "cluster"]],  \
    how='right', left_on=['customer_Id'], right_on = ['cust_id'])

    # Merge last merged with rfm data
    customers = pd.merge(customers, rfm_data, how='inner', left_on=['cust_id'],    \
    right_on = ['cust_id'] )

    # Remove useless columns
    to_be_removed = ["customer_Id", "RFM_Segment_Concat", "RFM_Score", "RFM_Level"]
    customers = customers.drop(columns=to_be_removed)

    # Fix data types
    customers['city_code'] = customers['city_code'].astype('Int64')
    customers['monetary'] = customers['monetary'].apply(lambda x: round(x,2))

    # Reorder columns
    customers = customers[["cust_id", "DOB", "Gender", "city_code", "cluster", "recency", \
        "frequency", "monetary", "R", "F", "M", "Avg_M"]]
    # Write result to new csv file
    customers.to_csv(path+'customers_summary.csv', index=False) 

    return

