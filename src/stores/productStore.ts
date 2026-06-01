import { create } from 'zustand'
import { Produit, CategorieProduit } from '../types'
import { initialProducts } from '../data/products'

interface ProductState {
  products: Produit[]
  getByRef: (ref: string) => Produit | undefined
  getByCategory: (cat: CategorieProduit) => Produit[]
  search: (query: string) => Produit[]
  updateStock: (ref: string, delta: number) => void
  updatePrice: (ref: string, newPrice: number) => void
  resetProducts: () => void
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [...initialProducts],

  getByRef: (ref) => get().products.find(p => p.reference === ref),

  getByCategory: (cat) => get().products.filter(p => p.categorie === cat),

  search: (query) => {
    const q = query.toLowerCase()
    return get().products.filter(p =>
      p.libelle.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.reference.toLowerCase().includes(q)
    )
  },

  updateStock: (ref, delta) => {
    set(state => ({
      products: state.products.map(p =>
        p.reference === ref
          ? { ...p, stockPhysiqueDisponible: Math.max(0, p.stockPhysiqueDisponible + delta) }
          : p
      ),
    }))
  },

  updatePrice: (ref, newPrice) => {
    set(state => ({
      products: state.products.map(p =>
        p.reference === ref ? { ...p, prixUnitaireHT: newPrice } : p
      ),
    }))
  },

  resetProducts: () => set({ products: [...initialProducts] }),
}))
