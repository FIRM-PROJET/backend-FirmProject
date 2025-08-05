const module_projet = require("../Service/ModuleProjetService");

const addNewProject = async (req, res) => {
  try {
    const project = await module_projet.add_new_project(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error("Erreur création projet :", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const addProjectPhase = async (req, res) => {
  try {
    const phase = await module_projet.add_project_phase(req.body);
    res.status(201).json({ success: true, data: phase });
  } catch (error) {
    console.error("Erreur ajout phase :", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const assignUserToPhase = async (req, res) => {
  try {
    const data = await module_projet.add_project_utilisateur(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error("Erreur assignation utilisateur :", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeUserFromPhase = async (req, res) => {
  try {
    await module_projet.delete_project_utilisateur(req.body);
    res.status(200).json({ success: true, message: "Utilisateur retiré avec succès" });
  } catch (error) {
    console.error("Erreur suppression utilisateur phase :", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const listUsersByPhase = async (req, res) => {
  try {
    const users = await module_projet.get_users_by_phase(req.body);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Erreur récupération utilisateurs :", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const listPhasesByProject = async (req, res) => {
  try {
    const ref_projet = req.params.ref_projet;
    const phases = await module_projet.get_phases_by_project(ref_projet);
    res.status(200).json({ success: true, data: phases });
  } catch (error) {
    console.error("Erreur récupération phases :", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const listAllProjects = async (req, res) => {
  try {
    const projects = await module_projet.get_all_projects();
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    console.error("Erreur récupération projets :", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const listAllPhases = async (req, res) => {
  try {
    const phases = await module_projet.get_all_phases();
    res.status(200).json({ success: true, data: phases });
  } catch (error) {
    console.error("Erreur récupération phases globales :", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProjectPhase = async (req, res) => {
  try {
    const { ref_projet, id_phase } = req.params;
    const success1 = await module_projet.delete_project_phase(ref_projet, id_phase);
    const success2 = await module_projet.delete_user_project(ref_projet);

    if (success1 && success2) {
      res.status(200).json({ message: "Phase supprimée avec succès." });
    } else {
      res.status(404).json({ message: "Phase non trouvée." });
    }
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur lors de la suppression." });
  }
};

const updateProjectPhase = async (req, res) => {
  try {
    const updatedPhase = await module_projet.update_project_phase(req.body);
    if (updatedPhase) {
      res.status(200).json(updatedPhase);
    } else {
      res.status(404).json({ message: "Phase non trouvée ou non modifiée." });
    }
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur lors de la mise à jour." });
  }
};
module.exports = {
  deleteProjectPhase,
  updateProjectPhase,
  addNewProject,
  addProjectPhase,
  assignUserToPhase,
  removeUserFromPhase,
  listUsersByPhase,
  listPhasesByProject,
  listAllProjects,
  listAllPhases,
};
