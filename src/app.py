import flask
from flask import Flask, render_template, request 
import run_pca_kmeans, create_shared_dataset, run_rfm, create_customer_summary
 
#Flask variables can be displayed in HTML by wrapping them in the double braces ({{ }})

# Initialise app: create a new Flask application
app = Flask(__name__)

# Basic function to call the index.html template
@app.route('/') #app.route() tells us what URL triggers our next function ('/' = no url)
def index():
    # Create a unique preprocessed dataset from multiple files
    create_shared_dataset.create_csv()
    # Run pca and K-Means on default values
    run_pca_kmeans.clustering(2,4)
    # Run rfm segmentation
    run_rfm.rfm()
    # Create customer summary for the segment table
    create_customer_summary.customer_summary()
    # Return home page
    return render_template('index.html') # the return type is HTML


###
# Services

# Service to run the PCA+K-Meas clustering script on new parameters
# It is triggered by the submit button of the form
@app.route('/runcluster', methods = ['GET', 'POST'] )
def run_clustering():
    # Read inserted parameters
    n_components = request.args.get('n_components') #getList if many values
    n_clusters = request.args.get('n_clusters')
    # Trigger the kmeans function in external .py file (this function creates a csv file)
    run_pca_kmeans.clustering(int(n_components),int(n_clusters)) 
    # Recreate customer summary for the segment table
    create_customer_summary.customer_summary()
    # Return again the same html template
    return render_template('index.html')

# Service to filter the csv dataset based on user selections
# It reads all the actual selections (category/categories, sex, city, cluster, rfm segment)
# and applies the selections on the standard full_data csv (after having recrated id), 
# storing the filtered data in the same full_data file
@app.route('/applyfilters', methods = ['GET', 'POST'] )
def filter_csv():
    # Start with the full dataset (to remove previous filters)
    create_shared_dataset.create_csv()
    # Read inserted parameters (callig them by their 'name' value)
    sex = request.args.get('sex')
    city = request.args.get('city')
    shop = request.args.get('shop') 
    # Call the function to create the filtered dataset
    create_shared_dataset.filter_csv(sex,city,shop)
    # Run K-Means Clustering on the new data (with default params)
    run_pca_kmeans.clustering(2,4) 
    # Run again rfm segmentation on the new data
    run_rfm.rfm()
    # Recreate customer summary for the segment table
    create_customer_summary.customer_summary()
    # Return again the same html template
    return render_template('index.html')

# Service to reset the original visualization, removing all selections
@app.route('/reset', methods = ['GET', 'POST'] )
def reset():
    return index()

    
####
# Code to actually run the Flask app
if(__name__ == '__main__'):
    app.run(debug = True)