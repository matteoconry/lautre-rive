/*
 * La musique et les ambiances sonores, une par décor.
 *
 * Tout est fabriqué en direct par le navigateur (Web Audio) : il n'y a
 * aucun fichier son à télécharger, et toutes les mélodies sont originales.
 *
 * Pour changer l'ambiance d'un décor, modifie l'objet AMBIANCES plus bas :
 *   bpm      : la vitesse (battements par minute)
 *   accords  : les accords, un par mesure (notes en numéros MIDI : 60 = do central)
 *   melodie  : une ligne de 8 cases par mesure (null = silence)
 *   couches  : les bruits de fond continus (moteur, eau, frigo…)
 *   pas()    : ce qui joue à chaque demi-temps
 */
(function () {
  "use strict";

  var ctx = null;          // le contexte audio, créé au premier geste du joueur
  var maitre = null;       // volume général
  var echo = null;         // un écho partagé, pour donner de l'espace
  var bruitBlanc = null, bruitBrun = null;
  var actuelle = null;     // { nom, sortie, arrets[], amb }
  var demandee = "pont";   // l'ambiance voulue, même avant que le son soit débloqué
  var pasCourant = 0, prochain = 0, minuteur = null;
  var coupe = false;
  try { coupe = window.localStorage.getItem("lautre-rive-son") === "off"; } catch (e) { /* navigation privée */ }

  var VOLUME = 0.75;

  /* ---------------- Outils ---------------- */

  function freq(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

  function creerBruits() {
    var n = ctx.sampleRate * 2;
    bruitBlanc = ctx.createBuffer(1, n, ctx.sampleRate);
    bruitBrun = ctx.createBuffer(1, n, ctx.sampleRate);
    var b = bruitBlanc.getChannelData(0), m = bruitBrun.getChannelData(0), dernier = 0;
    for (var i = 0; i < n; i++) {
      b[i] = Math.random() * 2 - 1;
      dernier = (dernier + 0.02 * b[i]) / 1.02;
      m[i] = dernier * 3.5;
    }
  }

  function enveloppe(g, t, attaque, niveau, duree, relache) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(niveau, t + attaque);
    g.gain.setValueAtTime(niveau, t + Math.max(attaque, duree));
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(attaque, duree) + relache);
  }

  /* ---------------- Instruments ---------------- */

  // Note pincée, douce (arpèges)
  function pince(sortie, t, midi, vol, duree) {
    var o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
    o.type = "triangle"; o.frequency.value = freq(midi);
    o2.type = "sine"; o2.frequency.value = freq(midi + 12);
    var g2 = ctx.createGain(); g2.gain.value = 0.3;
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(sortie);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (duree || 1.2));
    o.start(t); o2.start(t); o.stop(t + (duree || 1.2) + 0.05); o2.stop(t + (duree || 1.2) + 0.05);
  }

  // Piano électrique (un peu de modulation qui s'éteint vite)
  function piano(sortie, t, midi, vol) {
    var f = freq(midi);
    var porteuse = ctx.createOscillator(), mod = ctx.createOscillator();
    var gm = ctx.createGain(), g = ctx.createGain();
    porteuse.type = "sine"; porteuse.frequency.value = f;
    mod.type = "sine"; mod.frequency.value = f * 2;
    gm.gain.setValueAtTime(f * 1.2, t);
    gm.gain.exponentialRampToValueAtTime(1, t + 0.8);
    mod.connect(gm); gm.connect(porteuse.frequency);
    porteuse.connect(g); g.connect(sortie);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
    porteuse.start(t); mod.start(t); porteuse.stop(t + 2.5); mod.stop(t + 2.5);
  }

  // Cloche (pour le mystère du badge)
  function cloche(sortie, t, midi, vol) {
    var f = freq(midi), g = ctx.createGain();
    [1, 2.76, 5.4].forEach(function (ratio, k) {
      var o = ctx.createOscillator(), gk = ctx.createGain();
      o.type = "sine"; o.frequency.value = f * ratio;
      gk.gain.value = [1, 0.35, 0.12][k];
      o.connect(gk); gk.connect(g);
      o.start(t); o.stop(t + 4);
    });
    g.connect(sortie);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.8);
  }

  // Nappe tenue (accords)
  function nappe(sortie, t, notes, vol, duree, clarte) {
    var filtre = ctx.createBiquadFilter(), g = ctx.createGain();
    filtre.type = "lowpass"; filtre.frequency.value = clarte || 900; filtre.Q.value = 0.5;
    filtre.connect(g); g.connect(sortie);
    enveloppe(g, t, duree * 0.3, vol, duree * 0.8, duree * 0.5);
    notes.forEach(function (n) {
      [-6, 6].forEach(function (desaccord) {
        var o = ctx.createOscillator();
        o.type = "sawtooth"; o.frequency.value = freq(n); o.detune.value = desaccord;
        o.connect(filtre);
        o.start(t); o.stop(t + duree * 1.4);
      });
    });
  }

  // Basse ronde
  function basse(sortie, t, midi, vol, duree) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "triangle"; o.frequency.value = freq(midi);
    o.connect(g); g.connect(sortie);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    o.start(t); o.stop(t + duree + 0.05);
  }

  // Petit bruit court (tic de l'horloge, charleston de la radio, choc métallique)
  function clic(sortie, t, frequence, vol, duree, type) {
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = bruitBlanc;
    f.type = type || "bandpass"; f.frequency.value = frequence; f.Q.value = 6;
    s.connect(f); f.connect(g); g.connect(sortie);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    s.start(t, Math.random()); s.stop(t + duree + 0.02);
  }

  // Bulle (la cafetière qui glougloute)
  function bulle(sortie, t, vol) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    var f0 = 180 + Math.random() * 220;
    o.type = "sine";
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f0 * 2.2, t + 0.06);
    o.connect(g); g.connect(sortie);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    o.start(t); o.stop(t + 0.1);
  }

  // Battement sourd (cœur)
  function battement(sortie, t, vol) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(70, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    o.connect(g); g.connect(sortie);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    o.start(t); o.stop(t + 0.3);
  }

  /* ---------------- Couches continues ---------------- */

  // Un bruit filtré qui respire lentement (eau, route…)
  function souffle(sortie, buffer, type, frequence, vol, vitesse) {
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    var lfo = ctx.createOscillator(), lfoG = ctx.createGain();
    s.buffer = buffer; s.loop = true;
    f.type = type; f.frequency.value = frequence;
    g.gain.value = vol;
    lfo.frequency.value = vitesse || 0.1; lfoG.gain.value = vol * 0.5;
    lfo.connect(lfoG); lfoG.connect(g.gain);
    s.connect(f); f.connect(g); g.connect(sortie);
    s.start(); lfo.start();
    return function () { s.stop(); lfo.stop(); };
  }

  // Un son grave continu (moteur, frigo, bourdon)
  function bourdon(sortie, frequences, type, vol, coupure, tremolo) {
    var f = ctx.createBiquadFilter(), g = ctx.createGain(), oscs = [];
    f.type = "lowpass"; f.frequency.value = coupure || 400;
    g.gain.value = vol;
    f.connect(g); g.connect(sortie);
    frequences.forEach(function (fr) {
      var o = ctx.createOscillator();
      o.type = type; o.frequency.value = fr;
      o.connect(f); o.start(); oscs.push(o);
    });
    if (tremolo) {
      var lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = tremolo; lg.gain.value = vol * 0.4;
      lfo.connect(lg); lg.connect(g.gain); lfo.start(); oscs.push(lfo);
      // Le moteur varie un peu de régime
      oscs.forEach(function (o, k) { if (k < frequences.length) { var lg2 = ctx.createGain(); lg2.gain.value = 1.5; lfo.connect(lg2); lg2.connect(o.frequency); } });
    }
    return function () { oscs.forEach(function (o) { o.stop(); }); };
  }

  /* ---------------- Les ambiances ---------------- */

  function accordDe(amb, i) {
    var mesure = Math.floor(i / 8) % amb.accords.length;
    return { notes: amb.accords[mesure], mesure: mesure, pas: i % 8 };
  }

  var AMBIANCES = {

    // Le pont au coucher du soleil : doux, un peu nostalgique, plein d'espace
    pont: {
      bpm: 70, echo: 0.45,
      accords: [[50, 54, 57, 61], [47, 50, 54, 57], [43, 50, 54, 59], [45, 49, 52, 57]],
      melodie: [
        [74, null, 73, null, 69, null, null, null],
        [71, null, 69, null, 66, null, null, 69],
        [67, null, 66, null, 62, null, 64, null],
        [64, null, null, 61, null, 64, null, null]
      ],
      couches: function (s) {
        return [souffle(s, bruitBrun, "lowpass", 500, 0.10, 0.08)]; // l'eau sous le pont
      },
      pas: function (s, t, i, d) {
        var a = accordDe(this, i);
        if (a.pas === 0) {
          nappe(s, t, a.notes, 0.028, d * 8, 1100);
          basse(s, t, a.notes[0] - 12, 0.16, d * 6);
        }
        if (a.pas === 4) basse(s, t, a.notes[0] - 12, 0.10, d * 3);
        var arp = [0, 1, 2, 3, 2, 1, 2, 3][a.pas];
        pince(s, t, a.notes[arp] + 12, 0.05, 1.4);
        var m = this.melodie[a.mesure][a.pas];
        if (m && Math.floor(i / 32) % 2 === 1) pince(s, t, m + 12, 0.06, 2.2); // la mélodie revient un tour sur deux
      }
    },

    // La cuisine à 5 h 10 : calme, fatigué, tendre. Horloge et cafetière.
    cuisine: {
      bpm: 58, echo: 0.3,
      accords: [[57, 60, 64], [53, 57, 60], [48, 55, 64], [55, 59, 62]],
      melodie: [
        [69, null, null, 72, null, 71, null, null],
        [69, null, null, 65, null, 67, null, null],
        [64, null, null, 67, null, 72, null, 71],
        [null, null, 71, null, 67, null, null, null]
      ],
      couches: function (s) {
        return [bourdon(s, [50, 100], "sine", 0.012, 300)]; // le frigo qui ronronne
      },
      pas: function (s, t, i, d) {
        var a = accordDe(this, i);
        if (a.pas === 0) nappe(s, t, a.notes, 0.012, d * 8, 600);
        if (i % 2 === 0) clic(s, t, i % 4 === 0 ? 3200 : 2600, 0.05, 0.03); // tic… tac…
        var m = this.melodie[a.mesure][a.pas];
        if (m) piano(s, t, m, 0.09);
        if (a.pas === 0) piano(s, t, a.notes[0] - 12, 0.05);
        if (Math.random() < 0.35) bulle(s, t + Math.random() * d, 0.03); // la cafetière
      }
    },

    // La départementale de nuit : le moteur, la route, et la radio étouffée
    route: {
      bpm: 84, echo: 0.1, radio: true,
      accords: [[52, 55, 59], [48, 52, 55], [43, 47, 50], [50, 54, 57]],
      melodie: [
        [71, null, 71, 69, 67, null, 64, null],
        [67, null, 67, 64, 60, null, null, null],
        [62, null, 67, null, 71, 69, 67, null],
        [66, null, 69, null, 66, null, 62, null]
      ],
      couches: function (s) {
        return [
          bourdon(s, [41, 82.5], "sawtooth", 0.09, 160, 0.3), // le moteur diesel
          souffle(s, bruitBrun, "lowpass", 320, 0.14, 0.05)   // les pneus sur la route
        ];
      },
      pas: function (s, t, i, d) {
        var r = this.sortieRadio;
        var a = accordDe(this, i);
        if (a.pas % 4 === 0) basse(r, t, a.notes[0] - 12, 0.3, d * 1.8);
        if (a.pas % 2 === 1) clic(r, t, 7000, 0.08, 0.04, "highpass");
        if (a.pas % 4 === 2) clic(r, t, 1800, 0.12, 0.09);
        if (a.pas === 0 || a.pas === 3) pince(r, t, a.notes[1], 0.06, 0.5);
        var m = this.melodie[a.mesure][a.pas];
        if (m) pince(r, t, m, 0.09, 0.6);
      }
    },

    // La boîte à gants : le badge. Mystère, retenue, un cœur qui bat.
    boite: {
      bpm: 52, echo: 0.6,
      couches: function (s) {
        return [bourdon(s, [freq(38), freq(45), freq(39) * 2], "sine", 0.05, 500, 0.12)];
      },
      notes: [74, null, null, null, null, 77, null, null, 76, null, null, null, null, 69, null, null],
      pas: function (s, t, i, d) {
        var p = i % 16;
        if (p === 0 || p === 8) { battement(s, t, 0.25); battement(s, t + d * 0.45, 0.15); }
        var n = this.notes[p];
        if (n) cloche(s, t, n, 0.05);
        if (p === 12 && Math.floor(i / 16) % 2) cloche(s, t, 81, 0.025);
      }
    },

    // Le quai à l'aube : la journée est passée, un peu de chaleur, et ça continue
    quai: {
      bpm: 76, echo: 0.35,
      accords: [[53, 57, 60, 65], [48, 55, 60, 64], [50, 57, 62, 65], [46, 53, 58, 62]],
      couches: function (s) {
        return [souffle(s, bruitBrun, "lowpass", 260, 0.06, 0.12)]; // le vent sur le parking
      },
      pas: function (s, t, i, d) {
        var a = accordDe(this, i);
        if (a.pas === 0) {
          nappe(s, t, a.notes, 0.024, d * 8, 1400);
          basse(s, t, a.notes[0] - 12, 0.18, d * 4);
        }
        if (a.pas === 6) basse(s, t, a.notes[0] - 5, 0.1, d * 2);
        if (a.pas % 2 === 0) pince(s, t, a.notes[(a.pas / 2) % a.notes.length] + 12, 0.05, 1.6);
        if (a.pas === 5 && a.mesure === 3) pince(s, t, a.notes[3] + 24, 0.04, 2);
        if (i % 32 === 20) clic(s, t, 2400, 0.04, 0.4); // un choc métallique au loin
      }
    }
  };

  /* ---------------- Le chef d'orchestre ---------------- */

  function sortieAmbiance(amb) {
    var g = ctx.createGain();
    g.gain.value = 0;
    g.connect(maitre);
    var envoi = ctx.createGain();
    envoi.gain.value = amb.echo || 0;
    g.connect(envoi); envoi.connect(echo.entree);
    return g;
  }

  // La radio de la voiture : son étouffé, aigus et graves coupés, un peu saturé
  function chaineRadio(dest) {
    var hp = ctx.createBiquadFilter(), bp = ctx.createBiquadFilter(), sat = ctx.createWaveShaper(), g = ctx.createGain();
    hp.type = "highpass"; hp.frequency.value = 350;
    bp.type = "lowpass"; bp.frequency.value = 2600;
    var courbe = new Float32Array(256);
    for (var k = 0; k < 256; k++) { var x = k / 128 - 1; courbe[k] = Math.tanh(x * 2.2); }
    sat.curve = courbe;
    g.gain.value = 0.55;
    hp.connect(bp); bp.connect(sat); sat.connect(g); g.connect(dest);
    return hp;
  }

  function tic() {
    if (!actuelle) return;
    var amb = actuelle.amb, d = 60 / amb.bpm / 2;
    while (prochain < ctx.currentTime + 0.25) {
      try { amb.pas(actuelle.sortie, prochain, pasCourant, d); } catch (e) { /* une note ratée ne doit pas arrêter le jeu */ }
      pasCourant++;
      prochain += d;
    }
  }

  function lancer(nom) {
    var amb = AMBIANCES[nom];
    if (!ctx || (actuelle && actuelle.nom === nom)) return;

    // L'ambiance précédente s'efface en douceur
    if (actuelle) {
      var ancienne = actuelle;
      ancienne.sortie.gain.cancelScheduledValues(ctx.currentTime);
      ancienne.sortie.gain.setValueAtTime(ancienne.sortie.gain.value, ctx.currentTime);
      ancienne.sortie.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
      setTimeout(function () {
        ancienne.arrets.forEach(function (f) { try { f(); } catch (e) { /* déjà arrêté */ } });
        ancienne.sortie.disconnect();
      }, 2000);
      actuelle = null;
    }
    if (!amb) return;

    var sortie = sortieAmbiance(amb);
    amb.sortieRadio = amb.radio ? chaineRadio(sortie) : sortie;
    sortie.gain.linearRampToValueAtTime(1, ctx.currentTime + 2);
    actuelle = { nom: nom, sortie: sortie, arrets: amb.couches ? amb.couches(sortie) : [], amb: amb };
    pasCourant = 0;
    prochain = ctx.currentTime + 0.1;
    tic();
  }

  function preparer() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    creerBruits();

    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 3;
    comp.connect(ctx.destination);
    maitre = ctx.createGain();
    maitre.gain.value = coupe ? 0 : VOLUME;
    maitre.connect(comp);

    // Écho : un retard qui se répète en s'assombrissant
    var entree = ctx.createGain(), retard = ctx.createDelay(1), retour = ctx.createGain(), sombre = ctx.createBiquadFilter();
    retard.delayTime.value = 0.38; retour.gain.value = 0.38;
    sombre.type = "lowpass"; sombre.frequency.value = 2200;
    entree.connect(retard); retard.connect(sombre); sombre.connect(retour); retour.connect(retard);
    sombre.connect(maitre);
    echo = { entree: entree };

    minuteur = setInterval(tic, 60);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) ctx.suspend(); else if (!coupe) ctx.resume();
    });
    return true;
  }

  /* ---------------- Ce que le jeu peut appeler ---------------- */

  window.Musique = {
    // À appeler lors d'un geste du joueur (clic, touche) : les navigateurs l'exigent
    debloquer: function () {
      if (!ctx && !preparer()) return;
      if (ctx.state === "suspended" && !coupe) ctx.resume();
      if (!actuelle) lancer(demandee);
    },
    // Change d'ambiance (nom d'un décor)
    jouer: function (nom) {
      demandee = nom;
      if (ctx) lancer(nom);
    },
    estCoupe: function () { return coupe; },
    basculer: function () {
      coupe = !coupe;
      try { window.localStorage.setItem("lautre-rive-son", coupe ? "off" : "on"); } catch (e) { /* rien */ }
      if (ctx) {
        maitre.gain.cancelScheduledValues(ctx.currentTime);
        maitre.gain.setValueAtTime(maitre.gain.value, ctx.currentTime);
        maitre.gain.linearRampToValueAtTime(coupe ? 0 : VOLUME, ctx.currentTime + 0.3);
        if (!coupe) ctx.resume();
      }
      return coupe;
    }
  };
})();
