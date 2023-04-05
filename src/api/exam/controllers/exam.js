'use strict';

/**
 * exam controller
 */
const { orderBy } = require('lodash');
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::exam.exam', ({ strapi }) => ({
  async getExamInfo(ctx) {
    const id = ctx.params.id;
    const entity = await strapi.service("api::exam.exam").getExamInfo(id);
    return entity;
  },

  async examResult(ctx) {
    const id = ctx.params.id;
    const entity = await strapi.service("api::exam.exam").examResult(+id, ctx);
    return entity;
  },

  async examList(ctx) {
    let entity = await strapi.db.query("api::exam.exam").findMany({
    });
    entity = orderBy(entity, [(exam) => {
      if (toConvertDateTime(exam.startDte)
        >= toConvertDateTime(new Date())) {
        return 1;
      } else if (toConvertDateTime(exam.endDte)
        <= toConvertDateTime(new Date())) {
        return -1;
      }
      return 0;
    }], ['desc']);
    const pagination = {
      page: ctx.query.pagination.page,
      pageSize: ctx.query.pagination.pageSize,
      total: entity.length
    }

    entity = entity.map((exam) => {
      let { id, ...attributes } = exam;
      return { id: id, attributes: attributes }
    })
    const sliceExam = entity.splice(ctx.query.pagination.page * ctx.query.pagination.pageSize, ctx.query.pagination.pageSize);
    return {
      data: sliceExam,
      meta: {
        pagination: pagination
      }
    }
  }
}));

function toConvertDateTime(date) {
  const offset = new Date(date).getTimezoneOffset();
  const dateMilli = new Date(new Date(date).getTime() - (offset * 60 * 1000));
  return new Date(dateMilli);
}
