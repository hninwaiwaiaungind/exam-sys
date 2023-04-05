
module.exports = ({ env }) => ({
  email: {
    config: {
      provider: 'sendgrid',
      providerOptions: {
        apiKey: env('SENDGRID_API_KEY'),
      },
      settings: {
        defaultFrom: 'scm.phyothihakyaw@gmail.com',
        defaultReplyTo: 'scm.phyothihakyaw@gmail.com',
        testAddress: 'scm.phyothihakyaw@gmail.com',
      },
    },
  },
});