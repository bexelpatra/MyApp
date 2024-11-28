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
}

function appendHistory(items) {
    //console.log(items)
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    items.forEach((item, index) => {
        const tr = document.createElement('tr');
        let fileName = item.substr(0,12)
        tr.innerHTML = `
            <td style='width:7%'>기록</td>
            <td id="fileNameCell" style='width:70%' onclick="tab3_listOpen(this)" ymdt='${fileName}' value='${item}'>${item.substr(0,item.lastIndexOf(".txt"))}</td>
            <td style='width:20%'>
                <button onclick="tab3_titleUpdate(this)">수정</button>
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
    // Remove any non-numeric characters
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
        let visit = `<div class="popupContent">
                        <h3>방문장소 ${i} ${locationInfo[i].time}</h3>
                        <p id="description_${i}">${locationInfo[i].memo}</p>
                    </div>
                    `;
        let div = document.createElement('div')
        div.classList.add('popupContent')
        let innerDiv = document.createElement('div')
        innerDiv.classList.add('inner')

        let h3 = document.createElement('h3')
        h3.innerText=`방문장소 ${i} ${locationInfo[i].time}`
        let p = document.createElement('p')
        p.id=`description_${i}`
        p.innerText=locationInfo[i].memo;
        
        innerDiv.appendChild(h3)
        innerDiv.appendChild(p)
        innerDiv.onclick = function(){
            tab3_memoFucus(locationInfo[i],fileName)
        }
        div.appendChild(innerDiv)
        let li = document.createElement('li');
        // li.appendChild(div)
        li.innerHTML = div.innerHTML;

        marker = L.marker([locationInfo[i].lat, locationInfo[i].lon]).addTo(tab3_map).bindPopup(div)
                
        tab3_markers.push(marker)
        li.onclick = function() {
            marker.bindPopup(visit).openPopup();
            tab3_map.setView([locationInfo[i].lat, locationInfo[i].lon], tab3_map.getZoom()); // 지도의 중앙을 마커 위치로 설정
        };
        
        // marker.on('popupopen',marker.on('popupopen', patch ));
        visitList.appendChild(li);
    }
    // tab3_listToggle("show");
}

function tab3_listToggle(param){
    if(param != tab3_bottom){
        let listContainer = document.querySelector('.tab3-bottom-list-container');
        listContainer.classList.toggle(param);
        tab3_bottom = param;
    }
}
function tab3_listOpen(el){
    //console.log(typeof el ,el, el.getAttribute('value'))
    const input = el.querySelector('input');
    if(input){
        return
    }
    document.getElementById('table-container').style.display = 'none'
    document.getElementById('tab3_bottomListContainer').classList.toggle('bottom-down');
    
    tab3_readFile(el.getAttribute('value'))
}

function tab3_listClose(el){
    document.getElementById('tab3_bottomListContainer').classList.toggle('bottom-down')
    document.getElementById('table-container').style.display = 'block'
    tab3_resetMakers()
}


function patch(e) {
    var descriptionElement = document.getElementById('description');
    descriptionElement.addEventListener('click', function() {
        // Create an input element
        var input = document.createElement('textarea');
        // input.type = 'text';
        input.value = this.textContent;
        input.className = this.className;
        
        // Hide the original paragraph
        this.style.display = 'none';
        
        // Insert the input right after the hidden paragraph
        this.parentNode.insertBefore(input, this.nextSibling);
        
        // Focus the input
        // input.focus();

        // Event listener when input loses focus
        input.addEventListener('blur', function() {
            // Update the hidden paragraph with new text
            //console.log(this)
            //console.log(this.value)
            var originalP = this.previousElementSibling;
            originalP.textContent = this.value;
            //console.log(this.originalP)
            
            // Remove the input
            // this.remove();
            
            // Show the paragraph again
            originalP.style.display = 'block';
            
            // Re-add click event listener
            originalP.addEventListener('click', function() {
                // Your click-to-edit logic
                //console.log("???")
            });
        });

    });
}