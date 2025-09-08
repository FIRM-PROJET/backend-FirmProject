--VIEW MODEL ACCESS UTILISATEUR
CREATE VIEW v_module_access_utilisateur AS
SELECT 
    ma.matricule,
    m.ref_module,
    m.nom_module,
    m.description
FROM 
    module_access ma
JOIN 
    module m ON ma.ref_module = m.ref_module;

--VIEW DESCRIPTION PROJET 
CREATE VIEW v_desc_projet AS
SELECT 
    p.id_projet,
    p.nom_projet,
    p.description,
    p.id_client,
    c.nom AS nom_client,
    p.id_type_construction,
    tc.nom_type_construction,
    p.total_ht,
    p.total_ttc,
    p.date_devis
FROM projet p
JOIN client c ON p.id_client = c.id_client
JOIN type_construction tc ON p.id_type_construction = tc.id_type_construction;


--VIEW DESCRIPTION PROJET 
CREATE VIEW v_desc_detail_projet AS
SELECT 
    dp.id_details_projet,
    dp.id_projet,
    pr.nom_projet,
    dp.nombre_etages,
    dp.surface_totale,
    ts.nom,
    s.nom AS structure,
    t.nom AS toiture,
    m.nom AS menuiserie,
    tp.nom AS type_plancher,
    f.nom AS fondation
FROM details_projet dp
JOIN projet pr ON dp.id_projet = pr.id_projet
JOIN structure s ON dp.id_structure = s.id_structure
JOIN toiture t ON dp.id_toiture = t.id_toiture
JOIN menuiserie m ON dp.id_menuiserie = m.id_menuiserie
JOIN type_plancher tp ON dp.id_type_plancher = tp.id_type_plancher
JOIN fondation f ON dp.id_fondation = f.id_fondation
JOIN type_surface ts ON dp.id_type_surface = ts.id_type_surface;

--VIEW SURFACE PROJET
CREATE VIEW v_surface_projet AS
SELECT
    tps.nom AS nom_surface,
    p.nom_projet,
    s.surface,
    s.id_type_surface,
    s.id_projet
FROM surface_projet s
JOIN type_surface tps ON s.id_type_surface = tps.id_type_surface
JOIN projet p ON s.id_projet = p.id_projet;
    

SELECT chemin_fichier 
FROM fichier_projet fp
JOIN type_fichier tf ON fp.id_type_fichier = tf.id_type_fichier
WHERE fp.id_projet = PRJ0002
AND tf.nom_type_fichier = "xlsx"


--VIEW DETAILS ESTIMATION PROJET 
CREATE OR REPLACE VIEW v_details_estimation_devis AS 
SELECT 
    f.id_fiche_estimation,
    f.code_fiche,
    f.version,
    f.nom_devis,
    f.cours_ariary,
    f.nom_maitre_ouvrage,
    f.type_surface,
    f.projet_referrent,
    f.surface_totale,
    f.surface_moyenne,
    f.date_creation,
    tc.id_custom_travaux,
    tc.nom_travaux_custom,
    tc.montant_travaux_custom,
    mtd.id_travaux,
    ts.nom_travaux, 
    mtd.montant_travaux

FROM fiche_estimation_devis f
LEFT JOIN travaux_custom_devis tc ON f.id_fiche_estimation = tc.id_fiche_estimation
LEFT JOIN montant_travaux_devis mtd ON f.id_fiche_estimation = mtd.id_fiche_estimation
LEFT JOIN travaux_standards ts ON mtd.id_travaux = ts.id_travaux;
