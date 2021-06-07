/* eslint-disable no-extra-boolean-cast */
const { Op } = require('sequelize');
const { AlreadyExistsError } = require('./ErrorException');

/**
 * @FUNCTIONS
 * @Validation
 * @desc
 * Arguements:
 * 1. Database model : sequelize model
 * 2. p_where condition (Columns that should be unique) : Object
 */

module.exports = async (model, p_where, separate_condition) => {
  if (isValid(p_where)) {
    let sc = {};

    // Arrange object to Add Or condition on query
    const c_where = Object.entries(p_where).reduce((a, b) => {
      if (!a[Op.or]) a[Op.or] = [];
      a[Op.or].push({ [b[0]]: b[1] });

      return a;
    }, {});

    // Check if there is id property on separate_condition,
    if (!!separate_condition) {
      const { id, isCopy, ...rest } = separate_condition;
      const tmp = !!id ? { id: { [Op.not]: id } } : {};
      const tmp2 = !!isCopy ? { isCopy: { [Op.not]: isCopy } } : {};
      sc = { ...rest, ...tmp, ...tmp2 };
    }

    // Query result if condition exists
    const where = Object.assign(c_where, sc);
    const result = await model.findOne({ where });

    if (result) {
      for (const property in p_where) {
        // Validate if result query is equals to the value of the passed object's property (p_where)
        if (result[property].toLowerCase().trim() === p_where[property].toLowerCase().trim())
          return [
            new AlreadyExistsError(`${property} already exists!`, {
              property,
              name: result[property]
            })
          ];
      }
    }
  }

  return [null];
};

function isValid(p_where) {
  return Object.values(p_where).every((e) => typeof e !== 'undefined' && typeof e !== 'undefined');
}
