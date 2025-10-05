const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
let autocompleteList;
let typingTimer;
let currentProperty=null;

function createAutocompleteList(){
    if(autocompleteList) autocompleteList.remove(); autocompleteList=document.createElement("div");
    autocompleteList.className="autocomplete-list"; searchInput.parentElement.appendChild(autocompleteList);
}

async function fetchSuggestions(query){
    const url=`https://nominatim.openstreetmap.org/search?format=json&accept-language=en&limit=5&q=${encodeURIComponent(query)}`; const res=await fetch(url); return res.json();
}

function showSuggestions(suggestions){
    createAutocompleteList();
    if(!suggestions.length){
        autocompleteList.innerHTML=`<div class="autocomplete-item" style="color:#888;">No results</div>`; return;
    } suggestions.forEach(item=>{
        const div=document.createElement("div"); div.className="autocomplete-item";
        div.textContent=item.display_name; div.addEventListener("click",()=>{ autocompleteList.innerHTML=""; searchInput.value=item.display_name;
            addProperty(item.display_name,parseFloat(item.lat),parseFloat(item.lon));
            map.setView([parseFloat(item.lat),parseFloat(item.lon)],16); });
        autocompleteList.appendChild(div);
    });
}

function clearProperties(){
    document.getElementById("propertyList").innerHTML="";
    if(currentProperty){ map.removeLayer(currentProperty.marker); currentProperty=null; }
}
async function addProperty(name,lat,lng){
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

    loadWeatherData(lat, lng);
}

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