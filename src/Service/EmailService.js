// services/emailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
  tls: {
    rejectUnauthorized: false, 
  },
});

async function sendEmail(to, subject, text, html) {
  if (!to || to.length === 0) return;

  const mailOptions = {
    from: `"App Tâches" <${process.env.EMAIL_USER}>`,
    to: to.join(", "),
    subject,
    text,
    html: html || `<p>${text}</p>`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendEmail };
