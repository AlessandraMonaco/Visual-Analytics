import flask
from flask import Flask, render_template, request 
import run_pca_kmeans, create_shared_dataset
 
# Initialise app: create a new Flask application
app = Flask(__name__)

# Basic function to call the index.html template
@app.route('/' ) #app.route() tells us what URL triggers our next function ('/' = no url)
def index():
    # Create a unique preprocessed dataset from multiple files
    create_shared_dataset.create_csv()
    # Run pca and K-Means on default values
    run_pca_kmeans.clustering(2,4)
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
    # Return again the same html template
    return render_template('index.html')



####
# Code to actually run the Flask app
if(__name__ == '__main__'):
    app.run(debug = True)