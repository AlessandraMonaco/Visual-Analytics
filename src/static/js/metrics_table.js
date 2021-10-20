$(document).ready(function(){

    d3.text("static/dataset/clustering_metrics_data.csv", function(data) {
        var parsedCSV = d3.csvParse(data);

        var container = d3.select("#metrics-table")
            .append("table")

        var row = container.append("tr")
        row.append("td")
                .style("width", "20px")
                .attr("class", "header")
                .text("SILHOUETTE SCORE");
        row.append("td").text(parseFloat(parsedCSV[0].silhouette).toFixed(2));

        row = container.append("tr")
        row.append("td")
            .style("width", "20px")
            .attr("class", "header")
            .text("INERTIA");
        row.append("td").text(parseFloat(parsedCSV[0].inertia).toFixed(2));  
        
        row = container.append("tr")
        row.append("td")
            .style("width", "20px")
            .attr("class", "header")
            .text("PCA TOT VARIANCE");
        row.append("td").text(parsedCSV[0].pca_variance+" %")



            /*.selectAll("tr")
                .data(parsedCSV).enter()
                .append("tr")

            .selectAll("td")
                .data(parsedCSV[0].silhouette).enter()
                .append("td")
                .text(parsedCSV[0].silhouette);*/
    });
});