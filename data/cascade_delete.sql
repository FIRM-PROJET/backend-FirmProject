ALTER TABLE module_access
DROP CONSTRAINT module_access_matricule_fkey;

ALTER TABLE module_access
ADD CONSTRAINT module_access_matricule_fkey
FOREIGN KEY (matricule)
REFERENCES utilisateur(matricule)
ON DELETE CASCADE;


ALTER TABLE fichier_projet
ADD COLUMN  id_type_fichier VARCHAR(250) 
REFERENCES type_fichier (id_type_fichier)
