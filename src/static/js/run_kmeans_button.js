$(document).ready(function(){

    //Show the inserted value in the input box
    document.getElementById("n_components").value = localStorage.getItem("n_components");
    document.getElementById("n_clusters").value = localStorage.getItem("n_clusters");
    
})

//On submit button
function RunKmeans() {

    //Read the inserted parameters
    var n_components = document.getElementById("n_components").value;
    var n_clusters = document.getElementById("n_clusters").value;

    //Save the inserted value to display it in the input box
    localStorage.setItem("n_components", n_components);
    localStorage.setItem("n_clusters", n_clusters);
    //location.reload(); //reloading the page
    
    //Pass the inserted parameters to Python script
    /*$.getJSON(
        "/prova.py",
        $.param({
            n_components : n_components,
            n_clusters : n_clusters
        }, true)
    );*/

    /*$.ajax({
        url: "prova.py",
       context: document.body
      }).done(function() {
       alert('finished python script');;
      });*/

    return false;
    
}


    
//Pass the data along to Python
/*$.getJSON(
    '/python_function_name',
    $.param({ n_components: n_components, n_clusters: n_clusters }, true)
);*/

/* To retrieve in Flask use:
n_components = request.args.get('n_components') #getList if many values
n_clusters = request.args.get('n_clusters')
print(n_components, n_clusters) 
*/
