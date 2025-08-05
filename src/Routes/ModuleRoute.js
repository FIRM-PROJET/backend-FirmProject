const express = require('express');
const ctrl = require('../Controller/ModuleController');
const router = express.Router();

router.get('/', ctrl.getAll);
router.post('/add_new_module_access', ctrl.add_new_module);
router.delete('/delete_module_access/:ref_module/:matricule', ctrl.delete_module_access);
router.get('/is_admin/:matricule', ctrl.isAdmin); 

module.exports = router;
