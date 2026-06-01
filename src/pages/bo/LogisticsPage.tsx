import { useState, useMemo } from 'react'
import { useOrderStore } from '../../stores/orderStore'
import { useProductStore } from '../../stores/productStore'
import { initialClients } from '../../data/clients'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Table } from '../../components/ui/Table'
import { VerrouBanner } from '../../components/shared/VerrouBanner'
import { OrderStatusBadge } from '../../components/shared/StatusBadge'
import { formatDateShort } from '../../utils/formatters'
import { StatutCommande } from '../../types'
import type { Commande } from '../../types'
import { Truck, Package, CheckCircle } from 'lucide-react'

export function LogisticsPage() {
  const { commandes, setExpediedQty, validateExpedition } = useOrderStore()
  const { products } = useProductStore()
  const [selectedNum, setSelectedNum] = useState<string | null>(null)
  const [expediedQtys, setExpediedQtys] = useState<Record<string, number>>({})
  const [successMessage, setSuccessMessage] = useState('')

  // Orders eligible for logistics processing
  const logisticsOrders = useMemo(
    () =>
      commandes.filter(
        c => c.statut === StatutCommande.PAYEE_VALIDEE || c.statut === StatutCommande.EN_PREPARATION
      ),
    [commandes]
  )

  const selectedOrder = selectedNum ? commandes.find(c => c.numCommande === selectedNum) : null

  // Count of today's expeditions
  const today = new Date().toISOString().split('T')[0]
  const todayExpedited = commandes.filter(
    c => c.statut === StatutCommande.EXPEDIEE && c.dateExpedition === today
  ).length

  const handleSelectOrder = (order: Commande) => {
    setSelectedNum(order.numCommande)
    setSuccessMessage('')
    // Initialize expedied qtys with commandee values
    const qtys: Record<string, number> = {}
    for (const l of order.lignes) {
      qtys[l.idLigne] = l.quantiteExpediee ?? l.quantiteCommandee
    }
    setExpediedQtys(qtys)
  }

  const handleValidateExpedition = () => {
    if (!selectedOrder) return

    // Set expedied qty for each line
    for (const l of selectedOrder.lignes) {
      const qty = expediedQtys[l.idLigne] ?? l.quantiteCommandee
      setExpediedQty(selectedOrder.numCommande, l.idLigne, qty)
    }

    validateExpedition(selectedOrder.numCommande)
    setSuccessMessage(`Expedition validee pour la commande ${selectedOrder.numCommande}`)
    setSelectedNum(null)
    setExpediedQtys({})
  }

  const getClientName = (idClient: string) =>
    initialClients.find(c => c.idClient === idClient)?.raisonSociale || idClient

  const getProductName = (ref: string) =>
    products.find(p => p.reference === ref)?.libelle || ref

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Truck className="w-6 h-6 text-amber-600" />
          <h1 className="text-2xl font-serif font-bold text-gray-900">Logistique / Expeditions</h1>
        </div>
        <div className="flex items-center gap-2 text-sm bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <Package className="w-4 h-4 text-amber-600" />
          <span className="text-amber-800 font-medium">{todayExpedited} expedition(s) aujourd'hui</span>
        </div>
      </div>

      {successMessage && (
        <VerrouBanner
          type="logistics"
          message={successMessage}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Orders list */}
        <Card padding="sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Commandes a expedier</h2>
          {logisticsOrders.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">Aucune commande en attente d'expedition</p>
          ) : (
            <Table
              columns={[
                { key: 'numCommande', header: 'N° Commande', render: (c: Commande) => (
                  <span className="font-mono text-xs">{c.numCommande}</span>
                )},
                { key: 'idClient', header: 'Client', render: (c: Commande) => (
                  <span className="text-sm">{getClientName(c.idClient)}</span>
                )},
                { key: 'dateValidationWeb', header: 'Date', render: (c: Commande) => (
                  <span className="text-xs text-gray-500">{formatDateShort(c.dateValidationWeb)}</span>
                )},
                { key: 'articles', header: 'Articles', render: (c: Commande) => (
                  <span className="text-sm">{c.lignes.length}</span>
                )},
                { key: 'statut', header: 'Statut', render: (c: Commande) => (
                  <OrderStatusBadge statut={c.statut} />
                )},
              ]}
              data={logisticsOrders}
              keyExtractor={(c: Commande) => c.numCommande}
              onRowClick={handleSelectOrder}
              emptyMessage="Aucune commande en attente"
            />
          )}
        </Card>

        {/* Selected order detail */}
        <Card padding="sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Detail de l'expedition</h2>
          {!selectedOrder ? (
            <p className="text-sm text-gray-400 py-6 text-center">Selectionnez une commande pour preparer l'expedition</p>
          ) : (
            <div className="space-y-4">
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Commande :</span> {selectedOrder.numCommande}</p>
                <p><span className="font-medium">Client :</span> {getClientName(selectedOrder.idClient)}</p>
                <p><span className="font-medium">Statut :</span> <OrderStatusBadge statut={selectedOrder.statut} /></p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-600">
                      <th className="text-left py-2 px-2 font-medium">Produit</th>
                      <th className="text-center py-2 px-2 font-medium">Qte Cmd</th>
                      <th className="text-center py-2 px-2 font-medium">Qte Exp</th>
                      <th className="text-center py-2 px-2 font-medium">Ecart</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.lignes.map(l => {
                      const expQty = expediedQtys[l.idLigne] ?? l.quantiteCommandee
                      const ecart = l.quantiteCommandee - expQty
                      return (
                        <tr key={l.idLigne} className="border-b border-gray-50">
                          <td className="py-2 px-2">
                            <span className="font-medium">{getProductName(l.reference)}</span>
                            <span className="text-xs text-gray-400 ml-1">{l.reference}</span>
                          </td>
                          <td className="py-2 px-2 text-center">{l.quantiteCommandee}</td>
                          <td className="py-2 px-2 text-center">
                            <input
                              type="number"
                              min={0}
                              max={l.quantiteCommandee}
                              className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center"
                              value={expQty}
                              onChange={e =>
                                setExpediedQtys(prev => ({
                                  ...prev,
                                  [l.idLigne]: Math.min(
                                    l.quantiteCommandee,
                                    Math.max(0, parseInt(e.target.value) || 0)
                                  ),
                                }))
                              }
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            {ecart > 0 ? (
                              <span className="text-red-600 font-medium text-xs">
                                -{ecart} Reliquat
                              </span>
                            ) : (
                              <CheckCircle className="w-4 h-4 text-forest-600 mx-auto" />
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <Button className="w-full" onClick={handleValidateExpedition}>
                <Truck className="w-4 h-4 mr-2" />
                Valider l'expedition
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
