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

function showLayer(layerName) {
    // Remove all custom layers before adding new ones
    [gibsLST, gibsAirPollution, gibsFloodRisk, gibsUrbanExpansion, waqiLayer].forEach(layer => {
        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
        }
    });

    if (layerName === 'temp') {
        map.addLayer(gibsLST);
    } else if (layerName === 'pollution') {
        // Add BOTH NASA + WAQI layers together
        map.addLayer(gibsAirPollution);
        map.addLayer(waqiLayer);
    } else if (layerName === 'flood') {
        map.addLayer(gibsFloodRisk);
    } else if (layerName === 'urban') {
        map.addLayer(gibsUrbanExpansion);
    }
}

function hideAllLayers() {
    [gibsLST, gibsAirPollution, gibsFloodRisk, gibsUrbanExpansion, waqiLayer].forEach(layer => {
        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
        }
    });
}

map.on('moveend', () => {
  loadPOIsForMap();
});

map.on('zoomend', () => {
  loadPOIsForMap();
});

document.getElementById('metricSelect').addEventListener('change', () => {
  if (poiLayerGroup) {
    map.removeLayer(poiLayerGroup);
    poiLayerGroup = L.layerGroup();
  }
  fetchedTiles.clear();
  loadPOIsForMap();
});

function isCityView() {
    const bounds = map.getBounds();
    const latDiff = bounds.getNorth() - bounds.getSouth();
    const lngDiff = bounds.getEast() - bounds.getWest();

    // Example: only fetch if view is < ~0.3° lat/lng (roughly city size)
    return latDiff < 0.3 && lngDiff < 0.3;
}


