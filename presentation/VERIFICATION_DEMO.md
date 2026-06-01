# Verification demo — Faisabilite technique de chaque etape

## Verdict global : TOUT EST FAISABLE, 2 points d'attention mineurs

---

## Etape 1 — Connexion et preparation (F-01 + F-02)

### Login `client@latabledoor.fr` / `demo2026`
- **Compte** : OK — `comptes.ts` ligne 4, login exact, mot de passe `demo2026`
- **Redirection** : OK — `LoginPage.tsx` redirige vers `/commande/preparation` (F-02) apres login
- **Indice sur la page** : OK — le texte "Demo : email = client@latabledoor.fr / mot de passe = demo2026" est affiche

### F-02 DeliverySetupPage
- **3 adresses CLI-001** : OK
  - Acheteur (lecture seule) : "La Table d'Or — Groupe", "Marie Fontaine", SIRET
  - Livraison (select) : Paris 8e / Lyon 2e / Bordeaux — 3 options
  - Facturation (lecture) : "La Table d'Or — Siege, 24 rue du Faubourg Saint-Honore, 75008 Paris"
- **Date livraison** : OK — champ date, minimum J+2 jours ouvres, controle actif
- **Bouton continuer** : OK — redirige vers `/catalogue`

**AUCUN PROBLEME**

---

## Etape 2 — Catalogue et prix personnalises (F-03 + F-04)

### Prix remises affiches
- **REM-001** : 15% fidelite pour CLI-001, valide 2026-01-01 au 2026-12-31, pas de filtre produit
- **Resultat** : TOUS les produits affichent -15% pour La Table d'Or
- **Exemples concrets** :
  - FG-001 (89.90 EUR) → affiche 76.42 EUR HT (barre 89.90, badge -15%)
  - VN-001 (32.00 EUR) → affiche 27.20 EUR HT (barre 32.00, badge -15%)
  - CH-001 (24.90 EUR) → affiche 21.17 EUR HT
- **Code** : `CatalogPage.tsx` passe `remiseTaux={getRemiseTaux(product.reference)}` a chaque ProductCard
- **ProductCard** : affiche prix barre + prix remise + badge "-15%"

### Badges stock
- FG-001 stock=45 → badge vert "En stock (45)"
- FG-003 stock=0 → badge rouge "Rupture de stock"
- CH-002 stock=5 → badge orange "Stock faible (5)"
- VN-004 stock=3 → badge orange "Stock faible (3)"

### Micro-etat ajout panier
- `ProductDetailPage.tsx` : affiche "Verification du stock en cours..." pendant 500ms avant confirmation

**AUCUN PROBLEME**

---

## Etape 3 — Verrou de Stock + Substitution (F-04 + F-04a)

### Rupture totale FG-003
- **Stock** : 0 dans `products.ts` ligne 7
- **VerrouBanner** : OK — banniere doree "Ce produit est actuellement en rupture de stock"
- **Bouton grise** : OK — `disabled={!stockCheck.allowed}` quand stock <= 0

### Substitution
- **Code** : `substitutionProducts` filtre meme categorie (FOIE_GRAS) avec stock > 0
- **Resultat pour FG-003** : proposera FG-001 (stock 45), FG-002 (stock 80), FG-004 (stock 120) — 3 substituts
- **Affichage** : section "Produits de substitution (meme famille)" avec boutons cliquables

### Blocage quantite > stock
- **Exemple** : FG-002 stock=80, saisir qty=90 → `canAddToCart` retourne `{ allowed: false, message: "Quantite maximale disponible : 80" }`
- **Input HTML** : `max={product.stockPhysiqueDisponible}` empeche la saisie au-dela
- **VerrouBanner** : s'affiche si `!stockCheck.allowed`

**AUCUN PROBLEME**

---

## Etape 4 — Panier et moteur de calcul (F-05)

### Remises appliquees
- CLI-001 beneficie de REM-001 (15% fidelite) sur tous les produits
- `CartPage` affiche `RemiseBadge` pour chaque ligne

### Multi-TVA
- FG-001 → codeTVA = TVA_5_5 (5,5%)
- VN-001 → codeTVA = TVA_20 (20%)
- `TVABreakdown` affiche deux lignes distinctes

### Franco de port
- **Seuil** : francoSeuil = 500 EUR HT (configStore)
- **Frais** : fraisPort = 25 EUR HT
- **Scenario demo** : FG-001 x1 (76.42 HT) + VN-001 x6 (163.20 HT) = 239.62 HT < 500
  → Message "Plus que 260.38 EUR HT pour la livraison offerte !" AFFICHE
- **Si on ajoute plus** : FG-001 x5 (382.08) + VN-001 x6 (163.20) = 545.28 > 500
  → Badge "Franco de port" AFFICHE
- **Code** : `calcFrancoManquant` + message dans CartPage verifie

### Recalcul temps reel
- Modifier une quantite → `updateQty` → `getCartTotals` recalcule tout

**AUCUN PROBLEME**

---

## Etape 5 — Recapitulatif et Paiement (F-06)

### Rappel 3 adresses
- `CheckoutPage` lit `delivery` du cartStore
- Affiche acheteur, livraison, facturation dans 3 blocs + date livraison

### Re-verification stock (A4)
- `handleGoToPayment` appelle `verifyCartStock` avec un delai de 800ms
- Affiche "Verification du stock en temps reel..."
- Si stock insuffisant → VerrouBanner + Alert par produit concerne

### Simulation echec paiement (A8)
- Checkbox "Simuler un echec de paiement (A8)" presente
- Si cochee → message "Paiement refuse par la banque. Votre commande a ete annulee et le stock libere."
- `revertToCart` supprime la commande du store
- Le panier est CONSERVE (le client peut reessayer)
- Si decochee et relance → paiement reussit → navigation vers F-07

### Statut final
- `advanceStatus(commande.numCommande, StatutCommande.EN_PREPARATION)` — conforme DS-15

**AUCUN PROBLEME**

---

## Etape 6 — Confirmation (F-07)

### Numero de commande
- Genere automatiquement : `CMD-2026-008` (8e commande apres les 7 du seed)

### Date de livraison
- `commande.dateLivraisonSouhaitee` affichee via `formatDate`

### Email mock
- Animation : "Envoi de l'email de confirmation..." pendant 2 secondes
- Puis : "Un email de confirmation a ete envoye a commandes@latabledoor.fr"
- `currentClient.email` = `commandes@latabledoor.fr` pour CLI-001

### Adresse de livraison
- Affichee depuis `currentClient.adressesLivraison` via `commande.adresseLivraisonId`

### Prochaines etapes
- Liste ordonnee : transmission logistique → preparation → livraison → facturation

**AUCUN PROBLEME**

---

## POINTS D'ATTENTION pour le jour J

### 1. Noms des produits dans le plan vs dans le site
Le plan de demo (ANALYSE_PARTIE4_DEMO.md) mentionne "Foie gras d'oie truffe 400g" pour la rupture.
Or dans le site, FG-003 s'appelle **"Foie Gras Mi-Cuit au Poivre de Sichuan"**.
Ce n'est pas un bug — juste un ecart de nommage a connaitre pour ne pas chercher le mauvais produit en live.

**Produits a utiliser dans la demo :**
| Ref | Nom REEL dans le site | Stock | Interet |
|-----|----------------------|-------|---------|
| FG-003 | Foie Gras Mi-Cuit au Poivre de Sichuan | 0 | Rupture + substitution |
| FG-002 | Bloc de Foie Gras de Canard | 80 | Test limite quantite |
| FG-001 | Foie Gras de Canard Entier | 45 | Ajout normal + remise 15% |
| VN-001 | Sauternes AOC 2019 | 30 | TVA 20% → demo multi-TVA |
| CH-002 | Rillettes de Canard | 5 | Stock faible (badge orange) |

### 2. Le seuil franco et le scenario de demo
- francoSeuil = 500 EUR, fraisPort = 25 EUR
- Pour montrer "Plus que X EUR" : ajouter peu de produits (total < 500)
- Pour montrer "Franco de port" : ajouter assez (total > 500)
- **Conseil** : commencer avec peu (montrer le message), puis ajouter des produits et montrer que le message disparait → "Franco de port". C'est plus impactant.

### 3. Refresh = reset
Le state est en memoire (Zustand, pas de persistence). Un refresh du navigateur remet tout a zero.
- **Avantage** : si la demo bugue, un F5 remet tout propre
- **Risque** : ne PAS faire F5 en pleine demo sinon le panier et la livraison sont perdus

---

## CONCLUSION

Toutes les etapes du plan de demo sont **100% fonctionnelles** avec le site dans son etat actuel.
Aucune correction de code n'est necessaire.
Les seuls ajustements sont :
1. Connaitre les vrais noms des produits (pas ceux du seed data initial)
2. Preparer le bon scenario de quantites pour montrer le franco de port
3. Ne pas faire F5 pendant la demo
