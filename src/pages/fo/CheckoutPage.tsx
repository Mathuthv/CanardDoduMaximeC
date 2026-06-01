/**
 * IHM — F-06 : Récapitulatif et confirmation de commande
 * (SFD §2.3 — les adresses et la date ont déjà été saisies en F-02)
 *
 * Zone récapitulatif : DS-14 — lignes, PU HT, remises, TVA ventilée, frais port, total TTC
 * Zone adresses      : rappel des 3 adresses (acheteur, livraison, facturation) depuis cartStore.delivery
 * Zone paiement      : DS-15 — mock paiement, création commande EN_PREPARATION
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
import { Badge } from '../../components/ui/Badge'
import { Alert } from '../../components/ui/Alert'
import { TVABreakdown } from '../../components/shared/TVABreakdown'
import { VerrouBanner } from '../../components/shared/VerrouBanner'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { generateId } from '../../utils/formatters'
import { findApplicableRemises, getBestRemise, verifyCartStock, calcFrancoManquant } from '../../utils/calculations'
import { ArrowLeft, CreditCard, Lock, ShieldCheck, Truck, MapPin, User, Building2, Calendar, XCircle, Loader2, CheckCircle } from 'lucide-react'

type CheckoutStep = 'recapitulatif' | 'paiement'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { lignes, getCartTotals, clearCart, delivery } = useCartStore()
  const { currentUser, currentClient } = useAuthStore()
  const { createFromCart, advanceStatus, revertToCart } = useOrderStore()
  const { getByRef, updateStock, products } = useProductStore()
  const { remises, francoSeuil } = useConfigStore()

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('recapitulatif')
  const [cardNumber] = useState('4242 4242 4242 4242')
  const [expiry, setExpiry] = useState('12/27')
  const [cvv, setCvv] = useState('123')
  const [simulateFailure, setSimulateFailure] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [processingLabel, setProcessingLabel] = useState('')
  const [stockErrors, setStockErrors] = useState<{ reference: string; libelle: string; demande: number; disponible: number }[]>([])
  const [paymentError, setPaymentError] = useState('')

  const clientId = currentClient?.idClient || ''
  const totals = useMemo(() => getCartTotals(clientId), [lignes, clientId, getCartTotals])
  const francoManquant = useMemo(() => calcFrancoManquant(totals.totalHTApresRemises, francoSeuil), [totals.totalHTApresRemises, francoSeuil])

  // Redirect if no delivery info or empty cart
  if (!delivery) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-gray-500 text-lg">Veuillez d'abord preparer votre livraison</p>
        <Link to="/commande/preparation"><Button>Configurer la livraison</Button></Link>
      </div>
    )
  }

  if (lignes.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-gray-500 text-lg">Votre panier est vide</p>
        <Link to="/catalogue"><Button>Retour au catalogue</Button></Link>
      </div>
    )
  }

  const deliveryAddress = currentClient?.adressesLivraison.find(a => a.id === delivery.deliveryAddressId)

  // --- Proceed to payment (with stock re-check A4) ---
  const handleGoToPayment = () => {
    setProcessing(true)
    setProcessingLabel('Verification du stock en temps reel...')
    setTimeout(() => {
      const check = verifyCartStock(lignes.map(l => ({ reference: l.reference, quantiteSouhaitee: l.quantiteSouhaitee })), products)
      if (!check.valid) {
        setStockErrors(check.errors)
        setProcessing(false)
        return
      }
      setStockErrors([])
      setProcessing(false)
      setCurrentStep('paiement')
    }, 800)
  }

  // --- Confirm payment (DS-15) ---
  const handleConfirmPayment = () => {
    if (!currentUser || !currentClient) return
    setProcessing(true)
    setPaymentError('')
    setProcessingLabel('Creation de la commande...')

    setTimeout(() => {
      const orderLignes: LigneCommande[] = lignes.map(l => {
        const product = getByRef(l.reference)!
        const applicable = findApplicableRemises(clientId, 0, l.reference, remises)
        const bestRemise = getBestRemise(applicable)
        // DS-06: per-line delivery info from delivery setup
        const lineDelivery = delivery.lineDeliveries[l.reference]
        return {
          idLigne: generateId('LIG'),
          numCommande: '',
          reference: l.reference,
          quantiteCommandee: l.quantiteSouhaitee,
          quantiteExpediee: null,
          remiseAppliquee: bestRemise,
          prixUnitaireHT: product.prixUnitaireHT,
          dateLivraison: lineDelivery?.date || delivery.deliveryDate,
          adresseLivraison: lineDelivery?.addressId || delivery.deliveryAddressId,
        }
      })

      const commande = createFromCart(
        clientId,
        currentUser.login,
        'COM-001',
        delivery.deliveryAddressId,
        orderLignes,
        delivery.deliveryDate,
        delivery.billingAddress,
        totals.francoDePort,
        totals.fraisPort
      )

      setProcessingLabel('Traitement du paiement...')

      setTimeout(() => {
        if (simulateFailure) {
          setProcessing(false)
          setPaymentError('Paiement refuse par la banque. Votre commande a ete annulee et le stock libere.')
          revertToCart(commande.numCommande)
          return
        }

        // DS-15: advance to EN_PREPARATION + reserve stock
        advanceStatus(commande.numCommande, StatutCommande.EN_PREPARATION)
        lignes.forEach(l => updateStock(l.reference, -l.quantiteSouhaitee))
        clearCart()
        navigate(`/commande/confirmation/${commande.numCommande}`)
      }, 1200)
    }, 600)
  }

  // --- Stepper ---
  const steps = [
    { id: 'recapitulatif' as const, label: 'Recapitulatif', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'paiement' as const, label: 'Paiement', icon: <CreditCard className="w-4 h-4" /> },
  ]

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-center mb-4">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              currentStep === step.id
                ? 'bg-bordeaux-700 text-white shadow-md'
                : i < steps.findIndex(s => s.id === currentStep)
                  ? 'bg-forest-100 text-forest-800'
                  : 'bg-gray-100 text-gray-400'
            }`}>
              {step.icon}
              <span>{step.label}</span>
            </div>
            {i < steps.length - 1 && <div className="w-12 h-0.5 mx-2 bg-gray-200" />}
          </div>
        ))}
      </div>

      {currentStep === 'recapitulatif' && (
        <div className="space-y-6">
          {/* Stock errors */}
          {stockErrors.length > 0 && (
            <div className="space-y-2">
              <VerrouBanner type="stock" message="Le stock a change. Certains produits ne sont plus disponibles en quantite suffisante." />
              {stockErrors.map(e => (
                <Alert key={e.reference} variant="error">
                  <strong>{e.libelle}</strong> — demande : {e.demande}, disponible : {e.disponible}
                </Alert>
              ))}
              <Link to="/panier"><Button variant="secondary"><ArrowLeft className="w-4 h-4 mr-2" /> Modifier le panier</Button></Link>
            </div>
          )}

          {/* DS-14: Rappel des 3 adresses */}
          <Card padding="md">
            <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4">Adresses et livraison</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-1.5 mb-1 text-gray-500"><User className="w-3.5 h-3.5" /> Acheteur</div>
                <p className="font-medium">{currentClient?.raisonSociale}</p>
                <p className="text-gray-600">{currentClient?.contactPrincipal}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-1.5 mb-1 text-gray-500"><Truck className="w-3.5 h-3.5" /> Livraison</div>
                <p className="font-medium">{deliveryAddress?.libelle}</p>
                <p className="text-gray-600">{deliveryAddress?.rue}, {deliveryAddress?.codePostal} {deliveryAddress?.ville}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-1.5 mb-1 text-gray-500"><Building2 className="w-3.5 h-3.5" /> Facturation</div>
                <p className="text-gray-600 whitespace-pre-line text-xs">{delivery.billingAddress}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>Livraison souhaitee le <strong>{formatDate(delivery.deliveryDate)}</strong></span>
            </div>
          </Card>

          {/* DS-14: Lignes + totaux */}
          <Card padding="md">
            <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4">Detail de la commande</h2>
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

            <div className="border-t border-gray-200 pt-4 mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Total HT brut</span><span>{formatCurrency(totals.totalHT)}</span></div>
              {totals.totalRemises > 0 && (
                <div className="flex justify-between text-forest-700"><span>Remises</span><span>-{formatCurrency(totals.totalRemises)}</span></div>
              )}
              <div className="flex justify-between font-medium"><span>Total HT apres remises</span><span>{formatCurrency(totals.totalHTApresRemises)}</span></div>
              <TVABreakdown breakdown={totals.tvaBreakdown} />
              <div className="flex justify-between">
                <span className="text-gray-600">Frais de port</span>
                {totals.francoDePort ? <Badge variant="success">Franco de port</Badge> : <span>{formatCurrency(totals.fraisPort)}</span>}
              </div>
              {!totals.francoDePort && francoManquant > 0 && (
                <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg text-xs text-amber-800">
                  <Truck className="w-3.5 h-3.5" />
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
            <Link to="/panier" className="inline-flex items-center gap-1.5 text-sm text-bordeaux-700 hover:text-bordeaux-900">
              <ArrowLeft className="w-4 h-4" /> Modifier le panier
            </Link>
            <Button onClick={handleGoToPayment} disabled={processing || stockErrors.length > 0}>
              {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verification du stock...</> : <>Proceder au paiement <CreditCard className="w-4 h-4 ml-2" /></>}
            </Button>
          </div>
        </div>
      )}

      {currentStep === 'paiement' && (
        <div className="space-y-6 max-w-xl mx-auto">
          {paymentError && (
            <Alert variant="error" title="Echec du paiement">
              <div className="flex items-start gap-2"><XCircle className="w-4 h-4 mt-0.5" /><span>{paymentError}</span></div>
            </Alert>
          )}

          <Card padding="lg">
            <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4">
              <div className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-bordeaux-700" /> Paiement securise</div>
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center gap-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" /> Mode demonstration
            </div>
            <div className="space-y-4">
              <Input label="Numero de carte" value={cardNumber} readOnly className="bg-gray-50" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Expiration" value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM/AA" />
                <Input label="CVV" value={cvv} onChange={e => setCvv(e.target.value)} placeholder="123" type="password" />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer p-3 bg-red-50 border border-red-200 rounded-lg">
                <input type="checkbox" checked={simulateFailure} onChange={e => setSimulateFailure(e.target.checked)} className="rounded border-gray-300 text-red-600" />
                <span className="text-red-700">Simuler un echec de paiement (A8)</span>
              </label>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
              <span className="text-lg font-bold">Total a payer</span>
              <span className="text-2xl font-bold text-bordeaux-800">{formatCurrency(totals.totalTTC)}</span>
            </div>
          </Card>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setCurrentStep('recapitulatif')}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Retour au recapitulatif
            </Button>
            <Button size="lg" onClick={handleConfirmPayment} disabled={processing}>
              <ShieldCheck className="w-5 h-5 mr-2" />
              {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {processingLabel}</> : 'Confirmer et payer'}
            </Button>
          </div>
          <p className="text-xs text-gray-400 text-center">En confirmant, vous acceptez les conditions generales de vente</p>
        </div>
      )}
    </div>
  )
}
