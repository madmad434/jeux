# Collection de jeux — page unique

Six jeux HTML et trois éditeurs XML, lancés depuis un menu unique.
Fonctionne de deux façons, sans rien installer :

- **en local** : ouvre `index.html` par un double-clic ;
- **en ligne** : publie le dossier sur GitHub Pages (voir plus bas).

---

## Publier sur GitHub Pages

1. Crée un dépôt **public** sur GitHub (par exemple `jeux`).
2. Envoie-y **le contenu de ce dossier**, pas le dossier lui-même :
   `index.html` doit se retrouver à la racine du dépôt, à côté de `assets/`,
   `JeuTaquin/`, `JeuPuzzle/`, etc.
   - en ligne de commande :
     ```bash
     cd <ce-dossier>
     git init && git add -A && git commit -m "Jeux"
     git branch -M main
     git remote add origin https://github.com/<ton-compte>/jeux.git
     git push -u origin main
     ```
   - ou par le site : **Add file → Upload files**, puis glisse tous les
     éléments du dossier (et pas le dossier). Le fichier `.nojekyll` est
     masqué par la plupart des explorateurs : pense à l'inclure, ou crée-le
     directement sur GitHub avec **Add file → Create new file**, nom `.nojekyll`,
     contenu vide.
3. Dans le dépôt : **Settings → Pages**, source **Deploy from a branch**,
   branche `main`, dossier `/ (root)`, puis **Save**.
4. Une à deux minutes plus tard, le site est à l'adresse
   `https://<ton-compte>.github.io/jeux/`.

Tous les chemins du site sont relatifs : l'adresse du dépôt n'a pas
d'importance et le site marche aussi bien à la racine d'un domaine.

### Pourquoi `.nojekyll`

GitHub Pages fait passer les fichiers par Jekyll, qui ignore certains noms.
Le fichier vide `.nojekyll` désactive ce traitement et garantit que tous les
dossiers et fichiers sont publiés tels quels.

---

## Les fichiers d'images et de mots en ligne

C'est le point qui bloquait : un navigateur **ne peut jamais** aller chercher
tout seul un fichier sur le disque du visiteur. Les boutons d'origine
(« Choisir une image… », « Charger un fichier XML ») ouvrent donc un sélecteur
local, ce qui n'a aucun sens pour quelqu'un qui n'a pas les fichiers.

Un bouton **« 🌐 Bibliothèque en ligne »** a donc été ajouté à côté de chacun
de ces boutons. Il affiche les fichiers livrés avec le site (photos du puzzle,
listes de mots, textes), télécharge celui que l'on choisit et le remet au jeu
exactement comme si le visiteur l'avait sélectionné lui-même. **Le code des
jeux n'a pas été modifié** : le fichier arrive dans le même champ, traité par
la même fonction.

Ce bouton n'apparaît qu'en `http://` ou `https://`. En ouverture locale
(`file://`) le navigateur interdit ces téléchargements ; le bouton d'origine
reste alors le bon outil et rien ne change par rapport à avant.

Il est présent dans : Puzzle (les deux versions), Taquin (thème « Image perso »),
Anagrammes, Mots masqués, et les trois éditeurs XML.
Le jeu de Mémoire n'utilise aucun fichier externe.

### Ajouter ou retirer une photo, une liste de mots

1. Dépose ou supprime le fichier dans le dossier concerné
   (`JeuPuzzle/Images`, `JeuAnagramme/Mots`, `JeuMotsMasques/Textes`).
2. Regénère l'inventaire :
   ```bash
   python3 assets/js/generer-ressources.py
   ```
3. Recommite `assets/js/ressources.js`.

Évite les accents, les espaces et les parenthèses dans les noms de fichiers :
les serveurs web distinguent les majuscules des minuscules et supportent mal
ces caractères.

### Tester en local comme si c'était en ligne

```bash
cd <ce-dossier>
python3 -m http.server 8000
```
puis ouvre `http://localhost:8000/`. La bibliothèque en ligne y fonctionne
exactement comme sur GitHub Pages.

---

## Arborescence

```
.
├── index.html                    ← LE MENU : point d'entrée unique
├── README.md
├── .nojekyll
├── assets/
│   ├── css/charte.css            charte graphique de référence
│   ├── js/
│   │   ├── bibliotheque.js       bouton « Bibliothèque en ligne »
│   │   ├── ressources.js         inventaire des fichiers (généré)
│   │   └── generer-ressources.py script de regénération
│   └── favicons/
│       ├── jeux.webp             partagée par 3 jeux + les 3 éditeurs
│       ├── memoire.png
│       └── taquin.png
├── JeuTaquin/JeuTaquin.html
├── JeuPuzzle/
│   ├── JeuPuzzle.html
│   ├── JeuPuzzle60piecesMax.html
│   └── Images/                   photos proposées par la bibliothèque
├── JeuMemoire/JeuMemoire.html
├── JeuAnagramme/
│   ├── JeuAnagramme.html
│   └── Mots/                     listes XML + 1 éditeur
└── JeuMotsMasques/
    ├── JeuMotsMasques.html
    └── Textes/                   citations XML + 2 éditeurs
```

## Utilisation du menu

- Une tuile par jeu, avec une illustration animée et le chemin du fichier lancé.
- Touches **1** à **6** pour lancer un jeu directement.
- Case **« Ouvrir dans un nouvel onglet »**, mémorisée d'une visite à l'autre.
- Sans cette option, le retour au menu se fait par le bouton **Précédent**.

## Ce qui a changé par rapport à l'archive d'origine

1. **Favicons sortis des pages.** Les jeux embarquaient leur icône en base64
   dans le HTML (jusqu'à 7 Ko par page) et plusieurs avaient exactement la
   même. Elles sont désormais dans `assets/favicons/` et appelées par un
   `<link rel="icon">`. *Gain : environ 31 Ko de HTML.*
2. **Icône ajoutée aux éditeurs XML**, qui n'en avaient pas.
3. **Bibliothèque en ligne** ajoutée aux huit pages qui chargent un fichier.
4. **Noms normalisés** pour un hébergement web : `JeuMotsMasqués` →
   `JeuMotsMasques`, `Enneigé.jpg` → `Enneige.jpg`,
   `NouveauxMots(10).xml` → `NouveauxMots_10.xml`.
5. **Jeu Motus retiré** (le nom est une marque déposée), ainsi que ses deux
   éditeurs et son dossier `FichiersMots`.
6. **Aucune autre modification du code des jeux.**

## Ajouter un jeu au menu

Dans `index.html`, duplique un bloc `<li>…</li>` de la grille et adapte :
`href`, `data-key` (chiffre du raccourci), `--accent` (couleur du liseré),
le titre, la description, le chemin affiché et l'illustration SVG.
Les couleurs à réutiliser sont dans `assets/css/charte.css`.
