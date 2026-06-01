import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react'

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: React.ReactNode
  className?: string
}

const config: Record<AlertVariant, { icon: typeof Info; bg: string; border: string; text: string }> = {
  info: { icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
  success: { icon: CheckCircle, bg: 'bg-forest-50', border: 'border-forest-200', text: 'text-forest-800' },
  warning: { icon: AlertTriangle, bg: 'bg-gold-50', border: 'border-gold-300', text: 'text-gold-900' },
  error: { icon: XCircle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' },
}

export function Alert({ variant = 'info', title, children, className = '' }: AlertProps) {
  const { icon: Icon, bg, border, text } = config[variant]
  return (
    <div className={`flex gap-3 rounded-lg border p-4 ${bg} ${border} ${className}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${text}`} />
      <div className={text}>
        {title && <p className="font-medium mb-1">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  )
}
