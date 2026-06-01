import { useState, useMemo } from 'react'
import { useOrderStore } from '../../stores/orderStore'
import { useInvoiceStore } from '../../stores/invoiceStore'
import { useProductStore } from '../../stores/productStore'
import { useConfigStore } from '../../stores/configStore'
import { initialClients } from '../../data/clients'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { Tabs } from '../../components/ui/Tabs'
import { Table } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import { VerrouBanner } from '../../components/shared/VerrouBanner'
import { OrderStatusBadge } from '../../components/shared/StatusBadge'
import { TVABreakdown } from '../../components/shared/TVABreakdown'
import { InvoicePDF } from '../../components/shared/InvoicePDF'
import { formatCurrency, formatDateShort } from '../../utils/formatters'
import { calcLineTotalHT, calcTVABreakdown, calcFrancoDePort } from '../../utils/calculations'
import { StatutCommande } from '../../types'
import type { Commande, Facture } from '../../types'
import { FileText, Receipt } from 'lucide-react'

export function InvoicingPage() {
  const { commandes } = useOrderStore()
  const { factures, generateInvoice } = useInvoiceStore()
  const { products } = useProductStore()
  const { tvaRates } = useConfigStore()

  const [selectedOrderNum, setSelectedOrderNum] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [invoiceModalFacture, setInvoiceModalFacture] = useState<Facture | null>(null)

  const getClientName = (idClient: string) =>
    initialClients.find(c => c.idClient === idClient)?.raisonSociale || idClient

  const getProductName = (ref: string) =>
    products.find(p => p.reference === ref)?.libelle || ref

  // Orders that could appear in the invoicing tab
  const invoicableOrders = useMemo(
    () =>
      commandes.filter(
        c =>
          c.statut === StatutCommande.EXPEDIEE ||
          c.statut === StatutCommande.PAYEE_VALIDEE ||
          c.statut === StatutCommande.EN_PREPARATION
      ),
    [commandes]
  )

  const selectedOrder = selectedOrderNum
    ? commandes.find(c => c.numCommande === selectedOrderNum)
    : null

  // Build invoice preview for selected expedied order
  const invoicePreview = useMemo(() => {
    if (!selectedOrder || selectedOrder.statut !== StatutCommande.EXPEDIEE) return null

    const lines = selectedOrder.lignes.map(l => {
      const qty = l.quantiteExpediee ?? l.quantiteCommandee
      return {
        reference: l.reference,
        libelle: getProductName(l.reference),
        quantite: qty,
        prixUnitaireHT: l.prixUnitaireHT,
        remise: l.remiseAppliquee,
        totalHT: calcLineTotalHT(qty, l.prixUnitaireHT, l.remiseAppliquee),
      }
    })

    const totalHT = lines.reduce((s, l) => s + l.totalHT, 0)
    const tvaBreakdown = calcTVABreakdown(
      lines.map(l => ({ reference: l.reference, quantite: l.quantite, prixUnitaireHT: l.prixUnitaireHT, remise: l.remise })),
      products,
      tvaRates
    )
    const totalTVA = tvaBreakdown.reduce((s, t) => s + t.montantTVA, 0)
    const { fraisPort, francoDePort } = calcFrancoDePort(totalHT)
    const totalTTC = Math.round((totalHT + totalTVA + fraisPort) * 100) / 100

    return { lines, totalHT, tvaBreakdown, totalTVA, fraisPort, francoDePort, totalTTC }
  }, [selectedOrder, products, tvaRates])

  const handleGenerateInvoice = () => {
    if (!selectedOrderNum) return
    const result = generateInvoice(selectedOrderNum)
    if (result.success && result.facture) {
      setSuccessMessage(`Facture ${result.facture.numFacture} emise pour la commande ${selectedOrderNum}`)
      setSelectedOrderNum(null)
    }
  }

  const tabAFacturer = (
    <div className="space-y-4">
      {successMessage && (
        <Alert variant="success" title="Facture emise">
          {successMessage}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Orders list */}
        <Card padding="sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Commandes</h3>
          <Table
            columns={[
              { key: 'numCommande', header: 'N° Cmd', render: (c: Commande) => (
                <span className="font-mono text-xs">{c.numCommande}</span>
              )},
              { key: 'idClient', header: 'Client', render: (c: Commande) => (
                <span className="text-sm">{getClientName(c.idClient)}</span>
              )},
              { key: 'date', header: 'Date', render: (c: Commande) => (
                <span className="text-xs text-gray-500">{formatDateShort(c.dateValidationWeb)}</span>
              )},
              { key: 'statut', header: 'Statut', render: (c: Commande) => (
                <OrderStatusBadge statut={c.statut} />
              )},
            ]}
            data={invoicableOrders}
            keyExtractor={(c: Commande) => c.numCommande}
            onRowClick={(c: Commande) => {
              setSelectedOrderNum(c.numCommande)
              setSuccessMessage('')
            }}
            emptyMessage="Aucune commande a facturer"
          />
        </Card>

        {/* Invoice preview */}
        <Card padding="sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Apercu facture</h3>

          {!selectedOrder ? (
            <p className="text-sm text-gray-400 py-6 text-center">Selectionnez une commande expediee pour generer la facture</p>
          ) : selectedOrder.statut !== StatutCommande.EXPEDIEE ? (
            <div className="space-y-3">
              <VerrouBanner
                type="logistics"
                message="Impossible de facturer — commande non expediee. Les quantites reellement expediees doivent etre validees par la logistique."
              />
              <Button disabled className="w-full">
                Emettre la facture
              </Button>
            </div>
          ) : invoicePreview ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Commande :</span> {selectedOrder.numCommande} — {getClientName(selectedOrder.idClient)}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-600">
                      <th className="text-left py-1 px-1 font-medium">Produit</th>
                      <th className="text-center py-1 px-1 font-medium">Qte Exp</th>
                      <th className="text-right py-1 px-1 font-medium">P.U. HT</th>
                      <th className="text-right py-1 px-1 font-medium">Remise</th>
                      <th className="text-right py-1 px-1 font-medium">Total HT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoicePreview.lines.map(l => (
                      <tr key={l.reference} className="border-b border-gray-50">
                        <td className="py-1 px-1">{l.libelle}</td>
                        <td className="py-1 px-1 text-center">{l.quantite}</td>
                        <td className="py-1 px-1 text-right">{formatCurrency(l.prixUnitaireHT)}</td>
                        <td className="py-1 px-1 text-right">{l.remise > 0 ? `${(l.remise * 100).toFixed(0)} %` : '—'}</td>
                        <td className="py-1 px-1 text-right font-medium">{formatCurrency(l.totalHT)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-1 text-sm border-t border-gray-200 pt-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total HT</span>
                  <span>{formatCurrency(invoicePreview.totalHT)}</span>
                </div>
                <TVABreakdown breakdown={invoicePreview.tvaBreakdown} />
                {invoicePreview.fraisPort > 0 ? (
                  <div className="flex justify-between text-gray-500">
                    <span>Frais de port</span>
                    <span>{formatCurrency(invoicePreview.fraisPort)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-forest-700">
                    <span>Franco de port</span>
                    <span>Offert</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200">
                  <span>Total TTC</span>
                  <span className="text-bordeaux-800">{formatCurrency(invoicePreview.totalTTC)}</span>
                </div>
              </div>

              <Button className="w-full" onClick={handleGenerateInvoice}>
                <Receipt className="w-4 h-4 mr-2" />
                Emettre la facture
              </Button>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  )

  const tabFacturesEmises = (
    <div className="space-y-4">
      <Table
        columns={[
          { key: 'numFacture', header: 'N° Facture', render: (f: Facture) => (
            <span className="font-mono text-xs font-medium">{f.numFacture}</span>
          )},
          { key: 'numCommande', header: 'N° Commande', render: (f: Facture) => (
            <span className="font-mono text-xs">{f.numCommande}</span>
          )},
          { key: 'dateEmission', header: 'Date', render: (f: Facture) => (
            <span className="text-xs text-gray-500">{formatDateShort(f.dateEmission)}</span>
          )},
          { key: 'idClient', header: 'Client', render: (f: Facture) => (
            <span className="text-sm">{getClientName(f.idClient)}</span>
          )},
          { key: 'totalTTC', header: 'Total TTC', render: (f: Facture) => (
            <span className="font-medium">{formatCurrency(f.totalTTC)}</span>
          ), className: 'text-right' },
        ]}
        data={factures}
        keyExtractor={(f: Facture) => f.numFacture}
        onRowClick={(f: Facture) => setInvoiceModalFacture(f)}
        emptyMessage="Aucune facture emise"
      />

      <Modal
        isOpen={!!invoiceModalFacture}
        onClose={() => setInvoiceModalFacture(null)}
        title={invoiceModalFacture ? `Facture ${invoiceModalFacture.numFacture}` : ''}
        size="lg"
      >
        {invoiceModalFacture && <InvoicePDF facture={invoiceModalFacture} />}
      </Modal>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <FileText className="w-6 h-6 text-purple-600" />
        <h1 className="text-2xl font-serif font-bold text-gray-900">Facturation</h1>
      </div>

      <Tabs
        tabs={[
          { id: 'a-facturer', label: 'A facturer', content: tabAFacturer },
          { id: 'emises', label: 'Factures emises', content: tabFacturesEmises },
        ]}
      />
    </div>
  )
}
