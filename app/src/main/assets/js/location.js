// let map;
let currentMarker={};


function initMap(divId){
    let currentLocation = JSON.parse(Android.getCurrentLocation());

    // 지도 초기화
    let map = L.map(divId).setView([currentLocation.lat, currentLocation.lon], 18);

    // OpenStreetMap 타일 레이어 추가
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    return map
}

function currentLocation(map,tab){
    if(currentMarker[tab] != null){
        map.removeLayer(currentMarker[tab]);
    }

    let currentLocation = JSON.parse(Android.getCurrentLocation());

    let popup = '현재 위치 ' + ' ( ' + now(3) + ' )'
        + '<br>위도 : ' + currentLocation.lat + ' / 경도 : ' + currentLocation.lon;

    currentMarker[tab] = L.marker([currentLocation.lat, currentLocation.lon], /*{draggable: true}*/ ).addTo(map).bindPopup(popup).openPopup();

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

function findFarthestPair(locations) {
    let maxDistance = 0;
    let farthestPair = [];
  
    for (let i = 0; i < locations.length - 1; i++) {
      for (let j = i + 1; j < locations.length; j++) {
        const distance = calculateDistance(
          locations[i].lat,
          locations[i].lon,
          locations[j].lat,
          locations[j].lon
        );
        if (distance > maxDistance) {
            console.log(distance)
          maxDistance = distance;
          farthestPair = [locations[i], locations[j]];
        }
      }
    }
    let result = {}
    result['farthestPair'] = farthestPair
    result['distance'] = maxDistance
    result['center'] = {"lat" : (farthestPair[0].lat*1 + farthestPair[1].lat*1)/2 ,"lon":(farthestPair[0].lon*1 + farthestPair[1].lon*1)/2}
    return result;
  }
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
  
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1000;
  
    const distance = R * c;
 
    return distance;
  }
  
  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  function getZoomLevel(distance){
    let unit = 250;
    for(let i =0;i < 19;i++){
        if(distance < Math.pow(2,i) * unit){
            return 18 - i;
        }
    }
    return 18;
  }