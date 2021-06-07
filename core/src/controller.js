const express = require('express');
const { Op } = require('sequelize');
const { Upsert, ExistingHandler } = require('./helper');

module.exports = class Controller {
  name = '';
  router = express.Router();

  constructor(model, includes = {}, options = {}) {
    this.model = model;
    this.includes = includes;
    this.options = options;
  }

  /**
   * Default functions relative to its method is assigned on config/controllers
   * @function list : GET
   * @function show: GET
   * @function create : POST
   * @function update : PUT
   * @function setStatus : PUT
   * @function delete : DELETE
   *
   * Incase you are wondering why I'm using arrow functions instead of normal func, it's for the context binding. Context will be lost if passed on RouteGuard if you're not binding the context.
   */

  setupRouter() {}

  async show({ id }) {
    return await this.model.findOne({ where: { id } });
  }

  async list(_, [{ query }]) {
    // Pagination variables
    let offset;
    let page = parseInt(query.page) || undefined;
    let limit = parseInt(query.size) || undefined;

    // Search properties
    const search = query.search || '';
    const searchProperties = Array.isArray(query.props)
      ? query.props.reduce((a, property) => {
          if (!a[Op.or]) a[Op.or] = [];
          a[Op.or].push({ [property]: { [Op.like]: `%${search}%` } });

          return a;
        }, {})
      : undefined;
    const options = Array.isArray(query.props) ? { where: searchProperties } : {};

    if (page) {
      limit = limit || 10;
      offset = (page - 1) * limit;
    }

    const { count: total_items, rows: data } = await this.model.findAndCountAll({
      ...this.includes,
      limit,
      offset,
      ...options
    });
    const pagination = page
      ? {
          total_items,
          total_pages: total_items / limit,
          per_page: limit
        }
      : {};

    return {
      data,
      ...pagination
    };
  }

  async create(payload) {
    const [err] = await ExistingHandler.init(this.model, { name: payload.name });
    if (err) throw err;

    return await Upsert.init(this.model, payload, { includes: this.includes, options: this.options });
  }

  async update({ id }, payload) {
    const [err] = await ExistingHandler.init(this.model, { name: payload.name }, { id });
    if (err) throw err;

    return await Upsert.init(this.model, Object.assign(payload, { id }), {
      includes: this.includes,
      options: this.options
    });
  }

  async delete({ ids }) {
    return await !!this.model.destroy({ where: { id: ids } });
  }

  async setStatus({ property }, payload) {
    return await this.model.bulkCreate(payload, { updateOnDuplicate: [property] });
  }

  /**
   * This is a catch wrapper/guard to lessen code on wrapping try and catch block on
   * every method on a controller
   */

  wrapTryCatch(fn) {
    fn = fn.bind(this);

    return (req, res, next) => {
      const payload = req.route.path.includes(':')
        ? [req.params, req.body, [req, res, next]]
        : [req.body, [req, res, next]];

      /**
       * @IMPORTANT
       * When sending files, always send in by stream or binary via res.send!
       * res.sendFile won't catch the status of 'res.headersSent', resulting in to a double send from the res.sendFile and res.send from this wrapper.
       */

      fn(...payload)
        .then((data) => {
          // Only send if headers are not sent (Case only happens when trying to send files to the client)
          if (!res.headersSent) res.json(data);
        })
        .catch(next);
    };
  }
};
