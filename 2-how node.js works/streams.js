const fs = require("fs");
const path = require("path");

const server = require("http").createServer();
const filePath = path.join(__dirname, "test-file.txt");
//methods from worst to best
//method 1:read whole data then send
const cb1 = (req, res) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, {
        "Content-type": "text/html",
      });
      return res.end("<h1>File not found!</h1>");
    }
    res.end(data);
  });
};
const cb2 = (req, res) => {
  const readable = fs.createReadStream(filePath);
  readable.on("data", (chunk) => {
    res.write(chunk); // res is writable stream
  }); // reading is faster than writing -> buffer problem if file is large.
  readable.on("end", () => res.end());
  readable.on("error", (err) => {
    console.log(err.message);
    res.writeHead(500, {
      "Content-type": "text/html",
    });
    res.end("<h1>File not found!</h1>");
  });
};

const cb3 = (req, res) => {
  const readable = fs.createReadStream(filePath);
  readable.on("error", (err) => {
    console.error("Read error:", err.message);
    res.statusCode = 500;
    res.end("File not found or cannot be read.");
  });

  // Handle writable stream error (rare, but possible)
  res.on("error", (err) => {
    console.error("Response error:", err.message);
  });

  readable.pipe(res);
};

//solve using pipe

server.on("request", cb3);

server.listen(8000, "127.0.0.1", () => {
  console.log("Listenening...");
});
