import { Facture } from '../../types'
import { formatCurrency, formatDate, formatTVARate } from '../../utils/formatters'
import { Button } from '../ui/Button'
import { Download } from 'lucide-react'

interface InvoicePDFProps {
  facture: Facture
}

export function InvoicePDF({ facture }: InvoicePDFProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm max-w-2xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-serif font-bold text-bordeaux-800">Le Canard Dodu</h1>
            <p className="text-sm text-gray-500 mt-1">Producteur de spécialités gastronomiques</p>
            <p className="text-xs text-gray-400 mt-1">SIRET : 123 456 789 00011 — TVA : FR12345678900</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">FACTURE</p>
            <p className="text-sm font-medium text-bordeaux-700">{facture.numFacture}</p>
            <p className="text-sm text-gray-500">{formatDate(facture.dateEmission)}</p>
          </div>
        </div>
      </div>

      {/* Billing address */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Adresse de facturation</p>
        <p className="text-sm text-gray-700 whitespace-pre-line">{facture.adresseFacturation}</p>
      </div>

      {/* Line items */}
      <div className="p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-600">
              <th className="text-left py-2 font-medium">Produit</th>
              <th className="text-right py-2 font-medium">Qté</th>
              <th className="text-right py-2 font-medium">P.U. HT</th>
              <th className="text-right py-2 font-medium">Remise</th>
              <th className="text-right py-2 font-medium">TVA</th>
              <th className="text-right py-2 font-medium">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {facture.lignes.map((l, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="py-2">{l.libelleProduit}</td>
                <td className="py-2 text-right">{l.quantite}</td>
                <td className="py-2 text-right">{formatCurrency(l.prixUnitaireHT)}</td>
                <td className="py-2 text-right">{l.remise > 0 ? `−${(l.remise * 100).toFixed(0)} %` : '—'}</td>
                <td className="py-2 text-right">{formatTVARate(l.codeTVA)}</td>
                <td className="py-2 text-right font-medium">{formatCurrency(l.totalLigneHT)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex justify-end">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total HT</span>
              <span>{formatCurrency(facture.totalHT)}</span>
            </div>
            {facture.tvaBreakdown.map(t => (
              <div key={t.codeTVA} className="flex justify-between text-gray-500">
                <span>TVA {formatTVARate(t.codeTVA)}</span>
                <span>{formatCurrency(t.montantTVA)}</span>
              </div>
            ))}
            {facture.fraisPort > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Frais de port</span>
                <span>{formatCurrency(facture.fraisPort)}</span>
              </div>
            )}
            {facture.francoDePort && (
              <div className="flex justify-between text-forest-700">
                <span>Franco de port</span>
                <span>Offert</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
              <span>Total TTC</span>
              <span className="text-bordeaux-800">{formatCurrency(facture.totalTTC)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Download button */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end">
        <Button variant="secondary" size="sm" onClick={() => alert('Téléchargement du PDF en cours... (mode démo)')}>
          <Download className="w-4 h-4 mr-2" />
          Télécharger PDF
        </Button>
      </div>
    </div>
  )
}
