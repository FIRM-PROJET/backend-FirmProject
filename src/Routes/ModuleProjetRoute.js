const express = require("express");
const router = express.Router();
const m_projetController = require("../Controller/ModuleProjetController");

// Projet
router.post("/", m_projetController.addNewProject);
router.get("/projets", m_projetController.listAllProjects);

// Phases globales
router.get("/phases", m_projetController.listAllPhases);

// Phases d’un projet
router.post("/projet_phase", m_projetController.addProjectPhase);
router.get("/phase_projet/:ref_projet", m_projetController.listPhasesByProject);
router.put("/phase/fin_reelle", m_projetController.updateFinReellePhase);

// Utilisateurs par phase
router.post("/add_user_phase", m_projetController.assignUserToPhase);
router.delete("/delete_user_phase",m_projetController.removeUserFromPhase);
router.post("/user_phase",m_projetController.listUsersByPhase);

router.delete("/phase/:ref_projet/:id_phase", m_projetController.deleteProjectPhase);
router.put("/phase", m_projetController.updateProjectPhase);

module.exports = router;
