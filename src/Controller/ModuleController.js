const modules = require ('../Service/ModuleService');

async function getAll(req, res) {
  try {
    const module = await modules.findAll();
    res.json(module);
  } catch {
    res.status(500).send('Erreur serveur');
  }
}
async function add_new_module(req, res) {
  try {
    const module_access = await modules.add_new_module_access(req.body);
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(400).send(err.message);
  }
}

async function delete_module_access (req, res) {
  try {
    const { ref_module, matricule } = req.params;
    const result = await modules.delete_module_access(ref_module, matricule);
    res.status(200).json({ message: "Suppression réussie", result });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
async function isAdmin(req, res) {
  try {
    const { matricule } = req.params;
    const result = await modules.checkIsAdmin(matricule);
    res.status(200).json({ isAdmin: result }); 
  } catch (err) {
    res.status(500).send("Erreur lors de la vérification");
  }
}

module.exports = { getAll, add_new_module,  delete_module_access,isAdmin};
