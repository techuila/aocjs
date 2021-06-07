module.export = async (Model, values, { options, includes = {}, where }) => {
  // Placed default value here instead on param level | Reason: On param level, it doesn't get the value 'values.id'
  where = where || { id: values.id || -1 };

  if (!Array.isArray(values)) {
    return await Model.findOne({ where, ...includes }).then(async function (obj) {
      if (options == null) options = {};

      // update
      if (obj) {
        // remove properties
        delete options.fields;
        delete options.updateOnDuplicate;

        await obj.update(values, { individualHooks: true, ...options });
        return await Model.findOne({ where, ...includes });
      } else {
        // remove properties
        delete values.id;
        delete values.updateOnDuplicate;

        // insert
        // If include is not empty
        if (Object.keys(includes).length > 0) {
          const result = await Model.create(values, { ...options }).then((resultEntity) =>
            resultEntity.get({ plain: true })
          );
          return await Model.findOne({ where: { id: result.id }, ...includes });
        } else {
          return await Model.create(values, { ...options });
        }
      }
    });
  } else {
    const { updateOnDuplicate } = options;
    return await Model.bulkCreate(values, { updateOnDuplicate });
  }
};
