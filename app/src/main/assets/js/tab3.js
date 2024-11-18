console.log('tab3')
document.onload = function(){
    let searchTerm = document.getElementById('searchTerm')
    console.log('123')
    searchTerm.addEventListener('change',function(e){
        console.log(e)
    })
}

function renderItems() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    items.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.email}</td>
            <td>
                <button onclick="deleteItem(${index})" class="delete-btn">
                    Delete
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
function addItem() {
    const name = document.getElementById('searchTerm').value;

    if (name ) {
        items.push({ name});
        renderItems();
        clearInputs();
    }
}