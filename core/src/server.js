const Routes = require('./routes');
const path = require('path');
const express = require('express');

module.exports = class Server extends Routes {
  constructor(
    { PORT = 8676, NODE_ENV = 'localhost', HOST = 'http://localhost:3000' },
    { cors = {}, isServeStaticFiles = false }
  ) {
    super(express, { HOST, cors });

    this.PORT = PORT;
    this.NODE_ENV = NODE_ENV;

    if (isServeStaticFiles) this.setProductionFiles();
    // this.serveStaticAssets();
  }

  setProductionFiles() {
    if (['production', 'development'].some((env) => env === this.NODE_ENV)) {
      this.app.use(this.express.static('./client/build'));

      this.app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
      });
    }
  }

  serveStaticAssets() {
    // this.app.use('/download/pdf/', this.express.static(path.join(__dirname, '/pdf-export/downloadables')));
  }

  start() {
    this.app.listen(this.PORT, () => console.log(`🚀 Running on PORT ${this.PORT} in ${this.NODE_ENV} environment`));
  }

  close() {
    this.app.close((err) => {
      if (err) console.log(`Closing server failed ${err}`);
    });
  }
};
