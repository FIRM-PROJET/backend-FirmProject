const CommentaireService = require("../Service/CommentaireService");
const tacheService = require("../Service/TacheService");
const UtilisateurService = require("../Service/UtilisateurService");
const notificationService = require("../Service/NotificationService");

const { notifyNewComment } = require("../Service/NotificationService");
const ajouterCommentaire = async (req, res) => {
  try {
    const { matricule, commentaire, ref_tache, ref_sous_tache } = req.body;
    if ((ref_tache && ref_sous_tache) || (!ref_tache && !ref_sous_tache)) {
      return res.status(400).json({
        message:
          "Vous devez fournir soit ref_tache, soit ref_sous_tache, mais pas les deux.",
      });
    }

    // Ajout du commentaire en base
    await CommentaireService.new_commentaire({
      matricule,
      commentaire,
      ref_tache: ref_tache || null,
      ref_sous_tache: ref_sous_tache || null,
    });

    const expireAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

    if (ref_tache) {
      const tache = await tacheService.getTacheByRef(ref_tache);
      if (!tache) {
        return res.status(404).json({ message: "Tâche non trouvée." });
      }
      // Récupérer tous les utilisateurs assignés à la tâche
      const utilisateurs = await tacheService.getUsersTacheAvecEmails(
        ref_tache
      );
      for (const user of utilisateurs) {
        if (user.matricule !== matricule) {
          const messageNotif = `Un nouveau commentaire a été ajouté à la tâche "${tache.nom_tache}" par ${user.nom} , '"${commentaire}"'.`;
          try {
            await notificationService.addNotification(
              user.matricule,
              messageNotif,
              expireAt
            );
          } catch (err) {
            console.error(`Erreur ajout notification pour ${user.nom}:`, err);
          }
        }
      }

      // Envoi des emails à tous les assignés
      try {
        await notifyNewComment(ref_tache, matricule, commentaire);
      } catch (err) {
        console.error("Erreur lors de l'envoi de l'email :", err);
      }
    }

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
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des commentaires.",
    });
  }
};

module.exports = {
  getCommentaires,
  ajouterCommentaire,
};
