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
