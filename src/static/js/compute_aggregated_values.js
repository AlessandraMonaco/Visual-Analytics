function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function compute_aggregated_values(data) {

    // Aggregate by summing daily amounts
    // IMPORTANT : The csv must be sorted on dates
    var nested_data = d3.nest()
    .key(function(d){ return d.date; })
    .rollup(function(d) { 
        return d3.sum(d, function(d) {return d.profit; })
    })
    .entries(data)
    .map(function(d){
        return { date: new Date(d.key), value: d.value};
    });

    // Compute the aggregated metrics
    var total_sales = numberWithCommas(d3.sum(data.map(function(d){ return d.sales})));
    var total_profits = numberWithCommas(d3.sum(data.map(function(d){ return d.profit})).toFixed(0));
    var avg_daily_profit = numberWithCommas(d3.mean(nested_data.map(function(d){ return d.value})).toFixed(0));

    d3.select('#total-profits text').html("$"+total_profits);
    d3.select('#total-sales text').html(total_sales);
    d3.select('#avg-daily-profit text').html("$"+avg_daily_profit);
}



$(document).ready(function(){

    //Read the data
    d3.csv("static/dataset/full_data.csv", 
               
        function(d){
            return { date : d3.timeParse("%Y-%m-%d")(d.tran_date), 
                  profit : d.total_amt,
                  sales : d.Qty
                }
        },

        function(data) {
       
            //Add elements
            d3.select("#total-profits")
                .append("div")
                .attr("class", "num-aggregation")
                .append("text");           

            d3.select("#total-sales")
                .append("div")
                .attr("class", "num-aggregation")
                .append("text")
                   
            d3.select("#avg-daily-profit")
                .append("div")
                .attr("class", "num-aggregation")
                .append("text")
                
            //Compute and append values
            compute_aggregated_values(data);
            //console.log(total_sales, total_profits, avg_daily_profit);
        
        // append the svg object to the body of the page
    
    }); //end csv
    
}); //end doc ready