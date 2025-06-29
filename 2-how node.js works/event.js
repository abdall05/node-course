const EventEmitter = require("events");
const myEmitter = new EventEmitter();

//Observer Pattern

//Observer
myEmitter.on("newSale", () => console.log("newSale1"));
//can set up more than 1 listener for  the same event
myEmitter.on("newSale", (params) => console.log(params.price));

//can pass params with the emitted event so it can be used by observer
//rest pattern ...rest
myEmitter.emit("newSale", { price: 5 });

//best practice to create a class that inherits from EventEmitter

class Sales extends EventEmitter {
  constructor() {
    super();
  }
}
