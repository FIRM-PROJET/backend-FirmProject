const express = require("express");
const multer = require("multer");
const ctrl = require("../Controller/TacheController");
const router = express.Router();
const path = require("path");

router.post("/create_tache", ctrl.create_tache);
router.post("/create_sous_tache", ctrl.create_sous_tache);
router.post("/assign_user_tache", ctrl.assign_user_tache);
router.post("/assign_user_sous_tache", ctrl.assign_user_sous_tache);
router.get("/details_taches/:ref_tache", ctrl.get_tache);
router.get(
  "/details_sous-taches/:ref_sous_taches",
  ctrl.get_details_sous_taches
);
router.get("/user_task/:matricule", ctrl.get_user_task);
router.get("/", ctrl.get_all_taches);
router.get("/sous_tache/:ref_tache", ctrl.get_all_sous_tache);
router.get("/unite_duree", ctrl.get_all_unite);
router.delete("/delete_taches/:ref_tache", ctrl.delete_tache_controller);
router.delete(
  "/delete_sous-taches/:ref_sous_tache",
  ctrl.delete_sous_tache_controller
);
router.post("/statut_termine", ctrl.update_statut_termine);
router.post("/statut_en_cours", ctrl.update_statut_en_cours);

// Configuration de multer pour les fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../files/projets"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.get("/task_files/:ref_tache", ctrl.getTacheFiles);
router.get("/all_files/", ctrl.getAllTacheFiles);
router.post("/task_files/upload", upload.single("file"), ctrl.uploadTacheFile);
router.get("/download_files/:filename", ctrl.downloadTacheFile);

router.get("/avancementParPhase", ctrl.AvancementParPhaseParProjet);
router.get("/avancementParProjet", ctrl.AvancementGlobalParProjet);


module.exports = router;
