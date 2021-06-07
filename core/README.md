# Core Package

## Installation

`npm install @techuila/core`

### Table of contents

- Class: Server
  - `new Server(env, isServeStaticFiles)`
  - `server.setProductionFiles()`
  - `server.start()`
  - `server.close()`
- Class: Routes
  - `new Routes(express, options)`
  - `routes.initializeMiddleware()`
  - `routes.initializeRoutes()`
  - `routes.handleResourceNotAvailable()`
  - `routes.handleRequestError()`
- Controller
- Helper
  - Object: ErrorException
    - `new Helper.ErrorException.Error(code, message, details)`
    - `new Helper.ErrorException.ServerError(message, details)`
    - `new Helper.ErrorException.AlreadyExitsError(message, details)`
    - `new Helper.ErrorException.NotFoundError(message, details)`
    - `new Helper.ErrorException.UnauthorizedError(message, details)`
    - `new Helper.ErrorException.ValidationError(message, details)`
  - Function: ExistingHandler
  - Function: Upsert

### Class: Server

- Extends: `<Routes>`

Setups an express app server with its routes that you will pass on using `Server.initializeRoutes([, controllers])`.

#### `new Server(config, isServeStaticFiles)`

- `env` <Object>
  - `PORT` <number> Default: `8676`.
  - `NODE_ENV` <string> Default: `'localhost'`.
  - `HOST` <string> Default: `'http://localhost:3000'`.
- `options` <Object>
  - `cors` <Object> Cors configuration options [here](https://www.npmjs.com/package/cors#configuration-options).
  - `isServeStaticFiles` <boolean> Default: `false`.

There are 2 ways to setup the server:

```javascript
const Server = require('@techuila/core');
const db = require(path.resolve('database', 'models'));
const server = new Server({});

// Initialize routes
const UserController = require('./controllers/UserController')l
const AuthController = require('./controllers/AuthController');

server.initializeRoutes(new UserController(db), new AuthController(db));
server.start();
```

OR

_With the use of node-loopie_

```javascript
const path = require('path');
const nl = require('node-loopie');
const db = require(path.resolve('database', 'models'));
const Server = require('@techuila/core');

class App extends Server {
  constructor() {
    super({});

    this.initializeRoutes(...this.getControllers());
  }

  getContorllers() {
    const directory = path.resolve('controllers');
    const controllers = [];

    nl(directory, (file, fileName) => {
      const Controller = require(path.resolve(directory), fileName);
      controllers.push(new Controller(db));
    });

    return controllers;
  }
}
```

---

Inpsired by `https://github.com/vtuanjs/core`
