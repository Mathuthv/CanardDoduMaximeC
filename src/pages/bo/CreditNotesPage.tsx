import { useState, useMemo } from 'react'
import { useAvoirStore } from '../../stores/avoirStore'
import { useInvoiceStore } from '../../stores/invoiceStore'
import { initialClients } from '../../data/clients'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { Tabs } from '../../components/ui/Tabs'
import { Table } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Select'
import { VerrouBanner } from '../../components/shared/VerrouBanner'
import { LitigeStatusBadge } from '../../components/shared/StatusBadge'
import { formatCurrency, formatDateShort } from '../../utils/formatters'
import { StatutLitige } from '../../types'
import type { Litige, Avoir, LigneFacture } from '../../types'
import { FileWarning, CreditCard } from 'lucide-react'

export function CreditNotesPage() {
  const { avoirs, getOpenLitiges, updateLitigeStatut, createAvoir } = useAvoirStore()
  const { factures } = useInvoiceStore()

  const [selectedLitige, setSelectedLitige] = useState<Litige | null>(null)
  const [refuseComment, setRefuseComment] = useState('')
  const [showRefuseInput, setShowRefuseInput] = useState(false)

  // Create avoir tab state
  const [avoirFactureNum, setAvoirFactureNum] = useState('')
  const [avoirMotif, setAvoirMotif] = useState('')
  const [selectedLines, setSelectedLines] = useState<Record<string, { selected: boolean; qty: number }>>({})
  const [avoirSuccess, setAvoirSuccess] = useState('')

  const openLitiges = getOpenLitiges()

  const getClientName = (idClient: string) =>
    initialClients.find(c => c.idClient === idClient)?.raisonSociale || idClient

  const selectedFacture = useMemo(
    () => (avoirFactureNum ? factures.find(f => f.numFacture === avoirFactureNum) : null),
    [avoirFactureNum, factures]
  )

  const factureOptions = factures.map(f => ({
    value: f.numFacture,
    label: `${f.numFacture} — ${getClientName(f.idClient)} (${formatCurrency(f.totalTTC)})`,
  }))

  const handleAcceptLitige = (litige: Litige) => {
    updateLitigeStatut(litige.idLitige, StatutLitige.ACCEPTE, 'Litige accepte, avoir a emettre.')
    setSelectedLitige(null)
    // Pre-fill the create avoir tab
    setAvoirFactureNum(litige.numFacture)
    setAvoirMotif(litige.description)
  }

  const handleRefuseLitige = (litige: Litige) => {
    if (!refuseComment.trim()) return
    updateLitigeStatut(litige.idLitige, StatutLitige.REFUSE, refuseComment)
    setSelectedLitige(null)
    setRefuseComment('')
    setShowRefuseInput(false)
  }

  const handleSelectFacture = (numFacture: string) => {
    setAvoirFactureNum(numFacture)
    setAvoirSuccess('')
    const facture = factures.find(f => f.numFacture === numFacture)
    if (facture) {
      const lines: Record<string, { selected: boolean; qty: number }> = {}
      facture.lignes.forEach((l, i) => {
        lines[`${l.reference}-${i}`] = { selected: false, qty: l.quantite }
      })
      setSelectedLines(lines)
    }
  }

  const handleCreateAvoir = () => {
    if (!selectedFacture || !avoirMotif.trim()) return

    const linesToCredit = selectedFacture.lignes
      .map((l, i) => {
        const key = `${l.reference}-${i}`
        const sel = selectedLines[key]
        if (!sel?.selected) return null
        const qty = Math.min(sel.qty, l.quantite)
        const ratio = qty / l.quantite
        return {
          ...l,
          quantite: qty,
          totalLigneHT: Math.round(l.totalLigneHT * ratio * 100) / 100,
          montantTVA: Math.round(l.montantTVA * ratio * 100) / 100,
        }
      })
      .filter((l): l is LigneFacture => l !== null)

    if (linesToCredit.length === 0) return

    const montantHT = Math.round(linesToCredit.reduce((s, l) => s + l.totalLigneHT, 0) * 100) / 100
    const montantTVA = Math.round(linesToCredit.reduce((s, l) => s + l.montantTVA, 0) * 100) / 100
    const montantTTC = Math.round((montantHT + montantTVA) * 100) / 100

    const result = createAvoir(
      selectedFacture.numFacture,
      montantHT,
      montantTVA,
      montantTTC,
      avoirMotif,
      selectedFacture.idClient,
      linesToCredit
    )

    if (result.success && result.avoir) {
      setAvoirSuccess(`Avoir ${result.avoir.numAvoir} genere pour ${formatCurrency(montantTTC)}`)
      setAvoirMotif('')
      setAvoirFactureNum('')
      setSelectedLines({})
    }
  }

  const hasSelectedLines = Object.values(selectedLines).some(l => l.selected)

  // Tab: Litiges en cours
  const tabLitiges = (
    <div className="space-y-4">
      <Table
        columns={[
          { key: 'idLitige', header: 'N° Litige', render: (l: Litige) => (
            <span className="font-mono text-xs">{l.idLitige}</span>
          )},
          { key: 'idClient', header: 'Client', render: (l: Litige) => (
            <span className="text-sm">{getClientName(l.idClient)}</span>
          )},
          { key: 'numFacture', header: 'Facture', render: (l: Litige) => (
            <span className="font-mono text-xs">{l.numFacture}</span>
          )},
          { key: 'motif', header: 'Motif', render: (l: Litige) => (
            <span className="text-xs">{l.motif.replace(/_/g, ' ')}</span>
          )},
          { key: 'dateDeclaration', header: 'Date', render: (l: Litige) => (
            <span className="text-xs text-gray-500">{formatDateShort(l.dateDeclaration)}</span>
          )},
          { key: 'statut', header: 'Statut', render: (l: Litige) => (
            <LitigeStatusBadge statut={l.statut} />
          )},
        ]}
        data={openLitiges}
        keyExtractor={(l: Litige) => l.idLitige}
        onRowClick={(l: Litige) => {
          setSelectedLitige(l)
          setShowRefuseInput(false)
          setRefuseComment('')
        }}
        emptyMessage="Aucun litige en cours"
      />

      <Modal
        isOpen={!!selectedLitige}
        onClose={() => { setSelectedLitige(null); setShowRefuseInput(false) }}
        title={selectedLitige ? `Litige ${selectedLitige.idLitige}` : ''}
        size="md"
      >
        {selectedLitige && (
          <div className="space-y-4">
            <div className="text-sm space-y-2">
              <p><span className="font-medium">Client :</span> {getClientName(selectedLitige.idClient)}</p>
              <p><span className="font-medium">Facture :</span> {selectedLitige.numFacture}</p>
              <p><span className="font-medium">Motif :</span> {selectedLitige.motif.replace(/_/g, ' ')}</p>
              <p><span className="font-medium">Date :</span> {formatDateShort(selectedLitige.dateDeclaration)}</p>
              <p><span className="font-medium">Description :</span></p>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedLitige.description}</p>
            </div>

            {showRefuseInput ? (
              <div className="space-y-3">
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bordeaux-500"
                  rows={3}
                  placeholder="Motif du refus..."
                  value={refuseComment}
                  onChange={e => setRefuseComment(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button variant="danger" onClick={() => handleRefuseLitige(selectedLitige)} disabled={!refuseComment.trim()}>
                    Confirmer le refus
                  </Button>
                  <Button variant="ghost" onClick={() => setShowRefuseInput(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => handleAcceptLitige(selectedLitige)}>
                  Accepter
                </Button>
                <Button variant="danger" onClick={() => setShowRefuseInput(true)}>
                  Refuser
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )

  // Tab: Creer un avoir
  const tabCreerAvoir = (
    <div className="space-y-4">
      {avoirSuccess && (
        <Alert variant="success" title="Avoir genere">
          {avoirSuccess}
        </Alert>
      )}

      <Card padding="sm">
        <Select
          label="Facture de reference"
          options={factureOptions}
          placeholder="-- Selectionner une facture --"
          value={avoirFactureNum}
          onChange={e => handleSelectFacture(e.target.value)}
        />
      </Card>

      {!avoirFactureNum && (
        <VerrouBanner
          type="accounting"
          message="Un avoir doit obligatoirement etre rattache a une facture existante"
        />
      )}

      {selectedFacture && (
        <Card padding="sm">
          <div className="space-y-4">
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Facture :</span> {selectedFacture.numFacture}</p>
              <p><span className="font-medium">Client :</span> {getClientName(selectedFacture.idClient)}</p>
              <p><span className="font-medium">Total TTC :</span> {formatCurrency(selectedFacture.totalTTC)}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Lignes a crediter :</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-600">
                      <th className="text-center py-2 px-2 w-8"></th>
                      <th className="text-left py-2 px-2 font-medium">Produit</th>
                      <th className="text-center py-2 px-2 font-medium">Qte facturee</th>
                      <th className="text-center py-2 px-2 font-medium">Qte avoir</th>
                      <th className="text-right py-2 px-2 font-medium">Total HT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedFacture.lignes.map((l, i) => {
                      const key = `${l.reference}-${i}`
                      const sel = selectedLines[key] || { selected: false, qty: l.quantite }
                      return (
                        <tr key={key} className="border-b border-gray-50">
                          <td className="py-2 px-2 text-center">
                            <input
                              type="checkbox"
                              checked={sel.selected}
                              onChange={e =>
                                setSelectedLines(prev => ({
                                  ...prev,
                                  [key]: { ...sel, selected: e.target.checked },
                                }))
                              }
                            />
                          </td>
                          <td className="py-2 px-2">{l.libelleProduit}</td>
                          <td className="py-2 px-2 text-center">{l.quantite}</td>
                          <td className="py-2 px-2 text-center">
                            <input
                              type="number"
                              min={1}
                              max={l.quantite}
                              className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center"
                              value={sel.qty}
                              disabled={!sel.selected}
                              onChange={e =>
                                setSelectedLines(prev => ({
                                  ...prev,
                                  [key]: {
                                    ...sel,
                                    qty: Math.min(l.quantite, Math.max(1, parseInt(e.target.value) || 1)),
                                  },
                                }))
                              }
                            />
                          </td>
                          <td className="py-2 px-2 text-right">
                            {sel.selected
                              ? formatCurrency(Math.round((l.totalLigneHT * sel.qty) / l.quantite * 100) / 100)
                              : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motif de l'avoir</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bordeaux-500"
                rows={3}
                placeholder="Motif de l'avoir..."
                value={avoirMotif}
                onChange={e => setAvoirMotif(e.target.value)}
              />
            </div>

            <Button
              onClick={handleCreateAvoir}
              disabled={!hasSelectedLines || !avoirMotif.trim()}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Generer l'avoir
            </Button>
          </div>
        </Card>
      )}
    </div>
  )

  // Tab: Avoirs emis
  const tabAvoirsEmis = (
    <Table
      columns={[
        { key: 'numAvoir', header: 'N° Avoir', render: (a: Avoir) => (
          <span className="font-mono text-xs font-medium">{a.numAvoir}</span>
        )},
        { key: 'numFacture', header: 'Facture', render: (a: Avoir) => (
          <span className="font-mono text-xs">{a.numFacture}</span>
        )},
        { key: 'dateEmission', header: 'Date', render: (a: Avoir) => (
          <span className="text-xs text-gray-500">{formatDateShort(a.dateEmission)}</span>
        )},
        { key: 'montantTTC', header: 'Montant TTC', render: (a: Avoir) => (
          <span className="font-medium text-red-600">-{formatCurrency(a.montantTTC)}</span>
        ), className: 'text-right' },
        { key: 'motifAvoir', header: 'Motif', render: (a: Avoir) => (
          <span className="text-xs text-gray-600 truncate max-w-xs block">{a.motifAvoir}</span>
        )},
      ]}
      data={avoirs}
      keyExtractor={(a: Avoir) => a.numAvoir}
      emptyMessage="Aucun avoir emis"
    />
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <FileWarning className="w-6 h-6 text-purple-600" />
        <h1 className="text-2xl font-serif font-bold text-gray-900">Avoirs & SAV</h1>
      </div>

      <Tabs
        tabs={[
          { id: 'litiges', label: 'Litiges en cours', content: tabLitiges },
          { id: 'creer', label: 'Creer un avoir', content: tabCreerAvoir },
          { id: 'emis', label: 'Avoirs emis', content: tabAvoirsEmis },
        ]}
      />
    </div>
  )
}
