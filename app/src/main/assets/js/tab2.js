let tab2_bottom = "show";
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
    //console.log("##### tab locInfo : ", locInfo);
    document.querySelector('.tab2-bottom-list-container').classList.toggle("show");
    document.querySelector('.tab2-bottom-list-container').style.display = "none";
    document.getElementById('tab2_vBt').style.display = "none";
    if(locInfo != ""){
        tab2_createLiTag(locInfo);
        document.getElementById('tab2_vBt').style.display = "block";
    }
    currentLocation(tab2_map,2);
    document.getElementById('tab2_cBt').onclick();
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
    newInfo.imgPath = "";

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
    document.getElementById('tab2_vBt').style.display = "block";
    tab2_reset();
}

let tab2_markers = [];
let tab2_markersAll = [];
function tab2_createLiTag(locInfo){
    let visitList = document.getElementById("tab2_visitList");

    while (visitList.firstChild) {
        visitList.removeChild(visitList.firstChild);
    }

    tab2_markersAll.forEach(marker => {
        marker.remove();
    });
    tab2_markersAll = [];

    locLength = locInfo.length;
    for(let i=0; i<locLength; i++){
        let content = '<div>' +
                          '<a style="font-weight: bold;">방문 장소 ' + (i + 1) + ' ( ' + locInfo[i].time + ' )</a>' +
                          //+ '<br>위도 : ' + locInfo[i].lat + ' / 경도 : ' + locInfo[i].lon
                          '<br>메모 : ' + locInfo[i].memo.replaceAll('\n', '<br>') +
                      '</div>';

        let visit = document.createElement('div');
        visit.innerHTML = content;

        let popupBtnDiv = document.createElement('div');
        let popupBtn = document.createElement('button');
        popupBtn.className = 'tab2-mod-button';
        popupBtn.id = 'tab2_mBt';
        popupBtn.innerText = '수정';
        popupBtn.onclick = function() {
            tab4_popupOpen(locInfo[i], i);
        }
        popupBtnDiv.appendChild(popupBtn);
        visit.appendChild(popupBtnDiv);

        let tab2_markerAll = L.marker([locInfo[i].lat, locInfo[i].lon]).addTo(tab2_map).bindPopup(visit).openPopup();
        tab2_markersAll.push(tab2_markerAll);

        let li = document.createElement('li');
        li.className = 'tab2-li';
        li.id = 'tab2_li' + i ;
        li.innerHTML = content;
        li.onclick = function() {
            let tab2_marker = L.marker([locInfo[i].lat, locInfo[i].lon]).addTo(tab2_map).bindPopup(visit).openPopup();
            tab2_markers.push(tab2_marker);
            tab2_removeMarker(i, tab2_marker);

            tab2_map.setView([locInfo[i].lat, locInfo[i].lon], '18');
        };
        visitList.appendChild(li);

    }
    tab2_listToggle("show");
    visitList.getElementsByTagName('li')[locLength-1].onclick();
}

function tab2_listToggle(param){
    document.querySelector('.tab2-bottom-list-container').style.display = "block";
    if(param != tab2_bottom){
        document.querySelector('.tab2-bottom-list-container').classList.toggle(param);
        tab2_bottom = param;
    }
}

function tab2_reset() {
    document.getElementById('tab2_memo').value = "";
}

let listOpenFg = false;
function tab2_listOpen(){
    if(listOpenFg){
        document.querySelector('.tab2-bottom-list-container').classList.toggle('full-height');
        setTimeout(function(){
                document.querySelector('.tab2-bottom-list').classList.toggle('hidden');
            },250)
        listOpenFg = false;
    }else{
        document.querySelector('.tab2-bottom-list-container').classList.toggle('full-height');
        document.querySelector('.tab2-bottom-list').classList.toggle('hidden');
        listOpenFg = true;
    }

}

function tab2_currentLocation(){
    currentLocation(tab2_map,2);
}

let tab2_markIdx = [];
function tab2_removeMarker(index, marker){
    if(tab2_markIdx[index] != undefined){
        tab2_markIdx[index].remove();
    }
    tab2_markIdx[index] = marker;
}

function tab2_view(){
    let markers = tab2_markersAll
    // 가장 먼 두 마커 찾기
    let bounds = L.latLngBounds(markers[0].getLatLng(), markers[0].getLatLng());

    // 모든 마커를 포함하도록 경계 확장
    markers.forEach(marker => {
        bounds.extend(marker.getLatLng());
    });

    // 계산된 줌 레벨을 Leaflet의 최대 지원 줌 레벨(18)로 제한
    let maxZoom = Math.min(18, tab2_map.getBoundsZoom(bounds));

    // 지도 뷰 조정
    tab2_map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: maxZoom
    });
}

let popupInfo = "";
let selLiNum;
function tab4_popupOpen(locInfo, num){
    let pop = document.getElementById('tab4_popupContainer');
    pop.style.display = 'block';

    let text = document.getElementById('tab2_popupMemo');
    text.innerHTML = locInfo.memo;
    text.focus();

    popupInfo = "";
    popupInfo = locInfo;
    selLiNum = num;
}

function tab2_popupSave(){
    let text = document.getElementById('tab2_popupMemo').value;
    popupInfo.memo = text;

    let saveData = {};
    saveData.data = popupInfo;
    saveData.type = 1;
    let saveReturnData = Android.updateFile(JSON.stringify(saveData));
    tab2_popupClose();
    Android.showToast("저장되었습니다.");
    window.location.href="./newTab2.html";
}

function tab2_popupClose(){
    document.getElementById('tab4_popupContainer').style.display = 'none';
}