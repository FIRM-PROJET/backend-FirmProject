const db = require('../../db');

//Add module access
const add_new_module_access = async (data) => {
  const { ref_module, matricule,  } = data;
  const { rows } = await db.query(
    `INSERT INTO module_access(ref_module, matricule)
     VALUES($1, $2) RETURNING *`,
    [ref_module, matricule]
  );
};

async function findAll() {
  try {
    const { rows } = await db.query("SELECT * FROM module WHERE nom_module IS DISTINCT FROM 'Accueil'");
    return rows;
  } catch (error) {
    console.error('Erreur lors de la récupération des modules :', error);
    throw error;
  }
}
async function delete_module_access(ref_module, matricule) {
  const { rows } = await db.query(
    'DELETE FROM module_access WHERE ref_module = $1 AND matricule = $2 RETURNING *',
    [ref_module, matricule]
  );
  return rows[0]; 
}
const checkIsAdmin = async (matricule) => {
  try {
    const query = `
      SELECT 1
      FROM module_access ma
      JOIN module m ON ma.ref_module = m.ref_module
      WHERE ma.matricule = $1 AND m.nom_module = 'Admin'
      LIMIT 1
    `;
    const { rows } = await db.query(query, [matricule]);
    return rows.length > 0; 
  } catch (error) {
    console.error("Erreur lors de la vérification d'accès au module Admin :", error);
    return false;
  }
};

module.exports = { findAll, add_new_module_access,delete_module_access,checkIsAdmin};


