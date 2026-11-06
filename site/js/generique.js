/*
 * Le générique de fin et le lien de soutien.
 * Pour changer un nom, modifier les listes ci-dessous.
 * Pour activer le bouton de don, coller l'adresse de la page (Ko-fi, Tipeee, HelloAsso…)
 * dans « don.lien ». Tant que « lien » est vide, le bouton n'apparaît pas.
 */
window.Generique = {
  blocs: [
    { role: "Une idée de", noms: ["Mattéo"] },
    { role: "Écriture", noms: ["Mattéo"] },
    { role: "Code, pixel art et musique", noms: ["Mattéo, avec Claude"] },
    { role: "Relectures", noms: ["Des électeurs des deux rives"] },
    { role: "Les chiffres viennent de", noms: [
      "Ipsos bva pour le Cevipof, la Fondation Jean-Jaurès, Le Monde et l'Institut Montaigne",
      "OpinionWay pour le Sens du service public, la Casden et la Fondation Jean-Jaurès",
      "Ifop pour l'ADFH",
      "Destin Commun"
    ] },
    { role: "", noms: [
      "Les personnages, les villes et les entreprises de ce jeu sont inventés.",
      "Aucun parti, aucun candidat n'y est montré."
    ] }
  ],
  merci: "Merci d'avoir traversé le pont.",

  don: {
    lien: "",
    texte: "Soutenir le projet",
    detail: "Le jeu est gratuit, sans publicité, et le restera."
  }
};
