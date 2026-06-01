import { create } from 'zustand'
import { Avoir, Litige, StatutLitige } from '../types'
import { initialAvoirs, initialLitiges } from '../data/avoirs'
import { useInvoiceStore } from './invoiceStore'

interface AvoirState {
  avoirs: Avoir[]
  litiges: Litige[]
  getAvoirByNum: (num: string) => Avoir | undefined
  getAvoirsByClient: (idClient: string) => Avoir[]
  getAvoirsByFacture: (numFacture: string) => Avoir[]
  getLitigesByClient: (idClient: string) => Litige[]
  getOpenLitiges: () => Litige[]
  createLitige: (litige: Omit<Litige, 'idLitige' | 'statut'>) => Litige
  updateLitigeStatut: (idLitige: string, statut: StatutLitige, commentaire?: string) => void
  createAvoir: (numFacture: string, montantHT: number, montantTVA: number, montantTTC: number, motif: string, idClient: string, lignes?: Avoir['lignes']) => { success: boolean; avoir?: Avoir; message?: string }
}

export const useAvoirStore = create<AvoirState>((set, get) => ({
  avoirs: [...initialAvoirs],
  litiges: [...initialLitiges],

  getAvoirByNum: (num) => get().avoirs.find(a => a.numAvoir === num),

  getAvoirsByClient: (idClient) => get().avoirs.filter(a => a.idClient === idClient),

  getAvoirsByFacture: (numFacture) => get().avoirs.filter(a => a.numFacture === numFacture),

  getLitigesByClient: (idClient) => get().litiges.filter(l => l.idClient === idClient),

  getOpenLitiges: () => get().litiges.filter(l => l.statut === StatutLitige.OUVERT || l.statut === StatutLitige.EN_COURS),

  createLitige: (data) => {
    const idLitige = `LIT-${String(get().litiges.length + 1).padStart(3, '0')}`
    const litige: Litige = { ...data, idLitige, statut: StatutLitige.OUVERT }
    set(state => ({ litiges: [...state.litiges, litige] }))
    return litige
  },

  updateLitigeStatut: (idLitige, statut, commentaire) => {
    set(state => ({
      litiges: state.litiges.map(l =>
        l.idLitige === idLitige
          ? { ...l, statut, dateResolution: new Date().toISOString().split('T')[0], commentaireResolution: commentaire }
          : l
      ),
    }))
  },

  createAvoir: (numFacture, montantHT, montantTVA, montantTTC, motif, idClient, lignes) => {
    if (!numFacture || numFacture.trim() === '') {
      return { success: false, message: 'Un avoir doit obligatoirement être rattaché à une facture existante.' }
    }

    const facture = useInvoiceStore.getState().getByNum(numFacture)
    if (!facture) {
      return { success: false, message: `Facture ${numFacture} introuvable.` }
    }

    const numAvoir = `AV-2026-${String(get().avoirs.length + 1).padStart(3, '0')}`
    const avoir: Avoir = {
      numAvoir,
      numFacture,
      idClient,
      dateEmission: new Date().toISOString().split('T')[0],
      montantHT,
      montantTVA,
      montantTTC,
      motifAvoir: motif,
      lignes,
    }
    set(state => ({ avoirs: [...state.avoirs, avoir] }))
    return { success: true, avoir }
  },
}))
