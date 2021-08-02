//import 'normalize.css'
//import './style.scss'
//var sass = require('node-sass'); // or require('sass');
//var result = sass.renderSync({file: "./style.scss"});
//console.log(result);
//import * as d3 from "d3";
var d3 = require("d3");

const csv = require('d3-fetch').csv;



csv("C:/Users/user/Documents/GitHub/Visual-Analytics/dataset/full_data.csv", function(csv_data){
                    
  var nested_data = d3.nest()
      .key(function(d) { return d.prod_cat; })
      .key(function(d) { return d.prod_subcat; })
      .entries(csv_data);
      
  console.debug(nested_data);
  alert(JSON.stringify(nested_data));

});