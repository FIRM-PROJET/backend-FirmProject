-- DUM BASE
pg_dump -U postgres -d firm_project -F c -f dump_firm_project.backup
-- RESTORE BASE 
pg_restore -U postgres -d ta_base_utf8 dump_firm_project.backup

ALTER TABLE details_projet ADD COLUMN id_type_surface VARCHAR(100) REFERENCES type_surface (id_type_surface);

UPDATE  type_surface SET description = 'Surface hors-oeuvre nette' WHERE id_type_surface = 'TPS0002';
UPDATE type_surface SET description = 'Surface hors-oeuvre brute' WHERE id_type_surface = 'TPS0003';