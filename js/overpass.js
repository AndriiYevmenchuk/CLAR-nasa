const overpassEndpoint = 'https://overpass-api.de/api/interpreter';
let poiLayerGroup = L.layerGroup();
let fetchedTiles = new Set();
let fetchTimeout = null;

function showSpinner(show) {
  const spinner = document.getElementById('loadingSpinner');
  const metric = document.getElementById('metricSelect')?.value;
  if (!spinner) return;
  spinner.classList.toggle('hidden', !(show && metric === 'infra'));
}

async function fetchPOIsForBounds(bounds) {
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

  const res = await fetch(overpassEndpoint, { method: 'POST', body: query });
  const osm = await res.json();

  osm.elements.forEach(f => {
    const lat = f.lat || f.center?.lat;
    const lon = f.lon || f.center?.lon;
    if (!lat || !lon) return;

    let iconUrl = 'icons/hospital.png';
    const t = f.tags.amenity || f.tags.highway || f.tags.railway || f.tags.aeroway;
    if (t === 'school') iconUrl = 'icons/school.png';
    else if (t === 'police') iconUrl = 'icons/police.png';
    else if (t === 'fire_station') iconUrl = 'icons/fire-department.png';
    else if (t === 'bus_station' || t === 'bus_stop') iconUrl = 'icons/bus.png';
    else if (t === 'station' || t === 'railway') iconUrl = 'icons/train.png';
    else if (t === 'aeroway' || t === 'airport') iconUrl = 'icons/airport.png';

    const icon = L.icon({ iconUrl, iconSize: [32, 32], iconAnchor: [16, 32] });
    const name = f.tags.name || t;
    const marker = L.marker([lat, lon], { icon })
      .bindPopup(`<strong>${name}</strong><br>Type: ${t}`);
    poiLayerGroup.addLayer(marker);
  });

  map.addLayer(poiLayerGroup);
}

async function loadPOIsForMap() {
    const metric = document.getElementById('metricSelect')?.value;
    if (metric !== 'infra') {
        map.removeLayer(poiLayerGroup);
        fetchedTiles.clear();
        return;
    }

    if (map.getZoom() < 13 || !isCityView()) {
        // zoomed out too far or viewing too large area
        map.removeLayer(poiLayerGroup);
        fetchedTiles.clear();
        showSpinner(false);
        return;
    }

    // Debounce fetch to prevent spamming Overpass
    if (fetchTimeout) clearTimeout(fetchTimeout);
    fetchTimeout = setTimeout(async () => {
        const bounds = map.getBounds();

        // Small grid key to prevent duplicate fetches
        const lat = Math.floor(bounds.getCenter().lat * 20) / 20;
        const lng = Math.floor(bounds.getCenter().lng * 20) / 20;
        const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
        if (fetchedTiles.has(key)) return;

        fetchedTiles.add(key);
        showSpinner(true);
        try {
            await fetchPOIsForBounds(bounds);
        } catch (e) {
            console.error('Overpass error', e);
        } finally {
            showSpinner(false);
        }
    }, 600);
}
