/*A function to change json nested format to d3 
treemap suitable format */
function change_json_format(root,value_key) {
    //console.log("Calling");
    for (var key in root) {
        if (key == "key") {
            root.name = root.key;
            delete root.key;
        }
        if (key == "values") {
            root.children = [];
            for (item in root.values) {
                root.children.push(change_json_format(root.values[item],value_key));
            }
            delete root.values;
        }
        if (key == value_key) {
            root.value = parseFloat(root[value_key]);
            delete root[value_key];
        }
    }
    return root;
}

/*A function to create the treemap visualization*/
function treemap_from_csv(csv_data) { 
        
        // Nest data by categories and subcategories
        var nested_data = d3.nest()
        .key(function(d) { return d.prod_cat; })
        .key(function(d) { return d.prod_subcat; })
        .rollup(function(d) { 
            return d3.sum(d, function(d) {return d.Qty; });
        }) //sum the quantities for each subcategory
        .entries(csv_data);
        
        //console.log("Nested data")
        //console.debug(nested_data);
        //alert(JSON.stringify(nested_data));                 
        
        // Creat the root node for the treemap
        var root = {};
        
        // Add the data to the tree, creating a pseudoroot
        root.key = "Products";
        root.values = nested_data;
        root = change_json_format(root,"Paid_fare"); //Change json format
        //console.log(root);
        //alert(JSON.stringify(root)); 
        
        var root2 = d3.hierarchy(root).sum(function(d){ return d.value}) // Here the size of each leave is given in the 'value' field in input data
        
        // Then d3.treemap computes the position of each element of the hierarchy
        var width = 320,
        height = 180;
        
        var color = d3.scale.ordinal()
        .range(["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02"])
        
        var treemap = d3.layout.treemap()
        .size([width, height])
        //.padding(0.25) //I like the thin interal lines, the group seporations are set in the CSS
        .padding([14, 5, 0, 0])
        .value(function (d) { return d.value; });
        
        var div = d3.select("#treemap").append("div")
        .attr("class","treemap")
        .style("position", "relative")
        .style("width", width + "px")
        .style("height", height + "px");
        
        var tool = d3.select("body").append("div").attr("class", "toolTip toolCat");
        
        d3.select(self.frameElement).style("height", height + 300 + "px");
        d3.select(self.frameElement).style("width", width+20 + "px");
        
        div.selectAll(".node")
        .data(treemap.nodes(root2))
        .enter().append("div")
        .attr("class", "node unselected")
        .style("left", function (d) { return d.x +25+ "px"; })
        .style("top", function (d) { return d.y +25+ "px"; })
        .style("width", function (d) { return Math.max(0, d.dx - 1) + "px"; })
        .style("height", function (d) { return Math.max(0, d.dy - 1) + "px"; })
        .style("background", function (d) { return d.children==null ? color(d.parent.data.name) : null; })
        .style("color", function(d) {return d.children ? color(d.data.name) : null; } )
        .style("font-size", function(d) {return d.children ? "11px" : null; } )
        .text(function (d) { return d.parent==null ? null : (d.dy < 10) ? null : (d.dx < 10) ? null : d.children!=null ? d.data.name : (d.data.name).length < (d.dx / 4) ? d.data.name + ' (' +  d.data.value +')' : (d.dy < 25) ? null : ((d.data.name).length < (d.dx / 2.5)) ? d.data.name + ' (' + d.data.value +')' : null })
        //.text(function (d) { return d.children ? null : (d.dy < 10) ? null : (d.dx < 10) ? null : (d.data.name).length < (d.dx / 4) ? d.data.name + ' (' +  d.value +')' : (d.dy < 25) ? null : ((d.data.name).length < (d.dx / 2.5)) ? d.data.name + ' (' + d.value +')' : null })
        .on("mousemove", function (d) {
            if (d3.select(this).attr("class")=="node unselected") {
            tool.style("left", d3.event.pageX + 1 + "px")
            tool.style("top", d3.event.pageY - 20 + "px")
            tool.style("display", "inline-block");
            tool.html(d.children ? null : "<span class='category'>"+d.parent.data.name+" : "+d.parent.value+"</span>" + "<br>"+ d.data.name + " : " + d.data.value);
            }
        }).on("mouseout", function (d) {
            tool.style("display", "none");
        })
        .on('click', filterByCategory);

        /*div
        .selectAll("titles")
        .data(root2.descendants().filter(function(d){ return d.depth==1}))
        .enter()
        .append("text")
          .attr("x", function(d){ return d.x})
          .attr("y", function(d){ return d.y+21})
          .text(function(d){ return d.data.name })
          .attr("font-size", "12px")
          .attr("fill",  function(d){ return color(d.data.name)} )*/

}

$(document).ready(function(){
    //Read data from csv and transform into nested json
    d3.csv("static/dataset/full_data.csv", function(data){
        treemap_from_csv(data);          
    });
});







