function tab4_readFile(fileName){

    let returnData = Android.readFile(fileName, 1);
    //console.log("##### tab returnData : ", returnData);
    let locInfo = JSON.parse(returnData);
    //console.log("##### tab locInfo : ", locInfo);

    if(locInfo != ""){
        tab4_createLiTag(locInfo);
    }
}

let realImgPath;
function tab4_createLiTag(locInfo){
    let visitList = document.getElementById("tab4_list");

    while (visitList.firstChild) {
        visitList.removeChild(visitList.firstChild);
    }

    locLength = locInfo.length;
    for(let i=0; i<locLength; i++){
        let visit = '<div><a style="font-weight: bold;">방문 장소 ' + (i + 1) + ' ( ' + locInfo[i].time + ' )</a>'
                    //+ '<br>위도 : ' + locInfo[i].lat + ' / 경도 : ' + locInfo[i].lon
                    + '<br>메모 : ' + locInfo[i].memo.replaceAll('\n', '<br>')+ '<br></div>';

        let li = document.createElement('li');
        li.className = 'tab4-li';
        li.onclick = function() {
            //console.log(i, " : li onclick !!!!!!!!!!!!!!!!!!!!!!");
        };
        visitList.appendChild(li);

        let liDiv = document.createElement('div');
        liDiv.className = 'tab4-li-div';
        liDiv.innerHTML = visit;
        li.appendChild(liDiv);


        let fileDiv = document.createElement('div');

        Object.keys(locInfo[i]).forEach((key)=>{
                fileDiv.dataset[key] = locInfo[i][key]
                if(key == 'memo'){
                    fileDiv.dataset.imgPath = "";
                }
            })

        let fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = "tab4_input" + i;
        fileInput.onchange = function() {
            let existingDelBtn = document.getElementById('tab4_delBtn' + i);
            if (existingDelBtn) {
                existingDelBtn.remove();
            }

            let preview = document.getElementById('tab4_img'+i);
            if (this.files && this.files[0]) {
                let reader = new FileReader();
                let file = this.files[0];
                reader.onload = function(e) {
                    //preview.src = e.target.result;
                    //preview.src = realImgPath;

                    //base64 resize
                    let image = new Image();
                    image.src = e.target.result;
                    image.onload = (e) => {
                        let $canvas = document.createElement(`canvas`);
                        let ctx = $canvas.getContext(`2d`);

                        $canvas.width = e.target.width;
                        $canvas.height = e.target.height;

                        ctx.drawImage(e.target, 0, 0);

                        $canvas.remove();
                    }
                    preview.src = image.src;
                    fileDiv.dataset.imgPath = preview.src;

                    let param = {}
                    param.data = fileDiv.dataset;
                    Android.updateFile(JSON.stringify(param))
                    Android.showToast("저장되었습니다.")
                }
                reader.readAsDataURL(file);
            }

            let delFile = document.createElement('button');
            delFile.className = 'tab4-delete-btn';
            delFile.id = 'tab4_delBtn'+i;
            delFile.innerHTML = '삭제';

            delFile.onclick = function(){
                preview.src = '';
                delFile.remove();
                fileInput.value = '';

                fileDiv.dataset.imgPath = '';

                let param = {}
                param.data = fileDiv.dataset;

                Android.updateFile(JSON.stringify(param))
                Android.showToast("삭제되었습니다.")
            }

            fileInput.parentNode.insertBefore(delFile, fileInput.nextSibling);
        };

        let fileLabel = document.createElement('label');
        fileLabel.setAttribute('for', fileInput.id);

        let labelDiv = document.createElement('div');
        labelDiv.className = 'tab4-label-div';
        labelDiv.innerHTML = '사진 선택';
        fileLabel.appendChild(labelDiv);

        fileDiv.appendChild(fileLabel);
        fileDiv.appendChild(fileInput);

        let imgDiv = document.createElement('div');
        liDiv.appendChild(imgDiv);
        liDiv.appendChild(fileDiv);


        let imgFile = document.createElement('img');
        imgFile.className = 'tab4-img';
        imgFile.id = 'tab4_img' + i;

        // 저장된 이미지 경로 불러오기
        if(locInfo[i].imgPath){
            imgFile.src = locInfo[i].imgPath;

            let delFile = document.createElement('button');
            delFile.className = 'tab4-delete-btn';
            delFile.id = 'tab4_delBtn'+i;
            delFile.innerHTML = '삭제';

            delFile.onclick = function(){
                imgFile.src = '';
                delFile.remove();
                fileInput.value = '';

                fileDiv.dataset.imgPath = '';

                let param = {}
                param.data = fileDiv.dataset;

                Android.updateFile(JSON.stringify(param))
                Android.showToast("삭제되었습니다.")
            }
            fileInput.parentNode.insertBefore(delFile, fileInput.nextSibling);
        }
        imgDiv.appendChild(imgFile);
    }
}

function handleImagePath(path){
    realImgPath = path;
    console.log("### realImgPath : ", realImgPath);
}

function tab4_handleInput(el,value) {
    let cleanValue = value.replace(/[^0-9]/g, '');
    if(cleanValue.length>8){
        cleanValue = cleanValue.substr(0,8)
    }
    if (value !== cleanValue) {
        el.value = cleanValue
    }

    list = tab4_search()
    // list=['2024-11-18-1-.txt','2024-11-19-1-.txt']
    let dayList = document.getElementById('tab4_dayWrapper');
    let locList = document.getElementById('tab4_list');
    if(list != ""){
        tab4_appendHistory(list, dayList);
    } else {
        dayList.innerHTML = "";
        locList.innerHTML = "";
    }
}

// get file names
function tab4_search() {
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

function tab4_appendHistory(items, dayList) {
    dayList.innerHTML = "";

    items.forEach((item, index) => {
        let type = item.substr(11,1);
        let fileName = item.substr(0,12)
        if(type == "1"){
            let slideDiv = document.createElement('div');
            slideDiv.className = 'swiper-slide';

            let ul = document.createElement('ul');
            ul.className = 'tab4-ul';

            let li = document.createElement('li');
            li.className = 'tab4-day-li';
            li.onclick = function() {
                tab4_readFile(fileName);
            };
            li.innerHTML = item

            dayList.appendChild(slideDiv);
            slideDiv.appendChild(ul);
            ul.appendChild(li);
        }
    });
}