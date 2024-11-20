console.log('tab3')

function makeMap(){
    map2 = {};
    map2 = initMap('tab3_map')
    return map2
}
function renderItems(items) {
    console.log(items)
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    items.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>기록</td>
            <td>${item}</td>
        `;
        tr.setAttribute("onclick","tab3_listOpen(this)")
        tr.setAttribute("value",item)
        tbody.appendChild(tr);
    });
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
    // Remove any non-numeric characters
    let cleanValue = value.replace(/[^0-9]/g, '');
    if(cleanValue.length>8){
        cleanValue = cleanValue.substring(0,8)
    }
    if (value !== cleanValue) {
        el.value = cleanValue
    }
    list = tab3_search()
    // list=['2024-11-18-1-.txt','2024-11-19-1-.txt']
    renderItems(list)
    
}

function tab3_readFile(fileName){
    map = makeMap()
    let ymdte = fileName?.split('-')
    let time = ymdte.splice(0,3).join('-')
    let fileType = ymdte.splice(0,1).join('')
    console.log(fileName)
    console.log(time)
    console.log(fileType)
    let returnData = Android.readFile(time,fileType);
    console.log("##### tab returnData : ", returnData);
    let locInfo = JSON.parse(returnData);
    
    if(locInfo != ""){
        tab3_createLiTag(locInfo);
    }
    currentLocation();
}
function tab3_createLiTag(locInfo,map){
    let visitList = document.getElementById("visitList2");

    locLength = locInfo.length;
    for(let i=0; i<locLength; i++){
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
    listToggle2("show");
    visitList.getElementsByTagName('li')[locLength-1].onclick();
}
let bottom2 = 'hidden'
function listToggle2(param){
    if(param != bottom2){
        let listContainer = document.querySelector('.tab3-bottom-list-container');
        listContainer.classList.toggle(param);
        bottom2 = param;
    }
}
function tab3_listOpen(el){
    console.log(typeof el ,el, el.getAttribute('value'))
    document.getElementById('bottomListContainer2').classList.toggle('full-height_2');
    tab3_readFile(el.getAttribute('value'))

}

function tab3_listClose(el){
    Android2.gogo()   
    document.getElementById('bottomListContainer2').classList.remove('full-height_2')
}