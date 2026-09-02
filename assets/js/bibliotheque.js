/* =========================================================================
   BIBLIOTHEQUE EN LIGNE
   -------------------------------------------------------------------------
   Sur un site web (GitHub Pages, serveur local...), un navigateur ne peut pas
   aller chercher tout seul un fichier sur le disque de l'utilisateur : les
   boutons "Choisir un fichier" des jeux ouvrent donc un selecteur local, ce
   qui n'a pas de sens pour un visiteur qui n'a pas les fichiers.

   Ce script ajoute un bouton "Bibliotheque en ligne" a cote du bouton
   d'origine. Il liste les fichiers livres avec le site, telecharge celui que
   l'on choisit, puis l'injecte dans le champ <input type="file"> du jeu
   exactement comme si l'utilisateur l'avait selectionne lui-meme.
   Le code des jeux n'a pas besoin d'etre modifie.

   Le bouton n'apparait qu'en http:// ou https:// : en ouverture locale
   (file://) le navigateur interdit ces telechargements, et le bouton
   d'origine suffit de toute facon.

   Mise en place dans une page de jeu, juste avant </body> :
     <script src="../assets/js/bibliotheque.js" data-jeu="motus"></script>
   ========================================================================= */
(function () {
  'use strict';

  var script = document.currentScript;
  if (!script) return;
  var cle = script.getAttribute('data-jeu');
  var base = script.getAttribute('data-base') || '../';

  // La bibliotheque n'a de sens que servie par un serveur web.
  if (location.protocol !== 'http:' && location.protocol !== 'https:') return;

  var CFG = {
    anagramme:    { input:'#file-input',  ancre:'#file-name',                   type:'xml', titre:"Listes d'anagrammes" },
    motsmasques:  { input:'#file-input',  ancre:'button[onclick*="file-input"]',type:'xml', titre:'Textes et citations' },
    puzzle:       { input:'#file-input',  ancre:'#upload-hint',                 type:'image', titre:'Photos' },
    taquin:       { input:'#inp-img-file',ancre:'#btn-img-file',                type:'image', titre:'Photos' },
    editeurana:   { input:'#fileInput',   ancre:'button[onclick*="openXML"]',   type:'xml', titre:"Listes d'anagrammes" },
    editeurcit:   { input:'#fileInput',   ancre:'button[onclick*="openXML"]',   type:'xml', titre:'Textes et citations' }
  };

  var cfg = CFG[cle];
  var liste = (window.__RESSOURCES__ || {})[cle];
  if (!cfg || !liste || !liste.length) return;

  /* ── Styles (charte graphique commune) ─────────────────────────────── */
  var css = document.createElement('style');
  css.textContent = [
    '.bib-btn{font:inherit;font-weight:700;font-size:.9rem;color:#0B4E75;background:#fff;',
    'border:2px solid #38B6FF;border-radius:9px;padding:7px 14px;margin:6px 0 0;cursor:pointer;',
    'display:inline-block;transition:background .18s ease,border-color .18s ease}',
    '.bib-btn:hover{background:#E1F4FF;border-color:#0B4E75}',
    '.bib-btn:focus-visible{outline:3px solid #0B4E75;outline-offset:2px}',
    '.bib-ov{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;',
    'background:rgba(4,40,64,.55);backdrop-filter:blur(3px);padding:18px}',
    '.bib-ov[hidden]{display:none}',
    '.bib-box{background:#fff;border-radius:18px;max-width:760px;width:100%;max-height:86vh;',
    'display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 50px rgba(0,50,90,.4);',
    "font-family:'Nunito','Segoe UI','Trebuchet MS',Arial,sans-serif;color:#0B4E75}",
    '.bib-head{background:#38B6FF;color:#fff;padding:14px 20px;display:flex;align-items:center;gap:12px}',
    '.bib-head h3{margin:0;font-size:1.1rem;font-weight:800;flex:1}',
    '.bib-close{background:rgba(255,255,255,.2);border:0;color:#fff;font-size:1.1rem;line-height:1;',
    'width:32px;height:32px;border-radius:8px;cursor:pointer}',
    '.bib-close:hover{background:rgba(255,255,255,.35)}',
    '.bib-body{padding:16px 20px 20px;overflow:auto}',
    '.bib-grid{list-style:none;margin:0;padding:0;display:grid;gap:12px;',
    'grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}',
    '.bib-item{display:flex;flex-direction:column;gap:8px;align-items:stretch;width:100%;',
    'background:#E1F4FF;border:1px solid #8FDCFF;border-radius:12px;padding:9px;cursor:pointer;',
    'font:inherit;color:inherit;text-align:left;transition:transform .15s ease,border-color .15s ease}',
    '.bib-item:hover{transform:translateY(-3px);border-color:#38B6FF;background:#fff}',
    '.bib-item:focus-visible{outline:3px solid #0B4E75;outline-offset:2px}',
    '.bib-item img{width:100%;height:92px;object-fit:cover;border-radius:8px;background:#C2F6FF;display:block}',
    '.bib-item .bib-doc{height:92px;border-radius:8px;background:#C2F6FF;display:flex;align-items:center;',
    'justify-content:center;font-size:2.2rem}',
    '.bib-item b{font-size:.8rem;font-weight:700;overflow-wrap:anywhere;line-height:1.3}',
    '.bib-note{margin:0 0 14px;font-size:.85rem;line-height:1.5;color:#2A6E96}',
    '.bib-state{padding:14px 0;font-size:.9rem;font-weight:700}',
    '@media (prefers-reduced-motion:reduce){.bib-item:hover{transform:none}}'
  ].join('');
  document.head.appendChild(css);

  /* ── Bouton d'appel ────────────────────────────────────────────────── */
  var input = document.querySelector(cfg.input);
  var ancre = document.querySelector(cfg.ancre);
  if (!input || !ancre) return;

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'bib-btn';
  btn.textContent = '🌐 Bibliothèque en ligne';
  btn.title = 'Choisir un fichier fourni avec le site, sans rien télécharger au préalable';
  ancre.insertAdjacentElement('afterend', btn);

  /* ── Fenetre de choix ──────────────────────────────────────────────── */
  var ov = document.createElement('div');
  ov.className = 'bib-ov';
  ov.hidden = true;
  ov.innerHTML =
    '<div class="bib-box" role="dialog" aria-modal="true" aria-label="Bibliothèque en ligne">' +
      '<div class="bib-head"><h3>' + cfg.titre + '</h3>' +
      '<button class="bib-close" type="button" aria-label="Fermer">✕</button></div>' +
      '<div class="bib-body">' +
        '<p class="bib-note">Ces fichiers sont fournis avec le site. Choisis‑en un : ' +
        'il sera chargé dans le jeu comme si tu l\'avais sélectionné sur ton ordinateur.</p>' +
        '<ul class="bib-grid"></ul><div class="bib-state" hidden></div>' +
      '</div></div>';
  document.body.appendChild(ov);

  var grille = ov.querySelector('.bib-grid');
  var etat = ov.querySelector('.bib-state');

  liste.forEach(function (res) {
    var li = document.createElement('li');
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'bib-item';
    var url = base + res;
    if (cfg.type === 'image') {
      var img = document.createElement('img');
      img.src = url; img.alt = ''; img.loading = 'lazy';
      b.appendChild(img);
    } else {
      var d = document.createElement('span');
      d.className = 'bib-doc'; d.textContent = '📄';
      b.appendChild(d);
    }
    var nom = document.createElement('b');
    nom.textContent = res.split('/').pop();
    b.appendChild(nom);
    b.addEventListener('click', function () { charger(url, res.split('/').pop()); });
    li.appendChild(b);
    grille.appendChild(li);
  });

  function ouvrir()  { ov.hidden = false; etat.hidden = true; ov.querySelector('.bib-item').focus(); }
  function fermer()  { ov.hidden = true; btn.focus(); }

  btn.addEventListener('click', ouvrir);
  ov.querySelector('.bib-close').addEventListener('click', fermer);
  ov.addEventListener('click', function (e) { if (e.target === ov) fermer(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !ov.hidden) { e.stopPropagation(); fermer(); }
  }, true);

  /* ── Telechargement puis injection dans le champ du jeu ────────────── */
  function charger(url, nom) {
    etat.hidden = false;
    etat.textContent = 'Chargement de ' + nom + '…';
    fetch(url, { cache: 'force-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.blob();
      })
      .then(function (blob) {
        var fichier = new File([blob], nom, { type: blob.type || 'application/octet-stream' });
        var dt = new DataTransfer();
        dt.items.add(fichier);
        input.files = dt.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        fermer();
      })
      .catch(function (err) {
        etat.textContent = 'Impossible de charger ' + nom + ' (' + err.message +
          '). Vérifie que le fichier est bien présent sur le site.';
      });
  }
})();
