import 'normalize.css'
import './style.scss'
//var sass = require('node-sass'); // or require('sass');
//var result = sass.renderSync({file: "./style.scss"});
//console.log(result);


// This script is used to run webcode in node.js
// It creates a local server reading html file on port 9999

/*var http = require('http');
var fs = require('fs'); //file system module
http.createServer(function (req, res) {
  fs.readFile('index.html', function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    return res.end();
  });
}).listen(9999);*/