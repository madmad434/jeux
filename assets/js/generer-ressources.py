#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Regenere assets/js/ressources.js a partir du contenu reel des dossiers.

A relancer apres avoir ajoute ou retire une photo dans JeuPuzzle/Images
ou un fichier XML dans Mots/ FichiersMots/ Textes/ :

    python3 assets/js/generer-ressources.py

(depuis la racine du site). Puis recommiter le fichier ressources.js.
"""
import json
import os
import sys

RACINE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

# cle de bibliotheque -> (dossier a scanner, extensions acceptees)
SOURCES = {
    "anagramme":    ("JeuAnagramme/Mots",         (".xml",)),
    "motsmasques":  ("JeuMotsMasques/Textes",     (".xml",)),
    "puzzle":       ("JeuPuzzle/Images",          (".jpg", ".jpeg", ".png", ".webp", ".gif")),
    "taquin":       ("JeuPuzzle/Images",          (".jpg", ".jpeg", ".png", ".webp", ".gif")),
    "editeurana":   ("JeuAnagramme/Mots",         (".xml",)),
    "editeurcit":   ("JeuMotsMasques/Textes",     (".xml",)),
}


def lister(dossier, exts):
    chemin = os.path.join(RACINE, dossier)
    if not os.path.isdir(chemin):
        print("  ! dossier absent :", dossier, file=sys.stderr)
        return []
    noms = [f for f in os.listdir(chemin)
            if os.path.splitext(f)[1].lower() in exts and not f.startswith(".")]
    return sorted(noms, key=str.lower)


def main():
    data = {}
    for cle, (dossier, exts) in SOURCES.items():
        noms = lister(dossier, exts)
        # chemins toujours donnes depuis la racine du site
        data[cle] = [dossier + "/" + n for n in noms]
        print("  %-14s %2d fichier(s)" % (cle, len(noms)))

    sortie = os.path.join(RACINE, "assets", "js", "ressources.js")
    with open(sortie, "w", encoding="utf-8") as f:
        f.write("/* Genere par assets/js/generer-ressources.py — ne pas editer a la main. */\n")
        f.write("window.__RESSOURCES__ = ")
        f.write(json.dumps(data, ensure_ascii=False, indent=2))
        f.write(";\n")
    print("→", os.path.relpath(sortie, RACINE))


if __name__ == "__main__":
    main()
