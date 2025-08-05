class Projet{
    constructor({id, nom, description, id_client, nom_client, id_type_construction,nom_type_construction,total_ht,total_ttc,dateDebut,dateFinPrevu,dateFinReel}) {
        this.id_projet = id;
        this.nom_projet = nom;
        this.description = description;
        this.id_client = id_client;
        this.nom_client = nom_client;
        this.id_type_construction = id_type_construction;
        this.nom_type_construction = nom_type_construction;
        this.total_ht= total_ht;
        this.total_ttc= total_ttc;
        this.dateDebut = dateDebut;
        this.dateFinPrevu = dateFinPrevu;
        this.dateFinReel = dateFinReel;
    }
}