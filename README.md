# Collection de jeux — page unique

Sept jeux HTML et huit éditeurs XML, lancés depuis un menu unique.
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

### Lancer un jeu sans passer par le menu

Chaque jeu est un fichier HTML autonome : on peut l'ouvrir directement, le
mettre en favori ou en faire un raccourci sur le bureau. `index.html` n'est
qu'un lanceur, il n'est jamais chargé par les jeux.

Trois fichiers du dossier `assets/` viennent seulement s'ajouter au jeu :
l'icône d'onglet, la bibliothèque en ligne et l'écran de sortie commun. S'ils
sont absents — parce qu'on a copié un dossier de jeu tout seul ailleurs — le
jeu fonctionne quand même, avec son comportement d'origine.

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

## Autres serveurs web (Apache, nginx, IIS, hébergement mutualisé…)

Le site est entièrement statique : aucun PHP, aucune base, aucune configuration.
Il suffit de déposer le dossier dans le répertoire publié du serveur. Tous les
chemins sont relatifs, donc il fonctionne à la racine d'un domaine comme dans
un sous-répertoire (`https://exemple.fr/jeux/`), sans rien changer.

Deux points ont été prévus pour les hébergeurs plus stricts :

- **Serveur refusant la méthode HEAD** (certaines configurations la bloquent) :
  la vérification des fichiers bascule automatiquement sur un GET limité au
  premier octet. Testé sur un serveur renvoyant 405.
- **Serveur sensible à la casse** (tous les Linux) : les noms de fichiers ont
  été normalisés, sans accent ni caractère spécial, et l'inventaire les
  reprend à l'identique.

Le seul détail cosmétique possible : un serveur très ancien qui ne connaîtrait
pas le type MIME `image/webp` n'afficherait pas l'icône d'onglet de quatre
pages. Rien d'autre n'en dépend.

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

**Un seul bouton est affiché à la fois, selon le mode de consultation.**
Le script regarde le protocole de la page :

- en `http://` ou `https://`, le bouton d'origine est masqué et la bibliothèque
  devient le bouton principal ; juste dessous, un bouton plus petit portant une
  icône de disque, « ou depuis mon ordinateur », ouvre le sélecteur de fichiers
  habituel pour qui veut charger sa propre photo ou son propre XML ;
- en `file://`, le bouton d'origine est le seul affiché et rien ne change par
  rapport à avant, puisque le navigateur interdit de toute façon les
  téléchargements depuis un fichier local.

Pour revoir les deux boutons côte à côte en ligne, passer
`MASQUER_BOUTON_LOCAL` à `false` en haut de `assets/js/bibliotheque.js`.

Il est présent dans : Puzzle, Taquin (thème « Image perso »),
Quizz, Jeu de Mot, Anagrammes, Mots masqués, et les huit éditeurs XML.
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
│   ├── img/mots-masques.png      icône du jeu Mots masqués
│   ├── js/
│   │   ├── bibliotheque.js       bouton « Bibliothèque en ligne »
│   │   ├── ressources.js         inventaire des fichiers (généré)
│   │   └── generer-ressources.py script de regénération
│   └── favicons/
│       ├── jeux.webp             partagée par 3 jeux + les 6 éditeurs
│       ├── jeudemot.png
│       ├── quizz.webp
│       ├── memoire.png
│       └── taquin.png
├── JeuTaquin/JeuTaquin.html
├── JeuPuzzle/
│   ├── JeuPuzzle.html
│   └── Images/                   photos proposées par la bibliothèque
├── JeuMemoire/JeuMemoire.html
├── JeuQuizz/
│   ├── JeuQuizz.html
│   └── Questionnaires/           3 questionnaires XML + 2 éditeurs
├── JeuDeMot/
│   ├── JeuDeMot.html
│   └── FichiersMots/             200mots.xml + 2 éditeurs
├── JeuAnagramme/
│   ├── JeuAnagramme.html
│   └── Mots/                     listes XML + 2 éditeurs
└── JeuMotsMasques/
    ├── JeuMotsMasques.html
    └── Textes/                   citations XML + 2 éditeurs
```

## Utilisation du menu

- Une tuile par jeu, avec une illustration animée et le chemin du fichier lancé.
  Les tuiles sont dimensionnées pour tenir sans défilement sur un écran
  d'ordinateur portable (1280 × 720 et au-delà).
- Touches **1** à **7** pour lancer un jeu directement.
- Les huit éditeurs sont regroupés derrière le bandeau **« Préparer le contenu
  des jeux »**, en bas : un clic ouvre une fenêtre superposée qui les liste.
  **Échap** la referme.
- Case **« Ouvrir dans un nouvel onglet »**, mémorisée d'une visite à l'autre.
- Sans cette option, le retour au menu se fait par le bouton **Précédent**.

## Sauvegarder et reprendre une partie

Chaque jeu procédait à sa façon : le Taquin et le Jeu de Mot demandaient un nom
de fichier, la Mémoire non, le Puzzle téléchargeait directement sans rien
demander, et les messages de fin différaient tous. `assets/js/partie.js` impose
partout le même déroulé : le fichier est écrit directement, sous un nom
horodaté, **sans rien demander** ; une fenêtre indique ensuite le nom du fichier
et le dossier où il a été déposé. Cette fenêtre s'affiche **en bas de l'écran**,
pour ne pas passer sous la bulle de téléchargement que le navigateur ouvre en
haut à droite et qui ne se referme pas d'elle-même.

**Sur le chemin complet :** aucun navigateur ne le communique à la page, pour
des raisons de sécurité. La fenêtre affiche donc le nom exact du fichier et le
dossier de téléchargements habituel de votre système — `C:\Users\<nom>\Downloads`
sous Windows, par exemple — en précisant qu'il s'agit d'une indication. La liste
des téléchargements du navigateur (**Ctrl + J**) affiche, elle, le chemin réel.

La reprise suit le même principe : une seule fenêtre confirme le fichier repris
et résume la partie, ou explique le refus quand le fichier ne correspond pas.

## Le bouton Quitter

Chaque jeu gérait la sortie à sa façon : l'un remettait le plateau à zéro,
l'autre ouvrait une boîte de dialogue du navigateur, un seul affichait un vrai
écran de fin. `assets/js/quitter.js` impose partout le même déroulé :

1. une demande de confirmation dans la charte du site ;
2. une tentative de fermeture de l'onglet — elle réussit quand le jeu a été
   ouvert dans un nouvel onglet depuis le menu ;
3. sinon, un écran **« Vous pouvez fermer la page »**, avec un lien de retour
   vers le menu pour ne pas rester bloqué sur une page morte.

Le bouton est sur **fond rouge** dans les sept jeux et les huit éditeurs.

Le script remplace chaque bouton Quitter par une copie sans écouteur, puis
branche le sien : le code des jeux n'a pas été modifié.

Les **huit éditeurs XML** suivent le même déroulé, avec l'attribut
`data-contexte="editeur"` : les libellés parlent d'édition plutôt que de partie,
et le message s'adapte à l'état du fichier — « Des modifications ne sont pas
enregistrées » ou « Le fichier ouvert est à jour ». Leurs anciens avertissements
et leurs pages de fin maison ne servent plus.

Un bouton Quitter a été ajouté là où il manquait : sur l'écran d'accueil du Jeu
de Mot et des Anagrammes, dans la barre de Mots masqués, et dans les éditeurs
Quizz et Anagrammes. Les huit jeux en ont désormais un dès leur premier écran.

## Deux familles d'éditeurs

La fenêtre « Préparer le contenu des jeux » du menu les range en deux sections :

- **Avec un guide pas à pas** — chaque ajout se fait étape par étape, avec un
  fil de progression, des explications et un récapitulatif avant validation.
  Disponible pour les quatre types de contenu : questionnaires, listes de mots,
  anagrammes et citations.
- **Mode expert** — liste à gauche, fiche à droite, tout à l'écran et au
  clavier. Plus rapide quand on connaît le format et qu'on traite beaucoup
  d'entrées. Disponible pour les quatre types de contenu également.

Les deux familles écrivent exactement le même format : on peut passer de l'une
à l'autre sur un même fichier.

## Saisie dans les éditeurs

Les champs vides affichaient des exemples concrets — « Quel composant est le
« cerveau » de l'ordinateur ? », « Exemple : ELEPHANT » — qu'on pouvait prendre
pour du contenu déjà saisi. Tous ces textes indicatifs ont été remplacés par des
formulations neutres du type « Tapez ici l'énoncé de la nouvelle question… ».

## Les aides des jeux

Les aides décrivaient un usage purement local : elles nommaient des boutons qui
ne sont plus les mêmes une fois le site servi par un serveur web, et ignoraient
le nouvel écran de sortie. `assets/js/aide-mode.js` les met d'accord avec ce que
l'utilisateur a réellement sous les yeux :

- un encadré en tête du panneau d'aide résume le mode en cours — fichier local
  ou serveur web — et le fonctionnement du bouton Quitter. En ouverture locale,
  il ne mentionne pas la bibliothèque en ligne, qui n'existe pas dans ce mode ;
- chaque panneau d'aide reçoit une **croix en haut à droite** et un **bouton
  Fermer en bas du texte**, sans doublon quand le jeu en avait déjà ;
- les sept jeux donnent accès à leur aide **dès leur écran d'accueil**. Le
  Puzzle n'en avait aucun ; le Quizz en avait un, mais enfermé dans un bloc qui
  n'apparaissait qu'une fois un questionnaire chargé ;
- les phrases devenues fausses sont réécrites à la volée. Par exemple, la
  section « Charger une photo » du Puzzle parle du bouton de la bibliothèque
  quand le site est en ligne, et du bouton d'origine quand il est ouvert en
  `file://`.

Les fichiers HTML des jeux ne contiennent donc qu'une seule version du texte,
celle d'origine ; c'est l'affichage qui s'adapte.

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
5. **Mots masqués** : le titre affiché à l'écran était « Jeu des Mots », qui
   entrait en conflit avec le jeu « Jeu de Mot ». L'icône du titre est le
   visuel fourni, dans `assets/img/mots-masques.png`.
6. **Jeu de Mot** : c'est l'ancien jeu « Motus », renommé. MOTUS est une marque
   déposée par France Télévisions qui couvre explicitement les jeux de mots ;
   la mécanique, elle, n'appartient à personne. Ont changé : le dossier, les
   fichiers, les titres, les logos, le nom des sauvegardes (`…_JeuDeMot.json`)
   et la balise racine des fichiers XML (`<motus>` → `<mots>`). Les anciennes
   sauvegardes et les anciens fichiers de mots restent lisibles : les lecteurs
   ne regardent que les balises `<mot>`.
7. **Jeu de Mémoire : grille agrandie.** La zone de jeu ne prenait pas la
   hauteur disponible — un défaut de mise en page — et la taille des cartes
   était plafonnée à 110 px. Résultat : des cartes de 40 px perdues dans un
   grand vide. Les cartes s'adaptent maintenant au nombre de lignes et de
   colonnes et remplissent l'espace : 176 px en 4×4 sur un écran 1600×900,
   131 px sur la grille maximale de 5×10, soit les 25 paires.
8. **Jeu Quizz ajouté**, avec ses trois questionnaires (cinéma, écrivains,
   géographie) dans `JeuQuizz/Questionnaires` et son éditeur.
9. **Éditeurs d'anagrammes alignés sur les autres.** `EditeurAnagrammeXML.html`
   — renommé, il s'appelait `editeurAnagrammexmldebutant.html` — a reçu
   l'assistant pas à pas en cinq étapes, avec contrôle automatique que les mots
   saisis sont bien des anagrammes les uns des autres.
   `EditeurAnagrammeXMLExpert.html` a été créé sur le modèle des autres experts,
   avec le même contrôle affiché en direct pendant la saisie.
10. **Éditeurs du Quizz alignés sur les autres.** L'éditeur guidé a reçu
   l'assistant pas à pas en cinq étapes des autres éditeurs du site ; la saisie
   directe reste accessible par un bouton. Un éditeur **mode expert** a été
   créé sur le même modèle que celui des listes de mots. La longueur maximale
   d'une réponse passe de 80 à **90 caractères**.
11. **Mot de passe supprimé.** Les fichiers XML du Quizz contenaient une balise
   `<password>` avec un mot de passe en clair. Elle a été retirée des trois
   fichiers, ainsi que le code qui la lisait dans le jeu — où elle n'était de
   toute façon jamais utilisée — et le champ « Mot de passe administrateur »
   de l'éditeur, qui la réécrivait à chaque enregistrement.
12. **Puzzle 60 pièces retiré** : la variante faisait doublon avec le Puzzle,
    qui propose déjà tous les découpages.
13. **Aucune autre modification du code des jeux.**

## Ajouter un jeu au menu

Dans `index.html`, duplique un bloc `<li>…</li>` de la grille et adapte :
`href`, `data-key` (chiffre du raccourci), `--accent` (couleur du liseré),
le titre, la description, le chemin affiché et l'illustration SVG.
Les couleurs à réutiliser sont dans `assets/css/charte.css`.
