const CommentaireService = require("../Service/CommentaireService");

const ajouterCommentaire = async (req, res) => {
  try {
    const { matricule, commentaire, ref_tache, ref_sous_tache } = req.body;
    // Vérifie que l'un des deux seulement est fourni
    if ((ref_tache && ref_sous_tache) || (!ref_tache && !ref_sous_tache)) {
      return res.status(400).json({
        message:
          "Vous devez fournir soit ref_tache, soit ref_sous_tache, mais pas les deux.",
      });
    }

    await CommentaireService.new_commentaire({
      matricule,
      commentaire,
      ref_tache: ref_tache || null,
      ref_sous_tache: ref_sous_tache || null,
    });

    res.status(201).json({ message: "Commentaire ajouté avec succès." });
  } catch (error) {
    console.error("Erreur lors de l'ajout du commentaire :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de l'ajout du commentaire." });
  }
};

const getCommentaires = async (req, res) => {
  try {
    const { ref_tache, ref_sous_tache } = req.params;

    if (ref_tache && ref_sous_tache) {
      return res.status(400).json({
        message:
          "Vous devez fournir soit ref_tache, soit ref_sous_tache, mais pas les deux.",
      });
    }

    let commentaires;
    if (ref_tache) {
      commentaires = await CommentaireService.getCommentairesParTache(
        ref_tache
      );
    } else if (ref_sous_tache) {
      commentaires = await CommentaireService.getCommentairesParSousTache(
        ref_sous_tache
      );
    } else {
      return res.status(400).json({ message: "Aucune référence fournie." });
    }

    res.status(200).json(commentaires);
  } catch (error) {
    console.error("Erreur lors de la récupération des commentaires :", error);
    res
      .status(500)
      .json({
        message: "Erreur serveur lors de la récupération des commentaires.",
      });
  }
};

module.exports = {
  getCommentaires,
  ajouterCommentaire,
};
