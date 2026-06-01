import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useInvoiceStore } from '../../stores/invoiceStore'
import { useAvoirStore } from '../../stores/avoirStore'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Select } from '../../components/ui/Select'
import { Alert } from '../../components/ui/Alert'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react'

const MOTIF_OPTIONS = [
  { value: 'PRODUIT_ENDOMMAGE', label: 'Produit endommage' },
  { value: 'ERREUR_QUANTITE', label: 'Erreur de quantite' },
  { value: 'PRODUIT_MANQUANT', label: 'Produit manquant' },
  { value: 'AUTRE', label: 'Autre' },
]

type MotifLitige = 'PRODUIT_ENDOMMAGE' | 'ERREUR_QUANTITE' | 'PRODUIT_MANQUANT' | 'AUTRE'

export function DisputePage() {
  const { numFacture } = useParams<{ numFacture: string }>()
  const { getByNum } = useInvoiceStore()
  const { createLitige } = useAvoirStore()
  const { currentClient } = useAuthStore()

  const [motif, setMotif] = useState<string>('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [litigeId, setLitigeId] = useState('')

  const facture = useMemo(() => getByNum(numFacture || ''), [numFacture, getByNum])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!facture || !currentClient || !motif) return

    const litige = createLitige({
      numFacture: facture.numFacture,
      idClient: currentClient.idClient,
      dateDeclaration: new Date().toISOString().split('T')[0],
      motif: motif as MotifLitige,
      description,
    })

    setLitigeId(litige.idLitige)
    setSubmitted(true)
  }

  if (!facture) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-gray-500 text-lg">Facture introuvable</p>
        <Link to="/commandes">
          <Button>Retour aux commandes</Button>
        </Link>
      </div>
    )
  }

  // Find corresponding order num for back link
  const orderNum = facture.numCommande

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto py-12 space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-forest-50 mx-auto">
            <CheckCircle className="w-10 h-10 text-forest-600" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Litige enregistre</h1>
          <p className="text-gray-500">
            Votre demande a ete soumise avec le numero <strong className="text-bordeaux-800">{litigeId}</strong>.
            Notre equipe va l'examiner dans les plus brefs delais.
          </p>
        </div>

        <Alert variant="info" title="Prochaines etapes">
          Vous serez contacte par notre service client pour le suivi de votre litige. Le delai moyen de traitement est de 3 a 5 jours ouvres.
        </Alert>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={`/commandes/${orderNum}`}>
            <Button variant="primary">Retour a la commande</Button>
          </Link>
          <Link to="/commandes">
            <Button variant="secondary">Mes commandes</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        to={`/commandes/${orderNum}`}
        className="inline-flex items-center gap-1.5 text-sm text-bordeaux-700 hover:text-bordeaux-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour a la commande
      </Link>

      <div className="flex items-center gap-3">
        <AlertTriangle className="w-6 h-6 text-gold-600" />
        <h1 className="text-2xl font-serif font-bold text-gray-900">Declarer un litige</h1>
      </div>

      {/* Invoice info */}
      <Card padding="md" className="bg-gray-50">
        <h2 className="text-sm font-medium text-gray-700 mb-2">Facture concernee</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Numero</p>
            <p className="font-medium">{facture.numFacture}</p>
          </div>
          <div>
            <p className="text-gray-500">Date d'emission</p>
            <p className="font-medium">{formatDate(facture.dateEmission)}</p>
          </div>
          <div>
            <p className="text-gray-500">Montant TTC</p>
            <p className="font-medium">{formatCurrency(facture.totalTTC)}</p>
          </div>
          <div>
            <p className="text-gray-500">Commande</p>
            <p className="font-medium">{facture.numCommande}</p>
          </div>
        </div>
      </Card>

      {/* Dispute form */}
      <Card padding="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Select
            label="Motif du litige"
            options={MOTIF_OPTIONS}
            placeholder="Selectionnez un motif"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Description detaillee
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Decrivez le probleme rencontre en detail..."
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-bordeaux-500 focus:border-bordeaux-500"
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" size="lg" disabled={!motif || !description.trim()}>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Soumettre le litige
            </Button>
            <Link to={`/commandes/${orderNum}`}>
              <Button type="button" variant="ghost" size="lg">
                Annuler
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
