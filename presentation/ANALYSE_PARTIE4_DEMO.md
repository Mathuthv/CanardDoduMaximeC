# Analyse de la Partie IV - Demo (~8 min prevu, 10 min disponibles)

## 1. Faisabilite : ce que le site couvre aujourd'hui

| Element du plan | Faisable ? | Ecran site | Remarque |
|-----------------|-----------|------------|----------|
| F-01 Login | OUI | `/login` | Login + verrouillage 3 tentatives |
| 3 adresses (Acheteur, Livraison, Facturation) | OUI | `/commande/preparation` (F-02) | Bien present depuis l'alignement SFD |
| F-03 Catalogue | OUI | `/catalogue` | Prix remises affiches, badges stock |
| F-04 Fiche produit + ajout panier | OUI | `/catalogue/:ref` | Prix remise, quantite controlee |
| F-04a Alerte rupture stock | OUI | `/catalogue/:ref` | VerrouBanner + substitution meme famille |
| F-05 Panier (TVA, Franco, remises) | OUI | `/panier` | TVA ventilee, franco, message "plus que X EUR" |
| F-06 Recapitulatif + paiement | OUI | `/commande/checkout` | Stepper, re-verif stock, echec paiement |
| F-07 Confirmation + email mock | OUI | `/commande/confirmation/:num` | Date livraison, email anime |
| Date de livraison (DS-05) | OUI | `/commande/preparation` | Champ date J+2 minimum |
| Multi-livraisons (DS-06) | PARTIEL | `/commande/preparation` | Toggle "livraison fractionnee" present |
| Prix remise dans catalogue (DS-09) | OUI | `/catalogue` | Prix barre + prix remise + badge % |
| Substitution produit (C2) | OUI | `/catalogue/:ref` | Section "Produits de substitution" si rupture |
| Verrou Stock | OUI | `/catalogue/:ref` | Banniere doree mode demo |
| Verrou Logistique | OUI | `/back-office/facturation` | Bouton grise si non expedie |
| Verrou Comptable | OUI | `/back-office/avoirs` | Banniere si pas de facture selectionnee |
| Simulation echec paiement (A8) | OUI | `/commande/checkout` | Checkbox "Simuler un echec" |

**Verdict : TOUT est faisable. Le site couvre 100% de ce que le plan demande, et meme plus.**

---

## 2. Probleme : le plan actuel est trop court et trop vague pour 10 minutes

### Ce que le plan couvre actuellement (3 etapes)
1. Parcours F-01 a F-03 + 3 adresses
2. F-04a alerte stock
3. F-05 panier (TVA, Franco, remises)

### Ce qui manque (que le site SAIT deja montrer)
- **F-02** : Date de livraison + selection des 3 adresses AVANT le catalogue (c'est l'ordre SFD)
- **DS-09** : Prix remise affiche dans le catalogue (pas juste le prix brut)
- **Substitution** : Quand un produit est en rupture, proposition de substitut
- **F-06** : Recapitulatif complet avec re-verification stock temps reel
- **F-06** : Scenario echec paiement (A8) - retour panier + liberation stock
- **F-07** : Ecran de confirmation avec date de livraison + notification email mock
- **Verrou Logistique** : Montrer que la facturation est bloquee tant que la logistique n'a pas valide
- **Verrou Comptable** : Montrer qu'un avoir ne peut pas etre cree sans facture

### Conclusion
Avec seulement 3 etapes, tu fais ~4-5 minutes de demo, pas 10. Tu as la matiere pour bien remplir les 10 minutes.

---

## 3. Plan de demo ameliore (10 minutes)

### Intro (1 min)
> "Je vais vous montrer le cas d'utilisation UC_03 : Passer une commande en ligne.
> Ce parcours illustre la resolution de notre probleme principal — la facturation anticipee —
> grace aux 3 verrous metier que nous avons concus : le Verrou de Stock, le Verrou Logistique,
> et le Verrou Comptable. Nous avons choisi de realiser une maquette interactive plutot que
> des wireframes Balsamiq pour rendre la demonstration plus vivante."

### Etape 1 - Connexion et preparation (1 min 30)
**Ecrans : F-01 + F-02**
- Se connecter avec `client@latabledoor.fr` / `demo2026`
- Arriver sur F-02 : montrer les 3 adresses (acheteur en lecture seule, livraison selectionnee, facturation centralisee)
- Saisir la date de livraison souhaitee
- **Ce qu'on prouve** : DS-01 (identification client), DS-04 (3 adresses independantes), DS-05 (date de livraison)

### Etape 2 - Catalogue et prix personnalises (1 min 30)
**Ecrans : F-03 + F-04**
- Naviguer dans le catalogue
- Montrer que les prix affiches sont DEJA remises pour La Table d'Or (-15% fidelite)
- Montrer les badges de stock (vert, orange, rouge)
- Cliquer sur un produit en stock : montrer la fiche avec prix barre + prix remise
- Ajouter au panier -> micro-etat "Verification du stock..."
- **Ce qu'on prouve** : DS-07 (recherche produit), DS-09 (prix remise), DS-08 (verification stock temps reel)

### Etape 3 - Verrou de Stock + Substitution (1 min 30)
**Ecran : F-04 + F-04a**
- Aller sur un produit en rupture (FG-003 Foie gras d'oie truffe : stock = 0)
- Montrer le Verrou de Stock : banniere doree, bouton "Ajouter au panier" grise
- Montrer la section "Produits de substitution" : le systeme propose automatiquement des produits de la meme famille en stock
- Aller sur un produit a stock faible (FG-002 : stock = 80) : tenter de saisir une quantite > stock
- Montrer le blocage : "Quantite maximale disponible : 80"
- **Ce qu'on prouve** : DS-08 (controle bloquant), scenarios A2/A3 du CU

### Etape 4 - Panier et moteur de calcul (2 min)
**Ecran : F-05**
- Montrer le panier avec les lignes ajoutees
- Pointer les remises appliquees automatiquement (-15% fidelite)
- Montrer la ventilation TVA : 5,5% alimentaire + 20% vins
- Montrer le message "Plus que X EUR pour la livraison offerte" ou "Franco de port" si seuil atteint
- Modifier une quantite pour montrer le recalcul en temps reel
- **Ce qu'on prouve** : DS-10 (remises), DS-12 (franco de port), REC-03 (multi-TVA)

### Etape 5 - Recapitulatif et Paiement (1 min 30)
**Ecran : F-06**
- Cliquer "Valider ma commande"
- Montrer le recapitulatif : rappel des 3 adresses, date de livraison, toutes les lignes, totaux
- Cliquer "Proceder au paiement" -> montrer le micro-etat "Verification du stock en temps reel..."
- Simuler un echec de paiement (cocher la case) -> montrer le message d'erreur et le retour panier
- Decocher, repayer -> succes
- **Ce qu'on prouve** : DS-14 (recapitulatif), DS-15 (validation), A4 (re-verif stock), A8 (echec paiement)

### Etape 6 - Confirmation (30 sec)
**Ecran : F-07**
- Montrer le numero de commande attribue, le statut EN_PREPARATION
- Montrer la date de livraison choisie
- Montrer l'animation email de confirmation "Envoi de l'email... -> Email envoye a commandes@latabledoor.fr"
- **Ce qu'on prouve** : DS-15 (enregistrement + email), transmission a la logistique

### Conclusion demo (30 sec)
> "Vous avez vu le parcours complet du client. La commande est maintenant en preparation
> chez Matthieu Flechard. La facture ne pourra etre emise qu'apres que Matthieu aura valide
> les quantites reellement expediees — c'est notre Verrou Logistique. Et si le client signale
> un litige, l'avoir devra obligatoirement etre rattache a cette facture — c'est notre Verrou Comptable.
> C'est comme ca qu'on eradique les 200 avoirs par mois."

---

## 4. Produits a utiliser pour la demo

Pour que la demo soit fluide, utilise ces produits prepares dans le jeu de donnees :

| Produit | Ref | Interet demo |
|---------|-----|-------------|
| Foie gras d'oie truffe 400g | FG-003 | **Rupture** (stock=0) -> Verrou Stock + substitution |
| Bloc de foie gras 300g | FG-002 | **Stock faible** (stock=80) -> test limite quantite |
| Foie gras entier mi-cuit 500g | FG-001 | Stock OK -> ajout normal |
| Sauternes Grand Cru 75cl | VN-001 | **TVA 20%** -> demo multi-TVA |
| Cassoulet confit canard 800g | PC-001 | **TVA 5,5%** -> contraste TVA |

### Client a utiliser
- **La Table d'Or** (`client@latabledoor.fr` / `demo2026`) : client chaine avec remise 15%, 3 adresses de livraison, facturation centralisee

---

## 5. Checklist pre-demo

- [ ] Ouvrir le site sur `http://localhost:5173` AVANT la soutenance
- [ ] Se deconnecter pour partir de F-01 (login)
- [ ] Vider le panier (refresh la page suffit, le state est en memoire)
- [ ] Verifier que FG-003 est bien a stock=0 dans les donnees
- [ ] Preparer un navigateur en plein ecran, police lisible
- [ ] Desactiver les notifications du Mac
- [ ] Avoir le plan de demo imprime devant toi

---

## 6. Risques et parades

| Risque | Parade |
|--------|--------|
| Le site ne se lance pas | Avoir des screenshots de chaque ecran en backup (PDF) |
| Bug en live | Dire "comme vous le voyez, c'est une maquette interactive, l'essentiel est de montrer le flux" et passer a l'ecran suivant |
| Depassement de temps | Les etapes 5-6 peuvent etre compressees (paiement + confirmation en 1 min) |
| Question "c'est un vrai site ?" | "Non, c'est une maquette interactive haute-fidelite qui remplace les wireframes Balsamiq. Les donnees sont mockees en memoire, il n'y a pas de backend." |
