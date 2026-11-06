/*
 * Le parcours de Léa, de J-6 jusqu'à l'isoloir,
 * d'après le script « L'Autre Rive — scripts des deux personnages ».
 * Même fonctionnement que histoire-sebastien.js (voir les explications en haut de ce fichier).
 */
window.Parcours = window.Parcours || {};
window.Parcours.lea = {
  id: "lea",
  prenom: "Léa",
  rive: "droite",
  presentation: "Léa, 21 ans, étudiante en droit à Saint-Denis",
  fatigue: "Trop fatiguée pour ça.",
  recap: [
    { nom: "Le partiel", si: "est_allee_au_partiel", oui: "elle y est allée", non: "elle l'a raté" },
    { nom: "Yanis", si: "descendue", oui: "elle est descendue", non: "elle est restée en haut" },
    { nom: "Kenza", si: "kenza", oui: "la lettre est partie à temps", non: "le délai est passé" },
    { nom: "À la manif", si: "a_parle_a_la_manif", oui: "elle a parlé", non: "elle n'a rien dit" }
  ],
  badge: "Christine Morel, sa mère",

  depart: {
    jour: 6,
    fin_de_mois: 87,  // en euros (d'après le script)
    energie: 6,
    liens: 5
  },

  seuil_energie: 3,
  recuperation_nuit: 1,

  etapes: [

    /* ==================== J-6 · Le matin ==================== */

    { type: "decor", decor: "rer", jour: 6, titre: "J-6 · Le matin", sous: "Léa Morel, 21 ans · Saint-Denis" },

    { type: "texte", lignes: [
      { t: "6 h 30. Le cours de droit des obligations commence à 8 h. Le RER a 20 minutes de retard. Comme hier." },
      { t: "Dans son téléphone, la confirmation d'inscription sur les listes électorales. Elle a eu 18 ans il y a trois ans. Elle n'a jamais voté." },
      { t: "Dimanche, elle votera ? Elle ne sait pas encore.", style: "fort" }
    ] },

    { type: "choix", question: "Que fait Léa ?", options: [
      {
        texte: "Attendre le RER",
        detail: "Elle arrivera en retard.",
        effets: { energie: +1, liens: -1 },
        suite: [ { lignes: [
          { t: "Elle arrive à 8 h 20. Le prof lève les yeux : « Mademoiselle Morel nous fait l'honneur. » Quelques rires." },
          { t: "Énergie +1, Liens -1.", style: "effets" }
        ] } ]
      },
      {
        texte: "Prendre un Vélib' jusqu'à la fac",
        detail: "3 €, et il pleut.",
        exigeant: true,
        effets: { fin_de_mois: -3, energie: -2 },
        suite: [ { lignes: [
          { t: "Quarante minutes de pédalage sous la bruine. À l'heure, trempée." },
          { t: "Fin de mois -3 €, Énergie -2.", style: "effets" }
        ] } ]
      }
    ] },

    { type: "texte", lignes: [
      { t: "Sur le quai, un homme lit un journal. Le titre, en gros :" },
      { t: "« Les jeunes ne veulent plus travailler ».", style: "pense" }
    ] },

    {
      type: "tete",
      numero: 1,
      question: "À ton avis, que pense Léa de la valeur travail ?",
      options: [
        "C'est un truc de patrons.",
        "Elle s'en méfie.",
        "Elle y tient."
      ],
      reponse: "Elle y tient. Elle bosse 20 heures par semaine en plus de ses cours. Ce qu'elle trouve injuste, c'est que ça ne suffise pas à payer un loyer.",
      source: "Dans la vraie vie : 83 % des jeunes de 18 à 30 ans proches de La France insoumise disent que le travail est important dans leur vie (84 % de l'ensemble des jeunes). Ifop pour Marianne, « Les jeunes et la valeur travail », 18-24 novembre 2022, 1 009 jeunes de 18 à 30 ans."
    },

    { type: "decor", decor: "sac" },

    { type: "texte", lignes: [
      { t: "En cherchant son passe Navigo, elle effleure quelque chose dans la poche avant du sac." },
      { t: "Un badge plastifié. Elle ne le sort jamais. Elle ne s'en sépare pas non plus.", style: "pense" }
    ] },

    { type: "choix", options: [
      {
        texte: "Retourner le badge",
        drapeaux: { badge_touche: true },
        suite: [ { lignes: [
          { t: "Ses doigts s'arrêtent sur le plastique. Elle n'a pas la force de le retourner." },
          { t: "Le RER entre en gare. Elle referme la poche. Pas maintenant." }
        ] } ]
      },
      {
        texte: "Refermer la poche",
        suite: [ { lignes: [
          { t: "Elle trouve son passe et referme la poche du sac." }
        ] } ]
      }
    ] },

    /* ==================== J-5 · Le compte ==================== */

    { type: "decor", decor: "coloc", jour: 5, titre: "J-5 · Le compte", sous: "La cuisine de la coloc, le soir" },

    { type: "texte", lignes: [
      { t: "La vaisselle s'empile. Sur l'écran de l'ordinateur, le site de la CAF." },
      { t: "Sur son compte : {fin_de_mois} €. Le loyer, 430 €, aurait dû partir le 5. Il n'est toujours pas payé.", style: "fort" },
      { t: "Les APL ne sont pas arrivées. « Votre dossier est en cours de traitement. » Elle a essayé d'appeler la CAF. Personne n'a décroché." }
    ] },

    { type: "texte", lignes: [
      { t: "Son téléphone sonne. C'est sa responsable, au magasin." },
      { style: "parole", de: "Sa responsable", t: "Tu peux remplacer Sofia jeudi matin ?" },
      { t: "Jeudi matin, c'est le partiel." }
    ] },

    { type: "choix", question: "Que fait Léa ?", options: [
      {
        texte: "Prendre le service",
        detail: "68 € de plus.",
        effets: { fin_de_mois: +68 },
        drapeaux: { a_rate_le_partiel: true },
        suite: [ { lignes: [
          { style: "sms", de: "Léa", t: "Ok pour jeudi." },
          { t: "Le partiel, ce sera la session de rattrapage, en juin." },
          { t: "Fin de mois +68 €.", style: "effets" }
        ] } ]
      },
      {
        texte: "Aller au partiel et demander à Inès d'avancer le loyer",
        exigeant: true,
        effets: { liens: -1, energie: -1 },
        drapeaux: { est_allee_au_partiel: true },
        suite: [ { lignes: [
          { style: "parole", de: "Inès", t: "Ok… mais tu me rembourses vite, hein. Moi aussi je suis juste." },
          { t: "Liens -1, Énergie -1.", style: "effets" }
        ] } ]
      },
      {
        texte: "Appeler sa mère",
        detail: "Elle dira oui.",
        effets: { fin_de_mois: +100, liens: +1 },
        drapeaux: { appele_mere: true, est_allee_au_partiel: true },
        suite: [ { lignes: [
          { t: "Sa mère dit oui tout de suite. 100 € qu'elle n'a pas." },
          { t: "Elle raccroche et elle a honte.", style: "pense" },
          { t: "Fin de mois +100 €, Liens +1.", style: "effets" }
        ] } ]
      }
    ] },

    { type: "texte", lignes: [
      { t: "Elle ne se plaint pas. Elle fait ses comptes.", style: "pense" }
    ] },

    /* ==================== J-4 · Ce qui manque ==================== */

    { type: "decor", decor: "controle", jour: 4, titre: "J-4 · Ce qui manque", sous: "Sous la fenêtre de la coloc, fin d'après-midi" },

    { type: "texte", lignes: [
      { t: "Léa range les courses. Par la fenêtre, elle voit Yanis contrôlé en bas de l'immeuble." },
      { t: "La troisième fois ce mois-ci. Il garde les mains sur le guidon. Il a l'habitude.", style: "fort" }
    ] },

    { type: "choix", question: "Que fait Léa ?", options: [
      {
        texte: "Filmer depuis la fenêtre",
        effets: { energie: -1 },
        suite: [ { lignes: [
          { t: "Le contrôle se passe calmement. Elle garde la vidéo sans la poster." },
          { t: "Énergie -1.", style: "effets" }
        ] } ]
      },
      {
        texte: "Descendre et rester à côté, sans rien dire",
        exigeant: true,
        effets: { liens: +2 },
        drapeaux: { descendue: true },
        suite: [ { lignes: [
          { t: "Elle reste à deux mètres, en chaussons, jusqu'à la fin." },
          { style: "parole", de: "Yanis", t: "Merci. Mais ça sert à rien." },
          { t: "Liens +2.", style: "effets" }
        ] } ]
      },
      {
        texte: "Rester en haut",
        effets: { energie: +1 },
        suite: [ { lignes: [
          { t: "Yanis remonte, pose son casque, et ne dit rien de la soirée." },
          { t: "Énergie +1.", style: "effets" }
        ] } ]
      }
    ] },

    { type: "texte", lignes: [
      { t: "Le commissariat du quartier a fermé l'an dernier. Les contrôles, eux, n'ont pas arrêté.", style: "fort" }
    ] },

    { type: "texte", lignes: [
      { t: "Plus tard, un mail : son dossier pour un studio plus près de la fac est refusé." },
      { t: "« Garant insuffisant. »", style: "pense" }
    ] },

    {
      type: "tete",
      numero: 2,
      question: "Selon toi, Léa veut-elle moins de police ?",
      options: [
        "Oui, beaucoup moins.",
        "Elle s'en méfie, c'est tout.",
        "Elle en veut plus dans son quartier."
      ],
      reponse: "Elle en veut plus, mais pas comme ça. Quand le local à vélos a brûlé, c'est elle qui a appelé le 17. Personne n'est venu avant une heure. Elle veut des policiers qui connaissent le quartier, pas des contrôles à répétition.",
      source: "Dans la vraie vie : 62 % des sympathisants de La France insoumise sont favorables à l'armement des policiers municipaux (67 % de l'ensemble des Français). Elabe pour BFMTV, 8-9 juillet 2025, 1 001 personnes."
    },

    /* ==================== J-3 · Ce qui la tient ==================== */

    { type: "decor", decor: "asso", jour: 3, titre: "J-3 · Ce qui la tient", sous: "L'association du quartier, jeudi après-midi" },

    { type: "texte", lignes: [
      { t: "Tous les jeudis, Léa fait de l'aide aux devoirs." },
      { t: "Kenza, 10 ans, lui tend une lettre de l'école. Ses parents ne peuvent pas la lire." },
      { t: "Il faut la remplir avant vendredi, sinon Kenza perd sa place à la cantine.", style: "fort" }
    ] },

    { type: "choix", question: "Que fait Léa ?", options: [
      {
        texte: "Rester et remplir la lettre avec Kenza",
        exigeant: true,
        effets: { energie: -2, liens: +2 },
        drapeaux: { kenza: true },
        suite: [ { lignes: [
          { t: "Elles remplissent la lettre ensemble, case par case. Kenza écrit son nom elle-même." },
          { t: "Personne ne l'a aidée, elle, à faire ses devoirs. Si elle ne le fait pas, qui le fera ?", style: "pense" },
          { t: "Énergie -2, Liens +2.", style: "effets" }
        ] } ]
      },
      {
        texte: "Rentrer se reposer, et promettre de revenir vendredi",
        effets: { energie: +1 },
        suite: [ { lignes: [
          { t: "Vendredi, le délai sera passé de quelques heures. La directrice de l'association s'en chargera." },
          { t: "Énergie +1.", style: "effets" }
        ] } ]
      }
    ] },

    { type: "texte", lignes: [
      { t: "Sur le panneau de liège, une feuille punaisée :" },
      { t: "« La subvention de l'association n'est pas renouvelée en juin. »", style: "pense" }
    ] },

    { type: "decor", decor: "fac" },

    { type: "texte", lignes: [
      { t: "En sortant, elle passe devant la fac." },
      { t: "Première de sa famille à y entrer.", style: "pense" },
      { t: "…", style: "pense" }
    ] },

    /* ==================== J-2 · Le repas ==================== */

    { type: "decor", decor: "anniv", jour: 2, titre: "J-2 · Le repas", sous: "L'anniversaire de sa grand-mère, à Creil" },

    { type: "texte", lignes: [
      { style: "parole", de: "Oncle Patrick", t: "Alors, la fac, ça bloque toujours ? Vous cassez tout et c'est nous qui payons." },
      { style: "parole", de: "Oncle Patrick", t: "Toi et tes potes, vous détestez la France." }
    ] },

    { type: "choix", question: "Que répond Léa ?", options: [
      {
        texte: "Répondre sec",
        effets: { liens: -2 },
        suite: [ { lignes: [
          { style: "parole", de: "Léa", t: "Moi au moins je bosse en même temps que mes études." },
          { t: "La grand-mère baisse les yeux." },
          { t: "Liens -2.", style: "effets" }
        ] } ]
      },
      {
        texte: "Expliquer",
        exigeant: true,
        effets: { energie: -1, liens: +1 },
        suite: [ { lignes: [
          { style: "parole", de: "Léa", t: "Je n'ai jamais rien cassé. Je vais en cours, je bosse en caisse, je fais de l'aide aux devoirs." },
          { t: "Énergie -1, Liens +1.", style: "effets" }
        ] } ]
      },
      {
        texte: "Aller faire la vaisselle avec sa mère",
        effets: { energie: +1 },
        suite: [ { lignes: [
          { t: "Dans la cuisine, sa mère lui serre le bras sans rien dire." },
          { t: "Énergie +1.", style: "effets" }
        ] } ]
      }
    ] },

    { type: "texte", si: "appele_mere", lignes: [
      { t: "Dans la cuisine, sa mère glisse, à voix basse :" },
      { style: "parole", de: "Christine", t: "Ne t'inquiète pas pour les 100 €." }
    ] },

    {
      type: "tete",
      numero: 3,
      question: "À ton avis, Léa est-elle fière d'être française ?",
      options: [
        "Non.",
        "Elle ne se pose pas la question.",
        "Oui."
      ],
      reponse: "Oui. Elle a pleuré devant la finale de 2018. Elle aime ce pays assez pour vouloir qu'il tienne ses promesses.",
      source: "Dans la vraie vie : 66 % des sympathisants de La France insoumise et du Parti communiste se disent fiers d'être Français (78 % de l'ensemble des Français). Destin Commun, « La fierté française », enquête en ligne du 27 septembre au 8 octobre 2025, 3 008 personnes ; chiffre cité dans Le Grand Continent, janvier 2026."
    },

    { type: "texte", lignes: [
      { t: "Au moment du gâteau, l'oncle Patrick lève son verre :" },
      { style: "parole", de: "Oncle Patrick", t: "De toute façon, vous les jeunes, vous ne votez même pas." }
    ] },

    /* ==================== J-1 · La limite ==================== */

    { type: "decor", decor: "manif", jour: 1, titre: "J-1 · La limite", sous: "Manifestation pour les services publics, samedi", sinon: "a_rate_le_partiel" },
    { type: "decor", decor: "caisse", jour: 1, titre: "J-1 · La limite", sous: "La salle de pause du supermarché, samedi", si: "a_rate_le_partiel" },

    { type: "texte", si: "a_rate_le_partiel", lignes: [
      { t: "Sa responsable l'a aussi mise le samedi. Dans la salle de pause, une collègue lui tend son téléphone : une vidéo de la manif." }
    ] },

    { type: "texte", lignes: [
      { t: "La manif s'est bien passée. Des infirmières, des profs, des retraités." },
      { t: "À la fin, un groupe cagoulé brise la vitrine d'une agence bancaire." },
      { t: "Quelques personnes applaudissent.", style: "fort" }
    ] },

    { type: "choix", question: "Que fait Léa ?", options: [
      {
        texte: "Applaudir avec les autres",
        suite: [ { lignes: [
          { t: "Elle applaudit. Elle ne sait pas pourquoi.", style: "pense" }
        ] } ]
      },
      {
        texte: "Partir",
        effets: { liens: -1 },
        suite: [ { lignes: [
          { t: "Elle remonte le boulevard sans se retourner.", sinon: "a_rate_le_partiel" },
          { t: "Elle rend le téléphone et retourne en caisse.", si: "a_rate_le_partiel" },
          { t: "Liens -1.", style: "effets" }
        ] } ]
      },
      {
        texte: "Leur dire",
        exigeant: true,
        effets: { energie: -1 },
        drapeaux: { a_parle_a_la_manif: true },
        suite: [ { lignes: [
          { style: "parole", de: "Léa", t: "Vous nous plantez la manif. Demain on ne parlera que de ça." },
          { t: "Un des cagoulés la traite de « bourgeoise ». Elle rit jaune.", sinon: "a_rate_le_partiel" },
          { t: "Elle l'écrit en commentaire sous la vidéo. Quelqu'un lui répond « bourgeoise ». Elle rit jaune.", si: "a_rate_le_partiel" },
          { t: "Énergie -1.", style: "effets" }
        ] } ]
      }
    ] },

    /* ==================== Dimanche · L'isoloir ==================== */

    { type: "decor", decor: "preau", jour: 0, titre: "Dimanche · Le vote", sous: "Le préau d'une école de Saint-Denis" },

    { type: "texte", lignes: [
      { t: "Dans la file, devant le bureau de vote, elle sent le badge au fond de son sac." },
      { t: "Elle le sort enfin.", style: "pense" }
    ] },

    { type: "choix", options: [
      { texte: "Retourner le badge", drapeaux: { badge_retourne: true } }
    ] },

    { type: "decor", decor: "badge_lea" },

    { type: "texte", lignes: [
      { t: "Christine Morel · Aide-soignante · Service de nuit · CH de Creil", style: "fort" },
      { t: "Sa mère." }
    ] },

    { type: "texte", lignes: [
      { t: "Pendant le Covid, on applaudissait sa mère à 20 h. Elle faisait des nuits de douze heures." },
      { t: "Après, plus personne n'a applaudi, et rien n'a changé." },
      { t: "Sa mère lui a donné ce badge quand elle a été arrêtée trois mois pour son dos. Elle a repris les nuits depuis." }
    ] },

    { type: "texte", lignes: [
      { t: "Léa ne votait pas parce qu'elle pensait que ça ne servait à rien." },
      { t: "Elle y va parce que l'oncle Patrick a raison sur un point : si les jeunes ne votent pas, personne ne parle pour eux." },
      { t: "Sa mère dort le dimanche, après ses nuits. Elle ne vote jamais. Aujourd'hui, Léa vote pour deux.", style: "pense" }
    ] },

    { type: "decor", decor: "isoloir" },

    { type: "texte", lignes: [
      { t: "Le rideau se referme. Sur la tablette, une enveloppe et une feuille blanche." },
      { t: "Elle pense au partiel, qu'elle a passé jeudi.", si: "est_allee_au_partiel" },
      { t: "Elle pense au partiel, qu'elle repassera en juin.", si: "a_rate_le_partiel" },
      { t: "Elle pense à Yanis, les mains sur le guidon, et à elle, à deux mètres.", si: "descendue" },
      { t: "Elle pense à Yanis, qui n'a rien dit de la soirée.", sinon: "descendue" },
      { t: "Elle pense à Kenza, qui a écrit son nom elle-même.", si: "kenza" },
      { t: "Elle pense à Kenza, et au délai passé de quelques heures.", sinon: "kenza" },
      { t: "Elle pense à la vitrine, et à ce qu'elle a dit.", si: "a_parle_a_la_manif" },
      { t: "Elle pense à la vitrine. Elle aurait pu dire quelque chose.", sinon: "a_parle_a_la_manif" }
    ] },

    { type: "texte", lignes: [
      { t: "« De toute façon, vous les jeunes, vous ne votez même pas. »", style: "pense" },
      { t: "Elle glisse sa feuille dans l'enveloppe." }
    ] },

    { type: "choix", question: "Toi aussi, tu as une enveloppe.", vote: true, options: [
      { texte: "Voter comme elle" },
      { texte: "Voter autrement" },
      { texte: "Voter blanc" }
    ] },

    { type: "texte", lignes: [
      { t: "Léa sort de l'isoloir et glisse son enveloppe dans l'urne." },
      { t: "« A voté. »", style: "fort" },
      { t: "Tu n'as pas à voter comme elle. Mais maintenant, tu sais pourquoi elle le fait.", style: "pense" },
      { t: "Ton choix n'est enregistré nulle part.", style: "note" }
    ] },

    /* ==================== Le quiz et le pont ==================== */

    { type: "decor", decor: "pont", titre: "Devine ce que pense l'autre", sous: "Trois questions sur ceux qui votent comme Léa" },

    {
      type: "quiz",
      groupe: "les sympathisants de La France insoumise et du Parti communiste",
      questions: [
        { q: "Selon toi, combien de ceux qui votent comme Léa trouvent anormal d'utiliser la violence pour défendre ses intérêts ?", vrai: 71, source: "Ipsos bva pour le Cevipof, la Fondation Jean-Jaurès, Le Monde et l'Institut Montaigne, « Fractures françaises », 1er-9 octobre 2025, 3 000 personnes." },
        { q: "Selon toi, combien d'entre eux disent avoir du mal à joindre les deux bouts ?", vrai: 67, source: "Ipsos bva pour le Cevipof, la Fondation Jean-Jaurès, Le Monde et l'Institut Montaigne, « Fractures françaises », 1er-9 octobre 2025, 3 000 personnes." },
        { q: "Selon toi, combien d'entre eux disent que les gens comme eux ont des conditions de vie de moins en moins bonnes ?", vrai: 78, source: "Ipsos bva pour le Cevipof, la Fondation Jean-Jaurès, Le Monde et l'Institut Montaigne, « Fractures françaises », 1er-9 octobre 2025, 3 000 personnes." }
      ]
    },

    { type: "rencontre" },

    { type: "generique" },
    { type: "fin" }
  ]
};
