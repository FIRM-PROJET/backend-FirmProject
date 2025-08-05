const express = require("express");
const router = express.Router();
const CommentaireController = require("../Controller/CommentaireController");

router.post("/new", CommentaireController.ajouterCommentaire);
router.get("/get_c_tache/:ref_tache", CommentaireController.getCommentaires);
router.get("/get_c_sous_tache/:ref_sous_tache", CommentaireController.getCommentaires);

module.exports = router;
