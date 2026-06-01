import { StatutCommande, StatutLitige } from '../../types'
import { Badge } from '../ui/Badge'
import { formatStatut, formatStatutLitige } from '../../utils/formatters'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gold'

const statutColors: Record<StatutCommande, BadgeVariant> = {
  [StatutCommande.PANIER_EN_COURS]: 'default',
  [StatutCommande.EN_ATTENTE_PAIEMENT]: 'warning',
  [StatutCommande.PAYEE_VALIDEE]: 'info',
  [StatutCommande.EN_PREPARATION]: 'gold',
  [StatutCommande.EXPEDIEE]: 'success',
  [StatutCommande.FACTUREE]: 'default',
}

const litigeColors: Record<StatutLitige, BadgeVariant> = {
  [StatutLitige.OUVERT]: 'warning',
  [StatutLitige.EN_COURS]: 'info',
  [StatutLitige.ACCEPTE]: 'success',
  [StatutLitige.REFUSE]: 'danger',
}

export function OrderStatusBadge({ statut }: { statut: StatutCommande }) {
  return <Badge variant={statutColors[statut]}>{formatStatut(statut)}</Badge>
}

export function LitigeStatusBadge({ statut }: { statut: StatutLitige }) {
  return <Badge variant={litigeColors[statut]}>{formatStatutLitige(statut)}</Badge>
}
