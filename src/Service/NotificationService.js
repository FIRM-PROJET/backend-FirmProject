const db = require("../../db");
const { get_user_by_matricule } = require("./UtilisateurService");
const { sendEmail } = require("./EmailService");
const { getUsersTacheAvecEmails } = require("./TacheService");
const tacheService = require("./TacheService");

const styles = `
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #181835;
      background-color: #f4f6fa;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      border-radius: 8px;
      background-color: #ffffff;
      box-shadow: 0 0 15px rgba(0,0,0,0.1);
      border-top: 5px solid #282850;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .header img {
      max-width: 150px;
      border-radius: 8px;
    }
    h2 {
      color: #282850;
      margin-bottom: 10px;
    }
    p {
      color: #514f84;
      line-height: 1.5;
    }
    blockquote {
      margin: 15px 0;
      padding: 10px 20px;
      background-color: #f0f0f5;
      border-left: 5px solid #282850;
      color: #333;
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: #999;
      text-align: center;
    }
  </style>
`;

// URL du logo / image d'en-tête (Imgur)
const logoURL = "https://i.imgur.com/gsmQY7P.png";

async function notifyNewComment(ref_tache, matriculeAuteur, commentaire) {
  // Récupération de la tâche
  const tache = await tacheService.getTacheByRef(ref_tache);
  const nomTache = tache && tache.nom_tache ? tache.nom_tache : ref_tache;

  // Récupération des utilisateurs liés à la tâche
  const utilisateurs = await getUsersTacheAvecEmails(ref_tache);
  const emails = utilisateurs.map((u) => u.email);

  // Auteur du commentaire
  const auteur =
    utilisateurs.find((u) => u.matricule === matriculeAuteur)?.nom ||
    "Un utilisateur";

  const subject = `Nouveau commentaire sur la tâche : ${nomTache} (ref: ${ref_tache})`;
  const text = `${auteur} a ajouté un commentaire :\n\n"${commentaire}"`;
  const html = `
    ${styles}
    <div class="container">
      <div class="header">
        <img src="${logoURL}" alt="Notification Tâche" />
      </div>
      <h2>Nouveau commentaire sur la tâche ${nomTache}</h2>
      <p><strong>${auteur}</strong> a ajouté un commentaire :</p>
      <blockquote>${commentaire}</blockquote>
      <p class="footer">Notification automatique - Ne pas répondre à ce mail</p>
      <p class="footer">&copy; ${new Date().getFullYear()} Firm Project - Tous droits réservés</p>
    </div>
  `;

  await sendEmail(emails, subject, text, html);
}

async function notifyAssignmentTache(ref_tache, titre, matricule) {
  const utilisateurs = await get_user_by_matricule(matricule);
  if (!utilisateurs || !utilisateurs.length === 0) {
    console.warn("⚠ Aucun utilisateur trouvé");
    return;
  }
  const utilisateur = utilisateurs[0];
  if (!utilisateur.email) {
    console.warn("⚠ Utilisateur trouvé mais email vide");
    return;
  }
  const subject = `Vous êtes assigné à la tâche : ${titre}`;
  const text = `Vous avez été assigné à la tâche "${titre}" (ref: ${ref_tache}).`;
  const html = `
    ${styles}
    <div class="container">
      <div class="header">
        <img src="${logoURL}" alt="Notification Tâche" />
      </div>
      <h2>Vous êtes assigné à une tâche</h2>
      <p>Bonjour ${utilisateur.nom},</p>
      <p>Vous avez été assigné à la tâche suivante :</p>
      <p><strong>${titre}</strong> (ref: <strong>${ref_tache}</strong>)</p>
      <p>Merci de prendre connaissance de cette tâche et de la suivre.</p>
      <p class="footer">Notification automatique - Ne pas répondre à ce mail</p>
      <p class="footer">&copy; ${new Date().getFullYear()} Firm Project - Tous droits réservés</p>
    </div>
  `;

  await sendEmail([utilisateur.email], subject, text, html);
}

async function addNotification(id_utilisateur, message, expire_at = null) {
  try {
    const query = `
      INSERT INTO notifications (id_utilisateur, message, expire_at)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [id_utilisateur, message, expire_at];
    const result = await db.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}
async function getNotificationsByUser(matricule) {
  try {
    const result = await db.query(
      `SELECT id, message, date_creation, expire_at
       FROM notifications
       WHERE id_utilisateur = $1
       ORDER BY date_creation DESC`,
      [matricule]
    );
    return result.rows;
  } catch (err) {
    console.error("Erreur récupération notifications :", err);
    throw err;
  }
}
module.exports = { notifyNewComment, notifyAssignmentTache ,addNotification , getNotificationsByUser };
