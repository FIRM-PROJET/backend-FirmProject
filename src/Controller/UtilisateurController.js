const service = require('../Service/UtilisateurService');
const jwt = require('jsonwebtoken');

async function logIn(req, res) {
  const { email, mot_de_passe } = req.body;
  try {
    const user = await service.authenticate(email, mot_de_passe);
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    // Générer un token JWT
    const payload = {
      matricule: user.matricule,
      email: user.email,
      nom: user.nom,
      mot_de_passe:user.mot_de_passe,
      prenom: user.prenom,
      intitule_poste: user.intitule_poste,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    res.json({
      message: 'Connexion réussie',
      utilisateur: user,
      token: token,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
}

async function getAll(req, res) {
  try {
    const users = await service.findAll();
    res.json(users);
  } catch {
    res.status(500).send('Erreur serveur');
  }
}

async function createUser(req, res) {
  try {
    const user = await service.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
}
async function changerMotDePasse(req, res) {
  const { matricule, nouveauMotDePasse } = req.body;

  try {
    const result = await service.updatePassword(matricule, nouveauMotDePasse);
    res.json(result);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
}
async function supprimerUtilisateur(req, res) {
  const { matricule } = req.params;
  try {
    const result = await service.deleteUser(matricule);
    res.json(result);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
}
async function module_access(req, res) {
  const { matricule } = req.params;
  try {
    const modules = await service.module_user_access(matricule);
    res.json(modules);
  }catch (err) {
    res.status(500).send('Erreur serveur : ' + err.message);
  }
}
async function getByEmail(req, res) {
  const { email } = req.params;
  try {
    const user = await service.get_user_by_email(email);
    res.json(user);
  }catch (err) {
    res.status(500).send('Erreur serveur : ' + err.message);
  }
}
// Mise à jour des infos utilisateur
  async function updateUtilisateur  (req, res) {
    try {
      const { matricule } = req.params;
      const updated = await service.updateUtilisateur(matricule, req.body);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
    async function checkAncienPassword  (req, res) {
    try {
      const { matricule ,mot_de_passe } = req.body;
      const result = await service.checkAncienPassword(matricule,mot_de_passe);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
module.exports = { getAll, createUser ,logIn ,changerMotDePasse ,supprimerUtilisateur,module_access,updateUtilisateur,checkAncienPassword,getByEmail};
