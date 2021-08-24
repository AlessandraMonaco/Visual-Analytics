# # # DATA PREPARATION AND LOADING

# Import needed libraries
import pandas as pd
import numpy as np
import sklearn
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans

# Read csv file
path = "C:/Users/user/Documents/GitHub/Visual-Analytics/dataset/"
data = pd.read_csv(path+"full_data.csv")
print(data.head())


# # # DATA PREPROCESSING

# Group quantity by customer_id and product subcategory name, such that, for each 
# customer id, you will count the total number of bought products of each subcategory
# Result: dataframe with cols: ["cust_id", "prod_subcat", "Qty"]
gr_data = data.groupby(['cust_id', 'prod_subcat'])["Qty"].apply(lambda x : x.astype(int).sum()).to_frame()
gr_data = gr_data.reset_index()
print(gr_data.head())

# Pivot the table to denormalize subcategory rows
# Result: dataframe with cols: ['cust_id', 'Academic', 'Audio and video', 'Bath', 
# 'Cameras', 'Children', 'Comics', 'Computers', 'DIY', 'Fiction', 'Furnishing', 
# 'Kids', 'Kitchen', 'Mens', 'Mobiles', 'Non-Fiction', 'Personal Appliances', 'Tools', 'Women']
gr_data = gr_data.pivot(index="cust_id", columns="prod_subcat", values="Qty")
gr_data = gr_data.fillna(0) #remove NaN and put '0'
print(gr_data.head())

# Get feature names
features = gr_data.columns[1:].tolist()
print("Features: ", features)
# Get customer ids
gr_data = gr_data.reset_index()
print(gr_data.head())
customers = gr_data.cust_id.tolist()
print("Customers: ", customers)

# Separating out the features
x = gr_data.loc[:, features].values
print("Values: ", x)

# Standardizing the features
x = StandardScaler().fit_transform(x)
print("Standardized values: ", x)


# # # DATA PROCESSING: PCA + KMEANS

# Applying PCA
pca = PCA(n_components=2)
principalComponents = pca.fit_transform(x) #vector of principal components for each cust_id
principalDf = pd.DataFrame(data = principalComponents, columns = ['pc_1', 'pc_2'])
principalDf = pd.concat([gr_data['cust_id'], principalDf], axis = 1)
print("principalDf.head", principalDf.head())

# Running K-MEANS
n_clusters = 4
kmeans = KMeans(n_clusters=n_clusters, random_state=0).fit(x)
print("kmeans.labels_: ", kmeans.labels_)
print("cluster centers: ", kmeans.cluster_centers_)

# Append labels on dataframe and write it to csv file
labels = pd.Series(kmeans.labels_)
clusteredDf = pd.concat([principalDf, labels], axis = 1)
clusteredDf = clusteredDf.rename(columns={"cust_id": "cust_id", "pc_1": "pc_1", "pc_2": "pc_2", 0: "cluster"})
print("clusteredDf.head \n", clusteredDf.head())
clusteredDf.to_csv(path+'pca_kmeans_data.csv', index=False) #write clustered data to csv