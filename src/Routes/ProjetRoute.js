const express = require("express");
const ctrl = require("../Controller/ProjetController");
const path = require("path");
const router = express.Router();
const XLSX = require("xlsx");

router.get("/", ctrl.getAll);
router.get("/type_construction", ctrl.get_type_construction);
//Projets meme type de construction
router.get(
  "/project_referrent/:id_type_construction",
  ctrl.get_project_referrent
);
//Fichiers d'un projet
router.get("/files_project/:id_projet", ctrl.get_files_project);
router.get("/devis_files_project/:id_projet", ctrl.get_devis_project);
//Details d'un projet
router.get("/project_details/:id_projet", ctrl.get_project_details_by_id);
//Liste des surfaces_projet
router.get("/surface_projet/:id_projet", ctrl.get_surface_projet);
router.get("/types_surfaces", ctrl.get_type_surface);
router.post("/add", ctrl.post_create_project);
router.post("/add_project_details", ctrl.post_create_project_details);
// Route pour télecharger un fichier de devis
router.get("/devisFiles/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "../../files/devis", filename);
  res.download(filePath);
});
// Route pour télecharger une image
router.get("/imagesFiles/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "../../files/images", filename);
  res.download(filePath);
});
//Route pour afficher une image
router.get("/view-image/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "../../files/images", filename);

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Erreur lors de l'envoi du fichier:", err);
      res.status(404).send("Image non trouvée");
    }
  });
});
// Route pour lire un fichier Excel et renvoyer les designation et montant(col A et C)
router.get("/readExcel/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "../../files/devis", filename);
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // On prend la première feuille
    const worksheet = workbook.Sheets[sheetName];

    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    const result = [];

    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const cellA = worksheet[`A${row + 1}`];
      const cellB = worksheet[`B${row + 1}`];
      const cellC = worksheet[`C${row + 1}`];

      const valueA = cellA ? cellA.v : null;
      const valueB = cellB ? cellB.v : null;
      const rawC = cellC ? cellC.v : null;
      const valueC = rawC === null || rawC === "" || rawC === 0 ? 0 :  Math.floor(rawC);

      result.push({
        id_travaux: valueA,
        nom_travaux: valueB,
        montant: valueC,
      });
    }

    res.json(result);
  } catch (err) {
    console.error("Erreur lecture fichier Excel:", err.message);
    res
      .status(500)
      .json({ error: "Erreur lors de la lecture du fichier Excel" });
  }
});
router.get("/fondation", ctrl.get_fondation);
router.get("/menuiserie", ctrl.get_menuiserie);
router.get("/structure", ctrl.get_structure);
router.get("/toiture", ctrl.get_toiture);
router.get("/type_plancher", ctrl.get_type_plancher);
router.post("/upload_devis", ctrl.upload_devis_file);
router.post("/upload_image", ctrl.upload_image_file);
router.get("/client", ctrl.get_client);
router.post("/create_client", ctrl.create_new_client);
router.get("/max_date_phase/:id_projet", ctrl.get_max_date_phase);
router.get("/all_projet_phases", ctrl.AllProjetPhases);

module.exports = router;
