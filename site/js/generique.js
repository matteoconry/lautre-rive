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
    { role: "Sur les deux rives, il y a", noms: [
      "des caristes et des caissières,",
      "des aides-soignantes et des aides à domicile,",
      "des pompiers volontaires et des bénévoles,",
      "des parents qui comptent et des enfants qui partent."
    ] },
    { role: "Un jeu de", noms: ["Mattéo"] },
    { role: "Les chiffres", noms: [
      "Sondages Ipsos, Ifop, Elabe et OpinionWay, études Destin Commun.",
      "La source exacte est donnée sous chaque chiffre, dans le jeu."
    ] },
    { role: "", noms: [
      "Les personnages, les villes et les entreprises de ce jeu sont inventés.",
      "Aucun parti, aucun candidat n'y est montré."
    ] }
  ],
  merci: "Merci d'avoir traversé le pont. Maintenant, va parler à quelqu'un de l'autre rive.",

  don: {
    lien: "https://fr.tipeee.com/lautre-rive-jeu/",
    texte: "Soutenir le projet",
    detail: "Le jeu est gratuit, sans publicité, et le restera."
  }
};
