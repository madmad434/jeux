/* =========================================================================
   AIDE CONTEXTUELLE
   -------------------------------------------------------------------------
   Les aides des jeux ont ete ecrites pour un usage local : elles decrivent
   des boutons qui ne sont plus les memes quand le site est servi par un
   serveur web, et elles ignorent le nouvel ecran de sortie.

   Ce script ajoute en tete de chaque panneau d'aide un encadre qui decrit ce
   que l'utilisateur a reellement sous les yeux, et masque les phrases
   devenues fausses. Le texte differe selon le protocole de la page :

     file://          -> tout se charge depuis le disque, comme avant.
     http:// https:// -> la bibliotheque du site est le chemin principal,
                         le disque reste possible via le bouton a icone.

   Mise en place, juste avant </body> :
     <script src="../assets/js/aide-mode.js" data-jeu="puzzle" data-base="../"></script>
   ========================================================================= */
(function () {
  'use strict';

  var script = document.currentScript;
  if (!script) return;
  var cle = script.getAttribute('data-jeu');

  var enLigne = (location.protocol === 'http:' || location.protocol === 'https:');

  /* aide    : conteneur du panneau d'aide
     charge  : le jeu charge-t-il un fichier fourni avec le site ?
     quoi    : nature de ce fichier, pour le libelle
     recrire : phrases de l'aide devenues fausses en ligne ; l'element qui
               contient le marqueur voit son contenu remplace.              */
  var CFG = {
    quizz: {
      aide:'#help-modal > div', overlay:'#help-modal', fermeture:'style',
      charge:true, quoi:'un questionnaire',
      recrire:[{ marqueur:'Charger le fichier Questions.xml', html:
        'Choisissez un questionnaire avec <strong>«&nbsp;Choisir dans la bibliothèque ' +
        'du site&nbsp;»</strong> parmi ceux fournis, ou avec le bouton à <strong>icône ' +
        'de disque</strong> pour un fichier XML de votre ordinateur.' }],
      recrireLocal:[{ marqueur:'Charger le fichier Questions.xml', html:
        'Choisissez un questionnaire avec le bouton de chargement : il ouvre le sélecteur ' +
        'de fichiers de votre ordinateur. Les questionnaires fournis se trouvent dans le ' +
        'dossier <strong>JeuQuizz/Questionnaires</strong>.' }]
    },
    puzzle: {
      aide:'#help-overlay .modal-box', overlay:'#help-overlay', fermeture:'classe:hidden',
      charge:true, quoi:'une photo',
      recrire:[{ marqueur:'Ouvrir le dossier Images', html:
        '📂 Choisissez une photo : <b>«&nbsp;Choisir dans la bibliothèque du site&nbsp;»</b> ' +
        'pour une des photos fournies, ou le bouton à <b>icône de disque</b> pour une photo ' +
        'de votre ordinateur.<br>Une <b>miniature</b> s\'affiche aussitôt pour confirmer ' +
        'votre choix, et vous pouvez en changer à tout moment.' }],
      recrireLocal:[{ marqueur:'Ouvrir le dossier Images', html:
        '📂 Cliquez sur <b>«&nbsp;Ouvrir le dossier Images&nbsp;»</b> pour choisir une photo ' +
        'sur votre ordinateur ; celles fournies avec les jeux sont dans ' +
        '<b>JeuPuzzle/Images</b>.<br>Une <b>miniature</b> s\'affiche aussitôt pour confirmer ' +
        'votre choix, et vous pouvez en changer à tout moment.' }]
    },
    taquin: {
      aide:'#aide-overlay .aide-body', overlay:'#aide-overlay', fermeture:'classe:show',
      charge:true, quoi:'une image', optionnel:true,
      recrire:[{ marqueur:'Choisir une image…', html:
        'Thème <strong>Image perso</strong>, puis <strong>«&nbsp;Choisir dans la bibliothèque ' +
        'du site&nbsp;»</strong> pour une photo fournie, ou le bouton à <strong>icône de ' +
        'disque</strong> pour une image de votre ordinateur — vous pouvez aussi glisser une ' +
        'image directement sur la grille. L\'aperçu latéral montre le découpage numéroté.' }],
      recrireLocal:[]
    },
    memoire:     { aide:'#aide-modal > div', overlay:'#aide-modal', fermeture:'style', charge:false },
    jeudemot:    { aide:'#rules-panel', overlay:'#rules-overlay, #rules-panel', fermeture:'classe:open',
                   charge:true, quoi:'une liste de mots', optionnel:true },
    anagramme:   { aide:'#rules-panel', overlay:'#rules-overlay, #rules-panel', fermeture:'classe:open',
                   charge:true, quoi:"une liste d'anagrammes", optionnel:true },
    motsmasques: {
      aide:'#rules-modal .modal-box', overlay:'#rules-modal', fermeture:'classe:show',
      charge:true, quoi:'un texte', optionnel:true,
      recrire:[{ marqueur:'Choisir un fichier XML manuellement', html:
        'Par défaut le jeu utilise des textes intégrés. Pour en changer, clique sur ' +
        '<strong>«&nbsp;Choisir dans la bibliothèque du site&nbsp;»</strong> depuis l\'accueil, ' +
        'ou sur le bouton à <strong>icône de disque</strong> pour un fichier de ton ordinateur.' }],
      recrireLocal:[{ marqueur:'Choisir un fichier XML manuellement', html:
        'Par défaut le jeu utilise des textes intégrés. Pour en changer, clique sur le bouton ' +
        'de chargement : il ouvre le sélecteur de fichiers de ton ordinateur. Les textes ' +
        'fournis sont dans le dossier <strong>JeuMotsMasques/Textes</strong>.' }]
    }
  };



  var cfg = CFG[cle];
  if (!cfg) return;

  var boite = document.querySelector(cfg.aide);
  if (!boite) return;

  /* ── Style de l'encadre ────────────────────────────────────────────── */
  var css = document.createElement('style');
  css.textContent = [
    '.am-bloc{background:#E1F4FF;border:1px solid #8FDCFF;border-left:5px solid #38B6FF;',
    'border-radius:10px;padding:12px 14px;margin:0 0 16px;text-align:left;',
    "font-family:'Nunito','Segoe UI','Trebuchet MS',Arial,sans-serif;color:#0B4E75}",
    '.am-bloc h4{margin:0 0 7px;font-size:.9rem;font-weight:800;color:#0B4E75;',
    'text-transform:none;letter-spacing:0}',
    '.am-bloc p{margin:0 0 7px;font-size:.86rem;line-height:1.55;color:#0B4E75}',
    '.am-bloc p:last-child{margin-bottom:0}',
    '.am-bloc b{font-weight:800}',
    '.am-croix{position:absolute;top:10px;right:12px;z-index:5;width:32px;height:32px;',
    'border:0;border-radius:8px;background:rgba(11,78,117,.10);color:#0B4E75;font-size:1rem;',
    "font-family:'Nunito','Segoe UI',Arial,sans-serif;font-weight:800;cursor:pointer;line-height:1}",
    '.am-croix:hover{background:rgba(11,78,117,.22)}',
    '.am-pied{display:flex;justify-content:center;padding:14px 0 4px;margin-top:10px;',
    'border-top:1px solid #D6F2FF}',
    '.am-fermer{font-family:inherit;font-size:.95rem;font-weight:800;color:#fff;background:#38B6FF;',
    'border:0;border-radius:10px;padding:10px 26px;cursor:pointer}',
    '.am-fermer:hover{background:#1E9BE0}',
    '.am-fermer:focus-visible,.am-croix:focus-visible{outline:3px solid #0B4E75;outline-offset:2px}'
  ].join('');
  document.head.appendChild(css);

  /* ── Texte, selon le mode ──────────────────────────────────────────── */
  var html = '<h4>' + (enLigne ? '🌐 Vous jouez depuis un serveur web'
                                : '💻 Vous jouez depuis un fichier local') + '</h4>';

  if (cfg.charge) {
    var facultatif = cfg.optionnel
      ? ' Ce chargement est facultatif : le jeu fonctionne aussi avec son contenu d\'origine.'
      : '';
    if (enLigne) {
      html += '<p>Pour charger ' + cfg.quoi + ', le bouton <b>« Choisir dans la ' +
        'bibliothèque du site »</b> propose les fichiers fournis avec le site : ' +
        'rien à télécharger au préalable.</p>' +
        '<p>Le bouton plus petit juste en dessous, avec une <b>icône de disque</b>, ' +
        'ouvre le sélecteur de fichiers habituel si vous préférez utiliser ' +
        'un fichier enregistré sur votre propre ordinateur.' + facultatif + '</p>';
    } else {
      // Ouverture locale : la bibliothèque du site n'existe pas, on n'en parle pas.
      html += '<p>Pour charger ' + cfg.quoi + ', le bouton ouvre le sélecteur de ' +
        'fichiers de votre ordinateur. Les fichiers fournis avec les jeux se trouvent ' +
        'dans les sous-dossiers de la collection.' + facultatif + '</p>';
    }
  }

  html += '<p><b>Quitter</b> demande confirmation, puis ferme l\'onglet. Si le ' +
    'navigateur refuse la fermeture, un écran indique que la page peut être fermée, ' +
    'avec un retour possible vers le menu des jeux.</p>';

  var bloc = document.createElement('div');
  bloc.className = 'am-bloc';
  bloc.innerHTML = html;

  // On se place apres le titre du panneau s'il y en a un, sinon tout en haut.
  // Le titre peut etre imbrique : on remonte jusqu'a l'enfant direct du panneau.
  var titre = boite.querySelector('h1, h2, h3, .modal-title');
  var ancre = null;
  while (titre && titre !== boite) {
    if (titre.parentNode === boite) { ancre = titre; break; }
    titre = titre.parentNode;
  }
  if (ancre) ancre.insertAdjacentElement('afterend', bloc);
  else boite.insertBefore(bloc, boite.firstChild);

  /* ── Fermeture uniforme : une croix en haut, un bouton Fermer en bas ── */
  // Certains jeux affichent le voile et le panneau séparément : on ferme les deux.
  var couches = cfg.overlay ? document.querySelectorAll(cfg.overlay) : [];
  var couche  = couches.length ? couches[0] : null;

  function fermerAide() {
    var f = cfg.fermeture || 'style';
    Array.prototype.forEach.call(couches, function (el) {
      if (f === 'style') { el.style.display = 'none'; return; }
      var classe = f.split(':')[1];
      if (classe === 'hidden') el.classList.add('hidden');
      else                     el.classList.remove(classe);
    });
  }

  if (couche) {
    // On cherche dans le panneau ET dans le voile : selon les jeux, le bouton
    // de fermeture est placé dans l'un ou dans l'autre.
    var racines = [boite].concat(Array.prototype.slice.call(couches));
    function chercher(test) {
      var trouve = null;
      racines.forEach(function (r) {
        if (trouve || !r) return;
        Array.prototype.forEach.call(r.querySelectorAll('button, a, .modal-close, .close'), function (b) {
          if (!trouve && test(b)) trouve = b;
        });
      });
      return trouve;
    }

    // Croix : on n'en ajoute une que s'il n'y en a pas déjà.
    var croix = chercher(function (b) {
      var t = (b.textContent || '').trim();
      return t === '✕' || t === '✖' || t === '×' || t === 'X' ||
             /close/i.test(b.className || '');
    });
    if (!croix) {
      var x = document.createElement('button');
      x.type = 'button'; x.className = 'am-croix'; x.textContent = '✕';
      x.setAttribute('aria-label', 'Fermer l\'aide');
      x.addEventListener('click', fermerAide);
      boite.style.position = boite.style.position || 'relative';
      boite.insertBefore(x, boite.firstChild);
    }

    // Bouton Fermer en bas : on n'en ajoute un que s'il n'y en a pas déjà.
    var dejaFermer = chercher(function (b) { return /fermer/i.test(b.textContent || ''); });
    if (!dejaFermer) {
      var pied = document.createElement('div');
      pied.className = 'am-pied';
      var btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'am-fermer'; btn.textContent = '✓ Fermer';
      btn.addEventListener('click', fermerAide);
      pied.appendChild(btn);
      boite.appendChild(pied);
    }
  }

  /* ── Phrases devenues fausses selon le mode ────────────────────────── */
  var regles = enLigne ? cfg.recrire : cfg.recrireLocal;
  if (regles && regles.length) {
    regles.forEach(function (regle) {
      // le plus petit element qui contient encore le marqueur
      var candidats = boite.querySelectorAll('p, div, li');
      var cible = null;
      Array.prototype.forEach.call(candidats, function (el) {
        if (el.classList.contains('am-bloc') || el.querySelector('.am-bloc')) return;
        if ((el.textContent || '').indexOf(regle.marqueur) === -1) return;
        if (!cible || el.textContent.length < cible.textContent.length) cible = el;
      });
      if (cible) cible.innerHTML = regle.html;
    });
  }
})();
