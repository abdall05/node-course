// process.env.UV_THREADPOOL_SIZE = 2; //changing from default = 4
//set this in the starting command not here
//  UV_THREADPOOL_SIZE=1 node script.js

const fs = require("node:fs");
const path = require("path");
const crypto = require("crypto");

// setTimeout(() => console.log("timeout"), 0);
// setImmediate(() => console.log("immediate"));
const filePath = path.join(__dirname, "text-file.txt");
// fs.readFile(filePath, (err, data) => console.log("finished reading data"));
//the event loop didn't start yet ;

console.log("The event loop will start now!");

/* Node docs
If a setTimeout() and setImmediate() are scheduled from the top-level, 
the timeout may fire first, depending on the system.

But if they are scheduled inside an I/O callback, 
setImmediate() will always fire before setTimeout().

*/

// to make these callbacks executes after the event loop start we
//will put them inside a callback

fs.readFile(filePath, (err, data) => {
  console.log("finished reading data");
  setTimeout(() => console.log("timeout"), 0);
  setImmediate(() => console.log("immediate")); // this before timeout
  //immediate comes after I/O (see theory)
  process.nextTick(() => console.log("Tick"));

  //this will be offloaded to thread pool
  const now = Date.now();
  for (let i = 0; i < 4; i++) {
    crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () =>
      console.log(`pbkdf2 #${i} finished in`, Date.now() - now, "ms")
    );
  }
  //pbkdf2Sync never use this
});
