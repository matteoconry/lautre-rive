/*
 * Le générique de fin et le lien de soutien.
 * Pour changer un nom, modifier les listes ci-dessous.
 * Pour activer le bouton de don, coller l'adresse de la page (Ko-fi, Tipeee, HelloAsso…)
 * dans « don.lien ». Tant que « lien » est vide, le bouton n'apparaît pas.
 */
window.Generique = {
  blocs: [
    { role: "", style: "dedicace", noms: [
      "Ce jeu est pour ceux qui votent,",
      "pour ceux qui ne votent plus,",
      "et pour ceux qui votent autrement que nous."
    ] },
    { role: "Des deux côtés du pont, les mêmes vies :", phrase: true, noms: [
      "des caristes et des caissières,",
      "des aides-soignantes et des aides à domicile,",
      "des pompiers volontaires et des bénévoles,",
      "des parents qui comptent chaque euro,",
      "des jeunes qui se demandent ce qu'ils vont devenir,",
      "des anciens qui ont vu fermer l'usine ou la poste,",
      "des gens qui se lèvent tôt et rentrent tard,",
      "qui ont peur pour leurs enfants,",
      "et qui pensent que personne ne les écoute."
    ] },
    { role: "Un jeu de", noms: ["Mattéo"] },
    { role: "", noms: [
      "Les personnages, les villes et les entreprises de ce jeu sont inventés.",
      "Aucun parti, aucun candidat n'y est montré."
    ] }
  ],
  merci: "L'autre rive n'est pas si loin.",

  don: {
    lien: "https://fr.tipeee.com/lautre-rive-jeu/",
    texte: "Soutenir le projet",
    detail: "Le jeu est gratuit, sans publicité, et le restera."
  }
};
