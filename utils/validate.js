function isInteger(value) {

    let num = parseFloat(value);

    return !isNaN(num) && Number.isInteger(num);

}
export {isInteger};