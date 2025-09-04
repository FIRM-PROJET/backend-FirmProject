const db = require("../../db");

// Ajouter un projet
const add_new_project = async (data) => {
  const query = `
    INSERT INTO module_projet (
      nom_projet, description, id_client
    ) VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [data.nom_projet, data.description, data.id_client];
  const { rows } = await db.query(query, values);
  return rows[0];
};

// Ajouter une phase à un projet
const add_project_phase = async (data) => {
  const query = `
    INSERT INTO projet_phase (
      ref_projet, id_phase, date_debut, date_fin
    ) VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [data.ref_projet, data.id_phase, data.date_debut, data.date_fin];
  const { rows } = await db.query(query, values);
  return rows[0];
};

// Associer un utilisateur à une phase d’un projet
const add_project_utilisateur = async (data) => {
  const query = `
    INSERT INTO projet_phase_utilisateur (
      ref_projet, id_phase, matricule
    ) VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [data.ref_projet, data.id_phase, data.matricule];
  const { rows } = await db.query(query, values);
  return rows[0];
};

// Ajouter une date reelle à une phase 
const add_fin_reelle_phase = async (data) => {
  const query = `
    UPDATE projet_phase 
    SET date_fin_reelle = $1
    WHERE ref_projet = $2 AND id_phase = $3
    RETURNING *;
  `;
  const values = [data.date_fin_reelle, data.ref_projet, data.id_phase];
  const { rows } = await db.query(query, values);
  return rows[0];
};


// Supprimer un utilisateur d’une phase d’un projet
const delete_project_utilisateur = async (data) => {
  const query = `
    DELETE FROM projet_phase_utilisateur
    WHERE ref_projet = $1 AND id_phase = $2 AND matricule = $3;
  `;
  await db.query(query, [data.ref_projet, data.id_phase, data.matricule]);
};

// Lister les utilisateurs d’une phase d’un projet
const get_users_by_phase = async (data) => {
  const query = `
    SELECT u.*
    FROM utilisateur u
    JOIN projet_phase_utilisateur ppu
    ON u.matricule = ppu.matricule
    WHERE ppu.ref_projet = $1 AND ppu.id_phase = $2;
  `;
  const { rows } = await db.query(query, [data.ref_projet, data.id_phase]);
  return rows;
};

// Lister toutes les phases d’un projet
const get_phases_by_project = async (ref_projet) => {
  const query = `
    SELECT pp.*, p.libelle_phase, p.description
    FROM projet_phase pp
    JOIN phases p ON pp.id_phase = p.id_phase
    WHERE pp.ref_projet = $1;
  `;
  const { rows } = await db.query(query, [ref_projet]);
  return rows;
};

// Lister tous les projets
const get_all_projects = async () => {
  const query = `SELECT * FROM module_projet;`;
  const { rows } = await db.query(query);
  return rows;
};

// Lister toutes les phases
const get_all_phases = async () => {
  const query = `SELECT * FROM phases;`;
  const { rows } = await db.query(query);
  return rows;
};

// Supprimer une phase d’un projet
const delete_project_phase = async (ref_projet, id_phase) => {
  const query = `
    DELETE FROM projet_phase
    WHERE ref_projet = $1 AND id_phase = $2;
  `;
  const result = await db.query(query, [ref_projet, id_phase]);
  return result.rowCount > 0; // true si suppression réussie
};
const delete_user_project = async (ref_projet) => {
  const query = `
    DELETE FROM projet_phase_utilisateur
    WHERE ref_projet = $1;
  `;
  const result = await db.query(query, [ref_projet]);
  return result.rowCount > 0; // true si suppression réussie
};

// Mettre à jour une phase d’un projet
const update_project_phase = async (data) => {
  const query = `
    UPDATE projet_phase
    SET date_debut = $1, date_fin = $2
    WHERE ref_projet = $3 AND id_phase = $4
    RETURNING *;
  `;
  const values = [data.date_debut, data.date_fin, data.ref_projet, data.id_phase];
  const { rows } = await db.query(query, values);
  return rows[0]; 
};


module.exports = {
  add_fin_reelle_phase,
  add_new_project,
  add_project_phase,
  add_project_utilisateur,
  delete_project_utilisateur,
  get_users_by_phase,
  get_phases_by_project,
  get_all_projects,
  get_all_phases,
  delete_project_phase,
  update_project_phase,
  delete_user_project
};
