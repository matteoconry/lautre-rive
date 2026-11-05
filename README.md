# L'Autre Rive

Un jeu narratif dans le navigateur : tu choisis ta rive sur un pont, puis tu vis six jours dans la vie de quelqu'un qui ne vote pas comme toi.

**Jouer :** https://matteoconry.github.io/lautre-rive/ (ordinateur et téléphone)

## Ce que contient le prototype

La première journée de Sébastien (J-6 · Le matin), d'après le script :

- l'écran du pont, où l'on choisit sa rive ;
- le compte à rebours jusqu'au vote ;
- trois jauges : fin de mois (€), énergie et liens ;
- des choix sans bonne réponse, qui font bouger les jauges ;
- un moment « Dans sa tête » (on parie, puis on découvre la réponse) ;
- le badge retourné dans la boîte à gants.

## Où modifier quoi

| Pour changer… | Ouvre ce fichier |
| --- | --- |
| le texte, les choix, les effets sur les jauges | `site/js/histoire.js` |
| les décors en pixel art | `site/js/dessins.js` |
| les couleurs, la taille du texte | `site/style.css` |
| le fonctionnement (texte, boutons, jauges) | `site/js/moteur.js` |

Pour essayer le jeu sur ton ordinateur, ouvre simplement `site/index.html` dans ton navigateur.

## Mise en ligne

Chaque modification fusionnée dans `main` est mise en ligne automatiquement (fichier `.github/workflows/deploy.yml`). Il faut l'activer une seule fois : **Settings**, puis **Pages**, puis « Source » : **GitHub Actions**.
