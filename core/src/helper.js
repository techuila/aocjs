const path = require('path');
const nl = require('node-loopie');
const obj = {};

const helper_path = path.resolve(__dirname, 'helper');

nl(helper_path, (file, fileName) => {
  obj[fileName] = require(path.resolve(helper_path, `${file}`));
});

module.exports = obj;
