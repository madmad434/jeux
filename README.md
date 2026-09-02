# Collection de jeux — page unique

Sept jeux HTML et cinq éditeurs XML, lancés depuis un menu unique.
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
     éléments du dossier (et pas le dossier).
3. Dans le dépôt : **Settings → Pages**, source **Deploy from a branch**,
   branche `main`, dossier `/ (root)`, puis **Save**.
4. Une à deux minutes plus tard, le site est à l'adresse
   `https://<ton-compte>.github.io/jeux/`.

Tous les chemins du site sont relatifs : l'adresse du dépôt n'a pas
d'importance et le site marche aussi bien à la racine d'un domaine.

### Si le bouton « Choisir dans la bibliothèque du site » n'apparaît pas

Il n'apparaît qu'en `http://` ou `https://`, et seulement si les scripts du
site ont bien été publiés. Dans l'ordre :

1. Recharge en vidant le cache : **Ctrl + Maj + R** (⌘ + Maj + R sur Mac).
2. Vérifie l'adresse `…/assets/js/bibliotheque.js` dans ton navigateur : elle
   doit afficher du code, pas une page « 404 ». Si c'est un 404, le dossier
   `assets/` n'a pas été envoyé, ou `index.html` n'est pas à la racine du
   dépôt (il ne doit pas y avoir de dossier intermédiaire).
3. Ouvre la console avec **F12**, onglet **Console** : les erreurs de
   chargement y apparaissent.

Aucun fichier `.nojekyll` n'est nécessaire : aucun dossier de ce site ne
commence par `_` ou par un point, donc GitHub Pages publie tout tel quel.

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
Jeu de Mot, Anagrammes, Mots masqués, et les cinq éditeurs XML.
Le jeu de Mémoire n'utilise aucun fichier externe.

### Ajouter ou retirer une photo, une liste de mots

Les fichiers proposés sont listés dans `assets/js/ressources.js`.

**Supprimer un fichier : rien à faire.** À chaque ouverture, la bibliothèque
vérifie que chaque fichier de l'inventaire est bien encore en ligne et écarte
en silence ceux qui ne le sont plus. Un fichier effacé du dépôt disparaît donc
tout seul de la liste.

**Ajouter un fichier**, en revanche, demande de compléter l'inventaire :

1. Dépose le fichier dans le dossier concerné (`JeuPuzzle/Images`,
   `JeuDeMot/FichiersMots`, `JeuAnagramme/Mots`, `JeuMotsMasques/Textes`).
2. Ajoute son chemin dans `assets/js/ressources.js` — c'est une simple liste,
   éditable directement sur GitHub :
   ```js
   "puzzle": [
     "JeuPuzzle/Images/Enneige.jpg",
     "JeuPuzzle/Images/MaNouvellePhoto.jpg"
   ],
   ```
   Ou, si tu travailles en local, laisse le script le faire :
   ```bash
   python3 assets/js/generer-ressources.py
   ```
3. Recommite `assets/js/ressources.js`.

Un inventaire qui contient des fichiers disparus n'est donc pas un problème :
au pire il fait quelques vérifications inutiles à l'ouverture.

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
├── assets/
│   ├── css/charte.css            charte graphique de référence
│   ├── js/
│   │   ├── bibliotheque.js       bouton « Bibliothèque en ligne »
│   │   ├── ressources.js         inventaire des fichiers (généré)
│   │   └── generer-ressources.py script de regénération
│   └── favicons/
│       ├── jeux.webp             partagée par 3 jeux + les 5 éditeurs
│       ├── jeudemot.png
│       ├── memoire.png
│       └── taquin.png
├── JeuTaquin/JeuTaquin.html
├── JeuPuzzle/
│   ├── JeuPuzzle.html
│   ├── JeuPuzzle60piecesMax.html
│   └── Images/                   photos proposées par la bibliothèque
├── JeuMemoire/JeuMemoire.html
├── JeuDeMot/
│   ├── JeuDeMot.html
│   └── FichiersMots/             200mots.xml + 2 éditeurs
├── JeuAnagramme/
│   ├── JeuAnagramme.html
│   └── Mots/                     listes XML + 1 éditeur
└── JeuMotsMasques/
    ├── JeuMotsMasques.html
    └── Textes/                   citations XML + 2 éditeurs
```

## Utilisation du menu

- Une tuile par jeu, avec une illustration animée et le chemin du fichier lancé.
- Touches **1** à **7** pour lancer un jeu directement.
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
5. **Jeu de Mot** : c'est l'ancien jeu « Motus », renommé. MOTUS est une marque
   déposée par France Télévisions qui couvre explicitement les jeux de mots ;
   la mécanique, elle, n'appartient à personne. Ont changé : le dossier, les
   fichiers, les titres, les logos, le nom des sauvegardes (`…_JeuDeMot.json`)
   et la balise racine des fichiers XML (`<motus>` → `<mots>`). Les anciennes
   sauvegardes et les anciens fichiers de mots restent lisibles : les lecteurs
   ne regardent que les balises `<mot>`.
6. **Aucune autre modification du code des jeux.**

## Ajouter un jeu au menu

Dans `index.html`, duplique un bloc `<li>…</li>` de la grille et adapte :
`href`, `data-key` (chiffre du raccourci), `--accent` (couleur du liseré),
le titre, la description, le chemin affiché et l'illustration SVG.
Les couleurs à réutiliser sont dans `assets/css/charte.css`.
