// path: src/extensions/users-permissions/strapi-server.js
const _ = require("lodash");
const path = require("path");
const fs = require("fs");
const moment = require("moment");

module.exports = (plugin) => {
  const sanitizeOutput = (user) => {
    const {
      password,
      ...sanitizedUser
    } = user;
    return sanitizedUser;
  };

  plugin.controllers.user.me = async (ctx) => {
    if (!ctx.state.user) {
      return ctx.unauthorized();
    }
    const user = await strapi.entityService.findOne(
      "plugin::users-permissions.user",
      ctx.state.user.id,
      {
        populate: ["role", "exam", "mark", "question"]
      }
    );
    ctx.body = sanitizeOutput(user);
  };

  plugin.controllers.user.findOne = async (ctx) => {
    const { id } = ctx.params;

    const user = await strapi.entityService.findOne(
      "plugin::users-permissions.user",
      id,
      {
        populate: ["role", "exam", "mark", "question"]
      }
    );
    ctx.body = sanitizeOutput(user);
  };

  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/csv-useradd",
    handler: "user.createCSVUserAdd"
  });

  plugin.controllers.user.createCSVUserAdd = async (ctx) => {
    const errUsername = [];
    const errEmail = [];
    const csvList = ctx.request.body;

    await Promise.all(
      _.map(csvList, async (req) => {
        const existingEmail = await strapi.db.query('plugin::users-permissions.user')
          .findOne({ where: { email: req.email } });
        const existingUser = await strapi.db.query('plugin::users-permissions.user')
          .findOne({ where: { username: req.username } });

        if (existingEmail) {
          errEmail.push(req);
        }
        if (existingUser) {
          errUsername.push(req);
        }
      })
    );

    if (errEmail.length === 0 && errUsername.length === 0) {
      await Promise.all(
        _.map(csvList, async (req) => {
          let user = {
            data: {
              username: req.username,
              email: req.email,
              password: 'exam$ys2023',
              provider: 'local',
              role: req.role,
            },
          };
          await strapi.entityService.create("plugin::users-permissions.user", user);
        })
      );
      ctx.send({
        message: "success"
      }, 200);
    } else {
      ctx.send({
        message: "Username or email is already in use",
        errorEmail: errEmail,
        errorUsername: errUsername,
      }, 400);
    }
  };

  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/email",
    handler: "user.sendEmail"
  });

  plugin.controllers.user.sendEmail = async (ctx) => {
    const templatePath = path.join(
      __dirname,
      "..", "..", "..",
      "config",
      "custom-email-template.html"
    );
    const { id, examId } = ctx.request.body;
    let duration;
    const markDetails = await getMark(id);
    if (!markDetails) {
      return ctx.send({ message: "No user or mark found with given id" }, 404);
    }
    const examResults = markDetails.records.find((records) => records.exam.id === examId);
    if (!examResults) {
      return ctx.send({ message: "No exam results found" }, 404);
    }
    const user = {
      username: markDetails.user.username,
      email: markDetails.user.email
    };
    const ansStartDte = new Date(examResults.ansStartDte).getTime();
    const ansEndDte = new Date(examResults.ansEndDte).getTime();
    const timeDiff = ansEndDte - ansStartDte;
    const seconds = Math.floor((timeDiff / 1000) % 60);
    const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
    const hours = Math.floor(timeDiff / (1000 * 60 * 60)) % 60;
    const hourSuffix = hours === 1 ? 'hr' : 'hrs';
    const minuteSuffix = minutes === 1 ? 'min' : 'mins';
    if (hours) {
      duration = `${hours} ${hourSuffix}  ${minutes} ${minuteSuffix} ${seconds} secs`;
    } else if (minutes) {
      duration = `${minutes} ${minuteSuffix} ${seconds} secs`;
    } else {
      duration = `${seconds} secs`;
    }
    const exam = {
      name: examResults.exam.name,
      startDate: examResults.ansStartDte,
      endDate: examResults.ansEndDte,
      duration: duration,
      totalQuestions: examResults.exam.questions.length,
      totalMarks: examResults.mark,
      grade: calculatingGrade(examResults.mark, examResults.exam.passMark)
    };
    exam.startDate = moment(exam.startDate).format("MMM DD, YYYY, hh:mm A");
    exam.endDate = moment(exam.endDate).format("MMM DD, YYYY, hh:mm A");

    function readHTMLFile(filePath) {
      return fs.readFileSync(filePath, "utf8");
    }

    const emailTemplate = {
      subject: `(<%= exam.name %>) Exam Result`,
      text: `Welcome to Exam System!`,
      html: readHTMLFile(templatePath)
    };
    try {
      await strapi.plugins['email'].services.email.sendTemplatedEmail(
        {
          to: markDetails.user.email
        },
        emailTemplate,
        {
          user: user,
          exam: exam
        }
      );
      ctx.send({ message: 'Email sent successfully' }, 200);
    } catch (err) {
      let status = err.code;
      let message = err.message;
      ctx.throw(status ?? 400, { message: message ?? 'Email not sent' });
    }
  };

  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/answer-submit",
    handler: "user.submitAnswer",
  });

  plugin.controllers.user.submitAnswer = async (ctx) => {
    let examId;
    let userId = ctx.request.body.id;
    try {
      let { id: userId, data: examData, ansStartDte } = ctx.request.body;
      if (typeof examData === 'string') {
        examData = JSON.parse(examData.replace(/'/g, '"'));
      }
      let { question: ansResult } = examData;
      examId = parseInt(examData.examId);
      let user = await strapi.db.query("plugin::users-permissions.user").findOne({
        select: ['ansRecord'],
        where: { id: userId }
      });
      if (!user) {
        ctx.throw(404, "User does not exist with the given id");
      }
      let ansRecord = user.ansRecord;
      if (ansRecord) {
        ansRecord = ansRecord.data;
        if (typeof ansRecord === "string") {
          ansRecord = JSON.parse(ansRecord.replace(/'/g, '"'));
        }
        ansRecord.findIndex((record) => {
          if (record.examId === examId) {
            ctx.throw(400, "You have already submitted your answer for this exam");
          } else {
            ansRecord.push(examData);
          }
        })
      }
      const exam = await strapi.db.query("api::exam.exam").findOne({ where: { id: examId } });
      if (!exam) {
        ctx.throw(404, "No exam found with the given id");
      }
      await strapi.db.query("plugin::users-permissions.user").update({
        data: { ansRecord: { "data": ansRecord ? ansRecord : [examData] }, exams: examId },
        where: { id: userId }
      });
      const marks = await calculatingMark(examId, ansResult);
      const newRecord = await registerMarks(examId, userId, marks, ansStartDte);
      if (newRecord) {
       ctx.send({ message: "Your answers are submitted", newRecordDetails: newRecord.records.pop() }, 200);
      }
    } catch (error) {
      await fallbackAnsRecord(userId, examId);
      const status = error.status ?? 500;
      ctx.throw(status, error.message);
    }
  }
  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/pdfdownload",
    handler: "user.pdfdownload",
  });

  plugin.controllers.user.pdfdownload = async (ctx) => {
    try {
      const { id, examId } = ctx.request.body;
      const markDetails = await getMark(id);
      if (!markDetails) {
        return ctx.send({ message: "No user or mark found with given id" }, 404);
      }
      const user = {
        username: markDetails.user.username,
        email: markDetails.user.email
      }
      const examResults = markDetails.records.filter(record => {
        return record.exam.id === examId;
      })[0];
      if (examResults) {
        const ansStartDte = new Date(examResults.ansStartDte).getTime();
        const ansEndDte = new Date(examResults.ansEndDte).getTime();
        const diffTime = ansEndDte - ansStartDte;
        const seconds = Math.floor(diffTime / 1000) % 60;
        const minutes = Math.floor(diffTime / (1000 * 60)) % 60;
        const hours = Math.floor(diffTime / (1000 * 60 * 60)) % 60;
        const hourSuffix = hours === 1 ? 'hr' : 'hrs';
        const minuteSuffix = minutes === 1 ? 'min' : 'mins';
        if (hours) {
          duration = `${hours} ${hourSuffix}  ${minutes} ${minuteSuffix} ${seconds} secs`;
        } else if (minutes) {
          duration = `${minutes} ${minuteSuffix} ${seconds} secs`;
        } else {
          duration = `${seconds} secs`;
        }

        const exam = {
          name: examResults.exam.name,
          startDate: ansStartDte,
          endDate: ansEndDte,
          duration: duration,
          totalQuestions: examResults.exam.questions.length,
          totalMarks: examResults.mark,
          grade: calculatingGrade(examResults.mark, examResults.exam.passMark)
        }
        const examResultsForUser = {
          ...user,
          ...exam
        }
        return examResultsForUser;
      } else {
        return ctx.send({ message: "No exam results found" }, 404);
      }
    }
    catch (err) {
      let status = err.code;
      let message = err.message;
      ctx.throw(status ?? 400, { message: message ?? 'Invalid info' });
    }
  }
  return plugin;
};


async function calculatingMark(examId, ansResult) {
  let mark = 0;
  const exam = await strapi.db.query("api::exam.exam").findOne({
    where: { id: examId },
    populate: { questions: true }
  });

  const questionList = exam.questions;
  const totalMark = 100;
  const markPerQuestion = totalMark / questionList.length;
  ansResult.forEach((ans) => {
    const { questionId, answer } = ans;
    const normalizedAnswer = Array.isArray(answer) ? answer.join(',') : answer ? answer.toString() : null;

    const isCorrect = questionList.some(correctQuestion => {
      const { id, correctAns, questionType } = correctQuestion;
      if (questionType !== 'radio') {
        return questionId === id && correctAns.toLowerCase().trim().includes(normalizedAnswer?.toLowerCase().trim());
      } else {
        return questionId === id && normalizedAnswer === correctAns;
      }
    });
    if (isCorrect) {
      mark += markPerQuestion;
    }
  })
  return Math.floor(mark);
}

async function registerMarks(examId, userId, marks, ansStartDte) {
  const markRecord = await strapi.db.query("api::mark.mark").findOne({
    where: { user: userId },
    populate: {
      records: {
        populate: {
          exam: true
        }
      }, user: true
    }
  });

  if (markRecord) {
    const newRecord = {
      exam: examId,
      mark: marks,
      ansStartDte: new Date(ansStartDte),
      ansEndDte: new Date()
    };
    markRecord.records.push(newRecord);

    return await strapi.entityService.update('api::mark.mark', markRecord.id, {
      data: {
        records: markRecord.records,
        publishedAt: new Date()
      },
      populate: { records: true }
    });
  } else {
    const markSchema = {
      user: userId,
      records: [{
        exam: examId,
        mark: marks,
        ansStartDte: new Date(ansStartDte),
        ansEndDte: new Date()
      }],
      publishedAt: new Date()
    }
    return strapi.entityService.create('api::mark.mark', {
      data: markSchema,
      populate: { records: true }
    });
  }
}
async function getMark(id) {
  const markDetails = await strapi.db.query("api::mark.mark").findOne({
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
      user: id
    }
  });
  return markDetails;
}

function calculatingGrade(mark, passMark) {
  if (mark >= passMark) {
    return 'Passed';
  } else {
    return 'Failed';
  }
}

async function fallbackAnsRecord(userId, examId) {
   const user = await strapi.db.query("plugin::users-permissions.user").findOne({
    select: ['ansRecord'],
    where: { id: userId }
   });
   if (user) {
    let ansRecord = user.ansRecord;
    if (ansRecord) {
      if (typeof ansRecord === "string") {
        ansRecord = JSON.parse(ansRecord.replace(/'/g, '"'));
      }
      const isExistingRecord = ansRecord.data.filter(record => record.examId === examId);
      if (isExistingRecord.length > 0) {
        const index = ansRecord.data.indexOf(isExistingRecord[0]);
        ansRecord.data.splice(index, 1);
        if (ansRecord.data.length === 0) {
          ansRecord = null;
        }
      }
      await strapi.db.query("plugin::users-permissions.user").update({
        data: { ansRecord: ansRecord },
        where: { id: userId }
      });
    }
   }
}
