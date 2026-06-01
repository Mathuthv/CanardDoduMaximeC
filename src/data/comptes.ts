import { CompteWeb, Role } from '../types'

export const initialComptes: CompteWeb[] = [
  { login: 'client@latabledoor.fr', idClient: 'CLI-001', motDePasseHash: 'demo2026', derniereConnexion: '2026-05-28T14:30:00', role: Role.CLIENT, nom: 'Fontaine', prenom: 'Marie' },
  { login: 'client@bistrotdumarche.fr', idClient: 'CLI-002', motDePasseHash: 'demo2026', derniereConnexion: '2026-05-25T09:15:00', role: Role.CLIENT, nom: 'Moreau', prenom: 'Jean-Pierre' },
  { login: 'alain.birmont@canard-dodu.fr', idClient: '', motDePasseHash: 'demo2026', derniereConnexion: '2026-05-30T08:00:00', role: Role.PRISE_COMMANDE, nom: 'Birmont', prenom: 'Alain' },
  { login: 'matthieu.flechard@canard-dodu.fr', idClient: '', motDePasseHash: 'demo2026', derniereConnexion: '2026-05-30T07:45:00', role: Role.LOGISTIQUE, nom: 'Fléchard', prenom: 'Matthieu' },
  { login: 'helene.mirabelle@canard-dodu.fr', idClient: '', motDePasseHash: 'demo2026', derniereConnexion: '2026-05-29T16:20:00', role: Role.FACTURATION, nom: 'Mirabelle', prenom: 'Hélène' },
  { login: 'francoise.delgas@canard-dodu.fr', idClient: '', motDePasseHash: 'demo2026', derniereConnexion: '2026-05-30T10:00:00', role: Role.DIRECTION_COMMERCIALE, nom: 'Delgas-Pélissier', prenom: 'Françoise' },
]
