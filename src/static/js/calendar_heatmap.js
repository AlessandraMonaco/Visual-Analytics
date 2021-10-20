var colours=["#f7f7f7","#cccccc","#969696","#636363","#252525"]; //ColorBrewer gray scale


//general layout information
var cellSize = 6;
var xOffset=10; //margin-left
var yOffset=10; //margin-top
var calY=20; //offset of calendar in each group
var calX=25;
var year_width = 400; //used to compute width of the year group
var year_height = 53; //Space between each year group
var parseDate = d3.time.format("%d/%m/%y").parse;
format = d3.time.format("%d-%m-%Y");
toolDate = d3.time.format("%d/%b/%y");

//Function
function monthPath(t0) {
    var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
        d0 = t0.getDay(), w0 = d3.time.weekOfYear(t0),
        d1 = t1.getDay(), w1 = d3.time.weekOfYear(t1);
    return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
        + "H" + w0 * cellSize + "V" + 7 * cellSize
        + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
        + "H" + (w1 + 1) * cellSize + "V" + 0
        + "H" + (w0 + 1) * cellSize + "Z";
  }


function continuous_h(selector_id,colorscale) {
    var legendheight = heat_height+280,
        legendwidth = 80,
        margin = {top: 10, right: 60, bottom: 10, left: 3};
  
    
    var canvas = d3.select(selector_id)
      .style("height", 40 + "px")
      .style("width", legendheight + "px")
      .style("position", "relative")
      //.attr("translate", "rotate(-90)")
      .append("canvas")
      .attr("height", legendheight - margin.top - margin.bottom)
      .attr("width", 1)
      .style("height", (legendheight - margin.top - margin.bottom) + "px")
      .style("width", (legendwidth - margin.left - margin.right) + "px")
      .style("border", "1px solid #000")
      .style("position", "absolute")
      //.attr("transform", "rotate(-90)")
      .style("top", (margin.top) + "px")
      .style("left", (margin.left) + "px")
      .node();
  
    var ctx = canvas.getContext("2d");
    var ox = canvas.width / 2;
    var oy = canvas.height / 2;
 
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
    //ctx.translate(ox, oy); // change origin
    //ctx.rotate(-(Math.PI)/2);
    //ctx.save();
    //ctx.restore();
  
    var legendaxis = d3.axisRight()
      .scale(legendscale)
      .tickSize(4)
      .ticks();
  
    var svg = d3.select(selector_id)
      .append("svg")
      .attr("height", (legendheight) + "px")
      .attr("width", (legendwidth) + "px")
      //.attr("translate", "rotate(-90)")
      .style("position", "absolute")
      .style("left", "0px")
      .style("top", "0px")
      .style("pointer-events", "none");
  
    svg
      .append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + (legendwidth - margin.left - margin.right + 3) + "," + (margin.top) + ")")
      .call(legendaxis)
      .selectAll("text")  
      .style("text-anchor", "middle")
      .attr("dx", "-.8em")
    .attr("dy", "-1em")
    .attr("transform", "rotate(90)");
    //d3.select("#legend1").attr("translate", "rotate(90deg)");
  };

//Draw the calendar heatmap
function calendar_from_csv(svg, data, y_value) {


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
            return { date: d.key, value: d.value};
        });

    // Set color scale
    // Build color scale
  max = d3.max(nested_data.map(function(d) { return parseFloat(d.value); }));

  myColorCal = d3.scaleSequential()
  .interpolator(d3.interpolateBuPu)
  .domain([0,max]);

  // Drop previous legend if exists
  d3.select("#legend1").select("svg").remove(); //legend
  continuous_h("#legend1", myColorCal);

  //Set units and breaks depeding on the selected y_value
  var add = max/4;
  if(y_value=="Profit") { 
    var units=" $";
    var breaks=[parseInt(0+add),parseInt(0+2*add),parseInt(0+3*add),parseInt(max)]; //to do
}
else { 
    var units=" sales";
    var breaks=[parseInt(0+add),parseInt(0+2*add),parseInt(0+3*add),parseInt(max)]; //to do
}


    var yearlyData = d3.nest()
        .key(function(d){ return (new Date (d.date)).getFullYear(); })
        .entries(nested_data)

    //Debug
    //console.log(yearlyData[0].values[0].value);

    //create an SVG group for each year
    var cals = svg.selectAll("g")
        .data(yearlyData)
        .enter()
        .append("g")
        .attr("id",function(d){
            return d.key;
        })
        .attr("transform",function(d,i){
            return "translate(0,"+(yOffset+(i*(year_height+calY)))+")";  
        })
    
    //Year labels
    var labels = cals.append("text")
        .attr("class","yearLabel")
        .attr("x",xOffset)
        .attr("y",15) //margin top of year label
        .text(function(d){return d.key});

    //create a daily rectangle for each year
    var rects = cals.append("g")
        .attr("id","alldays")
        .selectAll(".day")
        .data(function(d) { 
            //console.log(d3.time.days(new Date(parseInt(d.key), 0, 1), 
            //new Date(parseInt(d.key) + 1, 0, 1)));
            return d3.time.days(new Date(parseInt(d.key), 0, 1), 
                new Date(parseInt(d.key) + 1, 0, 1)); })
        .enter().append("rect")
        .attr("id",function(d) {
            return "_"+format(d);
            //return toolDate(d.date)+":\n"+d.value+" dead or missing";
        })
        .attr("class", "day")
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("x", function(d) {
            return xOffset+calX+(d3.time.weekOfYear(d) * cellSize);
        })
        .attr("y", function(d) { return calY+(d.getDay() * cellSize); })
        .datum(format);

    //create day labels
    var days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    var dayLabels=cals.append("g").attr("id","dayLabels")
    days.forEach(function(d,i)    {
        dayLabels.append("text")
            .attr("class","dayLabel")
            .attr("x",xOffset)
            .attr("y",function(d) { return calY+(i * cellSize); })
            .attr("dy","0.9em")
            .text(d);
    })

    //let's draw the data on
    var dataRects = cals.append("g")
        .attr("id","dataDays")
        .selectAll(".dataday")
        .data(function(d){
            //console.log(d.values);
            return d.values;   //one array for each year
        })
        .enter()
        .append("rect")
        .style("cursor", "help")
        .attr("id",function(d) {
            //console.log(format(new Date(d.date))+":"+d.value);
            //return format(new Date(d.date))+":"+d.value;
            return format(new Date(d.date));
        })
        .attr("stroke","#ccc")
        .attr("width",cellSize)
        .attr("height",cellSize)
        .attr("x", function(d){return xOffset+calX+(d3.time.weekOfYear(new Date(d.date)) * cellSize);})
        .attr("y", function(d) { return calY+(new Date(d.date).getDay() * cellSize); })
        .attr("fill", function(d) {
            /*if (d.value<breaks[0]) {
                return colours[0];
            }
            for (i=0;i<breaks.length+1;i++){
                if (d.value>=breaks[i]&&d.value<breaks[i+1]){
                    return colours[i];
                }
            }
            if (d.value>breaks.length-1){
                return colours[breaks.length];   
            }*/
            return myColorCal(parseFloat(d.value));
        });
    
    //append a title element to give basic mouseover info
    dataRects.append("title")
        .text(function(d) { return toolDate(new Date(d.date))+":\n"+pretty_value(d.value, y_value); });
    
    // On mouse over show tooltip in line chart
    dataRects
        .on("mouseover", function(d) {
            console.log(d); //access through d.date d.value
            // Select linechart tooltip
            // Append correct text
            var selectedDate = new Date(d.date);
            y_lin = d3.select("#select-y").property("value");
            y_value = d3.select("#select-y-cal").property("value");
            if(y_value==y_lin) {
                console.log("yes");
                selectedValue = d.value;
                console.log(selectedValue);
            }
            else {
                console.log("no");
                var renested_data = d3.nest()
                    .key(function(d){ return d.date; })
                    .rollup(function(d) { 
                if(y_lin=="Profit") {
                    return d3.sum(d, function(d) {return d.profit; })
                }
                if(y_lin=="Sales") {
                    return d3.sum(d, function(d) {return d.sales; })
                }       
                }).entries(data)
                    .map(function(d){
                    return { date: d.key, value: d.value};
                });

                renested_data.forEach(function(r) {
                    if (r.date==selectedDate.toString()){
                         selectedValue = r.value;
                    }
                });
                //if(y_lin=="Profit") selectedValue = parseFloat(selectedData.value);
                //if(y_lin=="Sales") selectedValue = parseInt(selectedData.value);
            }
            
            focus
                .attr("cx", x(selectedDate))
                .attr("cy", y(selectedValue));
                
            focusText
                .html(pretty_value(selectedValue, y_lin))
                .attr("x", x(selectedDate)+5)
                .attr("y", y(selectedValue)+5);
            focusDate
                .html(format(selectedDate))
                .attr("x", x(selectedDate)+5)
                .attr("y", y(selectedValue)+17);
            // Show tooltip
            focus.style("opacity", 1);
            focusText.style("opacity",1);
            focusDate.style("opacity",1);
            //Find y (if cal_y e y_value selector are different)
            //var item = data[bisect(data, selectedDate)];
            
            console.log(y(selectedValue));
            console.log(selectedData);
        })
        .on("mouseleave", function() {
            // Hide tooltip
            focus.style("opacity", 0);
            focusText.style("opacity",0);
            focusDate.style("opacity",0);
        });
    
                
    //add montly outlines for calendar
    cals.append("g")
        .attr("id","monthOutlines")
        .selectAll(".month")
        .data(function(d) { 
            return d3.time.months(new Date(parseInt(d.key), 0, 1),
                  new Date(parseInt(d.key) + 1, 0, 1)); 
        })
        .enter().append("path")
        .attr("class", "month")
        .attr("transform","translate("+(xOffset+calX)+","+calY+")")
        .attr("d", monthPath);
    
    //retreive the bounding boxes of the outlines
    var BB = new Array();
    var mp = document.getElementById("monthOutlines").childNodes;
    for (var i=0;i<mp.length;i++){
        BB.push(mp[i].getBBox());
    }

    var monthX = new Array();
    BB.forEach(function(d,i){
        boxCentre = d.width/2;
        monthX.push(xOffset+calX+d.x+boxCentre);
    })

    //create centred month labels around the bounding box of each month path
    //create day labels
    var months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    var monthLabels=cals.append("g").attr("id","monthLabels")
    months.forEach(function(d,i)    {
        //console.log(d,i);
        monthLabels.append("text")
            .attr("class","monthLabel")
            .attr("x",monthX[i])
            .attr("y",calY/1.2)
            .text(d);
    })

    //create key
    /*var key = svg.append("g")
        .attr("id","key")
        .attr("class","key")
        .attr("transform",function(d){
            return "translate("+xOffset+","+(yOffset-(cellSize*1.5))+")";
        });

    key.selectAll("rect")
        .data(colours)
        .enter()
        .append("rect")
        .attr("width",cellSize)
        .attr("height",cellSize)
        .attr("x",function(d,i){
            return i*70;
        })
        .style("stroke", "black")
        .attr("fill",function(d){
            return d;
        });

    key.selectAll("text")
        .data(colours)
        .enter()
        .append("text")
        //.style("fill", function(d){
        //    return d;})
        .style("fill", "white")
        .attr("x",function(d,i){
            return cellSize+5+(i*70);
        })
        .attr("y","1em")
        .style("font-size", "9px")
        .text(function(d,i){ 
            if(i==0) {return "0"+"-"+breaks[i];}
            if(breaks[i]==undefined) {return breaks[i-1];}
            else { return breaks[i-1]+"-"+breaks[i];}
            /*if (i<colours.length-1){
                return "up to "+breaks[i];
            }   else    {
                return "over "+breaks[i-1];   
            }
        });*/

}

$(document).ready(function(){

    //Read the data
    d3.csv("static/dataset/full_data.csv",
      
        // When reading the csv, I must format variables: (total_amt, Qty)
        function(d){
            return { 
                date : d3.timeParse("%Y-%m-%d")(d.tran_date), 
                profit : parseInt(d.total_amt), 
                sales : parseInt(d.Qty),
                cust_id : d.cust_id,
                prod_cat : d.prod_cat,
                prod_subcat : d.prod_subcat}
        },          
      
        function(data) {

            //Create chart
            var svg = d3.select("#calendar-heatmap").append("svg")
                        .attr("width", "420px")
                        .attr("viewBox","0 0 "+(xOffset+year_width)+" 540")
            
            
                        
            //At the beginning, initialize the graph with profits
            document.getElementById("select-y-cal").value = "Profit"
            var y_value = document.getElementById("select-y-cal").value;
            calendar_from_csv(svg,data,y_value);
          
            
        
        
            // When the button "Profit/Sales" is changed, refresh the graph with the new infos
            function update_calendar(selectedOption) {
                //console.log(selectedOption);
                y_value = selectedOption;

                //Drop previous visualization
                d3.select("#calendar-heatmap svg").remove(); //view
                //Add the new visualization
                var svg = d3.select("#calendar-heatmap").append("svg")
                    .attr("width", "420px")
                    .attr("viewBox","0 0 "+(xOffset+year_width)+" 540")

                //Check if other filters were active
                // CHECK OTHER SELECTIONS AND FILTERS
                filtered = ActiveFilters(data);
                calendar_from_csv(svg,filtered,y_value);

                //Check if a the time filter is active
                if(localStorage.getItem("starting_date")) {
                    var starting_date = new Date(localStorage.getItem("starting_date"));
                    var ending_date = new Date(localStorage.getItem("ending_date"));
                    // Color calendar rects only for the selected date interval
                    d3.select("#calendar-heatmap").selectAll("#dataDays").selectAll("rect")
                    .attr("fill", function(d) {
                        if (new Date(d.date) >= starting_date && new Date(d.date) <= ending_date) {
                        //console.log(myColorCal(d.value));
                        return myColorCal(d.value);
                        }
                        else return "white";
                    });
                }
                
            }
      
            // When the button is changed, run the updateChart function
            d3.select("#select-y-cal").on("change", function(d) {
                // recover the option that has been chosen
                selectedOption = d3.select(this).property("value")
                // run the updateChart function with this selected option
                update_calendar(selectedOption);  
            })
        
            
        


        } //end of function(data)


    )});