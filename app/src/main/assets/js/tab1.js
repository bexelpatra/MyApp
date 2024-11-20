let tab1_map;
let tab1_mapInit = Y;
function tab1_initMap(locInfo){
console.log("tab1");

    if(tab1_mapInit == 'Y'){
    let currentLocation = JSON.parse(Android.getCurrentLocation());

    // 지도 초기화
    tab1_map = L.map('tab1_map').setView([currentLocation.lat, currentLocation.lon], 18);

    // OpenStreetMap 타일 레이어 추가
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(tab1_map);

    tab1_mapInit = N;
    }

    if(locInfo != null){
        if (navigator.geolocation) {
            let i = 1;
            locInfo.forEach(location => {

                let popup = '방문 장소 ' + i + ' ( ' + location.time + ' )'
                    + '<br>위도 : ' + location.lat + ' / 경도 : ' + location.lon
                    + '<br>메모 : ' + location.memo;

                L.marker([location.lat, location.lon]).addTo(tab1_map).bindPopup(popup).openPopup();
                tab1_map.setView([location.lat, location.lon], 18).draggable(ture);
            });
        } else {
            alert('Your browser does not support Geolocation.');
        }
    }
}