let initFg = "Y";
let map;
let currentMarker;

function initMap(locInfo){
    if(initFg == 'Y'){
        let currentLocation = JSON.parse(Android.getCurrentLocation());

        // 지도 초기화
        map = L.map('map').setView([currentLocation.lat, currentLocation.lon], 18);

        // OpenStreetMap 타일 레이어 추가
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        initFg = "N";

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
    if(currentMarker != null){
        map.removeLayer(currentMarker);
    }

    let currentLocation = JSON.parse(Android.getCurrentLocation());

    let popup = '현재 위치 ' + ' ( ' + now(3) + ' )'
        + '<br>위도 : ' + currentLocation.lat + ' / 경도 : ' + currentLocation.lon;

    currentMarker = L.marker([currentLocation.lat, currentLocation.lon], /*{draggable: true}*/ ).addTo(map).bindPopup(popup).openPopup();

    /*
    marker.on('dragend', function(event) {
        console.log(event.target._latlng);
    });
    */

    map.setView([currentLocation.lat, currentLocation.lon], 18);
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
