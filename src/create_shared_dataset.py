# This script creates a single common dataset that should be shared by all
# the visualizations, merging the existing data sources into one csv
# VsCode note: use interpreter 3.7

# Import libraries
import pandas as pd
import numpy as np

# Read data from csv
path = "C:/Users/user/Documents/GitHub/Visual-Analytics/src/static/dataset/"
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

# Write final dataset to csv
tr_final.to_csv(path+'full_data.csv', index=False)
