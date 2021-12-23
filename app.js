"use strict";
const num1Element = document.getElementById('num1');
const num2Element = document.getElementById('num2');
const btn = document.getElementById('button'); //we know that this isnt null
const numResults = [];
const textResults = [];
const genericNumberArray = [];
const myPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve("It worked");
    }, 1000);
});
myPromise.then((result) => {
    console.log(result);
});
function add(num1, num2) {
    if (typeof num1 == 'number' && num2 == 'number') {
        return num1 + num2;
    }
    else if (typeof num1 == 'string' && typeof num2 == 'string') {
        return num1 + ' ' + num2;
    }
    else {
        return +num1 + +num2;
    }
}
function printResult(resultObject) {
    console.log(resultObject.val);
}
console.log(add(1, 5));
btn.addEventListener('click', () => {
    const num1 = num1Element.value;
    const num2 = num2Element.value;
    const result = add(+num1, +num2);
    const stringResult = add(num1, num2);
    numResults.push(result);
    textResults.push(stringResult);
    console.log(result);
    printResult({ val: result, timestamp: new Date() });
    console.log(numResults, textResults);
});
