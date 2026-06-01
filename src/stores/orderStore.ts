import { create } from 'zustand'
import { Commande, StatutCommande, LigneCommande, Devise } from '../types'
import { initialCommandes } from '../data/commandes'
import { generateId } from '../utils/formatters'

interface OrderState {
  commandes: Commande[]
  getByNum: (num: string) => Commande | undefined
  getByClient: (idClient: string) => Commande[]
  getByStatut: (statut: StatutCommande) => Commande[]
  createFromCart: (idClient: string, login: string, idCommercial: string, adresseLivraisonId: string, lignes: LigneCommande[], dateLivraisonSouhaitee?: string) => Commande
  setEnAttentePaiement: (numCommande: string) => void
  revertToCart: (numCommande: string) => void
  createFromPhone: (idClient: string, login: string, idCommercial: string, adresseLivraisonId: string, lignes: LigneCommande[], notes?: string) => Commande
  advanceStatus: (numCommande: string, newStatus: StatutCommande) => void
  setExpediedQty: (numCommande: string, ligneId: string, qtyExpediee: number) => void
  validateExpedition: (numCommande: string) => void
}

export const useOrderStore = create<OrderState>((set, get) => ({
  commandes: [...initialCommandes],

  getByNum: (num) => get().commandes.find(c => c.numCommande === num),

  getByClient: (idClient) => get().commandes.filter(c => c.idClient === idClient),

  getByStatut: (statut) => get().commandes.filter(c => c.statut === statut),

  createFromCart: (idClient, login, idCommercial, adresseLivraisonId, lignes, dateLivraisonSouhaitee) => {
    const numCommande = `CMD-2026-${String(get().commandes.length + 1).padStart(3, '0')}`
    const commande: Commande = {
      numCommande,
      idClient,
      login,
      idCommercial,
      dateValidationWeb: new Date().toISOString().split('T')[0],
      statut: StatutCommande.EN_ATTENTE_PAIEMENT,
      devise: Devise.EUR,
      lignes,
      adresseLivraisonId,
      dateLivraisonSouhaitee,
    }
    set(state => ({ commandes: [...state.commandes, commande] }))
    return commande
  },

  setEnAttentePaiement: (numCommande) => {
    set(state => ({
      commandes: state.commandes.map(c =>
        c.numCommande === numCommande ? { ...c, statut: StatutCommande.EN_ATTENTE_PAIEMENT } : c
      ),
    }))
  },

  revertToCart: (numCommande) => {
    set(state => ({
      commandes: state.commandes.filter(c => c.numCommande !== numCommande),
    }))
  },

  createFromPhone: (idClient, login, idCommercial, adresseLivraisonId, lignes, notes) => {
    const numCommande = `CMD-2026-${String(get().commandes.length + 1).padStart(3, '0')}`
    const commande: Commande = {
      numCommande,
      idClient,
      login,
      idCommercial,
      dateValidationWeb: new Date().toISOString().split('T')[0],
      statut: StatutCommande.PAYEE_VALIDEE,
      devise: Devise.EUR,
      lignes,
      adresseLivraisonId,
      notes,
    }
    set(state => ({ commandes: [...state.commandes, commande] }))
    return commande
  },

  advanceStatus: (numCommande, newStatus) => {
    set(state => ({
      commandes: state.commandes.map(c =>
        c.numCommande === numCommande ? { ...c, statut: newStatus } : c
      ),
    }))
  },

  setExpediedQty: (numCommande, ligneId, qtyExpediee) => {
    set(state => ({
      commandes: state.commandes.map(c =>
        c.numCommande === numCommande
          ? {
              ...c,
              lignes: c.lignes.map(l =>
                l.idLigne === ligneId ? { ...l, quantiteExpediee: qtyExpediee } : l
              ),
            }
          : c
      ),
    }))
  },

  validateExpedition: (numCommande) => {
    set(state => ({
      commandes: state.commandes.map(c =>
        c.numCommande === numCommande
          ? { ...c, statut: StatutCommande.EXPEDIEE, dateExpedition: new Date().toISOString().split('T')[0] }
          : c
      ),
    }))
  },
}))
