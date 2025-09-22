-- DUM BASE
pg_dump -U postgres -d firm_project -F c -f dump_firm_project.backup
-- RESTORE BASE 
pg_restore -U postgres -d ta_base_utf8 dump_firm_project.backup

ALTER TABLE details_projet ADD COLUMN id_type_surface VARCHAR(100) REFERENCES type_surface (id_type_surface);

UPDATE  type_surface SET description = 'Surface hors-oeuvre nette' WHERE id_type_surface = 'TPS0002';
UPDATE type_surface SET description = 'Surface hors-oeuvre brute' WHERE id_type_surface = 'TPS0003';


SELECT 
    p.id_phase,
    p.libelle_phase,
    SUM(tt.temps_passe_minutes) / 60.0 AS total_heures
FROM 
    temps_tache tt
JOIN 
    tache t ON tt.ref_tache = t.ref_tache
JOIN 
    phases p ON t.id_phase = p.id_phase
WHERE 
    t.ref_projet = 'PRJ0007'
GROUP BY 
    p.id_phase, p.libelle_phase
ORDER BY 
    total_heures DESC;
