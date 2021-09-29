// set the dimensions and margins of the graph
var parallel_margin = {top: 20, right: 0, bottom: 0, left: 40},
  parallel_width = 860 - parallel_margin.left - parallel_margin.right,
  parallel_height = 130 - parallel_margin.top - parallel_margin.bottom;


// Manually set the dimensions
dimensions = ['recency', 'frequency', 'monetary'];


function unit(dim) {
    if (dim=='recency') {return " (days)"}
    if (dim=='frequency') {return " (orders)"}
    if (dim=='monetary') {return " ($)"}
}

function rfm_parallel_from_csv(svg,dimensions,data) {
    

    // Tooltip
    var tool = d3.select("body").append("div").attr("class", "toolTip");

    // Colors 
    avg_max = d3.max(data.map(function(d) { return parseFloat(d.Avg_M); }));
    myColor = d3.scaleSequential()
            .interpolator(d3.interpolatePurples)
            .domain([0,avg_max]);

    // Color scale: give me a cluster name, I return a color
        /*var color = d3.scaleOrdinal()
            .domain(d3.extent(data, function(d) { return +parseFloat(d.); }))
            .range(cluster_color)*/

    // For each dimension, I build a linear scale. I store all in a y object
    var y = {} //empty object
    for (i in dimensions) {
        var name = dimensions[i]
        y[name] = d3.scaleLinear()
        //.domain( [0,20] )
        .domain( d3.extent(data, function(d) { return +parseInt(d[name]); }) )
        .range([height, 0])
    }

    // Build the X scale -> it find the best position for each Y axis
    x = d3.scalePoint()
    .range([0, width])
    .domain(dimensions);

    // The path function take a row of the csv as input, and return x and y coordinates of the 
        // line to draw for this raw.
    function path(d) {
        return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
    }

    // Draw the lines
    svg
    .selectAll("myPath")
    .data(data)
    .enter()
    .append("path")
    //.attr("class", function (d) { return "pline pline" + d.cluster } ) // 2 class for each line: 'line' and the group name
    .attr("class", function (d) { return "unselected p2line p2line" + d.R + d.F; } ) // 2 class for each line: 'line' and the group name
    .attr("d",  path)
    .style("fill", "none" )
    .style("stroke", function(d){ return myColor(d.Avg_M);} )
    //.style("stroke",  unselected_color )
    .style("opacity", 0.5);
    //.on("mouseover", highlight)
    //.on("mouseleave", doNotHighlight )
    
    return [x,y];
}


$(document).ready(function(){

    // Parse the Data
    d3.csv("static/dataset/rfm_data.csv", function(data) {
        
        
        // append the svg object to the body of the page
        var svg = d3.select("#rfm_parallel")
            .append("svg")
            .attr("width", parallel_width + parallel_margin.left + parallel_margin.right)
            .attr("height", parallel_height + parallel_margin.top + parallel_margin.bottom)
            .append("g")
            .attr("transform",
                    "translate(" + parallel_margin.left + "," + parallel_margin.top + ")");

        

        var xy = [];
        xy = rfm_parallel_from_csv(svg,dimensions,data);
        var x = xy[0], y = xy[1];

        // Highlight the specie that is hovered
        /*
        var highlight = function(d){

            selected_cluster = d.cluster
            
            // HIghlight parallel
            // first every group turns grey
            d3.selectAll(".pline")
            .transition().duration(200)
            .style("stroke", "grey")
            .style("opacity", "0.2")
            // Second the hovered specie takes its color
            d3.selectAll(".pline" + selected_cluster)
            .transition().duration(200)
            .style("stroke", color(selected_cluster))
            .style("opacity", "1")

            
        }

        // Unhighlight
        var doNotHighlight = function(d){

            // DO not highlight parallel
            d3.selectAll(".pline")
            .transition().duration(200).delay(1000)
            .style("stroke", function(d){ return( color(d.cluster))} )
            .style("opacity", "1")

            
        }*/

        

        

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
                .text(function(d) { return d+unit(d); })
                .style("fill", "white");
               /* .on("mousemove", function (d) {
                    tool.style("left", d3.event.pageX + 10 + "px")
                    tool.style("top", d3.event.pageY - 20 + "px")
                    tool.style("display", "inline-block");
                    tool.html(d);
                }).on("mouseout", function (d) {
                    tool.style("display", "none");
                });*/


    }) //end of d3.csv
}) //end of document.ready