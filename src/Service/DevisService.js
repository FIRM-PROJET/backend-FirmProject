const db = require("../../db");

// Génère automatiquement un code_fiche
const generateNextCodeFiche = async () => {
  const currentYear = new Date().getFullYear();
  const query = `
    SELECT MAX(code_fiche) AS last_code
    FROM fiche_estimation_devis
    WHERE code_fiche ~ '^EST-${currentYear}-[0-9]+$'
  `;

  const { rows } = await db.query(query);
  const lastCode = rows[0].last_code;

  if (!lastCode) {
    return `EST-${currentYear}-0001`;
  }
  const lastNumber = parseInt(lastCode.split("-")[2], 10);
  const nextNumber = lastNumber + 1;
  return `EST-${currentYear}-${nextNumber.toString().padStart(4, "0")}`;
};

const getNextVersion = async (code_fiche) => {
  const query = `SELECT MAX(version) AS max_version FROM fiche_estimation_devis WHERE code_fiche = $1`;
  const { rows } = await db.query(query, [code_fiche]);
  const current = rows[0].max_version ? parseInt(rows[0].max_version, 10) : 0;
  return current + 1;
};
const add_fiche_estimation_devis = async (data) => {
  let code_fiche = data.code_fiche;

  // Si pas de code_fiche fourni, on en génère un
  if (!code_fiche) {
    code_fiche = await generateNextCodeFiche();
  }
  // Récupérer la version appropriée
  const version = await getNextVersion(code_fiche);

  const query = `
    INSERT INTO fiche_estimation_devis (
      code_fiche,
      version,
      nom_devis,
      nom_maitre_ouvrage,
      date_creation,
      type_surface,
      surface_totale,
      surface_moyenne,
      cours_ariary,
      projet_referrent
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10)
    RETURNING *;
  `;

  const values = [
    code_fiche,
    version,
    data.nom_devis,
    data.nom_maitre_ouvrage,
    data.date_creation,
    data.type_surface,
    data.surface_totale,
    data.surface_moyenne,
    data.cours_ariary,
    data.projet_referrent
  ];

  const { rows } = await db.query(query, values);
  return rows[0];
};
const insertMontantTravauxStandard = async ({
  id_fiche_estimation,
  id_travaux,
  montant_travaux,
}) => {
  const query = `
    INSERT INTO montant_travaux_devis (id_fiche_estimation, id_travaux, montant_travaux)
    VALUES ($1, $2, $3)
  `;
  await db.query(query, [id_fiche_estimation, id_travaux, montant_travaux]);
};

const insertTravauxCustom = async ({
  id_fiche_estimation,
  nom_travaux_custom,
  montant_travaux_custom,
}) => {
  const query = `
    INSERT INTO travaux_custom_devis (id_fiche_estimation, nom_travaux_custom, montant_travaux_custom)
    VALUES ($1, $2, $3)
  `;
  await db.query(query, [
    id_fiche_estimation,
    nom_travaux_custom,
    montant_travaux_custom,
  ]);
};
const getVueDevisComplet = async (id) => {
  const query = `
    SELECT * 
    FROM v_details_estimation_devis 
    WHERE id_fiche_estimation = $1
    ORDER BY date_creation DESC
  `;
  const { rows } = await db.query(query, [id]);
  return rows;
};
const getPreviousProjetReferrent = async (codeFiche) => {
  const query = `
    SELECT projet_referrent 
    FROM fiche_estimation_devis 
    WHERE code_fiche = $1 AND version = 1
  `;
  const result = await db.query(query, [codeFiche]);

  if (result.rows.length === 0) return null;

  return result.rows[0].projet_referrent;
};

async function delete_fiche_validation(id_fiche) {
  try {
    await db.query(
      'DELETE FROM travaux_custom_devis WHERE id_fiche_estimation = $1',
      [id_fiche]
    );
    await db.query(
      'DELETE FROM montant_travaux_devis WHERE id_fiche_estimation = $1',
      [id_fiche]
    );
    const { rows } = await db.query(
      'DELETE FROM fiche_estimation_devis WHERE id_fiche_estimation = $1 RETURNING *',
      [id_fiche]
    );
    return rows[0];
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
}
async function delete_projet(id_projet) {
  try {
    // Supprimer les dépendances
    await db.query(
      "DELETE FROM details_projet WHERE id_projet = $1",
      [id_projet]
    );

    await db.query(
      "DELETE FROM fichier_projet WHERE id_projet = $1",
      [id_projet]
    );

    await db.query(
      "DELETE FROM surface_projet WHERE id_projet = $1",
      [id_projet]
    );

    // Supprimer le projet et retourner la ligne supprimée
    const { rows } = await db.query(
      "DELETE FROM projet WHERE id_projet = $1 RETURNING *",
      [id_projet]
    );
    return rows[0];
  } catch (error) {
    // Annuler si erreur
    await db.query("ROLLBACK");
    throw error;
  }
}


module.exports = {
  add_fiche_estimation_devis,
  insertTravauxCustom,
  insertMontantTravauxStandard,
  getVueDevisComplet,
  delete_projet,
  delete_fiche_validation,getPreviousProjetReferrent
};
