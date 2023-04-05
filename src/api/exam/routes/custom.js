module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/exam-info/:id',
      handler: 'exam.getExamInfo'
    },
    {
      method: 'GET',
      path: '/exam-result/:id',
      handler: 'exam.examResult'
    },
    {
      method: 'GET',
      path: '/exams-list',
      handler: 'exam.examList'
    }
  ]
}
