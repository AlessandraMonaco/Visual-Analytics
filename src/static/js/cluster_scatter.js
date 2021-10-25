// set the dimensions and margins of the graph
var scatter_margin = {top: 10, right: 0, bottom: 30, left: 30},
    scatter_width = 175 - scatter_margin.left - scatter_margin.right,
    scatter_height = 175 - scatter_margin.top - scatter_margin.bottom;

// Draw scatter
function scatter_from_csv(svg,data,pc_x,pc_y) {
    var pc_1 = "pc_"+(pc_x).toString();
    var pc_2 = "pc_"+(pc_y).toString();
    //Compute cluster size
    var sizes = {};
    data.forEach(function(r) {
        if (!sizes[r.cluster]) {
            sizes[r.cluster] = 0;
        }
        sizes[r.cluster]++;
    });

    // Add X axis
    var x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return +parseFloat(d[pc_1]); }))
    .range([ 0, scatter_width ]);
    svg.append("g")
    .attr("transform", "translate(0," + scatter_height + ")")
    .attr("class", "axis")
    .style("stroke", "white")
    .call(d3.axisBottom(x));
    svg.append("text")             
    .attr("transform",
            "translate(" + (scatter_width/2) +" ," + 
                        (scatter_height + scatter_margin.top + 15) + ")")
    .style("text-anchor", "middle")
    .style("font-size", "9px")
    .style("fill", "white")
    .text("Principal Component "+(pc_x).toString());

    // Add Y axis
    var y = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return +parseFloat(d[pc_2]); }))
    .range([ scatter_height, 0]);
    svg.append("g")
    .attr("class", "axis")
    .style("stroke", "white")
    .call(d3.axisLeft(y));
    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -30 )
    .attr("x",0 - (scatter_height / 2))
    .attr("dy", "1em")
    .style("font-size", "9px")
    .style("text-anchor", "middle")
    .style("fill", "white")
    .text("Principal Component "+(pc_y).toString());   

    // Tooltip
        // create a tooltip
        var tooltip = d3.select("#scatter")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("width", "auto")
        .style("height", "auto");

    // Functions 
    // Highlight 
    var highlight = function(d){
        var clicked = document.getElementById('cluster-selector-select').value;
        if (clicked == 'all' && localStorage.getItem("rfm_customers")==null) {
            // Highlight in the scatter plot
            selected_cluster = d.cluster
    
            d3.selectAll(".dot")
                .transition()
                .duration(200)
                .style("fill", unselected_color)
                .attr("r", 1)
                .style("opacity", 0.1);
    
            d3.selectAll(".dot" + selected_cluster)
                .transition()
                .duration(200)
                .style("fill", cluster_color[parseInt(selected_cluster)])
                .attr("r", 1)
                .style("opacity", cluster_opacity);
        
            // Highlight in parallel coordinates

            // first every group turns grey
            d3.selectAll(".pline")
            .transition().duration(200)
            .style("stroke", "grey")
            .style("opacity", 0)
            // Second the hovered specie takes its color
            d3.selectAll(".pline" + selected_cluster)
            .transition().duration(200)
            .style("stroke", cluster_color[parseInt(selected_cluster)])
            .style("opacity", cluster_opacity);

            // Reset selector on All Data
            d3.select('#cluster-selector-select').property('value', 'all');

            // Show tooltip
            tooltip
            .style("opacity", 1)   
        }
         
         
    }

    // Remove highlight
    var doNotHighlight = function(){
        var clicked = document.getElementById('cluster-selector-select').value;
        if (clicked == 'all'  && localStorage.getItem("rfm_customers")==null) {
            // Do not highlight scatter
            d3.selectAll(".dot")
                .transition()
                .duration(200)
                .style("fill", function (d) { return cluster_color[parseInt(d.cluster)] } )
                .attr("r", 1 )
                .style("opacity", cluster_opacity);
                
            // Do not highlight parallel
            d3.selectAll(".pline")
                .transition().duration(200).delay(1000)
                .style("stroke", function(d){ return( cluster_color[parseInt(d.cluster)])} )
                .style("opacity", "1")
                .style("opacity", cluster_opacity);
        
            // Reset selector on All Data
            d3.select('#cluster-selector-select').property('value', 'all');

            //Hide tooltip
            tooltip
            .style("opacity", 0)
            
        }
    }

    // Detect mouse change for the tooltip to set the text
    var mousemove = function(d) {
        var clicked = document.getElementById('cluster-selector-select').value;
        if (clicked == 'all'  && localStorage.getItem("rfm_customers")==null) {
            tooltip
            .html("CLUSTER " + d.cluster +
            "<br>("+ sizes[d.cluster] +" customers)")
            .style("left", (d3.mouse(this)[0] + 50 + "px"))
            .style("top", (d3.mouse(this)[1] + "px"));
        }
    }

    // Add dots
    svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
        .attr("class", function (d) { return "dot dot" + d.cluster } )
        .attr("cx", function (d) { return x(d[pc_1]); } )
        .attr("cy", function (d) { return y(d[pc_2]); } )
        .attr("r", 1)
        .style("fill", function (d) { 
            // Check if there are active filters
            //If some clusters are selected
            if (localStorage.getItem("cluster_customers")) {
                var previous_customers = JSON.parse(localStorage.getItem("cluster_customers"));
            }
            else if (localStorage.getItem("rfm_customers")) {
                var previous_customers = JSON.parse(localStorage.getItem("rfm_customers"));
            }
            else var previous_customers = [];
            // Now color according to selections
            if (previous_customers.length!=0) {
                if (previous_customers.includes(d.cust_id))
                    return cluster_color[parseInt(d.cluster)];
            }
            else  //color all points
                return cluster_color[parseInt(d.cluster)];
        } )
        .style("cursor", "pointer")
        .style("opacity", function(d) {
            if (localStorage.getItem("cluster_customers")) {
                var previous_customers = JSON.parse(localStorage.getItem("cluster_customers"));
            }
            else if (localStorage.getItem("rfm_customers")) {
                var previous_customers = JSON.parse(localStorage.getItem("rfm_customers"));
            }
            else var previous_customers = [];
            // Now color according to selections
            if (previous_customers.length!=0) {
                if (previous_customers.includes(d.cust_id))
                    return cluster_opacity;
                else return 0;
            }
            else  //color all points
                return cluster_opacity;
            })
    .on("mouseover", highlight)
    .on("mousemove", mousemove)
    .on("mouseleave", doNotHighlight )
    .on("click", function(d) {
        document.getElementById('cluster-selector-select').value = d.cluster;
        //Hide tooltip (we show it again in the selector code)
        tooltip
        .style("opacity", 0)
        // Notify the change of the cluster selector forcing the change event
        var element = document.getElementById('cluster-selector-select');
        var event = new Event('change');
        element.dispatchEvent(event);
    });
}

$(document).ready(function(){
    

    //Read the data
    d3.csv("static/dataset/pca_kmeans_data.csv", function(data) {
        
        
        //console.log(sizes[1]);

        

        // Color scale: give me a cluster name, I return a color
        /*color = d3.scaleOrdinal()
            .domain(d3.extent(data, function(d) { return +parseInt(d.cluster); }))
            .range(cluster_color);*/

        // append the svg object to the body of the page
        var svg = d3.select("#scatter")
        .append("svg")
            .attr("width", scatter_width + scatter_margin.left + scatter_margin.right)
            .attr("height", scatter_height + scatter_margin.top + scatter_margin.bottom)
        .append("g")
            .attr("transform",
                "translate(" + scatter_margin.left + "," + scatter_margin.top + ")");


        
    
        
        
    
        // Color scale: give me a specie name, I return a color
        /*var color = d3.scaleOrdinal()
        .domain(d3.extent(data, function(d) { return +parseInt(d.cluster); }))
        .range(cluster_color)*/
    
        
        
        
        scatter_from_csv(svg,data,1,2);
        


        //Add the options to the selectors
        if(localStorage.getItem("n_components")) {
            var n_components = parseInt(localStorage.getItem("n_components"));
        }
        else var n_components = 2;
        // X-Y axis selector
        var selector = d3.selectAll(".ax-selector");
        for (i=1; i<=n_components; i++) {    
            selector.append("option")
                .attr("value", i)
                .text("PC "+(i).toString());
        }
        //Default selection
        $('#x-selector-select').val('1');
        $('#y-selector-select').val('2');
        
        //document.getElementById("#y-selector-select").value = "2";
        //Add the on change event to x axis
        d3.select("#x-selector-select").on("change", function() {
            // recover the option that has been chosen
            var selected_x = d3.select(this).property("value");
            var selected_y = d3.select("#y-selector-select").property("value");
            console.log(selected_x,selected_y);
            // Remove current scatter data
            d3.select("#scatter").select("svg").remove();
            // Recreate svg
            var svg = d3.select("#scatter")
            .append("svg")
                .attr("width", scatter_width + scatter_margin.left + scatter_margin.right)
                .attr("height", scatter_height + scatter_margin.top + scatter_margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + scatter_margin.left + "," + scatter_margin.top + ")");
            
            // Add new data (new components)
            scatter_from_csv(svg,data,parseInt(selected_x),parseInt(selected_y));
        });

        //Add the on change event to y axis
        d3.select("#y-selector-select").on("change", function() {
            // recover the option that has been chosen
            var selected_y = d3.select(this).property("value");
            var selected_x = d3.select("#x-selector-select").property("value");
            console.log(selected_x,selected_y);
            // Remove current scatter data
            d3.select("#scatter").select(".tooltip").remove()
            d3.select("#scatter").select("svg").remove();
            // Recreate svg
            var svg = d3.select("#scatter")
            .append("svg")
                .attr("width", scatter_width + scatter_margin.left + scatter_margin.right)
                .attr("height", scatter_height + scatter_margin.top + scatter_margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + scatter_margin.left + "," + scatter_margin.top + ")");
            
            // Add new data (new components)
            scatter_from_csv(svg,data,parseInt(selected_x),parseInt(selected_y));
        });

    })
  
})