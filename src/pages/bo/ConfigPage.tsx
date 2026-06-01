import { useState } from 'react'
import { useProductStore } from '../../stores/productStore'
import { useConfigStore } from '../../stores/configStore'
import { initialClients } from '../../data/clients'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Alert } from '../../components/ui/Alert'
import { Tabs } from '../../components/ui/Tabs'
import { Table } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Select'
import { RemiseBadge } from '../../components/shared/RemiseBadge'
import { formatCurrency, formatCategorie, formatDateShort, generateId } from '../../utils/formatters'
import { TypeRemise, CodeTVA } from '../../types'
import type { Remise, Client } from '../../types'
import { Settings, Save, Plus, Pencil, Trash2 } from 'lucide-react'

export function ConfigPage() {
  const { products, updatePrice } = useProductStore()
  const { tvaRates, remises, updateTVA, addRemise, removeRemise, updateRemise } = useConfigStore()

  // Tarifs state
  const [priceEdits, setPriceEdits] = useState<Record<string, number>>({})
  const [priceSaved, setPriceSaved] = useState<string | null>(null)

  // TVA state
  const [tvaEdits, setTvaEdits] = useState<Record<string, number>>({})
  const [tvaSaved, setTvaSaved] = useState<string | null>(null)

  // Remises state
  const [remiseModal, setRemiseModal] = useState<{ mode: 'add' | 'edit'; remise?: Remise } | null>(null)
  const [remiseForm, setRemiseForm] = useState({
    typeRemise: TypeRemise.EXCEPTIONNELLE as TypeRemise,
    taux: 0.05,
    seuilDeclenchement: 0,
    idClient: '',
    dateDebut: '2026-01-01',
    dateFin: '2026-12-31',
    description: '',
    produitReference: '',
  })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Clients state
  const [selectedClientDetail, setSelectedClientDetail] = useState<Client | null>(null)

  const handleSavePrice = (ref: string) => {
    const newPrice = priceEdits[ref]
    if (newPrice !== undefined && newPrice > 0) {
      updatePrice(ref, newPrice)
      setPriceSaved(ref)
      setPriceEdits(prev => {
        const { [ref]: _, ...rest } = prev
        return rest
      })
      setTimeout(() => setPriceSaved(null), 3000)
    }
  }

  const handleSaveTVA = (codeTVA: CodeTVA) => {
    const newRate = tvaEdits[codeTVA]
    if (newRate !== undefined && newRate >= 0) {
      updateTVA(codeTVA, newRate)
      setTvaSaved(codeTVA)
      setTvaEdits(prev => {
        const { [codeTVA]: _, ...rest } = prev
        return rest
      })
      setTimeout(() => setTvaSaved(null), 3000)
    }
  }

  const openAddRemise = () => {
    setRemiseForm({
      typeRemise: TypeRemise.EXCEPTIONNELLE,
      taux: 0.05,
      seuilDeclenchement: 0,
      idClient: '',
      dateDebut: '2026-01-01',
      dateFin: '2026-12-31',
      description: '',
      produitReference: '',
    })
    setRemiseModal({ mode: 'add' })
  }

  const openEditRemise = (remise: Remise) => {
    setRemiseForm({
      typeRemise: remise.typeRemise,
      taux: remise.taux,
      seuilDeclenchement: remise.seuilDeclenchement || 0,
      idClient: remise.idClient || '',
      dateDebut: remise.dateDebut,
      dateFin: remise.dateFin,
      description: remise.description,
      produitReference: remise.produitReference || '',
    })
    setRemiseModal({ mode: 'edit', remise })
  }

  const handleSaveRemise = () => {
    if (!remiseModal) return
    const data: Remise = {
      idRemise: remiseModal.mode === 'edit' && remiseModal.remise ? remiseModal.remise.idRemise : generateId('REM'),
      typeRemise: remiseForm.typeRemise,
      taux: remiseForm.taux,
      seuilDeclenchement: remiseForm.seuilDeclenchement > 0 ? remiseForm.seuilDeclenchement : undefined,
      idClient: remiseForm.idClient || undefined,
      dateDebut: remiseForm.dateDebut,
      dateFin: remiseForm.dateFin,
      description: remiseForm.description,
      produitReference: remiseForm.produitReference || undefined,
    }

    if (remiseModal.mode === 'edit' && remiseModal.remise) {
      updateRemise(remiseModal.remise.idRemise, data)
    } else {
      addRemise(data)
    }
    setRemiseModal(null)
  }

  const handleDeleteRemise = (id: string) => {
    removeRemise(id)
    setDeleteConfirm(null)
  }

  const clientOptions = [
    { value: '', label: '-- Tous les clients --' },
    ...initialClients.map(c => ({ value: c.idClient, label: c.raisonSociale })),
  ]

  const typeRemiseOptions = [
    { value: TypeRemise.EXCEPTIONNELLE, label: 'Exceptionnelle' },
    { value: TypeRemise.VOLUME, label: 'Volume' },
    { value: TypeRemise.FIDELITE, label: 'Fidelite' },
  ]

  // Tab: Tarifs
  const tabTarifs = (
    <div className="space-y-3">
      {priceSaved && (
        <Alert variant="success">Modification sauvegardee — visible immediatement sur le catalogue</Alert>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-600">
              <th className="text-left py-2 px-3 font-medium">Ref</th>
              <th className="text-left py-2 px-3 font-medium">Libelle</th>
              <th className="text-left py-2 px-3 font-medium">Categorie</th>
              <th className="text-right py-2 px-3 font-medium">Prix HT</th>
              <th className="text-center py-2 px-3 font-medium">Stock</th>
              <th className="text-center py-2 px-3 font-medium w-20"></th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.reference} className="border-b border-gray-50">
                <td className="py-2 px-3 font-mono text-xs text-gray-500">{p.reference}</td>
                <td className="py-2 px-3">{p.libelle}</td>
                <td className="py-2 px-3 text-xs text-gray-500">{formatCategorie(p.categorie)}</td>
                <td className="py-2 px-3 text-right">
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    className="w-24 border border-gray-300 rounded px-2 py-1 text-sm text-right"
                    value={priceEdits[p.reference] !== undefined ? priceEdits[p.reference] : p.prixUnitaireHT}
                    onChange={e =>
                      setPriceEdits(prev => ({ ...prev, [p.reference]: parseFloat(e.target.value) || 0 }))
                    }
                  />
                </td>
                <td className="py-2 px-3 text-center text-xs">{p.stockPhysiqueDisponible}</td>
                <td className="py-2 px-3 text-center">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSavePrice(p.reference)}
                    disabled={priceEdits[p.reference] === undefined}
                  >
                    <Save className="w-3 h-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // Tab: TVA
  const tabTVA = (
    <div className="space-y-3">
      {tvaSaved && (
        <Alert variant="success">Taux de TVA mis a jour</Alert>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-600">
              <th className="text-left py-2 px-3 font-medium">Code TVA</th>
              <th className="text-left py-2 px-3 font-medium">Libelle</th>
              <th className="text-right py-2 px-3 font-medium">Taux (%)</th>
              <th className="text-center py-2 px-3 font-medium w-20"></th>
            </tr>
          </thead>
          <tbody>
            {tvaRates.map(t => (
              <tr key={t.codeTVA} className="border-b border-gray-50">
                <td className="py-2 px-3 font-mono text-xs">{t.codeTVA}</td>
                <td className="py-2 px-3">{t.libelle}</td>
                <td className="py-2 px-3 text-right">
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-right"
                    value={tvaEdits[t.codeTVA] !== undefined ? tvaEdits[t.codeTVA] : t.tauxTVA}
                    onChange={e =>
                      setTvaEdits(prev => ({ ...prev, [t.codeTVA]: parseFloat(e.target.value) || 0 }))
                    }
                  />
                </td>
                <td className="py-2 px-3 text-center">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSaveTVA(t.codeTVA)}
                    disabled={tvaEdits[t.codeTVA] === undefined}
                  >
                    <Save className="w-3 h-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // Tab: Remises
  const tabRemises = (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={openAddRemise}>
          <Plus className="w-3 h-3 mr-1" />
          Ajouter une remise
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-600">
              <th className="text-left py-2 px-2 font-medium">Type</th>
              <th className="text-right py-2 px-2 font-medium">Taux</th>
              <th className="text-right py-2 px-2 font-medium">Seuil</th>
              <th className="text-left py-2 px-2 font-medium">Client</th>
              <th className="text-left py-2 px-2 font-medium">Dates</th>
              <th className="text-left py-2 px-2 font-medium">Description</th>
              <th className="text-center py-2 px-2 font-medium w-24"></th>
            </tr>
          </thead>
          <tbody>
            {remises.map(r => (
              <tr key={r.idRemise} className="border-b border-gray-50">
                <td className="py-2 px-2"><RemiseBadge type={r.typeRemise} taux={r.taux} /></td>
                <td className="py-2 px-2 text-right">{(r.taux * 100).toFixed(0)} %</td>
                <td className="py-2 px-2 text-right">{r.seuilDeclenchement ? formatCurrency(r.seuilDeclenchement) : '—'}</td>
                <td className="py-2 px-2 text-xs">
                  {r.idClient ? initialClients.find(c => c.idClient === r.idClient)?.raisonSociale || r.idClient : 'Tous'}
                </td>
                <td className="py-2 px-2 text-xs text-gray-500">
                  {formatDateShort(r.dateDebut)} — {formatDateShort(r.dateFin)}
                </td>
                <td className="py-2 px-2 text-xs text-gray-600">{r.description}</td>
                <td className="py-2 px-2 text-center">
                  <div className="flex gap-1 justify-center">
                    <button onClick={() => openEditRemise(r)} className="p-1 text-gray-500 hover:text-blue-600">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(r.idRemise)}
                      className="p-1 text-gray-500 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Supprimer la remise"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Etes-vous sur de vouloir supprimer cette remise ?</p>
          <div className="flex gap-2">
            <Button variant="danger" onClick={() => deleteConfirm && handleDeleteRemise(deleteConfirm)}>
              Supprimer
            </Button>
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
              Annuler
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add/Edit remise modal */}
      <Modal
        isOpen={!!remiseModal}
        onClose={() => setRemiseModal(null)}
        title={remiseModal?.mode === 'edit' ? 'Modifier la remise' : 'Nouvelle remise'}
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Type de remise"
            options={typeRemiseOptions}
            value={remiseForm.typeRemise}
            onChange={e => setRemiseForm(prev => ({ ...prev, typeRemise: e.target.value as TypeRemise }))}
          />
          <Input
            label="Taux (decimal, ex: 0.15 pour 15%)"
            type="number"
            step="0.01"
            min={0}
            max={1}
            value={remiseForm.taux}
            onChange={e => setRemiseForm(prev => ({ ...prev, taux: parseFloat(e.target.value) || 0 }))}
          />
          <Input
            label="Seuil de declenchement (EUR HT)"
            type="number"
            min={0}
            value={remiseForm.seuilDeclenchement}
            onChange={e => setRemiseForm(prev => ({ ...prev, seuilDeclenchement: parseFloat(e.target.value) || 0 }))}
          />
          <Select
            label="Client"
            options={clientOptions}
            value={remiseForm.idClient}
            onChange={e => setRemiseForm(prev => ({ ...prev, idClient: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date debut"
              type="date"
              value={remiseForm.dateDebut}
              onChange={e => setRemiseForm(prev => ({ ...prev, dateDebut: e.target.value }))}
            />
            <Input
              label="Date fin"
              type="date"
              value={remiseForm.dateFin}
              onChange={e => setRemiseForm(prev => ({ ...prev, dateFin: e.target.value }))}
            />
          </div>
          <Input
            label="Description"
            value={remiseForm.description}
            onChange={e => setRemiseForm(prev => ({ ...prev, description: e.target.value }))}
          />
          <Button onClick={handleSaveRemise} disabled={!remiseForm.description}>
            {remiseModal?.mode === 'edit' ? 'Mettre a jour' : 'Ajouter'}
          </Button>
        </div>
      </Modal>
    </div>
  )

  // Tab: Clients
  const tabClients = (
    <div className="space-y-3">
      <Table
        columns={[
          { key: 'idClient', header: 'ID', render: (c: Client) => (
            <span className="font-mono text-xs">{c.idClient}</span>
          )},
          { key: 'raisonSociale', header: 'Raison sociale', render: (c: Client) => (
            <span className="font-medium">{c.raisonSociale}</span>
          )},
          { key: 'contactPrincipal', header: 'Contact' },
          { key: 'email', header: 'Email', render: (c: Client) => (
            <span className="text-xs text-gray-500">{c.email}</span>
          )},
          { key: 'telephone', header: 'Telephone' },
          { key: 'siret', header: 'SIRET', render: (c: Client) => (
            <span className="text-xs text-gray-400">{c.siret}</span>
          )},
        ]}
        data={initialClients}
        keyExtractor={(c: Client) => c.idClient}
        onRowClick={(c: Client) => setSelectedClientDetail(c)}
        emptyMessage="Aucun client"
      />

      {selectedClientDetail && (
        <Card padding="sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            {selectedClientDetail.raisonSociale}
          </h3>
          <div className="text-sm space-y-2">
            <p><span className="font-medium">Contact :</span> {selectedClientDetail.contactPrincipal}</p>
            <p><span className="font-medium">Email :</span> {selectedClientDetail.email}</p>
            <p><span className="font-medium">Telephone :</span> {selectedClientDetail.telephone}</p>
            <p><span className="font-medium">SIRET :</span> {selectedClientDetail.siret}</p>
            <p><span className="font-medium">Adresse de facturation :</span></p>
            <p className="text-gray-600 bg-gray-50 p-2 rounded whitespace-pre-line text-xs">
              {selectedClientDetail.adrFacturationCentralisee}
            </p>
            <p className="font-medium mt-2">Adresses de livraison :</p>
            <div className="space-y-1">
              {selectedClientDetail.adressesLivraison.map(a => (
                <div key={a.id} className="text-xs bg-gray-50 p-2 rounded">
                  <span className="font-medium">{a.libelle}</span> — {a.rue}, {a.codePostal} {a.ville}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Settings className="w-6 h-6 text-bordeaux-700" />
        <h1 className="text-2xl font-serif font-bold text-gray-900">Parametrage</h1>
      </div>

      <Tabs
        tabs={[
          { id: 'tarifs', label: 'Tarifs', content: tabTarifs },
          { id: 'tva', label: 'TVA', content: tabTVA },
          { id: 'remises', label: 'Remises', content: tabRemises },
          { id: 'clients', label: 'Clients', content: tabClients },
        ]}
      />
    </div>
  )
}
