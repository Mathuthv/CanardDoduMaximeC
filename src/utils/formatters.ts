import { StatutCommande, StatutLitige, CategorieProduit, TypeRemise, CodeTVA, Devise } from '../types'

export function formatCurrency(amount: number, devise: Devise = Devise.EUR): string {
  const locale = devise === Devise.GBP ? 'en-GB' : 'fr-FR'
  const currency = devise === Devise.GBP ? 'GBP' : 'EUR'
  return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount)
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

export function formatStatut(statut: StatutCommande): string {
  const labels: Record<StatutCommande, string> = {
    [StatutCommande.PANIER_EN_COURS]: 'Panier en cours',
    [StatutCommande.EN_ATTENTE_PAIEMENT]: 'En attente de paiement',
    [StatutCommande.PAYEE_VALIDEE]: 'Payée / Validée',
    [StatutCommande.EN_PREPARATION]: 'En préparation',
    [StatutCommande.EXPEDIEE]: 'Expédiée',
    [StatutCommande.FACTUREE]: 'Facturée',
  }
  return labels[statut]
}

export function formatStatutLitige(statut: StatutLitige): string {
  const labels: Record<StatutLitige, string> = {
    [StatutLitige.OUVERT]: 'Ouvert',
    [StatutLitige.EN_COURS]: 'En cours d\'analyse',
    [StatutLitige.ACCEPTE]: 'Accepté',
    [StatutLitige.REFUSE]: 'Refusé',
  }
  return labels[statut]
}

export function formatCategorie(cat: CategorieProduit): string {
  const labels: Record<CategorieProduit, string> = {
    [CategorieProduit.FOIE_GRAS]: 'Foie Gras',
    [CategorieProduit.CHARCUTERIES]: 'Charcuteries',
    [CategorieProduit.PLATS_CUISINES]: 'Plats Cuisinés',
    [CategorieProduit.VINS]: 'Vins',
  }
  return labels[cat]
}

export function formatTypeRemise(type: TypeRemise): string {
  const labels: Record<TypeRemise, string> = {
    [TypeRemise.EXCEPTIONNELLE]: 'Exceptionnelle',
    [TypeRemise.VOLUME]: 'Volume',
    [TypeRemise.FIDELITE]: 'Fidélité',
  }
  return labels[type]
}

export function formatTVARate(code: CodeTVA): string {
  return code === CodeTVA.TVA_5_5 ? '5,5 %' : '20 %'
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1).replace('.', ',')} %`
}

export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 6)
  return `${prefix}-${timestamp}-${random}`
}
