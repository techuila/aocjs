const fs = require('fs');
const path = require('path');
const nl = require('node-loopie');
const directory = path.join('app', 'mail', 'views', 'templates');
const createMail = require('./create-mail.js');

// Import environment variables
require('dotenv').config(process.cwd(), '.env');
require('dotenv').config(process.cwd(), `.env.${process.env.NODE_ENV}`);

module.exports = function (templateView = require('./template')) {
  const mail = {};

  if (fs.existsSync(directory)) {
    // Loop all files in view/templates folder and store it on an object
    nl(directory, (file, fileName) => {
      mail[fileName] = (...args) => createMail(...args, path.join(directory, file), templateView);
    });
  }

  if ('ServerError' in mail) mail.ServerError = (...args) => createMail(...args, './server-error.js', templateView);

  return mail;
};
