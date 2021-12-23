const num1Element = document.getElementById('num1') as HTMLInputElement;
const num2Element = document.getElementById('num2') as HTMLInputElement;
const btn:HTMLElement = document.getElementById('button')!; //we know that this isnt null

const numResults: number[] = [];
const textResults: string[] = [];

const genericNumberArray: Array<number> = [];
/*
  The value the promise results to is the generic type
 */
const myPromise = new Promise<String>((resolve, reject) => {
    setTimeout(() => {
        resolve("It worked")
    }, 1000);
});

myPromise.then((result) => {
    console.log(result);
})

// setup your own type alias -> useful for union types
type NumOrStringType = number | string;
type MyResult =  { val: number; timestamp: Date};

/*
  interfaces
  They can also be used to force classes to implement certain functionalities.

  generic type -> type that interacts with another type
*/

interface ResultObj {
    val: number; timestamp: Date
}

function add(num1: NumOrStringType, num2: NumOrStringType) {
    if (typeof num1 == 'number' && num2 == 'number'){
        return num1 + num2;
    } else if (typeof num1 == 'string' && typeof num2 == 'string'){
        return num1 + ' ' + num2;
    } else {
       return  +num1 + +num2
    }
}

function printResult(resultObject: ResultObj){
    console.log(resultObject.val);
}

console.log(add(1, 5));

btn.addEventListener('click', () => {
     const num1 = num1Element.value;
     const num2 = num2Element.value;
     const result = add(+num1, +num2);
     const stringResult = add(num1, num2)
     numResults.push(result as number);
     textResults.push(stringResult as string);
     console.log(result);
     printResult({val: result as number, timestamp: new Date()});
     console.log(numResults, textResults)

})
