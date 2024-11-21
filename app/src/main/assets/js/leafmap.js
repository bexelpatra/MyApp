// let CURRENT_MAP_ID;
// let CURRENT_MARKER;

// function initMap(id){
//     let currenctMap = document.getElementById(CURRENT_MAP_ID);
//     if(id != CURRENT_MAP_ID){
//         currenctMap?.remove()
//     }

//     let currentLocation = JSON.parse(Android.getCurrentLocation());

//     // 지도 초기화
//     map = L.map(id).setView([currentLocation.lat, currentLocation.lon], 18);

//     // OpenStreetMap 타일 레이어 추가
//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: '© OpenStreetMap contributors'
//     }).addTo(map);
//     CURRENT_MAP_ID = id;
// }

// function currentLocation(){
//     if(currentMarker != null){
//         map.removeLayer(currentMarker);
//     }

//     let currentLocation = JSON.parse(Android.getCurrentLocation());

//     let popup = '현재 위치 ' + ' ( ' + now(3) + ' )'
//         + '<br>위도 : ' + currentLocation.lat + ' / 경도 : ' + currentLocation.lon;

//     currentMarker = L.marker([currentLocation.lat, currentLocation.lon], /*{draggable: true}*/ ).addTo(map).bindPopup(popup).openPopup();
//     CURRENT_MARKER = currentMarker;

//     map.setView([currentLocation.lat, currentLocation.lon], 18);
// }