const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //1-create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },

    //for Gmail : Activate less secure app option
    //for dev ;  we use MailTrap
  });

  //2-email options
  const mailOptions = {
    from: 'Ali Abdallah <abdall05ali05@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.text,
    // html
  };
  //3-send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
