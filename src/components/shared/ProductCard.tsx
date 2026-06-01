import { Produit } from '../../types'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { StockBadge } from './StockBadge'
import { formatCurrency } from '../../utils/formatters'
import { formatCategorie } from '../../utils/formatters'
import { ShoppingCart } from 'lucide-react'

interface ProductCardProps {
  product: Produit
  onAddToCart?: (ref: string) => void
  onClick?: (ref: string) => void
  remiseTaux?: number  // 0.15 = 15%
}

export function ProductCard({ product, onAddToCart, onClick, remiseTaux }: ProductCardProps) {
  const isOutOfStock = product.stockPhysiqueDisponible <= 0
  const hasRemise = remiseTaux !== undefined && remiseTaux > 0
  const prixRemise = hasRemise ? Math.round(product.prixUnitaireHT * (1 - remiseTaux) * 100) / 100 : product.prixUnitaireHT

  return (
    <Card hover padding="none" className="overflow-hidden flex flex-col" >
      <div
        className="cursor-pointer"
        onClick={() => onClick?.(product.reference)}
      >
        <div className="h-48 bg-gradient-to-br from-bordeaux-50 to-ivory-100 flex items-center justify-center">
          <span className="text-6xl opacity-30">
            {product.categorie === 'FOIE_GRAS' ? '🦆' : product.categorie === 'VINS' ? '🍷' : product.categorie === 'CHARCUTERIES' ? '🥩' : '🍽️'}
          </span>
        </div>
        <div className="p-4 flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wide">{formatCategorie(product.categorie)}</span>
            <StockBadge stock={product.stockPhysiqueDisponible} />
          </div>
          <h3 className="font-serif font-semibold text-gray-900 mb-1 line-clamp-2">{product.libelle}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{product.description}</p>
          <div className="flex items-center justify-between">
            {hasRemise ? (
              <div>
                <span className="text-lg font-bold text-bordeaux-800">{formatCurrency(prixRemise)}<span className="text-xs font-normal text-gray-500"> HT/{product.unite}</span></span>
                <span className="text-xs text-gray-400 line-through ml-2">{formatCurrency(product.prixUnitaireHT)}</span>
                <span className="text-xs text-forest-700 ml-1">-{(remiseTaux * 100).toFixed(0)}%</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-bordeaux-800">{formatCurrency(product.prixUnitaireHT)}<span className="text-xs font-normal text-gray-500"> HT/{product.unite}</span></span>
            )}
          </div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <Button
          variant={isOutOfStock ? 'secondary' : 'primary'}
          size="sm"
          className="w-full"
          disabled={isOutOfStock}
          onClick={(e) => {
            e.stopPropagation()
            onAddToCart?.(product.reference)
          }}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isOutOfStock ? 'Indisponible' : 'Ajouter au panier'}
        </Button>
      </div>
    </Card>
  )
}
