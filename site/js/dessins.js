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

  /* ---------- J-5 : la pause de 10 h sur le quai (de jour) ---------- */
  function pause(ctx, t, etat) {
    bandes(ctx, 0, ["#9ab0c8", "#a8bccf", "#b8c8d6", "#c8d4de"], 6);
    r(ctx, 0, 24, L, 66, "#4a4648");
    // L'entrepôt, de près
    r(ctx, 0, 6, 160, 50, "#7a7a82");
    for (var x = 0; x < 160; x += 4) r(ctx, x, 6, 1, 50, "#6a6a72");
    r(ctx, 0, 6, 160, 2, "#5a5a62");
    r(ctx, 92, 18, 46, 38, "#2a2a30");               // porte de quai ouverte
    r(ctx, 92, 18, 46, 3, "#e0a020");
    for (var p = 0; p < 3; p++) r(ctx, 98 + p * 12, 34, 9, 22, "#8a6a40"); // colis
    r(ctx, 0, 56, L, 4, "#3a3638");                  // bord du quai
    r(ctx, 0, 60, L, 30, "#5a5658");
    // Palette et Sébastien assis dessus
    r(ctx, 26, 62, 30, 3, "#a07a4a"); r(ctx, 26, 65, 30, 2, "#7a5a34"); r(ctx, 28, 67, 4, 3, "#7a5a34"); r(ctx, 50, 67, 4, 3, "#7a5a34");
    r(ctx, 34, 44, 12, 18, "#e07a3c");               // gilet orange
    r(ctx, 35, 46, 10, 2, "#f0d040");                // bande réfléchissante
    r(ctx, 36, 35, 8, 9, "#c89070");                 // visage
    r(ctx, 35, 33, 10, 3, "#3a2a20");                // cheveux
    r(ctx, 33, 62, 6, 6, "#2a3448"); r(ctx, 41, 62, 6, 6, "#2a3448"); // jambes
    r(ctx, 39, 50, 6, 4, "#c89070");                 // mains
    var lueur = Math.floor(t * 2) % 2 ? "#a0d8ff" : "#7ac0ff";
    r(ctx, 40, 48, 4, 5, "#111"); r(ctx, 41, 49, 2, 3, lueur); // le téléphone, l'appli de la banque
    // Chariot garé
    r(ctx, 128, 58, 16, 14, "#e0a020"); r(ctx, 126, 46, 2, 26, "#333");
    r(ctx, 130, 72, 4, 4, "#111"); r(ctx, 140, 72, 4, 4, "#111");
    if (etat && etat.drapeaux.samedi_au_boulot && etat.jour === 1) {
      r(ctx, 40, 48, 4, 5, "#111"); r(ctx, 41, 49, 2, 3, "#7fe0a0"); // la vidéo WhatsApp
    }
  }

  /* ---------- J-4 : la grand-rue de Vresnes au crépuscule ---------- */
  function rue(ctx, t) {
    bandes(ctx, 0, ["#2a2040", "#3e2a4a", "#5a3450", "#7a4450", "#a05a4a"], 6);
    r(ctx, 0, 30, L, 60, "#2a2228");
    // Façades
    var facades = [[0, 14, 40, "#5c3a30"], [40, 10, 44, "#4e4a52"], [84, 16, 38, "#5a4436"], [122, 12, 38, "#4a3a3a"]];
    facades.forEach(function (f) {
      r(ctx, f[0], f[1], f[2], 64 - f[1], f[3]);
      r(ctx, f[0], f[1], f[2], 2, "#2a1e22");
      r(ctx, f[0] + 4, f[1] + 6, 6, 8, "#1a1418"); r(ctx, f[0] + f[2] - 10, f[1] + 6, 6, 8, "#1a1418");
    });
    // La pharmacie, rideau baissé, croix éteinte
    r(ctx, 44, 40, 36, 24, "#6a6a70");
    for (var y = 41; y < 64; y += 2) r(ctx, 44, y, 36, 1, "#5a5a60");
    r(ctx, 58, 28, 8, 8, "#2a3a2e"); r(ctx, 61, 29, 2, 6, "#3a5a40"); r(ctx, 59, 31, 6, 2, "#3a5a40");
    // La poste, avec l'affiche
    r(ctx, 90, 40, 26, 24, "#2a2430");
    r(ctx, 94, 44, 10, 13, "#f0e8d0");
    r(ctx, 95, 46, 8, 1, "#555"); r(ctx, 95, 48, 7, 1, "#555"); r(ctx, 95, 50, 8, 1, "#555"); r(ctx, 95, 53, 5, 1, "#555");
    r(ctx, 106, 40, 8, 4, "#d8b040");
    // Une seule fenêtre allumée, en haut à droite
    r(ctx, 150, 20, 6, 8, Math.sin(t * 0.7) > -0.8 ? "#ffc060" : "#a07030");
    // Trottoir, route, lampadaire
    r(ctx, 0, 64, L, 3, "#4a4044"); r(ctx, 0, 67, L, 23, "#1e1a20");
    for (var d = 4; d < L; d += 20) r(ctx, d, 78, 10, 1, "#5a5458");
    r(ctx, 30, 30, 1, 34, "#151015"); r(ctx, 28, 29, 5, 2, "#151015");
    ctx.globalAlpha = 0.18; r(ctx, 22, 31, 18, 33, "#ffc060"); ctx.globalAlpha = 1;
    r(ctx, 29, 31, 3, 1, "#ffe3a0");
  }

  /* ---------- J-3 : l'accident, la nuit, sous la pluie ---------- */
  function accident(ctx, t) {
    r(ctx, 0, 0, L, H, "#07070e");
    r(ctx, 0, 40, L, 50, "#121218");
    // Gyrophares qui éclairent tout
    var phase = Math.floor(t * 4) % 2;
    ctx.globalAlpha = 0.16;
    r(ctx, 0, 0, 80, 90, phase ? "#ff2020" : "#2040ff");
    r(ctx, 80, 0, 80, 90, phase ? "#2040ff" : "#ff2020");
    ctx.globalAlpha = 1;
    // Route mouillée
    ctx.fillStyle = "#1c1c26";
    ctx.beginPath(); ctx.moveTo(60, 40); ctx.lineTo(100, 40); ctx.lineTo(160, 90); ctx.lineTo(0, 90); ctx.closePath(); ctx.fill();
    // Camion de pompiers
    r(ctx, 92, 40, 50, 22, "#b02020"); r(ctx, 132, 34, 14, 28, "#c02828");
    r(ctx, 134, 37, 9, 8, "#2a3a4a");
    r(ctx, 96, 44, 32, 2, "#e8e8e8"); r(ctx, 96, 52, 32, 1, "#e8e8e8");
    r(ctx, 98, 62, 8, 6, "#111"); r(ctx, 128, 62, 8, 6, "#111");
    r(ctx, 134, 32, 4, 2, phase ? "#ff4040" : "#601010"); r(ctx, 140, 32, 4, 2, phase ? "#4060ff" : "#101860");
    // Camionnette et scooter couché
    r(ctx, 18, 46, 34, 18, "#d8d8d0"); r(ctx, 44, 42, 12, 22, "#c8c8c0"); r(ctx, 46, 45, 8, 6, "#2a3a4a");
    r(ctx, 22, 64, 7, 5, "#111"); r(ctx, 44, 64, 7, 5, "#111");
    r(ctx, 58, 64, 14, 4, "#2a7a40"); r(ctx, 56, 67, 4, 4, "#111"); r(ctx, 70, 67, 4, 4, "#111");
    // Un pompier penché, avec sa lampe
    r(ctx, 74, 52, 7, 12, "#2a2a30"); r(ctx, 75, 47, 5, 5, "#e8d040"); r(ctx, 81, 56, 3, 2, "#ffe3a0");
    // Pluie
    var h = hasard(3);
    for (var i = 0; i < 70; i++) {
      var px = Math.floor(h() * L), vitesse = 60 + h() * 40;
      var py = (h() * 90 + t * vitesse) % 90;
      r(ctx, px, py, 1, 3, "rgba(170,180,220,0.45)");
    }
  }

  /* ---------- J-3 : la fonderie éteinte ---------- */
  function fonderie(ctx, t) {
    bandes(ctx, 0, ["#3a4458", "#4a5468", "#5a6478", "#6a7488"], 8);
    r(ctx, 0, 32, L, 58, "#2a2a30");
    r(ctx, 20, 20, 110, 44, "#3a3a42");             // la halle
    ctx.fillStyle = "#3a3a42";
    for (var k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(20 + k * 22, 20); ctx.lineTo(42 + k * 22, 20); ctx.lineTo(42 + k * 22, 12); ctx.closePath(); ctx.fill(); }
    for (var w = 0; w < 9; w++) r(ctx, 26 + w * 11, 32, 6, 9, (w * 5) % 3 === 0 ? "#15151a" : "#22232a"); // vitres cassées
    r(ctx, 136, 2, 7, 62, "#34343c");               // la cheminée
    r(ctx, 135, 2, 9, 2, "#2a2a32");
    r(ctx, 60, 50, 22, 14, "#1a1a20");              // le portail
    for (var b = 60; b < 82; b += 3) r(ctx, b, 50, 1, 14, "#4a4a52");
    r(ctx, 0, 64, L, 26, "#1e1e22");
    r(ctx, 0, 64, L, 1, "#3a3a40");
    // Un oiseau, de temps en temps
    var ox = (t * 10) % 220 - 30;
    r(ctx, ox, 10 + Math.sin(t) * 2, 2, 1, "#1a1a20"); r(ctx, ox + 3, 10 + Math.sin(t) * 2, 2, 1, "#1a1a20");
  }

  /* ---------- J-2 : le repas, la télé allumée sans le son ---------- */
  function repas(ctx, t) {
    r(ctx, 0, 0, L, H, "#3a2a24");
    r(ctx, 0, 62, L, 28, "#4a362c");
    // Suspension au-dessus de la table
    r(ctx, 79, 0, 1, 14, "#1e1614"); r(ctx, 72, 14, 16, 4, "#c06a30");
    ctx.globalAlpha = 0.14; ctx.fillStyle = "#ffd08a";
    ctx.beginPath(); ctx.moveTo(72, 18); ctx.lineTo(88, 18); ctx.lineTo(118, 66); ctx.lineTo(42, 66); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
    // La télé, image qui change sans le son
    r(ctx, 120, 22, 34, 24, "#111");
    var teintes = ["#3a5a8a", "#8a3a3a", "#3a6a4a", "#6a5a8a"];
    r(ctx, 122, 24, 30, 20, teintes[Math.floor(t / 1.6) % 4]);
    r(ctx, 126, 30, 8, 12, "#c8a888"); r(ctx, 140, 30, 8, 12, "#c8a888"); // deux débatteurs
    r(ctx, 122, 40, 30, 4, "#e8e8e8");
    r(ctx, 132, 46, 10, 4, "#2a1e1a");
    // La table, deux assiettes, le pain
    r(ctx, 40, 56, 80, 4, "#7a5038"); r(ctx, 44, 60, 3, 22, "#5a3a28"); r(ctx, 113, 60, 3, 22, "#5a3a28");
    r(ctx, 54, 54, 12, 2, "#e8e0d0"); r(ctx, 94, 54, 12, 2, "#e8e0d0"); r(ctx, 74, 53, 12, 3, "#c89050");
    // Sébastien à gauche, Manon à droite
    r(ctx, 34, 36, 12, 20, "#5a4a3a"); r(ctx, 36, 26, 8, 10, "#c89070"); r(ctx, 35, 24, 10, 3, "#3a2a20");
    r(ctx, 112, 38, 11, 18, "#6a4a8a"); r(ctx, 114, 29, 7, 9, "#d8a080"); r(ctx, 113, 27, 9, 3, "#2a1a14"); r(ctx, 121, 30, 3, 12, "#2a1a14");
  }

  /* ---------- J-1 : le Balto, bar-tabac et relais poste ---------- */
  function balto(ctx, t) {
    r(ctx, 0, 0, L, H, "#3a2e26");
    r(ctx, 0, 0, L, 8, "#2a201a");
    // Étagères à bouteilles
    r(ctx, 10, 14, 90, 2, "#5a4030"); r(ctx, 10, 28, 90, 2, "#5a4030");
    var couleurs = ["#2a6a3a", "#8a6a2a", "#6a2a2a", "#c8c0a0", "#3a4a7a"];
    for (var b = 0; b < 15; b++) {
      r(ctx, 12 + b * 6, 7, 3, 7, couleurs[b % 5]); r(ctx, 13 + b * 6, 5, 1, 2, couleurs[b % 5]);
      r(ctx, 12 + b * 6, 21, 3, 7, couleurs[(b + 2) % 5]);
    }
    // Le losange rouge du tabac, et le panneau « relais »
    ctx.fillStyle = "#c02a20";
    ctx.beginPath(); ctx.moveTo(130, 6); ctx.lineTo(140, 14); ctx.lineTo(130, 22); ctx.lineTo(120, 14); ctx.closePath(); ctx.fill();
    r(ctx, 112, 26, 36, 8, "#d8b040"); r(ctx, 115, 29, 30, 2, "#5a4a20");
    // Écran de jeux qui clignote
    r(ctx, 150, 30, 8, 10, "#111"); r(ctx, 151, 31, 6, 8, Math.floor(t * 3) % 2 ? "#40a0ff" : "#ff40a0");
    // Le comptoir
    r(ctx, 0, 48, L, 6, "#8a5a34"); r(ctx, 0, 54, L, 36, "#5a3a24");
    for (var c = 0; c < L; c += 16) r(ctx, c, 56, 1, 30, "#4a2e1c");
    // Trois clients au comptoir, et Jean-Mi qui parle
    var parle = Math.floor(t * 5) % 2;
    [[30, "#4a5a3a"], [60, "#3a3a5a"], [96, "#6a3a2a"]].forEach(function (cl, k) {
      r(ctx, cl[0], 32, 12, 16, cl[1]); r(ctx, cl[0] + 2, 23, 8, 9, "#c89070"); r(ctx, cl[0] + 1, 21, 10, 3, "#2a2018");
      if (k === 1 && parle) r(ctx, cl[0] + 4, 29, 3, 1, "#5a2a20");
      if (k === 2) r(ctx, cl[0] + 1, 21, 10, 2, "#c0c0c0"); // Jean-Mi, cheveux gris
    });
    r(ctx, 44, 44, 3, 4, "#e8d080"); r(ctx, 76, 44, 3, 4, "#e8d080"); // les verres
    // Sébastien, de dos, au premier plan
    r(ctx, 64, 66, 22, 24, "#e07a3c"); r(ctx, 68, 56, 14, 11, "#3a2a20");
  }

  /* ---------- Dimanche : le parking de la mairie ---------- */
  function mairie(ctx, t) {
    bandes(ctx, 0, ["#8ab0d8", "#9abcde", "#aac8e4", "#bad4ea"], 6);
    r(ctx, 0, 24, L, 66, "#6a6a6a");
    // La mairie
    r(ctx, 30, 14, 100, 46, "#e0d4b8");
    r(ctx, 30, 12, 100, 3, "#8a5a4a");
    ctx.fillStyle = "#8a5a4a"; ctx.beginPath(); ctx.moveTo(66, 12); ctx.lineTo(80, 4); ctx.lineTo(94, 12); ctx.closePath(); ctx.fill();
    r(ctx, 76, 7, 8, 4, "#f4f0e0"); r(ctx, 79, 8, 1, 2, "#333"); // l'horloge
    for (var f = 0; f < 4; f++) { r(ctx, 38 + f * 24, 22, 10, 14, "#5a6a7a"); r(ctx, 38 + f * 24, 22, 10, 1, "#f4f0e0"); }
    r(ctx, 72, 42, 16, 18, "#6a3a2a"); r(ctx, 70, 40, 20, 2, "#c8bca0");
    r(ctx, 74, 36, 12, 3, "#f4f0e0"); r(ctx, 75, 37, 10, 1, "#555"); // « BUREAU DE VOTE »
    // Le drapeau qui bouge
    r(ctx, 80, 2, 1, 2, "#555");
    var vague = Math.floor(t * 3) % 2;
    r(ctx, 81, 1 + vague, 3, 3, "#2a4a9a"); r(ctx, 84, 1, 3, 3, "#f4f4f4"); r(ctx, 87, 1 + vague, 3, 3, "#c02a2a");
    // Parking, la Clio, quelques électeurs
    r(ctx, 0, 60, L, 30, "#4a4a4c");
    for (var p = 6; p < L; p += 22) r(ctx, p, 70, 1, 14, "#d8d8d8");
    r(ctx, 112, 72, 26, 8, "#3a3a44"); r(ctx, 117, 67, 15, 5, "#2e2e38"); r(ctx, 118, 68, 6, 3, "#5a5a6a"); r(ctx, 125, 68, 6, 3, "#5a5a6a");
    r(ctx, 115, 80, 5, 3, "#111"); r(ctx, 131, 80, 5, 3, "#111");
    var marche = (t * 4) % 30;
    r(ctx, 40 + marche, 62, 4, 8, "#5a3a6a"); r(ctx, 41 + marche, 58, 3, 4, "#c89070");
  }

  /* ---------- Dimanche : le badge enfin retourné ---------- */
  function badge(ctx, t) {
    r(ctx, 0, 0, L, H, "#1a1214");
    ctx.globalAlpha = 0.25 + (Math.sin(t * 1.5) + 1) * 0.08; r(ctx, 36, 12, 88, 66, "#ffd27a"); ctx.globalAlpha = 1;
    r(ctx, 76, 0, 8, 14, "#a8442c");                  // le vieux cordon
    r(ctx, 74, 12, 12, 6, "#8a8070");                 // la pince
    r(ctx, 44, 18, 72, 52, "#c8c0b0");                // plastique jauni
    r(ctx, 46, 20, 68, 48, "#ece2c8");
    r(ctx, 46, 20, 68, 8, "#a8442c");                 // bandeau de l'usine
    r(ctx, 50, 23, 40, 2, "#ece2c8");
    r(ctx, 50, 32, 20, 26, "#8a8478");                // la photo
    r(ctx, 54, 36, 12, 12, "#c8a888"); r(ctx, 53, 34, 14, 4, "#5a5048"); r(ctx, 52, 50, 16, 8, "#5a5a62");
    r(ctx, 76, 34, 32, 2, "#3a2e28");                 // ROGER MARCHAL
    r(ctx, 76, 40, 26, 2, "#3a2e28");                 // FONDERIE DE VRESNES
    r(ctx, 76, 46, 14, 2, "#3a2e28");                 // 1971
    r(ctx, 76, 54, 30, 1, "#9a9080"); r(ctx, 76, 58, 22, 1, "#9a9080");
    r(ctx, 102, 60, 8, 6, "#c0b090");                 // le coin usé
  }

  /* ---------- Dimanche : l'isoloir ---------- */
  function isoloir(ctx, t) {
    r(ctx, 0, 0, L, H, "#2a2a34");
    // Le rideau, qui bouge à peine
    for (var x = 0; x < L; x += 8) {
      var ondule = Math.sin(t * 0.8 + x * 0.3) > 0.6 ? 1 : 0;
      r(ctx, x + ondule, 0, 7, 66, (x / 8) % 2 ? "#3a4a6a" : "#34445f");
    }
    r(ctx, 0, 0, L, 3, "#8a8a92");                    // la tringle
    // La tablette
    r(ctx, 20, 64, 120, 4, "#c8b89a"); r(ctx, 20, 68, 120, 22, "#a89878");
    // L'enveloppe et la feuille blanche, sans nom ni logo
    r(ctx, 46, 54, 30, 12, "#d8c8a0"); ctx.fillStyle = "#c8b890";
    ctx.beginPath(); ctx.moveTo(46, 54); ctx.lineTo(61, 61); ctx.lineTo(76, 54); ctx.closePath(); ctx.fill();
    r(ctx, 86, 48, 24, 17, "#f8f8f4"); r(ctx, 87, 49, 22, 15, "#ffffff");
    // Les mains de Sébastien
    r(ctx, 70, 72, 10, 6, "#c89070"); r(ctx, 98, 72, 10, 6, "#c89070");
  }

  window.Dessins = {
    largeur: L,
    hauteur: H,
    pont: pont,
    cuisine: cuisine,
    route: route,
    boite: boite,
    quai: quai,
    pause: pause,
    rue: rue,
    accident: accident,
    fonderie: fonderie,
    repas: repas,
    balto: balto,
    mairie: mairie,
    badge: badge,
    isoloir: isoloir
  };
})();
