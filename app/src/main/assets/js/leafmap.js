// function initMap(locInfo){
//     if(initFg == 'Y'){
//         let currentLocation = JSON.parse(Android.getCurrentLocation());

//         // 지도 초기화
//         map = L.map('map').setView([currentLocation.lat, currentLocation.lon], 18);

//         // OpenStreetMap 타일 레이어 추가
//         L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//             attribution: '© OpenStreetMap contributors'
//         }).addTo(map);

//         initFg = "N";

//     }else{
//         if(locInfo != null){
//             if (navigator.geolocation) {
//                 let i = 1;
//                 locInfo.forEach(location => {

//                     let popup = '방문 장소 ' + i + ' ( ' + location.time + ' )'
//                         + '<br>위도 : ' + location.lat + ' / 경도 : ' + location.lon
//                         + '<br>메모 : ' + location.memo;

//                     L.marker([location.lat, location.lon]).addTo(map).bindPopup(popup).openPopup();
//                     map.setView([location.lat, location.lon], 18).draggable(ture);
//                 });
//             } else {
//                 alert('Your browser does not support Geolocation.');
//             }
//         }
//     }
// }

// function currentLocation(){
//     if(currentMarker != null){
//         map.removeLayer(currentMarker);
//     }

//     let currentLocation = JSON.parse(Android.getCurrentLocation());

//     let popup = '현재 위치 ' + ' ( ' + now(3) + ' )'
//         + '<br>위도 : ' + currentLocation.lat + ' / 경도 : ' + currentLocation.lon;

//     currentMarker = L.marker([currentLocation.lat, currentLocation.lon], /*{draggable: true}*/ ).addTo(map).bindPopup(popup).openPopup();

//     /*
//     marker.on('dragend', function(event) {
//         console.log(event.target._latlng);
//     });
//     */

//     map.setView([currentLocation.lat, currentLocation.lon], 18);
// }

// function initMap(divId){
//     let currentLocation = JSON.parse(Android.getCurrentLocation());

//     // 지도 초기화
//     let map = L.map(divId).setView([currentLocation.lat, currentLocation.lon], 18);

//     // OpenStreetMap 타일 레이어 추가
//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: '© OpenStreetMap contributors'
//     }).addTo(map);
    
//     return map
// }

// function currentLocation(map,tab){
//     if(currentMarker[tab] != null){
//         map.removeLayer(currentMarker[tab]);
//     }

//     let currentLocation = JSON.parse(Android.getCurrentLocation());

//     let popup = '현재 위치 ' + ' ( ' + now(3) + ' )'
//         + '<br>위도 : ' + currentLocation.lat + ' / 경도 : ' + currentLocation.lon;

//     currentMarker[tab] = L.marker([currentLocation.lat, currentLocation.lon], /*{draggable: true}*/ ).addTo(map).bindPopup(popup).openPopup();

//     /*
//     marker.on('dragend', function(event) {
//         console.log(event.target._latlng);
//     });
//     */

//     map.setView([currentLocation.lat, currentLocation.lon], 18);
// }