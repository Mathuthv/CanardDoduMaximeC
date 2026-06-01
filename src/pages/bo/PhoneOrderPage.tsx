import { useState, useMemo } from 'react'
import { useProductStore } from '../../stores/productStore'
import { useOrderStore } from '../../stores/orderStore'
import { useConfigStore } from '../../stores/configStore'
import { initialClients } from '../../data/clients'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { Alert } from '../../components/ui/Alert'
import { StockBadge } from '../../components/shared/StockBadge'
import { RemiseBadge } from '../../components/shared/RemiseBadge'
import { VerrouBanner } from '../../components/shared/VerrouBanner'
import { TVABreakdown } from '../../components/shared/TVABreakdown'
import { formatCurrency, generateId } from '../../utils/formatters'
import { calcLineTotalHT, calcTVABreakdown, calcFrancoDePort, findApplicableRemises, getBestRemise } from '../../utils/calculations'
import type { LigneCommande } from '../../types'
import { Plus, Trash2, Phone, Search } from 'lucide-react'

interface OrderLine {
  idLigne: string
  reference: string
  libelle: string
  quantiteCommandee: number
  prixUnitaireHT: number
  remiseAppliquee: number
}

export function PhoneOrderPage() {
  const { products, search, updateStock, getByRef } = useProductStore()
  const { createFromPhone } = useOrderStore()
  const { tvaRates, remises } = useConfigStore()

  const [selectedClientId, setSelectedClientId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [orderLines, setOrderLines] = useState<OrderLine[]>([])
  const [notes, setNotes] = useState('')
  const [qtyInputs, setQtyInputs] = useState<Record<string, number>>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [stockWarning, setStockWarning] = useState<{ ref: string; message: string; substitution?: string } | null>(null)

  const selectedClient = initialClients.find(c => c.idClient === selectedClientId)

  const clientOptions = initialClients.map(c => ({
    value: c.idClient,
    label: `${c.raisonSociale} (${c.idClient})`,
  }))

  const clientRemises = useMemo(() => {
    if (!selectedClientId) return []
    return remises.filter(r => !r.idClient || r.idClient === selectedClientId)
  }, [selectedClientId, remises])

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return []
    return search(searchQuery)
  }, [searchQuery, search])

  const handleAddLine = (ref: string) => {
    const product = getByRef(ref)
    if (!product) return

    const qty = qtyInputs[ref] || 1
    if (qty > product.stockPhysiqueDisponible) {
      // Find substitution
      const sameCategory = products.filter(
        p => p.categorie === product.categorie && p.reference !== ref && p.stockPhysiqueDisponible > 0
      )
      const sub = sameCategory.length > 0 ? sameCategory[0] : undefined
      setStockWarning({
        ref,
        message: `Stock insuffisant pour "${product.libelle}" : ${product.stockPhysiqueDisponible} disponible(s), ${qty} demande(s).`,
        substitution: sub ? `${sub.libelle} (${sub.reference}) — ${sub.stockPhysiqueDisponible} en stock` : undefined,
      })
      return
    }

    setStockWarning(null)

    const applicableRemises = selectedClientId
      ? findApplicableRemises(selectedClientId, 0, ref, remises)
      : []
    const remise = getBestRemise(applicableRemises)

    const existing = orderLines.find(l => l.reference === ref)
    if (existing) {
      setOrderLines(prev =>
        prev.map(l =>
          l.reference === ref ? { ...l, quantiteCommandee: l.quantiteCommandee + qty } : l
        )
      )
    } else {
      setOrderLines(prev => [
        ...prev,
        {
          idLigne: generateId('L'),
          reference: ref,
          libelle: product.libelle,
          quantiteCommandee: qty,
          prixUnitaireHT: product.prixUnitaireHT,
          remiseAppliquee: remise,
        },
      ])
    }
    setQtyInputs(prev => ({ ...prev, [ref]: 1 }))
  }

  const handleRemoveLine = (ref: string) => {
    setOrderLines(prev => prev.filter(l => l.reference !== ref))
  }

  const handleUpdateLineQty = (ref: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveLine(ref)
      return
    }
    setOrderLines(prev =>
      prev.map(l => (l.reference === ref ? { ...l, quantiteCommandee: qty } : l))
    )
  }

  // Totals calculation
  const totals = useMemo(() => {
    const totalHT = orderLines.reduce(
      (sum, l) => sum + calcLineTotalHT(l.quantiteCommandee, l.prixUnitaireHT, l.remiseAppliquee),
      0
    )
    const totalHTBrut = orderLines.reduce(
      (sum, l) => sum + l.quantiteCommandee * l.prixUnitaireHT,
      0
    )
    const totalRemises = totalHTBrut - totalHT

    const lines = orderLines.map(l => ({
      reference: l.reference,
      quantite: l.quantiteCommandee,
      prixUnitaireHT: l.prixUnitaireHT,
      remise: l.remiseAppliquee,
    }))
    const tvaBreakdown = calcTVABreakdown(lines, products, tvaRates)
    const totalTVA = tvaBreakdown.reduce((s, t) => s + t.montantTVA, 0)
    const { fraisPort, francoDePort } = calcFrancoDePort(totalHT)
    const totalTTC = Math.round((totalHT + totalTVA + fraisPort) * 100) / 100

    return { totalHT, totalHTBrut, totalRemises, tvaBreakdown, totalTVA, fraisPort, francoDePort, totalTTC }
  }, [orderLines, products, tvaRates])

  const handleValidate = () => {
    if (!selectedClientId || orderLines.length === 0) return

    const client = initialClients.find(c => c.idClient === selectedClientId)
    if (!client || client.adressesLivraison.length === 0) return

    const lignes: LigneCommande[] = orderLines.map(l => ({
      idLigne: l.idLigne,
      numCommande: '', // Will be set by store
      reference: l.reference,
      quantiteCommandee: l.quantiteCommandee,
      quantiteExpediee: null,
      remiseAppliquee: l.remiseAppliquee,
      prixUnitaireHT: l.prixUnitaireHT,
    }))

    const commande = createFromPhone(
      selectedClientId,
      'alain.birmont@canard-dodu.fr',
      'COM-001',
      client.adressesLivraison[0].id,
      lignes,
      notes || undefined
    )

    // Decrement stock
    for (const l of orderLines) {
      updateStock(l.reference, -l.quantiteCommandee)
    }

    setSuccessMessage(`Commande ${commande.numCommande} creee avec succes !`)
    setOrderLines([])
    setNotes('')
    setStockWarning(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Phone className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-serif font-bold text-gray-900">Prise de commande telephone</h1>
      </div>

      {successMessage && (
        <Alert variant="success" title="Commande validee">
          {successMessage}
        </Alert>
      )}

      {/* Client selection */}
      <Card padding="sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">1. Client</h2>
        <Select
          options={clientOptions}
          placeholder="-- Selectionner un client --"
          value={selectedClientId}
          onChange={e => {
            setSelectedClientId(e.target.value)
            setSuccessMessage('')
          }}
        />
        {selectedClient && (
          <div className="mt-3 text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Raison sociale :</span> {selectedClient.raisonSociale}</p>
            <p><span className="font-medium">Contact :</span> {selectedClient.contactPrincipal}</p>
            <p><span className="font-medium">Tel :</span> {selectedClient.telephone}</p>
            {clientRemises.filter(r => r.idClient === selectedClientId).length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <span className="font-medium">Remises actives :</span>
                {clientRemises
                  .filter(r => r.idClient === selectedClientId)
                  .map(r => (
                    <RemiseBadge key={r.idRemise} type={r.typeRemise} taux={r.taux} />
                  ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Product search */}
      <Card padding="sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">2. Recherche produit</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, reference..."
            className="block w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bordeaux-500"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {stockWarning && (
          <div className="mt-3">
            <VerrouBanner
              type="stock"
              message={stockWarning.message}
            />
            {stockWarning.substitution && (
              <p className="text-sm text-amber-700 mt-2 ml-8">
                Suggestion de substitution : <span className="font-medium">{stockWarning.substitution}</span>
              </p>
            )}
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-600">
                  <th className="text-left py-2 px-2 font-medium">Ref</th>
                  <th className="text-left py-2 px-2 font-medium">Produit</th>
                  <th className="text-left py-2 px-2 font-medium">Stock</th>
                  <th className="text-right py-2 px-2 font-medium">Prix HT</th>
                  <th className="text-center py-2 px-2 font-medium">Qte</th>
                  <th className="text-center py-2 px-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map(p => (
                  <tr key={p.reference} className="border-b border-gray-50">
                    <td className="py-2 px-2 font-mono text-xs text-gray-500">{p.reference}</td>
                    <td className="py-2 px-2">{p.libelle}</td>
                    <td className="py-2 px-2"><StockBadge stock={p.stockPhysiqueDisponible} /></td>
                    <td className="py-2 px-2 text-right">{formatCurrency(p.prixUnitaireHT)}</td>
                    <td className="py-2 px-2 w-20">
                      <input
                        type="number"
                        min={1}
                        className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center"
                        value={qtyInputs[p.reference] || 1}
                        onChange={e => setQtyInputs(prev => ({ ...prev, [p.reference]: parseInt(e.target.value) || 1 }))}
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <Button size="sm" onClick={() => handleAddLine(p.reference)} disabled={!selectedClientId}>
                        <Plus className="w-3 h-3 mr-1" />
                        Ajouter
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Order lines */}
      {orderLines.length > 0 && (
        <Card padding="sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">3. Lignes de commande</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-600">
                  <th className="text-left py-2 px-2 font-medium">Produit</th>
                  <th className="text-center py-2 px-2 font-medium">Qte</th>
                  <th className="text-right py-2 px-2 font-medium">Prix HT</th>
                  <th className="text-right py-2 px-2 font-medium">Remise</th>
                  <th className="text-right py-2 px-2 font-medium">Total HT</th>
                  <th className="text-center py-2 px-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {orderLines.map(l => (
                  <tr key={l.reference} className="border-b border-gray-50">
                    <td className="py-2 px-2">
                      <span className="font-medium">{l.libelle}</span>
                      <span className="text-xs text-gray-400 ml-2">{l.reference}</span>
                    </td>
                    <td className="py-2 px-2 w-20">
                      <input
                        type="number"
                        min={1}
                        className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center"
                        value={l.quantiteCommandee}
                        onChange={e => handleUpdateLineQty(l.reference, parseInt(e.target.value) || 0)}
                      />
                    </td>
                    <td className="py-2 px-2 text-right">{formatCurrency(l.prixUnitaireHT)}</td>
                    <td className="py-2 px-2 text-right">
                      {l.remiseAppliquee > 0 ? `${(l.remiseAppliquee * 100).toFixed(0)} %` : '—'}
                    </td>
                    <td className="py-2 px-2 text-right font-medium">
                      {formatCurrency(calcLineTotalHT(l.quantiteCommandee, l.prixUnitaireHT, l.remiseAppliquee))}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => handleRemoveLine(l.reference)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Totals + notes + validate */}
      {orderLines.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card padding="sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">4. Notes</h2>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bordeaux-500"
              rows={4}
              placeholder="Notes de l'appel telephonique..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </Card>

          <Card padding="sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Recapitulatif</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total brut HT</span>
                <span>{formatCurrency(totals.totalHTBrut)}</span>
              </div>
              {totals.totalRemises > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>Remises</span>
                  <span>-{formatCurrency(totals.totalRemises)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium">
                <span>Total HT</span>
                <span>{formatCurrency(totals.totalHT)}</span>
              </div>
              <TVABreakdown breakdown={totals.tvaBreakdown} />
              {totals.fraisPort > 0 ? (
                <div className="flex justify-between text-gray-500">
                  <span>Frais de port</span>
                  <span>{formatCurrency(totals.fraisPort)}</span>
                </div>
              ) : (
                <div className="flex justify-between text-forest-700">
                  <span>Franco de port</span>
                  <span>Offert</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                <span>Total TTC</span>
                <span className="text-bordeaux-800">{formatCurrency(totals.totalTTC)}</span>
              </div>
            </div>
            <Button
              className="w-full mt-4"
              onClick={handleValidate}
              disabled={!selectedClientId || orderLines.length === 0}
            >
              Valider la commande
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
