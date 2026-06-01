import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProductStore } from '../../stores/productStore'
import { useCartStore } from '../../stores/cartStore'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Alert } from '../../components/ui/Alert'
import { Badge } from '../../components/ui/Badge'
import { StockBadge } from '../../components/shared/StockBadge'
import { VerrouBanner } from '../../components/shared/VerrouBanner'
import { ProductCard } from '../../components/shared/ProductCard'
import { canAddToCart } from '../../utils/calculations'
import { formatCurrency, formatCategorie, formatTVARate } from '../../utils/formatters'
import { ArrowLeft, ShoppingCart, Minus, Plus } from 'lucide-react'

export function ProductDetailPage() {
  const { ref } = useParams<{ ref: string }>()
  const navigate = useNavigate()
  const { getByRef, getByCategory, products } = useProductStore()
  const { addLine } = useCartStore()

  const [quantity, setQuantity] = useState(1)
  const [feedback, setFeedback] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)

  const product = getByRef(ref || '')

  const relatedProducts = useMemo(() => {
    if (!product) return []
    return getByCategory(product.categorie)
      .filter(p => p.reference !== product.reference)
      .slice(0, 4)
  }, [product, getByCategory])

  if (!product) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">Produit introuvable</p>
        <Link to="/catalogue" className="text-bordeaux-700 hover:underline mt-2 inline-block">
          Retour au catalogue
        </Link>
      </div>
    )
  }

  const isOutOfStock = product.stockPhysiqueDisponible <= 0
  const stockCheck = canAddToCart(product, quantity)
  const emoji = product.categorie === 'FOIE_GRAS' ? '🦆' : product.categorie === 'VINS' ? '🍷' : product.categorie === 'CHARCUTERIES' ? '🥩' : '🍽️'

  const handleAddToCart = () => {
    const result = addLine(product.reference, quantity)
    if (result.success) {
      setFeedback({ message: `${quantity} x ${product.libelle} ajoute(s) au panier`, variant: 'success' })
      setQuantity(1)
    } else {
      setFeedback({ message: result.message || 'Erreur', variant: 'error' })
    }
    setTimeout(() => setFeedback(null), 4000)
  }

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        to="/catalogue"
        className="inline-flex items-center gap-1.5 text-sm text-bordeaux-700 hover:text-bordeaux-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au catalogue
      </Link>

      {/* Feedback */}
      {feedback && (
        <Alert variant={feedback.variant === 'success' ? 'success' : 'error'}>
          {feedback.message}
        </Alert>
      )}

      {/* Product Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image placeholder */}
        <div className="aspect-square bg-gradient-to-br from-bordeaux-50 to-ivory-100 rounded-xl flex items-center justify-center">
          <span className="text-9xl opacity-30">{emoji}</span>
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">{formatCategorie(product.categorie)}</Badge>
              <Badge variant="info">{formatTVARate(product.codeTVA)}</Badge>
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">{product.libelle}</h1>
            <p className="text-sm text-gray-500 mt-1">Ref: {product.reference}</p>
          </div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-bordeaux-800">{formatCurrency(product.prixUnitaireHT)}</span>
            <span className="text-gray-500 pb-1">HT / {product.unite}</span>
          </div>

          <StockBadge stock={product.stockPhysiqueDisponible} />

          {isOutOfStock && (
            <VerrouBanner
              type="stock"
              message="Ce produit est actuellement en rupture de stock. Aucun ajout au panier possible."
            />
          )}

          {!isOutOfStock && !stockCheck.allowed && (
            <VerrouBanner
              type="stock"
              message={`Quantite maximale disponible : ${product.stockPhysiqueDisponible} ${product.unite}(s)`}
            />
          )}

          {!isOutOfStock && (
            <Card padding="md" className="space-y-4">
              {/* Quantity selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantite</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={product.stockPhysiqueDisponible}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stockPhysiqueDisponible, parseInt(e.target.value) || 1)))}
                    className="w-20 text-center rounded-lg border border-gray-300 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bordeaux-500"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stockPhysiqueDisponible, quantity + 1))}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-500">/ {product.stockPhysiqueDisponible} disponible(s)</span>
                </div>
              </div>

              {/* Subtotal */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-sm text-gray-600">Sous-total HT</span>
                <span className="text-lg font-bold text-bordeaux-800">
                  {formatCurrency(product.prixUnitaireHT * quantity)}
                </span>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
                disabled={!stockCheck.allowed}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Ajouter au panier
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-xl font-serif font-semibold text-gray-900 mb-4">Produits similaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <ProductCard
                key={p.reference}
                product={p}
                onClick={(r) => navigate(`/catalogue/${r}`)}
                onAddToCart={(r) => {
                  const res = addLine(r, 1)
                  if (res.success) {
                    setFeedback({ message: 'Produit ajoute au panier !', variant: 'success' })
                  } else {
                    setFeedback({ message: res.message || 'Erreur', variant: 'error' })
                  }
                  setTimeout(() => setFeedback(null), 3000)
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
