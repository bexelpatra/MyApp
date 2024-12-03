let tab3_map;
let tab3_initFg = true;
let tab3_bottom = 'hidden'
let tab3_markers=[]

function tab3_initMap(){
    if(tab3_initFg){
        // tab3_map = initMap('tab3_map')
        let currentLocation = JSON.parse(Android.getCurrentLocation());
        tab3_map = L.map('tab3_map').setView([currentLocation.lat, currentLocation.lon], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(tab3_map);
        tab3_initFg = false
    }
    document.getElementById('tab3_visitList').addEventListener('click', function (event) {
        // If a button was clicked
        if (event.target.tagName === 'BUTTON') {
            event.stopPropagation(); // Stop the click from bubbling to the <li>
            doAnotherThing(); // Call the button's action
        } else if (event.target.tagName === 'li') {
            doSomething(); // Call the <li>'s action
        } else{
            console.log('event', event.target.tagName)
        }
    });
}
function doAnotherThing(){
    console.log("삭제버튼")
}
function doSomething(){
    console.log("리스트")
}
function appendHistory(items) {
    //console.log(items)
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
    // 서버 통신 구간
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

function tab3_readFile(fileName){
    
    let ymdte = fileName?.split('-')
    let time = ymdte.splice(0,3).join('-')
    let fileType = ymdte.splice(0,1).join('')
    let returnData = Android.readFile(time,fileType);
    //console.log("##### tab returnData : ", returnData);
    let locationInfo = JSON.parse(returnData);
    
    let distanceInfo ;
    if(locationInfo != ""){
        distanceInfo = findFarthestPair(locationInfo);
        tab3_createLiTag(locationInfo,fileName);
        tab3_map.setView([distanceInfo.center.lat,distanceInfo.center.lon],getZoomLevel(distanceInfo.distance));
    }
}

function tab3_memoFucus(locInfo,fileName){
    let tab3_memo = document.getElementById('tab3_memo');
    let tab3_searchTerm = document.getElementById('searchTerm');
    tab3_memo.style.display='block'
    tab3_searchTerm.style.display='none'
    //console.log(locInfo)
    tab3_memo.dataset['fileName'] = fileName
    Object.keys(locInfo).forEach((key)=>{
        tab3_memo.dataset[key] = locInfo[key]
    })


    tab3_memo.value = locInfo.memo
    tab3_memo.focus()
}

function tab3_memoBlur(){
    let tab3_memo = document.getElementById('tab3_memo');
    let tab3_searchTerm = document.getElementById('searchTerm');
    tab3_memo.style.display='none'
    tab3_searchTerm.style.display='block'

    tab3_memo.dataset.memo = tab3_memo.value;
    let param = {}
    param.data=tab3_memo.dataset
    param.type='1'

    Android.updateFile(JSON.stringify(param))
    Android.showToast("저장되었습니다.")

    Object.keys(tab3_memo.dataset).forEach((key)=>{
        tab3_memo.removeAttribute(`data-${key}`)
    })

    tab3_readFile(tab3_memo.dataset.fileName)
}



function tab3_resetMakers(){
    tab3_markers.forEach((marker) =>{
        tab3_map.removeLayer(marker);
    });
    tab3_markers = []; // Clear the array
}

function tab3_createLiTag(locationInfo,fileName){

    let visitList = document.getElementById("tab3_visitList");
    locLength = locationInfo.length;
    for(let i=0; i<locLength; i++){
        // locationInfo[i].time
        // locationInfo[i].memo
        let popupContent = `
                    <h3>방문장소 ${i} ${locationInfo[i].time}</h3>
                    <p id="description_${i}">${locationInfo[i].memo}</p>
            `;
        let visit = document.createElement('div') // 최종 content
        visit.classList.add('popupContent')

        let infoBox = document.createElement('div')
        infoBox.innerHTML = popupContent
        infoBox.onclick = ()=>{
            tab3_memoFucus(locationInfo[i],fileName)
        }
        let buttonBox = document.createElement('div')

        let delButton =document.createElement('button')
        delButton.innerText="삭제"
        delButton.id = 'deleteButton'
        delButton.onclick=function(){
            showDialog()
        }
        let moveButton =document.createElement('button')
        moveButton.innerText="이동"
        moveButton.id = 'moveButton'

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
        h3.innerText=`방문장소 ${i} ${locationInfo[i].time}`



        let p = document.createElement('p')
        p.id=`description_${i}`
        p.innerText=locationInfo[i].memo;
        
        innerDiv.appendChild(h3)
        innerDiv.appendChild(p)
//        innerDiv.onclick = function(){
//            tab3_memoFucus(locationInfo[i],fileName)
//        }
        div.appendChild(innerDiv)
        let li = document.createElement('li');
        li.innerHTML = div.innerHTML;
        li.onclick = function() {
            marker.bindPopup(visit).openPopup();
            tab3_map.setView([locationInfo[i].lat, locationInfo[i].lon], tab3_map.getZoom()); // 지도의 중앙을 마커 위치로 설정
        };

        // marker.on('popupopen',marker.on('popupopen', patch ));
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