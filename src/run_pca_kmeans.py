# # # DATA PREPARATION AND LOADING

# Import needed libraries
import pandas as pd
import numpy as np
import sklearn
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

def clustering(n_components, n_clusters):
    # Read csv file
    path = "src/static/dataset/"
    data = pd.read_csv(path+"full_data.csv")
    print(data.head())


    # # # DATA PREPROCESSING

    # Group quantity by customer_id and product subcategory name, such that, for each 
    # customer id, you will count the total number of bought products of each subcategory
    # Result: dataframe with cols: ["cust_id", "prod_subcat", "Qty"]
    gr_data = data.groupby(['cust_id', 'prod_cat', 'prod_subcat'])["Qty"].apply(lambda x : x.astype(int).sum()).to_frame()
    gr_data = gr_data.reset_index()
    gr_data["prod_subcat"] = "("+gr_data["prod_cat"]+") "+gr_data["prod_subcat"] #concatenate strings (cat,subcat)
    print(gr_data.head())

    # Pivot the table to denormalize subcategory rows
    # Result: dataframe with cols: ['Bags, Women', 'Books, Academic', 'Books, Children', 'Books, Comics', 
    # 'Books, DIY', 'Books, Fiction', 'Books, Non-Fiction', 'Clothing, Kids', 'Clothing, Mens', 
    # 'Clothing, Women', 'Electronics, Audio and video', 'Electronics, Cameras', 'Electronics, Computers', 
    # 'Electronics, Mobiles', 'Electronics, Personal Appliances', 'Footwear, Kids', 'Footwear, Mens', 
    # 'Footwear, Women', 'Home and kitchen, Bath', 'Home and kitchen, Furnishing', 
    # 'Home and kitchen, Kitchen', 'Home and kitchen, Tools']
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
    #print("Customers: ", customers)

    # Separating out the features
    x = gr_data.loc[:, features].values
    print("Values: ", x)

    # Standardizing the features
    scaler = StandardScaler().fit(x)
    x = scaler.transform(x)
    print("Standardized values: ", x)


    # # # DATA PROCESSING: PCA + KMEANS

    # Applying PCA
    pca = PCA(n_components=n_components)
    principalComponents = pca.fit_transform(x) #vector of principal components for each cust_id
    #We store just the first 2 components for the 2d visualization
    principalDf = pd.DataFrame(data = principalComponents[:,:2], columns = ['pc_1', 'pc_2'])
    principalDf = pd.concat([gr_data['cust_id'], principalDf], axis = 1)
    print("principalDf.head", principalDf.head())

    # Running K-MEANS
    kmeans = KMeans(n_clusters=n_clusters, random_state=0).fit(principalComponents)
    print("kmeans.labels_: ", kmeans.labels_)
    print("cluster centers: ", kmeans.cluster_centers_)

    # Append labels on dataframe and write it to csv file
    labels = pd.Series(kmeans.labels_)
    clusteredDf = pd.concat([principalDf, labels], axis = 1)
    clusteredDf = pd.concat([clusteredDf, gr_data.loc[:, features]], axis=1)
    clusteredDf = clusteredDf.rename(columns={"cust_id": "cust_id", "pc_1": "pc_1", "pc_2": "pc_2", 0: "cluster"})
    print("clusteredDf.head \n", clusteredDf.head())
    clusteredDf.to_csv(path+'pca_kmeans_data.csv', index=False) #write clustered data to csv
    
    # Compute clustering metrics
    #Silhouette_score => perspective into the density and separation of the formed clusters 
    #It's value is in the interval [-1,1] (HIGH IS BETTER)
    silhouette_avg = silhouette_score(principalComponents, labels)
    print("Silhouette score: ", silhouette_avg)
    #Inertia : Inertia measures how well a dataset was clustered by K-Means. 
    #It is calculated by measuring the distance between each data point and its centroid, 
    #squaring this distance, and summing these squares across one cluster. (LOW IS BETTER)
    inertia = kmeans.inertia_
    print("Inertia: ", inertia)
    #PCA Explained Variance Ratio : The explained variance ratio is the percentage of variance that 
    #is attributed by each of the selected components. Ideally, you would choose the number of components 
    #to include in your model by adding the explained variance ratio of each component until you reach a 
    #total of around 0.8 or 80% to avoid overfitting.
    variance = pca.explained_variance_ratio_
    variance_2decimals = []
    for value in variance:
        variance_2decimals.append(float(round(value, 2))) #round variance values to 2 decimals
    print("PCA Explained Variance Ratio: ", variance_2decimals)
    # Store metrics in a csv
    metrics_df = pd.DataFrame(columns=['silhouette', 'inertia', 'pca_variance'])
    metrics_df.loc[0] = [silhouette_avg,inertia,variance_2decimals]
    metrics_df.to_csv(path+'clustering_metrics_data.csv', index=False) #write clustered data to csv

    return "done!"
