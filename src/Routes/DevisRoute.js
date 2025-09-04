const express = require('express');
const ctrl = require('../Controller/DevisController');
const router = express.Router();

router.post('/new_devis', ctrl.ajouterFicheEstimationComplete);
router.get('/', ctrl.get_all_estimation);
router.get('/devis_details/:id', ctrl.getVueDevis);
router.get('/prev_projects/:code_fiche', ctrl.get_old_project);
router.delete('/:id',ctrl.delete_fiche_validation);
router.delete("/projets/:id_projet", ctrl.deleteProjet);

module.exports = router;
