console.log("location.js");
let currentMarker={};

function initMap(divId, zoom){
    let currentLocation = JSON.parse(Android.getCurrentLocation());

    // 지도 초기화
    let map = L.map(divId).setView([currentLocation.lat, currentLocation.lon], zoom);

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
    let result = {}
    if(locations.length == 1 ){
        result['farthestPair'] = [locations[0],locations[0]]
        result['distance'] = maxDistance
        result['center'] = {"lat" : locations[0].lat ,"lon":locations[0].lon}
        return result;
    }
    for (let i = 0; i < locations.length - 1; i++) {
      for (let j = i + 1; j < locations.length; j++) {
        const distance = calculateDistance(
          locations[i].lat,
          locations[i].lon,
          locations[j].lat,
          locations[j].lon
        );
        if (distance >= maxDistance) {
            console.log(distance)
          maxDistance = distance;
          farthestPair = [locations[i], locations[j]];
        }
      }
    }

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

/*
let hbgLoc = {};
hbgLoc.top = {};
hbgLoc.middle = {};
hbgLoc.bottom = {};
hbgLoc.topC = {};
hbgLoc.middleC = {};
hbgLoc.bottomC = {};
hbgLoc.top.top = "-90%";
hbgLoc.top.right = "25%";
hbgLoc.middle.top = "-120%";
hbgLoc.middle.right = "25%";
hbgLoc.bottom.top = "-150%";
hbgLoc.bottom.right = "25%";
hbgLoc.topC.top = "45%";
hbgLoc.topC.right = "25%";
hbgLoc.middleC.top = "-120%";
hbgLoc.middleC.right = "25%";
hbgLoc.bottomC.top = "-150%";
hbgLoc.bottomC.right = "25%";
*/
function makeHamburger(divId, newDivId, newCheckboxId, labelFnc, hbgLoc){
    console.log("makeHamburger", hbgLoc)
    // div 선택
    let parentDiv = document.getElementById(divId);
    //parentDiv.setAttribute('style', 'position: fixed; bottom: 0px; width: 95%; height: 30px; border-radius: 15px 15px 0 0; transition: all 0.35s; z-index: 1000; font-family: "Stylish", serif; font-weight: 400; font-style: normal; font-size: 1.3rem; cursor:pointer;');

    // 새로운 div 생성
    let newDiv = document.createElement('div');
    newDiv.id = newDivId;
    newDiv.setAttribute('style', 'border-radius: 15px 15px 0 0; position:relative; display:block; width: 100%; height: 30px; margin: 0 auto; display: flex; align-items: center; justify-content: right;');

    // 새로운 checkbox 생성
    let newCheckbox = document.createElement('input')
    newCheckbox.type = 'checkbox';
    newCheckbox.id = newCheckboxId;
    newCheckbox.setAttribute('style','display: none;')

    // label 생성
    let newLabel = document.createElement('label');
    newLabel.setAttribute('for', newCheckboxId);
    newLabel.setAttribute('style', 'border-radius: 15px 15px 0 0; position:relative; display:block; height: 45px; margin: 0 auto; display: grid; left: 46%');
    newLabel.onclick = labelFnc;

    // 햄버거 모양 DIV 생성
    let topDiv = document.createElement('div');
    topDiv.setAttribute('style', 'top: '+hbgLoc.top.top+'; right: '+hbgLoc.top.right+'; background-color: #000; position: relative; width: 40px; height: 5px; margin-top: 7px; transition: all 0.2s ease-in-out; border-radius: 35px;');

    let middleDiv = document.createElement('div');
    middleDiv.setAttribute('style', 'top: '+hbgLoc.middle.top+'; right: '+hbgLoc.middle.right+'; background-color: #000; position: relative; width: 40px; height: 5px; margin-top: 7px; transition: all 0.2s ease-in-out; border-radius: 35px;');

    let bottomDiv = document.createElement('div');
    bottomDiv.setAttribute('style', 'top: '+hbgLoc.bottom.top+'; right: '+hbgLoc.bottom.right+'; background-color: #000; position: relative; width: 40px; height: 5px; margin-top: 7px; transition: all 0.2s ease-in-out; border-radius: 35px;');

    // 체크박스 상태 변경 감지
    newCheckbox.onchange = function() {
        if(this.checked) {
            topDiv.setAttribute('style', 'transform: rotate(45deg); top: '+hbgLoc.topC.top+'; right: '+hbgLoc.topC.right+'; background-color: #000; position: relative; width: 40px; height: 5px; margin-top: 7px; transition: all 0.2s ease-in-out; border-radius: 35px;');
            middleDiv.setAttribute('style', 'transform: scale(0); top: '+hbgLoc.middleC.top+'; right: '+hbgLoc.middleC.right+'; background-color: #000; position: relative; width: 40px; height: 5px; margin-top: 7px; transition: all 0.2s ease-in-out; border-radius: 35px;');
            bottomDiv.setAttribute('style', 'transform: rotate(-45deg); top: '+hbgLoc.bottomC.top+'; right: '+hbgLoc.bottomC.right+'; background-color: #000; position: relative; width: 40px; height: 5px; margin-top: 7px; transition: all 0.2s ease-in-out; border-radius: 35px;');
        } else {
            topDiv.setAttribute('style', 'top: '+hbgLoc.top.top+'; right: '+hbgLoc.top.right+'; background-color: #000; position: relative; width: 40px; height: 5px; margin-top: 7px; transition: all 0.2s ease-in-out; border-radius: 35px;');
            middleDiv.setAttribute('style', 'top: '+hbgLoc.middle.top+'; right: '+hbgLoc.middle.right+'; background-color: #000; position: relative; width: 40px; height: 5px; margin-top: 7px; transition: all 0.2s ease-in-out; border-radius: 35px;');
            bottomDiv.setAttribute('style', 'top: '+hbgLoc.bottom.top+'; right: '+hbgLoc.bottom.right+'; background-color: #000; position: relative; width: 40px; height: 5px; margin-top: 7px; transition: all 0.2s ease-in-out; border-radius: 35px;');
        }
    };

    parentDiv.appendChild(newDiv);
    parentDiv.appendChild(newCheckbox);
    parentDiv.appendChild(newLabel);
    newLabel.appendChild(topDiv);
    newLabel.appendChild(middleDiv);
    newLabel.appendChild(bottomDiv);
}