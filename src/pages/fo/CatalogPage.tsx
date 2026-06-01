import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProductStore } from '../../stores/productStore'
import { useCartStore } from '../../stores/cartStore'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Alert } from '../../components/ui/Alert'
import { ProductCard } from '../../components/shared/ProductCard'
import { CategorieProduit } from '../../types'
import { formatCategorie } from '../../utils/formatters'
import { Search, SlidersHorizontal } from 'lucide-react'

type SortOption = 'name' | 'price_asc' | 'price_desc'

export function CatalogPage() {
  const navigate = useNavigate()
  const { products } = useProductStore()
  const { addLine } = useCartStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Set<CategorieProduit>>(new Set())
  const [stockOnly, setStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)

  const toggleCategory = (cat: CategorieProduit) => {
    setSelectedCategories(prev => {
      const next = new Set(prev)
      if (next.has(cat)) {
        next.delete(cat)
      } else {
        next.add(cat)
      }
      return next
    })
  }

  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        p =>
          p.libelle.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.reference.toLowerCase().includes(q)
      )
    }

    // Category filter
    if (selectedCategories.size > 0) {
      result = result.filter(p => selectedCategories.has(p.categorie))
    }

    // Stock filter
    if (stockOnly) {
      result = result.filter(p => p.stockPhysiqueDisponible > 0)
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.libelle.localeCompare(b.libelle))
        break
      case 'price_asc':
        result.sort((a, b) => a.prixUnitaireHT - b.prixUnitaireHT)
        break
      case 'price_desc':
        result.sort((a, b) => b.prixUnitaireHT - a.prixUnitaireHT)
        break
    }

    return result
  }, [products, searchQuery, selectedCategories, stockOnly, sortBy])

  const handleAddToCart = (ref: string) => {
    const result = addLine(ref, 1)
    if (result.success) {
      setToast({ message: 'Produit ajoute au panier !', variant: 'success' })
    } else {
      setToast({ message: result.message || 'Erreur', variant: 'error' })
    }
    setTimeout(() => setToast(null), 3000)
  }

  const categories = Object.values(CategorieProduit)

  const sortOptions = [
    { value: 'name', label: 'Nom (A-Z)' },
    { value: 'price_asc', label: 'Prix croissant' },
    { value: 'price_desc', label: 'Prix decroissant' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Catalogue</h1>
        <p className="text-gray-500 mt-1">Decouvrez nos specialites gastronomiques</p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right">
          <Alert variant={toast.variant === 'success' ? 'success' : 'error'}>
            {toast.message}
          </Alert>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-bordeaux-500 focus:border-bordeaux-500"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="w-full lg:w-48">
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            />
          </div>
        </div>

        {/* Category checkboxes and stock filter */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtres :</span>
          </div>

          {categories.map(cat => (
            <label key={cat} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.has(cat)}
                onChange={() => toggleCategory(cat)}
                className="rounded border-gray-300 text-bordeaux-700 focus:ring-bordeaux-500"
              />
              <span className="text-gray-700">{formatCategorie(cat)}</span>
            </label>
          ))}

          <div className="border-l border-gray-200 pl-4 ml-2">
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={stockOnly}
                onChange={() => setStockOnly(!stockOnly)}
                className="rounded border-gray-300 text-bordeaux-700 focus:ring-bordeaux-500"
              />
              <span className="text-gray-700">En stock uniquement</span>
            </label>
          </div>
        </div>
      </div>

      {/* Product count */}
      <p className="text-sm text-gray-500">
        {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouve{filteredProducts.length > 1 ? 's' : ''}
      </p>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Aucun produit ne correspond a vos criteres.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.reference}
              product={product}
              onAddToCart={handleAddToCart}
              onClick={(ref) => navigate(`/catalogue/${ref}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
