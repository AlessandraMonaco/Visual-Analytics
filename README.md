# Implementation of a Visual Analytics dashboard for Sales Analysis and Customer Segmentation in Retail
 
 ## Introduction
 This projects implements a dashboard for Visual Analytics in Retail, using javascript (d3.js) for the front-end and python (Flask, Scikit-learn, Numpy, Pandas) for back-end and analytical computations.
 The goal of the visual analysis is to support retailers' decision making in order to maximize profits, allowing for  better resource allocation (buy from the producers only what is more likely to be purchased by customers), more effective targeted advertising (focusing on groups of customers with similar characteristics), more proficient marketing (treating customers differently depending on their value, loyalty, proficiency), improving cutomer satisfaction (the market is aligned with customers' needs and interests). The dashboard provides a visual and interactive interface for sales analyses from different perspectives (trends, seasonalities, patterns, categorical analyses), market segmentation and segment analysis. Different approaches have been proposed for customer segmentation in literature (rfm, supervised, unsupervised, mixed, rule-based, demographic,...), and there is not always a best choice: it depends on what data are available and on business needs. This project proposes 2 types of segmentation: (i) Recency-Frequency-Monetary (RFM) model and (ii) Unsupervised Clustering (K-Means) on principal components obtained running PCA on categorical sales features. The first is about splitting customers depending on their purchase behavior (how frequent and recent they spend, how much they spend, so, HOW they buy), the latter is focused on customer interests, creating clusters of customers that purchased products belonging to the same subset of subcategories (so, WHAT they buy). The end-user can easily interact with categories, clusters or rfm segments to filter the visualizations and exploit the power of Visual Analytics for quick insights.
 
A detailed description of the project can be found in [VA_ProjectReport.pdf](https://github.com/AlessandraMonaco/Visual-Analytics/blob/master/VA_ProjectReport.pdf)

 ## Dataset
 The dataset used in this project is from Kaggle and describes sales of a fictional multiple retailer. It includes 3 csv files:
 * ```Customers.csv``` stores demographic information about customers, such as id, day of birth, gender and the code of the city in which he is located;
 * ```prod_cat_info.csv``` stores information regarding inclusion relationships between product categories;
 * ```Transactions.csv``` stores purchases made by customers for certain product categories, including the product quantity, the date, the total amount spent, the store type and other less relevant information.
 
The dataset contains 6 product macro-categories (Bags, Books, Clothing, Electronics,Footwear, Home and Kitchen), 23 053 transactions and 5 647 customers (but only 5 506 of them have at least one associated transaction). To limit file access and build a quickly responsive system, the original dataset is merged into a single (and more redundant) csv file (```full_data.csv```) with shape (23 053, 15), storing the following information: transaction id, customer id, transaction date, code and name of the product subcategory, code and name of the product category, product quantity, rate, tax, total amount spent in this transaction, store type, customer day of birth,customer gender, customer city code.
 
 ## How to run this project
 To try the interactive dashboard on your local machine, run the server file ```/src/app.py ``` and reach http://127.0.0.1:5000/ through your browser.

 ## Snapshots of the system
 ### Dashboard snapshot
 ![alt text](https://github.com/AlessandraMonaco/Visual-Analytics/blob/master/screenshots/dashboard_screenshot.PNG)

 ### Dashboard snapshot with RFM filtering (and mouse over one RFM segment)
 ![alt text](https://github.com/AlessandraMonaco/Visual-Analytics/blob/master/screenshots/dashboard_filter_rfm.png)

 ### Dashboard snapshot with Cluster filtering (and mouse over calendar heatmap day)
 ![alt text](https://github.com/AlessandraMonaco/Visual-Analytics/blob/master/screenshots/dashboard_filter_cluster.png)

 ### Dashboard snapshot with Electronics products filtering (and mouse over subcategory)
 ![alt text](https://github.com/AlessandraMonaco/Visual-Analytics/blob/master/screenshots/dashboard_filter_category.png)



 ## References
 * Dataset : [Kaggle Retail dataset](https://www.kaggle.com/darpan25bajaj/retail-case-study-data)
 * Paper that inspired this project : [Mohammad Hafiz Hersyah Miftahul Jannah Ricky Akbar, Meza Silvana. **Implementation of Business Intelligence for Sales Data Management Using Interactive Dashboard Visualization in XYZ Stores.** *International Conference on Information Technology Systems and Innovation (ICITSI)*, 2020.](https://ieeexplore.ieee.org/document/9264984)
 * Papers on Customer Segmentation : 
    * [Rajesh Parekh Ron Kohavi. **Visualizing RFM Segmentation.** *Proceedings of the 2004 SIAM international conference*, 2004.](https://www.researchgate.net/publication/220906727_Visualizing_RFM_Segmentation)
    * [A. S. M. Shahadat Hossain. **Customer Segmentation using Centroid Based and Density Based Clustering Algorithms**. *3rd International Conference on Electrical Information and Communication Technology (EICT)*, 2017.](https://ieeexplore.ieee.org/document/8275249)
    * [Saraswati Jadhav Rahul Shirole, Laxmiputra Salokhe. **Customer Segmentation using RFM Model and K-Means Clustering.** *International Journal of Scientific Research in Science and Technology (IJSRST), 8(3)*, 2021.](https://www.researchgate.net/publication/352393770_Customer_Segmentation_using_RFM_Model_and_K-Means_Clustering)
 * Paper to improve parallel coordinates visualization : [Bertjan Broeksema Julian Heinrich. **Big Data Visual Analytics with Parallel Coordinates.** *Big Data Visual Analytics (BDVA)*, 2015](https://ieeexplore.ieee.org/abstract/document/7314286)
