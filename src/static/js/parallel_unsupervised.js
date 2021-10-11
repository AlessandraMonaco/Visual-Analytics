// set the dimensions and margins of the graph
var parallel_margin = {top: 20, right: 0, bottom: 0, left: 0},
  parallel_width = 860 - parallel_margin.left - parallel_margin.right,
  parallel_height = 130 - parallel_margin.top - parallel_margin.bottom;

// set color for clusters
var cluster_color = [ "#e41a1c", "#377eb8", "#4daf4a", "#ff7f00", "#ffff33", "#a65628" ];
var unselected_color = "#404040";

$(document).ready(function(){

    var cluster_color = [ "#e41a1c", "#377eb8", "#4daf4a", "#ff7f00", "#ffff33", "#a65628" ];
    
    // Parse the Data
    d3.csv("static/dataset/pca_kmeans_data.csv", function(data) {
        
        //Compute cluster size
        var sizes = {};
        data.forEach(function(r) {
            if (!sizes[r.cluster]) {
                sizes[r.cluster] = 0;
            }
            sizes[r.cluster]++;
        });

        // append the svg object to the body of the page
        var svg = d3.select("#unsupervised_parallel")
            .append("svg")
            .attr("width", parallel_width + parallel_margin.left + parallel_margin.right)
            .attr("height", parallel_height + parallel_margin.top + parallel_margin.bottom)
            .append("g")
            .attr("transform",
                    "translate(" + parallel_margin.left + "," + parallel_margin.top + ")");

        // Manually set the dimensions
        // Original dimension order
        var dimensions = ['(Bags) Women','(Books) Academic', '(Books) Children', '(Books) Comics', 
            '(Books) DIY', '(Books) Fiction', '(Books) Non-Fiction', '(Clothing) Kids', '(Clothing) Mens', 
            '(Clothing) Women', '(Electronics) Audio and video', '(Electronics) Cameras', 
            '(Electronics) Computers', '(Electronics) Mobiles', '(Electronics) Personal Appliances', 
            '(Footwear) Kids', '(Footwear) Mens', '(Footwear) Women', '(Home and kitchen) Bath', 
            '(Home and kitchen) Furnishing', '(Home and kitchen) Kitchen', '(Home and kitchen) Tools'];

        
        
        
            

        // Tooltip for labels
        var tool = d3.select("body").append("div").attr("class", "toolTip");

        // Tooltip for cluster infos
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
        .style("height", "auto");
        
        // Color scale: give me a cluster name, I return a color
        var color = d3.scaleOrdinal()
            .domain(d3.extent(data, function(d) { return +parseInt(d.cluster); }))
            .range(cluster_color)

        // Highlight the specie that is hovered
        var highlight = function(d){
            var clicked = document.getElementById('cluster-selector-select').value;
            if (clicked == 'all' && !(localStorage.getItem("rfm_customers"))) {
                selected_cluster = d.cluster

                // first every group turns grey
                d3.selectAll(".pline")
                .transition().duration(200)
                .style("stroke", unselected_color)
                .style("opacity", "0.1")
                // Second the hovered specie takes its color
                d3.selectAll(".pline" + selected_cluster)
                .transition().duration(200)
                .style("stroke", cluster_color[parseInt(selected_cluster)])
                .style("opacity", "1")

                // Highlight scatter
                d3.selectAll(".dot")
                    .transition()
                    .duration(200)
                    .style("fill", unselected_color)
                    .attr("r", 1)
        
                d3.selectAll(".dot" + selected_cluster)
                    .transition()
                    .duration(200)
                    .style("fill", cluster_color[parseInt(selected_cluster)])
                    .attr("r", 1.5)
            
                // Reset selector on All Data
                d3.select('#cluster-selector-select').property('value', 'all');

                // Show tooltip
                tooltip
                .style("opacity", 1)
                d3.select(this)
                .style("stroke", "white")
                .style("opacity", 1);
            }
        }

        // Unhighlight
        var doNotHighlight = function(d){
            var clicked = document.getElementById('cluster-selector-select').value;
            if (clicked == 'all' && !(localStorage.getItem("rfm_customers"))) {
                // Do not highlight parallel
                d3.selectAll(".pline")
                .transition().duration(200).delay(1000)
                .style("stroke", function(d){ return( cluster_color[parseInt(d.cluster)])} )
                .style("opacity", "1");

                // Do not highlight scatter
                d3.selectAll(".dot")
                    .transition()
                    .duration(200)
                    .style("fill", function (d) { return cluster_color[parseInt(d.cluster)] } )
                    .attr("r", 1 );
            
                // Reset selector on All Data
                d3.select('#cluster-selector-select').property('value', 'all');

                //Hide tooltip
                tooltip
                .style("opacity", 0)
            }
        }

        //Detect mouse change for the tooltip to set the text
        var mousemove = function(d) {
            var clicked = document.getElementById('cluster-selector-select').value;
            if (clicked == 'all') {
                tooltip
                .html("CLUSTER " + d.cluster +
                "<br>"+ sizes[d.cluster] +" customers.")
                .style("left", "50px")
                .style("top", "-10px")
            }
        }

        

        function Parallel(svg,dimensions) {

             // The path function take a row of the csv as input, and return x and y coordinates of the 
            // line to draw for this raw.
            function path(d) {
                return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
            }

            // For each dimension, I build a linear scale. I store all in a y object
            var y = {} //empty object
            for (i in dimensions) {
                var name = dimensions[i]
                y[name] = d3.scaleLinear()
                .domain( [0,20] ) // --> Same axis range for each group
                // --> different axis range for each group --> 
                //.domain( [d3.extent(data, function(d) { return parseInt(d[name]); })] )
                .range([height, 0])
            }

            // Build the X scale -> it find the best position for each Y axis
            x = d3.scalePoint()
            .range([0, width])
            .domain(dimensions);

            // Draw the lines
            svg
            .selectAll("myPath")
            .data(data)
            .enter()
            .append("path")
            .attr("class", function (d) { return "pline pline" + d.cluster } ) // 2 class for each line: 'line' and the group name
            .attr("d",  path)
            .style("cursor", "pointer")
            .style("fill", "none" )
            .style("stroke", function(d){ return( cluster_color[parseInt(d.cluster)])} )
            .style("opacity", 0.5)
            .on("mouseover", highlight)
            .on("mousemove", mousemove)
            .on("mouseleave", doNotHighlight )
            .on("click", function(d) {
                document.getElementById('cluster-selector-select').value = d.cluster;
                //Hide tooltip (we show it again in the selector code)
                tooltip
                .style("opacity", 0)
                // Notify the change of the cluster selector forcing the change event
                var element = document.getElementById('cluster-selector-select');
                var event = new Event('change');
                element.dispatchEvent(event);
            });

            // Draw the axis:
        svg.selectAll("myAxis")
        // For each dimension of the dataset I add a 'g' element:
            .data(dimensions).enter()
            .append("g")
            .attr("class", "axis")
            .style("stroke", "white")
            // I translate this element to its right position on the x axis
            .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
            // And I build the axis with the call function
            .each(function(d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d])); })
            // Add axis title
            .append("text")
                .style("text-anchor", "middle")
                .attr("y", -9)
                .style("cursor", "help")
                .text(function(d) { return d.substring(0,3)+".."; })
                .style("fill", "white")
                .on("mousemove", function (d) {
                    tool.style("left", d3.event.pageX + 10 + "px")
                    tool.style("top", d3.event.pageY - 20 + "px")
                    tool.style("display", "inline-block");
                    tool.html(d);
                }).on("mouseout", function (d) {
                    tool.style("display", "none");
                });

        }

        Parallel(svg,dimensions);

        localStorage.removeItem("cluster_customers");


        // ORDER AXES BY CATEGORY (ORIGINAL ORDER)
        d3.select("#btn-original-order").on("click", function() {
            var orig_dimensions = ['(Bags) Women', '(Books) Academic', '(Books) Children', '(Books) Comics', 
            '(Books) DIY', '(Books) Fiction', '(Books) Non-Fiction', '(Clothing) Kids', '(Clothing) Mens', 
            '(Clothing) Women', '(Electronics) Audio and video', '(Electronics) Cameras', 
            '(Electronics) Computers', '(Electronics) Mobiles', '(Electronics) Personal Appliances', 
            '(Footwear) Kids', '(Footwear) Mens', '(Footwear) Women', '(Home and kitchen) Bath', 
            '(Home and kitchen) Furnishing', '(Home and kitchen) Kitchen', '(Home and kitchen) Tools'];
            //For each dimension, I build a linear scale. I store all in a y object

            // Remove prevous data and axes
            svg.selectAll(".axis").remove();
            svg.selectAll(".pline").remove();

            // Draw again data and axes
            Parallel(svg,orig_dimensions);
        })

       // SUFFLE AXES ORDER (AT RANDOM CONTINUOUSLY)
        d3.select("#btn-shuffle-order").on("click", function() {
            //console.log(dimensions);

            function shuffle(array) {
                let currentIndex = array.length,  randomIndex;
              
                // While there remain elements to shuffle...
                while (currentIndex != 0) {
              
                  // Pick a remaining element...
                  randomIndex = Math.floor(Math.random() * currentIndex);
                  currentIndex--;
              
                  // And swap it with the current element.
                  [array[currentIndex], array[randomIndex]] = [
                    array[randomIndex], array[currentIndex]];
                }
              
                return array;
              }
            //console.log(shuffle(dimensions));
            // dimensions are the actual dimensions (ultime inserite)
            // do a random shuffle on them
            new_dimensions = shuffle(dimensions);
            // Remove prevous data and axes
            svg.selectAll(".axis").remove();
            svg.selectAll(".pline").remove();

            // Draw again data and axes
            Parallel(svg,new_dimensions);
        })



    }) //end of d3.csv
}) //end of document.ready