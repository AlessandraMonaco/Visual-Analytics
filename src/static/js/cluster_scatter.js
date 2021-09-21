// set the dimensions and margins of the graph
var scatter_margin = {top: 10, right: 0, bottom: 30, left: 30},
    scatter_width = 155 - scatter_margin.left - scatter_margin.right,
    scatter_height = 155 - scatter_margin.top - scatter_margin.bottom;


$(document).ready(function(){
    var cluster_color = [ "#e41a1c", "#377eb8", "#4daf4a", "#ff7f00", "#ffff33", "#a65628" ];
    

    //Read the data
    d3.csv("static/dataset/pca_kmeans_data.csv", function(data) {
        
        //Compute cluster size
        var sizes = {};
        data.forEach(function(r) {
            if (!sizes[r.cluster]) {
                sizes[r.cluster] = 0;
            }
            sizes[r.cluster]++;
        });
        //console.log(sizes[1]);

        // Reset visualization with colors if double click on svg
        var resetVisualization = function(d) {
            // Add dots with original colour
            d3.selectAll(".dot")
                .transition()
                .duration(200)
                .style("fill", function (d) { return color(d.cluster) })
                .attr("r", 1 )
        }

        // Color scale: give me a cluster name, I return a color
        var color = d3.scaleOrdinal()
            .domain(d3.extent(data, function(d) { return +parseInt(d.cluster); }))
            .range(cluster_color)

        // append the svg object to the body of the page
        var svg = d3.select("#scatter")
        .append("svg")
            .attr("width", scatter_width + scatter_margin.left + scatter_margin.right)
            .attr("height", scatter_height + scatter_margin.top + scatter_margin.bottom)
            .on("dblclick", resetVisualization )
        .append("g")
            .attr("transform",
                "translate(" + scatter_margin.left + "," + scatter_margin.top + ")");


        // Add X axis
        var x = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return +parseFloat(d.pc_1); }))
        .range([ 0, scatter_width ]);
        svg.append("g")
        .attr("transform", "translate(0," + scatter_height + ")")
        .attr("class", "axis")
        .style("stroke", "white")
        .call(d3.axisBottom(x));
        svg.append("text")             
        .attr("transform",
                "translate(" + (scatter_width/2) +" ," + 
                            (scatter_height + scatter_margin.top + 15) + ")")
        .style("text-anchor", "middle")
        .style("font-size", "9px")
        .style("fill", "white")
        .text("Principal Component 1");
    
        // Add Y axis
        var y = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return +parseFloat(d.pc_2); }))
        .range([ scatter_height, 0]);
        svg.append("g")
        .attr("class", "axis")
        .style("stroke", "white")
        .call(d3.axisLeft(y));
        svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -30 )
        .attr("x",0 - (scatter_height / 2))
        .attr("dy", "1em")
        .style("font-size", "9px")
        .style("text-anchor", "middle")
        .style("fill", "white")
        .text("Principal Component 2");   
        
    
        // Color scale: give me a specie name, I return a color
        var color = d3.scaleOrdinal()
        .domain(d3.extent(data, function(d) { return +parseInt(d.cluster); }))
        .range(cluster_color)
    
        // Tooltip
        // create a tooltip
        var tooltip = d3.select("#scatter")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("width", "auto")
        .style("height", "auto")
        
        // Highlight the specie that is hovered
        var highlight = function(d){
    
            // Highlight in the scatter plot
            selected_cluster = d.cluster
        
            d3.selectAll(".dot")
                .transition()
                .duration(200)
                .style("fill", unselected_color)
                .attr("r", 1)
        
            d3.selectAll(".dot" + selected_cluster)
                .transition()
                .duration(200)
                .style("fill", color(selected_cluster))
                .attr("r", 1.5)
            
                // Highlight in parallel coordinates

                // first every group turns grey
                d3.selectAll(".pline")
                .transition().duration(200)
                .style("stroke", "grey")
                .style("opacity", "0.1")
                // Second the hovered specie takes its color
                d3.selectAll(".pline" + selected_cluster)
                .transition().duration(200)
                .style("stroke", color(selected_cluster))
                .style("opacity", "1")

                // Reset selector on All Data
                d3.select('#cluster-selector-select').property('value', 'all');

                 // Show tooltip
                tooltip
                .style("opacity", 1)
                d3.select(this)
                .style("stroke", "white")
                .style("opacity", 1)
        }
    
        // Remove highlight
        var doNotHighlight = function(){

            // Do not highlight scatter
            d3.selectAll(".dot")
                .transition()
                .duration(200)
                .style("fill", function (d) { return color(d.cluster) } )
                .attr("r", 1 )
                
            // Do not highlight parallel
            d3.selectAll(".pline")
                .transition().duration(200).delay(1000)
                .style("stroke", function(d){ return( color(d.cluster))} )
                .style("opacity", "1")
            
            // Reset selector on All Data
            d3.select('#cluster-selector-select').property('value', 'all');

            //Hide tooltip
            tooltip
            .style("opacity", 0)
            d3.select(this)
            .style("stroke", "black")
            .style("opacity", 0.8)
        }

        //Detect mouse change for the tooltip to set the text
        var mousemove = function(d) {
            tooltip
            .html("CLUSTER " + d.cluster +
            "<br>("+ sizes[d.cluster] +" customers)")
            .style("left", (d3.mouse(this)[0] + 50 + "px"))
            .style("top", (d3.mouse(this)[1] + "px"))
        }
    
        // Add dots
        svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
            .attr("class", function (d) { return "dot dot" + d.cluster } )
            .attr("cx", function (d) { return x(d.pc_1); } )
            .attr("cy", function (d) { return y(d.pc_2); } )
            .attr("r", 1)
            .style("fill", function (d) { return color(d.cluster) } )
        .on("mouseover", highlight)
        .on("mousemove", mousemove)
        .on("mouseleave", doNotHighlight )
        



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
            .on('change', function() {
                // recover the option that has been chosen
                options =  this.selectedOptions;

                //All grey
                //console.log(this.selectedOptions);
                d3.selectAll(".dot")
                .transition()
                .duration(200)
                .style("fill", unselected_color)
                .attr("r", 1)

                // first every group turns grey
                d3.selectAll(".pline")
                .transition().duration(200)
                .style("stroke", "grey")
                .style("opacity", "0.1")

                //Highlight selected
                for (var i=0; i<options.length; i++) {
                    selected_cluster = options[i].value;
                    console.log(selected_cluster)
                
                    d3.selectAll(".dot" + selected_cluster)
                        .transition()
                        .duration(200)
                        .style("fill", color(selected_cluster))
                        .attr("r", 1.5)
                    
                        // Highlight in parallel coordinates
                        d3.selectAll(".pline" + selected_cluster)
                        .transition().duration(200)
                        .style("stroke", color(selected_cluster))
                        .style("opacity", "1")

                        

                    if(selected_cluster=="all") {
                        d3.selectAll(".dot")
                        .transition()
                        .duration(200)
                        .style("fill", function(d) { return color(d.cluster);})
                        .attr("r", 1)
                    
                        // Highlight in parallel coordinates
                        d3.selectAll(".pline")
                        .transition().duration(200)
                        .style("stroke", function(d) { return color(d.cluster);})
                        .style("opacity", "1")
                    }
                }
                
            });


    })
  
})