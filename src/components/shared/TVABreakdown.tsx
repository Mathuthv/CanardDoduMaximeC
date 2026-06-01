import { TVABreakdownLine } from '../../types'
import { formatCurrency, formatTVARate } from '../../utils/formatters'

interface TVABreakdownProps {
  breakdown: TVABreakdownLine[]
  className?: string
}

export function TVABreakdown({ breakdown, className }: TVABreakdownProps) {
  return (
    <div className={`text-sm ${className || ''}`}>
      <p className="font-medium text-gray-700 mb-2">Ventilation TVA</p>
      <div className="space-y-1">
        {breakdown.map(line => (
          <div key={line.codeTVA} className="flex justify-between text-gray-600">
            <span>TVA {formatTVARate(line.codeTVA)} sur {formatCurrency(line.baseHT)}</span>
            <span className="font-medium">{formatCurrency(line.montantTVA)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
