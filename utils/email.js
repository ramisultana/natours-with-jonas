// const nodemailer = require('nodemailer');

// //nodemailer is a service send emails using nodejs
// //we use it in authController.js
// const sendEmail = async (options) => {
//   // 1) creat a transporter

//   const transporter = nodemailer.createTransport({
//     //mailtrap.io fake sending email
//     //https://mailtrap.io/inboxes/2335475/messages //
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   //2) Defune the email options
//   const mailOptions = {
//     from: 'jonas Schmedtmann <hello@jonas.io>',
//     to: options.email, // options is the argument above
//     subject: options.subject,
//     text: options.message,
//     //html:
//   };
//   //3) actually send the email
//   await transporter.sendMail(mailOptions);
// };
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `jonas Schmedtmann <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'Brevo',
        auth: {
          user: 'rami_sagesse80@hotmail.com',
          pass: 'AakBwgrG0bF8c59p',
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'welcome to natours family');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'you password reset token (valid for 10 minutes'
    );
  }
};
//module.exports = sendEmail;
