const express = require("express");
const router = express.Router();
const ctrl = require("../Controller/DeleteController");

// --- Module projet ---
router.delete("/module_projet/:ref_projet", ctrl.supprimerModuleProjet);

// --- Projet Réferrent Devis  ---
router.delete("/projet/:id_projet", ctrl.supprimerProjet);

// --- Tâche ---
router.delete("/tache/:ref_tache", ctrl.supprimerTache);

// --- Notifications expirées ---
router.delete("/notifications_expirees", ctrl.supprimerNotificationsExpirees);

router.get("/telecharger-zip/:ref_projet", ctrl.telechargerZipParProjet);

module.exports = router;
