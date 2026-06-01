import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'
import { ShoppingCart, User, LogOut, Package, BookOpen } from 'lucide-react'
import { RoleSwitcher } from './RoleSwitcher'

export function FrontOfficeLayout() {
  const { currentUser, currentClient, logout } = useAuthStore()
  const lineCount = useCartStore(s => s.lignes.length)
  const navigate = useNavigate()
  const location = useLocation()

  const navLinks = [
    { to: '/catalogue', label: 'Catalogue', icon: BookOpen },
    { to: '/commandes', label: 'Mes Commandes', icon: Package },
  ]

  return (
    <div className="min-h-screen bg-ivory-50 flex flex-col">
      <RoleSwitcher />
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-3">
              <span className="text-2xl">🦆</span>
              <span className="text-xl font-serif font-bold text-bordeaux-800">Le Canard Dodu</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname.startsWith(link.to)
                      ? 'bg-bordeaux-50 text-bordeaux-800'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <Link to="/panier" className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                {lineCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-bordeaux-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {lineCount}
                  </span>
                )}
              </Link>

              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 font-medium">{currentClient?.raisonSociale || currentUser?.prenom}</span>
              </div>

              <button
                onClick={() => { logout(); navigate('/login') }}
                className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-bordeaux-950 text-ivory-100 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-serif font-bold text-lg">Le Canard Dodu</p>
              <p className="text-sm text-bordeaux-300 mt-1">Producteur de spécialités gastronomiques depuis 1987</p>
            </div>
            <div className="text-sm text-bordeaux-300">
              <p>Siège : Paris · Agences : Lyon, Strasbourg, Bordeaux</p>
              <p className="mt-1">Portail B2B — Maquette de démonstration</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
