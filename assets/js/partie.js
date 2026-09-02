/* =========================================================================
   SAUVEGARDER ET REPRENDRE UNE PARTIE
   -------------------------------------------------------------------------
   Chaque jeu gérait la sauvegarde à sa façon : le Taquin et le Jeu de Mot
   demandaient un nom de fichier, la Mémoire non, le Puzzle téléchargeait
   directement sans rien demander. Les messages de fin différaient aussi.

   Ce module impose partout le même déroulé :

     1. le fichier est écrit directement, sous un nom horodaté — aucune
        question n'est posée au joueur ;
     2. une fenêtre indique ensuite le nom du fichier et le dossier où il a
        été déposé.

   Sur l'emplacement : pour des raisons de sécurité, aucun navigateur ne
   communique le chemin complet du fichier à la page. Le module affiche donc
   le dossier de téléchargements sous la forme la plus proche possible du
   chemin réel, en précisant que c'est une indication.

   La reprise suit le même principe : sélection du fichier, contrôle du
   contenu, puis une fenêtre unique qui confirme ou explique le refus.

   Mise en place, juste avant </body> :
     <script src="../assets/js/partie.js" data-base="../"></script>

   Utilisation depuis le jeu :
     Partie.enregistrer({ json, nomPropose, jeu:'Taquin' });
     Partie.confirmerReprise({ nomFichier, resume:'Partie du 12/03 — 24 coups' });
     Partie.refuserReprise({ nomFichier, raison:'…' });
   ========================================================================= */
(function () {
  'use strict';

  /* ── Styles, dans la charte du site ────────────────────────────────── */
  var css = document.createElement('style');
  css.textContent = [
    '.pa-ov{position:fixed;inset:0;z-index:99997;display:flex;align-items:flex-end;',
    'justify-content:center;background:rgba(4,40,64,.55);backdrop-filter:blur(3px);',
    'padding:18px 18px 6vh}',
    '@media (max-height:520px){.pa-ov{align-items:center;padding-bottom:18px}}',
    '.pa-ov[hidden]{display:none}',
    '.pa-box{background:#fff;border-radius:18px;max-width:470px;width:100%;padding:24px 24px 20px;',
    'box-shadow:0 20px 50px rgba(0,50,90,.4);color:#0B4E75;',
    "font-family:'Nunito','Segoe UI','Trebuchet MS',Arial,sans-serif;text-align:left}",
    '.pa-box h2{margin:0 0 8px;font-size:1.2rem;font-weight:800;display:flex;align-items:center;gap:9px}',
    '.pa-box p{margin:0 0 14px;font-size:.92rem;line-height:1.55;color:#2A6E96}',
    '.pa-box label{display:block;font-size:.82rem;font-weight:800;margin:0 0 5px;color:#0B4E75}',
    '.pa-box input{width:100%;font:inherit;font-size:.95rem;padding:9px 12px;border-radius:9px;',
    'border:2px solid #8FDCFF;color:#0B4E75;background:#fff}',
    '.pa-box input:focus{outline:none;border-color:#38B6FF;box-shadow:0 0 0 3px rgba(56,182,255,.25)}',
    '.pa-hint{font-size:.78rem;color:#2A6E96;margin:6px 0 0;line-height:1.45}',
    '.pa-lieu{background:#E1F4FF;border:1px solid #8FDCFF;border-left:5px solid #38B6FF;',
    'border-radius:9px;padding:11px 13px;margin:0 0 14px;font-size:.86rem;line-height:1.55;',
    'word-break:break-word}',
    '.pa-lieu b{font-weight:800}',
    '.pa-row{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;margin-top:16px}',
    '.pa-btn{font:inherit;font-weight:800;font-size:.92rem;border-radius:10px;padding:10px 18px;',
    'cursor:pointer;border:2px solid transparent}',
    '.pa-no{background:#E1F4FF;color:#0B4E75;border-color:#8FDCFF}',
    '.pa-no:hover{background:#C2F6FF}',
    '.pa-yes{background:#0B4E75;color:#fff}',
    '.pa-yes:hover{background:#38B6FF}',
    '.pa-btn:focus-visible,.pa-box input:focus-visible{outline:3px solid #0B4E75;outline-offset:2px}'
  ].join('');
  document.head.appendChild(css);

  /* ── Fenêtre générique ─────────────────────────────────────────────── */
  function fenetre(opts) {
    var ov = document.createElement('div');
    ov.className = 'pa-ov';
    ov.innerHTML = '<div class="pa-box" role="dialog" aria-modal="true">' +
      '<h2>' + opts.titre + '</h2>' + opts.corps +
      '<div class="pa-row"></div></div>';
    var rangee = ov.querySelector('.pa-row');
    (opts.boutons || []).forEach(function (b) {
      var el = document.createElement('button');
      el.type = 'button';
      el.className = 'pa-btn ' + (b.principal ? 'pa-yes' : 'pa-no');
      el.textContent = b.label;
      el.addEventListener('click', function () { ov.remove(); if (b.action) b.action(ov); });
      rangee.appendChild(el);
    });
    document.body.appendChild(ov);
    ov.addEventListener('click', function (e) {
      if (e.target === ov && opts.fermable !== false) ov.remove();
    });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape' && document.body.contains(ov)) {
        e.stopPropagation(); ov.remove(); document.removeEventListener('keydown', esc, true);
      }
    }, true);
    return ov;
  }

  function nettoyerNom(nom) {
    nom = String(nom || '').trim().replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
    if (!/\.json$/i.test(nom)) nom += '.json';
    return nom;
  }

  /* ── Écriture directe, puis confirmation ───────────────────────────── */
  function enregistrer(opts) {
    telecharger(nettoyerNom(opts.nomPropose || 'partie.json'), opts);
  }

  function telecharger(nom, opts) {
    try {
      var blob = new Blob([opts.json], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = nom;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
      confirmerEnregistrement(nom);
    } catch (err) {
      fenetre({
        titre: '⚠️ Sauvegarde impossible',
        corps: '<p>Le fichier n\'a pas pu être écrit.<br>Détail : ' + String(err.message || err) + '</p>',
        boutons: [{ label: 'Fermer', principal: true }]
      });
    }
  }

  // Chemin vraisemblable du dossier de téléchargements, d'après le système.
  // C'est une indication : la page n'a pas accès au chemin réel.
  function dossierProbable() {
    var ua = navigator.userAgent || '';
    if (/Windows/i.test(ua))          return 'C:\\Users\\&lt;votre nom&gt;\\Downloads';
    if (/Macintosh|Mac OS X/i.test(ua)) return '/Users/&lt;votre nom&gt;/Downloads';
    if (/Android/i.test(ua))          return '/storage/emulated/0/Download';
    if (/iPhone|iPad/i.test(ua))      return 'Fichiers › Téléchargements';
    if (/Linux/i.test(ua))            return '/home/&lt;votre nom&gt;/Téléchargements';
    return 'le dossier de téléchargements de votre navigateur';
  }

  function confirmerEnregistrement(nom) {
    fenetre({
      titre: '✅ Partie sauvegardée',
      corps:
        '<div class="pa-lieu"><b>Fichier :</b> ' + nom + '<br>' +
        '<b>Dossier :</b> ' + dossierProbable() + '</div>' +
        '<p class="pa-hint">Le navigateur ne communique pas le chemin exact à la page : ' +
        'le dossier ci-dessus est celui utilisé par défaut. Pour le chemin réel, ouvrez la ' +
        'liste des téléchargements du navigateur avec <b>Ctrl</b> + <b>J</b>.</p>',
      boutons: [{ label: 'Fermer', principal: true }]
    });
  }

  /* ── Reprise d'une partie ──────────────────────────────────────────── */
  function confirmerReprise(opts) {
    fenetre({
      titre: '📂 Partie reprise',
      corps: '<div class="pa-lieu"><b>Fichier :</b> ' + (opts.nomFichier || 'sauvegarde') +
             (opts.resume ? '<br><b>Contenu :</b> ' + opts.resume : '') + '</div>' +
             '<p>La partie reprend là où elle s\'était arrêtée.</p>',
      boutons: [{ label: 'Continuer', principal: true, action: opts.apres }]
    });
  }

  function refuserReprise(opts) {
    fenetre({
      titre: '⚠️ Reprise impossible',
      corps: '<div class="pa-lieu"><b>Fichier :</b> ' + (opts.nomFichier || 'sauvegarde') + '</div>' +
             '<p>' + (opts.raison || 'Ce fichier ne correspond pas à une sauvegarde de ce jeu.') + '</p>' +
             '<p class="pa-hint">Choisissez un fichier <b>.json</b> créé par « Sauvegarder partie » ' +
             'dans ce même jeu.</p>',
      boutons: [{ label: 'Fermer', principal: true }]
    });
  }

  window.Partie = {
    enregistrer: enregistrer,
    confirmerReprise: confirmerReprise,
    refuserReprise: refuserReprise,
    fenetre: fenetre
  };
})();
