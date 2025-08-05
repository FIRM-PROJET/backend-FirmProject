const express = require('express');
const ctrl    = require('../Controller/UtilisateurController');
const router  = express.Router();

router.get('/',            ctrl.getAll);
router.post('/',           ctrl.createUser);
router.post('/auth',           ctrl.logIn);
router.put('/updatePassword', ctrl.changerMotDePasse);
router.post('/checkCurrentPassword', ctrl.checkAncienPassword)
router.delete('/:matricule', ctrl.supprimerUtilisateur);
router.get('/modelAccess/:matricule', ctrl.module_access);
router.put('/update/:matricule', ctrl.updateUtilisateur);
router.get('/get_user/:email', ctrl.getByEmail);



module.exports = router;
