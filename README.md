# Le Canard Dodu -- Portail B2B E-commerce

Maquette interactive haute-fidelite d'un portail e-commerce B2B + Back-Office pour **Le Canard Dodu**, producteur de specialites gastronomiques haut de gamme. Projet universitaire L3 MIAGE -- Ingenierie des SI 2.

## Demarrage rapide

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173) dans le navigateur.

## Comptes de test

| Role | Email | Mot de passe | Acces |
|------|-------|-------------|-------|
| Client B2B (La Table d'Or) | `client@latabledoor.fr` | `demo2026` | Front-Office |
| Client B2B (Le Bistrot) | `client@bistrotdumarche.fr` | `demo2026` | Front-Office |
| Alain -- Prise de commande | `alain.birmont@canard-dodu.fr` | `demo2026` | Back-Office |
| Matthieu -- Logistique | `matthieu.flechard@canard-dodu.fr` | `demo2026` | Back-Office |
| Helene -- Facturation | `helene.mirabelle@canard-dodu.fr` | `demo2026` | Back-Office |
| Francoise -- Direction | `francoise.delgas@canard-dodu.fr` | `demo2026` | Back-Office |

La **barre de demo** en haut de chaque page permet de basculer instantanement entre les profils.

## Scenario de soutenance (pas-a-pas)

### 1. Parcours Client (UC_01, UC_02, UC_03)

1. Aller sur `/login`, se connecter en tant que **client@latabledoor.fr / demo2026**
2. Tableau de bord personnalise avec KPI
3. **Catalogue** : observer les badges de stock (vert/orange/rouge). Le produit *Foie Gras Mi-Cuit* est en rupture
4. Tenter d'ajouter le produit en rupture -> **Verrou de Stock** affiche
5. Ajouter "Foie Gras de Canard Entier" (qty=5) + "Sauternes AOC" (qty=6)
6. **Panier** : verifier la remise fidelite 15 %, la ventilation TVA (5,5 % et 20 %), le franco de port
7. **Valider** -> Checkout -> Paiement mock -> Commande creee en `PAYEE_VALIDEE`

### 2. Commande telephone -- Alain (UC_05)

1. Basculer vers **Alain** via la barre de demo
2. Selectionner le client "Le Bistrot du Marche"
3. Chercher "Rillettes" -> stock faible (5) -> tenter 10 -> **Verrou de Stock** + suggestion de substitution
4. Ajouter des produits valides, valider la commande

### 3. Logistique -- Matthieu (UC_06)

1. Basculer vers **Matthieu**
2. Voir les commandes `PAYEE_VALIDEE` en attente
3. Selectionner une commande, saisir les quantites expediees (mettre un ecart sur une ligne pour demontrer le reliquat)
4. **Valider l'expedition** -> Commande passe en `EXPEDIEE`

### 4. Facturation -- Helene (UC_07)

1. Basculer vers **Helene**
2. Onglet "A facturer" : voir la commande `EXPEDIEE`
3. Tenter de facturer une commande non expediee -> **Verrou Logistique** (bouton grise + banniere)
4. Facturer la commande expediee : verifier le brouillon base sur les **quantites expediees**, la ventilation TVA
5. Emettre la facture -> voir dans "Factures emises"

### 5. Litige et Avoir (UC_04 + UC_08)

1. Basculer vers le **Client**, aller dans l'historique des commandes
2. Ouvrir une commande facturee -> "Signaler un litige"
3. Basculer vers **Helene** -> Onglet "Litiges en cours" -> Accepter le litige
4. Onglet "Creer un avoir" -> Tenter de creer sans facture -> **Verrou Comptable**
5. Selectionner la facture, generer l'avoir

### 6. Parametrage -- Francoise (UC_09)

1. Basculer vers **Francoise**
2. Onglet "Tarifs" -> modifier le prix d'un produit
3. Basculer vers le **Client** -> verifier que le prix a change dans le catalogue

### 7. BI / Datawarehouse -- Francoise (UC_10)

1. Revenir sur **Francoise** -> "Tableaux de bord"
2. Observer : CA par agence, CA par famille, saisonnalite, primes commerciales
3. Cliquer "Exporter en PDF" (mode demo)

## Correspondance Ecrans / UC / Recette

| Ecran | UC | Scenarios de recette |
|-------|-----|---------------------|
| Login | UC_01 | Blocage apres 3 tentatives |
| Catalogue | UC_02 | REC-02 : stock temps reel |
| Panier / Checkout | UC_03 | REC-02, REC-03 : remise + multi-TVA |
| Historique commandes | UC_04 | REC-05 : telechargement facture |
| Commande telephone | UC_05 | REC-02 : controle stock en direct |
| Logistique | UC_06 | REC-01 : saisie qte expediees |
| Facturation | UC_07 | REC-01 : verrou logistique, REC-03 : multi-TVA |
| Avoirs / SAV | UC_08 | REC-04 : avoir rattache obligatoirement |
| Parametrage | UC_09 | Effet immediat sur catalogue |
| BI Dashboard | UC_10 | REC-06 : calcul primes decouple |

## Les 3 verrous metier

1. **Verrou de Stock** -- Ajout au panier refuse si quantite > stock physique disponible
2. **Verrou Logistique** -- Facture impossible tant que les quantites expediees ne sont pas validees
3. **Verrou Comptable** -- Avoir obligatoirement rattache a une facture existante

Chaque verrou est signale par une banniere doree "Mode demo" lors de son declenchement.

## Stack technique

- React 18 + Vite + TypeScript
- TailwindCSS v4
- React Router v6
- Zustand (state management)
- Recharts (graphiques BI)
- Lucide React (icones)
- 100 % donnees mockees en memoire -- aucun backend

## Structure du projet

```
src/
  types/          # Types TypeScript et enums
  data/           # Donnees seed (produits, clients, commandes...)
  stores/         # Zustand stores (auth, cart, orders, invoices...)
  utils/          # Calculs metier (TVA, remises, franco) et formateurs
  components/
    ui/           # Design system (Button, Card, Modal, Table...)
    layout/       # Layouts FO/BO + RoleSwitcher
    shared/       # Composants partages (StockBadge, VerrouBanner...)
  pages/
    fo/           # 10 pages Front-Office
    bo/           # 7 pages Back-Office
```
