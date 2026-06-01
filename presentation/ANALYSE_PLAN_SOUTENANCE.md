# Analyse du plan de soutenance - Le Canard Dodu

## Avis global

Le plan est **solide et bien structure**. Il suit une logique consultante classique (Diagnostic -> Hypotheses -> Solution -> Demo -> Mise en oeuvre) qui est exactement ce qu'on attend d'un projet MIAGE ISI2. Le fil rouge "resolution du probleme des avoirs" donne une coherence narrative forte.

Cependant, apres croisement avec les 4 dossiers produits (CA, SG, SD, orientations SFD), j'identifie des **points forts**, des **manques** et des **risques** detailles ci-dessous.

---

## I. Contexte et Diagnostic (~4 min) - VERDICT : BON, a preciser

### Ce qui est bien couvert
- Ambition 50 -> 100 M EUR et expansion geo : present dans CA p.3 et SG p.3
- Bases Access fragmentees / fax : CA p.7 (architecture technique)
- Facturation anticipee = point noir : CA p.8, SG p.10 (fiche processus 1)
- 100-200 avoirs/mois : CA p.8

### Ce qui manque ou devrait etre renforce
| Point | Source | Recommandation |
|-------|--------|----------------|
| **Volume d'activite** | CA p.7 : "30 cmd/jour creuse, 100+ en fetes, 5-10 lignes/cmd" | Chiffrer pour montrer la maitrise du contexte metier |
| **Saisonnalite** | CA p.7 : forte saisonnalite (fetes) | Mentionner car c'est le moteur du besoin DW/BI |
| **Agences autonomes** | CA p.3 : Lyon, Strasbourg, Bordeaux + cuisines propres | Le plan mentionne le fax mais pas le probleme de la double saisie agences -> siege |
| **Pierre Pelissier (fondateur) vs Francois Delgas (DG)** | CA p.3 | Attention : le plan dit "Francois Delgas" comme fondateur, or c'est Pierre Pelissier le fondateur. Francois Delgas est le DG actuel |
| **Absence de sauvegarde** | PriseNote.txt ligne 1 | Point critique a mentionner (purges + disquettes zip) |

### Risque oral
Ne pas confondre les noms. Pierre **Pelissier** = fondateur artisan. Francois **Delgas** = DG qui ambitionne les 100 M EUR. Francoise **Delgas-Pelissier** = direction commerciale.

---

## II. Hypotheses et Negociations (~5 min) - VERDICT : TRES BON

### Ce qui est bien couvert
- Focus gestion commerciale, hors comptabilite/production : CA p.11 (section 6.3 Hors Perimetre)
- Cloud N-Tiers : SG p.4 (orientations techniques)
- Autonomie client B2B (self-service) : SG p.3
- Refonte facturation apres expedition : SG p.10 (fiche processus 1), CA p.9

### Ce qui manque
| Point | Source | Recommandation |
|-------|--------|----------------|
| **Verrous metier (concept cle)** | SD p.3, orientations SFD | Le plan ne nomme pas explicitement les 3 verrous (Stock, Logistique, Comptable). C'est votre innovation metier la plus forte. **A nommer.** |
| **Architecture API-First** | SG p.4 | Le plan dit "Cloud N-Tiers" mais pas "API-First" qui est un choix structurant de votre SG |
| **Progiciel comptable conserve** | CA p.4, p.11 | Mentionner que vous ne touchez pas au SI Finance existant (decision de perimetre assumee) |

### Point d'attention
Le plan dit "Fini les avoirs orphelins" -- c'est bien le verrou comptable de la SD (avoir rattache obligatoirement a une facture). Tres bon angle, mais formalisez-le comme un **verrou metier** pour montrer que c'est une regle de gestion implementee, pas juste un voeu pieux.

---

## III. La Solution Proposee (~6 min) - VERDICT : BON, incomplet sur le modele de donnees

### Ce qui est bien couvert
- Portail B2B + stock temps reel : SG p.3, SG p.10
- Multi-TVA, adresses centralisees, remises croisees : CA p.9 (orientations fonctionnelles)
- DW + ETL nocturne : SG p.4, SG p.13 (fiche processus 4)
- Tableaux de bord Francoise / primes : SG p.13

### Ce qui manque
| Point | Source | Recommandation |
|-------|--------|----------------|
| **Modele de classes** | SG p.5 (diagramme complet) | Le plan ne mentionne pas le modele de donnees. En soutenance, montrer le diagramme de classes (meme 30 sec) prouve la rigueur de la modelisation |
| **Modele d'etat-transition** | SG p.23 | Les etats de la commande (EN_PREPARATION -> EXPEDIEE -> FACTUREE) sont un element cle. Un slide rapide serait percutant |
| **Processus Litiges/SAV** | SG p.11 (fiche processus 2) | Le plan n'en parle pas du tout. Or c'est un processus cle que vous avez modelise |
| **4 processus metier** | SG p.9 | Vous avez identifie 4 processus (Cycle de vente, Litiges, Parametrage, BI). Le plan n'en montre que 2 (Vente + BI). Mentionner les 4 meme brievement |

---

## IV. Demonstration (~8 min) - VERDICT : ATTENTION MAJEURE

### Rappel important
Vous dites : "on ne parle pas du site specialement, le site fait office de maquette (remplacement Balsamiq)". C'est la bonne approche. Le site illustre les maquettes F-01 a F-07 du SFD.

### Le plan de demo couvre
- UC_03 (Passer une commande en ligne) : OUI, c'est le CU impose par le SFD
- Parcours client F-01 a F-03 : OUI
- 3 adresses independantes : OUI (DS-04)
- Verrou stock (F-04a) : OUI (DS-08)
- Recapitulatif panier avec TVA/Franco/remises : OUI (DS-12, DS-14)

### Ce qui manque dans le scenario de demo
| Point | Source SFD | Impact |
|-------|-----------|--------|
| **F-02 avant F-03** | SD p.11-12 (diagramme enchaineement) | Le SFD impose : Login -> F-02 (adresses+date) -> Catalogue. Votre plan dit "Etape 1 - parcours F-01 a F-03" sans expliciter que F-02 (adresses) precede le catalogue. **Soyez explicites sur cet ordre.** |
| **Date de livraison (DS-05)** | SD p.5 | Le plan ne mentionne pas la saisie de la date de livraison. C'est une DS a part entiere |
| **Multi-livraisons (DS-06)** | SD p.5 | Le plan ne mentionne pas la possibilite de livraisons fractionnees |
| **Prix remise dans le catalogue (DS-09)** | SD p.5 | Le plan ne dit pas que le prix affiche est le prix remise (pas le prix brut) |
| **Confirmation avec email mock (DS-15)** | SD p.6 | Le plan ne mentionne pas l'ecran de confirmation (F-07) ni l'email |
| **Scenarios alternatifs** | SD p.14 : client non reconnu, stock insuffisant | Le plan couvre le stock insuffisant mais pas le scenario "client non reconnu" (debranchement) |

### Recommandation pour la demo
Structurer la demo exactement sur les ecrans du SFD :

```
F-01 (Login) -> F-02 (3 adresses + date) -> F-03 (Catalogue avec prix remises)
-> F-04 (Fiche produit + ajout) -> F-04a (Alerte stock si rupture)
-> F-05 (Panier avec TVA ventilee, franco, remises)
-> F-06 (Recapitulatif + paiement)
-> F-07 (Confirmation + email mock)
```

Nommer chaque ecran "F-01", "F-02"... pendant la demo pour montrer la tracabilite avec le dossier SD.

---

## V. Mise en oeuvre (~5 min) - VERDICT : BON

### Ce qui est bien couvert
- Budget 136 750 EUR HT : coherent (a verifier avec le dossier budget si vous l'avez)
- Planning 9 mois / 5 phases : OK
- Conduite du changement : OK
- Cas Matthieu Flechard : excellent point, montre la connaissance des acteurs

### Ce qui manque
| Point | Source | Recommandation |
|-------|--------|----------------|
| **Detail des 5 phases** | CA p.10-11 (Lot 1 / Lot 2) | Votre CA distingue Lot 1 (coeur operationnel) et Lot 2 (e-commerce). Nommez-les |
| **Risque humain Matthieu** | Interviews (contexte) | Bien mentionne. Ajouter que l'appui de Francois Delgas (DG) est explicitement requis |
| **ROI** | Plan: "ROI rapide face aux 50 MEUR" | Quantifier : 2 ETP avoirs x 12 mois = ~80-100 kEUR/an economises. Le projet se rembourse en ~18 mois |

---

## VI. Conclusion (~2 min) - VERDICT : OK mais ameliorable

### Suggestion
La phrase "gestion artisanale subie -> pilotage numerique assume" est bonne. Ajoutez une ouverture concrete : "La prochaine etape sera l'internationalisation du portail (Londres, Munich) en s'appuyant sur l'architecture API-First et la gestion multi-devises deja prevue dans notre modele (attribut devise: EUR/GBP)."

---

## RESUME : Checklist finale

| Dimension | Couvert ? | Action |
|-----------|-----------|--------|
| Enjeux strategiques (50->100 MEUR) | OUI | Chiffrer les volumes |
| Dysfonctionnements (avoirs, Access, fax) | OUI | Ajouter absence sauvegarde |
| Perimetre (hors comptabilite/production) | OUI | OK |
| 3 Verrous metier | PARTIELLEMENT | **Nommer explicitement** |
| Architecture Cloud + API-First | PARTIELLEMENT | Ajouter API-First |
| Modele de classes | NON | Montrer 30 sec en slide |
| 4 processus metier | PARTIELLEMENT | Nommer les 4 |
| Demo UC_03 (flux F-01 a F-07) | PARTIELLEMENT | **Respecter l'ordre SFD, nommer les ecrans** |
| DS-05 date livraison | NON | Ajouter a la demo |
| DS-06 multi-livraisons | NON | Mentionner au moins |
| DS-09 prix remise catalogue | NON | Ajouter a la demo |
| DS-15 confirmation + email | NON | Ajouter a la demo |
| Budget + ROI | PARTIELLEMENT | Quantifier le ROI |
| Conduite du changement | OUI | OK, tres bon |
| Planning par lots | PARTIELLEMENT | Nommer Lot 1 / Lot 2 |

## Priorites d'amelioration (top 5)

1. **Nommer les 3 verrous metier** -- c'est votre innovation principale
2. **Structurer la demo sur F-01 a F-07** avec les numeros d'ecrans SFD
3. **Ajouter date de livraison et prix remise** au scenario de demo
4. **Montrer le diagramme de classes** (30 sec) pour prouver la modelisation
5. **Quantifier le ROI** (economies avoirs = ~100 kEUR/an -> remboursement en 18 mois)
