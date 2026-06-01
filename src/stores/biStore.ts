import { create } from 'zustand'
import { BiData, PrimeCommercial, StatutCommande } from '../types'
import { useOrderStore } from './orderStore'
import { useInvoiceStore } from './invoiceStore'
import { initialCommerciaux } from '../data/commerciaux'
import { calcPrimeCommercial, calcLineTotalHT } from '../utils/calculations'

interface BiState {
  getBiData: () => BiData
}

export const useBiStore = create<BiState>(() => ({
  getBiData: () => {
    const commandes = useOrderStore.getState().commandes
    const factures = useInvoiceStore.getState().factures

    // CA by agency
    const agenceMap = new Map<string, number>()
    for (const com of initialCommerciaux) {
      const ca = commandes
        .filter(c => c.idCommercial === com.idCommercial && (c.statut === StatutCommande.FACTUREE || c.statut === StatutCommande.EXPEDIEE))
        .reduce((sum, c) => sum + c.lignes.reduce((s, l) => s + calcLineTotalHT(l.quantiteExpediee ?? l.quantiteCommandee, l.prixUnitaireHT, l.remiseAppliquee), 0), 0)
      const existing = agenceMap.get(com.agence) || 0
      agenceMap.set(com.agence, existing + ca)
    }
    // Add other agencies for demo
    if (!agenceMap.has('Strasbourg')) agenceMap.set('Strasbourg', 185000)
    const caParAgence = Array.from(agenceMap.entries()).map(([agence, ca]) => ({ agence, ca: Math.round(ca * 100) / 100 }))

    // CA by product family
    const familleMap = new Map<string, number>()
    for (const c of commandes.filter(c => c.statut === StatutCommande.FACTUREE || c.statut === StatutCommande.EXPEDIEE)) {
      for (const l of c.lignes) {
        const famille = l.reference.startsWith('FG') ? 'Foie Gras' : l.reference.startsWith('CH') ? 'Charcuteries' : l.reference.startsWith('PC') ? 'Plats Cuisinés' : 'Vins'
        const total = calcLineTotalHT(l.quantiteExpediee ?? l.quantiteCommandee, l.prixUnitaireHT, l.remiseAppliquee)
        familleMap.set(famille, (familleMap.get(famille) || 0) + total)
      }
    }
    const caParFamille = Array.from(familleMap.entries()).map(([famille, ca]) => ({ famille, ca: Math.round(ca * 100) / 100 }))

    // CA by quarter (mock extended data for 4 quarters)
    const caParTrimestre = [
      { trimestre: 'T1 2026', ca: 285000 },
      { trimestre: 'T2 2026', ca: 342000 },
      { trimestre: 'T3 2026', ca: 198000 },
      { trimestre: 'T4 2026', ca: 425000 },
    ]

    // CA by month (mock for seasonality chart)
    const caParMois = [
      { mois: 'Jan', ca: 85000, projection: 88000 },
      { mois: 'Fév', ca: 92000, projection: 95000 },
      { mois: 'Mar', ca: 108000, projection: 105000 },
      { mois: 'Avr', ca: 115000, projection: 112000 },
      { mois: 'Mai', ca: 127000, projection: 120000 },
      { mois: 'Jun', ca: 98000, projection: 130000 },
      { mois: 'Jul', ca: 72000, projection: 75000 },
      { mois: 'Aoû', ca: 55000, projection: 58000 },
      { mois: 'Sep', ca: 125000, projection: 118000 },
      { mois: 'Oct', ca: 145000, projection: 140000 },
      { mois: 'Nov', ca: 180000, projection: 175000 },
      { mois: 'Déc', ca: 248000, projection: 235000 },
    ]

    // Primes
    const primes = initialCommerciaux.map(com => calcPrimeCommercial(com, commandes))

    return { caParAgence, caParFamille, caParTrimestre, caParMois, primes }
  },
}))
