/* ============================================================================
   aide-uniforme.js — presentation commune a toutes les fenetres d'aide
   ----------------------------------------------------------------------------
   Objectif : que l'aide se presente de la meme facon dans les sept jeux et
   les huit editeurs, quel que soit le balisage d'origine.

   Modele retenu (celui du Jeu de mot et du Jeu d'anagramme) :
     - panneau ancre a GAUCHE de l'ecran, sur toute la hauteur ;
     - un en-tete fixe : le titre, et un seul « ✕ » pour sortir ;
     - le contenu defile entre l'en-tete et le pied ;
     - un pied fixe avec un seul bouton « Fermer ».

   Tous les autres boutons de fermeture presents dans le contenu d'origine
   (« OK », « J'ai compris », « ✕ » en double, « Fermer » en milieu de page)
   sont retires : il ne doit rester qu'une croix et un bouton.

   Mise en place dans une page :
     <script src="../assets/js/aide-uniforme.js"
             data-panneau="#rules-panel"
             data-voile="#rules-overlay"
             data-titre="Comment jouer ?"
             data-fermer="closeRules()"></script>

     data-panneau : selecteur du bloc qui contient l'aide (obligatoire).
                    Plusieurs selecteurs peuvent etre separes par des virgules.
     data-voile   : selecteur du fond assombri, s'il est distinct (facultatif).
     data-titre   : titre a afficher si le panneau n'en contient pas.
     data-fermer  : expression JavaScript de fermeture. A defaut, le script
                    masque le panneau lui-meme.
     data-observer: "1" pour surveiller les fenetres creees a la volee
                    (cas des editeurs, dont l'aide est construite au clic).
============================================================================ */
(function () {
  'use strict';

  var script    = document.currentScript;
  var selPanneau = script.getAttribute('data-panneau') || '';
  var selVoile   = script.getAttribute('data-voile')   || '';
  var titreDefaut = script.getAttribute('data-titre')  || 'Aide';
  var exprFermer = script.getAttribute('data-fermer')  || '';
  var observer   = script.getAttribute('data-observer') === '1';

  /* ── Feuille de style commune ─────────────────────────────────────────── */
  var CSS = [
    /* Fond assombri : le panneau etant a gauche, on ne centre plus. */
    '.aideU-voile{justify-content:flex-start!important;align-items:stretch!important;padding:0!important}',

    /* Le panneau : colonne ancree a gauche, pleine hauteur. */
    '.aideU-panneau{',
    '  position:fixed!important;left:0!important;top:0!important;bottom:0!important;',
    '  right:auto!important;margin:0!important;',
    '  width:min(480px,94vw)!important;max-width:min(480px,94vw)!important;',
    '  height:100%!important;max-height:100%!important;',
    '  display:flex!important;flex-direction:column!important;',
    '  border-radius:0 18px 18px 0!important;overflow:hidden!important;',
    '  background:#fff;color:#1f2937;',
    '  box-shadow:6px 0 32px rgba(0,0,0,.28);z-index:10000;',
    '  font-family:inherit;text-align:left!important;padding:0!important;',
    '}',

    /* En-tete fixe : titre + croix unique. */
    '.aideU-tete{',
    '  flex:none;display:flex;align-items:center;gap:12px;',
    '  padding:14px 16px;background:#0B4E75;color:#fff;',
    '}',
    '.aideU-titre{flex:1;min-width:0;font-size:1.02rem;font-weight:800;line-height:1.3;',
    '  margin:0;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.aideU-x{',
    '  flex:none;width:34px;height:34px;border-radius:9px;cursor:pointer;',
    '  background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.45);',
    '  color:#fff;font-size:1.05rem;line-height:1;font-family:inherit;font-weight:700;',
    '  display:flex;align-items:center;justify-content:center;transition:background .15s;',
    '}',
    /* La plupart des fenetres d'aide sont centrees par une transformation
       (translate(-50%,-50%)) qu'il faut annuler puisque le panneau est ancre a
       gauche. Mais deux jeux — le Jeu de mot et le Jeu d'anagramme — se servent
       au contraire de la transformation pour CACHER leur panneau, qui coulisse
       hors de l'ecran. Chez eux, annuler la transformation revenait a laisser
       l'aide ouverte en permanence, sans moyen de la fermer. Ces panneaux-la
       sont marques « glissant » et gardent leur transformation. */
    '.aideU-panneau:not(.aideU-glissant){transform:none!important}',

    '.aideU-x:hover{background:rgba(255,255,255,.36)}',
    '.aideU-x:focus-visible{outline:3px solid #8FDCFF;outline-offset:2px}',

    /* Corps : seule zone qui defile. */
    '.aideU-corps{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;',
    '  padding:16px;font-size:.88rem;line-height:1.65}',
    '.aideU-corps>:first-child{margin-top:0}',
    '.aideU-corps img,.aideU-corps pre{max-width:100%}',
    '.aideU-corps pre{white-space:pre-wrap;word-break:break-word}',

    /* Pied fixe : imprimer, puis fermer. */
    '.aideU-pied{flex:none;display:flex;gap:8px;padding:11px 16px;',
    '  border-top:1px solid #e2e8f0;background:#f8fafc}',
    '.aideU-fermer,.aideU-imprimer{',
    '  padding:11px;border:none;border-radius:11px;cursor:pointer;',
    '  font-family:inherit;font-size:.96rem;font-weight:800;transition:background .15s;',
    '}',
    '.aideU-fermer{flex:1 1 auto;background:#38B6FF;color:#fff}',
    '.aideU-fermer:hover{background:#0B4E75}',
    '.aideU-fermer:focus-visible{outline:3px solid #0B4E75;outline-offset:2px}',
    '.aideU-imprimer{flex:none;background:#e2f4ff;color:#0B4E75;border:1px solid #8FDCFF}',
    '.aideU-imprimer:hover{background:#cfeaff}',
    '.aideU-imprimer:focus-visible{outline:3px solid #0B4E75;outline-offset:2px}',

    /* Les editeurs « expert » ont un theme sombre : leur aide, replacee sur
       un fond clair, doit retrouver des couleurs lisibles. */
    '.aideU-corps .help-panel,.aideU-corps .help-section,',
    '.aideU-corps .help-section p,.aideU-corps .help-section li,',
    '.aideU-corps .help-table td{color:#374151!important;background:transparent!important}',
    '.aideU-corps .help-panel h2,.aideU-corps .help-section h3{color:#0B4E75!important;',
    '  border-color:#d7eefb!important}',
    '.aideU-corps .help-section .note{background:#FFF6E5!important;border-color:#FFD79A!important;',
    '  color:#7a4f00!important}',
    '.aideU-corps .help-kbd{background:#0B4E75!important;color:#fff!important;border-color:#0B4E75!important}',
    '.aideU-corps .help-table{width:100%;border-collapse:collapse}',
    '.aideU-corps .help-table th{background:#0B4E75!important;color:#fff!important;border-color:#d7eefb!important}',
    '.aideU-corps .help-table tr:nth-child(even) td{background:#f2fbff!important}',
    '.aideU-corps .help-panel{padding:0!important;overflow:visible!important}',
    '.aideU-corps pre,.aideU-corps code{background:#E1F4FF!important;color:#1e3a5c!important;',
    '  border:1px solid #8FDCFF!important;border-radius:8px}',

    '@media (max-height:520px){.aideU-tete{padding:9px 12px}.aideU-corps{padding:11px 12px}',
    '  .aideU-pied{padding:8px 12px}.aideU-fermer,.aideU-imprimer{padding:8px}}',

    /* Impression : le contenu de l'aide est recopie dans une boite posee a la
       racine du document, et tout le reste de la page est masque. On evite
       ainsi d'imprimer le jeu, la barre d'outils ou le panneau tronque par sa
       zone defilante. Les couleurs sont ramenees au noir sur blanc : certaines
       aides ont un theme sombre, illisible une fois imprime. */
    '#aideU-impression{display:none}',
    '@media print{',
    '  html.aideU-en-impression, html.aideU-en-impression body{',
    '    height:auto!important;overflow:visible!important;background:#fff!important}',
    '  html.aideU-en-impression body>*{display:none!important}',
    '  html.aideU-en-impression #aideU-impression{display:block!important;',
    '    position:static!important;padding:0;background:#fff;color:#000;',
    '    font-family:inherit;font-size:11pt;line-height:1.5}',
    '  #aideU-impression .aideU-imp-titre{font-size:17pt;margin:0 0 10pt;',
    '    padding-bottom:5pt;border-bottom:1.5pt solid #000}',
    '  #aideU-impression *{position:static!important;overflow:visible!important;',
    '    max-height:none!important;height:auto!important;width:auto!important;',
    '    color:#000!important;background:#fff!important;box-shadow:none!important;',
    '    transform:none!important;float:none!important}',
    '  #aideU-impression table{width:100%!important;border-collapse:collapse}',
    '  #aideU-impression th,#aideU-impression td{border:.5pt solid #666!important;padding:3pt 5pt}',
    '  #aideU-impression pre,#aideU-impression code{border:.5pt solid #999!important;',
    '    white-space:pre-wrap!important;word-break:break-word}',
    '  #aideU-impression h1,#aideU-impression h2,#aideU-impression h3,',
    '  #aideU-impression h4,#aideU-impression tr,#aideU-impression li{',
    '    break-inside:avoid;page-break-inside:avoid}',
    '  #aideU-impression h2,#aideU-impression h3{break-after:avoid;page-break-after:avoid}',
    '}'
  ].join('\n');

  var style = document.createElement('style');
  style.textContent = CSS;
  (document.head || document.documentElement).appendChild(style);

  /* ── Reperage des elements a supprimer ────────────────────────────────── */
  // Un bouton dont le seul role est de fermer : croix, « OK », « Fermer »,
  // « J'ai compris »... Ils font double emploi avec l'en-tete et le pied.
  var MOTS_FERMETURE = /^(\s*[✕✖×xX]\s*|.*\b(fermer|j'ai compris|jai compris|compris|ok|d'accord|daccord|retour au jeu|revenir au jeu|continuer)\b.*)$/i;

  function estBoutonFermeture(el) {
    var t = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (t.length > 30) return false;
    return MOTS_FERMETURE.test(t);
  }

  /* Un panneau qui, au repos, est deja translate de presque toute sa largeur
     ou de toute sa hauteur ne se cache pas autrement : c'est un tiroir. On
     distingue ce cas du simple centrage translate(-50%,-50%), qui ne deplace
     l'element que de la moitie de sa taille. */
  function estTiroir(panneau) {
    var t;
    try { t = getComputedStyle(panneau).transform; } catch (e) { return false; }
    if (!t || t === 'none') return false;
    var m = /^matrix\(([^)]*)\)$/.exec(t), v, tx, ty;
    if (m) { v = m[1].split(','); tx = parseFloat(v[4]); ty = parseFloat(v[5]); }
    else {
      m = /^matrix3d\(([^)]*)\)$/.exec(t);
      if (!m) return false;
      v = m[1].split(','); tx = parseFloat(v[12]); ty = parseFloat(v[13]);
    }
    if (isNaN(tx) || isNaN(ty)) return false;
    var l = panneau.offsetWidth || 0, h = panneau.offsetHeight || 0;
    return (l > 0 && Math.abs(tx) >= l * 0.9) || (h > 0 && Math.abs(ty) >= h * 0.9);
  }

  function texteTitre(panneau) {
    // Certaines fenetres portent leur titre dans une barre d'en-tete plutot
    // que dans un titre de niveau : on la prend en priorite.
    var barre = panneau.querySelector('.help-box-header,.modal-header');
    if (barre && barre === panneau.firstElementChild) {
      var tb = (barre.textContent || '').replace(/[✕✖×]/g, '').replace(/\s+/g, ' ').trim();
      barre.remove();
      if (tb && tb.length <= 90) return tb;
    }
    var cand = panneau.querySelector('h1,h2,h3,.modal-title,.aide-title,#aide-title,.rules-title');
    if (!cand) return null;
    var t = (cand.textContent || '').replace(/\s+/g, ' ').trim();
    if (!t || t.length > 90) return null;
    // On ne deplace que si ce titre ouvre reellement le panneau.
    var premier = panneau.firstElementChild;
    if (cand !== premier && !(premier && premier.contains(cand))) return null;
    cand.remove();
    return t;
  }

  /* ── Normalisation d'un panneau ───────────────────────────────────────── */
  function normaliser(panneau, fermer, titre) {
    if (!panneau || panneau.dataset.aideU === '1') return;
    panneau.dataset.aideU = '1';

    // A mesurer avant toute modification : le panneau est encore au repos.
    var tiroir = estTiroir(panneau);

    var titreTexte = texteTitre(panneau) || titre || titreDefaut;

    // Retrait de tous les boutons de fermeture existants.
    Array.prototype.slice.call(panneau.querySelectorAll('button,a[role=button],.modal-close'))
      .forEach(function (b) {
        if (estBoutonFermeture(b)) {
          var pere = b.parentElement;
          b.remove();
          // Un pied de page devenu vide n'a plus lieu d'etre.
          if (pere && pere !== panneau && !pere.textContent.trim() && !pere.querySelector('button,input,img')) {
            pere.remove();
          }
        }
      });

    // Le contenu restant part dans une zone defilante.
    var corps = document.createElement('div');
    corps.className = 'aideU-corps';
    while (panneau.firstChild) corps.appendChild(panneau.firstChild);

    var tete = document.createElement('div');
    tete.className = 'aideU-tete';
    var h = document.createElement('h2');
    h.className = 'aideU-titre';
    h.textContent = titreTexte;
    var x = document.createElement('button');
    x.type = 'button';
    x.className = 'aideU-x';
    x.setAttribute('aria-label', 'Fermer l’aide');
    x.title = 'Fermer l’aide';
    x.textContent = '✕';
    tete.appendChild(h);
    tete.appendChild(x);

    var pied = document.createElement('div');
    pied.className = 'aideU-pied';
    var imp = document.createElement('button');
    imp.type = 'button';
    imp.className = 'aideU-imprimer';
    imp.title = 'Imprimer cette aide';
    imp.setAttribute('aria-label', 'Imprimer cette aide');
    imp.textContent = '🖨 Imprimer';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'aideU-fermer';
    btn.textContent = 'Fermer';
    pied.appendChild(imp);
    pied.appendChild(btn);

    panneau.className = (panneau.className + ' aideU-panneau' +
                         (tiroir ? ' aideU-glissant' : '')).trim();
    panneau.appendChild(tete);
    panneau.appendChild(corps);
    panneau.appendChild(pied);

    x.addEventListener('click', fermer);
    btn.addEventListener('click', fermer);
    imp.addEventListener('click', function () { imprimer(panneau); });

    // Echap ferme egalement, comme partout ailleurs dans l'application.
    panneau.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); fermer(); }
    });

    return { bouton: btn, croix: x };
  }

  /* ── Impression de l'aide ─────────────────────────────────────────────── */
  function imprimer(panneau) {
    var titre = panneau.querySelector('.aideU-titre');
    var corps = panneau.querySelector('.aideU-corps');
    if (!corps) return;

    var boite = document.getElementById('aideU-impression');
    if (!boite) {
      boite = document.createElement('div');
      boite.id = 'aideU-impression';
      document.body.appendChild(boite);
    }
    boite.innerHTML = '';

    var h = document.createElement('h1');
    h.className = 'aideU-imp-titre';
    h.textContent = (titre && titre.textContent) || document.title || 'Aide';
    boite.appendChild(h);

    var copie = corps.cloneNode(true);
    copie.className = 'aideU-imp-corps';
    copie.removeAttribute('id');
    copie.removeAttribute('style');
    // Les commandes n'ont aucun sens sur le papier.
    Array.prototype.forEach.call(
      copie.querySelectorAll('button,input,select,textarea,script,iframe,video,audio'),
      function (el) { if (el.parentNode) el.parentNode.removeChild(el); });
    // Une section repliee n'est pas imprimee : on n'imprime que ce qui est
    // effectivement affiche a l'ecran, titre de la section compris.
    Array.prototype.forEach.call(
      copie.querySelectorAll('details:not([open])'),
      function (el) { if (el.parentNode) el.parentNode.removeChild(el); });
    boite.appendChild(copie);

    var racine = document.documentElement, fini = false;
    function nettoyer() {
      if (fini) return;
      fini = true;
      racine.classList.remove('aideU-en-impression');
    }
    racine.classList.add('aideU-en-impression');
    window.addEventListener('afterprint', function apres() {
      window.removeEventListener('afterprint', apres);
      nettoyer();
    });
    // Filet : quelques navigateurs n'emettent jamais « afterprint ».
    setTimeout(nettoyer, 3000);

    try { window.print(); }
    catch (e) { nettoyer(); }
  }

  /* ── Fabrique de la fonction de fermeture ─────────────────────────────── */
  function fabriquerFermeture(panneau) {
    if (exprFermer) {
      return function () {
        try { (0, eval)(exprFermer); }
        catch (err) { masquer(panneau); }
      };
    }
    return function () { masquer(panneau); };
  }

  function masquer(panneau) {
    // Repli generique : on retire les classes d'ouverture usuelles, sinon on
    // masque directement l'element (ou son conteneur plein ecran).
    var cible = panneau.closest('.modal-overlay,.overlay,[id$="-overlay"],[id$="-modal"]') || panneau;
    ['open', 'show', 'visible', 'active'].forEach(function (c) {
      cible.classList.remove(c); panneau.classList.remove(c);
    });
    cible.classList.add('hidden');
    if (cible !== panneau) cible.style.display = 'none';
    else panneau.style.display = 'none';
  }

  /* ── Application ──────────────────────────────────────────────────────── */
  function appliquer() {
    if (selVoile) {
      document.querySelectorAll(selVoile).forEach(function (v) {
        v.classList.add('aideU-voile');
      });
    }
    if (!selPanneau) return;
    document.querySelectorAll(selPanneau).forEach(function (p) {
      // Si le panneau est lui-meme un conteneur plein ecran, on habille le
      // premier bloc interieur plutot que le voile.
      normaliser(p, fabriquerFermeture(p));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', appliquer);
  } else {
    appliquer();
  }

  /* Fenetres construites au moment du clic (aide des editeurs). */
  if (observer) {
    new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        Array.prototype.slice.call(m.addedNodes).forEach(function (n) {
          if (n.nodeType !== 1) return;
          // La fenetre d'aide se reconnait a son identite, pas a son contenu.
          // Un reperage sur les mots « aide » ou « guide » attrapait aussi les
          // assistants de saisie (« Guide pas a pas ») des editeurs guides, qui
          // se retrouvaient alors plaques a gauche de l'ecran comme une aide.
          var SEL_VOILE = '#helpModal,#helpOverlay,.help-overlay';
          var voile = n.matches && n.matches(SEL_VOILE) ? n
                    : (n.querySelector ? n.querySelector(SEL_VOILE) : null);
          if (!voile) return;
          var boite = voile.querySelector('.modal-box,.help-box');
          if (!boite) return;
          voile.classList.add('aideU-voile');
          normaliser(boite, function () { voile.remove(); });
        });
      });
    }).observe(document.body || document.documentElement, { childList: true, subtree: true });
  }

  window.AideUniforme = { normaliser: normaliser };
})();
