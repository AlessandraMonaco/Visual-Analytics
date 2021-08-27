//Setting default parameters
var best_n_clusters = 4;
var best_n_components = 2;

//Function to reset the original visualization
function ResetViz() {

    // Reset parameters for K-Means and PCA
    document.getElementById("n_components").value = best_n_components;
    document.getElementById("n_clusters").value = best_n_clusters;

    // Reset original y_value filter
    localStorage.setItem("n_components", 2);
    localStorage.setItem("n_clusters", 4);
    location.reload()

    //Remove all filters
}