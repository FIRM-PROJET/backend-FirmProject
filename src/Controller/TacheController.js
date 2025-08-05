const tacheService = require("../Service/TacheService");
const projet = require("../Service/ProjetService");
const path = require("path");
const multer = require("multer");

// Créer une tâche
async function create_tache(req, res) {
  try {
    const ref = await tacheService.insert_tache(req.body);
    res.status(201).json({ ref_tache: ref });
  } catch (error) {
    res
      .status(500)
      .send("Erreur lors de la création de la tâche : " + error.message);
  }
}

// Créer une sous-tâche
async function create_sous_tache(req, res) {
  try {
    const ref = await tacheService.insert_sous_tache(req.body);
    res.status(201).json({ ref_sous_tache: ref });
  } catch (error) {
    res
      .status(500)
      .send("Erreur lors de la création de la sous-tâche : " + error.message);
  }
}

// Assigner un utilisateur à une tâche
async function assign_user_tache(req, res) {
  try {
    const { matricule, ref_tache } = req.body;
    await tacheService.assignerUtilisateurTache(matricule, ref_tache);
    res.status(200).json({ message: "Utilisateur assigné à la tâche." });
  } catch (error) {
    res.status(400).json({
      message: `Assignation refusée : ${error.message || "Erreur inconnue"}`,
    });
  }
}

// Assigner un utilisateur à une sous-tâche
async function assign_user_sous_tache(req, res) {
  try {
    const { matricule, ref_sous_tache } = req.body;
    await tacheService.assignerUtilisateurSousTache(matricule, ref_sous_tache);
    res.status(200).json({ message: "Utilisateur assigné à la sous-tâche." });
  } catch (error) {
    res
      .status(500)
      .send("Erreur assignation utilisateur sous-tâche : " + error.message);
  }
}

// Récupérer une tâche complète (avec statut et utilisateurs)
async function get_tache(req, res) {
  try {
    const { ref_tache } = req.params;
    if (!ref_tache) {
      return res.status(400).json({ error: "ref_tache est requis" });
    }
    const taches = await tacheService.getTaches(ref_tache);
    res.status(200).json(taches);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur récupération tâche : " + error.message });
  }
}

// Récupérer les sous-tâches d'une tâche (tu peux aussi ajuster le paramètre)
async function get_details_sous_taches(req, res) {
  try {
    const { ref_sous_taches } = req.params;
    if (!ref_sous_taches) {
      return res.status(400).json({ error: "ref_sous_taches est requis" });
    }
    const sousTaches = await tacheService.getSousTaches(ref_sous_taches);
    res.status(200).json(sousTaches);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur récupération sous-tâches : " + error.message });
  }
}
async function delete_tache_controller(req, res) {
  try {
    const { ref_tache } = req.params;
    await tacheService.delete_tache(ref_tache);
    res
      .status(200)
      .json({ message: "Tâche et toutes ses dépendances supprimées." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la suppression : " + error.message });
  }
}
async function delete_sous_tache_controller(req, res) {
  try {
    const { ref_sous_tache } = req.params;
    if (!ref_sous_tache) {
      return res.status(400).json({ error: "ref_sous_tache est requis" });
    }
    await tacheService.delete_sous_tache(ref_sous_tache);
    res.status(200).json({ message: "Sous-tâche supprimée." });
  } catch (error) {
    console.error("Erreur suppression sous-tâche :", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la suppression : " + error.message });
  }
}
async function get_user_task(req, res) {
  try {
    const { matricule } = req.params;
    if (!matricule) {
      return res.status(400).json({ error: "matricule est requis" });
    }

    const result = await tacheService.getTachesEtSousTachesParUtilisateur(
      matricule
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur lors de la récupération de tâches:", error);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
}

async function get_all_taches(req, res) {
  try {
    const taches = await tacheService.getTaches();
    res.json(taches);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur");
  }
}
async function get_all_sous_tache(req, res) {
  const { ref_tache } = req.params;
  try {
    const result = await tacheService.get_sous_tache(ref_tache);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur");
  }
}
async function get_all_unite(req, res) {
  try {
    const unites = await projet.listeGenerique(`*`, `unite_duree`);
    res.json(unites);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur");
  }
}

// Mettre à jour le statut "terminé"
async function update_statut_termine(req, res) {
  try {
    const { ref_tache, ref_sous_tache } = req.body;
    await tacheService.update_statut_termine({ ref_tache, ref_sous_tache });
    res.status(200).json({ message: "Statut mis à jour en 'terminé'." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur mise à jour statut terminé : " + error.message });
  }
}

// Mettre à jour le statut "en cours"
async function update_statut_en_cours(req, res) {
  try {
    const { ref_tache, ref_sous_tache } = req.body;
    await tacheService.update_statut_en_cours({ ref_tache, ref_sous_tache });
    res.status(200).json({ message: "Statut mis à jour en 'en cours'." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur mise à jour statut en cours : " + error.message });
  }
}

//TACHE FILES & DOWNLOAD
// Stockage unique pour tous les fichiers des taches
const tache_files_storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../files/projets"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload_tache_files = multer({ storage: tache_files_storage }).single("fichier");
// Récupérer les fichiers d'une tâche
async function upload_tache(req, res) {
  upload_tache_files(req, res, async (err) => {
    if (err)
      return res.status(500).json({ error: "Erreur upload fichier projet" });

    try {
      const { ref_tache } = req.body;
      const nom_fichier = req.file.originalname;
      const chemin_fichier = req.file.filename;

      const result = await tacheService.add_tache_files({
        ref_tache,
        nom_fichier,
        chemin_fichier,
        type_fichier,
      });
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Erreur BDD fichier projet" });
    }
  });
}
exports.getTacheFiles = async (req, res) => {
  try {
    const { ref_tache } = req.params;
    const files = await find_tache_files(ref_tache);
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getAllTacheFiles = async (req, res) => {
  try {
    const files = await find_all_tache_files();
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.downloadTacheFile = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "../../files/projets", filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) return res.status(404).json({ error: "Fichier non trouvé" });
    res.download(filePath);
  });
};

exports.uploadTacheFile = async (req, res) => {
  try {
    const { ref_tache } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: "Aucun fichier fourni" });

    const data = {
      ref_tache,
      nom_fichier: file.originalname,
      chemin_fichier: file.filename,
    };

    const inserted = await upload_tache(data);
    res.json(inserted);
  } catch (err) {
    res.status(500).json({ error: "Erreur d'upload" });
  }
};

module.exports = {
  create_tache,
  create_sous_tache,
  assign_user_tache,
  assign_user_sous_tache,
  get_tache,
  get_details_sous_taches,
  get_all_sous_tache,
  delete_sous_tache_controller,
  delete_tache_controller,
  get_all_taches,
  get_all_unite,
  get_user_task,
  update_statut_termine,
  update_statut_en_cours,
};
