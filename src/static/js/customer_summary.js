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

    // Make headers clickable for sorting
    var headers = ['cust_id','DOB','Gender','city_code','cluster','recency','frequency',
                    'monetary','R','F','M','Avg_M'];
    headers.forEach(function(h) {
        // Select the th element
        var id = "#"+h;
        var th = d3.select(id).style("cursor", "pointer").on("click", function(d) {
            
            if (d3.select(this).style("background-color") == "white") {
                //Unselect
                d3.select(this).style("background-color", "gray");
                d3.select("#total-cust").select("div").remove();
                d3.select("#customer-table tbody").selectAll("tr").remove();
                // Standard order: by cust_id
                sorted_data = data.sort(function(a,b) { 
                    return d3.ascending(a.cust_id,b.cust_id);
                });
                customer_summary(sorted_data);
               
            }
            else {
                // All gray
                d3.selectAll("th").style("background-color", "gray");
                d3.select(this).style("background-color", "white");

                // Sort data basing on h value
                sorted_data = data.sort(function(a,b) { 
                    // If DOB, parseDate, if Monetary and Avg_M parseFloat
                    if (h=='DOB') return d3.descending(new Date(a[h]),new Date(b[h]));
                    if (h=='monetary' || h=='Avg_M') return d3.descending(parseFloat(a[h]), parseFloat(b[h]));
                    else return d3.descending(a[h],b[h]);
                });
                d3.select("#total-cust").select("div").remove();
                d3.select("#customer-table tbody").selectAll("tr").remove();
                customer_summary(sorted_data);
            }
            
            
            
        });
    });
    //console.log(data.length);
}


$(document).ready(function(){

    // Read from csv
    d3.csv("static/dataset/customers_summary.csv", function(data) {
        //console.log(localStorage.getItem("cluster_customers"));
        // Standard order: by cust_id
        data = data.sort(function(a,b) { 
            return d3.ascending(a.cust_id,b.cust_id);
        });

        customer_summary(data);

        d3.select("#fieldset-segment").select(".description")
            .append("text")
            .html("(All customers)");
    });
});