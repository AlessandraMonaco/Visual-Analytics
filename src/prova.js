$(document).ready(function(){
    //Get selected data
var n_components = document.getElementById("n_components").value;
var n_clusters = document.getElementById("n_clusters").value;

alert(n_components, n_clusters);

//Pass the data along to Python
$.getJSON(
    '/python_function_name',
    $.param({ n_components: n_components, n_clusters: n_clusters }, true)
);

/* To retrieve in Flask use:
n_components = request.args.get('n_components') #getList if many values
n_clusters = request.args.get('n_clusters')
print(n_components, n_clusters) 
*/
})