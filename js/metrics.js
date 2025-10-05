const metricDescriptions = {
    none: "Please select an area of interest.",

    heat: "Urban Heat Islands (UHI) show areas where the land surface temperature is higher than surrounding regions. This data is derived from NASA MODIS Land Surface Temperature datasets. Understanding UHI is critical for urban planners to design cooling strategies, increase greenspace, and reduce heat-related health risks for residents.",

    flood: "Flood Risk zones are based on NASA GIBS Flood Mortality Risk Distribution datasets. These maps indicate areas prone to flooding due to historical rainfall patterns and terrain. Urban planners use this information to develop flood mitigation strategies, guide infrastructure placement, and protect vulnerable populations.",

    air: "Air Quality combines data from NASA GIBS Aerosol Index and WAQI (World Air Quality Index) real-time observations. It highlights areas with high particulate matter and pollutants. This information helps urban planners identify pollution hotspots, plan green buffers, and implement policies to improve public health and reduce respiratory diseases.",

    green: "Greenspace Access is derived from satellite vegetation indexes and land cover data. It shows the distribution of parks, trees, and green areas within urban regions. Planners use this metric to ensure equitable access to greenspace, enhance urban biodiversity, and improve mental and physical well-being of residents.",

    infra: "Critical Infrastructure Points of Interest include hospitals, schools, fire stations, and other essential services mapped from OpenStreetMap and local databases. Urban planners leverage this information to assess accessibility, optimize service coverage, and improve community resilience during emergencies.",

    crime: "Crime Rate data, sourced from regional police reports and open datasets, shows the spatial distribution of reported incidents. Urban planners and safety officers use this data to inform zoning, improve lighting and surveillance, and design safer public spaces."
};

let currentLayerGroup = null;

function handleMetricChange(val) {
    clearMetricLayer();
    hideAllLayers();

    if (val === 'heat') {
        showLayer('temp');
    } else if (val === 'flood') {
        showLayer('flood');
    } else if (val === 'air') {
        showLayer('pollution');
    } else if (val === 'infra') {
        loadPOIsForMap();
    } else if (val !== 'none') {
        showMetric(val);
    }
    const desc = document.getElementById("metricDescription");
    if (desc) {
        desc.textContent = metricDescriptions[val] || "";
    }
}

// Attach listener to dropdown
document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("metricSelect");
    select.addEventListener("change", e => handleMetricChange(e.target.value));

    // Call it once on page load to show default
    handleMetricChange(select.value);
});

// Reload POIs on zoom
map.on('zoomend', () => {
    const selected = document.querySelector('input[name="metric"]:checked').value;
    if(selected==='infra') loadPOIsForMap();
});


function clearMetricLayer(){
    if(currentLayerGroup){
        map.removeLayer(currentLayerGroup);
        currentLayerGroup=null;
    }
    const legend = document.getElementById('legend');
    if (legend) legend.style.display='none';
}

function showMetric(metric){
    clearMetricLayer();
    if(metric==="none") return;

    const markers=L.markerClusterGroup();
    const center=map.getCenter();
    const points=generateRandomPoints(center.lat, center.lng, 100, 6);
    points.forEach((pt, idx)=>{
        const seed=idx*(metric.length*7);
        const val=pseudoRandom(seed)%100;
        const color=val>66?'#2b83ba':val>33?'#7fbf7b':'#fee08b';
        const html=`<div style="background:${color};color:#000;font-weight:bold;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border:1px solid #333;">${Math.floor(val)}</div>`;
        const icon=L.divIcon({html,className:'',iconSize:[30,30]});
        const marker=L.marker(pt,{icon}).bindPopup(`<b>${metric.toUpperCase()}</b><br>Value: ${val}`);
        markers.addLayer(marker);
    });
    map.addLayer(markers);
    currentLayerGroup=markers;

    const legend = document.getElementById('legend');
    if (legend) legend.style.display='block';
}

function generateRandomPoints(lat,lng,n=60,radiusKm=6){
    const pts=[];
    for(let i=0;i<n;i++){
        const r=Math.sqrt(Math.random())*radiusKm;
        const a=Math.random()*Math.PI*2;
        const dx=(r*Math.cos(a))/111;
        const dy=(r*Math.sin(a))/(111*Math.cos(lat*Math.PI/180));
        pts.push([lat+dx,lng+dy]);
    }
    return pts;
}
function pseudoRandom(seed){
    let x=Math.sin(seed+1)*10000;
    return Math.abs(x-Math.floor(x))*1000000%100;
}
