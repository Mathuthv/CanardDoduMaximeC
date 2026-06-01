import { useAuthStore } from '../../stores/authStore'
import { initialComptes } from '../../data/comptes'
import { Role } from '../../types'
import { useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'

const roleLabels: Record<Role, string> = {
  [Role.CLIENT]: 'Client B2B',
  [Role.PRISE_COMMANDE]: 'Alain — Prise de commande',
  [Role.LOGISTIQUE]: 'Matthieu — Logistique',
  [Role.FACTURATION]: 'Hélène — Facturation',
  [Role.DIRECTION_COMMERCIALE]: 'Françoise — Direction',
}

const roleColors: Record<Role, string> = {
  [Role.CLIENT]: 'bg-forest-600',
  [Role.PRISE_COMMANDE]: 'bg-blue-600',
  [Role.LOGISTIQUE]: 'bg-amber-600',
  [Role.FACTURATION]: 'bg-purple-600',
  [Role.DIRECTION_COMMERCIALE]: 'bg-bordeaux-700',
}

export function RoleSwitcher() {
  const { currentUser, switchRole } = useAuthStore()
  const navigate = useNavigate()

  const handleSwitch = (login: string) => {
    switchRole(login)
    const compte = initialComptes.find(c => c.login === login)
    if (compte?.role === Role.CLIENT) {
      navigate('/dashboard')
    } else {
      const roleRoutes: Record<string, string> = {
        [Role.PRISE_COMMANDE]: '/back-office/commandes-telephone',
        [Role.LOGISTIQUE]: '/back-office/logistique',
        [Role.FACTURATION]: '/back-office/facturation',
        [Role.DIRECTION_COMMERCIALE]: '/back-office/parametrage',
      }
      navigate(roleRoutes[compte?.role || ''] || '/back-office')
    }
  }

  return (
    <div className="bg-gray-900 text-white py-1.5 px-4 text-xs flex items-center gap-4 z-50">
      <div className="flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5 text-gold-400" />
        <span className="text-gold-400 font-medium">MODE DEMO</span>
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        {initialComptes.filter(c => c.role !== Role.CLIENT || c.login === 'client@latabledoor.fr').map(compte => (
          <button
            key={compte.login}
            onClick={() => handleSwitch(compte.login)}
            className={`px-2 py-0.5 rounded text-xs transition-all ${
              currentUser?.login === compte.login
                ? `${roleColors[compte.role]} text-white font-medium ring-1 ring-white/30`
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {compte.prenom} {compte.nom}
          </button>
        ))}
      </div>
    </div>
  )
}
