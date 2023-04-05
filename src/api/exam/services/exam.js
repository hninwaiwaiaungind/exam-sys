'use strict';

/**
 * exam service
 */

const { createCoreService } = require('@strapi/strapi').factories;
const { errors } = require('@strapi/utils');

module.exports = createCoreService('api::exam.exam', ({ strapi }) => ({
  async getExamInfo(id) {
    const examInfo = await strapi.entityService.findOne(
      "api::exam.exam", id, {
      populate: "questions"
    });
    if (!examInfo) {
      const message = "Exam not found";
      throw new errors.ApplicationError(message);
    }
    const examEndTime = new Date(examInfo.endDte).getTime();
    const currentTime = new Date().getTime();
    if (examEndTime < currentTime) {
      return examInfo;
    } else {
      delete examInfo.questions;
      return examInfo;
    }
  },

  async examResult(examId, ctx) {
    try {
      const examInfo = await strapi.entityService.findOne("api::exam.exam", examId, {
        populate: ["users", "questions"]
      });

      if (!examInfo) {
        const message = "Exam not found";
        return ctx.send({ message: message }, 404);
      }
      const result = [];
      for (const user of examInfo.users) {
        const marks = await strapi.db.query('api::mark.mark').findOne({
          populate: {
            user: true,
            records: {
              populate: {
                exam: {
                  populate: {
                    questions: true
                  }
                }
              }
            }
          },
          where: {
            user: user.id
          }
        });
        const mark = marks.records.filter(record => {
          return record.exam.id === examId
        });
        if (mark.length > 0) {
          const obj = {
            user: user,
            mark: mark
          }
          result.push(obj);
        }
      }
      return result;
    } catch (err) {
      throw new errors.ApplicationError(err);
    }
  }
}));
