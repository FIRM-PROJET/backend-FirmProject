const { get } = require('../Routes/ProjetRoute');
const projet = require('../Service/ProjetService');
const  multer = require('multer');
const path = require('path');


async function getAll(req, res) {
  try {
    const projects = await projet.findAll();
    res.json(projects);
  } catch {
    res.status(500).send('Erreur serveur');
  }
}

async function get_type_construction(req, res) {
  try {
    const types = await projet.listeGenerique(
      "id_type_construction,nom_type_construction,description",
      "type_construction"
    );
    res.json(types);
  } catch {
    res.status(500).send('Erreur serveur');
  }
}

async function get_surface_projet(req, res) {
  const { id_projet } = req.params;
  try {
    const surfaces = await projet.find_type_surface(id_projet);
    res.json(surfaces);
  } catch {
    res.status(500).send('Erreur serveur');
  }
}

async function get_project_referrent(req, res) {
  const { id_type_construction } = req.params;
  try {
    const projects = await projet.find_project_by_type_construction(id_type_construction);
    res.json(projects);
  } catch (err) {
    res.status(500).send('Erreur serveur : ' + err.message);
  }
}

async function get_files_project(req, res) {
  const { id_projet } = req.params;
  try {
    const files = await projet.find_project_files(id_projet);
    res.json(files);
  } catch (err) {
    res.status(500).send('Erreur serveur : ' + err.message);
  }
}

async function get_devis_project(req, res) {
  const { id_projet } = req.params;
  try {
    const files = await projet.find_devis_files(id_projet);
    res.json(files);
  } catch (err) {
    res.status(500).send('Erreur serveur : ' + err.message);
  }
}

async function get_project_details_by_id(req, res) {
  const { id_projet } = req.params;
  try {
    const projectDetails = await projet.find_project_details_by_id(id_projet);
    res.json(projectDetails);
  } catch (err) {
    res.status(500).send('Erreur serveur : ' + err.message);
  }
}

async function post_create_project(req, res) {
  try {
    const newProject = await projet.create_project(req.body);
    res.status(201).json(newProject);
  } catch (err) {
    res.status(500).send('Erreur lors de la création du projet : ' + err.message);
  }
}

async function post_create_project_details(req, res) {
  try {
    const newDetails = await projet.create_details_projet(req.body);
    res.status(201).json(newDetails);
  } catch (err) {
    res.status(500).send('Erreur lors de l’insertion des détails : ' + err.message);
  }
}
async function post_add_surface_projet(req, res) {
  try {
    const { id_projet, surfaceSHAB, surfaceSHON, surfaceSHOB } = req.body;
    const surface_projet = await projet.add3_surface_projet(
      id_projet,
      surfaceSHAB,
      surfaceSHON,
      surfaceSHOB
    );
    res.status(201).json(surface_projet);
  } catch (err) {
    res.status(500).send("Erreur lors de l’insertion des détails : " + err.message);
  }
}


async function create_new_client(req, res) {
  try {
    const newClients = await projet.create_client(req.body);
    res.status(201).json(newClients);
  } catch (err) {
    res.status(500).send('Erreur lors de l’insertion des détails : ' + err.message);
  }
}

async function get_fondation(req, res) {
  try {
    const types = await projet.listeGenerique(
      "id_fondation,nom",
      "fondation"
    );
    res.json(types);
  } catch {
    res.status(500).send('Erreur serveur');
  }
}
async function get_menuiserie(req, res) {
  try {
    const types = await projet.listeGenerique(
      "id_menuiserie,nom",
      "menuiserie"
    );
    res.json(types);
  } catch {
    res.status(500).send('Erreur serveur');
  }
}
async function get_structure(req, res) {
  try {
    const types = await projet.listeGenerique(
      "id_structure,nom",
      "structure"
    );
    res.json(types);
  } catch {
    res.status(500).send('Erreur serveur');
  }
}

async function get_toiture (req, res) {
  try {
    const types = await projet.listeGenerique(
      "id_toiture,nom",
      "toiture"
    );
    res.json(types);
  } catch {
    res.status(500).send('Erreur serveur');
  }
}
async function get_client(req, res) {
  try {
    const types = await projet.listeGenerique(
      "id_client,nom",
      "client"
    );
    res.json(types);
  } catch {
    res.status(500).send('Erreur serveur');
  }
}

async function get_type_plancher(req, res) {
  try {
    const types = await projet.listeGenerique(
      "id_type_plancher,nom",
      "type_plancher"
    );
    res.json(types);
  } catch {
    res.status(500).send('Erreur serveur');
  }
}

async function get_type_surface(req, res) {
  try {
    const types = await projet.listeGenerique(
      "id_type_surface,nom,description",
      "type_surface"
    );
    res.json(types);
  } catch {
    res.status(500).send('Erreur serveur');
  }
}
async function AllProjetPhases(req, res) {
  try {
    const projets_phase = await projet.getAllProjetPhases();
    res.json(projets_phase);
  } catch {
    res.status(500).send('Erreur serveur');
  }
}

//IMPORTATION FICHIERS DEVIS
const devisStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../files/devis'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
//IMPORTATION IMAGES
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../files/images'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const uploadDevis = multer({ storage: devisStorage }).single('fichier');
const uploadImage = multer({ storage: imageStorage }).single('fichier');

async function upload_devis_file(req, res) {
  uploadDevis(req, res, async (err) => {
    if (err) return res.status(500).json({ error: "Erreur upload fichier devis" });

    try {
      const { id_projet } = req.body;
      const nom_fichier = req.file.originalname;
      const chemin_fichier = req.file.filename;

      const result = await projet.add_devis_files({ id_projet, nom_fichier, chemin_fichier });
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Erreur BDD devis" });
    }
  });
}
async function upload_image_file(req, res) {
  uploadImage(req, res, async (err) => {
    if (err) return res.status(500).json({ error: "Erreur upload image" });

    try {
      const { id_projet } = req.body;
      const nom_fichier = req.file.originalname;
      const chemin_fichier = req.file.filename;

      const result = await projet.add_image_files({ id_projet, nom_fichier, chemin_fichier });
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Erreur BDD image" });
    }
  });
}

async function get_max_date_phase(req, res) {
  const { id_projet } = req.params;
  try {
    const result = await projet.find_max_date_phase_by_projet(id_projet);
    
    if (result.date_max) {
      const localDate = new Date(result.date_max);
      const dateLocaleISO = localDate.toISOString().split("T")[0]; 
      res.json({ date_max: dateLocaleISO });
    } else {
      res.json({ date_max: null });
    }

  } catch (error) {
    res.status(500).send("Erreur serveur : " + error.message);
  }
}




module.exports = {
  post_add_surface_projet,
  get_max_date_phase,
  getAll,
  get_type_construction,
  get_project_referrent,
  get_files_project,
  get_project_details_by_id,
  get_fondation,
  get_menuiserie,
  get_structure,
  get_toiture,
  get_type_plancher,
  get_type_surface,
  get_surface_projet,
  post_create_project,
  post_create_project_details,
  upload_devis_file,
  upload_image_file,
  get_client,
  create_new_client,
  get_devis_project,
  AllProjetPhases
};
