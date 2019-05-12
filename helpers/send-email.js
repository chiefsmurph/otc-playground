const gmailSend = require('gmail-send');
const { gmail: credentials } = require('../config');

const send = gmailSend({
  user: credentials.username,
  pass: credentials.password
});

module.exports = (subject, body, to = credentials.username) => new Promise((resolve, reject) => {
  subject = `otc-playground: ${subject}`;
  console.log(`sending email...to ${to}...`);
  console.log('subject', subject, 'body', body);
  const monospace = str => `<div style="font-family: monospace">${str}</div>`;
  send({
      subject,
      html: monospace(body),
      to
  }, (err, res) => err ? reject(err) : resolve(res));
});
