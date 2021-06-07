const { describe, it } = require('mocha');
const { expect } = require('chai');
const request = require('supertest');
const { Server, Controller, Helper } = require('../src');

const { AlreadyExistsError } = Helper.ErrorException;

class UserController extends Controller {
  constructor() {
    super();
    this.name = 'users';
    this.setupRouter();
  }

  setupRouter() {
    this.router.get('/', this.wrapTryCatch(this.getUser));
    this.router.post('/', this.wrapTryCatch(this.createUser));
  }

  async getUser() {
    const result = 'GET USER';

    return result;
  }

  async createUser(payload) {
    const ids = [1, 2, 3];

    if (ids.some((userId) => userId === payload.id)) {
      throw new AlreadyExistsError(undefined);
    }

    return 'Successfully created a user';
  }
}

const app = new Server({});

app.initializeRoutes(new UserController());
app.start();

// test
describe('GET /user', () => {
  it('should return "GET USER"', (done) => {
    request(app.app)
      .get('/users')
      .then((res) => {
        expect(res.statusCode).to.equals(200);
        expect(res.body).to.equals('GET USER');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('POST /user', () => {
  it('should return 200 | success', (done) => {
    request(app.app)
      .post('/users')
      .send({ id: 5 })
      .then((res) => {
        expect(res.statusCode).to.equals(200);
        expect(res.body).to.equals('Successfully created a user');
        done();
      })
      .catch((err) => done(err));
  });

  it('should return 409 | Already Exists Error', (done) => {
    request(app.app)
      .post('/users')
      .send({ id: 1 })
      .then((res) => {
        console.log(res.body);
        expect(res.statusCode).to.equals(409);
        expect(res.body.error.message).to.equals('Already Exists Error');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('PUT /user', () => {
  it('should return a 404 status code | Resource not found"', (done) => {
    request(app.app)
      .put('/users')
      .then((res) => {
        expect(res.statusCode).to.equals(404);
        expect(res.body.message).to.equals('Resource not available');
        done();
      })
      .catch((err) => done(err));
  });
});
