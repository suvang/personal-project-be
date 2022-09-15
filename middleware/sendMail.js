const nodemailer = require("nodemailer");

const sendMail = (user, link) => {
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
    subject: "Reset password",
    text: `Click on the link to reset your password ${link}`,
  };

  // Step 3
  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      return log("Error occurs");
    }
    return log("Email sent!!!");
  });
};

module.exports = sendMail;
