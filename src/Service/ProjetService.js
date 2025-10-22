const db = require("../../db");
const Projet = require("../Model/Projet");

async function findAll() {
  const { rows } = await db.query(`SELECT * from v_desc_projet`);
  return rows;
}
async function listeGenerique(colonne, nomVueOuTable) {
  try {
    const { rows } = await db.query(`SELECT ${colonne} FROM ${nomVueOuTable}`);
    return rows;
  } catch (err) {
    console.error(
      `Erreur lors de la récupération des données de ${nomVueOuTable}:`,
      err
    );
    throw err;
  }
}
async function find_project_by_type_construction(id_type_construction) {
  try {
    const id_type_constructionClean = id_type_construction.trim();
    const sql = `SELECT * FROM v_desc_projet WHERE id_type_construction = $1`;
    const params = [id_type_constructionClean];

    const result = await db.query(sql, params);
    return result.rows;
  } catch (error) {
    console.error(" Erreur lors de la récupération des projets :", error);
    throw error;
  }
}
async function find_type_surface(id_projet) {
  try {
    const id_projet_clean = id_projet.trim();
    const sql = `SELECT * FROM v_surface_projet WHERE id_projet = $1`;
    const params = [id_projet_clean];
    const result = await db.query(sql, params);
    return result.rows;
  } catch (error) {
    console.error(" Erreur lors de la récupération des projets :", error);
    throw error;
  }
}
async function find_project_files(id_projet) {
  try {
    const id_projet_clean = id_projet.trim();
    const sql = `SELECT nom_fichier, chemin_fichier FROM fichier_projet WHERE id_projet = $1`;
    const params = [id_projet_clean];

    const result = await db.query(sql, params);
    return result.rows;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails du projet :",
      error
    );
  }
}
async function find_devis_files(id_projet) {
  try {
    const id_projet_clean = id_projet.trim();
    const sql = `SELECT chemin_fichier 
    FROM fichier_projet fp
    JOIN type_fichier tf ON fp.id_type_fichier = tf.id_type_fichier
    WHERE fp.id_projet = $1
    AND tf.nom_type_fichier = 'xlsx'`;
    const params = [id_projet_clean];
    const result = await db.query(sql, params);
    return result.rows;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails du projet :",
      error
    );
  }
}
//ajout fonction qui prend les projet avec .xlsx
async function find_project_details_by_id(id_project) {
  try {
    const id_project_clean = id_project.trim();
    const sql = `SELECT * FROM v_desc_detail_projet WHERE id_projet = $1`;
    const params = [id_project_clean];

    const result = await db.query(sql, params);
    return result.rows;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails du projet :",
      error
    );
  }
}
const create_project = async (data) => {
  try {
    const {
      nom_projet,
      description,
      id_client,
      id_type_construction,
      total_ht,
      total_ttc,
      date_devis,
      localisation
    } = data;

    const query = `
      INSERT INTO projet (
        nom_projet,
        description,
        id_client,
        id_type_construction,
        total_ht,
        total_ttc,
        date_devis,
        localisation
      ) VALUES ($1, $2, $3, $4, $5, $6, $7 , $8)
      RETURNING *
    `;
    const values = [
      nom_projet,
      description,
      id_client,
      id_type_construction,
      total_ht,
      total_ttc,
      date_devis,
      localisation
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Erreur lors de la création du projet :", error);
    throw error;
  }
};
const add3_surface_projet = async (id_projet, surfaceSHAB, surfaceSHON, surfaceSHOB) => {
  try {
    const query = `
      INSERT INTO surface_projet (id_projet, id_type_surface, surface)
      VALUES 
        ($1, 'TPS0001', $2),
        ($1, 'TPS0002', $3),
        ($1, 'TPS0003', $4)
      RETURNING *;
    `;
    const values = [id_projet, surfaceSHAB, surfaceSHON, surfaceSHOB];
    const result = await db.query(query, values);
    return result.rows; 
  } catch (error) {
    console.error("Erreur lors de l'insertion des surfaces :", error);
    throw error;
  }
};
const create_details_projet = async (data) => {
  try {
    const {
      id_projet,
      nombre_etages,
      surface_totale,
      id_type_surface,
      id_structure,
      id_toiture,
      id_menuiserie,
      id_type_plancher,
      id_fondation,
    } = data;

    const query = `
      INSERT INTO details_projet (
        id_projet,
        nombre_etages,
        surface_totale,
        id_type_surface,
        id_structure,
        id_toiture,
        id_menuiserie,
        id_type_plancher,
        id_fondation
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      id_projet,
      nombre_etages,
      surface_totale,
      id_type_surface,
      id_structure,
      id_toiture,
      id_menuiserie,
      id_type_plancher,
      id_fondation,
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Erreur lors de l’insertion dans details_projet :", error);
    throw error;
  }
};
async function find_max_date_phase_by_projet(id_projet) {
  try {
    const id_projet_clean = id_projet.trim();
    const sql = `
      SELECT TO_CHAR(MAX(date_fin), 'YYYY-MM-DD') AS date_max
FROM projet_phase
WHERE ref_projet = $1

    `;
    const params = [id_projet_clean];

    const result = await db.query(sql, params);
    return result.rows[0]; 
  } catch (error) {
    console.error("Erreur lors de la récupération de la date max :", error);
    throw error;
  }
}
const add_devis_files = async (data) => {
  try {
    const { id_projet, nom_fichier, chemin_fichier } = data;

    const query = `
      INSERT INTO fichier_projet (
        id_projet,
        nom_fichier,
        chemin_fichier,
        id_type_fichier
      ) VALUES ($1, $2, $3,'TFI0001')
      RETURNING *
    `;
    const values = [id_projet, nom_fichier, chemin_fichier];
    const result = await db.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Erreur lors de l’insertion dans details_projet :", error);
    throw error;
  }
};
const add_image_files = async (data) => {
  try {
    const { id_projet, nom_fichier, chemin_fichier } = data;

    const query = `
      INSERT INTO fichier_projet (
        id_projet,
        nom_fichier,
        chemin_fichier,
        id_type_fichier
      ) VALUES ($1, $2, $3,'TFI0002')
      RETURNING *
    `;
    const values = [id_projet, nom_fichier, chemin_fichier];
    const result = await db.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Erreur lors de l’insertion dans details_projet :", error);
    throw error;
  }
};
const create_client = async (data) => {
  const { nom, email, telephone } = data;
  const { rows } = await db.query(
    `INSERT INTO client(nom, email, telephone)
     VALUES($1, $2, $3) RETURNING *`,
    [nom, email, telephone]
  );
  return rows[0];
};
async function getAllProjetPhases() {
  try {
    const sql = `
      SELECT 
        p.ref_projet,
        p.nom_projet,
        ph.id_phase,
        pa.libelle_phase,
        c.nom,
        TO_CHAR(ph.date_debut, 'YYYY-MM-DD') AS date_debut,
        TO_CHAR(ph.date_fin, 'YYYY-MM-DD') AS date_fin,
        TO_CHAR(ph.date_fin_reelle, 'YYYY-MM-DD') AS date_fin_reelle
      FROM projet_phase ph
      JOIN module_projet p ON ph.ref_projet = p.ref_projet
      JOIN client c ON p.id_client = c.id_client
      JOIN phases pa ON ph.id_phase = pa.id_phase
      ORDER BY p.ref_projet, ph.date_debut
    `;
    const result = await db.query(sql);
    return result.rows;
  } catch (error) {
    console.error("Erreur lors de la récupération des projets et phases :", error);
    throw error;
  }
}

module.exports = {
  findAll,
  add3_surface_projet,
  listeGenerique,
  find_project_by_type_construction,
  find_project_files,
  find_project_details_by_id,
  create_project,
  create_details_projet,
  find_type_surface,
  add_devis_files,
  add_image_files,
  create_client,
  find_devis_files,
  find_max_date_phase_by_projet,
  getAllProjetPhases,
};
