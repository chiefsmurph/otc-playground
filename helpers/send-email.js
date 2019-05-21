const gmailSend = require('gmail-send');
const { gmail: credentials, serverName, emails } = require('../config');
// console.log({ credentials })
const send = gmailSend({
  user: credentials.username,
  pass: credentials.password
});


const sendSingle = (subject, body, to = credentials.username) => 
  new Promise((resolve, reject) => {
    subject = `otc-playground: ${subject}`;
    console.log(`sending email...to ${to}...`);
    console.log('subject', subject, 'body', body);
    const monospace = str => `<div style="font-family: monospace"><pre>${str}</pre><pre>sent from ${serverName}</div>`;
    send({
        subject,
        html: monospace(body),
        to
    }, (err, res) => err ? reject(err) : resolve(res));
  });


module.exports = async (subject, body, sendToEveryone) => {
  const emailsToSend = sendToEveryone ? [
    ...emails,
    credentials.username
  ] : [credentials.username];
  console.log({ emailsToSend })
  for (let email of emailsToSend) {
    await sendSingle(subject, body, email);
  }
};


