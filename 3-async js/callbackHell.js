const fs = require("fs");
const path = require("path");

//npm package for http requests
const superAgent = require("superagent");

const filePath = path.join(__dirname, "dog.txt");
fs.readFile(filePath, "utf8", (err, data) => {
  if (err) console.log(err.message);
  else {
    const breed = data;
    const url = `https://dog.ceo/api/breed/${breed}/images/random`;
    superAgent.get(url).end((err, res) => {
      if (err) console.log(err.message);
      const imageUrl = res.body.message;
      fs.writeFile(path.join(__dirname, "dog-image.txt"), imageUrl, () => {
        console.log("Finished writing!");
      });
    });
  }
});
