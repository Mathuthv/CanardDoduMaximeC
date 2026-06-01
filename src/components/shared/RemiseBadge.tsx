import { TypeRemise } from '../../types'
import { Badge } from '../ui/Badge'
import { formatTypeRemise } from '../../utils/formatters'
import { Tag } from 'lucide-react'

interface RemiseBadgeProps {
  type: TypeRemise
  taux: number
}

export function RemiseBadge({ type, taux }: RemiseBadgeProps) {
  return (
    <Badge variant="gold">
      <Tag className="w-3 h-3 mr-1" />
      {formatTypeRemise(type)} −{(taux * 100).toFixed(0)} %
    </Badge>
  )
}
