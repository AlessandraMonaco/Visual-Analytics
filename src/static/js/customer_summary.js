function customer_summary(data) {
    
    //Add elements
    d3.select("#total-cust")
    .append("div")
    .attr("class", "num-aggregation")
    .append("text")
    .html(data.length);

    var tr = d3.select("#customer-table tbody").selectAll("tr")
    .data(data)
    .enter().append("tr");

   var td = tr.selectAll("td")
    .data(function(d, i) { return Object.values(d); })
    .enter().append("td")
      .text(function(d, i) {if(i!=11) {
          if (i==7) return "$ "+ d;
        else return d;
       }
    else return "  "; })
      .style("background-color", function(d,i) {
          if (i==0) return "#181818";
          if (i==11) return myColor(d);
      })
      .style("color", function(d,i) {
            //if(i==0) return "gray";
        //cluster color
          if(i==4) return cluster_color[parseInt(d)];
     });

     
    console.log(data.length);
}


$(document).ready(function(){

    // Read from csv
    d3.csv("static/dataset/customers_summary.csv", function(data) {
        customer_summary(data);

        d3.select("#fieldset-segment").select(".description")
            .append("text")
            .html("(All customers)");
    });
});