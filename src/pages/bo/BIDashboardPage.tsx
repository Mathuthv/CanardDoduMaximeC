import { useMemo, useState } from 'react'
import { useBiStore } from '../../stores/biStore'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { BarChart3, Download, FileSpreadsheet } from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const COLORS = {
  bordeaux: '#8f1d40',
  gold: '#d97706',
  forest: '#15803d',
  blue: '#2563eb',
  purple: '#7c3aed',
}

const PIE_COLORS = [COLORS.bordeaux, COLORS.gold, COLORS.forest, COLORS.blue]

export function BIDashboardPage() {
  const { getBiData } = useBiStore()
  const biData = useMemo(() => getBiData(), [getBiData])

  const [exportAlert, setExportAlert] = useState(false)

  const handleExport = () => {
    setExportAlert(true)
    setTimeout(() => setExportAlert(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-bordeaux-700" />
          <h1 className="text-2xl font-serif font-bold text-gray-900">Tableau de bord BI</h1>
        </div>
      </div>

      {exportAlert && (
        <Alert variant="info">Export genere — telechargement en cours (mode demo)</Alert>
      )}

      {/* Section 1: CA Overview — 3 charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* CA par agence */}
        <Card padding="sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">CA par agence</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={biData.caParAgence}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="agence" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="ca" fill={COLORS.bordeaux} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* CA par famille */}
        <Card padding="sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">CA par famille produit</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={biData.caParFamille}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="ca"
                nameKey="famille"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                label={((props: any) => `${props.famille || ''} ${((props.percent || 0) * 100).toFixed(0)}%`) as any}
                labelLine={false}
                fontSize={10}
              >
                {biData.caParFamille.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* CA par trimestre */}
        <Card padding="sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">CA par trimestre</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={biData.caParTrimestre}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="trimestre" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="ca" fill={COLORS.gold} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Section 2: Saisonnalite */}
      <Card padding="sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Saisonnalite — CA mensuel vs Projection</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={biData.caParMois}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
            <Line
              type="monotone"
              dataKey="ca"
              stroke={COLORS.bordeaux}
              strokeWidth={2}
              name="CA realise"
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="projection"
              stroke={COLORS.gold}
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Projection"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Section 3: Primes Commerciales */}
      <Card padding="sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Primes commerciales</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600">
                <th className="text-left py-2 px-3 font-medium">Commercial</th>
                <th className="text-left py-2 px-3 font-medium">Agence</th>
                <th className="text-right py-2 px-3 font-medium">Objectif CA</th>
                <th className="text-right py-2 px-3 font-medium">CA Realise</th>
                <th className="text-center py-2 px-3 font-medium">% Atteinte</th>
                <th className="text-right py-2 px-3 font-medium">Prime</th>
              </tr>
            </thead>
            <tbody>
              {biData.primes.map(p => {
                const atteinteCls =
                  p.pourcentageAtteinte >= 100
                    ? 'text-forest-700'
                    : p.pourcentageAtteinte >= 80
                      ? 'text-amber-700'
                      : 'text-red-600'
                const barWidth = Math.min(100, p.pourcentageAtteinte)
                const barColor =
                  p.pourcentageAtteinte >= 100
                    ? 'bg-forest-500'
                    : p.pourcentageAtteinte >= 80
                      ? 'bg-amber-500'
                      : 'bg-red-500'

                return (
                  <tr key={p.idCommercial} className="border-b border-gray-50">
                    <td className="py-2 px-3 font-medium">{p.nom}</td>
                    <td className="py-2 px-3 text-gray-500">{p.agence}</td>
                    <td className="py-2 px-3 text-right">{formatCurrency(p.objectifCA)}</td>
                    <td className="py-2 px-3 text-right">{formatCurrency(p.caRealise)}</td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${barColor}`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${atteinteCls} w-12 text-right`}>
                          {formatPercent(p.pourcentageAtteinte)}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right font-medium">
                      {p.montantPrime > 0 ? formatCurrency(p.montantPrime) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Section 4: Export */}
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Exporter en PDF
        </Button>
        <Button variant="secondary" onClick={handleExport}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Exporter en Excel
        </Button>
      </div>
    </div>
  )
}
