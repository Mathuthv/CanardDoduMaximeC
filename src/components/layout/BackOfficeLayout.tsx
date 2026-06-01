import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Role } from '../../types'
import { RoleSwitcher } from './RoleSwitcher'
import { Phone, Truck, FileText, CreditCard, Settings, BarChart3, LogOut } from 'lucide-react'

const menuByRole: Record<string, { to: string; label: string; icon: typeof Phone }[]> = {
  [Role.PRISE_COMMANDE]: [
    { to: '/back-office/commandes-telephone', label: 'Commande téléphone', icon: Phone },
  ],
  [Role.LOGISTIQUE]: [
    { to: '/back-office/logistique', label: 'Logistique', icon: Truck },
  ],
  [Role.FACTURATION]: [
    { to: '/back-office/facturation', label: 'Facturation', icon: FileText },
    { to: '/back-office/avoirs', label: 'Avoirs / SAV', icon: CreditCard },
  ],
  [Role.DIRECTION_COMMERCIALE]: [
    { to: '/back-office/parametrage', label: 'Paramétrage', icon: Settings },
    { to: '/back-office/bi', label: 'Tableaux de bord', icon: BarChart3 },
  ],
}

export function BackOfficeLayout() {
  const { currentUser, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const role = currentUser?.role || Role.PRISE_COMMANDE
  const menu = menuByRole[role] || []

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <RoleSwitcher />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-800">
            <Link to="/back-office" className="flex items-center gap-2">
              <span className="text-xl">🦆</span>
              <div>
                <p className="font-serif font-bold text-sm">Le Canard Dodu</p>
                <p className="text-xs text-gray-400">Back-Office</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 py-4">
            {menu.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  location.pathname === item.to
                    ? 'bg-bordeaux-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-bordeaux-700 flex items-center justify-center text-xs font-bold">
                {currentUser?.prenom?.[0]}{currentUser?.nom?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentUser?.prenom} {currentUser?.nom}</p>
                <p className="text-xs text-gray-400 truncate">{currentUser?.login}</p>
              </div>
              <button
                onClick={() => { logout(); navigate('/back-office') }}
                className="p-1.5 rounded hover:bg-gray-800 transition-colors"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
