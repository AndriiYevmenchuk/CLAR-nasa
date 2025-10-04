function handleMetricChange(val) {
    clearMetricLayer();
    hideAllLayers();

    if (val === 'heat') {
        showLayer('temp');
    } else if (val === 'flood') {
        showLayer('flood');
    } else if (val === 'air') {
        showLayer('pollution'); // adds BOTH NASA + WAQI
    } else if (val === 'infra') {
        loadPOIsForMap();
    } else if (val !== 'none') {
        showMetric(val); // for green, crime, etc.
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('input[name="metric"]').forEach(r => {
        r.addEventListener('change', e => handleMetricChange(e.target.value));
    });
});

// Reload POIs on zoom
map.on('zoomend', () => {
    const selected = document.querySelector('input[name="metric"]:checked').value;
    if(selected==='infra') loadPOIsForMap();
});


// Metric layers
let currentLayerGroup=null;
function clearMetricLayer(){
    if(currentLayerGroup){ map.removeLayer(currentLayerGroup); currentLayerGroup=null; }
    document.getElementById('legend').style.display='none';
}
function showMetric(metric){
    clearMetricLayer();
    if(metric==="none")return;
    const markers=L.markerClusterGroup();
    const center=map.getCenter();
    const points=generateRandomPoints(center.lat,center.lng,100,6);
    points.forEach((pt,idx)=>{
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
    document.getElementById('legend').style.display='block';
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
