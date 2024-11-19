console.log('tab3')
function renderItems(items) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    console.log(items)
    items.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item}</td>
        `;
        tbody.appendChild(tr);
    });
}

function addItem() {
    const name = document.getElementById('searchTerm').value;
    renderItems(name);
}

async function search() {
    let date = document.getElementById("searchTerm").value
    let param = {
        searchTerm:date
    }
    let list = await Android.reqSearch(JSON.stringify(param))
    renderItems(list)
    return list
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
    search()
}