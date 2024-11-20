let bottom = "hidden";

function tab2_readFile(){
    initMap();

    let returnData = Android.readFile(now(1), 1);
    //console.log("##### tab returnData : ", returnData);
    let locInfo = JSON.parse(returnData);

    if(locInfo != ""){
        tab2_createLiTag(locInfo);
    }
    currentLocation();
}


async function tab2_save(lat, lon, autoFg){
    let memo;

    if(!autoFg){
        memo = document.getElementById('memo').value
    }

    newInfo = {};
    newInfo.time = now(3);
    newInfo.lat = lat??"";
    newInfo.lon = lon??"";
    newInfo.memo = memo;

    let saveData = {};
    saveData.data = newInfo;
    saveData.type = autoFg == true ? 0 : 1;
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

function tab2_createLiTag(locInfo){
    let visitList = document.getElementById("visitList");
    while (visitList.firstChild) {
        visitList.removeChild(visitList.firstChild);
    }
    locLength = locInfo.length;
    for(let i=0; i<locLength; i++){
        let visit = '방문 장소 ' + (i + 1) + ' ( ' + locInfo[i].time + ' )'
                    //+ '<br>위도 : ' + locInfo[i].lat + ' / 경도 : ' + locInfo[i].lon
                    + '<br>메모 : ' + locInfo[i].memo.replaceAll('\n', '<br>');

        let markerStr = '방문 장소 ' + (i + 1) + ' ( ' + locInfo[i].time + ' )'
                    + '<br>위도 : ' + locInfo[i].lat + ' / 경도 : ' + locInfo[i].lon
                    + '<br>메모 : ' + locInfo[i].memo.replaceAll('\n', '<br>');

        let li = document.createElement('li');
        li.innerHTML = visit;
        li.onclick = function() {
            L.marker([locInfo[i].lat, locInfo[i].lon]).addTo(map)
                .bindPopup(markerStr)
                .openPopup();

            map.setView([locInfo[i].lat, locInfo[i].lon], map.getZoom()); // 지도의 중앙을 마커 위치로 설정
        };
        visitList.appendChild(li);
    }
    listToggle("show");
    visitList.getElementsByTagName('li')[locLength-1].onclick();
}

function listToggle(param){
    if(param != bottom){
        let listContainer = document.querySelector('.tab2-bottom-list-container');
        listContainer.classList.toggle(param);
        bottom = param;
    }
}

function tab2_reset() {
    document.getElementById('memo').value = "";
}

function tab2_listOpen(){
    document.getElementById('visitList').style.display = 'block';
    document.getElementById('bottomListContainer').classList.toggle('full-height');
}