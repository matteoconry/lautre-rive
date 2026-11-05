/*
 * La rencontre sur le pont, commune aux deux parcours.
 * Après un seul parcours, les répliques de l'autre personnage restent floues.
 * Après les deux, le dialogue complet se débloque.
 *
 * Chaque page est une liste de lignes. Une ligne « parole » a un « de ».
 * « siSeb » / « siLea » : la ligne n'apparaît que si ce choix a été fait
 * dans le parcours de Sébastien ou de Léa (« !nom » pour l'inverse).
 */
window.Rencontre = {
  pages: [
    [
      { t: "Le soir, au coucher du soleil. Sébastien arrive de la rive du village, Léa de la rive des immeubles." },
      { style: "parole", de: "Sébastien", t: "Vous allez où, comme ça ?" },
      { style: "parole", de: "Léa", t: "De l'autre côté. Et vous ?" },
      { style: "parole", de: "Sébastien", t: "Pareil." }
    ],
    [
      { t: "Un temps. Ils regardent l'eau.", style: "pense" },
      { style: "parole", de: "Léa", t: "Vous avez voté ?" },
      { style: "parole", de: "Sébastien", t: "Oui. Pas pour les mêmes que vous, je pense." },
      { style: "parole", de: "Léa", t: "Je pense aussi." }
    ],
    [
      { style: "parole", de: "Sébastien", t: "Ma femme est aide à domicile." },
      { style: "parole", de: "Léa", t: "Ma mère est aide-soignante. De nuit." },
      { style: "parole", de: "Sébastien", t: "Alors vous savez." }
    ],
    [
      { style: "parole", de: "Sébastien", t: "Chez nous, la pharmacie a fermé." },
      { style: "parole", de: "Léa", t: "Chez nous, c'est le commissariat." },
      { t: "Ils ne tirent pas les mêmes conclusions, et ils le disent.", style: "pense" }
    ],
    [
      { style: "parole", de: "Sébastien", t: "Hier j'ai dit à un pote qu'il déconnait.", siSeb: "a_parle_au_bar" },
      { style: "parole", de: "Léa", t: "Moi aussi. À la manif, à des gens de mon camp.", siSeb: "a_parle_au_bar", siLea: "a_parle_a_la_manif" },
      { style: "parole", de: "Léa", t: "Moi, hier, je n'ai rien dit. J'aurais dû.", siSeb: "a_parle_au_bar", siLea: "!a_parle_a_la_manif" },
      { style: "parole", de: "Léa", t: "Hier, j'ai dit à des gens de mon camp qu'ils déconnaient.", siSeb: "!a_parle_au_bar", siLea: "a_parle_a_la_manif" },
      { style: "parole", de: "Sébastien", t: "Moi, hier, je n'ai rien dit. J'aurais dû.", siSeb: "!a_parle_au_bar", siLea: "a_parle_a_la_manif" },
      { style: "parole", de: "Sébastien", t: "Hier, au bar, un type a sorti une saleté. Personne n'a rien dit. Moi non plus.", siSeb: "!a_parle_au_bar", siLea: "!a_parle_a_la_manif" },
      { style: "parole", de: "Léa", t: "Hier, à la manif, pareil. On laisse passer, et après on s'en veut.", siSeb: "!a_parle_au_bar", siLea: "!a_parle_a_la_manif" }
    ],
    [
      { style: "parole", de: "Sébastien", t: "Ma fille veut partir à la fac, à Lille." },
      { style: "parole", de: "Léa", t: "Dites-lui d'y aller. C'est dur, mais dites-lui d'y aller." }
    ],
    [
      { t: "Ils posent chacun un badge sur la rambarde, côte à côte." },
      { t: "Roger Marchal · Fonderie de Vresnes · 1971.", style: "fort" },
      { t: "Christine Morel · Aide-soignante · Service de nuit.", style: "fort" },
      { t: "Puis ils repartent, chacun vers la rive de l'autre." }
    ],
    [
      { t: "Tu n'as pas à être d'accord. Tu peux juste comprendre.", style: "fort" }
    ]
  ],

  // Combien de pages montrer quand un seul parcours a été joué
  pages_floues: 3
};
