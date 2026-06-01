import { Remise, TypeRemise } from '../types'

export const initialRemises: Remise[] = [
  { idRemise: 'REM-001', idClient: 'CLI-001', taux: 0.15, typeRemise: TypeRemise.FIDELITE, dateDebut: '2026-01-01', dateFin: '2026-12-31', description: 'Remise fidélité La Table d\'Or — 15 %' },
  { idRemise: 'REM-002', taux: 0.05, typeRemise: TypeRemise.VOLUME, seuilDeclenchement: 1000, dateDebut: '2026-01-01', dateFin: '2026-12-31', description: 'Remise volume > 1 000 € HT — 5 %' },
  { idRemise: 'REM-003', taux: 0.10, typeRemise: TypeRemise.EXCEPTIONNELLE, produitReference: 'FG-001', dateDebut: '2026-05-15', dateFin: '2026-06-30', description: 'Promo été Foie Gras Entier — 10 %' },
]
