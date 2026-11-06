/*
 * L'histoire : la semaine de Sébastien, de J-6 jusqu'à l'isoloir,
 * d'après le script « L'Autre Rive — scripts des deux personnages ».
 *
 * Pour modifier le texte, c'est ici. Chaque étape a un « type » :
 *   decor  : change le décor (et le jour avec « jour »), affiche un titre de scène
 *   texte  : une page de texte (on touche l'écran pour continuer)
 *   choix  : des boutons ; chaque option peut changer les jauges
 *            (effets), poser des drapeaux, et enchaîner des pages (suite)
 *   tete   : un moment « Dans sa tête » (le joueur parie, puis découvre)
 *   fin    : le récapitulatif de la semaine
 *
 * Dans les pages, chaque ligne a un style : recit, pense, fort, note, effets,
 * sms ou parole (avec « de » : qui écrit ou qui parle).
 *
 * Conditions : une étape, une ligne ou une page peut porter
 *   si: "drapeau"     → affichée seulement si ce choix a été fait
 *   sinon: "drapeau"  → affichée seulement s'il n'a pas été fait
 * Dans le texte, {fin_de_mois} est remplacé par la somme du moment.
 *
 * Choix grisés : « exigeant: true » grise le choix sous 3 d'énergie ;
 * « exige: { fin_de_mois: 30, raison: "…" } » le grise sous 30 €.
 */
window.Parcours = window.Parcours || {};
window.Parcours.sebastien = {
  id: "sebastien",
  prenom: "Sébastien",
  rive: "gauche",
  presentation: "Sébastien, 47 ans, cariste dans un village du Nord-Est",
  fatigue: "Trop fatigué pour ça.",
  // Les lignes du récapitulatif de fin de semaine
  recap: [
    { nom: "Berlin", si: "berlin", oui: "payé", non: "pas cette fois" },
    { nom: "La nuit du bip", si: "parti_intervention", oui: "il est parti", non: "il est resté avec Manon" },
    { nom: "Au Balto", si: "a_parle_au_bar", oui: "il a répondu", non: "il n'a rien dit" }
  ],
  badge: "Roger Marchal, son père",

  depart: {
    jour: 6,          // J-6 : six jours avant le vote
    fin_de_mois: 212, // en euros (d'après le script)
    energie: 6,       // sur 10
    liens: 5          // sur 10
  },

  seuil_energie: 3,

  // Chaque nuit, il récupère un peu d'énergie
  recuperation_nuit: 1,

  etapes: [

    /* ==================== J-6 · Le matin ==================== */

    { type: "decor", decor: "cuisine", jour: 6, titre: "J-6 · Le matin", sous: "Sébastien Marchal, 47 ans · Vresnes" },

    { type: "texte", lignes: [
      { t: "5 h 10. Nathalie, sa femme, dort encore. Elle commence à 7 h chez Mme Fabre, 91 ans." },
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
        suite: [ { lignes: [
          { t: "Didier monte en soufflant dans ses mains. Il parle de son fils, du foot, du prix du gazole." },
          { t: "Sébastien écoute à moitié. Didier parle beaucoup." },
          { t: "Fin de mois +6 €, Liens +1, Énergie -1.", style: "effets" }
        ] } ]
      },
      {
        texte: "Dire à Didier qu'il ne peut pas",
        detail: "Une excuse : il part plus tôt. Le trajet en silence, la radio.",
        effets: { energie: +1, liens: -1 },
        suite: [ { lignes: [
          { style: "sms", de: "Sébastien", t: "Désolé, je pars plus tôt ce matin." },
          { t: "Il pose le téléphone. Didier trouvera quelqu'un." },
          { t: "Énergie +1, Liens -1.", style: "effets" }
        ] } ]
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
      source: "Dans la vraie vie : 68 % des sympathisants du Rassemblement national se disent inquiets face au changement climatique (74 % de l'ensemble des Français). " + "Ipsos bva, « Fractures françaises », octobre 2025, chiffre cité par la Fondation Jean-Jaurès."
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
        suite: [ { lignes: [
          { t: "Ses doigts s'arrêtent sur le plastique." },
          { t: "Il referme la boîte à gants. Pas aujourd'hui." }
        ] } ]
      },
      {
        texte: "Refermer la boîte à gants",
        suite: [ { lignes: [
          { t: "Il prend l'attestation et referme la boîte à gants." }
        ] } ]
      }
    ] },

    /* ==================== J-5 · Le compte ==================== */

    { type: "decor", decor: "pause", jour: 5, titre: "J-5 · Le compte", sous: "La pause de 10 h, sur le quai de chargement" },

    { type: "texte", lignes: [
      { t: "Assis sur une palette, il ouvre l'appli de la banque." },
      { t: "Solde : {fin_de_mois} €. On est le 19. La paie tombe le 2.", style: "fort" }
    ] },

    { type: "texte", lignes: [
      { style: "sms", de: "Manon", t: "Papa, faut payer le reste du voyage à Berlin avant vendredi. 180 €. Tout le monde y va." },
      { t: "Le voyant du réservoir est allumé depuis hier. Un plein, c'est 85 €." }
    ] },

    { type: "choix", question: "Que fait Sébastien ?", options: [
      {
        texte: "Payer Berlin",
        detail: "Il roulera sur la réserve.",
        effets: { fin_de_mois: -180, liens: +2 },
        drapeaux: { berlin: true },
        suite: [ { lignes: [
          { style: "sms", de: "Sébastien", t: "C'est payé. Profite." },
          { t: "Il roulera sur la réserve, et ça pèsera demain." },
          { t: "Fin de mois -180 €, Liens +2.", style: "effets" }
        ] } ]
      },
      {
        texte: "Faire le plein et dire à Manon qu'on verra",
        effets: { fin_de_mois: -85, liens: -2 },
        drapeaux: { plein: true },
        suite: [ { lignes: [
          { style: "sms", de: "Sébastien", t: "On verra. Là c'est compliqué." },
          { style: "sms", de: "Manon", t: "ok" },
          { t: "Juste « ok »." },
          { t: "Fin de mois -85 €, Liens -2.", style: "effets" }
        ] } ]
      },
      {
        texte: "Accepter les heures sup du samedi",
        detail: "Pour payer les deux.",
        exigeant: true,
        effets: { energie: -3 },
        drapeaux: { samedi_au_boulot: true, berlin: true },
        suite: [ { lignes: [
          { t: "Le chef note son nom pour samedi. Il paiera les deux, plus tard." },
          { t: "Ce samedi, il ne sera pas au Balto, le bar-tabac où il retrouve les copains." },
          { t: "Énergie -3.", style: "effets" }
        ] } ]
      }
    ] },

    { type: "texte", lignes: [
      { t: "Il ne se plaint pas. Il fait ses comptes.", style: "pense" }
    ] },

    /* ==================== J-4 · Ce qui manque ==================== */

    { type: "decor", decor: "rue", jour: 4, titre: "J-4 · Ce qui manque", sous: "La grand-rue de Vresnes, au crépuscule" },

    { type: "texte", lignes: [
      { t: "La pharmacie a le rideau baissé. Sur la porte de la poste, une affiche :" },
      { t: "« À compter du 1er mai, vos services postaux au Balto. »", style: "pense" },
      { t: "Le Balto, c'est le bar-tabac du village.", sinon: "samedi_au_boulot" }
    ] },

    { type: "texte", lignes: [
      { t: "La mère de Nathalie a besoin de son traitement pour le cœur. Il n'en reste que pour deux jours." },
      { t: "La pharmacie du village a fermé en janvier. La plus proche est à 35 km. Le médecin, lui, ne prend plus de nouveaux patients." }
    ] },

    { type: "choix", question: "Que fait Sébastien ?", options: [
      {
        texte: "Y aller ce soir après le boulot",
        detail: "70 km aller-retour.",
        exigeant: true,
        exige: { fin_de_mois: 30, raison: "Plus assez pour l'essence." },
        effets: { fin_de_mois: -12, energie: -2 },
        drapeaux: { pharmacie_soir: true },
        suite: [ { lignes: [
          { t: "Il rentre à 21 h. La boîte de médicaments est sur la table quand Nathalie se lève." },
          { t: "Fin de mois -12 €, Énergie -2.", style: "effets" }
        ] } ]
      },
      {
        texte: "Demander au fils de Mme Fabre, qui travaille là-bas",
        effets: { liens: +1 },
        drapeaux: { pharmacie_fils: true },
        suite: [ { lignes: [
          { style: "parole", de: "Le fils de Mme Fabre", t: "Pas de souci, je te le dépose demain." },
          { t: "En échange, Sébastien lui rendra service samedi." },
          { t: "Liens +1.", style: "effets" }
        ] } ]
      },
      {
        texte: "Attendre samedi",
        effets: { energie: +1, liens: -2 },
        drapeaux: { pharmacie_attente: true },
        suite: [ { lignes: [
          { t: "Nathalie ne dit rien. C'est pire." },
          { t: "Énergie +1, Liens -2.", style: "effets" }
        ] } ]
      }
    ] },

    {
      type: "tete",
      numero: 2,
      question: "Selon toi, Sébastien veut-il moins d'État ?",
      options: [
        "Oui, moins d'impôts et moins d'État.",
        "Il s'en fiche.",
        "Non, il en veut plus."
      ],
      reponse: "Il en veut plus. Une pharmacie, une poste, une maternité à moins d'une heure. Ce qu'il ne supporte pas, c'est de payer pour des services qu'il ne voit jamais.",
      source: "Dans la vraie vie : 75 % des sympathisants du Rassemblement national jugent que les services publics locaux n'ont pas assez de moyens par rapport aux besoins de la population (73 % de l'ensemble des Français). OpinionWay pour le Sens du service public, la Casden et la Fondation Jean-Jaurès, 7-12 janvier 2026, 2 000 personnes."
    },

    /* ==================== J-3 · Ce qui le tient ==================== */

    { type: "decor", decor: "cuisine", jour: 3, titre: "J-3 · Ce qui le tient", sous: "21 h 40, à la maison" },

    { type: "texte", lignes: [
      { t: "21 h 40. Le bip sonne. Accident sur la D29, un scooter et une camionnette.", style: "fort" },
      { t: "Pompier volontaire depuis vingt ans, il connaît ce son par cœur." },
      { t: "Manon vient de rentrer. Elle voulait lui parler « d'un truc »." }
    ] },

    { type: "choix", question: "Que fait Sébastien ?", options: [
      {
        texte: "Partir",
        exigeant: true,
        effets: { energie: -3, liens: -1 },
        drapeaux: { parti_intervention: true },
        suite: [ { lignes: [
          { style: "parole", de: "Sébastien", t: "On en parle demain, ma puce." },
          { t: "Énergie -3, Liens -1.", style: "effets" }
        ] } ]
      },
      {
        texte: "Rester, un autre de l'équipe ira",
        effets: { liens: +2 },
        suite: [ { lignes: [
          { t: "Il s'assoit. Manon lui parle de Lille, de la fac, de partir." },
          { t: "Liens +2.", style: "effets" }
        ] } ]
      }
    ] },

    { type: "decor", decor: "accident", si: "parti_intervention" },

    { type: "texte", si: "parti_intervention", lignes: [
      { t: "Sur place, un gamin de 19 ans, livreur, la jambe coincée sous la camionnette." },
      { t: "Sébastien lui parle tout le long de la désincarcération." },
      { t: "Ici, si on n'y va pas, personne n'y va.", style: "pense" }
    ] },

    { type: "texte", sinon: "parti_intervention", lignes: [
      { t: "Plus tard, il apprend que l'équipe est arrivée avec 20 minutes de retard." },
      { t: "Il manquait un chauffeur.", style: "fort" }
    ] },

    { type: "texte", lignes: [
      { t: "Sur le groupe des pompiers, un dernier message de la soirée :" },
      { t: "« La caserne de Vresnes sera regroupée avec celle de Saint-Ambrel à la rentrée. 25 km de plus. »", style: "pense" }
    ] },

    { type: "decor", decor: "fonderie" },

    { type: "texte", lignes: [
      { t: "Le lendemain matin, sur la route, il passe devant la fonderie." },
      { t: "Vingt-deux ans là-dedans. Fermée en 2019." },
      { t: "…", style: "pense" }
    ] },

    /* ==================== J-2 · Le repas ==================== */

    { type: "decor", decor: "repas", jour: 2, titre: "J-2 · Le repas", sous: "La table de la cuisine, la télé sans le son" },

    { type: "texte", lignes: [
      { style: "parole", de: "Manon", t: "Papa, tu vas voter pour eux, dimanche ?" },
      { style: "parole", de: "Manon", t: "Mes potes disent que c'est des racistes. T'es raciste, toi ?" }
    ] },

    { type: "choix", question: "Que répond Sébastien ?", options: [
      {
        texte: "Hausser le ton",
        effets: { liens: -2 },
        suite: [ { lignes: [
          { style: "parole", de: "Sébastien", t: "Tu crois que tes potes savent ce que c'est, de bosser ?" },
          { t: "Manon quitte la table." },
          { t: "Liens -2.", style: "effets" }
        ] } ]
      },
      {
        texte: "Expliquer",
        exigeant: true,
        effets: { energie: -1, liens: +1 },
        suite: [ { lignes: [
          { style: "parole", de: "Sébastien", t: "J'ai bossé avec des Portugais, des Turcs, des Marocains pendant 22 ans. On était tous dans la même merde quand l'usine a fermé." },
          { t: "Énergie -1, Liens +1.", style: "effets" }
        ] } ]
      },
      {
        texte: "Sortir fumer",
        effets: { energie: +1 },
        suite: [ { lignes: [
          { t: "Il sort sur le pas de la porte. Manon le suit dehors, sans un mot." },
          { t: "Énergie +1.", style: "effets" }
        ] } ]
      }
    ] },

    { type: "texte", si: "berlin", lignes: [
      { t: "Un temps. Puis, plus doucement :" },
      { style: "parole", de: "Manon", t: "Merci pour Berlin, au fait." }
    ] },

    {
      type: "tete",
      numero: 3,
      avant: [
        { style: "parole", de: "Manon", t: "Et Clémence, qui sort avec une fille, tu la trouves comment ?" }
      ],
      question: "À ton avis, que répond Sébastien ?",
      options: [
        "Il désapprouve.",
        "Il évite le sujet.",
        "Ça lui est égal."
      ],
      reponse: "Elle fait ce qu'elle veut. Elle est polie, elle dit bonjour, elle est la bienvenue ici.",
      source: "Dans la vraie vie : 64 % des sympathisants du Rassemblement national jugent positivement la loi ouvrant le mariage et l'adoption aux couples de même sexe (71 % de l'ensemble des Français). Ifop pour l'ADFH, 26-29 avril 2024, 1 011 personnes."
    },

    { type: "texte", lignes: [
      { t: "Manon se lève pour débarrasser. Sur le pas de la porte de la cuisine, elle se retourne :" },
      { style: "parole", de: "Manon", t: "Tu te plains tout le temps, mais tu votes même pas." }
    ] },

    /* ==================== J-1 · La limite ==================== */

    { type: "decor", decor: "balto", jour: 1, titre: "J-1 · La limite", sous: "Le Balto, samedi midi", sinon: "samedi_au_boulot" },
    { type: "decor", decor: "pause", jour: 1, titre: "J-1 · La limite", sous: "L'entrepôt, samedi midi", si: "samedi_au_boulot" },

    { type: "texte", si: "pharmacie_fils", lignes: [
      { t: "Ce matin, il a aidé le fils de Mme Fabre à monter une armoire au deuxième. Service rendu." }
    ] },

    { type: "texte", sinon: "samedi_au_boulot", lignes: [
      { t: "Un nouveau médecin s'est installé au village voisin, le Dr Benali. Le premier depuis quatre ans." },
      { t: "Jean-Mi, au comptoir, fait une blague sur « le toubib ». Une blague raciste." },
      { t: "Deux types rient.", style: "fort" }
    ] },

    { type: "texte", si: "samedi_au_boulot", lignes: [
      { t: "Pause de midi. Sur le groupe WhatsApp des pompiers, une vidéo filmée au Balto." },
      { t: "Jean-Mi parle du nouveau médecin du village voisin, le Dr Benali, le premier depuis quatre ans. Une blague raciste." },
      { t: "Deux types répondent avec des rires.", style: "fort" }
    ] },

    { type: "choix", question: "Que fait Sébastien ?", options: [
      {
        texte: "Rire avec les autres",
        suite: [ { lignes: [
          { t: "Il rit. Il ne sait pas pourquoi.", style: "pense" }
        ] } ]
      },
      {
        texte: "Ne rien dire et partir",
        effets: { liens: -1 },
        suite: [ { lignes: [
          { t: "Il pose son verre et s'en va sans un mot.", sinon: "samedi_au_boulot" },
          { t: "Il quitte le groupe de la conversation sans un mot.", si: "samedi_au_boulot" },
          { t: "Liens -1.", style: "effets" }
        ] } ]
      },
      {
        texte: "Répondre",
        exigeant: true,
        effets: { energie: -1 },
        drapeaux: { a_parle_au_bar: true },
        suite: [ { lignes: [
          { style: "parole", de: "Sébastien", t: "Lui au moins, il est venu, Jean-Mi. Toi t'as jamais soigné personne." },
          { t: "Silence au comptoir, puis le patron change de sujet.", sinon: "samedi_au_boulot" },
          { t: "Plus personne n'écrit sur le groupe pendant une heure.", si: "samedi_au_boulot" },
          { t: "Énergie -1.", style: "effets" }
        ] } ]
      }
    ] },

    /* ==================== Dimanche · L'isoloir ==================== */

    { type: "decor", decor: "mairie", jour: 0, titre: "Dimanche · Le vote", sous: "Le parking de la mairie" },

    { type: "texte", lignes: [
      { t: "Il se gare devant la mairie. Avant d'entrer, il ouvre la boîte à gants." },
      { t: "Le badge est là, face cachée, comme toujours.", style: "pense" }
    ] },

    { type: "choix", options: [
      { texte: "Retourner le badge", drapeaux: { badge_retourne: true } }
    ] },

    { type: "decor", decor: "badge" },

    { type: "texte", lignes: [
      { t: "Roger Marchal · Fonderie de Vresnes · 1971", style: "fort" },
      { t: "Son père." }
    ] },

    { type: "texte", lignes: [
      { t: "Papa a voté toute sa vie pour ceux qui défendaient les ouvriers. Il disait : « On lâche rien. »" },
      { t: "Il est mort six mois après la fermeture." }
    ] },

    { type: "texte", lignes: [
      { t: "Sébastien a arrêté de voter parce que ça n'avait rien changé." },
      { t: "Il y retourne parce que Manon a raison : on ne peut pas se plaindre et se taire." },
      { t: "Il ne sait pas si son père serait d'accord avec son bulletin. Il sait qu'il serait venu voter.", style: "pense" }
    ] },

    { type: "decor", decor: "isoloir" },

    { type: "texte", lignes: [
      { t: "Le rideau se referme. Sur la tablette, une enveloppe et une feuille blanche." },
      { t: "Il pense à la mère de Nathalie et aux soixante-dix kilomètres pour une boîte de médicaments.", si: "pharmacie_soir" },
      { t: "Il pense au fils de Mme Fabre, qui a rendu service sans poser de questions.", si: "pharmacie_fils" },
      { t: "Il pense au silence de Nathalie, jeudi soir.", si: "pharmacie_attente" },
      { t: "Il pense au gamin de la D29, et aux 25 km de plus à la rentrée.", si: "parti_intervention" },
      { t: "Il pense aux vingt minutes de retard, et aux 25 km de plus à la rentrée.", sinon: "parti_intervention" },
      { t: "Il pense à Jean-Mi, et au silence qui a suivi.", si: "a_parle_au_bar" },
      { t: "Il pense à Jean-Mi. Il aurait pu dire quelque chose.", sinon: "a_parle_au_bar" }
    ] },

    { type: "texte", lignes: [
      { t: "« Tu te plains tout le temps, mais tu votes même pas. »", style: "pense" },
      { t: "Il glisse sa feuille dans l'enveloppe." }
    ] },

    { type: "choix", question: "Toi aussi, tu as une enveloppe.", vote: true, options: [
      { texte: "Voter comme lui" },
      { texte: "Voter autrement" },
      { texte: "Voter blanc" }
    ] },

    { type: "texte", lignes: [
      { t: "Sébastien sort de l'isoloir et glisse son enveloppe dans l'urne." },
      { t: "« A voté. »", style: "fort" },
      { t: "Tu n'as pas à voter comme lui. Mais maintenant, tu sais pourquoi il le fait.", style: "pense" },
      { t: "Ton choix n'est enregistré nulle part.", style: "note" }
    ] },

    /* ==================== Le quiz et le pont ==================== */

    { type: "decor", decor: "pont", titre: "Devine ce que pense l'autre", sous: "Trois questions sur ceux qui votent comme Sébastien" },

    {
      type: "quiz",
      groupe: "les sympathisants du Rassemblement national",
      questions: [
        { q: "Selon toi, combien de ceux qui votent comme Sébastien trouvent anormal d'utiliser la violence pour défendre ses intérêts ?", vrai: 76, source: "Ipsos bva pour le Cevipof, la Fondation Jean-Jaurès, Le Monde et l'Institut Montaigne, « Fractures françaises », 1er-9 octobre 2025, 3 000 personnes." },
        { q: "Selon toi, combien d'entre eux disent avoir du mal à joindre les deux bouts ?", vrai: 67, source: "Ipsos bva pour le Cevipof, la Fondation Jean-Jaurès, Le Monde et l'Institut Montaigne, « Fractures françaises », 1er-9 octobre 2025, 3 000 personnes." },
        { q: "Selon toi, combien d'entre eux se disent inquiets face au changement climatique ?", vrai: 68, source: "Ipsos bva pour le Cevipof, la Fondation Jean-Jaurès, Le Monde et l'Institut Montaigne, « Fractures françaises », 1er-9 octobre 2025, 3 000 personnes. Chiffre cité par la Fondation Jean-Jaurès." }
      ]
    },

    { type: "rencontre" },

    { type: "generique" },
    { type: "fin" }
  ]
};
