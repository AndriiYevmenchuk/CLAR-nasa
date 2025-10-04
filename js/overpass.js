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