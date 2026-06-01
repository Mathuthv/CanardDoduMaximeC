/**
 * IHM — CheckoutPage (CU « Création d'une commande »)
 *
 * Zone stepper : type indicateur, 3 étapes (Livraison / Récapitulatif / Paiement)
 * Zone adresses : type sélection (liste déroulante), référentiel = adresses du client
 * Zone date livraison : type date, contrôle ≥ J+2 et jour ouvré
 * Zone récapitulatif : type affichage calculé, données = lignes panier + moteur de calcul
 * Zone paiement : type saisie (carte mock), contrôle format + bouton confirmer/simuler échec
 */
import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCartStore } from '../../stores/cartStore'
import { useAuthStore } from '../../stores/authStore'
import { useOrderStore } from '../../stores/orderStore'
import { useProductStore } from '../../stores/productStore'
import { useConfigStore } from '../../stores/configStore'
import { LigneCommande, StatutCommande } from '../../types'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Badge } from '../../components/ui/Badge'
import { Alert } from '../../components/ui/Alert'
import { TVABreakdown } from '../../components/shared/TVABreakdown'
import { VerrouBanner } from '../../components/shared/VerrouBanner'
import { formatCurrency } from '../../utils/formatters'
import { generateId } from '../../utils/formatters'
import { findApplicableRemises, getBestRemise, verifyCartStock, calcFrancoManquant } from '../../utils/calculations'
import { ArrowLeft, ArrowRight, CreditCard, Lock, ShieldCheck, MapPin, Calendar, FileText, Truck, CheckCircle, XCircle, Loader2 } from 'lucide-react'

type CheckoutStep = 'livraison' | 'recapitulatif' | 'paiement'

const STEPS: { id: CheckoutStep; label: string; icon: React.ReactNode }[] = [
  { id: 'livraison', label: 'Livraison', icon: <MapPin className="w-4 h-4" /> },
  { id: 'recapitulatif', label: 'Recapitulatif', icon: <FileText className="w-4 h-4" /> },
  { id: 'paiement', label: 'Paiement', icon: <CreditCard className="w-4 h-4" /> },
]

function getMinDeliveryDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 2)
  // Skip weekends
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const { lignes, getCartTotals, clearCart } = useCartStore()
  const { currentUser, currentClient } = useAuthStore()
  const { createFromCart, advanceStatus, revertToCart } = useOrderStore()
  const { getByRef, updateStock, products } = useProductStore()
  const { remises, francoSeuil } = useConfigStore()

  // Step state
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('livraison')

  // Delivery state
  const [selectedAddressId, setSelectedAddressId] = useState(currentClient?.adressesLivraison[0]?.id || '')
  const [deliveryDate, setDeliveryDate] = useState(getMinDeliveryDate())
  const [multiLivraison, setMultiLivraison] = useState(false)
  const [lineAddresses, setLineAddresses] = useState<Record<string, string>>({})

  // Payment state
  const [cardNumber] = useState('4242 4242 4242 4242')
  const [expiry, setExpiry] = useState('12/27')
  const [cvv, setCvv] = useState('123')
  const [simulateFailure, setSimulateFailure] = useState(false)

  // Process states
  const [processing, setProcessing] = useState(false)
  const [processingLabel, setProcessingLabel] = useState('')
  const [stockErrors, setStockErrors] = useState<{ reference: string; libelle: string; demande: number; disponible: number }[]>([])
  const [paymentError, setPaymentError] = useState('')
  const [pendingOrderNum, setPendingOrderNum] = useState<string | null>(null)

  const clientId = currentClient?.idClient || ''
  const totals = useMemo(() => getCartTotals(clientId), [lignes, clientId, getCartTotals])
  const francoManquant = useMemo(() => calcFrancoManquant(totals.totalHTApresRemises, francoSeuil), [totals.totalHTApresRemises, francoSeuil])

  const addressOptions = useMemo(
    () => (currentClient?.adressesLivraison || []).map(a => ({ value: a.id, label: a.libelle })),
    [currentClient]
  )

  const selectedAddress = currentClient?.adressesLivraison.find(a => a.id === selectedAddressId)

  const stepIndex = STEPS.findIndex(s => s.id === currentStep)

  // --- Step navigation ---
  const goToStep = (step: CheckoutStep) => {
    setPaymentError('')
    setStockErrors([])
    setCurrentStep(step)
  }

  const handleNextFromLivraison = () => {
    goToStep('recapitulatif')
  }

  const handleNextFromRecap = () => {
    // A4: Re-verify stock before payment
    setProcessing(true)
    setProcessingLabel('Verification du stock en temps reel...')

    setTimeout(() => {
      const cartLines = lignes.map(l => ({ reference: l.reference, quantiteSouhaitee: l.quantiteSouhaitee }))
      const check = verifyCartStock(cartLines, products)

      if (!check.valid) {
        setStockErrors(check.errors)
        setProcessing(false)
        setProcessingLabel('')
        return
      }

      setStockErrors([])
      setProcessing(false)
      setProcessingLabel('')
      goToStep('paiement')
    }, 800)
  }

  const handleConfirmPayment = () => {
    if (!currentUser || !currentClient) return
    setProcessing(true)
    setPaymentError('')
    setProcessingLabel('Creation de la commande...')

    setTimeout(() => {
      // F4: Create order in EN_ATTENTE_PAIEMENT
      const orderLignes: LigneCommande[] = lignes.map(l => {
        const product = getByRef(l.reference)!
        const applicable = findApplicableRemises(clientId, 0, l.reference, remises)
        const bestRemise = getBestRemise(applicable)
        return {
          idLigne: generateId('LIG'),
          numCommande: '',
          reference: l.reference,
          quantiteCommandee: l.quantiteSouhaitee,
          quantiteExpediee: null,
          remiseAppliquee: bestRemise,
          prixUnitaireHT: product.prixUnitaireHT,
        }
      })

      const commande = createFromCart(
        clientId,
        currentUser.login,
        'COM-001',
        multiLivraison ? (lineAddresses[lignes[0]?.reference] || selectedAddressId) : selectedAddressId,
        orderLignes,
        deliveryDate
      )
      setPendingOrderNum(commande.numCommande)

      setProcessingLabel('Traitement du paiement...')

      setTimeout(() => {
        // A8: Simulate payment failure
        if (simulateFailure) {
          setProcessingLabel('')
          setProcessing(false)
          setPaymentError('Paiement refuse par la banque. Votre commande a ete annulee et le stock libere. Veuillez reessayer.')
          // Revert: remove order, don't touch stock (wasn't decremented yet)
          revertToCart(commande.numCommande)
          setPendingOrderNum(null)
          return
        }

        // Payment success → advance to PAYEE_VALIDEE
        advanceStatus(commande.numCommande, StatutCommande.PAYEE_VALIDEE)

        // Decrement stock
        lignes.forEach(l => {
          updateStock(l.reference, -l.quantiteSouhaitee)
        })

        clearCart()
        navigate(`/commande/confirmation/${commande.numCommande}`)
      }, 1200)
    }, 600)
  }

  if (lignes.length === 0 && !pendingOrderNum) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-gray-500 text-lg">Votre panier est vide</p>
        <Link to="/catalogue"><Button>Retour au catalogue</Button></Link>
      </div>
    )
  }

  // --- Stepper ---
  const renderStepper = () => (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((step, i) => {
        const isCompleted = i < stepIndex
        const isCurrent = i === stepIndex
        return (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => i < stepIndex ? goToStep(step.id) : undefined}
              disabled={i > stepIndex}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isCurrent
                  ? 'bg-bordeaux-700 text-white shadow-md'
                  : isCompleted
                    ? 'bg-forest-100 text-forest-800 hover:bg-forest-200 cursor-pointer'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isCompleted ? <CheckCircle className="w-4 h-4" /> : step.icon}
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{i + 1}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`w-8 sm:w-16 h-0.5 mx-1 ${i < stepIndex ? 'bg-forest-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )

  // --- Step 1: Livraison ---
  const renderLivraison = () => (
    <div className="space-y-6">
      {/* Buyer info */}
      <Card padding="md">
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4">Acheteur</h2>
        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-medium">{currentClient?.raisonSociale}</p>
          <p>{currentClient?.contactPrincipal} — {currentClient?.email}</p>
          <p>SIRET : {currentClient?.siret}</p>
        </div>
      </Card>

      {/* Delivery address */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif font-semibold text-gray-900">Adresse de livraison</h2>
          {(currentClient?.adressesLivraison.length || 0) > 1 && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={multiLivraison}
                onChange={e => setMultiLivraison(e.target.checked)}
                className="rounded border-gray-300 text-bordeaux-700 focus:ring-bordeaux-500"
              />
              Livraison fractionnee
            </label>
          )}
        </div>

        {!multiLivraison ? (
          <>
            <Select
              label="Choisir une adresse"
              options={addressOptions}
              value={selectedAddressId}
              onChange={(e) => setSelectedAddressId(e.target.value)}
            />
            {selectedAddress && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                <p className="font-medium">{selectedAddress.libelle}</p>
                <p>{selectedAddress.rue}</p>
                <p>{selectedAddress.codePostal} {selectedAddress.ville}, {selectedAddress.pays}</p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Attribuez une adresse a chaque ligne de commande :</p>
            {lignes.map(l => {
              const product = getByRef(l.reference)
              return (
                <div key={l.reference} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium flex-1 min-w-0 truncate">
                    {product?.libelle} x{l.quantiteSouhaitee}
                  </span>
                  <div className="w-56 flex-shrink-0">
                    <Select
                      options={addressOptions}
                      value={lineAddresses[l.reference] || selectedAddressId}
                      onChange={e => setLineAddresses(prev => ({ ...prev, [l.reference]: e.target.value }))}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Delivery date */}
      <Card padding="md">
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-bordeaux-700" />
            Date de livraison souhaitee
          </div>
        </h2>
        <Input
          type="date"
          value={deliveryDate}
          min={getMinDeliveryDate()}
          onChange={e => setDeliveryDate(e.target.value)}
          label="Date de livraison (J+2 minimum, jours ouvres)"
        />
        <p className="text-xs text-gray-400 mt-2">La livraison sera effectuee sous reserve de la disponibilite du transporteur.</p>
      </Card>

      {/* Billing address */}
      <Card padding="md">
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4">Adresse de facturation</h2>
        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 whitespace-pre-line">
          {currentClient?.adrFacturationCentralisee || 'Non renseignee'}
        </div>
        <p className="text-xs text-gray-400 mt-2">Adresse de facturation centralisee — proposee par defaut pour les chaines</p>
      </Card>

      <div className="flex justify-between">
        <Link to="/panier" className="inline-flex items-center gap-1.5 text-sm text-bordeaux-700 hover:text-bordeaux-900">
          <ArrowLeft className="w-4 h-4" /> Retour au panier
        </Link>
        <Button onClick={handleNextFromLivraison} disabled={!selectedAddressId || !deliveryDate}>
          Continuer <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  // --- Step 2: Récapitulatif ---
  const renderRecapitulatif = () => (
    <div className="space-y-6">
      {stockErrors.length > 0 && (
        <div className="space-y-2">
          <VerrouBanner
            type="stock"
            message="Le stock a change depuis votre ajout au panier. Certains produits ne sont plus disponibles en quantite suffisante."
          />
          {stockErrors.map(e => (
            <Alert key={e.reference} variant="error">
              <strong>{e.libelle}</strong> — demande : {e.demande}, disponible : {e.disponible}. Veuillez ajuster votre panier.
            </Alert>
          ))}
          <Link to="/panier"><Button variant="secondary"><ArrowLeft className="w-4 h-4 mr-2" /> Modifier le panier</Button></Link>
        </div>
      )}

      <Card padding="md">
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4">Recapitulatif de la commande</h2>

        {/* Delivery info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg text-sm">
          <div>
            <p className="text-gray-500">Livraison</p>
            <p className="font-medium">{selectedAddress?.libelle || 'Multi-adresses'}</p>
          </div>
          <div>
            <p className="text-gray-500">Date souhaitee</p>
            <p className="font-medium">{new Date(deliveryDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Lines */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600">
                <th className="text-left py-2 font-medium">Produit</th>
                <th className="text-center py-2 font-medium">Qte</th>
                <th className="text-right py-2 font-medium">P.U. HT</th>
                <th className="text-right py-2 font-medium">Remise</th>
                <th className="text-right py-2 font-medium">Total HT</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map(l => {
                const product = getByRef(l.reference)
                if (!product) return null
                const applicable = findApplicableRemises(clientId, 0, l.reference, remises)
                const remise = getBestRemise(applicable)
                const lineHT = Math.round(l.quantiteSouhaitee * product.prixUnitaireHT * (1 - remise) * 100) / 100
                return (
                  <tr key={l.reference} className="border-b border-gray-50">
                    <td className="py-2">{product.libelle}</td>
                    <td className="py-2 text-center">{l.quantiteSouhaitee}</td>
                    <td className="py-2 text-right">{formatCurrency(product.prixUnitaireHT)}</td>
                    <td className="py-2 text-right">{remise > 0 ? <span className="text-forest-700">-{(remise * 100).toFixed(0)}%</span> : '—'}</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(lineHT)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-gray-200 pt-4 mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total HT brut</span>
            <span>{formatCurrency(totals.totalHT)}</span>
          </div>
          {totals.totalRemises > 0 && (
            <div className="flex justify-between text-forest-700">
              <span>Remises</span>
              <span>-{formatCurrency(totals.totalRemises)}</span>
            </div>
          )}
          <div className="flex justify-between font-medium">
            <span>Total HT apres remises</span>
            <span>{formatCurrency(totals.totalHTApresRemises)}</span>
          </div>
          <TVABreakdown breakdown={totals.tvaBreakdown} />
          <div className="flex justify-between">
            <span className="text-gray-600">Frais de port</span>
            {totals.francoDePort ? (
              <Badge variant="success">Franco de port</Badge>
            ) : (
              <span>{formatCurrency(totals.fraisPort)}</span>
            )}
          </div>
          {!totals.francoDePort && francoManquant > 0 && (
            <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg text-xs text-amber-800">
              <Truck className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Plus que <strong>{formatCurrency(francoManquant)}</strong> HT pour la livraison offerte !</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <span className="text-lg font-bold">Total TTC</span>
            <span className="text-2xl font-bold text-bordeaux-800">{formatCurrency(totals.totalTTC)}</span>
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => goToStep('livraison')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Modifier la livraison
        </Button>
        <Button onClick={handleNextFromRecap} disabled={processing || stockErrors.length > 0}>
          {processing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {processingLabel}</>
          ) : (
            <>Proceder au paiement <ArrowRight className="w-4 h-4 ml-2" /></>
          )}
        </Button>
      </div>
    </div>
  )

  // --- Step 3: Paiement ---
  const renderPaiement = () => (
    <div className="space-y-6 max-w-xl mx-auto">
      {paymentError && (
        <Alert variant="error" title="Echec du paiement">
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{paymentError}</span>
          </div>
        </Alert>
      )}

      <Card padding="lg">
        <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-bordeaux-700" />
            Paiement securise
          </div>
        </h2>

        <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center gap-2 text-sm text-gray-500">
          <Lock className="w-4 h-4" />
          Mode demonstration — aucun paiement reel
        </div>

        <div className="space-y-4">
          <Input label="Numero de carte" value={cardNumber} readOnly className="bg-gray-50" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Expiration" value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM/AA" />
            <Input label="CVV" value={cvv} onChange={e => setCvv(e.target.value)} placeholder="123" type="password" />
          </div>

          {/* Demo toggle for payment failure */}
          <label className="flex items-center gap-2 text-sm cursor-pointer p-3 bg-red-50 border border-red-200 rounded-lg">
            <input
              type="checkbox"
              checked={simulateFailure}
              onChange={e => setSimulateFailure(e.target.checked)}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-red-700">Simuler un echec de paiement (A8 — demo)</span>
          </label>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
          <span className="text-lg font-bold">Total a payer</span>
          <span className="text-2xl font-bold text-bordeaux-800">{formatCurrency(totals.totalTTC)}</span>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => goToStep('recapitulatif')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour au recapitulatif
        </Button>
        <Button size="lg" onClick={handleConfirmPayment} disabled={processing}>
          <ShieldCheck className="w-5 h-5 mr-2" />
          {processing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {processingLabel}</>
          ) : (
            'Confirmer et payer'
          )}
        </Button>
      </div>

      <p className="text-xs text-gray-400 text-center">
        En confirmant, vous acceptez les conditions generales de vente
      </p>
    </div>
  )

  return (
    <div className="space-y-6">
      {renderStepper()}
      {currentStep === 'livraison' && renderLivraison()}
      {currentStep === 'recapitulatif' && renderRecapitulatif()}
      {currentStep === 'paiement' && renderPaiement()}
    </div>
  )
}
