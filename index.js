const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const kue = require('kue');
const queue = kue.createQueue();


const transport = nodemailer.createTransport(sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY
    }
  }));
  
  const sendEmail = (email, subject, html) => {
    const mailOptions = {
      from: 'sender@example.com',
      to: email,
      subject,
      html
    };
  
    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(`Email sent to ${email}: ${info.response}`);
      }
    });
  };
  
  const addEmailJob = (email, subject, html) => {
    const job = queue.create('email', {
      email,
      subject,
      html
    })
      .save((error) => {
        if (error) {
          console.error(error);
        } else {
          console.log(`Email job added to queue: ${email}`);
  }
  });
  };

  const emailList = [
    { email: 'recipient1@example.com', subject: 'Test email 1', html: '<p>This is a test email 1</p>' },
    { email: 'recipient2@example.com', subject: 'Test email 2', html: '<p>This is a test email 2</p>' },
];

emailList.forEach((emailData) => {
    addEmailJob(emailData.email, emailData.subject, emailData.html);
});

queue.process('email', (job, done) => {
    sendEmail(job.data.email, job.data.subject, job.data.html);
    done();
});