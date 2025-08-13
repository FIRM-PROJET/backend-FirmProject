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
  if (!to || to.length === 0) {
    console.warn("⚠ Aucun destinataire fourni, email non envoyé.");
    return;
  }

  const mailOptions = {
    from: `"FIRM PROJETS" <${process.env.EMAIL_USER}>`,
    to: to.join(", "),
    subject,
    text,
    html: html || `<p>${text}</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
  }
}

module.exports = { sendEmail };
