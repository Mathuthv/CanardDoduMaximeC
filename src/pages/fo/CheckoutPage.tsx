import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCartStore } from '../../stores/cartStore'
import { useAuthStore } from '../../stores/authStore'
import { useOrderStore } from '../../stores/orderStore'
import { useProductStore } from '../../stores/productStore'
import { useConfigStore } from '../../stores/configStore'
import { LigneCommande } from '../../types'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Badge } from '../../components/ui/Badge'
import { TVABreakdown } from '../../components/shared/TVABreakdown'
import { formatCurrency } from '../../utils/formatters'
import { generateId } from '../../utils/formatters'
import { findApplicableRemises, getBestRemise } from '../../utils/calculations'
import { ArrowLeft, CreditCard, Lock, ShieldCheck } from 'lucide-react'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { lignes, getCartTotals, clearCart } = useCartStore()
  const { currentUser, currentClient } = useAuthStore()
  const { createFromCart } = useOrderStore()
  const { getByRef, updateStock } = useProductStore()
  const { remises } = useConfigStore()

  const [selectedAddressId, setSelectedAddressId] = useState(
    currentClient?.adressesLivraison[0]?.id || ''
  )
  const [cardNumber] = useState('4242 4242 4242 4242')
  const [expiry, setExpiry] = useState('12/27')
  const [cvv, setCvv] = useState('123')
  const [processing, setProcessing] = useState(false)

  const clientId = currentClient?.idClient || ''
  const totals = useMemo(() => getCartTotals(clientId), [lignes, clientId, getCartTotals])

  const addressOptions = useMemo(
    () =>
      (currentClient?.adressesLivraison || []).map(a => ({
        value: a.id,
        label: a.libelle,
      })),
    [currentClient]
  )

  const selectedAddress = currentClient?.adressesLivraison.find(a => a.id === selectedAddressId)

  const handleConfirm = () => {
    if (!currentUser || !currentClient) return
    setProcessing(true)

    setTimeout(() => {
      // Build order lines
      const orderLignes: LigneCommande[] = lignes.map(l => {
        const product = getByRef(l.reference)!
        const applicable = findApplicableRemises(clientId, 0, l.reference, remises)
        const bestRemise = getBestRemise(applicable)

        return {
          idLigne: generateId('LIG'),
          numCommande: '', // Will be set by store
          reference: l.reference,
          quantiteCommandee: l.quantiteSouhaitee,
          quantiteExpediee: null,
          remiseAppliquee: bestRemise,
          prixUnitaireHT: product.prixUnitaireHT,
        }
      })

      // Create order
      const commande = createFromCart(
        clientId,
        currentUser.login,
        'COM-001', // Default commercial
        selectedAddressId,
        orderLignes
      )

      // Decrement stock
      lignes.forEach(l => {
        updateStock(l.reference, -l.quantiteSouhaitee)
      })

      // Clear cart
      clearCart()

      // Navigate to confirmation
      navigate(`/commande/confirmation/${commande.numCommande}`)
    }, 1500)
  }

  if (lignes.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-gray-500 text-lg">Votre panier est vide</p>
        <Link to="/catalogue">
          <Button>Retour au catalogue</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        to="/panier"
        className="inline-flex items-center gap-1.5 text-sm text-bordeaux-700 hover:text-bordeaux-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au panier
      </Link>

      <h1 className="text-2xl font-serif font-bold text-gray-900">Finaliser la commande</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery address */}
          <Card padding="md">
            <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4">Adresse de livraison</h2>
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
                <p>{selectedAddress.codePostal} {selectedAddress.ville}</p>
                <p>{selectedAddress.pays}</p>
              </div>
            )}
          </Card>

          {/* Billing address */}
          <Card padding="md">
            <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4">Adresse de facturation</h2>
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 whitespace-pre-line">
              {currentClient?.adrFacturationCentralisee || 'Non renseignee'}
            </div>
            <p className="text-xs text-gray-400 mt-2">Adresse de facturation centralisee (non modifiable)</p>
          </Card>

          {/* Payment */}
          <Card padding="md">
            <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-bordeaux-700" />
                Paiement
              </div>
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center gap-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              Paiement securise — Mode demonstration
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <Input
                  label="Numero de carte"
                  value={cardNumber}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Input
                  label="Expiration"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/AA"
                />
              </div>
              <div>
                <Input
                  label="CVV"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  type="password"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card padding="md" className="sticky top-24 space-y-4">
            <h2 className="text-lg font-serif font-semibold text-gray-900">Recapitulatif</h2>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {lignes.map(l => {
                const product = getByRef(l.reference)
                if (!product) return null
                return (
                  <div key={l.reference} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate mr-2">
                      {product.libelle} x{l.quantiteSouhaitee}
                    </span>
                    <span className="flex-shrink-0">
                      {formatCurrency(product.prixUnitaireHT * l.quantiteSouhaitee)}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total HT</span>
                <span>{formatCurrency(totals.totalHTApresRemises)}</span>
              </div>
              {totals.totalRemises > 0 && (
                <div className="flex justify-between text-forest-700">
                  <span>Remises</span>
                  <span>-{formatCurrency(totals.totalRemises)}</span>
                </div>
              )}
              <TVABreakdown breakdown={totals.tvaBreakdown} />
              <div className="flex justify-between">
                <span className="text-gray-600">Frais de port</span>
                {totals.francoDePort ? (
                  <Badge variant="success">Offert</Badge>
                ) : (
                  <span>{formatCurrency(totals.fraisPort)}</span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="text-lg font-bold text-gray-900">Total TTC</span>
              <span className="text-2xl font-bold text-bordeaux-800">{formatCurrency(totals.totalTTC)}</span>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleConfirm}
              disabled={processing}
            >
              <ShieldCheck className="w-5 h-5 mr-2" />
              {processing ? 'Traitement en cours...' : 'Confirmer et payer'}
            </Button>

            <p className="text-xs text-gray-400 text-center">
              En confirmant, vous acceptez les conditions generales de vente
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
