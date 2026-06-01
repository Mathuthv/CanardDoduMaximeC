import { TVA, CodeTVA } from '../types'

export const tvaRates: TVA[] = [
  { codeTVA: CodeTVA.TVA_5_5, tauxTVA: 5.5, libelle: 'TVA réduite 5,5 %' },
  { codeTVA: CodeTVA.TVA_20, tauxTVA: 20, libelle: 'TVA normale 20 %' },
]
