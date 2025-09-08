-- SEQUENCE POUR UTILISATEUR
CREATE SEQUENCE emp_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION set_utilisateur_matricule()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.matricule IS NULL THEN
    NEW.matricule := 'EMP' || LPAD(nextval('emp_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_utilisateur_matricule
BEFORE INSERT ON utilisateur
FOR EACH ROW
EXECUTE FUNCTION set_utilisateur_matricule();


-- SEQUENCE POUR MODULE
CREATE SEQUENCE mod_seq START WITH 1 INCREMENT BY 1;
CREATE OR REPLACE FUNCTION set_module_ref()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ref_module IS NULL THEN
    NEW.ref_module := 'MOD' || LPAD(nextval('mod_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_module_ref
BEFORE INSERT ON module
FOR EACH ROW
EXECUTE FUNCTION set_module_ref();

-- SEQUENCE POUR CLIENT
CREATE SEQUENCE client_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION set_client_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id_client IS NULL THEN
    NEW.id_client := 'CLI' || LPAD(nextval('client_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_client_id
BEFORE INSERT ON client
FOR EACH ROW
EXECUTE FUNCTION set_client_id();

--SEQUENCE POUR TYPE_CONSTRUCTION
CREATE SEQUENCE type_construction_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION set_type_construction_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id_type_construction IS NULL THEN
    NEW.id_type_construction := 'TPC' || LPAD(nextval('type_construction_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_type_construction_id
BEFORE INSERT ON type_construction
FOR EACH ROW
EXECUTE FUNCTION set_type_construction_id();


-- SEQUENCE POUR PROJET
CREATE SEQUENCE projet_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION set_projet_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id_projet IS NULL THEN
    NEW.id_projet := 'PRJ' || LPAD(nextval('projet_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_projet_id
BEFORE INSERT ON projet
FOR EACH ROW
EXECUTE FUNCTION set_projet_id();


-- SEQUENCE POUR STRUCTURE, TOITURE, MENUISERIE, TYPE_PLANCHER, FONDATION
CREATE SEQUENCE structure_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION set_structure_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id_structure IS NULL THEN
    NEW.id_structure := 'STR' || LPAD(nextval('structure_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_structure_id
BEFORE INSERT ON structure
FOR EACH ROW
EXECUTE FUNCTION set_structure_id();

CREATE SEQUENCE toiture_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION set_toiture_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id_toiture IS NULL THEN
    NEW.id_toiture := 'TOI' || LPAD(nextval('toiture_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_toiture_id
BEFORE INSERT ON toiture
FOR EACH ROW
EXECUTE FUNCTION set_toiture_id();

CREATE SEQUENCE menuiserie_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION set_menuiserie_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id_menuiserie IS NULL THEN
    NEW.id_menuiserie := 'MEN' || LPAD(nextval('menuiserie_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_menuiserie_id
BEFORE INSERT ON menuiserie
FOR EACH ROW
EXECUTE FUNCTION set_menuiserie_id();

CREATE SEQUENCE type_plancher_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION set_type_plancher_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id_type_plancher IS NULL THEN
    NEW.id_type_plancher := 'PLN' || LPAD(nextval('type_plancher_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_type_plancher_id
BEFORE INSERT ON type_plancher
FOR EACH ROW
EXECUTE FUNCTION set_type_plancher_id();

CREATE SEQUENCE fondation_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION set_fondation_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id_fondation IS NULL THEN
    NEW.id_fondation := 'FND' || LPAD(nextval('fondation_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fondation_id
BEFORE INSERT ON fondation
FOR EACH ROW
EXECUTE FUNCTION set_fondation_id();

-- SEQUENCE POUR DETAILS_PROJET
CREATE SEQUENCE details_projet_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION set_details_projet_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id_details_projet IS NULL THEN
    NEW.id_details_projet := 'DPR' || LPAD(nextval('details_projet_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_details_projet_id
BEFORE INSERT ON details_projet
FOR EACH ROW
EXECUTE FUNCTION set_details_projet_id();

-- SEQUENCE POUR FICHIER_PROJET
CREATE SEQUENCE fichier_projet_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION set_fichier_projet_id()
RETURNS TRIGGER AS $$       
BEGIN
  IF NEW.id_fichier_projet IS NULL THEN
    NEW.id_fichier_projet := 'FPR' || LPAD(nextval('fichier_projet_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fichier_projet_id
BEFORE INSERT ON fichier_projet
FOR EACH ROW
EXECUTE FUNCTION set_fichier_projet_id();


-- SEQUENCE POUR TYPE_SURFACE
CREATE SEQUENCE type_surface_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION set_type_surface_id()
RETURNS TRIGGER AS $$       
BEGIN
  IF NEW.id_type_surface IS NULL THEN
    NEW.id_type_surface := 'TPS' || LPAD(nextval('type_surface_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_type_surface_id
BEFORE INSERT ON type_surface
FOR EACH ROW
EXECUTE FUNCTION set_type_surface_id();

-- SEQUENCE POUR TYPE_FICHIER
-- 1. Création de la séquence
CREATE SEQUENCE IF NOT EXISTS type_fichier_seq 
  START WITH 1 
  INCREMENT BY 1;

-- 2. Création de la fonction de génération d'ID
CREATE OR REPLACE FUNCTION set_type_fichier_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id_type_fichier IS NULL OR NEW.id_type_fichier = '' THEN
    NEW.id_type_fichier := 'TFI' || LPAD(nextval('type_fichier_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Création du trigger
DROP TRIGGER IF EXISTS trg_type_fichier_id ON type_fichier;

CREATE TRIGGER trg_type_fichier_id
BEFORE INSERT ON type_fichier
FOR EACH ROW
EXECUTE FUNCTION set_type_fichier_id();

-- SEQUENCE POUR TYPE FICHE ESTIMATION DEVIS
CREATE SEQUENCE IF NOT EXISTS fiche_estimation_seq 
  START WITH 1 
  INCREMENT BY 1;
CREATE OR REPLACE FUNCTION set_fiche_estimation_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id_fiche_estimation IS NULL OR NEW.id_fiche_estimation = '' THEN
    NEW.id_fiche_estimation := 'FID' || LPAD(nextval('fiche_estimation_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_fiche_estimation_id ON fiche_estimation_devis;

CREATE TRIGGER trg_fiche_estimation_id
BEFORE INSERT ON fiche_estimation_devis
FOR EACH ROW
EXECUTE FUNCTION set_fiche_estimation_id();

-- SEQUENCE POUR module_projet
CREATE SEQUENCE IF NOT EXISTS module_projet_seq 
  START WITH 1 
  INCREMENT BY 1;
CREATE OR REPLACE FUNCTION set_module_projet_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ref_projet IS NULL OR NEW.ref_projet = '' THEN
    NEW.ref_projet := 'PRJ' || LPAD(nextval('module_projet_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_module_projet_id ON module_projet;
CREATE TRIGGER trg_module_projet_id
BEFORE INSERT ON module_projet
FOR EACH ROW
EXECUTE FUNCTION set_module_projet_id();

-- SEQUENCE POUR phases
CREATE SEQUENCE IF NOT EXISTS phases_seq 
  START WITH 1 
  INCREMENT BY 1;
CREATE OR REPLACE FUNCTION set_phases_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id_phase IS NULL OR NEW.id_phase = '' THEN
    NEW.id_phase := 'PHA' || LPAD(nextval('phases_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_phases_id ON phases;
CREATE TRIGGER trg_phases_id
BEFORE INSERT ON phases
FOR EACH ROW
EXECUTE FUNCTION set_phases_id();

--SEQUENCE POUR TACHES
CREATE SEQUENCE IF NOT EXISTS tache_seq 
  START WITH 1 
  INCREMENT BY 1;

CREATE OR REPLACE FUNCTION set_tache_ref()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ref_tache IS NULL OR NEW.ref_tache = '' THEN
    NEW.ref_tache := 'TCH' || LPAD(nextval('tache_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tache_ref ON tache;

CREATE TRIGGER trg_tache_ref
BEFORE INSERT ON tache
FOR EACH ROW
EXECUTE FUNCTION set_tache_ref();


--SEQUENCE POUR SOUS-TACHES 
CREATE SEQUENCE IF NOT EXISTS sous_tache_seq 
  START WITH 1 
  INCREMENT BY 1;

CREATE OR REPLACE FUNCTION set_sous_tache_ref()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ref_sous_tache IS NULL OR NEW.ref_sous_tache = '' THEN
    NEW.ref_sous_tache := 'SST' || LPAD(nextval('sous_tache_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sous_tache_ref ON sous_tache;

CREATE TRIGGER trg_sous_tache_ref
BEFORE INSERT ON sous_tache
FOR EACH ROW
EXECUTE FUNCTION set_sous_tache_ref();




