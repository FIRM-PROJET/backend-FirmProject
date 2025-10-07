const db = require("../../db");
const dayjs = require("dayjs");

async function calculerDateFinPrevuParId(dateDebutStr, duree, id_unite_duree) {
  let date = dayjs(dateDebutStr);

  if (id_unite_duree === 2) {
    const feriesResult = await db.query(`SELECT jour, mois FROM jours_ferie`);
    const joursFeries = feriesResult.rows.map((row) => ({
      jour: row.jour,
      mois: row.mois,
    }));
    const estFerie = (dateToCheck) => {
      return joursFeries.some(
        (ferie) =>
          dateToCheck.date() === ferie.jour &&
          dateToCheck.month() + 1 === ferie.mois
      );
    };

    let joursEntiers = Math.floor(duree);
    let demiJournee = duree - joursEntiers;

    while (joursEntiers > 0) {
      if (![6, 0].includes(date.day()) && !estFerie(date)) {
        joursEntiers--;
      }
      if (joursEntiers > 0) {
        date = date.add(1, "day");
      }
    }

    if (demiJournee > 0) {
      if ([6, 0].includes(date.day()) || estFerie(date)) {
        do {
          date = date.add(1, "day");
        } while ([6, 0].includes(date.day()) || estFerie(date));
      }
    }
    return date.format("YYYY-MM-DD");
  }
  switch (id_unite_duree) {
    case 1:
      date = date.add(duree, "hour");
      break;
    case 3:
      date = date.add(duree * 7, "day");
      break;
    case 4:
      date = date.add(duree, "month");
      break;
    case 5:
      date = date.add(duree * 3, "month");
      break;
    case 6:
      date = date.add(duree * 6, "month");
      break;
    case 7:
      date = date.add(duree, "year");
      break;
    default:
      throw new Error("id_unite_duree inconnu : " + id_unite_duree);
  }

  return date.format("YYYY-MM-DD");
}

const insert_tache = async ({
  nom_tache,
  description,
  ref_projet,
  id_phase,
  date_debut,
  duree,
  id_unite_duree,
}) => {
  const date_fin_prevu = await calculerDateFinPrevuParId(
    date_debut,
    duree,
    id_unite_duree
  );

  const query = `
    INSERT INTO tache (
      nom_tache,
      description,
      ref_projet,
      id_phase,
      date_debut,
      duree,
      id_unite_duree,
      date_fin_prevu
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING ref_tache;
  `;

  const values = [
    nom_tache,
    description,
    ref_projet,
    id_phase,
    date_debut,
    duree,
    id_unite_duree,
    date_fin_prevu,
  ];

  const result = await db.query(query, values);
  const ref_tache = result.rows[0].ref_tache;

  await db.query(
    `INSERT INTO historique_statut (ref_tache, ref_sous_tache, id_statut) VALUES ($1, NULL, 1)`,
    [ref_tache]
  );

  return ref_tache;
};

const insert_temps_tache = async ({ ref_tache, temps_passe_minutes }) => {
  const query = `
    INSERT INTO temps_tache (ref_tache, temps_passe_minutes)
    VALUES ($1, $2)
    RETURNING ref_tache;
  `;

  const values = [ref_tache, temps_passe_minutes];

  const result = await db.query(query, values);
  return result.rows[0].ref_tache;
};

const insert_sous_tache = async ({
  nom_sous_tache,
  description,
  ref_tache,
  date_debut,
  duree,
  id_unite_duree,
}) => {
  // ATTENTION ici on oublie pas le await
  const date_fin_prevu = await calculerDateFinPrevuParId(
    date_debut,
    duree,
    id_unite_duree
  );

  const query = `
    INSERT INTO sous_tache (
      nom_sous_tache,
      description,
      ref_tache,
      date_debut,
      duree,
      id_unite_duree,
      date_fin_prevu
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING ref_sous_tache;
  `;

  const values = [
    nom_sous_tache,
    description,
    ref_tache,
    date_debut,
    duree,
    id_unite_duree,
    date_fin_prevu,
  ];

  const result = await db.query(query, values);
  const ref_sous_tache = result.rows[0].ref_sous_tache;

  // Insertion dans historique_statut avec statut par défaut (1 = Non démarré)
  await db.query(
    `INSERT INTO historique_statut (ref_tache, ref_sous_tache, id_statut) VALUES (NULL, $1, 1)`,
    [ref_sous_tache]
  );

  return ref_sous_tache;
};

const update_statut = async ({ ref_tache, ref_sous_tache }, statut_id) => {
  let query;
  let values;

  if (ref_sous_tache) {
    query = `INSERT INTO historique_statut (ref_tache, ref_sous_tache, id_statut) VALUES (NULL, $1, $2)`;
    values = [ref_sous_tache, statut_id];
  } else {
    query = `INSERT INTO historique_statut (ref_tache, ref_sous_tache, id_statut) VALUES ($1, NULL, $2)`;
    values = [ref_tache, statut_id];
  }
  await db.query(query, values);
};

const update_statut_termine = async (params) => {
  await update_statut(params, 3);
};

const update_statut_en_cours = async (params) => {
  await update_statut(params, 2);
};

const assignerUtilisateurSousTache = async (matricule, ref_sous_tache) => {
  const query = `
    INSERT INTO utilisateur_sous_tache (matricule, ref_sous_tache)
    VALUES ($1, $2)
    ON CONFLICT (matricule, ref_sous_tache) DO NOTHING;
  `;

  const values = [matricule, ref_sous_tache];
  await db.query(query, values);
};

// Récupère le statut actuel d'une tâche
const getStatutTache = async (ref_tache) => {
  const res = await db.query(
    `
    SELECT s.nom_statut
    FROM historique_statut hs
    JOIN statut s ON s.id_statut = hs.id_statut
    WHERE hs.ref_tache = $1 AND hs.ref_sous_tache IS NULL
    ORDER BY hs.date_statut DESC
    LIMIT 1
  `,
    [ref_tache]
  );

  return res.rows[0]?.nom_statut || null;
};

// Récupère les utilisateurs assignés à une tâche
const getUsersTache = async (ref_tache) => {
  const res = await db.query(
    `
   SELECT 
      u.matricule, 
      u.nom, 
      u.prenom,
      p.nom_projet,
      ph.libelle_phase
    FROM utilisateur_tache ut
    JOIN utilisateur u ON ut.matricule = u.matricule
    JOIN tache t ON ut.ref_tache = t.ref_tache
    LEFT JOIN module_projet p ON t.ref_projet = p.ref_projet
    LEFT JOIN phases ph ON t.id_phase = ph.id_phase
    WHERE ut.ref_tache = $1
  `,
    [ref_tache]
  );

  return res.rows;
};

const getTaches = async () => {
  const res = await db.query(`
    SELECT 
      t.*,
      TO_CHAR(t.date_debut, 'YYYY-MM-DD') AS date_debut,
      TO_CHAR(t.date_fin_prevu, 'YYYY-MM-DD') AS date_fin_prevu,
      TO_CHAR(t.date_fin_reelle, 'YYYY-MM-DD') AS date_fin_reelle,
      u.nom_unite,
      p.nom_projet,
      ph.libelle_phase,
      COALESCE(tt.temps_passe_minutes, 0) / 60.0 AS temps_passe_heures
    FROM tache t
    LEFT JOIN unite_duree u ON t.id_unite_duree = u.id_unite_duree
    LEFT JOIN module_projet p ON t.ref_projet = p.ref_projet
    LEFT JOIN phases ph ON t.id_phase = ph.id_phase
    LEFT JOIN temps_tache tt ON t.ref_tache = tt.ref_tache
  `);

  const taches = await Promise.all(
    res.rows.map(async (details) => {
      details.statut = await getStatutTache(details.ref_tache);
      details.utilisateurs = await getUsersTache(details.ref_tache);
      return details;
    })
  );

  return taches;
};

// Récupère les sous-tâches, avec leur statut et leurs utilisateurs
const getSousTaches = async (ref_sous_taches) => {
  const res = await db.query(
    `
    SELECT st.*, u.nom_unite
    FROM sous_tache st
    LEFT JOIN unite_duree u ON st.id_unite_duree = u.id_unite_duree
    WHERE st.ref_sous_tache = $1
  `,
    [ref_sous_taches]
  );

  const sousTaches = await Promise.all(
    res.rows.map(async (sous) => {
      sous.statut = await getStatutSousTache(sous.ref_sous_tache);
      sous.utilisateurs = await getUsersSousTache(sous.ref_sous_tache);
      return sous;
    })
  );

  return sousTaches;
};

const get_sous_tache = async (ref_tache) => {
  const res = await db.query(`SELECT * FROM sous_tache WHERE ref_tache = $1`, [
    ref_tache,
  ]);
  const sousTaches = res.rows;
  // Ajouter le statut à chaque sous-tâche
  for (const sous of sousTaches) {
    sous.statut = await getStatutSousTache(sous.ref_sous_tache);
  }
  return sousTaches;
};

// Récupère le statut d'une sous-tâche
const getStatutSousTache = async (ref_sous_tache) => {
  const res = await db.query(
    `
    SELECT s.nom_statut
    FROM historique_statut hs
    JOIN statut s ON s.id_statut = hs.id_statut
    WHERE hs.ref_sous_tache = $1 AND hs.ref_tache IS NULL
    ORDER BY hs.date_statut DESC
    LIMIT 1
  `,
    [ref_sous_tache]
  );

  return res.rows[0]?.nom_statut || null;
};

// Récupère les utilisateurs assignés à une sous-tâche
const getUsersSousTache = async (ref_sous_tache) => {
  const res = await db.query(
    `
    SELECT u.matricule, u.nom, u.prenom
    FROM utilisateur_sous_tache ust
    JOIN utilisateur u ON ust.matricule = u.matricule
    WHERE ust.ref_sous_tache = $1
  `,
    [ref_sous_tache]
  );

  return res.rows;
};
const delete_tache = async (ref_tache) => {
  try {
    await db.query("BEGIN");

    // Supprimer l'historique statut des sous-tâches liées à la tâche
    await db.query(
      `
      DELETE FROM historique_statut
      WHERE ref_sous_tache IN (
        SELECT ref_sous_tache FROM sous_tache WHERE ref_tache = $1
      )
    `,
      [ref_tache]
    );
    await db.query(`DELETE FROM historique_statut WHERE ref_tache = $1`, [
      ref_tache,
    ]);
    await db.query(`DELETE FROM tache WHERE ref_tache = $1`, [ref_tache]);
    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
};
const delete_tache_foreign = async (ref_tache) => {
  try {
    await db.query("BEGIN");
    // Supprimer les assignations utilisateurs sous-tâches des sous-tâches liées à la tâche
    await db.query(
      `
      DELETE FROM utilisateur_sous_tache
      WHERE ref_sous_tache IN (
        SELECT ref_sous_tache FROM sous_tache WHERE ref_tache = $1
      )
    `,
      [ref_tache]
    );
    // Supprimer l'historique statut des sous-tâches liées à la tâche
    await db.query(
      `
      DELETE FROM historique_statut
      WHERE ref_sous_tache IN (
        SELECT ref_sous_tache FROM sous_tache WHERE ref_tache = $1
      )
    `,
      [ref_tache]
    );
    await db.query(`DELETE FROM sous_tache WHERE ref_tache = $1`, [ref_tache]);
    await db.query(`DELETE FROM commentaires WHERE ref_tache = $1`, [
      ref_tache,
    ]);
    await db.query(`DELETE FROM fichier_tache WHERE ref_tache = $1`, [
      ref_tache,
    ]);
    await db.query(`DELETE FROM utilisateur_tache WHERE ref_tache = $1`, [
      ref_tache,
    ]);
    await db.query(`DELETE FROM historique_statut WHERE ref_tache = $1`, [
      ref_tache,
    ]);
    await db.query(`DELETE FROM tache WHERE ref_tache = $1`, [ref_tache]);

    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
};

const delete_sous_tache = async (ref_sous_tache) => {
  try {
    await db.query("BEGIN");
    await db.query(
      `DELETE FROM utilisateur_sous_tache WHERE ref_sous_tache = $1`,
      [ref_sous_tache]
    );

    await db.query(`DELETE FROM historique_statut WHERE ref_sous_tache = $1`, [
      ref_sous_tache,
    ]);
    await db.query(`DELETE FROM sous_tache WHERE ref_sous_tache = $1`, [
      ref_sous_tache,
    ]);
    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
};

const getTachesEtSousTachesParUtilisateur = async (matricule) => {
  // Récupérer les tâches assignées à l'utilisateur
  const resTaches = await db.query(
    `
  SELECT 
      t.*, 
      u.nom_unite,
      p.nom_projet,
      ph.libelle_phase
    FROM utilisateur_tache ut
    JOIN tache t ON ut.ref_tache = t.ref_tache
    LEFT JOIN unite_duree u ON t.id_unite_duree = u.id_unite_duree
    LEFT JOIN module_projet p ON t.ref_projet = p.ref_projet
    LEFT JOIN phases ph ON t.id_phase = ph.id_phase
    WHERE ut.matricule = $1
  `,
    [matricule]
  );

  const taches = await Promise.all(
    resTaches.rows.map(async (tache) => {
      tache.statut = await getStatutTache(tache.ref_tache);
      tache.utilisateurs = await getUsersTache(tache.ref_tache);

      // Sous-tâches liées à cette tâche et assignées à l'utilisateur
      const resSousTaches = await db.query(
        `
      SELECT st.*, u.nom_unite
      FROM utilisateur_sous_tache ust
      JOIN sous_tache st ON ust.ref_sous_tache = st.ref_sous_tache
      LEFT JOIN unite_duree u ON st.id_unite_duree = u.id_unite_duree
      WHERE ust.matricule = $1 AND st.ref_tache = $2
    `,
        [matricule, tache.ref_tache]
      );

      tache.sous_taches = await Promise.all(
        resSousTaches.rows.map(async (sous) => {
          sous.statut = await getStatutSousTache(sous.ref_sous_tache);
          sous.utilisateurs = await getUsersSousTache(sous.ref_sous_tache);
          return sous;
        })
      );

      return tache;
    })
  );

  return taches;
};
// Fonction pour générer uniquement les jours ouvrés entre deux dates
const genererJoursOuvres = async (dateDebut, dateFin) => {
  const jours = [];

  // Récupérer les jours fériés
  const feriesResult = await db.query(`SELECT jour, mois FROM jours_ferie`);
  const joursFeries = feriesResult.rows.map((row) => ({
    jour: row.jour,
    mois: row.mois,
  }));

  // Fonction pour vérifier si la date est fériée
  const estFerie = (dateToCheck) => {
    const isFerie = joursFeries.some(
      (ferie) =>
        dateToCheck.date() === ferie.jour &&
        dateToCheck.month() + 1 === ferie.mois
    );
    return isFerie;
  };

  // Extraire les dates au format YYYY-MM-DD
  let debutStr, finStr;

  if (typeof dateDebut === "string") {
    debutStr = dateDebut.slice(0, 10);
  } else {
    debutStr = dayjs(dateDebut).format("YYYY-MM-DD");
  }

  if (typeof dateFin === "string") {
    finStr = dateFin.slice(0, 10);
  } else {
    finStr = dayjs(dateFin).format("YYYY-MM-DD");
  }

  let currentDate = dayjs(debutStr);
  const endDate = dayjs(finStr);

  // Normaliser les dates au début de journée pour éviter les problèmes d'heures
  currentDate = currentDate.startOf("day");
  const normalizedEndDate = endDate.startOf("day");

  // Utiliser une boucle plus simple avec comparaison de timestamps
  while (currentDate.valueOf() <= normalizedEndDate.valueOf()) {
    const dayOfWeek = currentDate.day(); // 0 = dimanche, 6 = samedi
    const isWeekend = [6, 0].includes(dayOfWeek);
    const isFerie = estFerie(currentDate);

    // Inclure seulement les jours ouvrés (lundi à vendredi, pas fériés)
    if (!isWeekend && !isFerie) {
      jours.push(currentDate.format("YYYY-MM-DD"));
    } else {
    }
    currentDate = currentDate.add(1, "day");
  }

  return jours;
};

// Fonction CORRIGÉE pour calculer la répartition des heures selon la durée
const calculerRepartitionHeures = (duree, dureeEnHeures, joursTache) => {
  const repartition = {};
  // Si pas de jours, retourner vide
  if (joursTache.length === 0) {
    return repartition;
  }

  // NOUVELLE LOGIQUE: Répartition intelligente
  // Au lieu de forcer les jours entiers + demi-journée,
  // répartir au maximum 8h par jour disponible

  let heuresRestantes = dureeEnHeures;
  let index = 0;

  while (heuresRestantes > 0 && index < joursTache.length) {
    const heuresASigner = Math.min(8, heuresRestantes);
    repartition[joursTache[index]] = heuresASigner;
    heuresRestantes -= heuresASigner;
    index++;
  }
  return repartition;
};

const assignerUtilisateurTache = async (matricule, ref_tache) => {
  // Étape 1 : Récupérer les infos de la tâche à assigner
  const { rows } = await db.query(
    `SELECT date_debut, date_fin_prevu, duree, id_unite_duree FROM tache WHERE ref_tache = $1`,
    [ref_tache]
  );
  if (rows.length === 0) {
    throw new Error("Tâche non trouvée");
  }
  const { date_debut, date_fin_prevu, duree, id_unite_duree } = rows[0];

  const dureeEnHeures = getDureeEnHeures(duree, id_unite_duree);
  // console.log(`Durée en heures de la tâche : ${dureeEnHeures}`);

  let joursTache;

  if (id_unite_duree === 2) {
    // Pour les jours ouvrés : utiliser la logique d'exclusion des weekends/fériés
    joursTache = await genererJoursOuvres(date_debut, date_fin_prevu);
  } else {
    // Pour les autres unités : utiliser la logique simple (heures, semaines, mois, etc.)
    joursTache = [];
    const debutStr =
      typeof date_debut === "string"
        ? date_debut.slice(0, 10)
        : dayjs(date_debut).format("YYYY-MM-DD");
    const finStr =
      typeof date_fin_prevu === "string"
        ? date_fin_prevu.slice(0, 10)
        : dayjs(date_fin_prevu).format("YYYY-MM-DD");

    let currentDate = dayjs(debutStr);
    const endDate = dayjs(finStr);

    while (currentDate.valueOf() <= endDate.valueOf()) {
      joursTache.push(currentDate.format("YYYY-MM-DD"));
      currentDate = currentDate.add(1, "day");
    }
  }

  // console.log(`Jours concernés par la tâche : ${joursTache.join(", ")}`);

  // Vérifier qu'il y a au moins un jour
  if (joursTache.length === 0) {
    throw new Error("Aucun jour ouvré trouvé pour cette tâche");
  }

  // Obtenir la date de début au format string pour les comparaisons
  const dateDebutStr = joursTache[0]; // Premier jour de la liste

  // Calculer la répartition des heures selon le type d'unité
  let repartitionHeures = {};

  if (id_unite_duree === 2) {
    // Pour les jours : utiliser la logique spéciale de répartition
    repartitionHeures = calculerRepartitionHeures(
      duree,
      dureeEnHeures,
      joursTache
    );
  } else if (id_unite_duree === 1) {
    // Pour les heures : concentrer sur le premier jour
    repartitionHeures[dateDebutStr] = dureeEnHeures;
  } else {
    // Autres unités : concentrer sur le premier jour
    repartitionHeures[dateDebutStr] = dureeEnHeures;
  }
  // CORRECTION: Créer un cache des répartitions pour éviter les recalculs
  const cacheRepartitions = new Map();

  // Pour chaque jour, vérifier les heures déjà planifiées
  for (const jour of joursTache) {
    // Récupère toutes les tâches de l'utilisateur pour ce jour
    const result = await db.query(
      `
    SELECT t.ref_tache, t.duree, t.id_unite_duree, t.date_debut, t.date_fin_prevu
    FROM utilisateur_tache ut
    JOIN tache t ON ut.ref_tache = t.ref_tache
    WHERE ut.matricule = $1
      AND $2 BETWEEN t.date_debut AND t.date_fin_prevu
    `,
      [matricule, jour]
    );

    let heuresExistantes = 0;

    for (const tache of result.rows) {
      // Utiliser le cache ou calculer la répartition
      let repartitionExistante;
      const cacheKey = `${tache.ref_tache}`;

      if (cacheRepartitions.has(cacheKey)) {
        repartitionExistante = cacheRepartitions.get(cacheKey);
      } else {
        let joursExistants;

        if (tache.id_unite_duree === 2) {
          joursExistants = await genererJoursOuvres(
            tache.date_debut,
            tache.date_fin_prevu
          );
        } else {
          // Pour les autres unités, générer tous les jours
          joursExistants = [];
          const debutStr =
            typeof tache.date_debut === "string"
              ? tache.date_debut.slice(0, 10)
              : dayjs(tache.date_debut).format("YYYY-MM-DD");
          const finStr =
            typeof tache.date_fin_prevu === "string"
              ? tache.date_fin_prevu.slice(0, 10)
              : dayjs(tache.date_fin_prevu).format("YYYY-MM-DD");

          let currentDate = dayjs(debutStr);
          const endDate = dayjs(finStr);

          while (currentDate.valueOf() <= endDate.valueOf()) {
            joursExistants.push(currentDate.format("YYYY-MM-DD"));
            currentDate = currentDate.add(1, "day");
          }
        }

        if (tache.id_unite_duree === 2) {
          repartitionExistante = calculerRepartitionHeures(
            tache.duree,
            getDureeEnHeures(tache.duree, tache.id_unite_duree),
            joursExistants
          );
        } else {
          // Pour les autres unités, concentrer sur le premier jour
          repartitionExistante = {};
          if (joursExistants.length > 0) {
            repartitionExistante[joursExistants[0]] = getDureeEnHeures(
              tache.duree,
              tache.id_unite_duree
            );
          }
        }

        cacheRepartitions.set(cacheKey, repartitionExistante);
      }

      if (repartitionExistante[jour]) {
        heuresExistantes += repartitionExistante[jour];
      }
    }

    const heuresProposeesPourCeJour = repartitionHeures[jour] || 0;
    const totalPropose = heuresExistantes + heuresProposeesPourCeJour;

    if (totalPropose > 8) {
      const dateFr = new Date(jour).toLocaleDateString("fr-FR");
      throw new Error(
        `Assignation refusée : ${heuresExistantes}h déjà allouées. Changez la date ou l’utilisateur , ou cochez Exception.`
      );
    }
  }

  // Étape 3 : Effectuer l'assignation si tout est ok
  await db.query(
    `
    INSERT INTO utilisateur_tache (matricule, ref_tache)
    VALUES ($1, $2)
    ON CONFLICT (matricule, ref_tache) DO NOTHING;
    `,
    [matricule, ref_tache]
  );
};

const getDureeEnHeures = (duree, id_unite_duree) => {
  const heuresParUnite = {
    1: 1, // Heure
    2: 8, // Jour
    3: 40, // Semaine (5 jours ouvrés)
    4: 176, // Mois (22 jours ouvrés)
    5: 528, // Trimestre (3 mois)
    6: 1056, // Semestre (6 mois)
    7: 2112, // Année (12 mois)
  };

  const facteur = heuresParUnite[id_unite_duree];
  if (facteur === undefined) {
    throw new Error("id_unite_duree inconnu : " + id_unite_duree);
  }

  return duree * facteur;
};
async function find_tache_files(ref_tache) {
  try {
    const sql = `SELECT id_fichier_tache,nom_fichier, chemin_fichier FROM fichier_tache WHERE ref_tache = $1`;
    const params = [ref_tache];

    const result = await db.query(sql, params);
    return result.rows;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails du projet :",
      error
    );
  }
}
async function find_all_tache_files() {
  try {
    const sql = `SELECT id_fichier_tache,nom_fichier, chemin_fichier FROM fichier_tache`;
    const result = await db.query(sql);
    return result.rows;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails du projet :",
      error
    );
  }
}
const add_tache_files = async (data) => {
  try {
    const { ref_tache, nom_fichier, chemin_fichier } = data;

    const query = `
      INSERT INTO fichier_tache (
        ref_tache,
        nom_fichier,
        chemin_fichier
      ) VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [ref_tache, nom_fichier, chemin_fichier];
    const result = await db.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Erreur lors de l’insertion dans fichier_tache :", error);
    throw error;
  }
};
async function getAvancementParPhaseParProjet() {
  const sql = `
    WITH dernier_statut AS (
      SELECT DISTINCT ON (ref_tache)
        ref_tache,
        id_statut
      FROM historique_statut
      WHERE ref_tache IS NOT NULL
      ORDER BY ref_tache, date_statut DESC
    )
    SELECT
      t.ref_projet,
      t.id_phase,
      COUNT(*) AS total_taches,
      COUNT(*) FILTER (WHERE ds.id_statut = 3) AS taches_terminees,
      ROUND(100.0 * COUNT(*) FILTER (WHERE ds.id_statut = 3) / NULLIF(COUNT(*), 0), 2) AS avancement_pourcent
    FROM tache t
    JOIN dernier_statut ds ON ds.ref_tache = t.ref_tache
    GROUP BY t.ref_projet, t.id_phase
    ORDER BY t.ref_projet, t.id_phase
  `;
  const result = await db.query(sql);
  return result.rows;
}

async function getAvancementGlobalParProjet() {
  const sql = `
    WITH dernier_statut AS (
      SELECT DISTINCT ON (ref_tache)
        ref_tache,
        id_statut
      FROM historique_statut
      WHERE ref_tache IS NOT NULL
      ORDER BY ref_tache, date_statut DESC
    ),
    avancement_phase AS (
      SELECT
        t.ref_projet,
        t.id_phase,
        COUNT(*) AS total_taches,
        COUNT(*) FILTER (WHERE ds.id_statut = 3) AS taches_terminees,
        ROUND(100.0 * COUNT(*) FILTER (WHERE ds.id_statut = 3) / NULLIF(COUNT(*), 0), 6) AS avancement_pourcent
      FROM tache t
      JOIN dernier_statut ds ON ds.ref_tache = t.ref_tache
      GROUP BY t.ref_projet, t.id_phase
    )
    SELECT
      ref_projet,
      ROUND(
        SUM(total_taches * avancement_pourcent) / NULLIF(SUM(total_taches), 0),
        2
      ) AS avancement_global_pourcent,
      SUM(total_taches) AS total_taches_projet,
      SUM(taches_terminees) AS taches_terminees_projet
    FROM avancement_phase
    GROUP BY ref_projet
    ORDER BY ref_projet
  `;
  const result = await db.query(sql);
  return result.rows;
}

// Récupère toutes les tâches accomplies (id_statut = 3) pour un utilisateur donné
const getTachesAccompliesParUtilisateur = async (matricule) => {
  const resTaches = await db.query(
    `
    SELECT DISTINCT t.*, hs.date_statut
    FROM utilisateur_tache ut
    JOIN tache t ON ut.ref_tache = t.ref_tache
    JOIN (
      SELECT ref_tache, MAX(date_statut) AS date_statut
      FROM historique_statut
      WHERE id_statut = 3
      GROUP BY ref_tache
    ) hs ON hs.ref_tache = t.ref_tache
    WHERE ut.matricule = $1
  `,
    [matricule]
  );

  const resSousTaches = await db.query(
    `
    SELECT DISTINCT st.*, hs.date_statut
    FROM utilisateur_sous_tache ust
    JOIN sous_tache st ON ust.ref_sous_tache = st.ref_sous_tache
    JOIN (
      SELECT ref_sous_tache, MAX(date_statut) AS date_statut
      FROM historique_statut
      WHERE id_statut = 3
      GROUP BY ref_sous_tache
    ) hs ON hs.ref_sous_tache = st.ref_sous_tache
    WHERE ust.matricule = $1
  `,
    [matricule]
  );

  return {
    taches: resTaches.rows,
    sous_taches: resSousTaches.rows,
  };
};

const getAllUserTachesAccomplies = async () => {
  const query = `
    SELECT 
      u.matricule,
      u.prenom,
      t.ref_tache,
      t.nom_tache,
      t.description,
      hs.date_statut
    FROM utilisateur_tache ut
    JOIN utilisateur u ON ut.matricule = u.matricule
    JOIN tache t ON ut.ref_tache = t.ref_tache
    JOIN (
      SELECT ref_tache, MAX(date_statut) AS date_statut
      FROM historique_statut
      WHERE id_statut = 3  -- accomplies
      GROUP BY ref_tache
    ) hs ON hs.ref_tache = t.ref_tache
    ORDER BY u.nom, hs.date_statut DESC;
  `;

  const { rows } = await db.query(query);
  return rows;
};

const getTachesEnCoursParUtilisateur = async (matricule) => {
  const resTaches = await db.query(
    `
    SELECT DISTINCT t.*
    FROM utilisateur_tache ut
    JOIN tache t ON ut.ref_tache = t.ref_tache
    JOIN (
      SELECT ref_tache, MAX(date_statut) AS derniere_date
      FROM historique_statut
      WHERE id_statut = 2
      GROUP BY ref_tache
    ) hs ON hs.ref_tache = t.ref_tache
    WHERE ut.matricule = $1
  `,
    [matricule]
  );

  // Sélection des sous-tâches accomplies
  const resSousTaches = await db.query(
    `
    SELECT DISTINCT st.*
    FROM utilisateur_sous_tache ust
    JOIN sous_tache st ON ust.ref_sous_tache = st.ref_sous_tache
    JOIN (
      SELECT ref_sous_tache, MAX(date_statut) AS derniere_date
      FROM historique_statut
      WHERE id_statut = 2
      GROUP BY ref_sous_tache
    ) hs ON hs.ref_sous_tache = st.ref_sous_tache
    WHERE ust.matricule = $1
  `,
    [matricule]
  );

  return {
    taches: resTaches.rows,
    sous_taches: resSousTaches.rows,
  };
};

// Récupère tous les utilisateurs assignés à une tâche avec leurs emails
const getUsersTacheAvecEmails = async (ref_tache) => {
  const res = await db.query(
    `
    SELECT 
      u.matricule,
      u.nom,
      u.prenom,
      u.email
    FROM utilisateur_tache ut
    JOIN utilisateur u ON ut.matricule = u.matricule
    WHERE ut.ref_tache = $1
    ORDER BY u.nom, u.prenom
    `,
    [ref_tache]
  );

  return res.rows;
};

async function getTacheByRef(ref_tache) {
  const query = `
    SELECT ref_tache, nom_tache, description, ref_projet, id_phase, 
           date_debut, duree, id_unite_duree, date_fin_prevu, date_fin_reelle
    FROM tache
    WHERE ref_tache = $1
  `;
  const res = await db.query(query, [ref_tache]);
  return res.rows[0] || null;
}
// Fonction pour insérer un utilisateur/tâche
async function assignation_sans_condition(matricule, refTache) {
  const query = `
    INSERT INTO utilisateur_tache (matricule, ref_tache)
    VALUES ($1, $2)
    ON CONFLICT (matricule, ref_tache) DO NOTHING;
  `;

  try {
    await db.query(query, [matricule, refTache]);
  } catch (err) {
    console.error("Erreur lors de l'insertion :", err);
    throw err;
  }
}

async function heuresParPhase() {
  try {
    const query = `
      SELECT 
          t.ref_projet,
          p.id_phase,
          p.libelle_phase,
          SUM(tt.temps_passe_minutes) / 60.0 AS total_heures
      FROM 
          temps_tache tt
      JOIN 
          tache t ON tt.ref_tache = t.ref_tache
      JOIN 
          phases p ON t.id_phase = p.id_phase
      GROUP BY 
          t.ref_projet, p.id_phase, p.libelle_phase
      ORDER BY 
          t.ref_projet ASC, total_heures DESC;
    `;
    const { rows } = await db.query(query);
    return rows;
  } catch (err) {
    console.error("Erreur lors de la récupération des heures par phase :", err);
    throw err;
  }
}
async function update_auto_verified(refTache, isVerified) {
  const query = `
    UPDATE tache
    SET auto_verified = $2
    WHERE ref_tache = $1;
  `;
  try {
    await db.query(query, [refTache, isVerified]);
  } catch (err) {
    console.error("Erreur lors de la mise à jour de auto_verified :", err);
    throw err;
  }
}
async function setTachesAutoVerified(listeTaches) {
  if (!Array.isArray(listeTaches) || listeTaches.length === 0) {
    throw new Error("La liste de tâches est vide ou invalide");
  }

  const query = `
    UPDATE tache
    SET auto_verified = TRUE
    WHERE ref_tache = ANY($1)
  `;

  try {
    await db.query(query, [listeTaches]);
  } catch (err) {
    console.error("Erreur lors de la mise à jour des tâches :", err);
    throw err;
  }
}

async function get_taches_terminees_non_verifiees(matricule) {
  const query = `SELECT * FROM v_taches_terminees_non_verifiees WHERE matricule = $1`;

  try {
    const { rows } = await db.query(query, [matricule]);
    return rows;
  } catch (err) {
    console.error(
      "Erreur lors de la récuperation des taches non verifiés :",
      err
    );
    throw err;
  }
}
async function get_taches_terminees_verifiees(matricule) {
  const query = `SELECT * FROM v_taches_terminees_verifiees WHERE matricule = $1`;

  try {
    const { rows } = await db.query(query, [matricule]);
    return rows;
  } catch (err) {
    console.error("Erreur lors de la récuperation des taches verifiés :", err);
    throw err;
  }
}
async function insert_tache_verifie_user(listeTaches, matricule) {
  const query = `
    INSERT INTO tache_verifie_utilisateur (ref_tache, matricule, is_okay, raison)
    VALUES ($1, $2, $3, $4);
  `;
  try {
    for (const tache of listeTaches) {
      const values = [
        tache.ref_tache,
        matricule,
        tache.is_okay,
        tache.raison || null,
      ];
      await db.query(query, values);
      if (tache.is_okay === false) {
        await update_auto_verified(tache.ref_tache, false);
      } else {
        await update_auto_verified(tache.ref_tache, true);
      }
    }
    console.log("Toutes les vérifications ont été enregistrées avec succès !");
  } catch (err) {
    console.error("Erreur lors de l'insertion des vérifications :", err);
    throw err;
  }
}
async function getTachesVerifieesParUtilisateur(matricule) {
  const query = `
    SELECT 
      ref_tache,
      is_okay,
      raison,
      date_verification
    FROM 
      tache_verifie_utilisateur
    WHERE 
      matricule = $1
    ORDER BY 
      date_verification DESC;
  `;

  try {
    const { rows } = await db.query(query, [matricule]);
    return rows;
  } catch (err) {
    console.error(
      "Erreur lors de la récupération des tâches vérifiées pour l'utilisateur :",
      err
    );
    throw err;
  }
}

async function getTachesVerifieesParSemaine() {
  const query = `
    SELECT
      matricule,
      DATE_TRUNC('week', date_verification) AS semaine,
      COUNT(*) FILTER (WHERE is_okay = true) AS total_ok,
      COUNT(*) FILTER (WHERE is_okay = false) AS total_non_ok
    FROM
      tache_verifie_utilisateur
    GROUP BY
      matricule,
      DATE_TRUNC('week', date_verification)
    ORDER BY
      matricule ASC,
      semaine ASC;
  `;

  try {
    const { rows } = await db.query(query);
    return rows;
  } catch (err) {
    console.error(
      "Erreur lors de la récupération des tâches par semaine :",
      err
    );
    throw err;
  }
}
async function getTachesVerifieesParMois() {
  const query = `
    SELECT
      matricule,
      DATE_TRUNC('month', date_verification) AS mois,
      COUNT(*) FILTER (WHERE is_okay = true) AS total_ok,
      COUNT(*) FILTER (WHERE is_okay = false) AS total_non_ok
    FROM
      tache_verifie_utilisateur
    GROUP BY
      matricule,
      DATE_TRUNC('month', date_verification)
    ORDER BY
      matricule ASC,
      mois ASC;
  `;

  try {
    const { rows } = await db.query(query);
    return rows;
  } catch (err) {
    console.error(
      "Erreur lors de la récupération des tâches par mois :",
      err
    );
    throw err;
  }
}

module.exports = {
  heuresParPhase,
  setTachesAutoVerified,
  assignation_sans_condition,
  getTacheByRef,
  getUsersTacheAvecEmails,
  getAvancementGlobalParProjet,
  getAvancementParPhaseParProjet,
  insert_tache,
  insert_sous_tache,
  assignerUtilisateurTache,
  assignerUtilisateurSousTache,
  getTaches,
  get_sous_tache,
  delete_tache,
  delete_tache_foreign,
  delete_sous_tache,
  getAllUserTachesAccomplies,
  getTachesEtSousTachesParUtilisateur,
  update_statut_termine,
  update_statut_en_cours,
  getSousTaches,
  find_tache_files,
  find_all_tache_files,
  add_tache_files,
  getTachesAccompliesParUtilisateur,
  getTachesEnCoursParUtilisateur,
  insert_temps_tache,
  get_taches_terminees_non_verifiees,
  get_taches_terminees_verifiees,
  insert_tache_verifie_user,
  getTachesVerifieesParUtilisateur,
  getTachesVerifieesParSemaine,
  getTachesVerifieesParMois,
};
