let tab1_map;
let tab1_initFg = true;
let tab1_interval;
let tab1_markers = [];

function tab1_markMap(){
    if(tab1_initFg){
        tab1_map = initMap('tab1_map',18);
        tab1_initFg = false;
    }

    let returnData = Android.readFile(now(1), 0);
    //console.log("##### tab returnData : ", returnData);
    let locInfo = JSON.parse(returnData);

    if(locInfo != ""){

        tab1_markers.forEach(marker => {
            marker.remove();
        });
        tab1_markers = []; // 배열 초기화

        let locLength = locInfo.length;

        let tab1_icon = L.divIcon({
            className: 'tab1-custom-icon',
            html: "<div class='tab1-marker-pin'></div><i class='tab1-material-icons'></i>",
            iconSize: [15, 15],
            iconAnchor: [15, 15]
        });

        let tab1_line = [];
        for(let i=0; i<locLength; i++){
            let markerStr = '자동 저장 ' + (i + 1) + ' ( ' + locInfo[i].time + ' )'
                        + '<br>위도 : ' + locInfo[i].lat + ' / 경도 : ' + locInfo[i].lon;

            let tab1_marker = L.marker([locInfo[i].lat, locInfo[i].lon], {icon: tab1_icon}).addTo(tab1_map)/*.bindPopup(markerStr)*/;

            tab1_line.push([locInfo[i].lat, locInfo[i].lon])

            tab1_markers.push(tab1_marker);
        }

        let polyline = L.polyline([tab1_line], {
            color: '#654e9fb2'
        }).arrowheads({
            frequency: 'allvertices',
            yawn: 60,
            size: '15px',
            color: '#654e9fb2',
            fill: true
        }).addTo(tab1_map);

        fitMapToFarthestMarkers(tab1_markers, tab1_map)
    }

    let chk = document.getElementById('tab1_toggle');
    if(Android.isServiceRunning()){
        chk.checked = true;
        tab1_handleToggle(chk);
    }else{
        chk.checked = false;
        tab1_handleToggle(chk);
    }
}

function updateLocation() {
    let currentLocation = JSON.parse(Android.getCurrentLocation());

    newInfo = {};
    newInfo.time = now(3);
    newInfo.lat = currentLocation.lat??"";
    newInfo.lon = currentLocation.lon??"";

    let saveData = {};
    saveData.data = newInfo;
    saveData.type = 0;
    //console.log("####### save Data : " , JSON.stringify(saveData));

    let saveReturnData = Android.save(JSON.stringify(saveData));
    //console.log("####### saveReturn Data : " , saveReturnData);
}

function tab1_handleToggle(checkbox) {
    if (checkbox.checked) {
        Android.startForegroundService();
    } else {
        Android.stopForegroundService();
    }
}