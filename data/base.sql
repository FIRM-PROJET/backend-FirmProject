CREATE DATABASE firm_project
WITH
    ENCODING = 'UTF8' LC_COLLATE = 'fr_FR.UTF-8' LC_CTYPE = 'fr_FR.UTF-8' TEMPLATE = template0;

\c firm_project;

--Module Accès Utilisateur
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
    ref_module VARCHAR(250) REFERENCES module (ref_module),
    matricule VARCHAR(250) REFERENCES utilisateur (matricule)
);

--Module Devis
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
    id_client VARCHAR(250) NOT NULL REFERENCES client (id_client),
    id_type_construction VARCHAR(250) NOT NULL REFERENCES type_construction (id_type_construction),
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
    id_projet VARCHAR(250) NOT NULL REFERENCES projet (id_projet),
    nombre_etages INT,
    surface_totale INT,
    id_type_surface VARCHAR(100),
    id_structure VARCHAR(250) REFERENCES structure (id_structure),
    id_toiture VARCHAR(250) REFERENCES toiture (id_toiture),
    id_menuiserie VARCHAR(250) REFERENCES menuiserie (id_menuiserie),
    id_type_plancher VARCHAR(250) REFERENCES type_plancher (id_type_plancher),
    id_fondation VARCHAR(250) REFERENCES fondation (id_fondation)
);

CREATE TABLE type_fichier (
    id_type_fichier VARCHAR(250) PRIMARY KEY,
    nom_type_fichier VARCHAR(100)
);

CREATE TABLE fichier_projet (
    id_fichier_projet VARCHAR(250) PRIMARY KEY,
    id_projet VARCHAR(250) NOT NULL REFERENCES projet (id_projet),
    nom_fichier VARCHAR(100),
    chemin_fichier TEXT,
    date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_type_fichier VARCHAR(250) REFERENCES type_fichier (id_type_fichier)
);

CREATE TABLE surface_projet (
    id_projet VARCHAR(250) NOT NULL REFERENCES projet (id_projet),
    id_type_surface VARCHAR(250) NOT NULL REFERENCES type_surface (id_type_surface),
    surface INT
);

CREATE TABLE fiche_estimation_devis (
    id_fiche_estimation VARCHAR(250) PRIMARY KEY,
    code_fiche VARCHAR(100),
    version INT NOT NULL DEFAULT 1,
    nom_devis VARCHAR(250),
    nom_maitre_ouvrage VARCHAR(250),
    date_creation DATE,
    type_surface VARCHAR(250),
    surface_totale INT,
    surface_moyenne INT,
    cours_ariary INT,
    projet_referrent TEXT,
    UNIQUE (code_fiche, version)
);

CREATE TABLE travaux_standards (
    id_travaux INT PRIMARY KEY,
    nom_travaux VARCHAR(250)
);

CREATE TABLE travaux_custom_devis (
    id_custom_travaux SERIAL PRIMARY KEY,
    id_fiche_estimation VARCHAR(250) REFERENCES fiche_estimation_devis (id_fiche_estimation),
    nom_travaux_custom VARCHAR(250),
    montant_travaux_custom DECIMAL
);

CREATE TABLE montant_travaux_devis (
    id_travaux INT REFERENCES travaux_standards (id_travaux),
    id_fiche_estimation VARCHAR(250) REFERENCES fiche_estimation_devis (id_fiche_estimation),
    montant_travaux DECIMAL
);

--Module Projets
CREATE TABLE module_projet (
    ref_projet VARCHAR(250) PRIMARY KEY,
    nom_projet TEXT,
    description TEXT,
    id_client VARCHAR(250) NOT NULL REFERENCES client (id_client),
    date_creation DATE DEFAULT CURRENT_DATE
);

CREATE TABLE phases (
    id_phase VARCHAR(250) PRIMARY KEY,
    libelle_phase VARCHAR(250),
    description TEXT
);

CREATE TABLE projet_phase (
    ref_projet VARCHAR(250) NOT NULL REFERENCES module_projet (ref_projet),
    id_phase VARCHAR(250) NOT NULL REFERENCES phases (id_phase),
    date_debut DATE,
    date_fin DATE,
    date_fin_reelle DATE
);

CREATE TABLE projet_phase_utilisateur (
    ref_projet VARCHAR(250) NOT NULL REFERENCES module_projet (ref_projet),
    id_phase VARCHAR(250) NOT NULL REFERENCES phases (id_phase),
    matricule VARCHAR(250) NOT NULL REFERENCES utilisateur (matricule),
    date_affectation DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (
        ref_projet,
        id_phase,
        matricule
    )
);

CREATE TABLE unite_duree (
    id_unite_duree SERIAL PRIMARY KEY,
    nom_unite VARCHAR(50)
);

CREATE TABLE statut (
    id_statut SERIAL PRIMARY KEY,
    nom_statut VARCHAR(50)
);

CREATE TABLE historique_statut (
    id SERIAL PRIMARY KEY,
    ref_tache VARCHAR(250) REFERENCES tache (ref_tache),
    ref_sous_tache VARCHAR(250)REFERENCES sous_tache (ref_sous_tache),
    id_statut INT REFERENCES statut (id_statut),
    date_statut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        (
            ref_tache IS NOT NULL
            AND ref_sous_tache IS NULL
        )
        OR (
            ref_tache IS NULL
            AND ref_sous_tache IS NOT NULL
        )
    )
);

CREATE TABLE tache (
    ref_tache VARCHAR(250) PRIMARY KEY,
    nom_tache VARCHAR(250),
    description TEXT,
    ref_projet VARCHAR(250) NOT NULL REFERENCES module_projet (ref_projet),
    id_phase VARCHAR(250) NOT NULL REFERENCES phases (id_phase),
    date_debut DATE,
    duree DECIMAL,
    id_unite_duree INT REFERENCES unite_duree (id_unite_duree),
    date_fin_prevu DATE,
    date_fin_reelle DATE
);

CREATE TABLE sous_tache (
    ref_sous_tache VARCHAR(250) PRIMARY KEY,
    nom_sous_tache VARCHAR(250),
    description TEXT,
    ref_tache VARCHAR(250) NOT NULL REFERENCES tache (ref_tache),
    date_debut DATE,
    duree DEHAR(250) REFERENCES utilisateur (matricule),CIMAL,
    id_unite_duree INT REFERENCES unite_duree (id_unite_duree),
    date_fin_prevu DATE,
    date_fin_reelle DATE
);

CREATE TABLE utilisateur_tache (
    id SERIAL PRIMARY KEY,
    matricule VARCHAR(250) REFERENCES utilisateur (matricule),
    ref_tache VARCHAR(250) REFERENCES tache (ref_tache),
    UNIQUE (matricule, ref_tache)
);

CREATE TABLE utilisateur_sous_tache (
    id SERIAL PRIMARY KEY,
    matricule VARCHAR,
    ref_sous_tache VARCHAR(250) REFERENCES sous_tache (ref_sous_tache),
    UNIQUE (matricule, ref_sous_tache)
);

CREATE TABLE jours_ferie (
    id SERIAL PRIMARY KEY,
    jour INTEGER NOT NULL ,
    mois INTEGER NOT NULL,
    description VARCHAR(250)
);

CREATE TABLE commentaires (
    id_commentaires SERIAL PRIMARY KEY,
    matricule VARCHAR(250) REFERENCES utilisateur (matricule),
    commentaire TEXT,
    date_commentaire TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ref_tache VARCHAR(250) REFERENCES tache (ref_tache),
    ref_sous_tache VARCHAR(250) REFERENCES sous_tache (ref_sous_tache),
    CHECK (
        (
            ref_tache IS NOT NULL
            AND ref_sous_tache IS NULL
        )
        OR (
            ref_tache IS NULL
            AND ref_sous_tache IS NOT NULL
        )
    )
);
CREATE TABLE fichier_tache (
    id_fichier_tache serial PRIMARY KEY,
    ref_tache VARCHAR(250) NOT NULL REFERENCES tache (ref_tache),
    nom_fichier VARCHAR(100),
    chemin_fichier TEXT,
    date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_type_fichier VARCHAR(250) REFERENCES type_fichier (id_type_fichier)
);
CREATE TABLE fichier_finale (
    id_fichier_tache serial PRIMARY KEY,
    ref_tache VARCHAR(250) NOT NULL REFERENCES tache (ref_tache),
    nom_fichier VARCHAR(100),
    chemin_fichier TEXT,
    date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_type_fichier VARCHAR(250) REFERENCES type_fichier (id_type_fichier)
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  message TEXT,
  id_utilisateur VARCHAR(250) REFERENCES utilisateur (matricule),
  date_creation TIMESTAMP DEFAULT NOW(),
  expire_at TIMESTAMP
);
