require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const userRoutes = require('./src/Routes/UtilisateurRoute');
app.use('/api/utilisateurs', userRoutes);

const projectsRoutes = require('./src/Routes/ProjetRoute');
app.use('/api/projets', projectsRoutes);

const moduleRoutes = require('./src/Routes/ModuleRoute');
app.use('/api/modules', moduleRoutes);

const devisRoutes = require('./src/Routes/DevisRoute');
app.use('/api/devis', devisRoutes);

const moduleProjet = require('./src/Routes/ModuleProjetRoute');
app.use('/api/m_projets', moduleProjet);

const tacheRoute = require('./src/Routes/TacheRoute');
app.use('/api/tache', tacheRoute);

const CommentaireRoute = require('./src/Routes/CommentaireRoute');
app.use('/api/commentaires', CommentaireRoute);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur port ${PORT}`));
