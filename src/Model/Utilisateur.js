class Utilisateur {
  constructor({ matricule, nom, email, mot_de_passe, intitule_poste }) {
    this.matricule    = matricule;
    this.nom          = nom;
    this.email        = email;
    this.mot_de_passe = mot_de_passe;
    this.intitule_poste = intitule_poste;
  }
}
module.exports = Utilisateur;
