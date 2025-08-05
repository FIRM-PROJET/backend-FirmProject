const devisService = require("../Service/DevisService");
const projet = require("../Service/ProjetService");

const ajouterFicheEstimationComplete = async (req, res) => {
  try {
    const ficheData = req.body;

    // 1. Ajouter la fiche d'estimation principale
    const fiche = await devisService.add_fiche_estimation_devis(ficheData);
    const id_fiche = fiche.id_fiche_estimation;

    // 2. Ajouter les montants des travaux standards si fournis
    if (ficheData.travaux_standards && ficheData.travaux_standards.length > 0) {
      for (const t of ficheData.travaux_standards) {
        await devisService.insertMontantTravauxStandard({
          id_fiche_estimation: id_fiche,
          id_travaux: t.id_travaux,
          montant_travaux: t.montant_travaux,
        });
      }
    }

    // 3. Ajouter les travaux personnalisés si fournis
    if (ficheData.travaux_custom && ficheData.travaux_custom.length > 0) {
      for (const t of ficheData.travaux_custom) {
        await devisService.insertTravauxCustom({
          id_fiche_estimation: id_fiche,
          nom_travaux_custom: t.nom_travaux_custom,
          montant_travaux_custom: t.montant_travaux_custom,
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: "Fiche d'estimation complète ajoutée avec succès",
      data: fiche,
    });
  } catch (error) {
    console.error(
      "Erreur lors de l'ajout de la fiche d'estimation complète:",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de l'ajout de la fiche complète.",
      error: error.message,
    });
  }
};
const getVueDevis = async (req, res) => {
  try {
    const idFiche = req.params.id; // Récupération de l'ID depuis l'URL
    const rows = await devisService.getVueDevisComplet(idFiche); // Utilisation de l'ID

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Aucune fiche d'estimation trouvée pour l'ID ${idFiche}`,
      });
    }
    // Regroupement par fiche d'estimation
    const fichesMap = new Map();
    rows.forEach((row) => {
      const id = row.id_fiche_estimation;
      if (!fichesMap.has(id)) {
        fichesMap.set(id, {
          id_fiche_estimation: row.id_fiche_estimation,
          code_fiche: row.code_fiche,
          version: row.version,
          nom_devis: row.nom_devis,
          coursAriary:row.cours_ariary,
          nom_maitre_ouvrage: row.nom_maitre_ouvrage,
          type_surface: row.type_surface,
          surface_moyenne: row.surface_moyenne,
          surface_totale: row.surface_totale,
          date_creation: row.date_creation,
          projet_referrent:row.projet_referrent,
          travaux_standards: [],
          travaux_custom: [],
        });
      }

      const fiche = fichesMap.get(id);

      // Ajout des travaux standards
      if (
        row.id_travaux !== null &&
        !fiche.travaux_standards.some((t) => t.id_travaux === row.id_travaux)
      ) {
        fiche.travaux_standards.push({
          id: row.id_travaux,
          nom_travaux : row.nom_travaux,
          montant: row.montant_travaux,
        });
      }

      // Ajout des travaux custom
      if (
        row.id_custom_travaux !== null &&
        !fiche.travaux_custom.some(
          (t) => t.nom_travaux_custom === row.nom_travaux_custom
        )
      ) {
        fiche.travaux_custom.push({
          nom_travaux_custom: row.nom_travaux_custom,
          montant_travaux_custom: row.montant_travaux_custom,
        });
      }
    });

    const result = Array.from(fichesMap.values());

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Erreur récupération vue devis organisée :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des devis.",
      error: error.message,
    });
  }
};

async function get_all_estimation(req, res) {
  try {
    const estimations = await projet.listeGenerique(
      `id_fiche_estimation, code_fiche, version, nom_devis, nom_maitre_ouvrage, date_creation,cours_ariary`,
      `fiche_estimation_devis`
    );
    res.json(estimations);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur");
  }
}
async function delete_fiche_validation(req, res) {
  const id_fiche_estimation = req.params.id;
  try {
    const result = await devisService.delete_fiche_validation(id_fiche_estimation);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur");
  }
}
async function get_old_project(req, res) {
  const code_fiche = req.params.code_fiche;
  try {
    const result = await devisService.getPreviousProjetReferrent(code_fiche);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur");
  }
}

module.exports = {
  ajouterFicheEstimationComplete,
  getVueDevis,
  get_all_estimation,
  delete_fiche_validation,get_old_project
};
