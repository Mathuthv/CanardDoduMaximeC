import { Avoir, Litige, StatutLitige, CodeTVA } from '../types'

export const initialAvoirs: Avoir[] = [
  {
    numAvoir: 'AV-2026-001',
    numFacture: 'FAC-2026-002',
    idClient: 'CLI-001',
    dateEmission: '2026-04-25',
    montantHT: 116.28,
    montantTVA: 6.40,
    montantTTC: 122.68,
    motifAvoir: 'Terrine de foie gras — 2 pièces endommagées à la livraison',
    lignes: [
      { reference: 'FG-004', libelleProduit: 'Terrine de Foie Gras aux Figues', quantite: 2, prixUnitaireHT: 38.00, remise: 0.15, totalLigneHT: 64.60, codeTVA: CodeTVA.TVA_5_5, montantTVA: 3.55 },
    ],
  },
]

export const initialLitiges: Litige[] = [
  {
    idLitige: 'LIT-001',
    numFacture: 'FAC-2026-002',
    idClient: 'CLI-001',
    dateDeclaration: '2026-04-20',
    motif: 'PRODUIT_ENDOMMAGE',
    description: '2 terrines de foie gras aux figues reçues avec emballage endommagé, produit impropre à la vente.',
    statut: StatutLitige.ACCEPTE,
    numAvoir: 'AV-2026-001',
    dateResolution: '2026-04-25',
    commentaireResolution: 'Avoir émis pour les 2 pièces endommagées.',
  },
  {
    idLitige: 'LIT-002',
    numFacture: 'FAC-2026-003',
    idClient: 'CLI-002',
    dateDeclaration: '2026-05-28',
    motif: 'ERREUR_QUANTITE',
    description: 'Commande de 8 cassoulets, seulement 6 reçus.',
    statut: StatutLitige.OUVERT,
  },
]
