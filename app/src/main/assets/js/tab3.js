console.log('tab3')
let tab3_map;
let tab3_initFg = true;

let tab3_bottom = 'hidden'

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
let i = 2;

function temp(){
    console.log("temp")
}
let tab3_markers=[]

function tab3_resetMakers(){
    markers.forEach(function(marker) {
        map.removeLayer(marker);
    });
    markers = []; // Clear the array
}
function makeTextarea(popup){
    let parentNode = document.getElementById('Tab3')
    let textarea = document.createElement('textarea')
    textarea.style.float="inner-start"
    textarea.style.position="absolute"
    textarea.value = popup.innerText
    parentNode.childNodes[0].before(textarea)
    textarea.focus()

    textarea.addEventListener('blur', function(e) {
        console.log(e)
        console.log(this)
        popup.innerText = this.value
        this.remove()
    })
}
function tab3_createLiTag(locationInfo){

    let visitList = document.getElementById("visitList2");
    console.log('tab3_createLiTag',locationInfo)
    locLength = locationInfo.length;
    for(let i=0; i<locLength; i++){
        // locationInfo[i].time
        // locationInfo[i].memo
        let visit = `<div id="popupContent">
                        <h3>방문장소 ${i} ${locationInfo[i].time}</h3>
                        <p id="description" onclick='makeTextarea(this)'>${locationInfo[i].memo}</p>
                    </div>
                    `;

        let li = document.createElement('li');
        
        li.innerHTML = visit;

        marker = L.marker([locationInfo[i].lat, locationInfo[i].lon]).addTo(tab3_map).bindPopup(visit)
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