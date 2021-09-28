$(document).ready(function(){




    // Get all the cust_id of the selected cluster
    d3.csv("static/dataset/pca_kmeans_data.csv",  function(data) {
        var nested_data = d3.nest()
        .key(function(d){ return d.cluster; })
        .entries(data);

         console.log(nested_data);

          //
        var filterCustomers = function(d){
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
            });
            console.log(customers);

            // FILTER BASING ON CUSTOMER LIST

            d3.csv("static/dataset/full_data.csv",  
                
                // FILTER LINECHART
                function(d){
                    if (customers.includes(d.cust_id)) {
                        //console.log(d);
                        return { date : d3.timeParse("%Y-%m-%d")(d.tran_date), 
                              profit : d.total_amt, 
                              sales : d.Qty
                        }
                    }
                  },  
                
                  function(full_data) {   

                    //Drop previous visualization
                    d3.select("#line-chart svg").remove()
                    //Add the new visualization
                    var svg = d3.select("#line-chart")
                    .append("svg")
                    .attr("width", lin_width + lin_margin.left + lin_margin.right)
                    .attr("height", lin_height + lin_margin.top + lin_margin.bottom)
                    .append("g")
                    .attr("transform",
                        "translate(" + lin_margin.left + "," + lin_margin.top + ")");    
                    // add the options to the button
                    var y_value = document.getElementById('select-y').value;
                    
                    //Filter the full_data array


                    //Initialize with Profits
                    if(typeof y_value == 'undefined') {
                    linechart_from_csv(svg,full_data,"Profit");
                    }
                    else {linechart_from_csv(svg,full_data,y_value);}



                    // FILTER CALENDAR
                    //Create chart
                    d3.select("#calendar-heatmap svg").remove()
                    var svg_cal = d3.select("#calendar-heatmap").append("svg")
                    .attr("width", "420px")
                    .attr("viewBox","0 0 "+(xOffset+year_width)+" 540")

                    //At the beginning, initialize the graph with profits
                    var y_value_cal = document.getElementById("select-y-cal").value;
                    calendar_from_csv(svg_cal,full_data,y_value_cal);


                    // RECOMPUTE AGGREGATED VALUES
                    compute_aggregated_values(full_data);                  

            }); //end csv full_data

            // FILTER TREEMAP VISUALIZATION
            d3.csv("static/dataset/full_data.csv",  
                
                // Get only selected customers
                function(d){
                    if (customers.includes(d.cust_id)) {
                        return d;
                    }
                },  
                
                function(tm_data) {
                    d3.select("#treemap .treemap").remove();
                    treemap_from_csv(tm_data); 
            }); //end csv full data
        }




        // FILTER BY SELECTING ON A CLUSTER
        d3.selectAll(".dot")
            .on("click", filterCustomers);

    }); //close csv

    
}); //close document ready