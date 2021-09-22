# This script creates a single common dataset that should be shared by all
# the visualizations, merging the existing data sources into one csv
# VsCode note: use interpreter 3.7

# Import libraries
import pandas as pd
import numpy as np

def create_csv():
    # Read data from csv
    path = "src/static/dataset/"
    ctg = pd.read_csv(path+"prod_cat_info.csv") #categories csv
    cst = pd.read_csv(path+"Customer.csv")
    tr = pd.read_csv(path+"Transactions.csv")

    # Handle mistyped negative values (replace with positive values)
    tr['Qty'] = np.abs(tr['Qty'])
    tr['total_amt'] = np.abs(tr['total_amt'])
    tr.head()

    # Merge data
    #Merge transaction data with category information
    tr_merged = pd.merge(tr, ctg,  how='left', left_on=['prod_cat_code','prod_subcat_code'], 
    right_on = ['prod_cat_code','prod_sub_cat_code'])
    #Merge with customer information
    tr_final = pd.merge(tr_merged, cst,  how='left', left_on=['cust_id'], 
    right_on = ['customer_Id'])
    tr_final['tran_date'] =pd.to_datetime(tr_final.tran_date)
    tr_final = tr_final.sort_values(by=["tran_date"])
    tr_final.head()

    # Convert city codes to integer
    tr_final['city_code'] = tr_final['city_code'].astype('Int64')

    # Write final dataset to csv
    tr_final.to_csv(path+'full_data.csv', index=False)

    print("Dataset created")



def filter_csv(sex,city,shop):

    # Read full data from csv
    path = "src/static/dataset/"
    df = pd.read_csv(path+"full_data.csv")
    
    # Convert types
    df.city_code = df.city_code.astype('Int64')

    # Filter the sex
    if (sex!="all"):
        this_sex =  df['Gender']==sex #boolean variable to filter by sex
        df = df[this_sex] #take only True rows
    # Filter the city
    if (city!="all"):
        this_city = df['city_code']==int(city)
        df = df[this_city] #take only True rows
    # Filter the shop
    if (shop!="all"):
        this_shop = df['Store_type']==shop
        df = df[this_shop] #take only True rows
    print(df.head())
    # Write filtered data in csv
    df.to_csv(path+'full_data.csv', index=False)

    print("Dataset filtered")