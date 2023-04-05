'use strict';

/**
 * question controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::question.question', ({ strapi }) => ({

  async csvUpload(ctx) {
    const { body: questions } = ctx.request;
    let successQuestionList = [];
    let errorQuestionList = [];
    let index = [];

    try {
      await Promise.all(questions.map(async (question) => {
        for (let key in question) {
          if (question[key].length === 0) {
            const index = errorQuestionList.indexOf(question);
            if (index === -1) {
              errorQuestionList.push(question);
            }
          }
        }
      }));
      if (errorQuestionList.length === 0) {
        try {
          successQuestionList = await Promise.all(
            questions.map((question) =>
              strapi.entityService.create('api::question.question', {
                data: {
                  ...question,
                  publishedAt: new Date(),
                },
              }),
            ),
          );
        } catch (error) {
          errorQuestionList = questions;
        }
      }
      if (errorQuestionList.length > 0) {
        errorQuestionList.forEach((errorQuestion) => {
          index.push(questions.indexOf(errorQuestion) + 2);
        });
        ctx.send({
          message: "Invalid data or value in csv file at row: " + index.join(","),
          errorQuestions: errorQuestionList
        }, 400)
      } else {
        ctx.send({
          message: "Questions created successfully",
          createdQuestions: successQuestionList
        }, 200);
      }
    } catch (error) {
      return ctx.throw(500, "Unable to create questions.", error);
    }
  },

  async deleteMany(ctx) {
    const { body: id } = ctx.request;
    try {
      await strapi.entityService.deleteMany('api::question.question', {
        filters: { id: id }
      });
      ctx.send({
        message: "Questions fallback successful"
      })
    } catch (error) {
      return ctx.throw(500, "Unable to fallback questions.", error);
    }
  }
}));
