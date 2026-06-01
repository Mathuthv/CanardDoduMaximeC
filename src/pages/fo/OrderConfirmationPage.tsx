import { useMemo, useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useOrderStore } from '../../stores/orderStore'
import { useProductStore } from '../../stores/productStore'
import { useAuthStore } from '../../stores/authStore'
import { initialClients } from '../../data/clients'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Alert } from '../../components/ui/Alert'
import { OrderStatusBadge } from '../../components/shared/StatusBadge'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { calcLineTotalHT } from '../../utils/calculations'
import { CheckCircle, Package, BookOpen, Truck, Mail, Calendar } from 'lucide-react'

export function OrderConfirmationPage() {
  const { num } = useParams<{ num: string }>()
  const { getByNum } = useOrderStore()
  const { getByRef } = useProductStore()
  const { currentClient } = useAuthStore()

  const commande = useMemo(() => getByNum(num || ''), [num, getByNum])

  // Mock email notification
  const [emailSent, setEmailSent] = useState(false)
  useEffect(() => {
    if (commande && !emailSent) {
      const timer = setTimeout(() => setEmailSent(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [commande, emailSent])

  if (!commande) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-gray-500 text-lg">Commande introuvable</p>
        <Link to="/catalogue"><Button>Retour au catalogue</Button></Link>
      </div>
    )
  }

  const orderTotal = commande.lignes.reduce((sum, l) => {
    return sum + calcLineTotalHT(l.quantiteCommandee, l.prixUnitaireHT, l.remiseAppliquee)
  }, 0)

  const deliveryAddress = currentClient?.adressesLivraison.find(a => a.id === commande.adresseLivraisonId)

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      {/* Success banner */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-forest-50 mx-auto">
          <CheckCircle className="w-10 h-10 text-forest-600" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-gray-900">Commande confirmee !</h1>
        <p className="text-gray-500">Merci pour votre commande. Nous la traitons immediatement.</p>
      </div>

      <Alert variant="success" title="Paiement accepte">
        Votre commande a ete validee et payee avec succes.
      </Alert>

      {/* Email notification mock */}
      {emailSent ? (
        <Alert variant="info" title="Confirmation envoyee">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>Un email de confirmation a ete envoye a <strong>{currentClient?.email || 'votre adresse'}</strong> avec le detail de la commande.</span>
          </div>
        </Alert>
      ) : (
        <div className="flex items-center gap-2 text-sm text-gray-400 justify-center">
          <Mail className="w-4 h-4 animate-pulse" />
          <span>Envoi de l'email de confirmation...</span>
        </div>
      )}

      {/* Order details card */}
      <Card padding="lg" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Numero de commande</p>
            <p className="text-2xl font-bold text-bordeaux-800">{commande.numCommande}</p>
          </div>
          <OrderStatusBadge statut={commande.statut} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Date de commande</p>
            <p className="font-medium">{formatDate(commande.dateValidationWeb)}</p>
          </div>
          <div>
            <p className="text-gray-500">Livraison souhaitee</p>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-bordeaux-700" />
              <p className="font-medium">
                {commande.dateLivraisonSouhaitee
                  ? formatDate(commande.dateLivraisonSouhaitee)
                  : '3-5 jours ouvres'}
              </p>
            </div>
          </div>
        </div>

        {deliveryAddress && (
          <div className="text-sm p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <Truck className="w-4 h-4 text-bordeaux-700" />
              <span className="font-medium">Adresse de livraison</span>
            </div>
            <p className="text-gray-600">{deliveryAddress.libelle} — {deliveryAddress.rue}, {deliveryAddress.codePostal} {deliveryAddress.ville}</p>
          </div>
        )}

        {/* Line items */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Articles commandes</h3>
          <div className="space-y-2">
            {commande.lignes.map(l => {
              const product = getByRef(l.reference)
              return (
                <div key={l.idLigne} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {product?.libelle || l.reference} x{l.quantiteCommandee}
                    {l.remiseAppliquee > 0 && (
                      <span className="text-forest-700 ml-1">(-{(l.remiseAppliquee * 100).toFixed(0)}%)</span>
                    )}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(calcLineTotalHT(l.quantiteCommandee, l.prixUnitaireHT, l.remiseAppliquee))}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between pt-3 mt-3 border-t border-gray-100 font-bold">
            <span>Total HT</span>
            <span className="text-bordeaux-800">{formatCurrency(orderTotal)}</span>
          </div>
        </div>
      </Card>

      {/* Next steps */}
      <Card padding="md" className="bg-ivory-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Prochaines etapes</h3>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Votre commande est transmise a notre equipe logistique</li>
          <li>Preparation et expedition sous 24-48h</li>
          <li>Livraison a l'adresse indiquee a la date souhaitee</li>
          <li>Facturation apres confirmation de l'expedition</li>
        </ol>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/commandes">
          <Button variant="primary" size="lg">
            <Package className="w-4 h-4 mr-2" /> Voir mes commandes
          </Button>
        </Link>
        <Link to="/catalogue">
          <Button variant="secondary" size="lg">
            <BookOpen className="w-4 h-4 mr-2" /> Retour au catalogue
          </Button>
        </Link>
      </div>
    </div>
  )
}
