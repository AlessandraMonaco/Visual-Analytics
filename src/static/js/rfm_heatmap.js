// set the dimensions and margins of the graph
var heat_margin = {top: 10, right: 25, bottom: 30, left: 30},
  heat_width = 150 - heat_margin.left - heat_margin.right,
  heat_height = 150 - heat_margin.top - heat_margin.bottom;


$(document).ready(function(){

    // append the svg object to the body of the page
    var svg = d3.select("#rfm-heatmap")
        .append("svg")
        .attr("width", heat_width + heat_margin.left + heat_margin.right)
        .attr("height", heat_height + heat_margin.top + heat_margin.bottom)
        .append("g")
        .attr("transform",
                "translate(" + heat_margin.left + "," + heat_margin.top + ")");
    

    //Read the data
    d3.csv("static/dataset/rfm_segments.csv", function(data) {

        // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
        var myGroups = d3.map(data, function(d){return d.R;}).keys() //rows of heat
        var myVars = d3.map(data, function(d){return d.F;}).keys() //cols of heat

        // Build X scales and axis:
        var x = d3.scaleBand()
        .range([ 0, heat_width ])
        .domain(myGroups)
        .padding(0.05);
        svg.append("g")
        .style("font-size", 15)
        .attr("class", "axis")
        .attr("transform", "translate(0," + heat_height + ")")
        .call(d3.axisBottom(x).tickSize(0))
        .select(".domain").remove()
          // text label for the x axis
        svg.append("text")             
        .attr("transform",
                "translate(" + (heat_width/2) + " ," + 
                            (heat_height + heat_margin.top + 10) + ")")
        .style("text-anchor", "middle")
        .style("font-size", "9px")
        .style("fill", "white")
        .text("Recency");

        //Build Y scales and axis:
        var y = d3.scaleBand()
          .range([ heat_height, 0 ])
          .domain(myVars)
          .padding(0.05);
        svg.append("g")
          .style("font-size", 15)
          .attr("class", "axis")
          .call(d3.axisLeft(y).tickSize(0))
          .select(".domain").remove()
        // text label for the y axis
        svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -20 )
        .attr("x",0 - (heat_height / 2))
        .attr("dy", "1em")
        .style("font-size", "9px")
        .style("text-anchor", "middle")
        .style("fill", "white")
        .text("Frequency");   
      

        // Build color scale
        var myColor = d3.scaleSequential()
        .interpolator(d3.interpolatePurples)
        .domain([5185,
            21892])

        // create a tooltip
        var tooltip = d3.select("#rfm-heatmap")
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

        // Three function that change the tooltip when user hover / move / leave a cell
        var mouseover = function(d) {

          // Show tooltip
            tooltip
            .style("opacity", 1)
            d3.select(this)
            .style("stroke", "white")
            .style("opacity", 1)

          // Highlight segment in parallel coordinates
          selected_R = d.R;
          selected_F = d.F;
            
            // HIghlight parallel
            // first every group turns grey
            d3.selectAll(".p2line")
            .transition().duration(200)
            .style("stroke", unselected_color)
            .style("opacity", "0")
            // Second the hovered specie takes its color
            d3.selectAll(".p2line" + selected_R + selected_F)
            .transition().duration(200)
            .style("stroke", myColor(d.Avg_M))
            .style("opacity", "1")

        }
        var mousemove = function(d) {
            tooltip
            .html("Mean M value: " + parseFloat(d.Avg_M).toFixed(2) +
            "<br>"+ parseInt(d.Count) + " customers.")
            .style("left", (d3.mouse(this)[0] + 50 + "px"))
            .style("top", (d3.mouse(this)[1] + "px"))
        }
        var mouseleave = function(d) {

          //Hide tooltip
            tooltip
            .style("opacity", 0)
            d3.select(this)
            .style("stroke", "black")
            .style("opacity", 0.8)
          
            //Set original parallel viz
            d3.selectAll(".p2line")
            .transition().duration(200)
            .style("stroke",  unselected_color )
            .style("opacity", 0.5);
        }

        // add the squares
        svg.selectAll()
        .data(data, function(d) {return d.R+':'+d.F;})
        .enter()
        .append("rect")
            .attr("x", function(d) { return x(d.R) })
            .attr("y", function(d) { return y(d.F) })
            .attr("rx", 2)
            .attr("ry", 2)
            .attr("width", x.bandwidth() )
            .attr("height", y.bandwidth() )
            .style("fill", function(d) { return myColor(d.Avg_M)} )
            .style("stroke-width", 1)
            .style("stroke", "black")
            .style("opacity", 0.8)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

        // Add legend for M to graph
       
        
        
    }) //end of d3.csv

}) //end of document.ready