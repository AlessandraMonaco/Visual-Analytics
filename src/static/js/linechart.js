var margin = {top: 15, right: 7, bottom: 30, left: 40},
width = 650 - margin.left - margin.right,
height = 150 - margin.top - margin.bottom;

  
var lin_margin = {top: 15, right: 7, bottom: 30, left: 58},
lin_width = 850 - lin_margin.left - lin_margin.right,
lin_height = 150 - lin_margin.top - lin_margin.bottom;

// List of groups (here I have one group per column)
var allGroup = ["Profit", "Sales"]

//Pretty print for date in tooltips
function pretty_date(mydate) {
  return mydate.getDate()+"/"+mydate.getMonth()+"/"+mydate.getFullYear();
}

function pretty_value(myvalue, y_value) {
  if(y_value=="Profit") return myvalue.toFixed(2)+" $";
  else return myvalue;
}


function linechart_from_csv(svg,data,y_value) {

  // Aggregate by summing daily amounts
  // IMPORTANT : The csv must be sorted on dates
  // Check the selected level of aggregation
  var aggr_level = d3.select("#select-aggr").property("value");
  var nested_data = d3.nest()
    //.key(function(d){ return d.date; })
    .key(function(d) { 
      if(aggr_level=="day") return d.date; 
      if(aggr_level=="month") return d3.timeMonth(d.date); //
      if(aggr_level=="year") return d3.timeYear(d.date);
    })
    .rollup(function(d) { 
      if(y_value=="Profit") {
        return d3.sum(d, function(d) {return d.profit; })
      }
      if(y_value=="Sales") {
        return d3.sum(d, function(d) {return d.sales; })
      }
    }).entries(data)
    .map(function(d){
       return { date: new Date(d.key), value: d.value};
      //if(aggr_level=="month") return { date: new Date(1, d.key, 1), value: d.value};
      //if(aggr_level=="year") return { date: new Date(d.key, 1, 1), value: d.value};
      
    });

    //Debug
    //console.log(data);
    //console.log("Nested Data");
    //console.log(nested_data);
    
    data = nested_data;
      
    // Add X axis --> it is a date format
      var x = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.date; }))
        .range([ 0, lin_width ]);
      xAxis = svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      
    // Add Y axis
    var max = d3.max(data, function(d) { return +d.value; });
    var y = d3.scaleLinear()
      .domain([0, max ])
      .range([ lin_height, 0 ]);
    yAxis = svg.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y))
      .append("text")
        .attr("y", -11)
        .attr("x", 2)
        .attr("dy", ".31em")
        .style("text-anchor", "end")
        .style("color", "white")
        .style("fill", "white")
        .text(y_value);
    


    // Add a clipPath: everything out of this area won't be drawn.
    var clip = svg.append("defs").append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", lin_width )
      .attr("height", lin_height )
      .attr("x", 0)
      .attr("y", 0);
      
    // Add brushing
    var brush = d3.brushX()                   // Add the brush feature using the d3.brush function
      .extent( [ [0,0], [lin_width,lin_height] ] )  // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
      .on("end", updateChart)

    // Create the line variable: where both the line and the brush take place
    var line = svg.append('g')
      .attr("clip-path", "url(#clip)")
 
    

    // This allows to find the closest X index of the mouse:
    var bisect = d3.bisector(function(d) { return d.date; }).left;

    // Create the circle that travels along the curve of chart
    var focus = svg
      .append('g')
      .append('circle')
    .style("fill", "none")
    .attr("stroke", "white")
    .attr('r', 1.3)
    .style("opacity", 0)

// Create the text that travels along the curve of chart
var focusText = svg
  .append('g')
  .append('text')
    //.attr("class", "tooltip")
    .style("opacity", 0)
    .style("fill", "white")
    .style("font-weight", "bold")
    .attr("stroke-width", 3.0)
    .attr("text-anchor", "left")
    .attr("alignment-baseline", "bottom")
    



    // Add the line
    line.append("path")
      .datum(data)
      .attr("id", "myPath")
      .attr("class", "line")  // I add the class line to be able to modify this line later on.
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .transition()
      .duration(3000)
      .attr("d", d3.line()
        .x(function(d) { return x(d.date) })
        .y(function(d) { return y(+d.value) })
      )

     
      //Add brush
     // Add the brushing
     line
     .append("g")
     .attr("class", "brush")
     .call(brush)
     .style("pointer-events", "all")
     .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseout', mouseout);

     // What happens when the mouse move -> show the annotations at the right positions.
  function mouseover() {
    focus.style("opacity", 1)
    focusText.style("opacity",1)
  }

  function mousemove() {
    // recover coordinate we need
    var x0 = x.invert(d3.mouse(this)[0]);
    var i = bisect(data, x0, 1);
    selectedData = data[i]
    //console.log(selectedData.value);
    focus
      .attr("cx", x(selectedData.date))
      .attr("cy", y(selectedData.value))
      
    focusText
      .html(pretty_value(selectedData.value, y_value))
      //.html(pretty_date(selectedData.date))
      .attr("x", x(selectedData.date)+5)
      .attr("y", y(selectedData.value)+5)  
    }
  function mouseout() {
    focus.style("opacity", 0)
    focusText.style("opacity", 0)
  }


    // A function that set idleTimeOut to null
    var idleTimeout
      function idled() { idleTimeout = null; }
      
      // A function that update the chart for given boundaries
      function updateChart() {
        
        // What are the selected boundaries?
        extent = d3.event.selection
        
        // If no selection, back to initial coordinate. Otherwise, update X axis domain
        if(!extent){
          if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
          x.domain([ 4,8])
        }else{
          x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
          line.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
        }
        
        // Update axis and line position
        xAxis.transition().duration(1000).call(d3.axisBottom(x))
        line
        .select('.line')
        .transition()
        .duration(1000)
        .attr("d", d3.line()
        .x(function(d) { return x(d.date) })
        .y(function(d) { return y(d.value) })
        )
      }
      
      // If user double click, reinitialize the chart
      svg.on("dblclick",function(){
        x.domain(d3.extent(data, function(d) { return d.date; }))
        xAxis.transition().call(d3.axisBottom(x))
        line
        .select('.line')
        .transition()
        .attr("d", d3.line()
        .x(function(d) { return x(d.date) })
        .y(function(d) { return y(d.value) })
        )
      });
      
   

}

$(document).ready(function(){

  //Read the data
  d3.csv("static/dataset/full_data.csv", 
    
    // When reading the csv, I must format variables: (total_amt, Qty)
    function(d){
      return { date : d3.timeParse("%Y-%m-%d")(d.tran_date), 
                profit : d.total_amt, 
                sales : d.Qty}
    },          
    
    function(data) {
      // append the svg object to the body of the page


  var svg = d3.select("#line-chart")
  .append("svg")
  .attr("width", lin_width + lin_margin.left + lin_margin.right)
  .attr("height", lin_height + lin_margin.top + lin_margin.bottom)
  .append("g")
  .attr("transform",
  "translate(" + lin_margin.left + "," + lin_margin.top + ")");



  // add the options to the button
  d3.select("#select-y")
    .selectAll('myOptions')
     .data(allGroup)
    .enter()
    .append('option')
    .text(function (d) { return d; }) // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button

      //Initialize with Profits
      if(typeof y_value == 'undefined') {
        linechart_from_csv(svg,data,"Profit");
      }
      else {linechart_from_csv(svg,data,y_value);}
      
      //Update function when the selectButton is clicked
      // A function that updates the chart
      function update(selectedGroup) {
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
        linechart_from_csv(svg,data,selectedGroup);
      }

      // When the button is changed, run the updateChart function
      d3.select("#select-y").on("change", function(d) {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value");
        // run the updateChart function with this selected option
        update(selectedOption);
      })

      // When the aggregation level is changed, update with the selected aggr level
      d3.select("#select-aggr").on("change", function(d) {
        //Drop previous visualization
        d3.select("#line-chart svg").remove()
        var selectedGroup = d3.select("#select-y").property("value");
        //Add the new visualization
        var svg = d3.select("#line-chart")
          .append("svg")
          .attr("width", lin_width + lin_margin.left + lin_margin.right)
          .attr("height", lin_height + lin_margin.top + lin_margin.bottom)
          .append("g")
          .attr("transform",
            "translate(" + lin_margin.left + "," + lin_margin.top + ")");
        linechart_from_csv(svg,data,selectedGroup);
      });
    })
  
});