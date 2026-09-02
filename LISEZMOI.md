# Collection de jeux — page unique

Ouvre **`index.html`** dans un navigateur : c'est le seul fichier à lancer.
Tout fonctionne hors ligne, en double-cliquant le fichier (protocole `file://`),
sans serveur web ni connexion internet.

## Arborescence

```
JEUX/
├── index.html                    ← LE MENU : point d'entrée unique
├── LISEZMOI.md
├── assets/
│   ├── css/
│   │   └── charte.css            ← charte graphique de référence (couleurs, boutons)
│   └── favicons/                 ← icônes extraites des pages (voir plus bas)
│       ├── jeux.webp             partagée par 4 jeux + les 5 éditeurs
│       ├── memoire.png
│       ├── motus.png
│       └── taquin.png
├── JeuTaquin/
│   └── JeuTaquin.html
├── JeuPuzzle/
│   ├── JeuPuzzle.html
│   ├── JeuPuzzle60piecesMax.html
│   └── Images/                   ← photos à charger dans le puzzle
├── JeuMemoire/
│   └── JeuMemoire.html
├── JeuMotus/
│   ├── jeumotus.html
│   └── FichiersMots/             ← 200mots.xml + 2 éditeurs
├── JeuAnagramme/
│   ├── JeuAnagramme.html
│   └── Mots/                     ← listes XML + 1 éditeur
└── JeuMotsMasques/
    ├── JeuMotsMasques.html
    └── Textes/                   ← citations XML + 2 éditeurs
```

## Utilisation du menu

- Une tuile par jeu, avec une illustration animée propre au jeu et le chemin
  exact du fichier lancé.
- Touches **1** à **7** : lancement direct du jeu correspondant.
- Case **« Ouvrir dans un nouvel onglet »** en haut à droite : le choix est
  mémorisé d'une visite à l'autre.
- Sans cette option, le retour au menu se fait par le bouton **Précédent** du
  navigateur.
- Les cinq éditeurs XML sont regroupés en bas de page.

## Ce qui a changé par rapport à l'archive d'origine

1. **Favicons sortis des pages.** Les 7 jeux embarquaient leur icône en base64
   dans le HTML (jusqu'à 7 Ko par page). Les images sont désormais dans
   `assets/favicons/` et appelées par un simple `<link rel="icon" href="...">`.
   Quatre jeux partageaient exactement la même icône : elle n'est plus stockée
   qu'une seule fois.
   *Gain : ≈ 37,7 Ko de HTML en moins, 4 fichiers d'icônes au total.*
2. **Icône ajoutée aux 5 éditeurs XML**, qui n'en avaient pas.
3. **Noms de dossiers et fichiers normalisés** : `JeuMotsMasqués` →
   `JeuMotsMasques`, `Enneigé.jpg` → `Enneige.jpg`. Les accents dans les chemins
   posaient problème selon le système et l'outil de décompression.
4. **Aucune autre modification du code des jeux** : leur fonctionnement, leurs
   réglages et leurs fichiers de données sont inchangés.

## Ajouter un jeu au menu

Dans `index.html`, duplique un bloc `<li>…</li>` de la grille et adapte :
`href`, `data-key` (chiffre du raccourci), `--accent` (couleur du liseré),
le titre, la description, le chemin affiché et l'illustration SVG.
Les couleurs à réutiliser sont listées dans `assets/css/charte.css`.
