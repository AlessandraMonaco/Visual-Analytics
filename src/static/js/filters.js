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
                    if ((document.getElementById("cluster-selector-select").value == 'all' &&
                    filter=='cluster') || filter=='all') {
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

        function filterRfmDataByCustomers(customers, filter, heatmap) {
            d3.csv("static/dataset/rfm_data.csv", function(data) {

                //filter basing on customers
                if ((document.getElementById("cluster-selector-select").value == 'all' &&
                filter == 'cluster') || filter=="all") {
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
                // Manually set the dimensions
                dimensions = ['recency', 'frequency', 'monetary'];

                rfm_parallel_from_csv(svg,dimensions,new_data, myColor, x, y);

                if(heatmap==true) {
                    // Now, for each rfm segment R-F count the number of customers after the filtering
                    var nested_data = d3.nest()
                        .key(function(d){ return d.R; })
                        .key(function(d) { return d.F; })
                        .rollup(function(v) { return v.length; })
                    .entries(new_data);
                    //.map(function(d){
                    //  return { R: d.key, F: d.key, value: d.values.value};
                    //});
                    //console.log(nested_data);
                    var flatten_data = nested_data.flatMap((item, i) => {
                        const R = item.key;
                        return item.values.map(x => ({
                        R : R,
                        F: x.key,
                        value: x.value
                        }));
                    });
                    //console.log(flatten_data);
                    // Get the segment data.. change just the count value
                    d3.csv("static/dataset/rfm_segments.csv", function(segment_data) {
                        segment_data.forEach(function(d) {
                            flatten_data.forEach(function(f) {
                                if(d.R==f.R && d.F==f.F) {
                                    d.Count = f.value;
                                }
                            });
                        });
                        //console.log(segment_data);

                        // Now enter new data in rfm_heatmap
                        //remove old data
                        var svg = d3.select('#rfm-heatmap svg g');
                        svg.selectAll("rect").remove();

                        //show new data 
                        // Draw the lines
                        // line to draw for this raw.
                        rfm_heatmap_from_csv(svg,segment_data);
                        svg.selectAll('rect').attr("class", "unselected");

                        //Hide tooltip (for a bug a tooltip remains visible)
                        var tooltip = svg.select(".tooltip");
                        tooltip
                        .style("opacity", 0);

                        // Set it again, not working after cluster selection
                        d3.select("#rfm-heatmap svg").selectAll('rect')
                            .on('click', filterBySegment);
                    });
                }
               
            });
        }

        var filterByCluster = function(){

            // reset the selection on rfm segments
            localStorage.removeItem("rfm_customers");

            // recover the option that has been chosen
            options =  this.selectedOptions;

            //tooltip
            var scatter = d3.select('#scatter');
            var tooltip = scatter.select(".tooltip");
            
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
           // FILTER RFM DATA BASING ON CUSTOMER LIST (true: filter also heatmap to change tooltips)
           filterRfmDataByCustomers(customers, 'cluster', true);

        }

        var filterBySegment = function(d) {

            // RESET CLUSTER SELECTION TO ALL if a cluster is selected
            // This triggers on change => triggers filterByCluster => triggers filterFullData and filterRfm
            if(document.getElementById("cluster-selector-select").value == 'all') {
                //ok, you don't need to reset to all and run again the filter all
                //console.log("is all");

                //Check if the box was selected or not
                if(d3.select(this).attr("class")=="unselected") {
                    already_selected = false;
                    // Set class "selected" to that rect
                    d3.select(this).classed("unselected", false);
                }
                else {
                    already_selected = true;
                    // Set class "unselected" to that rect
                    d3.select(this).classed("unselected", true);

                }
                
            }
            else {
                //console.log("is not all");
                //document.getElementById("cluster-selector-select").value = 'all';
                d3.select('#cluster-selector-select').property('value', 'all');
                var element = document.getElementById('cluster-selector-select');
                var event = new Event('change');
                element.dispatchEvent(event);

                already_selected = false;
                // Set class "selected" to that rect
                d3.select(this).classed("unselected", false);
                
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

                    // UPDATE CUSTOMERS FILTER
                    all_customers = customers.concat(this_customers);
                    localStorage.setItem("rfm_customers", JSON.stringify(all_customers));
                    final_customers = all_customers;

                    // FILTER FULL DATA BASING ON CUSTOMER LIST
                    filterFullDataByCustomers(all_customers,'rfm');
                    // FILTER PARALLEL RFM DATA BASING ON CUSTOMER LIST
                    filterRfmDataByCustomers(all_customers,'rfm',false);
                
                    //console.log(all_customers);
                }

                // If selected, lets unselect and remove the filtering
                else {
                    

                    // UPDATE CUSTOMER FILTER
                    difference = customers.filter(x => !this_customers.includes(x));
                    localStorage.setItem("rfm_customers", JSON.stringify(difference));
                    final_customers = difference;

                    // FILTER FULL DATA BASING ON CUSTOMER LIST
                    if (difference.length!=0) {
                        filterFullDataByCustomers(difference,'rfm');
                        // FILTER PARALLEL RFM DATA BASING ON CUSTOMER LIST
                        filterRfmDataByCustomers(difference, 'rfm', false);
                    }
                    else {
                        // reset the selection on rfm segments
                        localStorage.removeItem("rfm_customers");   
                        filterFullDataByCustomers(difference,'all');
                        // FILTER PARALLEL RFM DATA BASING ON CUSTOMER LIST
                        filterRfmDataByCustomers(difference, 'all', false);
                    }
                    

                }

                // FILTER SCATTER AND UNSUPERVISED PARALLEL
                if (final_customers.length!=0) {

                    //HIGHLIGHT SCATTER
                    // Now highlight all scatter and pline such that cust_id in customers
                    var scatter = d3.select("#scatter svg");
                    scatter.selectAll(".dot")
                    .transition()
                    .duration(200)
                    .style("fill", function(d) { 
                        if (final_customers.includes(d.cust_id)) return color(d.cluster);
                        else return unselected_color;
                    })
                    .attr("r",  function(d) { 
                        if (final_customers.includes(d.cust_id)) return 1.5;
                        else return 1;
                    });

                    //HIGHLIGHT PARALLEL UNSUPERVISED
                    var parallel = d3.select("#unsupervised_parallel svg");
                    parallel.selectAll(".pline")
                    .transition()  
                    .duration(200)
                    .style("stroke", function(d) { 
                        if (final_customers.includes(d.cust_id)) return color(d.cluster);
                        else return unselected_color;
                    })
                    .style("opacity", function(d) { 
                        if (final_customers.includes(d.cust_id)) return 1;
                        else return 0.2;
                    });
                }

                else {
                    //RESET ORIGINAL VISUALIZATION
                    var scatter = d3.select("#scatter svg");
                    scatter.selectAll(".dot")
                    .transition()
                    .duration(200)
                    .style("fill", function(d) {  return color(d.cluster);})
                    .attr("r", 1);

                    var parallel = d3.select("#unsupervised_parallel svg");
                    parallel.selectAll(".pline")
                    .transition()  
                    .duration(200)
                    .style("stroke", function(d) { return color(d.cluster);})
                    .style("opacity", 1);
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