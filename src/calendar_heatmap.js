var colours=["#ffffd4","#fed98e","#fe9929","#d95f0e","#993404"];

//general layout information
var cellSize = 7;
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

//Draw the calendar heatmap
function calendar_from_csv(svg, data, y_value) {

    //Set units and breaks depeding on the selected y_value
    if(y_value=="Profit") { 
        var units="$";
        var breaks=[10000,20000,40000,60000]; //to do
    }
    else { 
        var units=" sales";
        var breaks=[10,25,50,100]; //to do
    }

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
    var yearlyData = d3.nest()
        .key(function(d){ return (new Date (d.date)).getFullYear(); })
        .entries(nested_data)

    //Debug
    console.log(yearlyData[0].values[0].value);

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
        .attr("id",function(d) {
            console.log(format(new Date(d.date))+":"+d.value);
            return format(new Date(d.date))+":"+d.value;
        })
        .attr("stroke","#ccc")
        .attr("width",cellSize)
        .attr("height",cellSize)
        .attr("x", function(d){return xOffset+calX+(d3.time.weekOfYear(new Date(d.date)) * cellSize);})
        .attr("y", function(d) { return calY+(new Date(d.date).getDay() * cellSize); })
        .attr("fill", function(d) {
            if (d.value<breaks[0]) {
                return colours[0];
            }
            for (i=0;i<breaks.length+1;i++){
                if (d.value>=breaks[i]&&d.value<breaks[i+1]){
                    return colours[i];
                }
            }
            if (d.value>breaks.length-1){
                return colours[breaks.length]   
            }
        })
    
    //append a title element to give basic mouseover info
    dataRects.append("title")
        .text(function(d) { return toolDate(new Date(d.date))+":\n"+d.value+units; });
                
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
        console.log(d,i);
        monthLabels.append("text")
            .attr("class","monthLabel")
            .attr("x",monthX[i])
            .attr("y",calY/1.2)
            .text(d);
    })

    //create key
    var key = svg.append("g")
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
        .attr("fill",function(d){
            return d;
        });

    key.selectAll("text")
        .data(colours)
        .enter()
        .append("text")
        .style("fill", function(d){
            return d;})
        .attr("x",function(d,i){
            return cellSize+5+(i*70);
        })
        .attr("y","1em")
        .text(function(d,i){
            if (i<colours.length-1){
                return "up to "+breaks[i];
            }   else    {
                return "over "+breaks[i-1];   
            }
        });

}

$(document).ready(function(){

    //Read the data
    d3.csv("../dataset/full_data.csv",
      
        // When reading the csv, I must format variables: (total_amt, Qty)
        function(d){
            return { 
                date : d3.timeParse("%Y-%m-%d")(d.tran_date), 
                profit : parseInt(d.total_amt), 
                sales : parseInt(d.Qty)}
        },          
      
        function(data) {

            //Create chart
            var svg = d3.select("#calendar-heatmap").append("svg")
                        .attr("width", "420px")
                        .attr("viewBox","0 0 "+(xOffset+year_width)+" 540")

            //At the beginning, initialize the graph with profits
            var y_value = "Profit";
            calendar_from_csv(svg,data,y_value);
   
            
        
        
            // When the button "Profit/Sales" is changed, refresh the graph with the new infos
            function update_calendar(selectedOption) {
                console.log(selectedOption);
                y_value = selectedOption;

                //Drop previous visualization
                d3.select("#calendar-heatmap svg").remove()
                //Add the new visualization
                var svg = d3.select("#calendar-heatmap").append("svg")
                    .attr("width", "420px")
                    .attr("viewBox","0 0 "+(xOffset+year_width)+" 540")

                calendar_from_csv(svg,data,y_value);
                
            }
      
            // When the button is changed, run the updateChart function
            d3.select("#select-y-cal").on("change", function(d) {
                // recover the option that has been chosen
                var selectedOption = d3.select(this).property("value")
                // run the updateChart function with this selected option
                update_calendar(selectedOption);  
            })
        
        
        


        } //end of function(data)


    )});