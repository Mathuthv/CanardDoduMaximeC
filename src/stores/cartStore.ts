import { create } from 'zustand'
import { LignePanier, CartTotals } from '../types'
import { useProductStore } from './productStore'
import { useConfigStore } from './configStore'
import { calcCartTotals, canAddToCart } from '../utils/calculations'

interface CartState {
  lignes: LignePanier[]
  addLine: (reference: string, quantite: number) => { success: boolean; message?: string }
  updateQty: (reference: string, quantite: number) => { success: boolean; message?: string }
  removeLine: (reference: string) => void
  clearCart: () => void
  getCartTotals: (idClient: string) => CartTotals
  getLineCount: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  lignes: [],

  addLine: (reference, quantite) => {
    const product = useProductStore.getState().getByRef(reference)
    if (!product) return { success: false, message: 'Produit introuvable' }

    const existing = get().lignes.find(l => l.reference === reference)
    const totalQty = (existing?.quantiteSouhaitee || 0) + quantite
    const check = canAddToCart(product, totalQty)

    if (!check.allowed) {
      return { success: false, message: check.message }
    }

    if (existing) {
      set(state => ({
        lignes: state.lignes.map(l =>
          l.reference === reference ? { ...l, quantiteSouhaitee: totalQty } : l
        ),
      }))
    } else {
      set(state => ({ lignes: [...state.lignes, { reference, quantiteSouhaitee: quantite }] }))
    }
    return { success: true }
  },

  updateQty: (reference, quantite) => {
    if (quantite <= 0) {
      get().removeLine(reference)
      return { success: true }
    }

    const product = useProductStore.getState().getByRef(reference)
    if (!product) return { success: false, message: 'Produit introuvable' }

    const check = canAddToCart(product, quantite)
    if (!check.allowed) {
      return { success: false, message: check.message }
    }

    set(state => ({
      lignes: state.lignes.map(l =>
        l.reference === reference ? { ...l, quantiteSouhaitee: quantite } : l
      ),
    }))
    return { success: true }
  },

  removeLine: (reference) => {
    set(state => ({ lignes: state.lignes.filter(l => l.reference !== reference) }))
  },

  clearCart: () => set({ lignes: [] }),

  getCartTotals: (idClient) => {
    const { products } = useProductStore.getState()
    const { tvaRates, remises } = useConfigStore.getState()
    const lignes = get().lignes.map(l => ({ reference: l.reference, quantite: l.quantiteSouhaitee }))
    return calcCartTotals(lignes, products, tvaRates, idClient, remises)
  },

  getLineCount: () => get().lignes.reduce((sum, l) => sum + l.quantiteSouhaitee, 0),
}))
