import { Badge } from '../ui/Badge'

interface StockBadgeProps {
  stock: number
  showCount?: boolean
}

export function StockBadge({ stock, showCount = true }: StockBadgeProps) {
  if (stock <= 0) {
    return <Badge variant="danger">Rupture de stock</Badge>
  }
  if (stock <= 10) {
    return <Badge variant="warning">Stock faible{showCount ? ` (${stock})` : ''}</Badge>
  }
  return <Badge variant="success">En stock{showCount ? ` (${stock})` : ''}</Badge>
}
