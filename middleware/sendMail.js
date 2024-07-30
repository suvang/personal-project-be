const nodemailer = require("nodemailer");

const sendMail = (user, content) => {
  const log = console.log;

  // Step 1
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL, // TODO: your gmail account
      pass: process.env.PASSWORD, // TODO: your gmail password
    },
  });

  // Step 2
  let mailOptions = {
    from: "xplodivity.mail@gmail.com", // TODO: email sender
    to: `${user.email}`, // TODO: email receiver
    subject: content.subjectText,
    text: content.message,
  };

  // Step 3
  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      console.log("err", err);
      return log("Error occurs");
    }
    return log("Email sent!!!");
  });
};

module.exports = sendMail;
