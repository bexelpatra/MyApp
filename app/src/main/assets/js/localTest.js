console.log("localTest.js");
let Android = {
    dataSet : ()=>{
        let list =[{"time":"2024-11-22  23:11:22","lat":"37.5691849","lon":"126.9715051","memo":"test"},
            {"time":"2024-11-22  23:12:22","lat":"37.5692849","lon":"126.9725051","memo":"test"},
            {"time":"2024-11-22  23:13:22","lat":"37.5693849","lon":"126.9735051","memo":"test"},
            {"time":"2024-11-22  23:14:22","lat":"37.5694849","lon":"126.9745051","memo":"test"},
            {"time":"2024-11-22  23:15:22","lat":"37.5695849","lon":"126.9755051","memo":"test"},
            {"time":"2024-11-22  23:16:22","lat":"37.5696849","lon":"126.9765051","memo":"test"},
            {"time":"2024-11-22  23:17:22","lat":"37.5697849","lon":"126.9775051","memo":"test"},
            {"time":"2024-11-22  23:18:22","lat":"37.5698849","lon":"126.9785051","memo":"test"},
            {"time":"2024-11-22  23:19:22","lat":"37.5699849","lon":"126.9795051","memo":"test"}];
        return JSON.stringify(list);
    },
    save: function() {
        let data;
        data = '[{"lat":"37.123","lon":"127.123","memo":"없음","time":"2024-11-08  13:31:16"}]';
        return data;
    },
    readFile: function() {
        let data = '[]';
/*      let data = '['
                 + '{"lat":"37.123","lon":"127.123","memo":"ㄱㄴ","time":"2024-11-08  11:30:10"},'
                 + '{"lat":"37.133","lon":"127.133","memo":"ㅂㅊ","time":"2024-11-08  12:30:10"},'
                 + '{"lat":"37.113","lon":"127.131","memo":"ㅂㅊ","time":"2024-11-08  13:30:10"},'
                 + '{"lat":"37.118","lon":"127.139","memo":"ㅂㅊ","time":"2024-11-08  14:30:10"}'
                 + ']';*/
        return Android.dataSet();
    },
    getCurrentLocation: function() {
        let data = '{"lat":"37.5628738","lon":"126.9775487"}';
        return data;
    },
    reqSearch : function(param) {
        let ymd = now(1).split('-')
        let y = ymd[0]*1
        let m = ymd[1]*1
        let d = ymd[2]*1
        let list = []
        for(let i =0;i<10;i++){
            list.push(`"${y}-${m}-${d-i}-1.txt"`)
        }
        
        return `[${list}]`
    }
    ,showToast:function(message){
        console.log(message)
    }
    ,tempLamda : (a)=>{
        console.log(a)
        console.log(this, this == window)
    }
    ,tempFunc : function(a){
        console.log(a)
        console.log(this, this == Android)
    }
};
