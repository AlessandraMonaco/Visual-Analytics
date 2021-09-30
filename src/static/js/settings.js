//Setting default parameters
var best_n_clusters = 4;
var best_n_components = 2;

//when browser closed clear storage (TO DO: ONLY IF THE BUTTON RUN KMEANS AND FILTER ARE NOT CLICKED)
/*$(window).on("unload", function(e) {
    window.localStorage.clear();
});*/


$(document).ready(function(){

    //-----------------------------------------------------------------
    // SHOW INSERTED PARAMETERS

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
    //else {document.getElementById("shop").value = "all";}


    //-----------------------------------------------------------------
    // ADD OPTIONS IN SHOP SELECTOR
    //Read the data
    d3.csv("static/dataset/Transactions.csv", 
        function(d){
            return { store : d.Store_type
            }
        },

        function(data) {


            /*var shops = d3.map(data, function(d){return d.store;}).keys();
            shops.push("All shops");

            d3.select("#shop").append("option")
            .text("- Shop -")
            .attr("value","")
            .attr("disabled", "True");

            d3.select("#shop").selectAll(null)
                .data(shops)
                .enter()
                .append("option")
                .text(function(d){return d;})
                .attr("value",function(d){if (d=="All shops") {return "all";} else return d;});
            console.log(d3.map(data, function(d){return d.store;}).keys());
*/
            
        });

    //Store_type
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
    console.log(shop);

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
