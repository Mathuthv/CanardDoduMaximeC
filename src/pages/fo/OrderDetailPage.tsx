import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useOrderStore } from '../../stores/orderStore'
import { useInvoiceStore } from '../../stores/invoiceStore'
import { useAvoirStore } from '../../stores/avoirStore'
import { useProductStore } from '../../stores/productStore'
import { useAuthStore } from '../../stores/authStore'
import { StatutCommande } from '../../types'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { Table } from '../../components/ui/Table'
import { OrderStatusBadge } from '../../components/shared/StatusBadge'
import { TVABreakdown } from '../../components/shared/TVABreakdown'
import { InvoicePDF } from '../../components/shared/InvoicePDF'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { calcLineTotalHT, calcTVABreakdown } from '../../utils/calculations'
import { useConfigStore } from '../../stores/configStore'
import { ArrowLeft, FileText, AlertTriangle, Truck } from 'lucide-react'

const STATUS_STEPS = [
  { statut: StatutCommande.PAYEE_VALIDEE, label: 'Validee' },
  { statut: StatutCommande.EN_PREPARATION, label: 'En preparation' },
  { statut: StatutCommande.EXPEDIEE, label: 'Expediee' },
  { statut: StatutCommande.FACTUREE, label: 'Facturee' },
]

const statusOrder: Record<string, number> = {
  [StatutCommande.PANIER_EN_COURS]: 0,
  [StatutCommande.EN_ATTENTE_PAIEMENT]: 0,
  [StatutCommande.PAYEE_VALIDEE]: 1,
  [StatutCommande.EN_PREPARATION]: 2,
  [StatutCommande.EXPEDIEE]: 3,
  [StatutCommande.FACTUREE]: 4,
}

export function OrderDetailPage() {
  const { num } = useParams<{ num: string }>()
  const { getByNum } = useOrderStore()
  const { getByCommande } = useInvoiceStore()
  const { getAvoirsByClient } = useAvoirStore()
  const { getByRef, products } = useProductStore()
  const { currentClient } = useAuthStore()
  const { tvaRates } = useConfigStore()
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)

  const commande = useMemo(() => getByNum(num || ''), [num, getByNum])
  const facture = useMemo(
    () => (commande ? getByCommande(commande.numCommande) : undefined),
    [commande, getByCommande]
  )
  const avoirs = useMemo(
    () => (currentClient ? getAvoirsByClient(currentClient.idClient) : []),
    [currentClient, getAvoirsByClient]
  )

  if (!commande) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-gray-500 text-lg">Commande introuvable</p>
        <Link to="/commandes">
          <Button>Retour aux commandes</Button>
        </Link>
      </div>
    )
  }

  const currentStepIndex = statusOrder[commande.statut] || 0

  const totalHT = commande.lignes.reduce(
    (sum, l) => sum + calcLineTotalHT(l.quantiteCommandee, l.prixUnitaireHT, l.remiseAppliquee),
    0
  )

  const tvaBreakdown = calcTVABreakdown(
    commande.lignes.map(l => ({
      reference: l.reference,
      quantite: l.quantiteCommandee,
      prixUnitaireHT: l.prixUnitaireHT,
      remise: l.remiseAppliquee,
    })),
    products,
    tvaRates
  )

  const totalTVA = tvaBreakdown.reduce((s, t) => s + t.montantTVA, 0)

  const deliveryAddress = currentClient?.adressesLivraison.find(
    a => a.id === commande.adresseLivraisonId
  )

  const relatedAvoirs = facture
    ? avoirs.filter(a => a.numFacture === facture.numFacture)
    : []

  type LigneDisplay = {
    idLigne: string
    reference: string
    libelle: string
    qteCommandee: number
    qteExpediee: number | null
    prixUnitaire: number
    remise: number
    totalHT: number
  }

  const ligneData: LigneDisplay[] = commande.lignes.map(l => {
    const product = getByRef(l.reference)
    return {
      idLigne: l.idLigne,
      reference: l.reference,
      libelle: product?.libelle || l.reference,
      qteCommandee: l.quantiteCommandee,
      qteExpediee: l.quantiteExpediee,
      prixUnitaire: l.prixUnitaireHT,
      remise: l.remiseAppliquee,
      totalHT: calcLineTotalHT(l.quantiteCommandee, l.prixUnitaireHT, l.remiseAppliquee),
    }
  })

  const ligneColumns = [
    { key: 'libelle', header: 'Produit', render: (item: LigneDisplay) => <span className="font-medium">{item.libelle}</span> },
    { key: 'qteCommandee', header: 'Qte commandee', render: (item: LigneDisplay) => item.qteCommandee },
    {
      key: 'qteExpediee',
      header: 'Qte expediee',
      render: (item: LigneDisplay) => item.qteExpediee !== null ? item.qteExpediee : <span className="text-gray-400">---</span>,
    },
    { key: 'prixUnitaire', header: 'P.U. HT', render: (item: LigneDisplay) => formatCurrency(item.prixUnitaire) },
    {
      key: 'remise',
      header: 'Remise',
      render: (item: LigneDisplay) => item.remise > 0 ? <span className="text-forest-700">-{(item.remise * 100).toFixed(0)} %</span> : <span className="text-gray-400">---</span>,
    },
    {
      key: 'totalHT',
      header: 'Total HT',
      render: (item: LigneDisplay) => <span className="font-medium">{formatCurrency(item.totalHT)}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <Link
        to="/commandes"
        className="inline-flex items-center gap-1.5 text-sm text-bordeaux-700 hover:text-bordeaux-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux commandes
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">
            Commande {commande.numCommande}
          </h1>
          <p className="text-gray-500 mt-1">Passee le {formatDate(commande.dateValidationWeb)}</p>
        </div>
        <OrderStatusBadge statut={commande.statut} />
      </div>

      {/* Status Timeline */}
      <Card padding="md">
        <div className="flex items-center justify-between">
          {STATUS_STEPS.map((step, index) => {
            const isCompleted = currentStepIndex >= index + 1
            const isCurrent = currentStepIndex === index + 1
            return (
              <div key={step.statut} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isCompleted
                        ? 'bg-forest-600 text-white'
                        : isCurrent
                        ? 'bg-bordeaux-700 text-white ring-4 ring-bordeaux-100'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`text-xs mt-1.5 text-center ${
                      isCompleted || isCurrent ? 'font-medium text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < STATUS_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 mt-[-1rem] ${
                      currentStepIndex > index + 1 ? 'bg-forest-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Delivery address */}
      {deliveryAddress && (
        <Card padding="md">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-4 h-4 text-bordeaux-700" />
            <h2 className="font-medium text-gray-900">Adresse de livraison</h2>
          </div>
          <p className="text-sm text-gray-600">
            {deliveryAddress.libelle} — {deliveryAddress.rue}, {deliveryAddress.codePostal} {deliveryAddress.ville}
          </p>
        </Card>
      )}

      {/* Line items */}
      <Card padding="none">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-serif font-semibold text-gray-900">Detail des articles</h2>
        </div>
        <Table<LigneDisplay>
          columns={ligneColumns}
          data={ligneData}
          keyExtractor={(item) => item.idLigne}
        />
      </Card>

      {/* Totals */}
      <Card padding="md">
        <div className="flex justify-end">
          <div className="w-80 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total HT</span>
              <span className="font-medium">{formatCurrency(totalHT)}</span>
            </div>
            <TVABreakdown breakdown={tvaBreakdown} />
            <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-200">
              <span>Total TTC (estime)</span>
              <span className="text-bordeaux-800">{formatCurrency(totalHT + totalTVA)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Invoice section */}
      {commande.statut === StatutCommande.FACTUREE && facture && (
        <Card padding="md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-bordeaux-700" />
              <div>
                <h2 className="font-medium text-gray-900">Facture {facture.numFacture}</h2>
                <p className="text-sm text-gray-500">Emise le {formatDate(facture.dateEmission)} — {formatCurrency(facture.totalTTC)} TTC</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowInvoiceModal(true)}>
                Voir la facture
              </Button>
              <Link to={`/litige/${facture.numFacture}`}>
                <Button variant="ghost" size="sm">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Signaler un litige
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Credit notes */}
      {relatedAvoirs.length > 0 && (
        <Card padding="md">
          <h2 className="font-serif font-semibold text-gray-900 mb-3">Avoirs associes</h2>
          {relatedAvoirs.map(a => (
            <div key={a.numAvoir} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="font-medium text-sm">{a.numAvoir}</p>
                <p className="text-xs text-gray-500">{a.motifAvoir}</p>
              </div>
              <span className="font-medium text-forest-700">{formatCurrency(a.montantTTC)}</span>
            </div>
          ))}
        </Card>
      )}

      {/* Invoice Modal */}
      {facture && (
        <Modal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          title={`Facture ${facture.numFacture}`}
          size="xl"
        >
          <InvoicePDF facture={facture} />
        </Modal>
      )}
    </div>
  )
}
