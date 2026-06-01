import { Shield } from 'lucide-react'

type VerrouType = 'stock' | 'logistics' | 'accounting'

interface VerrouBannerProps {
  type: VerrouType
  message: string
  className?: string
}

const titles: Record<VerrouType, string> = {
  stock: '🔒 Verrou de Stock',
  logistics: '🔒 Verrou Logistique',
  accounting: '🔒 Verrou Comptable',
}

export function VerrouBanner({ type, message, className }: VerrouBannerProps) {
  return (
    <div className={`border-2 border-gold-400 rounded-lg bg-gold-50 p-4 ${className || ''}`}>
      <div className="flex items-start gap-3">
        <Shield className="w-5 h-5 text-gold-700 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-gold-900 text-sm">{titles[type]}</p>
          <p className="text-sm text-gold-800 mt-1">{message}</p>
          <p className="text-xs text-gold-600 mt-2 italic">Mode démo — Ce verrou protège l'intégrité du processus métier</p>
        </div>
      </div>
    </div>
  )
}
