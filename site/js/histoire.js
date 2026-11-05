/*
 * L'histoire : la première journée de Sébastien (J-6 · Le matin),
 * d'après le script « L'Autre Rive — scripts des deux personnages ».
 *
 * Pour modifier le texte, c'est ici. Chaque étape a un « type » :
 *   decor  : change le décor et affiche un titre de scène
 *   texte  : une page de texte (on touche l'écran pour continuer)
 *   choix  : des boutons ; chaque option peut changer les jauges
 *            (effets), poser des drapeaux, et enchaîner des pages (suite)
 *   tete   : un moment « Dans sa tête » (le joueur parie, puis découvre)
 *   fin    : le récapitulatif de la journée
 *
 * Dans les pages, chaque ligne a un style : recit, pense, fort, note,
 * ou sms (avec « de »).
 */
window.Histoire = {
  // Valeurs de départ des jauges
  depart: {
    jour: 6,          // J-6 : six jours avant le vote
    fin_de_mois: 212, // en euros (d'après le script)
    energie: 6,       // sur 10
    liens: 5          // sur 10
  },

  // Sous ce niveau d'énergie, les choix marqués « exigeant » sont grisés
  seuil_energie: 3,

  etapes: [
    { type: "decor", decor: "cuisine", titre: "J-6 · Le matin", sous: "Sébastien Marchal, 47 ans · Vresnes" },

    { type: "texte", lignes: [
      { t: "5 h 10. Nathalie dort encore. Elle commence à 7 h chez Mme Fabre, 91 ans." },
      { t: "Sur le frigo, sous un aimant, une carte électorale. Elle n'a pas servi depuis 2017." },
      { t: "Dimanche, il ira.", style: "fort" }
    ] },

    { type: "texte", lignes: [
      { t: "Le téléphone vibre sur la table. C'est Didier, un collègue de l'entrepôt." },
      { style: "sms", de: "Didier", t: "Tu me prends ? Ma caisse est morte." }
    ] },

    { type: "choix", question: "Que fait Sébastien ?", options: [
      {
        texte: "Prendre Didier",
        detail: "Il paiera sa part d'essence.",
        effets: { fin_de_mois: +6, liens: +1, energie: -1 },
        drapeaux: { didier_monte: true },
        suite: [
          { lignes: [
            { t: "Didier monte en soufflant dans ses mains. Il parle de son fils, du foot, du prix du gazole." },
            { t: "Sébastien écoute à moitié. Didier parle beaucoup." },
            { t: "Fin de mois +6 €, Liens +1, Énergie -1.", style: "effets" }
          ] }
        ]
      },
      {
        texte: "Répondre qu'il part plus tôt",
        detail: "Le trajet en silence, la radio.",
        effets: { energie: +1, liens: -1 },
        suite: [
          { lignes: [
            { style: "sms", de: "Sébastien", t: "Désolé, je pars plus tôt ce matin." },
            { t: "Il pose le téléphone. Didier trouvera quelqu'un." },
            { t: "Énergie +1, Liens -1.", style: "effets" }
          ] }
        ]
      }
    ] },

    { type: "decor", decor: "route" },

    { type: "texte", lignes: [
      { t: "Trente-deux kilomètres de départementale jusqu'à l'entrepôt. Soixante-quatre par jour." },
      { t: "À la radio, on parle d'une nouvelle taxe carbone sur le gazole." }
    ] },

    {
      type: "tete",
      numero: 1,
      question: "À ton avis, que pense Sébastien du réchauffement climatique ?",
      options: [
        "C'est exagéré.",
        "C'est réel, mais pas sa priorité.",
        "C'est réel et ça l'inquiète."
      ],
      reponse: "C'est réel. Les étés secs, il les voit sur les champs de son beau-frère. Ce qu'il refuse, c'est que ce soit à celui qui fait 64 km par jour de payer la facture.",
      // Le chiffre de sondage n'est pas encore choisi : on ne met rien d'inventé.
      source: null
    },

    { type: "decor", decor: "boite" },

    { type: "texte", lignes: [
      { t: "Sur le parking de l'entrepôt, il ouvre la boîte à gants pour l'attestation d'assurance." },
      { t: "Entre les papiers, un vieux badge plastifié. Il ne le sort jamais. Il ne le jette pas non plus.", style: "pense" }
    ] },

    { type: "choix", options: [
      {
        texte: "Retourner le badge",
        drapeaux: { badge_touche: true },
        suite: [
          { lignes: [
            { t: "Ses doigts s'arrêtent sur le plastique." },
            { t: "Il referme la boîte à gants. Pas aujourd'hui." }
          ] }
        ]
      },
      {
        texte: "Refermer la boîte à gants",
        suite: [
          { lignes: [
            { t: "Il prend l'attestation et referme la boîte à gants." }
          ] }
        ]
      }
    ] },

    { type: "decor", decor: "quai", titre: "Fin de la journée", sous: "Encore cinq jours avant le vote" },

    { type: "fin" }
  ]
};
