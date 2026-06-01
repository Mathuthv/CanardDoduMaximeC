import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useOrderStore } from '../../stores/orderStore'
import { Select } from '../../components/ui/Select'
import { Table } from '../../components/ui/Table'
import { OrderStatusBadge } from '../../components/shared/StatusBadge'
import { formatCurrency, formatDateShort, formatStatut } from '../../utils/formatters'
import { calcLineTotalHT } from '../../utils/calculations'
import { StatutCommande, Commande } from '../../types'
import { Package, Eye } from 'lucide-react'

export function OrderHistoryPage() {
  const navigate = useNavigate()
  const { currentClient } = useAuthStore()
  const { getByClient } = useOrderStore()

  const [statusFilter, setStatusFilter] = useState<string>('')

  const clientId = currentClient?.idClient || ''
  const allOrders = useMemo(() => getByClient(clientId), [clientId, getByClient])

  const filteredOrders = useMemo(() => {
    let result = [...allOrders]

    if (statusFilter) {
      result = result.filter(o => o.statut === statusFilter)
    }

    // Sort by most recent first
    result.sort((a, b) => b.dateValidationWeb.localeCompare(a.dateValidationWeb))

    return result
  }, [allOrders, statusFilter])

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    ...Object.values(StatutCommande).map(s => ({
      value: s,
      label: formatStatut(s),
    })),
  ]

  const calcOrderTotalTTC = (commande: Commande): number => {
    const totalHT = commande.lignes.reduce(
      (sum, l) => sum + calcLineTotalHT(l.quantiteCommandee, l.prixUnitaireHT, l.remiseAppliquee),
      0
    )
    // Approximate TTC (we don't have exact TVA info here, use ~10% average)
    return Math.round(totalHT * 1.1 * 100) / 100
  }

  const columns = [
    {
      key: 'numCommande',
      header: 'N. Commande',
      render: (item: Commande) => (
        <span className="font-medium text-bordeaux-800">{item.numCommande}</span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (item: Commande) => formatDateShort(item.dateValidationWeb),
    },
    {
      key: 'statut',
      header: 'Statut',
      render: (item: Commande) => <OrderStatusBadge statut={item.statut} />,
    },
    {
      key: 'nbArticles',
      header: 'Articles',
      render: (item: Commande) => (
        <span className="text-gray-600">{item.lignes.length} article{item.lignes.length > 1 ? 's' : ''}</span>
      ),
    },
    {
      key: 'total',
      header: 'Total HT',
      render: (item: Commande) => {
        const totalHT = item.lignes.reduce(
          (sum, l) => sum + calcLineTotalHT(l.quantiteCommandee, l.prixUnitaireHT, l.remiseAppliquee),
          0
        )
        return <span className="font-medium">{formatCurrency(totalHT)}</span>
      },
    },
    {
      key: 'actions',
      header: '',
      render: (item: Commande) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/commandes/${item.numCommande}`)
          }}
          className="p-1.5 text-bordeaux-700 hover:bg-bordeaux-50 rounded-lg transition-colors"
          title="Voir le detail"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
      className: 'w-12',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Mes commandes</h1>
          <p className="text-gray-500 mt-1">{allOrders.length} commande{allOrders.length > 1 ? 's' : ''} au total</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="w-64">
          <Select
            label="Filtrer par statut"
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
        <p className="text-sm text-gray-500 mt-6">
          {filteredOrders.length} resultat{filteredOrders.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <Table<Commande>
          columns={columns}
          data={filteredOrders}
          keyExtractor={(item) => item.numCommande}
          onRowClick={(item) => navigate(`/commandes/${item.numCommande}`)}
          emptyMessage="Aucune commande trouvee"
        />
      </div>
    </div>
  )
}
