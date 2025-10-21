const deleteService = require("../Service/DeleteService");
const archiver = require("archiver");
const path = require("path");
const fs = require("fs");
module.exports = {
  async supprimerModuleProjet(req, res) {
    const { ref_projet } = req.params;
    if (!ref_projet)
      return res.status(400).json({ error: "ref_projet manquant" });

    try {
      await deleteService.deleteModuleProjet(ref_projet);
      res.json({
        message: "Module projet et toutes ses dépendances supprimés",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Erreur serveur lors de la suppression du module projet",
      });
    }
  },

  async supprimerProjet(req, res) {
    const { id_projet } = req.params;
    if (!id_projet)
      return res.status(400).json({ error: "id_projet manquant" });

    try {
      await deleteService.deleteProjet(id_projet);
      res.json({ message: "Projet et ses liaisons supprimés" });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Erreur serveur lors de la suppression du projet" });
    }
  },

  async supprimerTache(req, res) {
    const { ref_tache } = req.params;
    if (!ref_tache)
      return res.status(400).json({ error: "ref_tache manquant" });

    try {
      await deleteService.deleteTache(ref_tache);
      res.json({ message: "Tâche et ses dépendances supprimées" });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Erreur serveur lors de la suppression de la tâche" });
    }
  },

  async supprimerNotificationsExpirees(req, res) {
    try {
      await deleteService.deleteExpiredNotifications();
      res.json({ message: "Notifications expirées supprimées" });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error:
          "Erreur serveur lors de la suppression des notifications expirées",
      });
    }
  },

  async telechargerZipParProjet(req, res) {
    const { ref_projet } = req.params;

    try {
      // 1. Récupérer les fichiers du projet
      const fichiersObj = await deleteService.getFichiersParProjet(ref_projet);
      const fichiers = fichiersObj[ref_projet];

      if (!fichiers || fichiers.length === 0) {
        return res
          .status(404)
          .json({ message: "Aucun fichier trouvé pour ce projet" });
      }

      // 2. Nom du fichier ZIP basé sur le premier fichier + date pour éviter collisions
      const firstFileName = fichiers[0].nom_fichier.replace(/\s+/g, "_"); // remplacer espaces
      const now = new Date();
      const dateStr = now.toISOString().replace(/[:.-]/g, "");
      const zipName = `${firstFileName}_${dateStr}.zip`;

      // Définir les headers pour le téléchargement
      res.setHeader("Content-Disposition", `attachment; filename="${zipName}"`);
      res.setHeader("Content-Type", "application/zip");

      // 3. Créer le flux de zip
      const archive = archiver("zip", { zlib: { level: 9 } });

      // Gestion des erreurs d'archivage
      archive.on("error", (err) => {
        console.error("Erreur lors de l'archivage :", err.message);
        res.status(500).send({ error: err.message });
      });

      // 4. Pipe l'archive vers la réponse HTTP
      archive.pipe(res);

      // 5. Ajouter chaque fichier au zip avec son nom réel
      for (const f of fichiers) {
        const filePath = path.join(
          __dirname,
          "../../files/projets",
          f.chemin_fichier
        );
        console.log("Chemin du fichier:", filePath);

        // Vérifie si le fichier existe avant de l'ajouter
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: f.nom_fichier });
        } else {
          console.warn(`Fichier non trouvé : ${filePath}`);
        }
      }

      // 6. Finaliser l'archive
      await archive.finalize();
    } catch (err) {
      console.error("Erreur téléch. zip:", err);
      res.status(500).json({ message: "Erreur lors de la création du ZIP" });
    }
  },
};
