import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useOrderStore } from '../../stores/orderStore'
import { useInvoiceStore } from '../../stores/invoiceStore'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { OrderStatusBadge } from '../../components/shared/StatusBadge'
import { formatCurrency, formatDateShort } from '../../utils/formatters'
import { StatutCommande } from '../../types'
import { ShoppingBag, FileText, TrendingUp, Package, ArrowRight, BookOpen } from 'lucide-react'

export function DashboardPage() {
  const { currentUser, currentClient } = useAuthStore()
  const { getByClient } = useOrderStore()
  const { getByClient: getInvoicesByClient } = useInvoiceStore()

  const clientId = currentClient?.idClient || ''

  const orders = useMemo(() => getByClient(clientId), [clientId, getByClient])
  const invoices = useMemo(() => getInvoicesByClient(clientId), [clientId, getInvoicesByClient])

  const commandesEnCours = useMemo(
    () => orders.filter(o => o.statut !== StatutCommande.FACTUREE),
    [orders]
  )

  const lastInvoice = useMemo(
    () => invoices.length > 0 ? invoices[invoices.length - 1] : null,
    [invoices]
  )

  const totalAchats = useMemo(
    () => invoices.reduce((sum, f) => sum + f.totalTTC, 0),
    [invoices]
  )

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => b.dateValidationWeb.localeCompare(a.dateValidationWeb)).slice(0, 5),
    [orders]
  )

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-gray-900">
          Bonjour, {currentUser?.prenom} !
        </h1>
        <p className="text-gray-500 mt-1">
          Bienvenue sur votre espace {currentClient?.raisonSociale}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md" className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-bordeaux-50">
            <Package className="w-5 h-5 text-bordeaux-700" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Commandes en cours</p>
            <p className="text-2xl font-bold text-gray-900">{commandesEnCours.length}</p>
          </div>
        </Card>

        <Card padding="md" className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-forest-50">
            <FileText className="w-5 h-5 text-forest-700" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Derniere facture</p>
            <p className="text-2xl font-bold text-gray-900">
              {lastInvoice ? formatCurrency(lastInvoice.totalTTC) : '---'}
            </p>
          </div>
        </Card>

        <Card padding="md" className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-gold-50">
            <TrendingUp className="w-5 h-5 text-gold-700" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total achats</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAchats)}</p>
          </div>
        </Card>

        <Card padding="md" className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-blue-50">
            <ShoppingBag className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total commandes</p>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-semibold text-gray-900">Commandes recentes</h2>
            <Link to="/commandes" className="text-sm text-bordeaux-700 hover:text-bordeaux-900 flex items-center gap-1">
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">Aucune commande pour le moment</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <Link
                  key={order.numCommande}
                  to={`/commandes/${order.numCommande}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-ivory-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.numCommande}</p>
                    <p className="text-xs text-gray-500">{formatDateShort(order.dateValidationWeb)}</p>
                  </div>
                  <OrderStatusBadge statut={order.statut} />
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Links */}
        <Card padding="md">
          <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4">Acces rapide</h2>
          <div className="space-y-3">
            <Link to="/commande/preparation" className="flex items-center gap-4 p-4 rounded-lg border-2 border-bordeaux-200 bg-bordeaux-50/30 hover:bg-bordeaux-50 transition-colors">
              <div className="p-3 rounded-lg bg-bordeaux-700">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-bordeaux-900">Passer une nouvelle commande</p>
                <p className="text-sm text-bordeaux-600">Selectionnez vos adresses puis parcourez le catalogue</p>
              </div>
              <ArrowRight className="w-4 h-4 text-bordeaux-400 ml-auto" />
            </Link>

            <Link to="/catalogue" className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-bordeaux-200 hover:bg-bordeaux-50/50 transition-colors">
              <div className="p-3 rounded-lg bg-bordeaux-50">
                <BookOpen className="w-5 h-5 text-bordeaux-700" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Parcourir le catalogue</p>
                <p className="text-sm text-gray-500">Decouvrez nos specialites gastronomiques</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
            </Link>

            <Link to="/panier" className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-bordeaux-200 hover:bg-bordeaux-50/50 transition-colors">
              <div className="p-3 rounded-lg bg-forest-50">
                <ShoppingBag className="w-5 h-5 text-forest-700" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Mon panier</p>
                <p className="text-sm text-gray-500">Voir et modifier votre panier en cours</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
            </Link>

            <Link to="/commandes" className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-bordeaux-200 hover:bg-bordeaux-50/50 transition-colors">
              <div className="p-3 rounded-lg bg-gold-50">
                <Package className="w-5 h-5 text-gold-700" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Suivi des commandes</p>
                <p className="text-sm text-gray-500">Suivez l'avancement de vos commandes</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
