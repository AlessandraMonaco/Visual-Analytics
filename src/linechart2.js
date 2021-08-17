var margin = {top: 15, right: 7, bottom: 30, left: 50},
width = 730 - margin.left - margin.right,
height = 150 - margin.top - margin.bottom;

// List of groups (here I have one group per column)
var allGroup = ["Profit", "Sales"]

//Variables for multi line chart
// set the type of number here, n is a number with a comma, .2% will get you a percent, .2f will get you 2 decimal points
var NumbType = d3.format(".2f");
// color array
var bluescale4 = ["#8BA9D0", "#6A90C1", "#066CA9", "#004B8C"];
//color function pulls from array of colors stored in color.js
var color = d3.scale.ordinal().range(bluescale4);
//define the approx. number of x scale ticks
var xscaleticks = 5;
//define your year format here, first for the x scale, then if the date is displayed in tooltips
var parseDate = d3.time.format("%m/%d/%y").parse;
var formatDate = d3.time.format("%b %d, '%y");


//Function to split data by year
function get_data_by_year(input_data, year) {
    res = [];
    for (var i=0;i<input_data.length;i++){
        if(input_data[i].year == year) res.push(input_data[i]);
    }
    return res;
}

function linechart_from_csv(svg,data,y_value) {

  // Aggregate by summing daily amounts
  // IMPORTANT : The csv must be sorted on dates
  var nested_data = d3.nest()
    .key(function(d){ return d.date; })
    .rollup(function(d) { 
      if(y_value=="Profit") {
        return d3.sum(d, function(d) {return d.profit; })
      }
      if(y_value=="Sales") {
        return d3.sum(d, function(d) {return d.sales; })
      }
    }).entries(data)
    .map(function(d){
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May","Jun","Jul", "Aug", "Sep", "Oct", "Nov","Dec"];
      return { date: monthNames[new Date(d.key).getMonth()]+'/'+(new Date(d.key).getUTCDate()), 
        value: d.value, year: new Date(d.key).getFullYear()};
    });

    //Debug
    console.log(data);
    console.log("Nested Data");
    console.log(nested_data);

    //Split into arrays basing on year
    data_2011 = get_data_by_year(nested_data,"2011");
    data_2012 = get_data_by_year(nested_data,"2012");
    data_2013 = get_data_by_year(nested_data,"2013");
    data_2014 = get_data_by_year(nested_data,"2014");
    
    console.log(data_2011, data_2012, data_2013, data_2014);
    data = nested_data;

      // Add X axis --> it is a date format
      var x = d3.scaleLinear()
      //.domain(d3.extent(data, function(d) { return d.date; }))
      .range([ 0, width ]);
    xAxis = svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
      
    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.value; })])
      .range([ height, 0 ]);
    yAxis = svg.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y))
      .append("text")
        .attr("y", -11)
        .attr("x", 2)
        .attr("dy", ".31em")
        .style("text-anchor", "end")
        .text(y_value);
        // Add the line
    svg.append("path")
    .datum(data_2014)
    .attr("id", "myPath")
    .attr("class", "line")  // I add the class line to be able to modify this line later on.
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-width", 1.0)
    .attr("d", d3.line()
      .x(function(d) { return x(d.date) })
      .y(function(d) { return y(+d.value) })
    )
}

$(document).ready(function(){

    //Read the data
    d3.csv("../dataset/full_data.csv",
      
      // When reading the csv, I must format variables: (total_amt, Qty)
      function(d){
        return { date : d3.timeParse("%Y-%m-%d")(d.tran_date), 
                  profit : d.total_amt, 
                  sales : d.Qty}
      },          
      
      function(data) {
        formatted = data;
        redraw();
    });
        
  
        //create an SVG
        var svg = d3.select("#line-chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); 

        //make a rectangle so there is something to click on
svg.append("svg:rect")
.attr("width", width)
.attr("height", height)
.attr("class", "plot");

//make a clip path for the graph  
var clip = svg.append("svg:clipPath")
.attr("id", "clip")
.append("svg:rect")
.attr("x", 0)
.attr("y", 0)
.attr("width", width)
.attr("height", height); 

d3.select(window)
    .on("keydown", function() { altKey = d3.event.altKey; })
    .on("keyup", function() { altKey = false; });
var altKey;

// set terms of transition that will take place
// when a new economic indicator is chosen   
function change() {
  d3.transition()
      .duration(altKey ? 7500 : 1500)
      .each(redraw);
}


function redraw() {
  
    // add the options to the button
    d3.select("#select-y")
      .selectAll('myOptions')
       .data(allGroup)
      .enter()
      .append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; }) // corresponding value returned by the button
  
        //Initialize with Profits
        linechart_from_csv(svg,formatted,"Profit");
        
        //Update function when the selectButton is clicked
        // A function that updates the chart
        function update(selectedGroup) {
          //Drop previous visualization
          d3.select("#line-chart svg").remove()
          //Add the new visualization
          var svg = d3.select("#line-chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");
          linechart_from_csv(svg,formatted,selectedGroup);
        } 
     
        // When the button is changed, run the updateChart function
        d3.select("#select-y").on("change", function(d) {
          // recover the option that has been chosen
          var selectedOption = d3.select(this).property("value")
          // run the updateChart function with this selected option
          update(selectedOption);
        })
      
    
    
    }
    
  });
