let reportVisible = false;

function showReport(name){
    document.getElementById("map").style.display="none";
    document.getElementById("report").style.display="block";
    document.getElementById("reportTitle").innerText = name + " — Report";
    renderCharts();
    reportVisible = true;
}
function showMap(){
    document.getElementById("map").style.display="block";
    document.getElementById("report").style.display="none";
    reportVisible = false;
}