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


$(document).ready(function(){
//set the dimensions and margins of the graph
var margin = {top: 2, right: 10, bottom: 2, left: 10},
  width = 455 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#treemap")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

//Read data from csv and transform into nested json
d3.csv("../dataset/full_data.csv", function(csv_data){
    
    // Nest data by categories and subcategories
    var nested_data = d3.nest()
      .key(function(d) { return d.prod_cat; })
      .key(function(d) { return d.prod_subcat; })
      .rollup(function(d) { 
        return d3.sum(d, function(d) {return d.Qty; });}) //sum the quantities for each subcategory
      .entries(csv_data);
                 
      console.debug(nested_data);
      alert(JSON.stringify(nested_data));                 

    // Creat the root node for the treemap
    var root = {};
			
    // Add the data to the tree, creating a pseudoroot
    root.key = "Products";
    root.values = nested_data;
    root = change_json_format(root,"Paid_fare"); //Change json format
    console.log(root);
    alert(JSON.stringify(root)); 

    var root2 = d3.hierarchy(root).sum(function(d){ return d.value}) // Here the size of each leave is given in the 'value' field in input data

// Then d3.treemap computes the position of each element of the hierarchy
  d3.treemap()
  .size([width, height])
  .paddingTop(23)
  .paddingRight(7)
  .paddingInner(3)      // Padding between each rectangle
  .paddingOuter(8)
  //.padding(20)
  (root2)

// prepare a color scale
var color = d3.scaleOrdinal()
  .domain(["Clothing", "Footwear", "Books", "Electronics", "Home and kitchen", "Bags"])
  .range(["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02"])


// And a opacity scale
var opacity = d3.scaleLinear()
.domain([10, 30])
.range([.5,1])

// use this information to add rectangles:
svg
.selectAll("rect")
.data(root2.leaves())
.enter()
.append("rect")
  .attr('x', function (d) { return d.x0; })
  .attr('y', function (d) { return d.y0; })
  .attr('width', function (d) { return d.x1 - d.x0; })
  .attr('height', function (d) { return d.y1 - d.y0; })
  .style("stroke", "black")
  .style("fill", function(d){ return color(d.parent.data.name)} )
  .style("opacity", function(d){ return opacity(d.data.value)})

// and to add the text labels
svg
.selectAll("text")
.data(root2.leaves())
.enter()
.append("text")
  .attr("x", function(d){ return d.x0+5})    // +10 to adjust position (more right)
  .attr("y", function(d){ return d.y0+10})    // +20 to adjust position (lower)
  .text(function(d) {return d.data.name.substring(0,12);})
  .text(function(d) {return d.data.name;})
  .attr("font-size", "8px")
  .attr("fill", "white")

// and to add the text labels
svg
.selectAll("vals")
.data(root2.leaves())
.enter()
.append("text")
  .attr("x", function(d){ return d.x0+5})    // +10 to adjust position (more right)
  .attr("y", function(d){ return d.y0+20})    // +20 to adjust position (lower)
  .text(function(d){ return "("+d.data.value+")" })
  .attr("font-size", "8px")
  .attr("fill", "white")

// Add title for the 3 groups
svg
.selectAll("titles")
.data(root2.descendants().filter(function(d){return d.depth==1}))
.enter()
.append("text")
  .attr("x", function(d){ return d.x0+7})
  .attr("y", function(d){ return d.y0+6})
  .text(function(d){ return d.data.name })
  .attr("font-size", "12px")
  .attr("fill",  function(d){ return color(d.data.name)} )



})



});







