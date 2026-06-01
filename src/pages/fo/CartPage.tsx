import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../stores/cartStore'
import { useProductStore } from '../../stores/productStore'
import { useAuthStore } from '../../stores/authStore'
import { useConfigStore } from '../../stores/configStore'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Alert } from '../../components/ui/Alert'
import { VerrouBanner } from '../../components/shared/VerrouBanner'
import { TVABreakdown } from '../../components/shared/TVABreakdown'
import { RemiseBadge } from '../../components/shared/RemiseBadge'
import { formatCurrency } from '../../utils/formatters'
import { findApplicableRemises, getBestRemise, calcLineTotalHT, calcFrancoManquant } from '../../utils/calculations'
import { ShoppingBag, Trash2, Minus, Plus, ArrowLeft, ArrowRight, Truck } from 'lucide-react'

/**
 * IHM — Panier (CU « Création d'une commande » — étape panier)
 *
 * Zone lignes       : type liste éditable, colonnes = produit, qté (saisie numérique ≥1 ≤stock), prix HT, remise, total ligne
 * Zone quantité     : type saisie numérique, contrôle bloquant ≤ stock avec VerrouBanner si dépassement
 * Zone récapitulatif: type affichage calculé (total HT brut, remises, HT après remises, ventilation TVA 5.5%/20%, frais port, TTC)
 * Zone franco       : type affichage conditionnel, message « plus que X € » si seuil non atteint
 * Zone actions      : type bouton, « Valider ma commande » → navigation CheckoutPage
 * Référentiels      : produits (productStore), remises (configStore), adresses (client.adressesLivraison)
 */
export function CartPage() {
  const navigate = useNavigate()
  const { lignes, updateQty, removeLine, getCartTotals } = useCartStore()
  const { getByRef } = useProductStore()
  const { currentClient } = useAuthStore()
  const { remises } = useConfigStore()
  const [lineErrors, setLineErrors] = useState<Record<string, string>>({})

  const { francoSeuil } = useConfigStore()
  const clientId = currentClient?.idClient || ''
  const totals = useMemo(() => getCartTotals(clientId), [lignes, clientId, getCartTotals])
  const francoManquant = useMemo(() => calcFrancoManquant(totals.totalHTApresRemises, francoSeuil), [totals.totalHTApresRemises, francoSeuil])

  const handleUpdateQty = (ref: string, newQty: number) => {
    if (newQty <= 0) {
      removeLine(ref)
      setLineErrors(prev => {
        const next = { ...prev }
        delete next[ref]
        return next
      })
      return
    }

    const result = updateQty(ref, newQty)
    if (!result.success) {
      setLineErrors(prev => ({ ...prev, [ref]: result.message || 'Erreur' }))
    } else {
      setLineErrors(prev => {
        const next = { ...prev }
        delete next[ref]
        return next
      })
    }
  }

  if (lignes.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto" />
        <h1 className="text-2xl font-serif font-bold text-gray-900">Votre panier est vide</h1>
        <p className="text-gray-500">Parcourez notre catalogue pour ajouter des produits</p>
        <Link to="/catalogue">
          <Button variant="primary" size="lg">
            Decouvrir le catalogue
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Mon panier</h1>
          <p className="text-gray-500 mt-1">{lignes.length} article{lignes.length > 1 ? 's' : ''}</p>
        </div>
        <Link to="/catalogue" className="text-sm text-bordeaux-700 hover:text-bordeaux-900 flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" />
          Continuer mes achats
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart lines */}
        <div className="lg:col-span-2 space-y-4">
          {lignes.map(ligne => {
            const product = getByRef(ligne.reference)
            if (!product) return null

            const applicable = findApplicableRemises(clientId, 0, ligne.reference, remises)
            const bestRemise = getBestRemise(applicable)
            const bestRemiseObj = applicable.find(r => r.taux === bestRemise)
            const lineTotal = calcLineTotalHT(ligne.quantiteSouhaitee, product.prixUnitaireHT, bestRemise)

            return (
              <Card key={ligne.reference} padding="md">
                <div className="flex gap-4">
                  {/* Product image */}
                  <div className="w-20 h-20 bg-gradient-to-br from-bordeaux-50 to-ivory-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl opacity-30">
                      {product.categorie === 'FOIE_GRAS' ? '🦆' : product.categorie === 'VINS' ? '🍷' : product.categorie === 'CHARCUTERIES' ? '🥩' : '🍽️'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          to={`/catalogue/${product.reference}`}
                          className="font-medium text-gray-900 hover:text-bordeaux-700"
                        >
                          {product.libelle}
                        </Link>
                        <p className="text-sm text-gray-500">{formatCurrency(product.prixUnitaireHT)} HT / {product.unite}</p>
                        {bestRemise > 0 && bestRemiseObj && (
                          <div className="mt-1">
                            <RemiseBadge type={bestRemiseObj.typeRemise} taux={bestRemise} />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeLine(ligne.reference)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateQty(ligne.reference, ligne.quantiteSouhaitee - 1)}
                          className="p-1 rounded border border-gray-300 hover:bg-gray-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={ligne.quantiteSouhaitee}
                          onChange={(e) => handleUpdateQty(ligne.reference, parseInt(e.target.value) || 0)}
                          className="w-14 text-center rounded border border-gray-300 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-bordeaux-500"
                        />
                        <button
                          onClick={() => handleUpdateQty(ligne.reference, ligne.quantiteSouhaitee + 1)}
                          className="p-1 rounded border border-gray-300 hover:bg-gray-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-semibold text-gray-900">{formatCurrency(lineTotal)}</span>
                    </div>

                    {/* Stock error */}
                    {lineErrors[ligne.reference] && (
                      <VerrouBanner
                        type="stock"
                        message={lineErrors[ligne.reference]}
                        className="mt-2"
                      />
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Summary panel */}
        <div>
          <Card padding="md" className="sticky top-24 space-y-4">
            <h2 className="text-lg font-serif font-semibold text-gray-900">Recapitulatif</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total HT brut</span>
                <span>{formatCurrency(totals.totalHT)}</span>
              </div>

              {totals.totalRemises > 0 && (
                <div className="flex justify-between text-forest-700">
                  <span>Remises appliquees</span>
                  <span>-{formatCurrency(totals.totalRemises)}</span>
                </div>
              )}

              <div className="flex justify-between font-medium">
                <span className="text-gray-700">Total HT apres remises</span>
                <span>{formatCurrency(totals.totalHTApresRemises)}</span>
              </div>

              <div className="border-t border-gray-100 pt-2">
                <TVABreakdown breakdown={totals.tvaBreakdown} />
              </div>

              <div className="flex justify-between pt-2 border-t border-gray-100">
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
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="text-lg font-bold text-gray-900">Total TTC</span>
              <span className="text-2xl font-bold text-bordeaux-800">{formatCurrency(totals.totalTTC)}</span>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={() => navigate('/commande/checkout')}
            >
              Valider ma commande
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Link to="/catalogue" className="block text-center text-sm text-bordeaux-700 hover:underline">
              Continuer mes achats
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
