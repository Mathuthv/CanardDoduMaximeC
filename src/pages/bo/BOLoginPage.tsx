import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { RoleSwitcher } from '../../components/layout/RoleSwitcher'
import { Phone, Truck, FileText, BarChart3 } from 'lucide-react'

const roles = [
  {
    login: 'alain.birmont@canard-dodu.fr',
    name: 'Alain Birmont',
    role: 'Prise de commande',
    description: 'Saisie des commandes par telephone, gestion du catalogue et suivi client.',
    icon: Phone,
    initials: 'AB',
    color: 'bg-blue-600',
    borderColor: 'border-blue-200',
    hoverBorder: 'hover:border-blue-400',
    route: '/back-office/commandes-telephone',
  },
  {
    login: 'matthieu.flechard@canard-dodu.fr',
    name: 'Matthieu Flechard',
    role: 'Logistique',
    description: 'Preparation des expeditions, gestion des quantites expediees et reliquats.',
    icon: Truck,
    initials: 'MF',
    color: 'bg-amber-600',
    borderColor: 'border-amber-200',
    hoverBorder: 'hover:border-amber-400',
    route: '/back-office/logistique',
  },
  {
    login: 'helene.mirabelle@canard-dodu.fr',
    name: 'Helene Mirabelle',
    role: 'Facturation',
    description: 'Emission des factures, gestion des avoirs et traitement des litiges.',
    icon: FileText,
    initials: 'HM',
    color: 'bg-purple-600',
    borderColor: 'border-purple-200',
    hoverBorder: 'hover:border-purple-400',
    route: '/back-office/facturation',
  },
  {
    login: 'francoise.delgas@canard-dodu.fr',
    name: 'Francoise Delgas-Pelissier',
    role: 'Direction commerciale',
    description: 'Parametrage tarifaire, pilotage BI, suivi des primes commerciales.',
    icon: BarChart3,
    initials: 'FD',
    color: 'bg-bordeaux-700',
    borderColor: 'border-bordeaux-200',
    hoverBorder: 'hover:border-bordeaux-400',
    route: '/back-office/parametrage',
  },
]

export function BOLoginPage() {
  const navigate = useNavigate()
  const { switchRole, currentUser } = useAuthStore()

  const handleSelectRole = (login: string, route: string) => {
    switchRole(login)
    navigate(route)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleSwitcher />
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-bold text-bordeaux-800">
            Le Canard Dodu
          </h1>
          <p className="text-lg text-gray-500 mt-1">Back-Office</p>
          <p className="text-sm text-gray-400 mt-3">
            Selectionnez votre profil pour acceder a votre espace de travail
          </p>
        </div>

        {/* Role cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((r) => {
            const Icon = r.icon
            const isActive = currentUser?.login === r.login
            return (
              <Card
                key={r.login}
                padding="lg"
                hover
                className={`transition-all ${r.borderColor} ${r.hoverBorder} ${isActive ? 'ring-2 ring-bordeaux-400' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 ${r.color} rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                    {r.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg">{r.name}</h3>
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5 mt-0.5">
                      <Icon className="w-4 h-4" />
                      {r.role}
                    </p>
                    <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                      {r.description}
                    </p>
                    <Button
                      size="sm"
                      className="mt-4"
                      onClick={() => handleSelectRole(r.login, r.route)}
                    >
                      Se connecter
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Link to client portal */}
        <div className="text-center mt-10">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-bordeaux-700 hover:text-bordeaux-900 underline underline-offset-2"
          >
            Acces portail client
          </button>
        </div>
      </div>
    </div>
  )
}
