
const db = require("../../db");
const { get } = require("../Routes/UtilisateurRoute");

const new_commentaire = async ({
  matricule,
  commentaire,
  ref_tache = null,
  ref_sous_tache = null,
}) => {
  const query = `
    INSERT INTO commentaires (matricule, commentaire, ref_tache, ref_sous_tache)
    VALUES ($1, $2, $3, $4)
  `;
  await db.query(query, [matricule, commentaire, ref_tache, ref_sous_tache]);
};
const getCommentairesParTache = async (ref_tache) => {
  const query = `
    SELECT c.*, u.nom , u.prenom
    FROM commentaires c
    JOIN utilisateur u ON c.matricule = u.matricule
    WHERE c.ref_tache = $1
  `;
  const result = await db.query(query, [ref_tache]);
  return result.rows;
};

const getCommentairesParSousTache = async (ref_sous_tache) => {
  const query = `
    SELECT c.*, u.nom , u.prenom
    FROM commentaires c
    JOIN utilisateur u ON c.matricule = u.matricule
    WHERE c.ref_sous_tache = $1
  `;
  const result = await db.query(query, [ref_sous_tache]);
  return result.rows;
};

module.exports = {
  new_commentaire,
  getCommentairesParTache,
  getCommentairesParSousTache
};

