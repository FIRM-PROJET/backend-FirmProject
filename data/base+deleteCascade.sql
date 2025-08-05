CREATE DATABASE firm_project 
WITH ENCODING = 'UTF8'
LC_COLLATE = 'fr_FR.UTF-8'
LC_CTYPE = 'fr_FR.UTF-8'
TEMPLATE = template0;

\c firm_project;

CREATE TABLE utilisateur (
  matricule VARCHAR(250) PRIMARY KEY,
  nom VARCHAR(100),
  prenom VARCHAR(100),
  email VARCHAR(100),
  mot_de_passe VARCHAR(250),
  intitule_poste VARCHAR(100)
);

CREATE TABLE module (
  ref_module VARCHAR(250) PRIMARY KEY,
  nom_module VARCHAR(100),
  description VARCHAR(250)
);

CREATE TABLE module_access (
  ref_module VARCHAR(250) REFERENCES module (ref_module) ON DELETE CASCADE,
  matricule VARCHAR(250) REFERENCES utilisateur (matricule) ON DELETE CASCADE
);

CREATE TABLE client (
  id_client VARCHAR(250) PRIMARY KEY,
  nom VARCHAR(100),
  email VARCHAR(100),
  telephone VARCHAR(20)
);

CREATE TABLE type_construction (
  id_type_construction VARCHAR(250) PRIMARY KEY,
  nom_type_construction VARCHAR(100),
  description TEXT
);

CREATE TABLE projet (
  id_projet VARCHAR(250) PRIMARY KEY,
  nom_projet VARCHAR(100) NOT NULL,
  description TEXT,
  id_client VARCHAR(250) NOT NULL REFERENCES client (id_client) ON DELETE CASCADE,
  id_type_construction VARCHAR(250) NOT NULL REFERENCES type_construction (id_type_construction) ON DELETE CASCADE,
  total_ht DECIMAL,
  total_ttc DECIMAL,
  date_debut DATE,
  date_fin_prevu DATE,
  date_fin_reel DATE
);

CREATE TABLE structure (
  id_structure VARCHAR(250) PRIMARY KEY,
  nom VARCHAR(100),
  description TEXT
);

CREATE TABLE toiture (
  id_toiture VARCHAR(250) PRIMARY KEY,
  nom VARCHAR(100),
  description TEXT
);

CREATE TABLE menuiserie (
  id_menuiserie VARCHAR(250) PRIMARY KEY,
  nom VARCHAR(100),
  description TEXT
);

CREATE TABLE type_plancher (
  id_type_plancher VARCHAR(250) PRIMARY KEY,
  nom VARCHAR(100),
  description TEXT
);

CREATE TABLE fondation (
  id_fondation VARCHAR(250) PRIMARY KEY,
  nom VARCHAR(100),
  description TEXT
);

CREATE TABLE type_surface (
  id_type_surface VARCHAR(250) PRIMARY KEY,
  nom VARCHAR(100),
  description TEXT
);

CREATE TABLE details_projet (
  id_details_projet VARCHAR(250) PRIMARY KEY,
  id_projet VARCHAR(250) NOT NULL REFERENCES projet (id_projet) ON DELETE CASCADE,
  nombre_etages INT,
  surface_totale INT,
  id_type_surface VARCHAR(100),
  id_structure VARCHAR(250) REFERENCES structure (id_structure) ON DELETE CASCADE,
  id_toiture VARCHAR(250) REFERENCES toiture (id_toiture) ON DELETE CASCADE,
  id_menuiserie VARCHAR(250) REFERENCES menuiserie (id_menuiserie) ON DELETE CASCADE,
  id_type_plancher VARCHAR(250) REFERENCES type_plancher (id_type_plancher) ON DELETE CASCADE,
  id_fondation VARCHAR(250) REFERENCES fondation (id_fondation) ON DELETE CASCADE
);

CREATE TABLE type_fichier (
  id_type_fichier VARCHAR(250) PRIMARY KEY,
  nom_type_fichier VARCHAR(100)
);

CREATE TABLE fichier_projet (
  id_fichier_projet VARCHAR(250) PRIMARY KEY,
  id_projet VARCHAR(250) NOT NULL REFERENCES projet (id_projet) ON DELETE CASCADE,
  nom_fichier VARCHAR(100),
  chemin_fichier TEXT,
  date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_type_fichier VARCHAR(250) REFERENCES type_fichier (id_type_fichier) ON DELETE CASCADE
);

CREATE TABLE surface_projet (
  id_projet VARCHAR(250) NOT NULL REFERENCES projet (id_projet) ON DELETE CASCADE,
  id_type_surface VARCHAR(250) NOT NULL REFERENCES type_surface (id_type_surface) ON DELETE CASCADE,
  surface INT
);
