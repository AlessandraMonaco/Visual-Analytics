$(document).ready(function(){
    var cluster_color = [ "#e41a1c", "#377eb8", "#4daf4a", "#ff7f00", "#ffff33", "#a65628" ];



    // Get all the cust_id of the selected cluster
    d3.csv("static/dataset/pca_kmeans_data.csv",  function(data) {

        // Color scale: give me a cluster name, I return a color
        var color = d3.scaleOrdinal()
        .domain(d3.extent(data, function(d) { return +parseInt(d.cluster); }))
        .range(cluster_color)

        //Compute cluster size
        var sizes = {};
        data.forEach(function(r) {
            if (!sizes[r.cluster]) {
                sizes[r.cluster] = 0;
            }
            sizes[r.cluster]++;
        });

        var nested_data = d3.nest()
        .key(function(d){ return d.cluster; })
        .entries(data);

         console.log(nested_data);

        function filterFullDataByCustomers(customers) {
            d3.csv("static/dataset/full_data.csv",  
                
                function(d){
                    if (document.getElementById("cluster-selector-select").value == 'all') {
                        // take all data
                        return { date : d3.timeParse("%Y-%m-%d")(d.tran_date), 
                            profit : d.total_amt, 
                            sales : d.Qty,
                            Qty : d.Qty,
                            prod_cat : d.prod_cat,
                            prod_subcat : d.prod_subcat
                        }
                    }
                    else { //filter customer ids
                        if (customers.includes(d.cust_id)) {
                            //console.log(d);
                            return { date : d3.timeParse("%Y-%m-%d")(d.tran_date), 
                                profit : d.total_amt, 
                                sales : d.Qty,
                                Qty : d.Qty,
                                prod_cat : d.prod_cat,
                                prod_subcat : d.prod_subcat
                            }
                        }
                    }
                },  
                
                function(full_data) {   

                    // FILTER LINE CHART
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

                    var y_value_cal = document.getElementById("select-y-cal").value;
                    calendar_from_csv(svg_cal,full_data,y_value_cal);


                    // RECOMPUTE AGGREGATED VALUES
                    compute_aggregated_values(full_data);                  


                    // FILTER TREEMAP VISUALIZATION
                    d3.select("#treemap .treemap").remove();
                    treemap_from_csv(full_data); 
            
            }); //end csv full data
        }



        var filterByCluster = function(){

            // recover the option that has been chosen
            options =  this.selectedOptions;

            //tooltip
            var tooltip = d3.select('#scatter .tooltip');
            
            //All grey
            //console.log(this.selectedOptions);
            d3.selectAll(".dot")
            .transition()
            .duration(200)
            .style("fill", unselected_color)
            .attr("r", 1);

            // first every group turns grey
            d3.selectAll(".pline")
            .transition().duration(200)
            .style("stroke", "grey")
            .style("opacity", "0.1");

            //Highlight selected
            var tool_val = 0;
            var cluster_val = "";
            var selected_clusters = [];
            for (var i=0; i<options.length; i++) {
                selected_cluster = options[i].value;
                console.log(selected_cluster)
                tool_val += sizes[selected_cluster];
                cluster_val += selected_cluster.toString() + " ";
                selected_clusters.push(selected_cluster);
            
                d3.selectAll(".dot" + selected_cluster)
                    .transition()
                    .duration(200)
                    .style("fill", color(selected_cluster))
                    .attr("r", 1.5);
                
                    // Highlight in parallel coordinates
                    d3.selectAll(".pline" + selected_cluster)
                    .transition().duration(200)
                    .style("stroke", color(selected_cluster))
                    .style("opacity", "1");

                    

                if(selected_cluster=="all") {
                    d3.selectAll(".dot")
                    .transition()
                    .duration(200)
                    .style("fill", function(d) { return color(d.cluster);})
                    .attr("r", 1);
                
                    // Highlight in parallel coordinates
                    d3.selectAll(".pline")
                    .transition().duration(200)
                    .style("stroke", function(d) { return color(d.cluster);})
                    .style("opacity", "1");

                    //Hide tooltip
                    tooltip
                    .style("opacity", 0);

                    /*Reset selector on All Data ('all' can not be selected together with other 
                    clusters, it does not make sense)*/
                    d3.select('#cluster-selector-select').property('value', 'all');
                    break;

                }
            }

            if (options.length==1) {
                if(options[0].value!='all') {
                    // Show tooltip
                    tooltip
                    .html("CLUSTER " + options[0].value +
                    "<br>("+ sizes[options[0].value] +" customers)")
                    .style("opacity", 1)
                    .style("left", 50 + "px")
                    .style("top", 1 + "px");
                }
            }

            else {
               // Show tooltip
               tooltip
               .html("CLUSTER " + cluster_val +
               "<br>("+ tool_val +" customers)")
               .style("opacity", 1)
               .style("left", 50 + "px")
                .style("top", 1 + "px"); 
            }



                
            // Get all the customers of that cluster
            var customers = [];
            nested_data.forEach(function(d){
                if (selected_clusters.includes(d.key)) {
                    var cluster_array = d.values;
                    cluster_array.forEach(function(f) {
                        var cust = f.cust_id;
                        customers.push(cust);
                    });
                }    
            });
            console.log(customers);

            // FILTER BASING ON CUSTOMER LIST
            filterFullDataByCustomers(customers);
           



            

            // HIGHLIGHT SCATTERPLOT AND PARALLEL SETTING CLUSTER SELECTOR
            //d3.select('#cluster-selector-select').property('value', selected_cluster);


            // FILTER CUSTOMERS IN THE RFM PARALLEL COORDINATE SEGMENTATION
        }




        // FILTER BY SELECTING ON A CLUSTER


        //Add the cluster selector legend
        // add the options to the button
        // List of groups (here I have one group per column)
        var allGroup = d3.range(d3.min(data, function(d) { return +parseInt(d.cluster); }),
            d3.max(data, function(d) { return +parseInt(d.cluster); })+1);
        
        // Add option to select all clusters
        var legend = d3.select("#cluster-selector-select")
        .append("option")
        .text("All data ") // text showed in the menu
        .attr("value", function (d) { return "all"; }) // corresponding value returned by the button
        .attr("selected", "true")
        .style("color", "grey")
        .style("background", "#1b1b1b")
        .style("font-size", "10px")

        legend = d3.select("#cluster-selector-select")
            .selectAll('myClusters')
            .data(allGroup)
            .enter()
            .append("option")
            .text(function (d) { return "CLUSTER "+d; }) // text showed in the menu
            .attr("value", function (d) { return d; }) // corresponding value returned by the button
            .style("color", function(d) { return color(d); })
            .style("background", "#1b1b1b")
            .style("font-size", "10px")

            // Highlight points and lines of selected cluster(s)
            d3.select("#cluster-selector-select")
            .on('change', filterByCluster);

                
                
        


    }); //close csv

    
}); //close document ready