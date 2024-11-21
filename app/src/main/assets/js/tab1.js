let tab1_map;
let tab1_initFg = true;

function tab1_initMap(){
    if(tab1_initFg){
        tab1_map = initMap('tab1_map');
        tab1_initFg = false
    }
}