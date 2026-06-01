import { create } from 'zustand'
import { TVA, Remise, CodeTVA, TypeRemise } from '../types'
import { tvaRates as initialTvaRates } from '../data/tva'
import { initialRemises } from '../data/remises'

interface ConfigState {
  tvaRates: TVA[]
  remises: Remise[]
  francoSeuil: number
  fraisPort: number
  updateTVA: (codeTVA: CodeTVA, newRate: number) => void
  addRemise: (remise: Remise) => void
  removeRemise: (idRemise: string) => void
  updateRemise: (idRemise: string, updates: Partial<Remise>) => void
  updateFrancoSeuil: (seuil: number) => void
  resetConfig: () => void
}

export const useConfigStore = create<ConfigState>((set) => ({
  tvaRates: [...initialTvaRates],
  remises: [...initialRemises],
  francoSeuil: 500,
  fraisPort: 25,

  updateTVA: (codeTVA, newRate) => {
    set(state => ({
      tvaRates: state.tvaRates.map(t =>
        t.codeTVA === codeTVA ? { ...t, tauxTVA: newRate } : t
      ),
    }))
  },

  addRemise: (remise) => {
    set(state => ({ remises: [...state.remises, remise] }))
  },

  removeRemise: (idRemise) => {
    set(state => ({ remises: state.remises.filter(r => r.idRemise !== idRemise) }))
  },

  updateRemise: (idRemise, updates) => {
    set(state => ({
      remises: state.remises.map(r =>
        r.idRemise === idRemise ? { ...r, ...updates } : r
      ),
    }))
  },

  updateFrancoSeuil: (seuil) => set({ francoSeuil: seuil }),

  resetConfig: () => set({ tvaRates: [...initialTvaRates], remises: [...initialRemises], francoSeuil: 500, fraisPort: 25 }),
}))
