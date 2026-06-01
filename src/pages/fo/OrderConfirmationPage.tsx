import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useOrderStore } from '../../stores/orderStore'
import { useProductStore } from '../../stores/productStore'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Alert } from '../../components/ui/Alert'
import { OrderStatusBadge } from '../../components/shared/StatusBadge'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { calcLineTotalHT } from '../../utils/calculations'
import { CheckCircle, Package, BookOpen, Truck } from 'lucide-react'

export function OrderConfirmationPage() {
  const { num } = useParams<{ num: string }>()
  const { getByNum } = useOrderStore()
  const { getByRef } = useProductStore()

  const commande = useMemo(() => getByNum(num || ''), [num, getByNum])

  if (!commande) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-gray-500 text-lg">Commande introuvable</p>
        <Link to="/catalogue">
          <Button>Retour au catalogue</Button>
        </Link>
      </div>
    )
  }

  const orderTotal = commande.lignes.reduce((sum, l) => {
    return sum + calcLineTotalHT(l.quantiteCommandee, l.prixUnitaireHT, l.remiseAppliquee)
  }, 0)

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
            <p className="text-gray-500">Livraison estimee</p>
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-bordeaux-700" />
              <p className="font-medium">3-5 jours ouvres</p>
            </div>
          </div>
        </div>

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

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/commandes">
          <Button variant="primary" size="lg">
            <Package className="w-4 h-4 mr-2" />
            Voir mes commandes
          </Button>
        </Link>
        <Link to="/catalogue">
          <Button variant="secondary" size="lg">
            <BookOpen className="w-4 h-4 mr-2" />
            Retour au catalogue
          </Button>
        </Link>
      </div>
    </div>
  )
}
