import flask
from flask import Flask, render_template, send_file, make_response, url_for, Response, redirect, request 
 
#initialise app
app = Flask(__name__)

#decorator for homepage 
@app.route('/' )
def index():
    return render_template('index.html',PageTitle = "Landing page")

if(__name__ == '__main__'):
    app.run(debug = True)
#n_components = request.args.get('n_components') #getList if many values
#n_clusters = request.args.get('n_clusters')

#text_file = open("./sample.txt", "w")
#n = text_file.write(n_components+" "+n_clusters)
#text_file.close()
print("Hellooo")
#print(n_components, n_clusters) 

