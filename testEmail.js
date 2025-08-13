require("dotenv").config(); // pour charger EMAIL_USER et EMAIL_PASS

const { sendEmail } = require("./src/Service/EmailService");

(async () => {
  try {
    await sendEmail(
      ["be@firmarchi.com"], 
      "Test Nodemailer Gmail",
      "Ceci est un test depuis mon compte Gmail dédié.",
      "<b>Ceci est un test depuis mon compte Gmail dédié.</b>"
    );
    console.log("✅ Email envoyé !");
  } catch (err) {
    console.error("❌ Erreur d'envoi :", err);
  }
})();
