// === ENUMS ===

export enum StatutCommande {
  PANIER_EN_COURS = 'PANIER_EN_COURS',
  EN_ATTENTE_PAIEMENT = 'EN_ATTENTE_PAIEMENT',
  PAYEE_VALIDEE = 'PAYEE_VALIDEE',
  EN_PREPARATION = 'EN_PREPARATION',
  EXPEDIEE = 'EXPEDIEE',
  FACTUREE = 'FACTUREE',
}

export enum TypeRemise {
  EXCEPTIONNELLE = 'EXCEPTIONNELLE',
  VOLUME = 'VOLUME',
  FIDELITE = 'FIDELITE',
}

export enum CodeTVA {
  TVA_5_5 = 'TVA_5_5',
  TVA_20 = 'TVA_20',
}

export enum Role {
  CLIENT = 'CLIENT',
  PRISE_COMMANDE = 'PRISE_COMMANDE',     // Alain
  LOGISTIQUE = 'LOGISTIQUE',              // Matthieu
  FACTURATION = 'FACTURATION',            // Helene
  DIRECTION_COMMERCIALE = 'DIRECTION_COMMERCIALE', // Francoise
}

export enum StatutLitige {
  OUVERT = 'OUVERT',
  EN_COURS = 'EN_COURS',
  ACCEPTE = 'ACCEPTE',
  REFUSE = 'REFUSE',
}

export enum CategorieProduit {
  FOIE_GRAS = 'FOIE_GRAS',
  CHARCUTERIES = 'CHARCUTERIES',
  PLATS_CUISINES = 'PLATS_CUISINES',
  VINS = 'VINS',
}

export enum Devise {
  EUR = 'EUR',
  GBP = 'GBP',
}

// === ENTITY TYPES ===

export interface TVA {
  codeTVA: CodeTVA
  tauxTVA: number      // e.g. 5.5 or 20
  libelle: string      // e.g. "TVA réduite 5,5%" or "TVA normale 20%"
}

export interface Produit {
  reference: string
  codeTVA: CodeTVA
  categorie: CategorieProduit
  libelle: string
  description: string
  prixUnitaireHT: number
  stockPhysiqueDisponible: number
  imageUrl?: string
  unite: string        // e.g. "pièce", "kg", "bouteille"
}

export interface AdresseLivraison {
  id: string
  libelle: string      // e.g. "Restaurant La Table d'Or — Paris 8e"
  rue: string
  codePostal: string
  ville: string
  pays: string
}

export interface Client {
  idClient: string
  raisonSociale: string
  email: string
  telephone: string
  adressesLivraison: AdresseLivraison[]
  adrFacturationCentralisee: string   // Full formatted address
  siret: string
  contactPrincipal: string
}

export interface CompteWeb {
  login: string        // email
  idClient: string
  motDePasseHash: string
  derniereConnexion: string   // ISO date
  role: Role
  nom: string
  prenom: string
  avatar?: string
}

export interface LignePanier {
  reference: string     // FK to Produit
  quantiteSouhaitee: number
}

export interface Panier {
  idPanier: string
  login: string         // FK to CompteWeb
  dateCreation: string  // ISO date
  lignes: LignePanier[]
}

export interface Remise {
  idRemise: string
  idClient?: string     // FK optional (null = global)
  taux: number          // e.g. 0.15 for 15%
  typeRemise: TypeRemise
  seuilDeclenchement?: number  // Minimum HT amount for volume discounts
  dateDebut: string     // ISO date
  dateFin: string       // ISO date
  description: string
  produitReference?: string   // FK optional (null = all products)
}

export interface Commercial {
  idCommercial: string
  nom: string
  prenom: string
  email: string
  agence: string        // e.g. "Paris", "Lyon", "Strasbourg", "Bordeaux"
  objectifCA: number    // Annual CA target
}

export interface LigneCommande {
  idLigne: string
  numCommande: string
  reference: string     // FK to Produit
  quantiteCommandee: number
  quantiteExpediee: number | null  // null until logistics fills it
  remiseAppliquee: number          // e.g. 0.15 for 15%
  prixUnitaireHT: number           // Snapshot of price at order time
}

export interface Commande {
  numCommande: string
  idClient: string
  login: string
  idCommercial: string
  dateValidationWeb: string   // ISO date
  statut: StatutCommande
  devise: Devise
  lignes: LigneCommande[]
  adresseLivraisonId: string
  notes?: string
  dateExpedition?: string     // ISO date, set when EXPEDIEE
  dateFacturation?: string    // ISO date, set when FACTUREE
}

export interface LigneFacture {
  reference: string
  libelleProduit: string
  quantite: number
  prixUnitaireHT: number
  remise: number
  totalLigneHT: number
  codeTVA: CodeTVA
  montantTVA: number
}

export interface Facture {
  numFacture: string
  numCommande: string
  idClient: string
  dateEmission: string   // ISO date
  lignes: LigneFacture[]
  totalHT: number
  totalTVA: number
  totalTTC: number
  tvaBreakdown: { codeTVA: CodeTVA; baseHT: number; taux: number; montantTVA: number }[]
  fraisPort: number
  francoDePort: boolean
  adresseFacturation: string
}

export interface Avoir {
  numAvoir: string
  numFacture: string    // FK REQUIRED — accounting lock
  idClient: string
  dateEmission: string  // ISO date
  montantHT: number
  montantTVA: number
  montantTTC: number
  motifAvoir: string
  lignes?: LigneFacture[]  // Credit note lines (subset of invoice)
}

export interface Litige {
  idLitige: string
  numFacture: string
  idClient: string
  dateDeclaration: string  // ISO date
  motif: 'PRODUIT_ENDOMMAGE' | 'ERREUR_QUANTITE' | 'PRODUIT_MANQUANT' | 'AUTRE'
  description: string
  statut: StatutLitige
  numAvoir?: string        // Set when avoir is generated
  dateResolution?: string  // ISO date
  commentaireResolution?: string
}

// === COMPUTED / UI TYPES ===

export interface TVABreakdownLine {
  codeTVA: CodeTVA
  baseHT: number
  taux: number
  montantTVA: number
}

export interface CartTotals {
  totalHT: number
  totalRemises: number
  totalHTApresRemises: number
  tvaBreakdown: TVABreakdownLine[]
  totalTVA: number
  fraisPort: number
  francoDePort: boolean
  totalTTC: number
}

export interface PrimeCommercial {
  idCommercial: string
  nom: string
  agence: string
  objectifCA: number
  caRealise: number
  pourcentageAtteinte: number
  montantPrime: number
}

export interface BiData {
  caParAgence: { agence: string; ca: number }[]
  caParFamille: { famille: string; ca: number }[]
  caParTrimestre: { trimestre: string; ca: number }[]
  caParMois: { mois: string; ca: number; projection?: number }[]
  primes: PrimeCommercial[]
}
