import { create } from 'zustand'
import { CompteWeb, Role, Client } from '../types'
import { initialComptes } from '../data/comptes'
import { initialClients } from '../data/clients'

interface AuthState {
  currentUser: CompteWeb | null
  currentClient: Client | null
  isAuthenticated: boolean
  loginAttempts: number
  isLocked: boolean
  login: (email: string, password: string) => { success: boolean; message?: string }
  logout: () => void
  switchRole: (login: string) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  currentClient: null,
  isAuthenticated: false,
  loginAttempts: 0,
  isLocked: false,

  login: (email: string, password: string) => {
    const state = get()
    if (state.isLocked) {
      return { success: false, message: 'Compte verrouillé. Contactez votre administrateur.' }
    }

    const compte = initialComptes.find(c => c.login === email && c.motDePasseHash === password)
    if (!compte) {
      const newAttempts = state.loginAttempts + 1
      const locked = newAttempts >= 3
      set({ loginAttempts: newAttempts, isLocked: locked })
      return {
        success: false,
        message: locked
          ? 'Compte verrouillé après 3 tentatives. Contactez votre administrateur.'
          : `Identifiants incorrects. Tentative ${newAttempts}/3.`
      }
    }

    const client = compte.idClient ? initialClients.find(c => c.idClient === compte.idClient) || null : null
    set({ currentUser: compte, currentClient: client, isAuthenticated: true, loginAttempts: 0, isLocked: false })
    return { success: true }
  },

  logout: () => {
    set({ currentUser: null, currentClient: null, isAuthenticated: false, loginAttempts: 0, isLocked: false })
  },

  switchRole: (login: string) => {
    const compte = initialComptes.find(c => c.login === login)
    if (!compte) return
    const client = compte.idClient ? initialClients.find(c => c.idClient === compte.idClient) || null : null
    set({ currentUser: compte, currentClient: client, isAuthenticated: true, loginAttempts: 0, isLocked: false })
  },
}))
