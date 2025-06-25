const fs = require("node:fs");
const http = require("http");
const url = require("url"); // for pasrsing url
const render = require("./modules/templating");

//json data
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const productData = JSON.parse(data);

//templates
const productTemplate = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);
const cardTemplate = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const overviewTemplate = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);

const server = http.createServer((req, res) => {
  // Routing
  const q = url.parse(req.url, true);
  let pathName = q.pathname;
  switch (pathName) {
    case "/":

    case "/overview":
      const products = productData
        .map((product) => {
          product.organicDisplay = product.organic ? "" : "not-organic";
          return render(cardTemplate, product);
        })
        .join("");

      let overviewHtml = render(overviewTemplate, { products });
      res.end(overviewHtml);
      break;

    case "/product":
      const id = q.query.id;
      const product = productData[id];

      product.organicDisplay = product.organic ? "" : "not-organic";
      let html = render(productTemplate, product);
      res.writeHead(200, {
        "Content-type": "text/html",
      });
      res.end(html);

      break;
    default:
      res.writeHead(404, {
        "Content-type": "text/html",
      });
      res.end("<h1>Page not found!</h1>");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000");
});
