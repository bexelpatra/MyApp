console.log("localTest.js");
let Android = {
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
        return data;
    },
    getCurrentLocation: function() {
        let data = '{"lat":"37.5628738","lon":"126.9775487"}';
        return data;
    }
};
