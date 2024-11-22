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
    console.log(list)
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
    appendHistory(list)
    
}

function tab3_readFile(fileName){
    
    let ymdte = fileName?.split('-')
    let time = ymdte.splice(0,3).join('-')
    let fileType = ymdte.splice(0,1).join('')
    let returnData = Android.readFile(time,fileType);
    console.log("##### tab returnData : ", returnData);
    let locationInfo = JSON.parse(returnData);
    
    let distanceInfo ;
    if(locationInfo != ""){
        distanceInfo = findFarthestPair(locationInfo);
        console.log(distanceInfo)
        tab3_createLiTag(locationInfo);
        tab3_map.setView([distanceInfo.center.lat,distanceInfo.center.lon],getZoomLevel(distanceInfo.distance));
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
function tab3_updateMemo(locInfo){

}

function tab3_memoBlur(e){
    let tab3_memo = document.getElementById('tab3_memo');
    let tab3_searchTerm = document.getElementById('searchTerm');
    tab3_memo.style.display='none'
    tab3_searchTerm.style.display='block'
    Android.showToast("저장되었습니다.")

    Object.keys(tab3_memo.dataset).forEach((key)=>{
        tab3_memo.removeAttribute(`data-${key}`)
    })
}



function tab3_resetMakers(){
    tab3_markers.forEach((marker) =>{
        tab3_map.removeLayer(marker);
    });
    tab3_markers = []; // Clear the array
}

function tab3_createLiTag(locationInfo){

    let visitList = document.getElementById("tab3_visitList");
    console.log('tab3_createLiTag',locationInfo)
    locLength = locationInfo.length;
    for(let i=0; i<locLength; i++){
        // locationInfo[i].time
        // locationInfo[i].memo
        let visit = `<div class="popupContent">
                        <h3>방문장소 ${i} ${locationInfo[i].time}</h3>
                        <p id="description_${i}" onclick="tab3_memoFucus(this)">${locationInfo[i].memo}</p>
                    </div>
                    `;
        let div = document.createElement('div')
        div.classList.add('popupContent')
        let h3 = document.createElement('h3')
        h3.innerText=`방문장소 ${i} ${locationInfo[i].time}`
        let p = document.createElement('p')
        p.id=`description_${i}`
        p.onclick = function(){
            console.log("goigo")
            tab3_memoFucus(locationInfo[i])
        }
        p.innerText=locationInfo[i].memo;
        
        div.appendChild(h3)
        div.appendChild(p)
        console.log(div)
        let li = document.createElement('li');
        // li.appendChild(div)
        li.innerHTML = div.innerHTML;

        marker = L.marker([locationInfo[i].lat, locationInfo[i].lon]).addTo(tab3_map).bindPopup(div)
                
        tab3_markers.push(marker)
        li.onclick = function() {
            marker.bindPopup(visit).openPopup();
            tab3_map.setView([locationInfo[i].lat, locationInfo[i].lon], tab3_map.getZoom()); // 지도의 중앙을 마커 위치로 설정
        };
        console.log(li)
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
    console.log(typeof el ,el, el.getAttribute('value'))
    document.getElementById('bottomListContainer2').classList.toggle('full-height_2');
    tab3_readFile(el.getAttribute('value'))

}

function tab3_listClose(el){
    document.getElementById('bottomListContainer2').classList.remove('full-height_2')
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
            console.log(this)
            console.log(this.value)
            var originalP = this.previousElementSibling;
            originalP.textContent = this.value;
            console.log(this.originalP)
            
            // Remove the input
            // this.remove();
            
            // Show the paragraph again
            originalP.style.display = 'block';
            
            // Re-add click event listener
            originalP.addEventListener('click', function() {
                // Your click-to-edit logic
                console.log("???")
            });
        });

    });
}