module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/questions/csv-upload',
      handler: 'question.csvUpload',
    },
    {
      method: 'POST',
      path: '/questions/deleteMany',
      handler: 'question.deleteMany',
    }
  ]
}
