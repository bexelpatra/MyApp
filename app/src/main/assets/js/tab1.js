let tab1Map;
let tab1InitFg = true;

function tab1_initMap(){
    if(tab1InitFg){
        tab1Map = initMap('tab1_map');
        tab1InitFg = false
    }
}