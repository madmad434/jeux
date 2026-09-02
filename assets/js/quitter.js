/* =========================================================================
   QUITTER — comportement unique pour tous les jeux
   -------------------------------------------------------------------------
   Chaque jeu gerait la sortie a sa facon : l'un remettait le plateau a zero,
   l'autre ouvrait un confirm() du navigateur, un seul affichait un vrai ecran
   de fin. Ce module impose partout la meilleure des trois :

     1. une demande de confirmation dans la charte du site ;
     2. une tentative de fermeture de l'onglet (elle reussit quand le jeu a
        ete ouvert dans un nouvel onglet depuis le menu) ;
     3. si le navigateur refuse — c'est le cas normal quand on est arrive par
        un lien — un ecran de fin qui dit qu'on peut fermer la page, avec un
        retour possible vers le menu.

   L'attribut data-contexte="editeur" adapte les libelles et, quand la page
   expose un indicateur global `modified`, previent de la perte du travail
   en cours uniquement lorsqu'il y a effectivement des modifications.

   Mise en place, juste avant </body> :
     <script src="../assets/js/quitter.js" data-base="../"></script>

   Le script neutralise les gestionnaires d'origine des boutons Quitter en
   remplacant le bouton par une copie sans ecouteur, puis rebranche le sien.
   ========================================================================= */
(function () {
  'use strict';

  var script = document.currentScript;
  var base = (script && script.getAttribute('data-base')) || '../';
  var editeur = !!(script && script.getAttribute('data-contexte') === 'editeur');

  /* Boutons de sortie connus, tous jeux confondus. */
  var SELECTEURS = [
    '#btn-quit',            // Taquin, Memoire
    '#btn-quit-welcome',    // Puzzle : ecran d'accueil
    '#btn-quit-game',       // Puzzle : barre de jeu
    '#btn-quit-win',        // Puzzle : ecran de victoire
    '#btn-quitter',         // Mots masques et editeurs : barre principale
    '#btn-quitter-accueil'  // Mots masques : ecran d'accueil
  ];

  /* ── Styles ────────────────────────────────────────────────────────── */
  var css = document.createElement('style');
  css.textContent = [
    '.qz-ov{position:fixed;inset:0;z-index:99998;display:flex;align-items:center;',
    'justify-content:center;background:rgba(4,40,64,.55);backdrop-filter:blur(3px);padding:18px}',
    '.qz-ov[hidden]{display:none}',
    '.qz-box{background:#fff;border-radius:18px;max-width:420px;width:100%;padding:26px 24px 22px;',
    'text-align:center;box-shadow:0 20px 50px rgba(0,50,90,.4);color:#0B4E75;',
    "font-family:'Nunito','Segoe UI','Trebuchet MS',Arial,sans-serif}",
    '.qz-box h2{margin:0 0 8px;font-size:1.25rem;font-weight:800}',
    '.qz-box p{margin:0 0 20px;font-size:.95rem;line-height:1.5;color:#2A6E96;min-height:1.4em}',
    '.qz-row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}',
    '.qz-btn{font:inherit;font-weight:800;font-size:.95rem;border-radius:10px;padding:10px 18px;',
    'cursor:pointer;border:2px solid transparent;transition:background .18s ease}',
    '.qz-no{background:#E1F4FF;color:#0B4E75;border-color:#8FDCFF}',
    '.qz-no:hover{background:#C2F6FF}',
    '.qz-yes{background:#c62828;color:#fff}',
    '.qz-yes:hover{background:#8d1a1a}',
    '.qz-btn:focus-visible{outline:3px solid #0B4E75;outline-offset:2px}',
    '.qz-end{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;',
    'justify-content:center;background:#C2F6FF;color:#0B4E75;text-align:center;padding:24px;',
    "font-family:'Nunito','Segoe UI','Trebuchet MS',Arial,sans-serif}",
    '.qz-end-in{max-width:420px}',
    '.qz-end .qz-mark{font-size:2.6rem;line-height:1;margin-bottom:14px}',
    '.qz-end h2{margin:0 0 10px;font-size:1.4rem;font-weight:800}',
    '.qz-end p{margin:0 0 22px;font-size:1rem;line-height:1.6;color:#2A6E96}',
    '.qz-end kbd{background:#fff;border:1px solid #8FDCFF;border-bottom-width:2px;border-radius:5px;',
    'padding:1px 6px;font-family:inherit;font-weight:700;font-size:.85rem}',
    '.qz-home{display:inline-block;text-decoration:none;font-weight:800;font-size:.95rem;',
    'background:#0B4E75;color:#fff;border-radius:10px;padding:11px 20px}',
    '.qz-home:hover{background:#38B6FF}'
  ].join('');
  document.head.appendChild(css);

  /* ── Confirmation ──────────────────────────────────────────────────── */
  var ov = document.createElement('div');
  ov.className = 'qz-ov';
  ov.hidden = true;
  ov.innerHTML =
    '<div class="qz-box" role="dialog" aria-modal="true" aria-label="Quitter le jeu">' +
      '<h2>' + (editeur ? "Quitter l'éditeur ?" : 'Quitter le jeu ?') + '</h2>' +
      '<p class="qz-msg"></p>' +
      '<div class="qz-row">' +
        '<button type="button" class="qz-btn qz-no">' + (editeur ? 'Continuer à éditer' : 'Continuer à jouer') + '</button>' +
        '<button type="button" class="qz-btn qz-yes">Oui, quitter</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(ov);

  var declencheur = null;

  ov.querySelector('.qz-no').addEventListener('click', annuler);
  ov.querySelector('.qz-yes').addEventListener('click', sortir);
  ov.addEventListener('click', function (e) { if (e.target === ov) annuler(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !ov.hidden) { e.stopPropagation(); annuler(); }
  }, true);

  function demander(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); declencheur = e.currentTarget; }
    ov.querySelector('.qz-msg').textContent = message();
    ov.hidden = false;
    ov.querySelector('.qz-no').focus();
  }

  // Les editeurs declarent tous un `let modified` au niveau global. Un `let`
  // de premier niveau n'apparait pas sur `window`, mais reste visible depuis
  // un autre script classique : on y accede donc directement, sous try/catch
  // au cas ou la variable n'existerait pas.
  function estModifie() {
    try { return !!modified; } catch (e) { return null; }
  }

  function message() {
    if (!editeur) return 'La partie en cours ne sera pas enregistrée.';
    var m = estModifie();
    if (m === true)  return 'Des modifications ne sont pas enregistrées. Elles seront perdues.';
    if (m === false) return 'Le fichier ouvert est à jour, rien ne sera perdu.';
    return 'Le travail non enregistré sera perdu.';
  }

  function annuler() {
    ov.hidden = true;
    if (declencheur && declencheur.focus) declencheur.focus();
  }

  function sortir() {
    ov.hidden = true;
    window.close();                       // marche si le jeu est dans son propre onglet
    setTimeout(ecranDeFin, 300);          // sinon, on affiche l'ecran de fin
  }

  function ecranDeFin() {
    var fin = document.createElement('div');
    fin.className = 'qz-end';
    fin.innerHTML =
      '<div class="qz-end-in">' +
        '<div class="qz-mark" aria-hidden="true">👋</div>' +
        '<h2>À bientôt</h2>' +
        '<p>Vous pouvez fermer la page.<br>' +
        '<span style="font-size:.85rem">Raccourci : <kbd>Ctrl</kbd> + <kbd>W</kbd></span></p>' +
        '<a class="qz-home" href="' + base + 'index.html">← Revenir au menu des jeux</a>' +
      '</div>';
    document.body.appendChild(fin);
    // on fige ce qu'il y a dessous
    document.body.style.overflow = 'hidden';
    var lien = fin.querySelector('.qz-home');
    if (lien) lien.focus();
  }

  /* ── Branchement sur les boutons du jeu ────────────────────────────── */
  function brancher(el) {
    // un clone perd les ecouteurs poses par le jeu : on repart d'une page blanche
    var neuf = el.cloneNode(true);
    neuf.removeAttribute('onclick');
    el.parentNode.replaceChild(neuf, el);
    neuf.addEventListener('click', demander);
    return neuf;
  }

  SELECTEURS.forEach(function (sel) {
    Array.prototype.forEach.call(document.querySelectorAll(sel), brancher);
  });

  // Pages dont le bouton appelle une fonction globale plutot qu'un ecouteur.
  // On remplace ces fonctions : les editeurs avaient chacun leur propre
  // avertissement et leur propre page de fin, desormais inutiles.
  window.quitter    = function () { demander(null); };
  window.doQuit     = function () { demander(null); };
  window.quitterApp = function () { demander(null); };

  // Expose pour un eventuel bouton ajoute a la main
  window.quitterApplication = function () { demander(null); };
})();
