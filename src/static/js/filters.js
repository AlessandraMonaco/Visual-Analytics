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

         //console.log(nested_data);

        function filterFullDataByCustomers(customers,filter) {
            d3.csv("static/dataset/full_data.csv",  
                
                function(d){
                    if (document.getElementById("cluster-selector-select").value == 'all' &&
                    filter=='cluster' || customers.length==0) {
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

        function filterRfmDataByCustomers(customers, filter) {
            d3.csv("static/dataset/rfm_data.csv", function(data) {

                //filter basing on customers
                if (document.getElementById("cluster-selector-select").value == 'all' &&
                filter == 'cluster') {
                    new_data = data;
                }
                else {
                    new_data = data.filter(function(d){ return customers.includes(d.cust_id);});
                }

                //remove old data
                var svg = d3.select('#rfm_parallel svg g');
                svg.selectAll(".p2line").remove();

                //show new data 
                // Draw the lines
                // line to draw for this raw.
                rfm_parallel_from_csv(svg,dimensions,new_data);

            });
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
            //console.log(customers);

            // FILTER FULL DATA BASING ON CUSTOMER LIST
            filterFullDataByCustomers(customers, 'cluster');
           // FILTER RFM DATA BASING ON CUSTOMER LIST
           filterRfmDataByCustomers(customers, 'cluster');



            

            // HIGHLIGHT SCATTERPLOT AND PARALLEL SETTING CLUSTER SELECTOR
            //d3.select('#cluster-selector-select').property('value', selected_cluster);


            // FILTER CUSTOMERS IN THE RFM PARALLEL COORDINATE SEGMENTATION
        }

        var filterBySegment = function(d) {

            if(d3.select(this).attr("class")=="unselected") {
                already_selected = false;
                // Set class "selected" to that rect
                d3.select(this).attr("class", "selected");
            }
            else {
                already_selected = true;
                // Set class "unselected" to that rect
                d3.select(this).attr("class", "unselected");
            }
            // INITIALIZE CUSTOMERS
            // Get current rfm customers ids (other rects are selected)
            if (localStorage.getItem("rfm_customers")) {
                customers = JSON.parse(localStorage.getItem("rfm_customers"));
            }
            else {
                customers = [];
            }
            
            // Get selected segment coordinates
            selected_R = d.R;
            selected_F = d.F;

            // Get the customers belonging to that segment
            d3.csv("static/dataset/rfm_data.csv",  function(r_data) {
                this_customers = [];
                r_data.forEach(function(r){
                    if (r.R==selected_R && r.F==selected_F) {
                        //console.log(r.cust_id);
                        this_customers.push(r.cust_id);
                    }    
                });

                

                // If not selected, lets select it and filter
                if(already_selected==false) {
                    

                    // RESET CLUSTER SELECTION TO ALL
                    document.getElementById("cluster-selector-select").value = 'all';
                    var element = document.getElementById('cluster-selector-select');
                    var event = new Event('change');
                    element.dispatchEvent(event);


                    // UPDATE CUSTOMERS FILTER
                    all_customers = customers.concat(this_customers);
                    localStorage.setItem("rfm_customers", JSON.stringify(all_customers));

                    // FILTER FULL DATA BASING ON CUSTOMER LIST
                    filterFullDataByCustomers(all_customers,'rfm');
                    // FILTER PARALLEL RFM DATA BASING ON CUSTOMER LIST
                    //filterRfmDataByCustomers(this_customers,'rfm');
                
                    // Set parallel to selected class
                    //d3.selectAll(".p2line" + selected_R + selected_F).classed("unselected", false);
                    //d3.selectAll(".p2line" + selected_R + selected_F).attr("class", "selected");

                    // Select it
                    /*d3.selectAll(".p2line" + selected_R + selected_F)
                    .transition().duration(200)
                    .style("stroke", myColor(d.Avg_M))
                    .style("opacity", "1");*/
                    console.log(all_customers);
                }

                // If selected, lets unselect and remove the filtering
                else {
                    

                    // UPDATE CUSTOMER FILTER
                    difference = customers.filter(x => !this_customers.includes(x));
                    localStorage.setItem("rfm_customers", JSON.stringify(difference));

                    // FILTER FULL DATA BASING ON CUSTOMER LIST
                    filterFullDataByCustomers(difference,'rfm');
                    // FILTER PARALLEL RFM DATA BASING ON CUSTOMER LIST
                    //filterRfmDataByCustomers(difference, 'rfm');

                    // Set parallel to selected class
                    //d3.selectAll(".p2line" + selected_R + selected_F).classed("unselected", true);
                    //d3.selectAll(".p2line" + selected_R + selected_F).classed("selected", false);

                    // Deselect it
                    /*d3.selectAll(".p2line" + selected_R + selected_F)
                    .transition().duration(200)
                    .style("stroke", unselected_color)
                    .style("opacity", "0");
                    console.log(difference);*/
                }

                
              

            });
        }

// --------------------------------------------------------------------------------
        // ADD A CLUSTER SELECTOR

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

// --------------------------------------------------------------------------------

        // FILTER USING CLUSTER SELECTOR
        d3.select("#cluster-selector-select")
            .on('change', filterByCluster);

        // FILTER USING RFM HEATMAP
        d3.select("#rfm-heatmap svg").selectAll('rect')
            .on('click', filterBySegment);
                
                
        


    }); //close csv

    
}); //close document ready