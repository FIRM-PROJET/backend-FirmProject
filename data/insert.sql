INSERT INTO module (ref_module,nom_module, description) VALUES
('MOD0004','Devis', 'Module estimation de devis'),
('MOD0002','Taches', 'Module gestion des taches'),
('MOD0003','Projets', 'Module gestion des projets'),
('MOD0006','Phases','Module gestion des phases')
('MOD0005','Admin', 'Gestion RH des utilisateurs');


INSERT INTO type_construction (nom_type_construction, description) VALUES
('Logement','Maison individuelle(villa, pavillon, maison de plain-pied)'),
('Bureau / Tertiaire','Bureaux, Bâtiment administratif , Co-Working , Open Space'),
('Commerce','Magasin, Boutique, Showroom'),
('Industriel','Usine, Atelier, Entrepôt');

INSERT INTO structure (nom, description) VALUES
('Béton armé', 'Bâtiment avec une structure en béton armé'),
('Métallique', 'Bâtiment avec une structure métallique'),
('Mixte', 'Bâtiment avec une structure mixte (béton et métal)'),
('Bois', 'Bâtiment avec une structure en bois');

INSERT INTO toiture (nom, description) VALUES
('Béton armé', 'Toiture sans pente'),
('Tôle', 'Toiture avec une pente prononcée');

INSERT INTO menuiserie (nom, description) VALUES
('Bois', 'Menuiserie en bois'),
('Aluminium', 'Menuiserie en aluminium'),
('Métaliqque', 'Menuiserie métallique');

INSERT INTO fondation (nom, description) VALUES
('Normal', 'Fondation continue en béton sans études'),
('Renforcée', 'Fondation avec études en Laboratoire National des Travaux Publics et du Bâtiment');

INSERT INTO type_plancher (nom, description) VALUES
('Béton Armé', 'Plancher en béton'),
('Bois', 'Plancher en bois'),
('Collaborant', 'Plancher en collaborant');

INSERT INTO client (nom, email, telephone) VALUES
('SCIM', 'scim.mg@gmail.com', '0341234567');

INSERT INTO type_surface (nom, description) VALUES
('Surface SHAB', 'Surface habitable'),
('Surface SHON', 'Surface hors-oeuvre nette'),
('Surface SHOB', 'Surface hors-oeuvre brute');

-- INSERT INTO projet (
--   nom_projet,
--   description,
--   id_client,
--   id_type_construction,
--   total_ht,
--   total_ttc,
--   date_debut,
--   date_fin_prevu,
--   date_fin_reel
-- ) VALUES (
--   'Construction Bureau SCIM',
--   'Construction d''un bureau pour la société SCIM',
--   'CLI0001',  
--   'TPC0002', 
--   2982378539.00,
--   3578854247.00,
--   '2024-07-01',
--   '2024-12-31',
--   NULL
-- );
INSERT INTO travaux_standards (id_travaux, nom_travaux) VALUES
(1, 'Installation et repli de chantier'),
(2, 'Travaux de dépose et démolition'),
(3, 'Travaux de terrassement'),
(4, 'Travaux en infrastructure'),
(5, 'Travaux en superstructure'),
(6, 'Maçonnerie - Ravalement'),
(7, 'Charpente - couverture - étanchéité'),
(8, 'Assainissement'),
(9, 'Peinture'),
(10, 'Revêtement - plafonnage - cloison'),
(11, 'Ouvrage métallique'),
(12, 'Ouvrage bois'),
(13, 'Menuiserie métallique'),
(14, 'Menuiserie bois'),
(15, 'Menuiserie aluminium'),
(16, 'Plomberie sanitaire'),
(17, 'Électricité'),
(18, 'Énergie solaire'),
(19, 'Climatisation - VMC'),
(20, 'Système de sécurité incendie'),
(21,'Ascenseur'),
(22, 'Cloture'),
(23, 'Équipement et meuble de cuisine'),
(24, 'Peau de façade'),
(25, 'Piscine'),
(26, 'Accessibilité PMR'),
(27, 'Aménagement extérieur');


--Insertion des phases de projets 
INSERT INTO phases (id_phase,libelle_phase, description) VALUES
('PHA0001','EDF', 'Études de faisabilité'),
('PHA0002','Esquiss', 'Esquisse du projet'),
('PHA0003','APS', 'Avant-Projet Sommaire'),
('PHA0004','APD', 'Avant-Projet Détaillé'),
('PHA0005','DPC', 'Dossier de Consultation'),
('PHA0006','CCTP - CCAG', 'Cahier des Clauses Techniques et Administratives'),
('PHA0007','BDQ', 'Bordereau de Quantités'),
('PHA0008','PCG', 'Pièces contractuelles générales'),
('PHA0009','DCE', 'Dossier de Consultation Entrepise'),
('PHA0010','SUIVI', 'Suivi du chantier'),
('PHA0011','EXCE', 'Suivi du chantier');

--Insertion statut
INSERT INTO statut (id_statut,nom_statut) VALUES
(1,'Non démarré'),
(2,'En cours'),
(3,'Terminé');

--Insertion unité durée 
INSERT INTO unite_duree (id_unite_duree,nom_unite) VALUES
(1,'Heure'),
(2,'Jour'),
(3,'Semaine'),
(4,'Mois'),
(5,'Trimestre'),
(6,'Semestre'),
(7,'Année');

INSERT INTO jours_ferie (jour, mois, description) VALUES
  (1, 1, 'Jour de l’An'),
  (29, 3, 'Commémoration du 29 mars 1947'),
  (1, 5, 'Fête du Travail'),
  (26, 6, 'Fête de l’Indépendance'),
  (15, 8, 'Assomption'),
  (1, 11, 'Toussaint'),
  (25, 12, 'Noël');



