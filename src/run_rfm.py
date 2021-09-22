# # # DATA PREPARATION AND LOADING

# Import needed libraries
import pandas as pd
import numpy as np
from datetime import timedelta
import matplotlib.pyplot as plt
import seaborn as sns
import squarify

# # # FUNCTIONS

# Define function to concatenate rfm values
def join_rfm(x): return str(x['R']) + str(x['F']) + str(x['M'])

# Define rfm_level function
def rfm_level(df):
    if df['RFM_Score'] >= 9:
        return 'Can\'t Loose Them'
    elif ((df['RFM_Score'] >= 8) and (df['RFM_Score'] < 9)):
        return 'Champions'
    elif ((df['RFM_Score'] >= 7) and (df['RFM_Score'] < 8)):
        return 'Loyal'
    elif ((df['RFM_Score'] >= 6) and (df['RFM_Score'] < 7)):
        return 'Potential'
    elif ((df['RFM_Score'] >= 5) and (df['RFM_Score'] < 6)):
        return 'Promising'
    elif ((df['RFM_Score'] >= 4) and (df['RFM_Score'] < 5)):
        return 'Needs Attention'
    else:
        return 'Require Activation'

# Main function to call and run the rfm
def rfm():
    # Read csv file
    path = "src/static/dataset/"
    data = pd.read_csv(path+"full_data.csv")
    #print(data.head())

    # # # DATA PREPROCESSING
    data['tran_date'] = pd.to_datetime(data['tran_date']) #string to datetime
    snapshot_date = data['tran_date'].max() + timedelta(days=1) #take last date


    # # # DATA PROCESSING : COMPUTE RFM SCORES

    # Group by customer id, computing rfm metrics
    data_process = data.groupby(['cust_id']).agg({
        'tran_date': lambda x: (snapshot_date - x.max()).days, #days since last purchase
        'transaction_id': 'count', #n of transactions
        'total_amt': 'sum'}) #total money spent
    #data_process.head()

    # Rename the columns 
    data_process.rename(columns={'tran_date': 'recency',
        'transaction_id': 'frequency',
        'total_amt': 'monetary'}, inplace=True)
    # Debugging
    print('{:,} rows; {:,} columns'
      .format(data_process.shape[0], data_process.shape[1]))
    
    # If you want, plot the RFM distributions
#    plt.figure(figsize=(12,10))
    # Plot distribution of R
#    plt.subplot(3, 1, 1); sns.distplot(data_process['recency'])
    # Plot distribution of F
#    plt.subplot(3, 1, 2); sns.distplot(data_process['frequency'])
    # Plot distribution of M
#    plt.subplot(3, 1, 3); sns.distplot(data_process['monetary'])
    # Show the plot
    #plt.show()

    # # # DATA PROCESSING : COMPUTE RFM GROUPS

    # Create labels for Recency and Frequency
    r_labels = range(4, 0, -1) #from 4 to 1, decreasing by 1
    f_labels = range(1, 5) #from 1 to 4, increasing by 1
    m_labels = range(1, 5)
    # Assign these labels to 4 equal percentile groups (qcut = quantile-based discretization)
    r_groups = pd.qcut(data_process['recency'].rank(method='first'), q=4, labels=r_labels)
    f_groups = pd.qcut(data_process['frequency'].rank(method='first'), q=4, labels=f_labels)
    m_groups = pd.qcut(data_process['monetary'].rank(method='first'), q=4, labels=m_labels)
    # Create new columns R, F, M
    data_process = data_process.assign(R = r_groups.values, F = f_groups.values, M = m_groups.values)
    #data_process.head()

    # # # DATA PROCESSING : CREATE SEGMENTS (a possible solution)

    # Concat RFM quartile values to create RFM Segments
    data_process['RFM_Segment_Concat'] = data_process.apply(join_rfm, axis=1)
    rfm = data_process.sort_values(by=['R','F','M'])
    rfm.head()

    # Count num of unique segments
    rfm_count_unique = rfm.groupby('RFM_Segment_Concat')['RFM_Segment_Concat'].nunique()
    print("Unique segments: ", rfm_count_unique.sum())

    # Calculate RFM_Score from segments
    rfm['RFM_Score'] = rfm[['R','F','M']].sum(axis=1)
    #print(rfm['RFM_Score'].head())
    
    # Create a new variable RFM_Level
    rfm['RFM_Level'] = rfm.apply(rfm_level, axis=1)

    # Write processed data in a csv file
    rfm.to_csv(path+'rfm_data.csv', index=True)

    # Print some aggregated info on rfm levels
    # Calculate average values for each RFM_Level, and return a size of each segment 
    rfm_level_agg = rfm.groupby('RFM_Level').agg({
        'recency': 'mean',
        'frequency': 'mean',
        'monetary': ['mean', 'count']
    }).round(1)
    # Print the aggregated data
    print("Rfm levels infos: ", rfm_level_agg)

    # # # DATA PROCESSING : CREATE SEGMENTS R,F,avgM
    rfm.reset_index(inplace=True)
    rfm_segments = rfm.groupby(['R', 'F']).agg({
        'monetary' : 'mean',
        'cust_id' : 'count',
        'RFM_Level' : lambda x: x.value_counts().index[0]
    })
    rfm_segments.reset_index(inplace=True)
    rfm_segments.columns = ['R','F','Avg_M', 'Count', 'RFM_Level']
    rfm_segments = rfm_segments.sort_values(by=['R', 'F'], ascending=True)

    #Write to csv also the segments infos
    rfm_segments.to_csv(path+'rfm_segments.csv', index=False)

# To run it outside app.py
#rfm()