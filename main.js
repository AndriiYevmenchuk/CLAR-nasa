// Initialize Leaflet map
const center = [52.221537, 6.893661];
const map = L.map('map').setView(center, 5);
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

const WAQI_URL = `https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=${MWP_API_KEY}`;
const waqiLayer = L.tileLayer(WAQI_URL, {
  attribution: 'Air Quality Tiles &copy; <a href="http://waqi.info">waqi.info</a>',
  opacity: 0.7
});

const gibsLST = L.tileLayer(
        'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Aqua_L3_Land_Surface_Temp_8Day_Day/default/2023-08-15/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png',
        {
          attribution: 'NASA GIBS',
          tileSize: 256,
          minZoom: 2,
          maxZoom: 18,  // Allow zooming to city level
          maxNativeZoom: 7,  // But tiles only exist up to zoom 7 - Leaflet will upscale
          opacity: 0.7,
          errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
        }
);

const gibsAirPollution = L.tileLayer(
        'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/OMPS_Aerosol_Index/default/2024-09-01/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png',
        {
          attribution: 'NASA GIBS - Aerosol Index',
          tileSize: 256,
          minZoom: 2,
          maxZoom: 18,
          maxNativeZoom: 6,
          opacity: 0.7,
          errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
        }
);

const gibsFloodRisk = L.tileLayer(
        'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/NDH_Flood_Mortality_Risks_Distribution_2000/default/2024-09-01/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png',
        {
          attribution: 'NASA GIBS - Aerosol Index',
          tileSize: 256,
          minZoom: 2,
          maxZoom: 18,
          maxNativeZoom: 6,
          opacity: 0.7,
          errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
        }
);

const gibsUrbanExpansion = L.tileLayer(
        'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/Probabilities_of_Urban_Expansion_2000-2030/default/2024-09-01/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png',
        {
          attribution: 'NASA GIBS - Aerosol Index',
          tileSize: 256,
          minZoom: 2,
          maxZoom: 18,
          maxNativeZoom: 6,
          opacity: 0.7,
          errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
        }
);

const baseLayers = { "OpenStreetMap": osm };
const overlayLayers = {
  "Land Surface Temp": gibsLST,
  "Air Pollution (Aerosol)": gibsAirPollution,
  "Flood risk":gibsFloodRisk,
  "Urban expansion":gibsUrbanExpansion,
  "Air pollution 2":waqiLayer
};
L.control.layers(baseLayers, overlayLayers).addTo(map);

const allGibsLayers = [gibsLST, gibsAirPollution, gibsFloodRisk];

function showLayer(layerName) {
  allGibsLayers.forEach(layer => {
    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  });

  if (layerName === 'temp') {
    map.addLayer(gibsLST);
  } else if (layerName === 'pollution') {
    map.addLayer(gibsAirPollution);
  }
}

function hideLayer(layerName) {
  if (layerName === 'temp' && map.hasLayer(gibsLST)) {
    map.removeLayer(gibsLST);
  } else if (layerName === 'pollution' && map.hasLayer(gibsAirPollution)) {
    map.removeLayer(gibsAirPollution);
  }
}

// --- Charts ---
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

// Report toggle
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

// Property handling
let currentProperty=null;
function clearProperties(){
  document.getElementById("propertyList").innerHTML="";
  if(currentProperty){ map.removeLayer(currentProperty.marker); currentProperty=null; }
}
function addProperty(name,lat,lng){
  clearProperties();
  const marker = L.marker([lat,lng]).addTo(map).bindPopup(`<b>${name}</b>`);
  currentProperty={marker,lat,lng,name};
  const item=document.createElement("div");
  item.className="prop-item";
  item.innerHTML=`<div><div style="font-weight:600">${name}</div></div><div><span class="icon-btn">${reportVisible?'🗺️':'📊'}</span></div>`;
  document.getElementById("propertyList").appendChild(item);

  // Open marker or toggle report
  item.addEventListener("click",()=>{ map.setView([lat,lng],17); marker.openPopup(); });
  const icon=item.querySelector(".icon-btn");
  icon.addEventListener("click",(e)=>{
    e.stopPropagation();
    if(reportVisible){ showMap(); icon.textContent="📊"; }
    else{ showReport(name); icon.textContent="🗺️"; }
  });
}

// --- Overpass Critical Infrastructure ---
const overpassEndpoint = 'https://overpass-api.de/api/interpreter';
let poiLayerGroup = null;

async function loadPOIsForMap(){
  if(poiLayerGroup){ map.removeLayer(poiLayerGroup); poiLayerGroup=null; }
  if(map.getZoom() < 13) return; // only load if zoom >= 13

  const bounds = map.getBounds();
  const bboxStr = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
  const query = `
[out:json][timeout:25];
(
  node["amenity"="hospital"](${bboxStr});
  node["amenity"="school"](${bboxStr});
  node["amenity"="police"](${bboxStr});
  node["amenity"="fire_station"](${bboxStr});
  node["amenity"="bus_station"](${bboxStr});
  node["highway"="bus_stop"](${bboxStr});
  node["railway"="station"](${bboxStr});
  node["aeroway"="aerodrome"](${bboxStr});
  node["aeroway"="airport"](${bboxStr});
);
out center;`;

  try{
    const res = await fetch(overpassEndpoint,{ method:'POST', body: query });
    const osm = await res.json();
    const markers = L.markerClusterGroup();
    osm.elements.forEach(f=>{
      const latlng = [f.lat || f.center?.lat, f.lon || f.center?.lon];
      if(!latlng[0] || !latlng[1]) return;

      let iconUrl = 'icons/hospital.png';
      const t = f.tags.amenity || f.tags.highway || f.tags.railway || f.tags.aeroway;
      if(t==='school') iconUrl='icons/school.png';
      else if(t==='police') iconUrl='icons/police.png';
      else if(t==='fire_station') iconUrl='icons/fire-department.png';
      else if(t==='bus_station' || t==='bus_stop') iconUrl='icons/bus.png';
      else if(t==='station' || t==='railway') iconUrl='icons/train.png';
      else if(t==='aeroway' || t==='airport') iconUrl='icons/airport.png';

      const customIcon = L.icon({ iconUrl, iconSize:[32,32], iconAnchor:[16,32] });
      const marker = L.marker(latlng,{icon:customIcon});
      const name = f.tags.name || t;
      marker.bindPopup(`<strong>${name}</strong><br>Type: ${t}`);
      markers.addLayer(marker);
    });
    poiLayerGroup = markers;
    map.addLayer(poiLayerGroup);
  }catch(err){ console.error(err); }
}

// --- Metric selection ---
function handleMetricChange(val) {
  clearMetricLayer();
  hideAllLayers();
  if(val==='heat') showLayer('temp');
  else if(val==='flood') showMetric('flood');
  else if(val==='air') showLayer('pollution');
  else if(val==='infra') loadPOIsForMap(); // auto load POIs
  else if(val!=='none') showMetric(val);
}
document.querySelectorAll('input[name="metric"]').forEach(r=>{
  r.addEventListener('change', e => handleMetricChange(e.target.value));
});

// Reload POIs on zoom
map.on('zoomend', () => {
  const selected = document.querySelector('input[name="metric"]:checked').value;
  if(selected==='infra') loadPOIsForMap();
});

// --- Autocomplete search ---
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
let autocompleteList;
function createAutocompleteList(){ if(autocompleteList) autocompleteList.remove(); autocompleteList=document.createElement("div"); autocompleteList.className="autocomplete-list"; searchInput.parentElement.appendChild(autocompleteList); }
async function fetchSuggestions(query){ const url=`https://nominatim.openstreetmap.org/search?format=json&accept-language=en&limit=5&q=${encodeURIComponent(query)}`; const res=await fetch(url); return res.json(); }
function showSuggestions(suggestions){ createAutocompleteList(); if(!suggestions.length){ autocompleteList.innerHTML=`<div class="autocomplete-item" style="color:#888;">No results</div>`; return; } suggestions.forEach(item=>{ const div=document.createElement("div"); div.className="autocomplete-item"; div.textContent=item.display_name; div.addEventListener("click",()=>{ autocompleteList.innerHTML=""; searchInput.value=item.display_name; addProperty(item.display_name,parseFloat(item.lat),parseFloat(item.lon)); map.setView([parseFloat(item.lat),parseFloat(item.lon)],16); }); autocompleteList.appendChild(div); }); }
let typingTimer;
searchInput.addEventListener("input",()=>{
  const q=searchInput.value.trim();
  if(q.length<3){ if(autocompleteList) autocompleteList.innerHTML=""; return; }
  clearTimeout(typingTimer);
  typingTimer=setTimeout(async()=>{ const results=await fetchSuggestions(q); showSuggestions(results); },300);
});
document.addEventListener("click",(e)=>{ if(!searchInput.contains(e.target) && !autocompleteList?.contains(e.target)) if(autocompleteList) autocompleteList.innerHTML=""; });
searchBtn.addEventListener("click",async()=>{
  const q=searchInput.value.trim();
  if(!q) return alert("Please enter an address.");
  const url=`https://nominatim.openstreetmap.org/search?format=json&accept-language=en&limit=1&q=${encodeURIComponent(q)}`;
  const res=await fetch(url);
  const data=await res.json();
  if(!data.length) return alert("No results found.");
  const loc=data[0];
  addProperty(loc.display_name,parseFloat(loc.lat),parseFloat(loc.lon));
  map.setView([parseFloat(loc.lat),parseFloat(loc.lon)],16);
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
document.querySelectorAll('input[name="metric"]').forEach(r => {
  r.addEventListener('change', e => {
    const val = e.target.value;
    clearMetricLayer();
    hideAllLayers(); // Now this function exists!

    if (val === 'heat') {
      showLayer('temp');
    } else if (val === 'flood') {
      showMetric('flood');
    } else if (val === 'air') {
      showLayer('pollution');
    } else if (val === 'none') {
      // All layers already hidden
    } else {
      showMetric(val);
    }
  });
});

