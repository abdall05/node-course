const fs = require("fs");
const path = require("path");

//npm package for http requests
const superAgent = require("superagent");
//also supports promises
//otherwise we have to promisify it

//1-promisfy readFile
const promisifiedReadFile = function (filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

const PromisifiedWriteFile = function (filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, "utf8", (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

const filePath = path.join(__dirname, "dog.txt");
// promisifiedReadFile(filePath)
//   .then((breed) => {
//     const url = `https://dog.ceo/api/breed/${breed}/images/random`;
//     return superAgent.get(url);
//   })
//   .then((res) => {
//     const imageUrl = res.body.message;
//     return PromisifiedWriteFile(
//       path.join(__dirname, "dog-image.txt"),
//       imageUrl
//     );
//   })

//   .then(() => console.log("Finished writing File!"))
//   .catch((err) => console.log(err.message));

//async/await instead
const getDogPicture = async function () {
  try {
    const breed = await promisifiedReadFile(filePath);
    const url = `https://dog.ceo/api/breed/${breed}/images/random`;
    const res = await superAgent.get(url);
    const imageUrl = res.body.message;
    await PromisifiedWriteFile(path.join(__dirname, "dog-image.txt"), imageUrl);
    console.log("Finished writing File!");
    return imageUrl;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// getDogPicture()
//   .then((url) => console.log(url))
//   .catch((err) => console.log(err));

// // or use IIFE to avoid mixing await with then

// (async function () {
//   try {
//     const imageUrl = await getDogPicture();
//     console.log(imageUrl);
//   } catch (err) {
//     console.log(err);
//   }
// })();

//waiting for multiple promises simultaneously

const getMultipleDogPictures = async function (num) {
  try {
    const dogImagePromises = new Array(num);
    const breed = await promisifiedReadFile(filePath);
    const url = `https://dog.ceo/api/breed/${breed}/images/random`;
    for (let i = 0; i < num; i++) {
      dogImagePromises[i] = superAgent.get(url);
    }
    const results = await Promise.all(dogImagePromises);
    const dogImages = results.map((res) => res.body.message);
    await PromisifiedWriteFile(
      path.join(__dirname, "dog-images.txt"),
      dogImages.join("\n")
    );
    console.log(dogImages);
    return dogImages;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

getMultipleDogPictures(5);
