// set the dimensions and margins of the graph
var scatter_margin = {top: 10, right: 30, bottom: 30, left: 10},
    scatter_width = 160 - scatter_margin.left - scatter_margin.right,
    scatter_height = 160 - scatter_margin.top - scatter_margin.bottom;


$(document).ready(function(){

    // append the svg object to the body of the page
    var svg = d3.select("#scatter")
        .append("svg")
            .attr("width", scatter_width + scatter_margin.left + scatter_margin.right)
            .attr("height", scatter_height + scatter_margin.top + scatter_margin.bottom)
        .append("g")
            .attr("transform",
                "translate(" + scatter_margin.left + "," + scatter_margin.top + ")");


    //Read the data
    d3.csv("static/dataset/pca_kmeans_data.csv", function(data) {

        // Add X axis
        var x = d3.scaleLinear()
        .domain([-3, 3])
        .range([ 0, scatter_width ]);
        svg.append("g")
        .attr("transform", "translate(0," + scatter_height + ")")
        .call(d3.axisBottom(x));
    
        // Add Y axis
        var y = d3.scaleLinear()
        .domain([-3, 3])
        .range([ scatter_height, 0]);
        svg.append("g")
        .call(d3.axisLeft(y));
    
        // Color scale: give me a specie name, I return a color
        var color = d3.scaleOrdinal()
        .domain(["0", "1", "2", "3" ])
        .range([ "#440154ff", "#21908dff", "#fde725ff", "green"])
    
    
        // Highlight the specie that is hovered
        var highlight = function(d){
    
            selected_cluster = d.cluster
        
            d3.selectAll(".dot")
                .transition()
                .duration(200)
                .style("fill", "lightgrey")
                .attr("r", 1)
        
            d3.selectAll(".dot" + selected_cluster)
                .transition()
                .duration(200)
                .style("fill", color(selected_cluster))
                .attr("r", 2)
        }
    
        // Highlight the specie that is hovered
        var doNotHighlight = function(){
        d3.selectAll(".dot")
            .transition()
            .duration(200)
            .style("fill", "lightgrey")
            .attr("r", 1 )
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
        .on("mouseleave", doNotHighlight )
    
    })
  
  
})