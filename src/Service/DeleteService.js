const db = require("../../db");

const deleteModuleProjet = async (ref_projet) => {
  try {
    await db.query("BEGIN");

    // --- PHASES ---
    await db.query(
      `DELETE FROM projet_phase_utilisateur WHERE ref_projet = $1`,
      [ref_projet]
    );
    await db.query(
      `DELETE FROM projet_phase WHERE ref_projet = $1`,
      [ref_projet]
    );

    // --- TACHES DU MODULE ---
    // Sous-tâches → historique
    await db.query(`
      DELETE FROM historique_statut 
      WHERE ref_sous_tache IN (SELECT ref_sous_tache FROM sous_tache WHERE ref_tache IN (
        SELECT ref_tache FROM tache WHERE ref_projet = $1
      ))
    `,[ref_projet]);

    // Sous-tâches → utilisateurs
    await db.query(`
      DELETE FROM utilisateur_sous_tache
      WHERE ref_sous_tache IN (SELECT ref_sous_tache FROM sous_tache WHERE ref_tache IN (
        SELECT ref_tache FROM tache WHERE ref_projet = $1
      ))
    `,[ref_projet]);

    // Sous-tâches
    await db.query(`
      DELETE FROM sous_tache 
      WHERE ref_tache IN (SELECT ref_tache FROM tache WHERE ref_projet = $1)
    `,[ref_projet]);

    // Tâches → historique
    await db.query(`DELETE FROM historique_statut WHERE ref_tache IN (SELECT ref_tache FROM tache WHERE ref_projet = $1)`, [ref_projet]);

    // Tâches → commentaires
    await db.query(`DELETE FROM commentaires WHERE ref_tache IN (SELECT ref_tache FROM tache WHERE ref_projet = $1)`, [ref_projet]);

    // Tâches → fichier
    await db.query(`DELETE FROM fichier_tache WHERE ref_tache IN (SELECT ref_tache FROM tache WHERE ref_projet = $1)`, [ref_projet]);

    // Tâches → temps
    await db.query(`DELETE FROM temps_tache WHERE ref_tache IN (SELECT ref_tache FROM tache WHERE ref_projet = $1)`, [ref_projet]);

    // Tâches → utilisateurs
    await db.query(`DELETE FROM utilisateur_tache WHERE ref_tache IN (SELECT ref_tache FROM tache WHERE ref_projet = $1)`, [ref_projet]);

    // Tâches
    await db.query(`DELETE FROM tache WHERE ref_projet = $1`, [ref_projet]);

    // --- MODULE PROJET ---
    await db.query(`DELETE FROM module_projet WHERE ref_projet = $1`, [ref_projet]);

    await db.query("COMMIT");
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  }
};
const deleteExpiredNotifications = async () => {
  await db.query(`DELETE FROM notifications WHERE expire_at < NOW()`);
};
const deleteProjet = async (id_projet) => {
  try {
    await db.query("BEGIN");

    await db.query(`DELETE FROM details_projet  WHERE id_projet = $1`, [id_projet]);
    await db.query(`DELETE FROM fichier_projet   WHERE id_projet = $1`, [id_projet]);
    await db.query(`DELETE FROM surface_projet   WHERE id_projet = $1`, [id_projet]);
    await db.query(`DELETE FROM projet           WHERE id_projet = $1`, [id_projet]);

    await db.query("COMMIT");
  } catch (e) {
    await db.query("ROLLBACK");
    throw e;
  }
};
const deleteTache = async (ref_tache) => {
  try {
    await db.query("BEGIN");

    // 1) historique sur sous-tâches de cette tache
    await db.query(`
      DELETE FROM historique_statut
      WHERE ref_sous_tache IN (
        SELECT ref_sous_tache FROM sous_tache WHERE ref_tache = $1
      )
    `, [ref_tache]);

    // 2) historique sur la tache elle-même
    await db.query(`
      DELETE FROM historique_statut
      WHERE ref_tache = $1
    `, [ref_tache]);

    // 3) utilisateurs-sous-tâche
    await db.query(`
      DELETE FROM utilisateur_sous_tache
      WHERE ref_sous_tache IN (
        SELECT ref_sous_tache FROM sous_tache WHERE ref_tache = $1
      )
    `, [ref_tache]);

    // 4) supprimer les sous-taches
    await db.query(`
      DELETE FROM sous_tache
      WHERE ref_tache = $1
    `, [ref_tache]);


    // 5) commentaires liés à cette tache
    await db.query(`
      DELETE FROM commentaires
      WHERE ref_tache = $1
    `, [ref_tache]);

    // 6) fichiers liés
    await db.query(`
      DELETE FROM fichier_tache
      WHERE ref_tache = $1
    `, [ref_tache]);

    // 7) temps passé
    await db.query(`
      DELETE FROM temps_tache
      WHERE ref_tache = $1
    `, [ref_tache]);

    // 8) utilisateur-tache
    await db.query(`
      DELETE FROM utilisateur_tache
      WHERE ref_tache = $1
    `, [ref_tache]);

    // 9) enfin supprimer la tache
    await db.query(`
      DELETE FROM tache
      WHERE ref_tache = $1
    `, [ref_tache]);

    await db.query("COMMIT");
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  }
};
const getFichiersParProjet = async (ref_projet) => {
  try {
    const result = await db.query(`
      SELECT 
        ft.id_fichier_tache,
        ft.nom_fichier,
        ft.chemin_fichier,
        ft.date_ajout,
        ft.id_type_fichier
      FROM fichier_tache ft
      JOIN tache t ON t.ref_tache = ft.ref_tache
      WHERE t.ref_projet = $1
      ORDER BY ft.date_ajout
    `, [ref_projet]);

    return {
      [ref_projet]: result.rows.map(row => ({
        id_fichier_tache: row.id_fichier_tache,
        nom_fichier: row.nom_fichier,
        chemin_fichier: row.chemin_fichier,
        date_ajout: row.date_ajout,
        id_type_fichier: row.id_type_fichier
      }))
    };
  } catch (err) {
    console.error("Erreur getFichiersParProjet:", err);
    throw err;
  }
};

module.exports = {
    deleteModuleProjet,
    deleteExpiredNotifications,
    deleteProjet,
    deleteTache,
    getFichiersParProjet
};