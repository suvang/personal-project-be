const nodemailer = require("nodemailer");

const sendMail = (user, link, type) => {
  let message = "";
  let subjectText = "";

  if (type === "email") {
    subjectText = "Verify email";
    message = "Click on the link to verify your account on xplodivity";
  }

  if (type === "password") {
    subjectText = "Reset password";
    message = "Click on the link to reset your password";
  }

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
    subject: subjectText,
    text: `${message}: ${link}`,
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
