let chartInstances = [];
function renderCharts(){
    chartInstances.forEach(ch=>ch.destroy());
    chartInstances=[];
    const labels=["2019","2020","2021","2022","2023","2024","2025"];
    const randomData=()=>labels.map(()=>Math.floor(Math.random()*100));
    chartInstances.push(new Chart(document.getElementById('chart1'), { type:'line', data:{ labels, datasets:[{label:"Urban Heat", data:randomData(), borderColor:"orange"}]} }));
    chartInstances.push(new Chart(document.getElementById('chart2'), { type:'line', data:{ labels, datasets:[{label:"Flood Risk", data:randomData(), borderColor:"blue"}]} }));
    chartInstances.push(new Chart(document.getElementById('chart3'), { type:'line', data:{ labels, datasets:[{label:"Crime Rate", data:randomData(), borderColor:"red"}]} }));
}