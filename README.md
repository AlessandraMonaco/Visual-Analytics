# Implementation of a Visual Analytics dashboard for Sales Analysis and Customer Segmentaton in Retail
 
 ## Introduction
 This projects implements a dashboard for Visual Analytics in Retail, using javascript (d3.js) for the front-end and python (Flask, Scikit-learn, Numpy, Pandas) for back-end and analytical computations.
 The goal of the visual analysis is to support retailers' decision making in order to maximize profits, allowing for  better resource allocation (buy from the producers only what is more likely to be purchased by customers), more effective targeted advertising (focusing on groups of customers with similar characteristics), more proficient marketing (treating customers differently depending on their value, loyalty, proficiency), improving cutomer satisfaction (the market is aligned with customers' needs and interests). The dashboard provides a visual and interactive interface for sales analyses from different perspectives (trends, seasonalities, patterns, categorical analyses), market segmentation and segment analysis. Different approaches have been proposed for customer segmentation in literature (rfm, supervised, unsupervised, mixed, rule-based, demographic,...), and there is not always a best choice: it depends on what are available and on business needs. This project proposes 2 types of segmentation: (i)Recency-Frequency-Monetary (RFM) model and (ii) Unsupervised Clustering (K-Means) on principal components obtained running PCA on categorical sales features. The first is about splitting customers depending on their purchase behavior (how frequent and recent they spend, how much they spend, so, HOW they buy), the latter is focused on customer interests, creating clusters of customers that purchased products belonging to the same subset of subcategories (so, WHAT they buy). The end-user can easily interact with categories, clusters or rfm segments to filter the visualizations and exploit the power of Visual Analytics for quick insights.

 ## Dataset
 The dataset used in this project is from Kaggle and describes sales of a fictional multiple retailer. It includes 3 csv files:
 * ```Customers.csv``` stores demographic information about customers, such as id, day of birth, genderand the code of the city in which he is located;
 * ```prod_cat_info.csv``` stores information regarding inclusionrelationships between product categories;
 * ```Transactions.csv``` stores purchases made by customers for certainproduct categories, including the product quantity, the date, the total amount spent, the store type and otherless relevant information.
 
The dataset contains 6 product macro-categories (Bags, Books, Clothing, Electronics,Footwear, Home and Kitchen), 23 053 transactions and 5 647 customers (but only 5 506 of them have at leastone associated transaction).To limit file access and build a quickly responsive system, the original dataset is merged into a single (andmore redundant) csv file (full_data.csv) with shape (23 053, 15), storing the following information: transactionid, customer id, transaction date, code and name of the product subcategory, code and name of the productcategory, product quantity, rate, tax, total amount spent in this transaction, store type, customer day of birth,customer gender, customer city code.
 
 ## How to run this project
 To try the interactive dashboard on your local machine, run the server file ```/src/app.py ``` and reach http://127.0.0.1:5000/ through your browser.


 ## References
 
