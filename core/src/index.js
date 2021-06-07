const nl = require('node-loopie');
const obj = {};

nl(__dirname, (file, fileName) => {
  const property = fileName[0].toUpperCase() + fileName.slice(1);
  obj[property] = require(`./${file}`);
});

module.exports = obj;
