function initDialog(dialogId){
    let div = `
        <div id="customDialog" class="dialog-overlay" style="display:none;">
            <div class="dialog-box">
                <div class="dialog-title" id="dialogTitle">Confirmation</div>
                <!-- <div class="dialog-message" id="dialogMessage">Do you want to proceed?</div> -->
                <div class="dialog-buttons">
                    <button class="btn btn-deny" id="denyButton">취소</button>
                    <button class="btn btn-accept" id="acceptButton">확인</button>
                </div>
            </div>
        </div>
    `
    document.getElementById(dialogId).innerHTML = div;
    addEvent()
}
function addEvent(){
    const dialog = document.getElementById('customDialog');
    const acceptButton = document.getElementById('acceptButton');
    const denyButton = document.getElementById('denyButton');
    console.log('ttest')
    // Accept button handler
    acceptButton.addEventListener('click', (e) => {
        e.target.run()
        hideDialog();
    });

    // Deny button handler
    denyButton.addEventListener('click', (e) => {
        hideDialog();
    });

    // Event listener to show dialog
//    showDialogBtn.addEventListener('click', showDialog);
}
// Show dialog function
function showDialog() {
    document.getElementById('customDialog').style.display = 'flex';
}

// Hide dialog function
function hideDialog() {
    document.getElementById('customDialog').style.display = 'none';
}


