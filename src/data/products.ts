import { Produit, CodeTVA, CategorieProduit } from '../types'

export const initialProducts: Produit[] = [
  // FOIE GRAS (4) — TVA 5.5%
  { reference: 'FG-001', codeTVA: CodeTVA.TVA_5_5, categorie: CategorieProduit.FOIE_GRAS, libelle: 'Foie Gras de Canard Entier', description: 'Foie gras de canard entier du Sud-Ouest, recette traditionnelle. Médaille d\'or au Concours Général Agricole.', prixUnitaireHT: 89.90, stockPhysiqueDisponible: 45, unite: 'pièce' },
  { reference: 'FG-002', codeTVA: CodeTVA.TVA_5_5, categorie: CategorieProduit.FOIE_GRAS, libelle: 'Bloc de Foie Gras de Canard', description: 'Bloc de foie gras de canard avec morceaux, idéal pour vos entrées festives.', prixUnitaireHT: 45.50, stockPhysiqueDisponible: 80, unite: 'pièce' },
  { reference: 'FG-003', codeTVA: CodeTVA.TVA_5_5, categorie: CategorieProduit.FOIE_GRAS, libelle: 'Foie Gras Mi-Cuit au Poivre de Sichuan', description: 'Foie gras mi-cuit relevé au poivre de Sichuan, texture fondante.', prixUnitaireHT: 72.00, stockPhysiqueDisponible: 0, unite: 'pièce' },
  { reference: 'FG-004', codeTVA: CodeTVA.TVA_5_5, categorie: CategorieProduit.FOIE_GRAS, libelle: 'Terrine de Foie Gras aux Figues', description: 'Terrine artisanale de foie gras de canard aux figues confites.', prixUnitaireHT: 38.00, stockPhysiqueDisponible: 120, unite: 'pièce' },

  // CHARCUTERIES (4) — TVA 5.5%
  { reference: 'CH-001', codeTVA: CodeTVA.TVA_5_5, categorie: CategorieProduit.CHARCUTERIES, libelle: 'Magret de Canard Séché', description: 'Magret de canard séché au sel de Guérande, affiné 3 semaines.', prixUnitaireHT: 24.90, stockPhysiqueDisponible: 60, unite: 'pièce' },
  { reference: 'CH-002', codeTVA: CodeTVA.TVA_5_5, categorie: CategorieProduit.CHARCUTERIES, libelle: 'Rillettes de Canard', description: 'Rillettes de canard pur canard, recette du Périgord.', prixUnitaireHT: 12.50, stockPhysiqueDisponible: 5, unite: 'pot' },
  { reference: 'CH-003', codeTVA: CodeTVA.TVA_5_5, categorie: CategorieProduit.CHARCUTERIES, libelle: 'Confit de Canard (4 cuisses)', description: 'Confit de canard traditionnel, 4 cuisses confites dans leur graisse.', prixUnitaireHT: 32.90, stockPhysiqueDisponible: 35, unite: 'boîte' },
  { reference: 'CH-004', codeTVA: CodeTVA.TVA_5_5, categorie: CategorieProduit.CHARCUTERIES, libelle: 'Gésiers de Canard Confits', description: 'Gésiers de canard confits, prêts à poêler pour vos salades.', prixUnitaireHT: 15.90, stockPhysiqueDisponible: 90, unite: 'boîte' },

  // PLATS CUISINES (3) — TVA 5.5%
  { reference: 'PC-001', codeTVA: CodeTVA.TVA_5_5, categorie: CategorieProduit.PLATS_CUISINES, libelle: 'Cassoulet au Confit de Canard', description: 'Cassoulet traditionnel au confit de canard et saucisse de Toulouse, mijoté lentement.', prixUnitaireHT: 22.50, stockPhysiqueDisponible: 40, unite: 'boîte' },
  { reference: 'PC-002', codeTVA: CodeTVA.TVA_5_5, categorie: CategorieProduit.PLATS_CUISINES, libelle: 'Parmentier de Canard', description: 'Parmentier de canard effiloché, purée de pommes de terre à la truffe.', prixUnitaireHT: 19.90, stockPhysiqueDisponible: 25, unite: 'pièce' },
  { reference: 'PC-003', codeTVA: CodeTVA.TVA_5_5, categorie: CategorieProduit.PLATS_CUISINES, libelle: 'Gelée de Canard au Monbazillac', description: 'Gelée de canard parfumée au Monbazillac, accompagnement idéal du foie gras.', prixUnitaireHT: 15.00, stockPhysiqueDisponible: 55, unite: 'pot' },

  // VINS (4) — TVA 20%
  { reference: 'VN-001', codeTVA: CodeTVA.TVA_20, categorie: CategorieProduit.VINS, libelle: 'Sauternes AOC 2019', description: 'Sauternes Grand Cru, notes de miel d\'acacia et d\'abricot confit. Accord parfait avec le foie gras.', prixUnitaireHT: 32.00, stockPhysiqueDisponible: 30, unite: 'bouteille' },
  { reference: 'VN-002', codeTVA: CodeTVA.TVA_20, categorie: CategorieProduit.VINS, libelle: 'Jurançon Moelleux 2021', description: 'Jurançon moelleux, arômes de fruits exotiques et d\'épices douces.', prixUnitaireHT: 18.50, stockPhysiqueDisponible: 48, unite: 'bouteille' },
  { reference: 'VN-003', codeTVA: CodeTVA.TVA_20, categorie: CategorieProduit.VINS, libelle: 'Monbazillac 2020', description: 'Monbazillac onctueux, robe dorée, finale longue sur le coing et la vanille.', prixUnitaireHT: 14.90, stockPhysiqueDisponible: 65, unite: 'bouteille' },
  { reference: 'VN-004', codeTVA: CodeTVA.TVA_20, categorie: CategorieProduit.VINS, libelle: 'Côtes de Bergerac Moelleux 2022', description: 'Vin moelleux fruité, idéal en apéritif ou sur un dessert aux fruits.', prixUnitaireHT: 11.50, stockPhysiqueDisponible: 3, unite: 'bouteille' },
]
