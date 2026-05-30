function Decode(str) {
    let result = "";
    for (let i = 0; i < str.length; i++) {
        if (str[i] === "%") {
            let hex = str.substring(i + 1, i + 3);
            let charCode = parseInt(hex, 16);
            result += String.fromCharCode(charCode);
            i += 2;
        } else {
            result += str[i];
        }
    }
    return result;
}

export { Decode };