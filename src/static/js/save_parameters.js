//Setting default parameters
var best_n_clusters = 4;
var best_n_components = 2;

$(document).ready(function(){

    // For the K-Means parameters
    if (localStorage.getItem("n_components")) {
        document.getElementById("n_components").value = localStorage.getItem("n_components");
    }
    else {document.getElementById("n_components").value = best_n_components;}

    if (localStorage.getItem("n_clusters")) {
        document.getElementById("n_clusters").value = localStorage.getItem("n_clusters");
    }
    else {document.getElementById("n_clusters").value = best_n_clusters;}

    // For the filter box
    if (localStorage.getItem("city")) {
        document.getElementById("city").value = localStorage.getItem("city");
    }
    else {document.getElementById("city").value = "all";}

    if (localStorage.getItem("sex")) {
        document.getElementById("sex").value = localStorage.getItem("sex");
    }
    else {document.getElementById("sex").value = "all";}

    if (localStorage.getItem("shop")) {
        document.getElementById("shop").value = localStorage.getItem("shop");
    }
    else {document.getElementById("shop").value = "all";}


    
})


//On submit button for kmeans
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


//On submit button for filtering data
function FilterData() {
    //Read the inserted parameters
    var city = document.getElementById("city").value;
    var sex = document.getElementById("sex").value;
    var shop = document.getElementById("shop").value;

    //Save the inserted value to display it in the input box
    localStorage.setItem("city", city);
    localStorage.setItem("sex", sex);
    localStorage.setItem("shop", shop);
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
