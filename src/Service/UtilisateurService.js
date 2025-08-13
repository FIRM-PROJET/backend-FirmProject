const db = require("../../db");
const bcrypt = require("bcrypt");
const Utilisateur = require("../Model/Utilisateur");

async function findAll() {
  const { rows } = await db.query("SELECT * FROM utilisateur");
  return rows.map((users) => new Utilisateur(users));
}

async function authenticate(email, mot_de_passe) {
  const query = "SELECT * FROM utilisateur WHERE email = $1";
  const values = [email];

  const { rows } = await db.query(query, values);
  const utilisateur = rows[0];

  if (!utilisateur) {
    return null;
  }
  const passwordMatch = await bcrypt.compare(
    mot_de_passe,
    utilisateur.mot_de_passe
  );

  if (!passwordMatch) {
    return null;
  }
  return new Utilisateur(utilisateur);
}

async function checkAncienPassword(matricule, mot_de_passe) {
  const result = await db.query(
    "SELECT mot_de_passe FROM utilisateur WHERE matricule = $1",
    [matricule]
  );
  if (result.rowCount === 0) return false;

  const utilisateur = result.rows[0];
  return await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
}

async function updatePassword(matricule, nouveauMotDePasse) {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(nouveauMotDePasse, saltRounds);

    const result = await db.query(
      `UPDATE utilisateur 
       SET mot_de_passe = $1 
       WHERE matricule = $2 
       RETURNING *`,
      [hashedPassword, matricule]
    );
    if (result.rowCount === 0) {
      throw new Error("Utilisateur introuvable");
    }
    return {
      message: "Mot de passe mis à jour avec succès",
      utilisateur: result.rows[0],
    };
  } catch (err) {
    throw new Error("Erreur lors de la mise à jour : " + err.message);
  }
}

const create = async (data) => {
  const { nom, prenom, email, mot_de_passe, intitule_poste } = data;
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(mot_de_passe, saltRounds);
  const { rows } = await db.query(
    `INSERT INTO utilisateur(nom, prenom, email, mot_de_passe, intitule_poste)
     VALUES($1, $2, $3, $4, $5) RETURNING *`,
    [nom, prenom, email, hashedPassword, intitule_poste]
  );
  return new Utilisateur(rows[0]);
};

async function deleteUser(matricule) {
  try {
    const matriculeClean = matricule.trim();
    const query = `DELETE FROM utilisateur WHERE matricule = '${matriculeClean}' RETURNING *`;
    const result = await db.query(query);
    if (result.rowCount === 0) {
      throw new Error("Utilisateur introuvable");
    }
    return {
      message: "Utilisateur supprimé avec succès",
      utilisateur: result.rows[0],
    };
  } catch (err) {
    throw new Error("Erreur lors de la suppression : " + err.message);
  }
}

// Module access
async function module_user_access(matricule) {
  try {
    const result = await db.query(
      `SELECT * FROM v_module_access_utilisateur WHERE matricule = $1`,
      [matricule]
    );
    return result.rows;
  } catch (err) {
    throw new Error(
      "Erreur lors de la récupération des modules : " + err.message
    );
  }
}
async function get_user_by_email(email) {
  try {
    const result = await db.query(
      `SELECT * FROM utilisateur WHERE email = $1`,
      [email]
    );
    return result.rows;
  } catch (err) {
    throw new Error(
      "Erreur lors de la récupération des modules : " + err.message
    );
  }
}
async function get_user_by_matricule(matricule) {
  try {
    const result = await db.query(
      `SELECT * FROM utilisateur WHERE matricule = $1`,
      [matricule]
    );
    return result.rows;
  } catch (err) {
    throw new Error(
      "Erreur lors de la récupération des modules : " + err.message
    );
  }
}
async function updateUtilisateur(matricule, data) {
  const { nom, prenom, email, intitule_poste } = data;

  try {
    const query = `
      UPDATE utilisateur 
      SET nom = $1, prenom = $2, email = $3, intitule_poste = $4 
      WHERE matricule = $5 
      RETURNING *`;

    const values = [nom, prenom, email, intitule_poste, matricule];
    const result = await db.query(query, values);

    if (result.rowCount === 0) {
      throw new Error("Utilisateur introuvable");
    }

    return {
      message: "Utilisateur mis à jour avec succès",
      utilisateur: result.rows[0],
    };
  } catch (err) {
    throw new Error("Erreur lors de la mise à jour : " + err.message);
  }
}

module.exports = {
  findAll,
  create,
  authenticate,
  updatePassword,
  deleteUser,
  module_user_access,
  updateUtilisateur,
  checkAncienPassword,
  get_user_by_matricule,
  get_user_by_email,
};
