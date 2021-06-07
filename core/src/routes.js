require('custom-env').env(true);
require('custom-env').env(process.env.NODE_ENV);
const cors = require('cors');
const helmet = require('helmet');
const cookieSession = require('cookie-session');
const compression = require('compression');
const Mailer = require('@techuila/mailer')();
const { SESSION_NAME, DOMAIN, NODE_ENV, DEBUG, DEV_EMAIL } = process.env;

module.exports = class Routes {
  constructor(express, { HOST, cors: _cors }) {
    this.app = express();
    this.express = express;
    this.HOST = HOST;
    this.cors = _cors;

    this.initializeMiddleware();
    // this.initializeRoutes();
  }

  initializeMiddleware() {
    // Cors
    this.app.use(helmet());
    this.app.use(cors(this.cors));
    this.app.use(compression());
    this.app.use(
      cookieSession({
        name: SESSION_NAME,
        domain: DOMAIN,
        secure: ['production', 'development'].includes(NODE_ENV) ? true : false,
        secret: 'asdfasdfasdfsdfsd'
      })
    );

    // BodyparserMiddleware
    this.app.use(this.express.json({ limit: '100mb' }));
    this.app.use(this.express.urlencoded({ limit: '100mb', extended: true }));
  }

  initializeRoutes(...controllers) {
    controllers.forEach((controller) => {
      this.app.use('/' + controller.name, controller.router);
    });

    // Handler for resource not available
    this.app.use(this.handleResourceNotAvailable);
    // Error Handler Catches on "next()"
    this.app.use(this.handleRequestError);
  }

  handleResourceNotAvailable(req, res) {
    res.status(404).json({ message: 'Resource not available' });
  }

  // eslint-disable-next-line no-unused-vars
  handleRequestError(err, req, res, _next) {
    if (DEBUG) console.log(`API Error: ${req.url}\nError: ${err}`);

    let data = {
      success: false,
      type: err.type,
      error: {
        code: 2,
        message: 'An internal error has occurred, please contact technical support.'
      }
    };

    try {
      // If error received is code error, notify developer (only for development and production environments)
      if (typeof err.name !== 'undefined' && err.name !== null && NODE_ENV !== 'localhost') {
        Mailer.ServerError(DEV_EMAIL, { ...err, url: req.url });

        data.error = {
          code: 1,
          message: 'An internal error has occurred, our developers have already been notified.'
        };

        res.status(500).json(data);
      } else {
        // Clear cookie session, if token is expired or invalid
        if ([400, 401].includes(err.code)) req.session = null;

        data.error = {
          message: err.message,
          ...err.details
        };

        // Or else, just send thrown error from Error Exception class
        res.status(err.code).json(data);
      }
    } catch (err) {
      // Return this error if failed to notify developer (mail sending error)

      if (DEBUG) {
        console.log('Error inside try catch block on ErrorHandler js file.');

        data.error = {
          code: 3,
          message: {
            message: err.name,
            type: err.message,
            stack_trace: err.stack
          }
        };
      }

      res.status(500).json(data);
    }
  }
};
