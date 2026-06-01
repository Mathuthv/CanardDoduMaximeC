import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { Alert } from '../../components/ui/Alert'
import { VerrouBanner } from '../../components/shared/VerrouBanner'
import { RoleSwitcher } from '../../components/layout/RoleSwitcher'
import { LogIn, Building2 } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isLocked } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    setTimeout(() => {
      const result = login(email, password)
      setLoading(false)

      if (result.success) {
        navigate('/commande/preparation')
      } else {
        setError(result.message || 'Identifiants incorrects')
      }
    }, 400)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory-50 via-white to-bordeaux-50 flex flex-col">
      <RoleSwitcher />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Branding */}
          <div className="text-center mb-8">
            <span className="text-6xl block mb-4">🦆</span>
            <h1 className="text-3xl font-serif font-bold text-bordeaux-800">Le Canard Dodu</h1>
            <p className="text-gray-500 mt-2">Portail de commande B2B</p>
          </div>

          <Card padding="lg" className="shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center mb-2">
                <h2 className="text-lg font-semibold text-gray-900">Connexion</h2>
                <p className="text-sm text-gray-500 mt-1">Accedez a votre espace professionnel</p>
              </div>

              {error && !isLocked && (
                <Alert variant="error">
                  {error}
                  <p className="mt-2 text-xs">
                    Vous n'avez pas de compte ?{' '}
                    <button
                      type="button"
                      className="underline font-medium text-bordeaux-700 hover:text-bordeaux-900"
                      onClick={() => alert('Debranchement vers l\'activite externe « Creation client » (DS-03). Non decrite dans ce CU.')}
                    >
                      Demander la creation d'un compte
                    </button>
                  </p>
                </Alert>
              )}

              {isLocked && (
                <VerrouBanner
                  type="stock"
                  message="Compte verrouille apres 3 tentatives echouees. Contactez votre administrateur pour le deverrouiller."
                />
              )}

              <Input
                label="Adresse email"
                type="email"
                placeholder="votre@email.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLocked}
                required
              />

              <Input
                label="Mot de passe"
                type="password"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLocked}
                required
              />

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading || isLocked}
              >
                <LogIn className="w-4 h-4 mr-2" />
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </Button>

              <div className="text-center pt-2">
                <p className="text-xs text-gray-400 mb-3">
                  Demo : email = client@latabledoor.fr / mot de passe = demo2026
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/back-office')}
                  className="inline-flex items-center gap-1.5 text-sm text-bordeaux-600 hover:text-bordeaux-800 transition-colors"
                >
                  <Building2 className="w-4 h-4" />
                  Acces Back-Office
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
