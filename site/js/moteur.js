/*
 * Le moteur du jeu : affiche le texte, les choix, les jauges et le décor.
 * Le contenu de l'histoire est dans histoire.js.
 */
(function () {
  "use strict";

  var H = window.Histoire;
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
  }

  function creerLigne(ligne) {
    var noeud, cible;
    if (ligne.style === "sms" || ligne.style === "parole") {
      noeud = document.createElement("div");
      noeud.className = ligne.style;
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
    if (opt.exigeant && etat.energie < H.seuil_energie) return "Trop fatigué pour ça.";
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
    jouer(etape);
  }

  function jouer(etape) {
    switch (etape.type) {
      case "decor": return jouerDecor(etape);
      case "texte": return page(etape.lignes, avancer);
      case "choix": return jouerChoix(etape);
      case "tete": return jouerTete(etape);
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
    p.textContent = "Touche l'écran pour continuer.";
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
          { t: "Sébastien :", style: "fort" },
          { t: "« " + etape.reponse + " »", style: "pense" }
        ];
        lignes.push(etape.source
          ? { t: etape.source, style: "note" }
          : { t: "Prototype : le chiffre de sondage sur son électorat sera ajouté ici, avec sa source.", style: "note" });
        page(lignes, avancer);
      });
    });
  }

  function jouerFin() {
    vider();

    var titre = document.createElement("p");
    titre.className = "fort";
    titre.textContent = "Fin de la semaine de Sébastien.";
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
    ligne("Berlin", etat.drapeaux.berlin ? "payé" : "pas cette fois");
    ligne("La nuit du bip", etat.drapeaux.parti_intervention ? "il est parti" : "il est resté avec Manon");
    ligne("Au Balto", etat.drapeaux.a_parle_au_bar ? "il a répondu" : "il n'a rien dit");
    etat.paris.forEach(function (p) { ligne("Pari n°" + p.numero, p.pari); });
    ligne("Le badge", "Roger Marchal, son père");
    if (etat.vote) ligne("Ton enveloppe", etat.vote);
    el.texte.appendChild(dl);

    var note = document.createElement("p");
    note.className = "note";
    note.textContent = "Rejoue la semaine : d'autres choix ouvrent d'autres scènes. Le parcours de Léa, le quiz et la rencontre sur le pont arrivent bientôt.";
    el.texte.appendChild(note);

    boutons([
      { texte: "Rejouer la semaine" },
      { texte: "Revenir au pont" }
    ], function (opt, n) {
      if (n === 0) commencer();
      else accueil();
    });
  }

  /* ---------------- Écran d'accueil : le pont ---------------- */

  function accueil() {
    vider();
    decor = "pont";
    M.jouer("pont");
    etat = nouvelEtat();
    el.jeu.classList.add("accueil");
    el.hud.classList.add("cache");
    el.titre.classList.remove("visible");

    var h1 = document.createElement("h1");
    h1.textContent = "L'Autre Rive";
    el.texte.appendChild(h1);
    ecrire([
      { t: "Un pont. Deux rives. Six jours avant le vote.", style: "pense" },
      { t: "De quel côté du pont viens-tu ?", style: "recit" }
    ], function () {
      boutons([
        { texte: "Rive gauche", classe: "gauche" },
        { texte: "Rive droite", classe: "droite" }
      ], function (opt, n) {
        if (n === 0) {
          vider();
          ecrire([
            { t: "Alors tu vas passer de l'autre côté.", style: "fort" },
            { t: "Pendant six jours, tu vas vivre la vie de quelqu'un qui ne vote pas comme toi." },
            { t: "Ses choix seront les tiens. Aucun n'est le bon." }
          ], function () {
            boutons([{ texte: "Traverser le pont", classe: "gauche" }], commencer);
          });
        } else {
          vider();
          ecrire([
            { t: "De l'autre côté t'attend Léa, 21 ans, étudiante à Saint-Denis.", style: "fort" },
            { t: "Son parcours n'est pas encore dans ce prototype. Pour l'instant, seule la traversée vers Sébastien est ouverte." }
          ], function () {
            boutons([
              { texte: "Découvrir Sébastien", classe: "gauche" },
              { texte: "Revenir au pont" }
            ], function (o, k) { if (k === 0) commencer(); else accueil(); });
          });
        }
      });
    });
  }

  function commencer() {
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
  ["pointerdown", "keydown", "touchend"].forEach(function (type) {
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
})();
