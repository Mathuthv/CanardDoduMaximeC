import { LigneCommande, Produit, TVA, Remise, Commercial, Commande, CodeTVA, TVABreakdownLine, CartTotals, PrimeCommercial, LignePanier, StatutCommande } from '../types'

export function calcLineTotalHT(quantite: number, prixUnitaireHT: number, remise: number): number {
  return Math.round(quantite * prixUnitaireHT * (1 - remise) * 100) / 100
}

export function calcTVABreakdown(
  lines: { reference: string; quantite: number; prixUnitaireHT: number; remise: number }[],
  products: Produit[],
  tvaRates: TVA[]
): TVABreakdownLine[] {
  const breakdown = new Map<CodeTVA, { baseHT: number; taux: number }>()

  for (const line of lines) {
    const product = products.find(p => p.reference === line.reference)
    if (!product) continue
    const tva = tvaRates.find(t => t.codeTVA === product.codeTVA)
    if (!tva) continue

    const lineHT = calcLineTotalHT(line.quantite, line.prixUnitaireHT, line.remise)
    const existing = breakdown.get(product.codeTVA) || { baseHT: 0, taux: tva.tauxTVA }
    existing.baseHT += lineHT
    breakdown.set(product.codeTVA, existing)
  }

  return Array.from(breakdown.entries()).map(([codeTVA, { baseHT, taux }]) => ({
    codeTVA,
    baseHT: Math.round(baseHT * 100) / 100,
    taux,
    montantTVA: Math.round(baseHT * taux / 100 * 100) / 100,
  }))
}

export function calcFrancoDePort(totalHT: number, francoSeuil = 500, fraisPort = 25): { fraisPort: number; francoDePort: boolean } {
  if (totalHT >= francoSeuil) {
    return { fraisPort: 0, francoDePort: true }
  }
  return { fraisPort: fraisPort, francoDePort: false }
}

export function findApplicableRemises(
  idClient: string,
  totalHT: number,
  productReference: string | undefined,
  remises: Remise[],
  currentDate: string = new Date().toISOString().split('T')[0]
): Remise[] {
  return remises.filter(r => {
    // Check date validity
    if (currentDate < r.dateDebut || currentDate > r.dateFin) return false
    // Check client specificity
    if (r.idClient && r.idClient !== idClient) return false
    // Check product specificity
    if (r.produitReference && r.produitReference !== productReference) return false
    // Check volume threshold
    if (r.seuilDeclenchement && totalHT < r.seuilDeclenchement) return false
    return true
  })
}

export function getBestRemise(remises: Remise[]): number {
  if (remises.length === 0) return 0
  return Math.max(...remises.map(r => r.taux))
}

export function calcCartTotals(
  lignes: { reference: string; quantite: number }[],
  products: Produit[],
  tvaRates: TVA[],
  idClient: string,
  remises: Remise[],
  francoSeuil = 500,
  fraisPortMontant = 25
): CartTotals {
  let totalHT = 0
  let totalRemises = 0

  const linesWithPrices = lignes.map(l => {
    const product = products.find(p => p.reference === l.reference)!
    const applicableRemises = findApplicableRemises(idClient, 0, l.reference, remises)
    const remise = getBestRemise(applicableRemises)
    const lineHTBrut = l.quantite * product.prixUnitaireHT
    const lineHT = calcLineTotalHT(l.quantite, product.prixUnitaireHT, remise)
    totalHT += lineHTBrut
    totalRemises += lineHTBrut - lineHT
    return { reference: l.reference, quantite: l.quantite, prixUnitaireHT: product.prixUnitaireHT, remise }
  })

  // Check volume discount on total
  const totalHTApresRemises = totalHT - totalRemises
  const volumeRemises = remises.filter(r => r.typeRemise === 'VOLUME' && r.seuilDeclenchement && totalHTApresRemises >= r.seuilDeclenchement)
  if (volumeRemises.length > 0) {
    const volumeTaux = getBestRemise(volumeRemises)
    // Apply volume discount on top
    const volumeDiscount = totalHTApresRemises * volumeTaux
    totalRemises += volumeDiscount
  }

  const finalHTApresRemises = Math.round((totalHT - totalRemises) * 100) / 100

  const tvaBreakdown = calcTVABreakdown(linesWithPrices, products, tvaRates)
  const totalTVA = Math.round(tvaBreakdown.reduce((sum, t) => sum + t.montantTVA, 0) * 100) / 100

  const { fraisPort, francoDePort } = calcFrancoDePort(finalHTApresRemises, francoSeuil, fraisPortMontant)

  return {
    totalHT: Math.round(totalHT * 100) / 100,
    totalRemises: Math.round(totalRemises * 100) / 100,
    totalHTApresRemises: finalHTApresRemises,
    tvaBreakdown,
    totalTVA,
    fraisPort,
    francoDePort,
    totalTTC: Math.round((finalHTApresRemises + totalTVA + fraisPort) * 100) / 100,
  }
}

export function calcPrimeCommercial(commercial: Commercial, commandes: Commande[]): PrimeCommercial {
  const caRealise = commandes
    .filter(c => c.idCommercial === commercial.idCommercial && (c.statut === StatutCommande.FACTUREE || c.statut === StatutCommande.EXPEDIEE))
    .reduce((sum, c) => {
      const orderTotal = c.lignes.reduce((s, l) => {
        const qty = l.quantiteExpediee ?? l.quantiteCommandee
        return s + calcLineTotalHT(qty, l.prixUnitaireHT, l.remiseAppliquee)
      }, 0)
      return sum + orderTotal
    }, 0)

  const pourcentageAtteinte = Math.round((caRealise / commercial.objectifCA) * 10000) / 100

  let tauxPrime = 0
  if (pourcentageAtteinte >= 120) tauxPrime = 0.08
  else if (pourcentageAtteinte >= 100) tauxPrime = 0.05

  return {
    idCommercial: commercial.idCommercial,
    nom: `${commercial.prenom} ${commercial.nom}`,
    agence: commercial.agence,
    objectifCA: commercial.objectifCA,
    caRealise: Math.round(caRealise * 100) / 100,
    pourcentageAtteinte,
    montantPrime: Math.round(caRealise * tauxPrime * 100) / 100,
  }
}

export function canAddToCart(product: Produit, quantiteSouhaitee: number): { allowed: boolean; maxDisponible: number; message?: string } {
  if (product.stockPhysiqueDisponible <= 0) {
    return { allowed: false, maxDisponible: 0, message: 'Produit en rupture de stock' }
  }
  if (quantiteSouhaitee > product.stockPhysiqueDisponible) {
    return { allowed: false, maxDisponible: product.stockPhysiqueDisponible, message: `Quantité maximale disponible : ${product.stockPhysiqueDisponible}` }
  }
  return { allowed: true, maxDisponible: product.stockPhysiqueDisponible }
}

export function canGenerateInvoice(commande: Commande): { allowed: boolean; message?: string } {
  if (commande.statut !== StatutCommande.EXPEDIEE) {
    return { allowed: false, message: 'Impossible de facturer — commande non expédiée. Les quantités réellement expédiées doivent être validées par la logistique.' }
  }
  return { allowed: true }
}

export function canCreateAvoir(numFacture: string | undefined | null): { allowed: boolean; message?: string } {
  if (!numFacture || numFacture.trim() === '') {
    return { allowed: false, message: 'Un avoir doit obligatoirement être rattaché à une facture existante.' }
  }
  return { allowed: true }
}
