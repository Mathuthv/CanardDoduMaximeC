import { create } from 'zustand'
import { Facture, LigneFacture, CodeTVA, Commande, StatutCommande } from '../types'
import { initialFactures } from '../data/factures'
import { useProductStore } from './productStore'
import { useConfigStore } from './configStore'
import { useOrderStore } from './orderStore'
import { calcLineTotalHT, calcTVABreakdown, calcFrancoDePort } from '../utils/calculations'
import { initialClients } from '../data/clients'

interface InvoiceState {
  factures: Facture[]
  getByNum: (num: string) => Facture | undefined
  getByCommande: (numCommande: string) => Facture | undefined
  getByClient: (idClient: string) => Facture[]
  generateInvoice: (numCommande: string) => { success: boolean; facture?: Facture; message?: string }
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  factures: [...initialFactures],

  getByNum: (num) => get().factures.find(f => f.numFacture === num),

  getByCommande: (numCommande) => get().factures.find(f => f.numCommande === numCommande),

  getByClient: (idClient) => get().factures.filter(f => f.idClient === idClient),

  generateInvoice: (numCommande) => {
    const commande = useOrderStore.getState().getByNum(numCommande)
    if (!commande) return { success: false, message: 'Commande introuvable' }
    if (commande.statut !== StatutCommande.EXPEDIEE) {
      return { success: false, message: 'Impossible de facturer — commande non expédiée. Les quantités réellement expédiées doivent être validées par la logistique.' }
    }

    const products = useProductStore.getState().products
    const { tvaRates, francoSeuil, fraisPort: fraisPortConfig } = useConfigStore.getState()
    const client = initialClients.find(c => c.idClient === commande.idClient)

    const lignes: LigneFacture[] = commande.lignes.map(l => {
      const product = products.find(p => p.reference === l.reference)!
      const qty = l.quantiteExpediee ?? l.quantiteCommandee
      const totalLigneHT = calcLineTotalHT(qty, l.prixUnitaireHT, l.remiseAppliquee)
      const tva = tvaRates.find(t => t.codeTVA === product.codeTVA)!
      return {
        reference: l.reference,
        libelleProduit: product.libelle,
        quantite: qty,
        prixUnitaireHT: l.prixUnitaireHT,
        remise: l.remiseAppliquee,
        totalLigneHT,
        codeTVA: product.codeTVA,
        montantTVA: Math.round(totalLigneHT * tva.tauxTVA / 100 * 100) / 100,
      }
    })

    const totalHT = Math.round(lignes.reduce((s, l) => s + l.totalLigneHT, 0) * 100) / 100
    const tvaBreakdown = calcTVABreakdown(
      lignes.map(l => ({ reference: l.reference, quantite: l.quantite, prixUnitaireHT: l.prixUnitaireHT, remise: l.remise })),
      products,
      tvaRates
    )
    const totalTVA = Math.round(tvaBreakdown.reduce((s, t) => s + t.montantTVA, 0) * 100) / 100
    const { fraisPort, francoDePort } = calcFrancoDePort(totalHT, francoSeuil, fraisPortConfig)

    const numFacture = `FAC-2026-${String(get().factures.length + 1).padStart(3, '0')}`

    const facture: Facture = {
      numFacture,
      numCommande,
      idClient: commande.idClient,
      dateEmission: new Date().toISOString().split('T')[0],
      lignes,
      totalHT,
      totalTVA,
      totalTTC: Math.round((totalHT + totalTVA + fraisPort) * 100) / 100,
      tvaBreakdown,
      fraisPort,
      francoDePort,
      adresseFacturation: client?.adrFacturationCentralisee || '',
    }

    set(state => ({ factures: [...state.factures, facture] }))
    useOrderStore.getState().advanceStatus(numCommande, StatutCommande.FACTUREE)
    return { success: true, facture }
  },
}))
