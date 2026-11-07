/*
 * Le moteur du jeu : affiche le texte, les choix, les jauges et le décor.
 * Le contenu de l'histoire est dans histoire.js.
 */
(function () {
  "use strict";

  var P = window.Parcours;
  var H = P.sebastien; // le parcours en cours
  var D = window.Dessins;

  var el = {
    jeu: document.getElementById("jeu"),
    hud: document.getElementById("hud"),
    jour: document.getElementById("compte-jour"),
    jourTexte: document.getElementById("compte-texte"),
    pips: document.getElementById("compte-pips"),
    canvas: document.getElementById("scene"),
    titre: document.getElementById("titre-scene"),
    boite: document.getElementById("boite"),
    texte: document.getElementById("texte"),
    choix: document.getElementById("choix"),
    suite: document.getElementById("suite"),
    son: document.getElementById("son")
  };
  var M = window.Musique;
  var ctx = el.canvas.getContext("2d");

  var NOMS = { fin_de_mois: "Fin de mois", energie: "Énergie", liens: "Liens" };

  var etat;            // jauges, drapeaux, pari…
  var index = -1;      // étape en cours
  var file = [];       // pages à afficher avant l'étape suivante (suites de choix)
  var decor = "pont";
  var frappe = null;   // texte en cours d'écriture : { finir: fn }
  var attente = null;  // ce qui se passe quand on touche l'écran

  /* ---------------- État ---------------- */

  function nouvelEtat() {
    return {
      jour: H.depart.jour,
      fin_de_mois: H.depart.fin_de_mois,
      energie: H.depart.energie,
      liens: H.depart.liens,
      parcours: H.id,
      drapeaux: {},
      paris: [],
      vote: null,
      choixFaits: []
    };
  }

  // Une étape, une page ou une ligne peut dépendre d'un choix passé
  function visible(x) {
    if (!x) return false;
    if (x.si && !etat.drapeaux[x.si]) return false;
    if (x.sinon && etat.drapeaux[x.sinon]) return false;
    return true;
  }

  // {fin_de_mois} → la somme du moment
  function remplir(texte) {
    return texte.replace(/\{(\w+)\}/g, function (tout, cle) {
      return etat[cle] !== undefined ? etat[cle] : tout;
    });
  }

  /* ---------------- Décor animé ---------------- */

  function boucle(ms) {
    var dessin = D[decor];
    if (dessin) {
      ctx.clearRect(0, 0, D.largeur, D.hauteur);
      dessin(ctx, ms / 1000, etat);
    }
    window.requestAnimationFrame(boucle);
  }

  /* ---------------- Bandeau : compte à rebours et jauges ---------------- */

  function afficherBandeau() {
    el.jour.textContent = etat.jour > 0 ? "J-" + etat.jour : "Dimanche";
    el.jourTexte.textContent = etat.jour > 0 ? "avant le vote" : "jour du vote";
    el.pips.innerHTML = "";
    var total = H.depart.jour; // J-6 … J-1, puis dimanche
    for (var i = 0; i <= total; i++) {
      var pip = document.createElement("i");
      var jourDuPip = total - i; // 6, 5, … 1, 0 (le vote)
      if (jourDuPip === 0) pip.className = "vote";
      if (jourDuPip > etat.jour) pip.className = "passe";
      else if (jourDuPip === etat.jour) pip.className = "aujourdhui";
      pip.title = jourDuPip === 0 ? "Dimanche : le vote" : "J-" + jourDuPip;
      el.pips.appendChild(pip);
    }

    var argent = document.querySelector("#jauge-fin_de_mois .nombre");
    argent.textContent = etat.fin_de_mois;
    argent.parentNode.classList.toggle("bas", etat.fin_de_mois < 30);

    ["energie", "liens"].forEach(function (cle) {
      var barre = document.querySelector("#jauge-" + cle + " .jauge-barre");
      barre.innerHTML = "";
      for (var n = 0; n < 10; n++) {
        var case_ = document.createElement("i");
        if (n < etat[cle]) case_.className = "plein";
        barre.appendChild(case_);
      }
      barre.classList.toggle("bas", etat[cle] < H.seuil_energie);
      barre.parentNode.setAttribute("aria-label", NOMS[cle] + " : " + etat[cle] + " sur 10");
    });
    document.getElementById("jauge-fin_de_mois").setAttribute("aria-label", "Fin de mois : " + etat.fin_de_mois + " euros");
  }

  function appliquer(effets) {
    if (!effets) return;
    Object.keys(effets).forEach(function (cle) {
      var avant = etat[cle];
      var apres = avant + effets[cle];
      if (cle !== "fin_de_mois") apres = Math.max(0, Math.min(10, apres));
      etat[cle] = apres;
      var diff = apres - avant;
      if (!diff) return;

      var jauge = document.getElementById("jauge-" + cle);
      var bulle = jauge.querySelector(".jauge-delta");
      bulle.textContent = (diff > 0 ? "+" : "") + diff + (cle === "fin_de_mois" ? " €" : "");
      bulle.className = "jauge-delta " + (diff > 0 ? "plus" : "moins");
      void bulle.offsetWidth; // relance l'animation
      bulle.classList.add("montre");
      if (diff < 0) {
        jauge.classList.remove("secoue");
        void jauge.offsetWidth;
        jauge.classList.add("secoue");
      }
    });
    afficherBandeau();
  }

  /* ---------------- Texte écrit lettre par lettre ---------------- */

  function vider() {
    if (frappe) frappe.annuler();
    frappe = null;
    attente = null;
    el.texte.innerHTML = "";
    el.choix.innerHTML = "";
    el.suite.classList.add("cache");
    el.boite.scrollTop = 0; // sur ordinateur, la boîte de texte défile toute seule
  }

  function creerLigne(ligne) {
    var noeud, cible;
    if (ligne.style === "sms" || ligne.style === "parole") {
      noeud = document.createElement("div");
      noeud.className = ligne.style + (ligne.flou ? " flou" : "");
      var de = document.createElement("b");
      de.textContent = ligne.de || "";
      cible = document.createElement("span");
      noeud.appendChild(de);
      noeud.appendChild(cible);
    } else if (ligne.style === "rubrique") {
      noeud = document.createElement("div");
      var etiquette = document.createElement("span");
      etiquette.className = "rubrique";
      noeud.appendChild(etiquette);
      cible = etiquette;
    } else {
      noeud = document.createElement("p");
      noeud.className = ligne.style || "recit";
      cible = noeud;
    }
    el.texte.appendChild(noeud);
    return cible;
  }

  // Écrit les lignes, puis appelle fini()
  function ecrire(lignes, fini) {
    lignes = lignes.filter(visible).map(function (l) {
      var copie = {}; for (var k in l) copie[k] = l[k];
      copie.t = remplir(l.t);
      return copie;
    });
    var cibles = lignes.map(creerLigne);
    var i = 0, c = 0, minuteur = null;
    var lent = !window.matchMedia || !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function terminer() {
      if (minuteur) clearTimeout(minuteur);
      lignes.forEach(function (l, k) { cibles[k].textContent = l.t; });
      frappe = null;
      fini();
    }

    function pas() {
      if (i >= lignes.length) { terminer(); return; }
      var txt = lignes[i].t;
      c++;
      cibles[i].textContent = txt.slice(0, c);
      var car = txt.charAt(c - 1);
      var delai = 20;
      if (".?!".indexOf(car) >= 0) delai = 260;
      else if (",:;".indexOf(car) >= 0) delai = 120;
      if (c >= txt.length) { i++; c = 0; delai = 320; }
      minuteur = setTimeout(pas, delai);
    }

    frappe = {
      finir: terminer,
      annuler: function () { if (minuteur) clearTimeout(minuteur); }
    };
    if (lent) pas(); else terminer();
  }

  // Une page de texte : on attend que le joueur touche l'écran pour continuer
  function page(lignes, ensuite) {
    vider();
    ecrire(lignes, function () {
      el.suite.classList.remove("cache");
      attente = function () { attente = null; ensuite(); };
    });
  }

  function toucher() {
    if (frappe) { frappe.finir(); return; }
    if (attente) attente();
  }

  /* ---------------- Boutons de choix ---------------- */

  function boutons(options, auChoix) {
    el.choix.innerHTML = "";
    options.forEach(function (opt, n) {
      var b = document.createElement("button");
      b.type = "button";
      if (opt.classe) b.className = opt.classe;
      b.textContent = opt.texte;

      var bloque = raisonBlocage(opt);
      if (opt.detail || bloque) {
        var sous = document.createElement("span");
        sous.className = "raison";
        sous.textContent = bloque || opt.detail;
        b.appendChild(sous);
      }
      if (bloque) b.disabled = true;

      b.addEventListener("click", function (ev) {
        ev.stopPropagation();
        if (b.disabled) return;
        auChoix(opt, n);
      });
      el.choix.appendChild(b);
    });
    var premier = el.choix.querySelector("button:not(:disabled)");
    if (premier && !("ontouchstart" in window)) premier.focus({ preventScroll: true });
  }

  // Un choix est grisé si le personnage n'en a plus les moyens
  function raisonBlocage(opt) {
    if (opt.exigeant && etat.energie < H.seuil_energie) return H.fatigue;
    if (opt.exige) {
      for (var cle in opt.exige) {
        if (cle !== "raison" && etat[cle] < opt.exige[cle]) return opt.exige.raison || "Pas possible.";
      }
    }
    return null;
  }

  /* ---------------- Déroulé de l'histoire ---------------- */

  function avancer() {
    while (file.length) {
      var p = file.shift();
      if (visible(p)) { page(p.lignes, avancer); return; }
    }
    var etape;
    do {
      index++;
      etape = H.etapes[index];
      if (!etape) { accueil(); return; }
    } while (!visible(etape));
    sauver();
    jouer(etape);
  }

  function jouer(etape) {
    switch (etape.type) {
      case "decor": return jouerDecor(etape);
      case "texte": return page(etape.lignes, avancer);
      case "choix": return jouerChoix(etape);
      case "tete": return jouerTete(etape);
      case "quiz": return jouerQuiz(etape);
      case "rencontre": return jouerRencontre();
      case "generique": return jouerGenerique();
      case "fin": return jouerFin();
    }
  }

  function jouerDecor(etape) {
    decor = etape.decor;
    M.jouer(decor);
    if (etape.jour !== undefined && etape.jour !== etat.jour) {
      etat.jour = etape.jour;
      afficherBandeau();
      if (H.recuperation_nuit) appliquer({ energie: H.recuperation_nuit }); // une nuit de sommeil
    }
    if (!etape.titre) { avancer(); return; }
    vider();
    el.titre.innerHTML = "";
    el.titre.appendChild(document.createTextNode(etape.titre));
    if (etape.sous) {
      var s = document.createElement("small");
      s.textContent = etape.sous;
      el.titre.appendChild(s);
    }
    el.titre.classList.add("visible");
    var p = document.createElement("p");
    p.className = "note";
    p.textContent = (window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches)
      ? "Clique pour continuer." : "Touche l'écran pour continuer.";
    el.texte.appendChild(p);
    el.suite.classList.remove("cache");
    attente = function () {
      attente = null;
      el.titre.classList.remove("visible");
      avancer();
    };
  }

  function jouerChoix(etape) {
    vider();
    var lignes = etape.question ? [{ t: etape.question, style: "fort" }] : [];
    ecrire(lignes, function () {
      boutons(etape.options, function (opt) {
        appliquer(opt.effets);
        if (opt.drapeaux) Object.keys(opt.drapeaux).forEach(function (k) { etat.drapeaux[k] = opt.drapeaux[k]; });
        etat.choixFaits.push(opt.texte);
        if (etape.vote) etat.vote = opt.texte;
        file = (opt.suite || []).slice();
        avancer();
      });
    });
  }

  function jouerTete(etape) {
    vider();
    ecrire([{ t: "Dans sa tête n°" + etape.numero, style: "rubrique" }]
      .concat(etape.avant || [])
      .concat([
        { t: etape.question, style: "fort" },
        { t: "Fais ton pari.", style: "note" }
      ]), function () {
      boutons(etape.options.map(function (o) { return { texte: o }; }), function (opt) {
        etat.paris.push({ numero: etape.numero, pari: opt.texte });
        var lignes = [
          { t: "Dans sa tête n°" + etape.numero, style: "rubrique" },
          { t: "Ton pari : " + opt.texte, style: "recit" },
          { t: H.prenom + " :", style: "fort" },
          { t: "« " + etape.reponse + " »", style: "pense" }
        ];
        lignes.push(etape.source
          ? { t: etape.source, style: "note" }
          : { t: "Le chiffre de sondage sur son électorat sera ajouté ici, avec sa source.", style: "note" });
        page(lignes, avancer);
      });
    });
  }

  /* ---------------- Le quiz « Devine ce que pense l'autre » ---------------- */

  function jouerQuiz(etape) {
    var n = 0, ecarts = [];

    function question() {
      var q = etape.questions[n];
      vider();
      ecrire([
        { t: "Devine ce que pense l'autre · " + (n + 1) + "/" + etape.questions.length, style: "rubrique" },
        { t: q.q, style: "fort" }
      ], function () {
        var boite = document.createElement("div");
        boite.className = "curseur";
        var valeur = document.createElement("output");
        valeur.textContent = "50 %";
        var range = document.createElement("input");
        range.type = "range"; range.min = 0; range.max = 100; range.step = 1; range.value = 50;
        range.setAttribute("aria-label", "Ta réponse, en pourcentage");
        range.addEventListener("input", function () { valeur.textContent = range.value + " %"; });
        ["click", "pointerdown", "touchstart"].forEach(function (ev) {
          range.addEventListener(ev, function (e) { e.stopPropagation(); });
        });
        boite.appendChild(valeur);
        boite.appendChild(range);
        el.choix.appendChild(boite);
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = "Valider";
        b.addEventListener("click", function (e) {
          e.stopPropagation();
          reponse(q, parseInt(range.value, 10));
        });
        el.choix.appendChild(b);
      });
    }

    function reponse(q, pari) {
      var ecart = Math.abs(pari - q.vrai);
      ecarts.push(ecart);
      vider();
      ecrire([
        { t: "Devine ce que pense l'autre · " + (n + 1) + "/" + etape.questions.length, style: "rubrique" },
        { t: "Ta réponse : " + pari + " %" },
        { t: "La réalité : " + q.vrai + " %", style: "fort" },
        { t: ecart <= 3 ? "Dans le mille." : "Écart : " + ecart + " points.", style: "pense" }
      ], function () {
        var barres = document.createElement("div");
        barres.className = "barres";
        [["Toi", pari, "toi"], ["Réalité", q.vrai, "vrai"]].forEach(function (x) {
          var ligne = document.createElement("div");
          ligne.className = "barre " + x[2];
          var nom = document.createElement("span"); nom.textContent = x[0];
          var fond = document.createElement("i");
          var plein = document.createElement("b"); plein.style.width = x[1] + "%";
          fond.appendChild(plein);
          ligne.appendChild(nom); ligne.appendChild(fond);
          barres.appendChild(ligne);
        });
        el.texte.appendChild(barres);
        var src = document.createElement("p");
        src.className = "note";
        src.textContent = "Source : " + q.source + " Chiffre pour " + etape.groupe + ".";
        el.texte.appendChild(src);
        el.suite.classList.remove("cache");
        attente = function () {
          attente = null;
          n++;
          if (n < etape.questions.length) question();
          else bilan();
        };
      });
    }

    function bilan() {
      var moyen = Math.round(ecarts.reduce(function (a, b) { return a + b; }, 0) / ecarts.length);
      etat.ecart_quiz = moyen;
      page([
        { t: "Devine ce que pense l'autre", style: "rubrique" },
        { t: "En moyenne, ton écart est de " + moyen + " points.", style: "fort" },
        { t: moyen <= 10 ? "Tu connais bien l'autre rive." : "Sur ces questions, l'autre rive n'est pas tout à fait celle que tu imaginais.", style: "pense" }
      ], avancer);
    }

    question();
  }

  /* ---------------- Sauvegarde en cours de partie ---------------- */

  // On garde l'étape où l'on est et l'état du personnage.
  // Si l'onglet se ferme, la partie reprend au début de cette étape.
  var CLE_PARTIE = "lautre-rive-partie";

  function sauver() {
    var etape = H.etapes[index];
    if (etape.type === "rencontre" || etape.type === "generique" || etape.type === "fin") { effacerPartie(); return; }
    try {
      window.localStorage.setItem(CLE_PARTIE, JSON.stringify({ parcours: H.id, index: index, etat: etat }));
    } catch (e) { /* navigation privée */ }
  }

  function lirePartie() {
    try {
      var s = JSON.parse(window.localStorage.getItem(CLE_PARTIE));
      if (s && P[s.parcours] && P[s.parcours].etapes[s.index] && s.etat) return s;
    } catch (e) { /* rien */ }
    return null;
  }

  function effacerPartie() {
    try { window.localStorage.removeItem(CLE_PARTIE); } catch (e) { /* rien */ }
  }

  function reprendre(s) {
    H = P[s.parcours];
    document.body.className = H.rive === "gauche" ? "sebastien" : "lea";
    etat = s.etat;
    file = [];
    // Retrouver le décor de la scène en cours
    decor = "pont";
    for (var k = s.index; k >= 0; k--) {
      var e = H.etapes[k];
      if (e.type === "decor" && visible(e)) { decor = e.decor; break; }
    }
    M.jouer(decor);
    el.jeu.classList.remove("accueil");
    el.hud.classList.remove("cache");
    afficherBandeau();
    index = s.index - 1;
    avancer();
  }

  /* ---------------- La carte à partager ---------------- */

  var ADRESSE = "matteoconry.github.io/lautre-rive";

  // Une image carrée en pixel art : le pont, le personnage joué, l'écart au quiz
  function dessinerCarte(complet) {
    var C = 1080, x0 = 60, y0 = 60, z = 6;
    var carte = document.createElement("canvas");
    carte.width = C; carte.height = C;
    var c = carte.getContext("2d");
    var couleur = H.id === "lea" ? "#e07a3c" : "#8a6aff";

    c.fillStyle = "#1a1220"; c.fillRect(0, 0, C, C);

    // La scène, dessinée en petit puis agrandie sans flou
    var petit = document.createElement("canvas");
    petit.width = D.largeur; petit.height = D.hauteur;
    D.pont_rencontre(petit.getContext("2d"), 2, { parcours: H.id, rencontre_complete: complet });
    c.imageSmoothingEnabled = false;
    c.drawImage(petit, x0, y0, D.largeur * z, D.hauteur * z);
    c.fillStyle = couleur;
    c.fillRect(x0, y0 + D.hauteur * z, D.largeur * z, 6);

    c.textBaseline = "alphabetic";
    function texte(t, x, y, taille, gras, teinte, align) {
      c.font = (gras ? "bold " : "") + taille + "px 'Courier New', monospace";
      c.fillStyle = teinte;
      c.textAlign = align || "left";
      c.fillText(t, x, y);
    }
    texte("L'AUTRE RIVE", x0, 680, 56, true, "#f4e9d8");
    texte(complet ? "Six jours de chaque côté du pont." : "Six jours dans la peau de " + H.prenom + ".", x0, 745, 34, false, couleur);
    if (etat.ecart_quiz !== undefined) {
      texte("Devine ce que pense l'autre :", x0, 830, 32, false, "#8a7f86");
      texte(etat.ecart_quiz + " points d'écart en moyenne.", x0, 885, 42, true, "#f4e9d8");
    }
    texte("Et toi ?", x0, 990, 40, true, couleur);
    texte(ADRESSE, C - x0, 990, 24, false, "#8a7f86", "right");
    return carte;
  }

  function texteCarte() {
    var t = "J'ai passé six jours dans la peau de " + H.prenom + ".";
    if (etat.ecart_quiz !== undefined) t += " Au quiz « Devine ce que pense l'autre », mon écart : " + etat.ecart_quiz + " points.";
    return t + " Et toi ? https://" + ADRESSE + "/";
  }

  function partagerCarte(carte) {
    carte.toBlob(function (blob) {
      if (!blob) return;
      var fichier = null;
      try { fichier = new File([blob], "lautre-rive.png", { type: "image/png" }); } catch (e) { /* vieux navigateur */ }
      if (fichier && navigator.canShare && navigator.canShare({ files: [fichier] })) {
        navigator.share({ files: [fichier], title: "L'Autre Rive", text: texteCarte() }).catch(function () { /* annulé */ });
        return;
      }
      // Sinon : on télécharge l'image
      var lien = document.createElement("a");
      lien.href = URL.createObjectURL(blob);
      lien.download = "lautre-rive.png";
      document.body.appendChild(lien);
      lien.click();
      setTimeout(function () { URL.revokeObjectURL(lien.href); lien.remove(); }, 1000);
    }, "image/png");
  }

  /* ---------------- La rencontre sur le pont ---------------- */

  var CLE_PARCOURS = "lautre-rive-parcours";

  function lireJoues() {
    try { return JSON.parse(window.localStorage.getItem(CLE_PARCOURS)) || {}; } catch (e) { return {}; }
  }

  function enregistrerParcours() {
    var j = lireJoues();
    j[H.id] = etat.drapeaux;
    try { window.localStorage.setItem(CLE_PARCOURS, JSON.stringify(j)); } catch (e) { /* navigation privée */ }
    return j;
  }

  // « a_parle_au_bar » ou « !a_parle_au_bar », lu dans un parcours déjà joué
  function condition(drapeaux, cle) {
    if (!cle) return true;
    if (cle.charAt(0) === "!") return !(drapeaux && drapeaux[cle.slice(1)]);
    return !!(drapeaux && drapeaux[cle]);
  }

  function brouiller(texte) {
    var signes = "▒▓░";
    return texte.replace(/\S/g, function () { return signes.charAt(Math.floor(Math.random() * 3)); });
  }

  function jouerRencontre() {
    var joues = enregistrerParcours();
    var complet = !!(joues.sebastien && joues.lea);
    var R = window.Rencontre;
    etat.rencontre_complete = complet;
    decor = "pont_rencontre";
    M.jouer("pont");

    var autre = H.id === "sebastien" ? P.lea : P.sebastien;
    var pages;
    if (complet) {
      pages = R.pages.map(function (lignes) {
        return { lignes: lignes.filter(function (l) {
          return condition(joues.sebastien, l.siSeb) && condition(joues.lea, l.siLea);
        }) };
      });
    } else {
      pages = R.pages.slice(0, R.pages_floues).map(function (lignes) {
        return { lignes: lignes.map(function (l) {
          if (l.de !== autre.prenom) return l;
          return { style: l.style, de: l.de, t: brouiller(l.t), flou: true };
        }) };
      });
      pages.push({ lignes: [
        { t: "La suite de la rencontre est floue.", style: "pense" },
        { t: "Joue le parcours de " + autre.prenom + " pour entendre ce qu'" + (autre.id === "lea" ? "elle" : "il") + " répond.", style: "note" }
      ] });
    }
    file = pages.filter(function (p) { return p.lignes.length; });
    avancer();
  }

  /* ---------------- Le générique ---------------- */

  // Le lien « Soutenir le projet », discret, seulement si une adresse est renseignée
  function jouerGenerique() {
    var G = window.Generique;
    if (!G) { avancer(); return; }
    vider();
    M.jouer("generique"); // une musique à part pour le générique
    var cadre = document.createElement("div");
    cadre.className = "generique";
    var rouleau = document.createElement("div");
    rouleau.className = "rouleau";

    var titre = document.createElement("h2");
    titre.textContent = "L'Autre Rive";
    rouleau.appendChild(titre);
    G.blocs.forEach(function (b) {
      var bloc = document.createElement("div");
      bloc.className = "bloc";
      if (b.role) {
        var role = document.createElement("span");
        role.className = b.phrase ? "role phrase" : "role";
        role.textContent = b.role;
        bloc.appendChild(role);
      }
      b.noms.forEach(function (n) {
        var nom = document.createElement("span");
        nom.className = b.style || (b.role ? "nom" : "mention");
        nom.textContent = n;
        bloc.appendChild(nom);
      });
      rouleau.appendChild(bloc);
    });
    // Le mot de la fin défile avec le reste et s'arrête au milieu du cadre
    if (G.merci) {
      var merci = document.createElement("p");
      merci.className = "merci";
      merci.textContent = G.merci;
      rouleau.appendChild(merci);
    }
    cadre.appendChild(rouleau);
    el.texte.appendChild(cadre);
    el.suite.classList.remove("cache");

    var arrive = false, fini = false;
    function finDefile() {
      if (arrive) return;
      arrive = true;
      rouleau.style.animationDelay = "-60s"; // toucher l'écran saute à la fin du défilé
      attente = suite;
    }
    function suite() {
      if (fini) return;
      fini = true;
      attente = null;
      avancer();
    }
    rouleau.addEventListener("animationend", finDefile);
    attente = finDefile;
  }

  function jouerFin() {
    vider();

    var titre = document.createElement("p");
    titre.className = "fort";
    titre.textContent = "Fin de la semaine de " + H.prenom + ".";
    el.texte.appendChild(titre);

    var dl = document.createElement("dl");
    dl.className = "recap";
    function ligne(nom, valeur) {
      var dt = document.createElement("dt"); dt.textContent = nom;
      var dd = document.createElement("dd"); dd.textContent = valeur;
      dl.appendChild(dt); dl.appendChild(dd);
    }
    function ecart(cle, unite) {
      var d = etat[cle] - H.depart[cle];
      return etat[cle] + unite + (d ? " (" + (d > 0 ? "+" : "") + d + ")" : "");
    }
    ligne("Fin de mois", ecart("fin_de_mois", " €"));
    ligne("Énergie", ecart("energie", " / 10"));
    ligne("Liens", ecart("liens", " / 10"));
    (H.recap || []).forEach(function (r) { ligne(r.nom, etat.drapeaux[r.si] ? r.oui : r.non); });
    etat.paris.forEach(function (p) { ligne("Pari n°" + p.numero, p.pari); });
    ligne("Le badge", H.badge);
    if (etat.vote) ligne("Ton enveloppe", etat.vote);
    if (etat.ecart_quiz !== undefined) ligne("Écart au quiz", etat.ecart_quiz + " points en moyenne");
    el.texte.appendChild(dl);

    var lecon = document.createElement("p");
    lecon.className = "pense";
    lecon.textContent = "Quoi que tu aies choisi, la semaine a tout pris. Tu n'as pas mal joué. Sur les deux rives, des millions de gens vivent ça tous les mois.";
    el.texte.appendChild(lecon);

    var note = document.createElement("p");
    note.className = "note";
    var autre = H.rive === "gauche" ? P.lea : P.sebastien;
    note.textContent = "Rejoue la semaine : d'autres choix ouvrent d'autres scènes. Ou passe de l'autre côté du pont, avec " + autre.prenom + ".";
    el.texte.appendChild(note);

    var carte = dessinerCarte(!!etat.rencontre_complete);
    var apercu = document.createElement("img");
    apercu.className = "carte";
    apercu.alt = "Ta carte à partager : " + texteCarte();
    apercu.src = carte.toDataURL("image/png");
    el.texte.appendChild(apercu);

    boutons([
      { texte: "Partager ma carte", classe: H.rive },
      { texte: "Rejouer la semaine" },
      { texte: "Passer de l'autre côté : " + autre.prenom, classe: autre.rive },
      { texte: "Revenir au pont" }
    ], function (opt, n) {
      if (n === 0) partagerCarte(carte);
      else if (n === 1) commencer(H.rive === "gauche" ? "sebastien" : "lea");
      else if (n === 2) presenter(autre === P.lea ? "lea" : "sebastien");
      else accueil();
    });
  }

  /* ---------------- Écran d'accueil : le pont ---------------- */

  var premiereFois = true;

  // Avant de traverser : qui attend de l'autre côté du pont
  function presenter(nom) {
    var q = P[nom];
    var retour = !el.jeu.classList.contains("accueil"); // après une première semaine
    if (retour) {
      // Depuis la fin d'une semaine : on revient d'abord sur le pont
      decor = "pont";
      M.jouer("pont");
      etat = nouvelEtat();
      el.jeu.classList.add("accueil");
      document.body.className = "";
      el.hud.classList.add("cache");
      el.titre.classList.remove("visible");
    }
    vider();
    ecrire(retour ? [
      { t: "Cette fois, tu retraverses le pont.", style: "fort" },
      { t: "Sur ta rive t'attend " + q.presentation + "." },
      { t: "Pendant six jours, tu vas vivre la vie de quelqu'un qui vote plutôt comme toi. Ses choix seront les tiens. Il n'y a pas de bonne ou de mauvaise réponse." }
    ] : [
      { t: "Alors tu vas passer de l'autre côté.", style: "fort" },
      { t: "De l'autre côté t'attend " + q.presentation + "." },
      { t: "Pendant six jours, tu vas vivre la vie de quelqu'un qui ne vote pas comme toi. Ses choix seront les tiens. Il n'y a pas de bonne ou de mauvaise réponse." }
    ], function () {
      boutons([{ texte: "Traverser le pont", classe: q.rive === "gauche" ? "droite" : "gauche" }, { texte: "Revenir au pont" }], function (o, k) {
        if (k === 0) commencer(nom); else accueil();
      });
    });
  }

  function accueil() {
    vider();
    decor = "pont";
    M.jouer("pont");
    etat = nouvelEtat();
    el.jeu.classList.add("accueil");
    document.body.className = "";
    el.hud.classList.add("cache");
    el.titre.classList.remove("visible");

    var h1 = document.createElement("h1");
    h1.textContent = "L'Autre Rive";
    el.texte.appendChild(h1);

    // Premier écran : les navigateurs refusent le son avant un geste du joueur.
    // Ce toucher lance la musique, puis le menu apparaît.
    if (premiereFois) {
      premiereFois = false;
      var invite = document.createElement("p");
      invite.className = "invite";
      // Avec une souris, on clique ; sur téléphone, on touche l'écran
      var souris = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      invite.textContent = souris ? "Clique pour entrer" : "Touche l'écran pour entrer";
      el.texte.appendChild(invite);
      attente = function () { attente = null; accueil(); };
      return;
    }
    var sauve = lirePartie();
    ecrire([
      { t: "Un pont. Deux rives. Six jours avant le vote.", style: "pense" },
      { t: "De quel côté du pont viens-tu ?", style: "recit" },
      { t: "Politiquement, tu te sens plutôt de gauche ou de droite ?", style: "note" }
    ], function () {
      var options = [
        { texte: "← Rive gauche", classe: "gauche" },
        { texte: "Rive droite →", classe: "droite" }
      ];
      boutons(options, function (opt, n) {
        presenter(n === 0 ? "sebastien" : "lea");
      });
      // Une semaine en cours : une petite ligne discrète au-dessus des rives
      if (sauve) {
        var q0 = P[sauve.parcours], j = sauve.etat.jour;
        var reprise = document.createElement("button");
        reprise.type = "button";
        reprise.className = "reprise";
        reprise.textContent = "↻ Reprendre la semaine de " + q0.prenom + " (" + (j > 0 ? "J-" + j : "jour du vote") + ")";
        reprise.addEventListener("click", function (e) { e.stopPropagation(); reprendre(sauve); });
        el.choix.insertBefore(reprise, el.choix.firstChild);
      }
      // Sous les rives, le lien pour soutenir le projet
      var D = window.Generique && window.Generique.don;
      if (D && D.lien) {
        var soutien = document.createElement("p");
        soutien.className = "don-accueil";
        soutien.appendChild(document.createTextNode("Gratuit et sans publicité · "));
        var a = document.createElement("a");
        a.href = D.lien; a.target = "_blank"; a.rel = "noopener";
        a.textContent = "soutenir le projet";
        a.addEventListener("click", function (e) { e.stopPropagation(); });
        soutien.appendChild(a);
        el.choix.appendChild(soutien);
      }
    });
  }

  function commencer(nom) {
    if (nom && P[nom]) H = P[nom];
    effacerPartie();
    document.body.className = H.rive === "gauche" ? "sebastien" : "lea";
    etat = nouvelEtat();
    index = -1;
    file = [];
    el.jeu.classList.remove("accueil");
    el.hud.classList.remove("cache");
    afficherBandeau();
    avancer();
  }

  /* ---------------- Contrôles ---------------- */

  // Le son démarre au premier geste du joueur (les navigateurs l'exigent)
  // Sur téléphone, seuls « touchend », « pointerup » et « click » comptent comme un geste.
  ["pointerdown", "pointerup", "click", "keydown", "touchend"].forEach(function (type) {
    document.addEventListener(type, function (ev) {
      if (ev.target === el.son) return;
      M.debloquer();
    }, true);
  });

  function afficherSon() {
    var coupe = M.estCoupe();
    el.son.textContent = coupe ? "♪ Muet" : "♪ Son";
    el.son.title = coupe ? "Remettre le son" : "Couper le son";
    el.son.setAttribute("aria-pressed", coupe ? "true" : "false");
    el.son.classList.toggle("coupe", coupe);
  }
  el.son.addEventListener("click", function (ev) {
    ev.stopPropagation();
    M.basculer();
    M.debloquer();
    afficherSon();
  });
  afficherSon();

  el.boite.addEventListener("click", toucher);
  el.canvas.parentNode.addEventListener("click", toucher);
  el.suite.addEventListener("click", function (ev) { ev.stopPropagation(); toucher(); });
  document.addEventListener("keydown", function (ev) {
    if (ev.target && ev.target.tagName === "BUTTON" && (ev.key === "Enter" || ev.key === " ")) return;
    if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); toucher(); return; }
    var n = parseInt(ev.key, 10);
    if (n >= 1) {
      var b = el.choix.querySelectorAll("button")[n - 1];
      if (b && !b.disabled) b.click();
    }
  });

  etat = nouvelEtat();
  accueil();
  window.requestAnimationFrame(boucle);
  // On tente de lancer la musique dès l'arrivée : certains navigateurs l'autorisent,
  // les autres la démarrent au premier toucher, n'importe où sur la page.
  M.debloquer();
})();
