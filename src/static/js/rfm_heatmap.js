// set the dimensions and margins of the graph
var heat_margin = {top: 15, right: 25, bottom: 30, left: 30},
  heat_width = 150 - heat_margin.left - heat_margin.right,
  heat_height = 150 - heat_margin.top - heat_margin.bottom;

// create continuous color legend
function continuous(selector_id,colorscale) {
  var legendheight = heat_height+30,
      legendwidth = 80,
      margin = {top: 22, right: 60, bottom: 10, left: 3};

  var canvas = d3.select(selector_id)
    .style("height", legendheight + "px")
    .style("width", legendwidth + "px")
    .style("position", "relative")
    .append("canvas")
    .attr("height", legendheight - margin.top - margin.bottom)
    .attr("width", 1)
    .style("height", (legendheight - margin.top - margin.bottom) + "px")
    .style("width", (legendwidth - margin.left - margin.right) + "px")
    .style("border", "1px solid #000")
    .style("position", "absolute")
    .style("top", (margin.top) + "px")
    .style("left", (margin.left) + "px")
    .node();

  var ctx = canvas.getContext("2d");

  var legendscale = d3.scaleLinear()
    .range([1, legendheight - margin.top - margin.bottom])
    .domain(colorscale.domain());

     

  // image data hackery based on http://bl.ocks.org/mbostock/048d21cf747371b11884f75ad896e5a5
  var image = ctx.createImageData(1, legendheight);
  d3.range(legendheight).forEach(function(i) {
    var c = d3.rgb(colorscale(legendscale.invert(i)));
    image.data[4*i] = c.r;
    image.data[4*i + 1] = c.g;
    image.data[4*i + 2] = c.b;
    image.data[4*i + 3] = 255;
  });
  ctx.putImageData(image, 0, 0);

  var legendaxis = d3.axisRight()
    .scale(legendscale)
    .tickSize(4)
    .ticks(4);

  var svg = d3.select(selector_id)
    .append("svg")
    .attr("height", (legendheight) + "px")
    .attr("width", (legendwidth) + "px")
    .style("position", "absolute")
    .style("left", "0px")
    .style("top", "0px")

  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + (legendwidth - margin.left - margin.right + 3) + "," + (margin.top) + ")")
    .call(legendaxis);
};

function rfm_heatmap_from_csv(svg,data) {

  // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
  var myGroups = d3.map(data, function(d){return d.R;}).keys().sort() //rows of heat
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
                      (heat_height + heat_margin.top + 5) + ")")
  .style("text-anchor", "middle")
  .style("font-size", "9px")
  .style("fill", "white")
  .text("Recency (days)");

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
  .text("Frequency (orders)");

  // Build color scale
  avg_max = d3.max(data.map(function(d) { return parseFloat(d.Avg_M); }));

  myColor = d3.scaleSequential()
  .interpolator(d3.interpolatePurples)
  .domain([0,avg_max]);

  

  // Three function that change the tooltip when user hover / move / leave a cell OK!!
  var mouseover = function(d) {

    // Show tooltip
      tooltip
      .style("opacity", 1)
    
    // Set rect border to white
      d3.select(this)
      .style("stroke", "white")
      .style("opacity", 1)

    
    selected_R = d.R;
    selected_F = d.F;
      
      // HIghlight parallel
      // first every group turns grey TO DO: EVERY CLASSED "unselected" turns grey
      // Second the hovered specie takes its color
      // TO FIX
    if(localStorage.getItem("rfm_customers") &&
    localStorage.getItem("rfm_customers")!="[]" ) { }

    else { //OKKKKKKK
      d3.selectAll(".p2line")
      .transition().duration(200)
      .style("stroke", unselected_color)
      .style("opacity", "0");
      

      d3.selectAll(".p2line" + selected_R + selected_F)
      .transition().duration(200)
      .style("stroke", myColor(d.Avg_M))
      .style("opacity", "1");
    }
  }
  var mousemove = function(d) {
      tooltip
      .html("Mean M value: " + parseFloat(d.Avg_M).toFixed(2) +
      "<br>("+ parseInt(d.Count) + " customers)"+
      "<br>" + "<span class='category' >"+d.RFM_Level + "</span>")
      .style("left", (d3.mouse(this)[0] + 50 + "px"))
      .style("top", (d3.mouse(this)[1] + "px"))
  }
  var mouseleave = function(d) {
    
    //Hide tooltip
      tooltip
      .style("opacity", 0)

      if(d3.select(this).attr("class")=="unselected") {
        d3.select(this)
        .style("stroke", "black")
        .style("opacity", 0.8);
    
        /*Set original parallel viz
        d3.selectAll(".unselected .p2line")
        .transition().duration(200)
        .style("stroke",  unselected_color )
        .style("opacity", 0);*/
      }
      else {
        d3.select(this)
        .style("stroke", "white")
        .style("opacity", 1);
      }

      d3.selectAll(".p2line")
        .transition().duration(200)
        .style("stroke",  function(d) { return myColor(d.Avg_M);} )
        .style("opacity", 1);

      // IF THERE ARE RFM SEGMENTS SELECTIONS, COLOR ACCORDING TO THE SELECTIONS
      // TO FIX
      /*if(localStorage.getItem("rfm_customers") && 
      localStorage.getItem("rfm_customers")!=[] ) {
        // Unselected in grey
        /*d3.selectAll(".unselected .p2line")
        .transition().duration(200)
        .style("opacity", "0");
        // Selected in their colour
        d3.selectAll(".selected .p2line")
        .transition().duration(200)
        .style("stroke",  function(d) { return myColor(d.Avg_M);} )
        .style("opacity", "1");
      }
      // IF NO SELECTION, COLOR ALL AS DEFAULT MYCOLOR
      else {
        d3.selectAll(".p2line")
        .transition().duration(200)
        .style("stroke",  function(d) { return myColor(d.Avg_M);} )
        .style("opacity", "1");
      }*/

      //Set original parallel viz
      /*d3.selectAll(".p2line .unselected")
      .transition().duration(200)
      .style("stroke",  unselected_color )
      .style("opacity", 0);*/
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
      .style("cursor", "pointer")
      .style("fill", function(d) { return myColor(d.Avg_M)} )
      .style("stroke-width", 1)
      .style("stroke", "black")
      .style("opacity", 0.8)
  .on("mouseover", mouseover)
  .on("mousemove", mousemove)
  .on("mouseleave", mouseleave)

}

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
      tooltip = d3.select("#rfm-heatmap")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("width", "140px")
      .style("height", "auto");

        rfm_heatmap_from_csv(svg,data);
      
      svg.selectAll('rect').attr("class", "unselected");
      // create a tooltip
  

        // Add legend for M to graph





d3.select("#rfm-legend").append("text")
.attr("transform", "rotate(-90)")
    .attr("id", "rfm-legend-title")
    .attr("y", -20 )
  .attr("x",0 - (heat_height / 2))
    .attr("dy", "1em")
    .style("font-size", "9px")
    .style("text-anchor", "middle")
    .style("fill", "white")
    .text("Avg Monetary ($)");  

    continuous("#rfm-legend", myColor);
    
    //Add value legend
    d3.csv("static/dataset/rfm_data.csv", function(rfm_data) {
      var value_legend = d3.select("#value-legend");

      var r1_data = rfm_data.filter(function(d) { if (d.R=='1') return d;});
      var r2_data = rfm_data.filter(function(d) { if (d.R=='2') return d;});
      var r3_data = rfm_data.filter(function(d) { if (d.R=='3') return d;});
      var r4_data = rfm_data.filter(function(d) { if (d.R=='4') return d;});

      var f1_data = rfm_data.filter(function(d) { if (d.F=='1') return d;});
      var f2_data = rfm_data.filter(function(d) { if (d.F=='2') return d;});
      var f3_data = rfm_data.filter(function(d) { if (d.F=='3') return d;});
      var f4_data = rfm_data.filter(function(d) { if (d.F=='4') return d;});
  
      var max1 = d3.max(r1_data.map(function(d) { return parseFloat(d.recency); }));
      var max2 = d3.max(r2_data.map(function(d) { return parseFloat(d.recency); }));
      var max3 = d3.max(r3_data.map(function(d) { return parseFloat(d.recency); }));
      var max4 = d3.max(r4_data.map(function(d) { return parseFloat(d.recency); }));
      value_legend.select("#r1").append("text").text(" "+(max1.toString())+" - "+ (max2+1).toString() );
      value_legend.select("#r2").append("text").text(" "+ ((max2).toString()) +" - "+ (max3+1).toString());
      value_legend.select("#r3").append("text").text(" "+ ((max3).toString()) +" - "+ (max4+1).toString());
      value_legend.select("#r4").append("text").text(" "+ ((max4).toString()) +" - 0");

      max1 = d3.max(f1_data.map(function(d) { return parseFloat(d.frequency); }));
      max2 = d3.max(f2_data.map(function(d) { return parseFloat(d.frequency); }));
      max3 = d3.max(f3_data.map(function(d) { return parseFloat(d.frequency); }));
      max4 = d3.max(f4_data.map(function(d) { return parseFloat(d.frequency); }));
      value_legend.select("#f1").append("text").text(" 0 - "+(max1.toString()));
      value_legend.select("#f2").append("text").text(" "+ (max1+1).toString()+" - "+(max2.toString()));
      value_legend.select("#f3").append("text").text(" "+ (max2+1).toString()+" - "+(max3.toString()));
      value_legend.select("#f4").append("text").text(" "+ (max3+1).toString()+" - "+(max4.toString()));



    });
          
    }); //end of d3.csv

}) //end of document.ready