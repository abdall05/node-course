// this proves that the modules is wrapped into a function
console.log(arguments);

//1-
const CalculatorClass = require("./test-module1");
const myClaculator = new CalculatorClass();
console.log(myClaculator.add(1, 2));

//2-
const c = require("./test-module2");
console.log(c.add(1, 2));
//can even use destructuring
const { add, divide } = require("./test-module2");
