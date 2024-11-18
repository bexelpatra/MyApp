let map;
let locationInterval;
let initFg = "Y";
let bottom = "hidden";

function readFile(){
    initMap();

    let returnData = Android.readFile(now(1), 1);
    //console.log("##### tab returnData : ", returnData);
    let locInfo = JSON.parse(returnData);

    if(locInfo != ""){
        createLiTag(locInfo);
    }
    currentLocation();
    initFg = "N";
}

function initMap(locInfo){
    if(initFg == 'Y'){
        let currentLocation = JSON.parse(Android.getCurrentLocation());

        // 지도 초기화
        map = L.map('map').setView([currentLocation.lat, currentLocation.lon], 18);

        // OpenStreetMap 타일 레이어 추가
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

    }else{
        if(locInfo != null){
            if (navigator.geolocation) {
                let i = 1;
                locInfo.forEach(location => {

                    let popup = '방문 장소 ' + i + ' ( ' + location.time + ' )'
                        + '<br>위도 : ' + location.lat + ' / 경도 : ' + location.lon
                        + '<br>메모 : ' + location.memo;

                    L.marker([location.lat, location.lon]).addTo(map).bindPopup(popup).openPopup();
                    map.setView([location.lat, location.lon], 18).draggable(ture);
                });
            } else {
                alert('Your browser does not support Geolocation.');
            }
        }
    }
}

function currentLocation(){
    let currentLocation = JSON.parse(Android.getCurrentLocation());

    let popup = '현재 위치 ' + ' ( ' + now(3) + ' )'
        + '<br>위도 : ' + currentLocation.lat + ' / 경도 : ' + currentLocation.lon

    L.marker([currentLocation.lat, currentLocation.lon]).addTo(map).bindPopup(popup).openPopup();
    map.setView([currentLocation.lat, currentLocation.lon], 18);
}

async function save(lat, lon, autoFg){
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

    createLiTag(locInfo);

    if(!autoFg){
        reset();
    }
}

function createLiTag(locInfo){
    let visitList = document.getElementById("visitList");
    while (visitList.firstChild) {
        visitList.removeChild(list.firstChild);
    }

    for(let i=0; i<locInfo.length; i++){
        let visit = '방문 장소 ' + (i + 1) + ' ( ' + locInfo[i].time + ' )'
                    + '<br>위도 : ' + locInfo[i].lat + ' / 경도 : ' + locInfo[i].lon
                    + '<br>메모 : ' + locInfo[i].memo;

        let li = document.createElement('li');
        li.innerHTML = visit;
        li.onclick = function() {
            L.marker([locInfo[i].lat, locInfo[i].lon]).addTo(map)
                .bindPopup(visit)
                .openPopup();

            map.setView([locInfo[i].lat, locInfo[i].lon], map.getZoom()); // 지도의 중앙을 마커 위치로 설정
        };
        visitList.appendChild(li);

    }
    listToggle("show");
}

function listToggle(param){
    if(param != bottom){
        let listContainer = document.querySelector('.bottom-list-container');
        listContainer.classList.toggle(param);
        bottom = param;
    }
}

function reset() {
    document.getElementById('memo').value = "";
}

function now(param){
    /*
        param : return
        1 : 년월일
        2 : 시분초
        3 : 년월일  시분초
    */
    let today = new Date();

    let year = today.getFullYear();
    let month = ('0' + (today.getMonth() + 1)).slice(-2);
    let day = ('0' + today.getDate()).slice(-2);
    let hours = ('0' + today.getHours()).slice(-2);
    let minutes = ('0' + today.getMinutes()).slice(-2);
    let seconds = ('0' + today.getSeconds()).slice(-2);

    let dateString;
    if(param == 1) dateString = year + '-' + month  + '-' + day;
    if(param == 2) dateString = hours + ':' + minutes  + ':' + seconds;
    if(param == 3) dateString = year + '-' + month  + '-' + day + '  ' + hours + ':' + minutes  + ':' + seconds;

    return dateString;
}
