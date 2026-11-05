/*
 * Les décors en pixel art, dessinés au code sur une toile de 160 × 90 pixels.
 * Chaque décor est une fonction (ctx, t, etat) : t est le temps en secondes
 * (pour les petites animations), etat donne accès aux choix du joueur.
 */
(function () {
  "use strict";

  var L = 160, H = 90;

  function r(ctx, x, y, w, h, c) {
    ctx.fillStyle = c;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  // Bandes horizontales de couleur (ciel en dégradé, façon pixel)
  function bandes(ctx, y0, couleurs, hauteur) {
    for (var i = 0; i < couleurs.length; i++) r(ctx, 0, y0 + i * hauteur, L, hauteur, couleurs[i]);
  }

  // Petit générateur pseudo-aléatoire stable (mêmes étoiles à chaque image)
  function hasard(graine) {
    var s = graine;
    return function () {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  /* ---------- Le pont au coucher du soleil (écran de titre) ---------- */
  function pont(ctx, t) {
    bandes(ctx, 0, ["#2b1838", "#3d1f45", "#5a2a4f", "#7d3550", "#a8442c", "#d0603a", "#e07a3c", "#f0a050"], 6);
    // Soleil posé sur l'horizon
    var cx = 80, cy = 50;
    for (var y = -12; y <= 0; y++) {
      var w = Math.floor(Math.sqrt(144 - y * y));
      r(ctx, cx - w, cy + y, w * 2, 1, y > -4 ? "#ffd27a" : "#ffe3a0");
    }
    // Eau
    bandes(ctx, 50, ["#6a3448", "#5a2c44", "#4a2440", "#3a1d38", "#2e1830"], 8);
    // Reflets qui bougent
    for (var i = 0; i < 9; i++) {
      var ry = 53 + i * 4;
      var dx = Math.sin(t * 1.3 + i) * 3;
      var lw = 18 - i * 1.5;
      r(ctx, cx - lw / 2 + dx, ry, lw, 1, i % 2 ? "#f0a050" : "#ffd27a");
    }

    // Rive gauche : le village (chaud)
    r(ctx, 0, 44, 46, 8, "#3a1f24");
    r(ctx, 4, 36, 10, 8, "#5c2e26"); r(ctx, 3, 34, 12, 2, "#7a3a2a");
    r(ctx, 16, 38, 8, 6, "#5c2e26"); r(ctx, 15, 36, 10, 2, "#7a3a2a");
    r(ctx, 27, 26, 4, 18, "#4a2622"); r(ctx, 28, 22, 2, 4, "#4a2622"); // clocher
    r(ctx, 33, 37, 9, 7, "#5c2e26"); r(ctx, 32, 35, 11, 2, "#7a3a2a");
    r(ctx, 7, 39, 2, 2, "#ffc060"); r(ctx, 19, 40, 2, 2, "#ffc060"); r(ctx, 37, 40, 2, 2, "#ffc060");
    // Cheminée de la fonderie, éteinte
    r(ctx, 40, 18, 4, 26, "#2e1a1e");

    // Rive droite : les immeubles (froid)
    r(ctx, 114, 44, 46, 8, "#1e1a34");
    var imm = [[118, 20, 12], [132, 28, 10], [144, 14, 14]];
    for (var k = 0; k < imm.length; k++) {
      var ix = imm[k][0], iy = imm[k][1], iw = imm[k][2];
      r(ctx, ix, iy, iw, 44 - iy, "#2a2448");
      for (var fy = iy + 2; fy < 42; fy += 4) {
        for (var fx = ix + 2; fx < ix + iw - 1; fx += 3) {
          var allume = ((fx * 7 + fy * 3 + k) % 5) < 2;
          r(ctx, fx, fy, 1, 2, allume ? "#9a8cff" : "#3a3460");
        }
      }
    }

    // Le pont
    r(ctx, 0, 44, L, 3, "#2a1620");
    r(ctx, 0, 47, L, 1, "#1a0e16");
    for (var p = 6; p < L; p += 8) r(ctx, p, 40, 1, 4, "#2a1620"); // barreaux
    r(ctx, 0, 40, L, 1, "#2a1620"); // rambarde
    // Piles et arches
    for (var a = 20; a < L; a += 40) {
      r(ctx, a - 2, 47, 4, 10, "#24131c");
      r(ctx, a - 2, 57, 4, 1, "#3a1d2a");
    }
    // Lampadaires du pont
    [30, 80, 130].forEach(function (lx) {
      r(ctx, lx, 30, 1, 10, "#1a0e16");
      r(ctx, lx - 1, 29, 3, 1, "#1a0e16");
      r(ctx, lx - 1, 30, 3, 1, Math.sin(t * 2 + lx) > -0.9 ? "#ffe3a0" : "#a07a40");
    });
  }

  /* ---------- La cuisine à 5 h 10 ---------- */
  function cuisine(ctx, t) {
    r(ctx, 0, 0, L, H, "#2a1e22");          // mur
    r(ctx, 0, 64, L, 26, "#3a2a24");        // sol
    r(ctx, 0, 63, L, 1, "#4a362c");
    // Carrelage du mur derrière le plan de travail
    for (var x = 0; x < 90; x += 6) for (var y = 38; y < 50; y += 6) r(ctx, x, y, 5, 5, "#33262a");

    // Fenêtre noire, la rue dehors
    r(ctx, 98, 10, 46, 34, "#4a3a34");
    r(ctx, 100, 12, 42, 30, "#07060c");
    // Lampadaire et Clio sous la lumière
    r(ctx, 128, 16, 1, 22, "#1e1a22");
    r(ctx, 126, 15, 5, 2, "#1e1a22");
    var halo = Math.sin(t * 3) > -0.95 ? 1 : 0.4;
    ctx.globalAlpha = 0.25 * halo; r(ctx, 120, 17, 18, 24, "#ffc060"); ctx.globalAlpha = 1;
    r(ctx, 127, 17, 3, 1, halo > 0.5 ? "#ffe3a0" : "#7a6040");
    r(ctx, 108, 34, 22, 5, "#3a3a44");      // carrosserie
    r(ctx, 112, 31, 13, 4, "#2e2e38");      // toit
    r(ctx, 113, 32, 5, 2, "#5a5a6a"); r(ctx, 119, 32, 5, 2, "#5a5a6a");
    r(ctx, 110, 39, 4, 2, "#111"); r(ctx, 123, 39, 4, 2, "#111");
    r(ctx, 120, 12, 2, 30, "#4a3a34"); r(ctx, 100, 26, 42, 2, "#4a3a34"); // croisillon

    // Plan de travail
    r(ctx, 0, 50, 90, 4, "#6a4a36");
    r(ctx, 0, 54, 90, 10, "#4a3428");
    r(ctx, 28, 56, 1, 6, "#2a1e1a"); r(ctx, 58, 56, 1, 6, "#2a1e1a");

    // Cafetière et sa fumée
    r(ctx, 14, 38, 10, 12, "#1e1a1e");
    r(ctx, 15, 44, 8, 5, "#5a2a1a");
    r(ctx, 16, 45, 6, 3, "#3a1a10");
    r(ctx, 24, 40, 1, 4, "#e05030");        // petit voyant
    for (var s = 0; s < 4; s++) {
      var sy = 34 - ((t * 6 + s * 5) % 20);
      var sx = 18 + Math.sin(t * 2 + s) * 2;
      ctx.globalAlpha = Math.max(0, (sy - 14) / 20) * 0.7;
      r(ctx, sx, sy, 2, 2, "#d8d0c8");
    }
    ctx.globalAlpha = 1;

    // Bol, horloge
    r(ctx, 40, 47, 7, 3, "#c8b8a0"); r(ctx, 41, 50, 5, 1, "#a89880");
    r(ctx, 60, 14, 12, 12, "#e8dcc8"); r(ctx, 61, 15, 10, 10, "#f4e9d8");
    r(ctx, 65, 16, 1, 5, "#2a1d1a");        // aiguille des heures vers 5 h
    r(ctx, 66, 20, 3, 1, "#2a1d1a");
    r(ctx, 65, 20, 1, 4, "#2a1d1a");        // minutes vers 10

    // Frigo, avec la carte électorale sous un aimant
    r(ctx, 150, 22, 10, 42, "#d8d0c4");
    r(ctx, 150, 38, 10, 1, "#a8a094");
    r(ctx, 151, 30, 8, 5, "#ffffff");
    r(ctx, 154, 29, 2, 2, "#e07a3c");       // l'aimant
    if (Math.floor(t * 1.2) % 2 === 0) r(ctx, 150, 29, 10, 7, "rgba(255,210,120,0.25)");

    // Table et chaise
    r(ctx, 62, 66, 40, 3, "#5a3e2c");
    r(ctx, 64, 69, 2, 14, "#4a3224"); r(ctx, 98, 69, 2, 14, "#4a3224");
    r(ctx, 108, 60, 2, 22, "#4a3224"); r(ctx, 108, 70, 10, 2, "#4a3224"); r(ctx, 116, 72, 2, 10, "#4a3224");
    // Le téléphone sur la table, qui s'allume
    var vibre = Math.floor(t * 8) % 6 === 0 ? 1 : 0;
    r(ctx, 76 + vibre, 64, 6, 2, "#111");
    r(ctx, 77 + vibre, 64, 4, 1, "#7ac0ff");
  }

  /* ---------- La route, de nuit (dans la Clio) ---------- */
  function route(ctx, t, etat) {
    // Ciel nuit, champs
    bandes(ctx, 0, ["#06050c", "#0a0814", "#100c1c", "#161024"], 6);
    r(ctx, 0, 24, L, 14, "#0c0a10");
    var h = hasard(7);
    for (var i = 0; i < 25; i++) r(ctx, Math.floor(h() * L), Math.floor(h() * 22), 1, 1, h() > 0.7 ? "#c8c0d8" : "#5a5470");
    // Route en perspective
    ctx.fillStyle = "#1a1820";
    ctx.beginPath(); ctx.moveTo(74, 30); ctx.lineTo(86, 30); ctx.lineTo(150, 62); ctx.lineTo(10, 62); ctx.closePath(); ctx.fill();
    // Faisceau des phares
    ctx.globalAlpha = 0.18; ctx.fillStyle = "#ffe8a8";
    ctx.beginPath(); ctx.moveTo(70, 32); ctx.lineTo(90, 32); ctx.lineTo(140, 62); ctx.lineTo(20, 62); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
    // Pointillés qui défilent
    for (var d = 0; d < 6; d++) {
      var p = ((t * 0.9 + d / 6) % 1);
      var y = 30 + p * p * 32;
      var w = 1 + p * 3;
      r(ctx, 80 - w / 2, y, w, 1 + p * 2, "#d8d0a0");
    }
    // Panneau qui passe de temps en temps
    var pp = (t * 0.25) % 1;
    if (pp < 0.7) {
      var px = 92 + pp * pp * 80, py = 28 + pp * pp * 20, ps = 1 + pp * 6;
      r(ctx, px, py, 1, ps * 2, "#555");
      r(ctx, px - ps / 2, py - ps, ps * 1.5, ps, "#e8e8e8");
    }

    // Habitacle : tableau de bord
    r(ctx, 0, 60, L, 30, "#141014");
    r(ctx, 0, 60, L, 2, "#221a20");
    // Montants du pare-brise
    ctx.fillStyle = "#141014";
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(10, 0); ctx.lineTo(0, 60); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(L, 0); ctx.lineTo(L - 10, 0); ctx.lineTo(L, 60); ctx.closePath(); ctx.fill();
    r(ctx, 0, 0, L, 3, "#141014");
    // Volant
    r(ctx, 22, 64, 34, 4, "#2a2226"); r(ctx, 18, 68, 6, 16, "#2a2226"); r(ctx, 54, 68, 6, 16, "#2a2226");
    r(ctx, 36, 68, 6, 10, "#2a2226");
    // Compteur
    r(ctx, 30, 62, 18, 2, "#e07a3c");
    // Voyant du réservoir (allumé, comme dans le script de J-5)
    if (Math.floor(t * 2) % 2 === 0) r(ctx, 50, 62, 2, 2, "#ffb020");
    // Autoradio qui parle
    r(ctx, 88, 66, 30, 10, "#0a080a");
    r(ctx, 90, 68, 26, 6, "#1e3a2a");
    for (var b = 0; b < 8; b++) {
      var hb = 1 + Math.abs(Math.sin(t * 9 + b * 1.7)) * 4;
      r(ctx, 92 + b * 3, 73 - hb, 2, hb, "#7fe0a0");
    }
    // Didier sur le siège passager, s'il est monté
    if (etat && etat.drapeaux.didier_monte) {
      r(ctx, 124, 34, 16, 26, "#2a2228");    // épaules
      r(ctx, 128, 22, 9, 11, "#3a2a26");     // tête
      r(ctx, 127, 21, 11, 3, "#1e1614");     // bonnet
      if (Math.floor(t * 5) % 2 === 0) r(ctx, 129, 30, 3, 1, "#1e1614"); // il parle
    }
    // Rétroviseur
    r(ctx, 70, 3, 20, 5, "#1e181c"); r(ctx, 72, 4, 16, 3, "#2a2430");
  }

  /* ---------- La boîte à gants et le badge retourné ---------- */
  function boite(ctx, t, etat) {
    r(ctx, 0, 0, L, H, "#141014");
    // Le couvercle ouvert
    r(ctx, 20, 8, 120, 10, "#2a2226");
    r(ctx, 22, 16, 116, 2, "#3a3036");
    // L'intérieur éclairé par le plafonnier
    r(ctx, 24, 20, 112, 62, "#1c1618");
    ctx.globalAlpha = 0.12; r(ctx, 24, 20, 112, 30, "#ffe3a0"); ctx.globalAlpha = 1;
    // Papiers : attestation, carnet d'entretien, carte routière
    r(ctx, 30, 44, 46, 30, "#d8cfc0"); r(ctx, 32, 48, 30, 1, "#9a9080"); r(ctx, 32, 52, 36, 1, "#9a9080"); r(ctx, 32, 56, 24, 1, "#9a9080");
    r(ctx, 70, 40, 40, 34, "#3a5a8a"); r(ctx, 72, 42, 36, 30, "#4a6a9a");
    r(ctx, 104, 50, 26, 26, "#e8d8a0"); r(ctx, 106, 56, 22, 1, "#c03030"); r(ctx, 112, 52, 1, 22, "#3060a0");
    // Le badge, posé entre les papiers, face cachée
    var bx = 64, by = 30;
    var lueur = (Math.sin(t * 2.2) + 1) / 2;
    ctx.globalAlpha = 0.18 + lueur * 0.22; r(ctx, bx - 4, by - 4, 32, 26, "#ffd27a"); ctx.globalAlpha = 1;
    r(ctx, bx + 2, by + 2, 24, 18, "#0a0608");  // ombre portée
    r(ctx, bx - 1, by - 1, 26, 20, "#1a1214");  // contour
    r(ctx, bx, by, 24, 18, "#c8c0b0");          // plastique
    r(ctx, bx + 1, by + 1, 22, 16, "#e8e2d4");  // dos blanc, illisible
    r(ctx, bx + 10, by - 3, 4, 4, "#8a8070");   // la pince
    r(ctx, bx + 11, by - 12, 2, 9, "#a8442c");  // le vieux cordon, couleur brique
    r(ctx, bx + 3, by + 12, 18, 1, "#d0c8b8");  // une rayure
    r(ctx, bx + 5, by + 5, 6, 1, "#d8d0c0");
    if (etat && etat.drapeaux.badge_touche) {
      // Un coin a été soulevé : on devine une année, mais rien de lisible
      r(ctx, bx + 18, by + 13, 5, 4, "#b8a888");
    }
  }

  /* ---------- Le quai de chargement à l'aube (annonce de J-5) ---------- */
  function quai(ctx, t) {
    bandes(ctx, 0, ["#2a2238", "#4a3048", "#7a4450", "#b0604a", "#d88850"], 7);
    r(ctx, 0, 35, L, 55, "#3a3434");
    // L'entrepôt
    r(ctx, 0, 20, 110, 50, "#6a6a70");
    for (var x = 0; x < 110; x += 4) r(ctx, x, 20, 1, 50, "#5a5a60");
    for (var q = 0; q < 3; q++) {
      r(ctx, 8 + q * 34, 40, 26, 30, "#2a2a30");
      r(ctx, 8 + q * 34, 40, 26, 2, "#e0a020");
    }
    // Palettes
    r(ctx, 118, 66, 20, 4, "#a07a4a"); r(ctx, 118, 70, 20, 2, "#7a5a34");
    r(ctx, 120, 62, 16, 4, "#a07a4a");
    // Chariot élévateur
    r(ctx, 140, 54, 14, 14, "#e0a020"); r(ctx, 138, 44, 2, 24, "#333");
    r(ctx, 142, 68, 4, 4, "#111"); r(ctx, 150, 68, 4, 4, "#111");
    // Un gyrophare orange qui tourne
    if (Math.floor(t * 3) % 2 === 0) r(ctx, 146, 52, 3, 2, "#ff8030");
    r(ctx, 0, 70, L, 20, "#2e2a2a");
    r(ctx, 0, 70, L, 1, "#4a4444");
  }

  window.Dessins = {
    largeur: L,
    hauteur: H,
    pont: pont,
    cuisine: cuisine,
    route: route,
    boite: boite,
    quai: quai
  };
})();
