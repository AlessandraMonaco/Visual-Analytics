$(document).ready(function(){

    // Get all the cust_id of the selected cluster
    d3.csv("static/dataset/pca_kmeans_data.csv",  function(data) {
        var nested_data = d3.nest()
        .key(function(d){ return d.cluster; })
        .entries(data);

         console.log(nested_data);
        // FILTER BY SELECTING ON A CLUSTER
        d3.selectAll(".dot")
            .on("click", function(d) {
        console.log(d.cluster);

        // Take the cluster selected
        selected_cluster = d.cluster;
        
        // Get all the customers of that cluster
        var customers = [];
        nested_data.forEach(function(d){
            if (d.key==selected_cluster) {
                var cluster_array = d.values;
                cluster_array.forEach(function(f) {
                    var cust = f.cust_id;
                    customers.push(cust);
                });
            }
            console.log(customers);
        });
        
        // Filter all the visualizations basing on those customers list


        }); //close csv
    }); //close onclick

    
}); //close document ready