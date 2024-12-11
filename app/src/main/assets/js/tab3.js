let tab3_map;
let tab3_initFg = true;
let tab3_bottom = 'hidden'
let tab3_markers=[]
let tab3_polyline;

function tab3_initMap(){
    if(tab3_initFg){
        // tab3_map = initMap('tab3_map')
        let currentLocation = JSON.parse(Android.getCurrentLocation());
        tab3_map = L.map('tab3_map').setView([currentLocation.lat, currentLocation.lon], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(tab3_map);

        initDialog('dialog-main')
        tab3_initFg = false
    }

}
function appendHistory(items) {

    tab3_resetLi()

    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    items.forEach((item, index) => {
        const tr = document.createElement('tr');
        let fileName = item.substr(0,12)
        tr.innerHTML = `
            <td>기록</td>
            <td id="fileNameCell" onclick="tab3_mapOpen(this)" ymdt='${fileName}' value='${item}'>${item.substr(0,item.lastIndexOf(".txt"))}</td>
            <td>
                <button class="tab3-button" onclick="tab3_titleUpdate(this)">수정</button>
            </td>
        `;
        tr.setAttribute("value",item)
        tbody.appendChild(tr);
    });
}

function tab3_titleUpdate(button){
    const fileNameCell = button.closest('tr').querySelector('#fileNameCell');

    if (fileNameCell.querySelector('input')) {
        saveEdit(fileNameCell);
    } else {
        startEdit(fileNameCell);
    }
}
function startEdit(cell) {
    console.log(cell)
    // const originalText = cell.textContent.trim();
    let trimed = cell.textContent.trim()
    const originalText = trimed.substr(12,trimed.length);

    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalText;
    input.classList.add('edit-input');

    // Replace cell content with input
    cell.innerHTML = '';
    cell.innerText += cell.getAttribute('ymdt')
    cell.appendChild(input);
    
    // Focus the input
    input.focus();
    
    // Change button text
    const button = cell.closest('tr').querySelector('button');
    button.textContent = '저장';
}

function saveEdit(cell) {
    console.log('save',cell)
    const input = cell.querySelector('input');
    
    const newText = input.value.trim();
    cell.textContent = cell.getAttribute('ymdt');
    cell.textContent += newText;
    
    const button = cell.closest('tr').querySelector('button');
    button.textContent = '수정';

    let data ={}
    data.ymdt = cell.getAttribute('ymdt')
    data.newFileName = cell.textContent.substr(12)
    let param ={
        'data' : data
    }
    Android.updateTitle(JSON.stringify(param))
}

// get file names
function tab3_search() {
    let temp = document.getElementById("searchTerm").value
    let date =''
    for(i =0;i<temp.length;i++){
        date+=temp[i]
        if(i ==3 || i==5){
            date+='-'
        }
    }
    let param = {
        searchTerm:date
    }
    let list = Android.reqSearch(JSON.stringify(param))
    return JSON.parse(list)
}


// only number, length < 9
function handleInput(el,value) {
    let cleanValue = value.replace(/[^0-9]/g, '');
    if(cleanValue.length>8){
        cleanValue = cleanValue.substr(0,8)
    }
    if (value !== cleanValue) {
        el.value = cleanValue
    }
    
    list = tab3_search()
    // list=['2024-11-18-1-.txt','2024-11-19-1-.txt']
    appendHistory(list)
}
// 읽기 fileName :"2024-12-11-1"
function tab3_readFile(fileName){

    let ymdt = fileName?.split('-')
    let time = ymdt.splice(0,3).join('-')
    let fileType = ymdt.splice(0,1).join('')?.substr(0,1)
    let returnData = Android.readFile(time,fileType);
//    console.log("##### tab returnData : ", returnData);
    let locationInfo = JSON.parse(returnData);
    
    let distanceInfo ;
    if(locationInfo != ""){
//        distanceInfo = findFarthestPair(locationInfo);
        if(fileType==0){
            tab3_readType0Map(locationInfo);
        }else if(fileType==1){
            tab3_readType1Map(locationInfo);
        }
        setTimeout(()=>{
            fitMapToFarthestMarkers(tab3_markers,tab3_map)
        },10)
    }else{
        tab3_mapListClose()
    }
}

function tab3_memoFucus(locInfo){
    let tab3_memo = document.getElementById('tab3_memo');
    let tab3_searchTerm = document.getElementById('searchTerm');
    tab3_memo.style.display='block'
    tab3_searchTerm.style.display='none'
    Object.keys(locInfo).forEach((key)=>{
        tab3_memo.dataset[key] = locInfo[key]
    })


    tab3_memo.value = locInfo.memo
    tab3_memo.focus()
}
// 메모 저장
function tab3_memoBlur(){
    let tab3_memo = document.getElementById('tab3_memo');
    let tab3_searchTerm = document.getElementById('searchTerm');
    tab3_memo.style.display='none'
    tab3_searchTerm.style.display='block'

    tab3_memo.dataset.memo = tab3_memo.value;

    let param = {}
    param.data=tab3_memo.dataset

    Android.updateFile(JSON.stringify(param))
    Android.showToast("저장되었습니다.")

    tab3_readFile(getFileName(tab3_memo.dataset))

    Object.keys(tab3_memo.dataset).forEach((key)=>{
        tab3_memo.removeAttribute(`data-${key}`)
    })


}
// 삭제
function tab3_deleteButtonClick(locationInfo,i){
    document.getElementById('acceptButton').run = function(){
//        console.log(locationInfo[i],i)
        let param = {}
        param.data=locationInfo[i]
        Android.deleteFileLine(JSON.stringify(param))
        tab3_readFile(getFileName(locationInfo[i]))
    }
    document.getElementById('denyButton').run = function(){}
    showDialog()
}
// 이동/저장
function tab3_moveButtonClick(locationInfo,i){
    console.log(this)
    let moveButton = document.getElementById('moveButton')
    if(moveButton.classList.contains('move')){
     tab3_markers[i].dragging.enable()
     tab3_markers[i].on('dragend', function(event) {
         var position = event.target.getLatLng();
         locationInfo[i]['position'] = position;
         console.log('loc info', locationInfo[i], i)
         console.log(tab3_markers[i])
     });
     moveButton.innerText = '저장'
    }else{
     moveButton.innerText = '이동'
     showDialog()
    }
    moveButton.classList.toggle('move')
    moveButton.classList.toggle('save')

    document.getElementById('acceptButton').run = function(){
        let newLat = locationInfo[i].position.lat
        let newLon = locationInfo[i].position.lng

        if(newLat){
            locationInfo[i].lat = newLat
        }
        if(newLon){
            locationInfo[i].lon =newLon
        }
        delete locationInfo[i].position
        console.log(locationInfo[i])
        let param = {}
        param.data=locationInfo[i]


        Android.updateFile(JSON.stringify(param))
        Android.showToast("저장되었습니다.")
    }
    document.getElementById('denyButton').run = function(){
        tab3_markers[i].dragging.disable()
        tab3_markers[i].setLatLng([locationInfo[i].lat,locationInfo[i].lon])

    }
 }

function tab3_resetMakers(){
    tab3_markers.forEach((marker) =>{
        tab3_map.removeLayer(marker);
    });
    tab3_markers = []; // Clear the array
    if(tab3_polyline){
        tab3_map.removeLayer(tab3_polyline)
        tab3_polyline = null;
    }

}
function tab3_resetLi(){
    document.getElementById('tab3_visitList').querySelectorAll('li').forEach((e)=>{e.remove()})
}

function tab3_readType1Map(locationInfo){
    tab3_resetMakers()
    tab3_resetLi()
    document.getElementById('tab3_bottomListContainer').style.display = 'block'
    let visitList = document.getElementById("tab3_visitList");

    locLength = locationInfo.length;
    //locationinfo[i] = {"fileName":"2024-11-22-1-.txt","time":"2024-11-22  23:12:22","lat":"37.5692849","lon":"126.9725051","memo":"test","order":"0"}
    for(let i=0; i<locLength; i++){
        // 팝업 박스
        let popupContent = `
                    <h3>방문장소 ${i} ${locationInfo[i].time}</h3>
                    <p id="description_${i}">${locationInfo[i].memo}</p>
            `;
        let visit = document.createElement('div') // 최종 content
        visit.classList.add('popupContent')

        let infoBox = document.createElement('div')
        infoBox.innerHTML = popupContent

        infoBox.onclick = ()=>{
            tab3_memoFucus(locationInfo[i])
        }
        let buttonBox = document.createElement('div')

        let delButton =document.createElement('button')
        delButton.innerText="삭제"
        delButton.id = 'deleteButton'

        delButton.onclick= ()=>{
            tab3_deleteButtonClick(locationInfo,i)
        }

        let moveButton =document.createElement('button')
        moveButton.innerText="이동"
        moveButton.id = 'moveButton'
        moveButton.classList.add('move')

        moveButton.onclick= ()=>{
            tab3_moveButtonClick(locationInfo,i)
        }

        buttonBox.appendChild(delButton)
        buttonBox.appendChild(moveButton)

        visit.appendChild(infoBox)
        visit.appendChild(buttonBox)

        marker = L.marker([locationInfo[i].lat, locationInfo[i].lon]).addTo(tab3_map).bindPopup(visit)
        tab3_markers.push(marker)

        // li 안에서 쓰일 내용
        let div = document.createElement('div')

        let innerDiv = document.createElement('div')
        innerDiv.classList.add('inner')

        let h3 = document.createElement('h3')
        let p = document.createElement('p')

        h3.innerText=`방문장소 ${i} ${locationInfo[i].time}`

        p.id=`description_${i}`
        p.innerText=locationInfo[i].memo;
        
        innerDiv.appendChild(h3)
        innerDiv.appendChild(p)

        div.appendChild(innerDiv)

        let li = document.createElement('li');
        li.innerHTML = div.innerHTML;
        li.onclick = function() {
            marker.bindPopup(visit).openPopup();
            tab3_map.setView([locationInfo[i].lat, locationInfo[i].lon], tab3_map.getZoom()); // 지도의 중앙을 마커 위치로 설정
        };

        visitList.appendChild(li);
    }
}
function tab3_removeLi(event){
    event.stopPropagation();
    console.log(event)

}
function tab3_mapOpen(el){
    //console.log(typeof el ,el, el.getAttribute('value'))
    const input = el.querySelector('input');
    if(input){
        return
    }
    let listContainer = document.querySelector('.tab3-bottom-map-list-container');
    listContainer.style.display = 'block';
    setTimeout(function(){
        document.getElementById('tab3_bottomMapListContainer').classList.toggle('bottom-down');
    },10)
    document.getElementById('table-container').style.display = 'none'
    tab3_readFile(el.getAttribute('value'))
    tab3_map.invalidateSize();
}

function tab3_mapListClose(el){
    document.getElementById('table-container').style.display = 'block'

    let listContainer = document.querySelector('.tab3-bottom-map-list-container');
    listContainer.style.display = 'none';

    tab3_resetMakers()
    list = tab3_search()
    appendHistory(list)
}

function tab3_listOpen(){
    let bottom_menu = document.querySelector(".tab3-bottom-menu")

    let tab3_bottomListContainer = document.getElementById('tab3_bottomListContainer')
    // 높이 조절
    tab3_bottomListContainer.classList.toggle('top75dvh')
    tab3_bottomListContainer.classList.toggle('top40dvh')
    let tab3_visitList = document.getElementById('tab3_visitList')
    tab3_visitList.classList.toggle("display-none")
}

function dialog(){
    initDialog('dialog-main')
}

function getFileName(locationInfo){
    let fileName = locationInfo['time'].split(" ")[0]
    let type = locationInfo['type']
    return `${fileName}-${type}`
}

function tab3_readType0Map(locInfo){
    tab3_resetMakers()
    document.getElementById('tab3_bottomListContainer').style.display = 'none'

    let locLength = locInfo.length;

    let tab3_icon = L.divIcon({
        className: 'tab1-custom-icon',
        html: "<div class='tab3-marker-pin'></div><i class='tab3-material-icons'></i>",
        iconSize: [15, 15],
        iconAnchor: [15, 15]
    });

    let tab3_line = [];
     var isLongPress = false;
    var pressStartTime;

    // Duration to detect long press
    var longPressDuration = 1000; // 1 second

    for(let i=0; i<locLength; i++){

        let marker = L.marker([locInfo[i].lat, locInfo[i].lon], {icon: tab3_icon}).addTo(tab3_map)/*.bindPopup(markerStr)*/;
        marker.dragging.enable()
        // Listen for mousedown or touchstart
//        marker.on('contextmenu', function (e) {this.dragging.enable()});

        marker.on('dragstart', function(e) {
            //1. remove line
            tab3_map.removeLayer(tab3_polyline)
            // console.log('drag start',e.target.getLatLng())
        });
        marker.on('dragend', function(e) {
            document.getElementById('acceptButton').run = function(){
                locInfo[i].lat=e.target.getLatLng().lat
                locInfo[i].lon=e.target.getLatLng().lng

                let param = {}
                param.data=locInfo[i]
                console.log(locInfo[i])
                Android.updateFile(JSON.stringify(param))

                tab3_readType0Map(locInfo)
            }
            document.getElementById('denyButton').run = function(){
                tab3_readType0Map(locInfo)
            }

            tab3_line_copy = JSON.parse(JSON.stringify(tab3_line));
            tab3_line_copy[i] = [e.target.getLatLng().lat,e.target.getLatLng().lng]
            console.log('end marker ==>',tab3_markers[i])
            console.log('dragend' , e.target.getLatLng())


            drawPolyline(tab3_line_copy)
            showDialog()
//            this.setOpacity(1);

        });


        tab3_line.push([locInfo[i].lat, locInfo[i].lon])

        tab3_markers.push(marker);
    }
    drawPolyline(tab3_line)
    fitMapToFarthestMarkers(tab3_markers,tab3_map)
}

function drawPolyline(lines){

    tab3_polyline = L.polyline([lines], {
        color: '#654e9fb2'
    }).arrowheads({
        frequency: 'allvertices',
        yawn: 60,
        size: '15px',
        color: '#654e9fb2',
        fill: true
    }).addTo(tab3_map);
}