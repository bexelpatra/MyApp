console.log("tab2.js");
let tab2_bottom = "hidden";
let tab2_map;
let tab2_initFg = true;


function tab2_readFile(){
    if(tab2_initFg){
        tab2_map = initMap('tab2_map',18);
        tab2_initFg = false
    }

    let returnData = Android.readFile(now(1), 1);
    //console.log("##### tab returnData : ", returnData);
    let locInfo = JSON.parse(returnData);

    if(locInfo != ""){
        tab2_createLiTag(locInfo);
    }
    currentLocation(tab2_map,2);
}


async function tab2_save(lat, lon, autoFg){
    let memo;

    if(!autoFg){
        memo = document.getElementById('tab2_memo').value
    }

    newInfo = {};
    newInfo.time = now(3);
    newInfo.lat = lat??"";
    newInfo.lon = lon??"";
    newInfo.memo = memo;

    let saveData = {};
    saveData.data = newInfo;
    saveData.type = 1;
    //console.log("####### save Data : " , JSON.stringify(saveData));

    let saveReturnData = Android.save(JSON.stringify(saveData));
    //console.log("####### saveReturn Data : " , saveReturnData);

    let returnData = Android.readFile(now(1), 1);
    //console.log("####### Return Data : " , returnData);

    let locInfo = JSON.parse(returnData);
    //console.log("####### locInfo Data : " , locInfo);

    tab2_createLiTag(locInfo);

    if(!autoFg){
        tab2_reset();
    }
}

let tab2_markers = [];
function tab2_createLiTag(locInfo){
    let visitList = document.getElementById("tab2_visitList");
    while (visitList.firstChild) {
        visitList.removeChild(visitList.firstChild);
    }
    locLength = locInfo.length;
    for(let i=0; i<locLength; i++){
        let visit = '방문 장소 ' + (i + 1) + ' ( ' + locInfo[i].time + ' )'
                    //+ '<br>위도 : ' + locInfo[i].lat + ' / 경도 : ' + locInfo[i].lon
                    + '<br>메모 : ' + locInfo[i].memo.replaceAll('\n', '<br>');

        let li = document.createElement('li');
        li.innerHTML = visit;
        li.onclick = function() {
            let tab2_marker = L.marker([locInfo[i].lat, locInfo[i].lon]).addTo(tab2_map)
                .bindPopup(visit)
                .openPopup();


            tab2_markers.push(tab2_marker);
            tab2_ramoveMarker(i, tab2_marker);

            tab2_map.setView([locInfo[i].lat, locInfo[i].lon], tab2_map.getZoom());
        };
        visitList.appendChild(li);
    }
    tab2_listToggle("show");
    visitList.getElementsByTagName('li')[locLength-1].onclick();
}

function tab2_listToggle(param){
    if(param != tab2_bottom){
        document.querySelector('.tab2-bottom-list-container').classList.toggle(param);
        tab2_bottom = param;
    }
}

function tab2_reset() {
    document.getElementById('tab2_memo').value = "";
}

function tab2_listOpen(){
    document.getElementById('tab2_visitList').style.display = 'block';
    document.getElementById('tab2_bottomListContainer').classList.toggle('full-height');
}

function tab2_currentLocation(){
    currentLocation(tab2_map,2);
}

let tab2_markIdx = [];
function tab2_ramoveMarker(index, marker){
    if(tab2_markIdx[index] != undefined){
        tab2_markIdx[index].remove();
    }
    tab2_markIdx[index] = marker;
}