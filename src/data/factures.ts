import { Facture, CodeTVA } from '../types'

export const initialFactures: Facture[] = [
  {
    numFacture: 'FAC-2026-001',
    numCommande: 'CMD-2026-001',
    idClient: 'CLI-001',
    dateEmission: '2026-03-13',
    lignes: [
      { reference: 'FG-001', libelleProduit: 'Foie Gras de Canard Entier', quantite: 10, prixUnitaireHT: 89.90, remise: 0.15, totalLigneHT: 764.15, codeTVA: CodeTVA.TVA_5_5, montantTVA: 42.03 },
      { reference: 'VN-001', libelleProduit: 'Sauternes AOC 2019', quantite: 24, prixUnitaireHT: 32.00, remise: 0.15, totalLigneHT: 652.80, codeTVA: CodeTVA.TVA_20, montantTVA: 130.56 },
      { reference: 'CH-003', libelleProduit: 'Confit de Canard (4 cuisses)', quantite: 8, prixUnitaireHT: 32.90, remise: 0.15, totalLigneHT: 223.72, codeTVA: CodeTVA.TVA_5_5, montantTVA: 12.30 },
    ],
    totalHT: 1640.67,
    totalTVA: 184.89,
    totalTTC: 1825.56,
    tvaBreakdown: [
      { codeTVA: CodeTVA.TVA_5_5, baseHT: 987.87, taux: 5.5, montantTVA: 54.33 },
      { codeTVA: CodeTVA.TVA_20, baseHT: 652.80, taux: 20, montantTVA: 130.56 },
    ],
    fraisPort: 0,
    francoDePort: true,
    adresseFacturation: 'La Table d\'Or — Siège\n24 rue du Faubourg Saint-Honoré\n75008 Paris\nFrance',
  },
  {
    numFacture: 'FAC-2026-002',
    numCommande: 'CMD-2026-002',
    idClient: 'CLI-001',
    dateEmission: '2026-04-18',
    lignes: [
      { reference: 'PC-001', libelleProduit: 'Cassoulet au Confit de Canard', quantite: 15, prixUnitaireHT: 22.50, remise: 0.15, totalLigneHT: 286.88, codeTVA: CodeTVA.TVA_5_5, montantTVA: 15.78 },
      { reference: 'FG-004', libelleProduit: 'Terrine de Foie Gras aux Figues', quantite: 18, prixUnitaireHT: 38.00, remise: 0.15, totalLigneHT: 581.40, codeTVA: CodeTVA.TVA_5_5, montantTVA: 31.98 },
      { reference: 'VN-002', libelleProduit: 'Jurançon Moelleux 2021', quantite: 12, prixUnitaireHT: 18.50, remise: 0.15, totalLigneHT: 188.70, codeTVA: CodeTVA.TVA_20, montantTVA: 37.74 },
    ],
    totalHT: 1056.98,
    totalTVA: 85.50,
    totalTTC: 1142.48,
    tvaBreakdown: [
      { codeTVA: CodeTVA.TVA_5_5, baseHT: 868.28, taux: 5.5, montantTVA: 47.76 },
      { codeTVA: CodeTVA.TVA_20, baseHT: 188.70, taux: 20, montantTVA: 37.74 },
    ],
    fraisPort: 0,
    francoDePort: true,
    adresseFacturation: 'La Table d\'Or — Siège\n24 rue du Faubourg Saint-Honoré\n75008 Paris\nFrance',
  },
  {
    numFacture: 'FAC-2026-003',
    numCommande: 'CMD-2026-005',
    idClient: 'CLI-002',
    dateEmission: '2026-04-05',
    lignes: [
      { reference: 'CH-001', libelleProduit: 'Magret de Canard Séché', quantite: 5, prixUnitaireHT: 24.90, remise: 0, totalLigneHT: 124.50, codeTVA: CodeTVA.TVA_5_5, montantTVA: 6.85 },
      { reference: 'PC-001', libelleProduit: 'Cassoulet au Confit de Canard', quantite: 8, prixUnitaireHT: 22.50, remise: 0, totalLigneHT: 180.00, codeTVA: CodeTVA.TVA_5_5, montantTVA: 9.90 },
    ],
    totalHT: 304.50,
    totalTVA: 16.75,
    totalTTC: 321.25,
    tvaBreakdown: [
      { codeTVA: CodeTVA.TVA_5_5, baseHT: 304.50, taux: 5.5, montantTVA: 16.75 },
    ],
    fraisPort: 25.00,
    francoDePort: false,
    adresseFacturation: 'Le Bistrot du Marché\n42 rue Mercière\n69002 Lyon\nFrance',
  },
]
