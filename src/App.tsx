import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { FrontOfficeLayout } from './components/layout/FrontOfficeLayout'
import { BackOfficeLayout } from './components/layout/BackOfficeLayout'
import { useAuthStore } from './stores/authStore'
import { Role } from './types'

// Front-Office pages
import { LoginPage } from './pages/fo/LoginPage'
import { DashboardPage } from './pages/fo/DashboardPage'
import { CatalogPage } from './pages/fo/CatalogPage'
import { ProductDetailPage } from './pages/fo/ProductDetailPage'
import { CartPage } from './pages/fo/CartPage'
import { CheckoutPage } from './pages/fo/CheckoutPage'
import { OrderConfirmationPage } from './pages/fo/OrderConfirmationPage'
import { OrderHistoryPage } from './pages/fo/OrderHistoryPage'
import { OrderDetailPage } from './pages/fo/OrderDetailPage'
import { DisputePage } from './pages/fo/DisputePage'

// Back-Office pages
import { BOLoginPage } from './pages/bo/BOLoginPage'
import { PhoneOrderPage } from './pages/bo/PhoneOrderPage'
import { LogisticsPage } from './pages/bo/LogisticsPage'
import { InvoicingPage } from './pages/bo/InvoicingPage'
import { CreditNotesPage } from './pages/bo/CreditNotesPage'
import { ConfigPage } from './pages/bo/ConfigPage'
import { BIDashboardPage } from './pages/bo/BIDashboardPage'

function AuthGuard({ children, requiredRole }: { children: React.ReactNode; requiredRole?: Role }) {
  const { isAuthenticated, currentUser } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && currentUser?.role !== requiredRole) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function BOAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, currentUser } = useAuthStore()

  if (!isAuthenticated || currentUser?.role === Role.CLIENT) {
    return <Navigate to="/back-office" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Front-Office: Login (no layout) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Front-Office: Authenticated pages */}
        <Route element={<AuthGuard><FrontOfficeLayout /></AuthGuard>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/catalogue" element={<CatalogPage />} />
          <Route path="/catalogue/:ref" element={<ProductDetailPage />} />
          <Route path="/panier" element={<CartPage />} />
          <Route path="/commande/checkout" element={<CheckoutPage />} />
          <Route path="/commande/confirmation/:num" element={<OrderConfirmationPage />} />
          <Route path="/commandes" element={<OrderHistoryPage />} />
          <Route path="/commandes/:num" element={<OrderDetailPage />} />
          <Route path="/litige/:numFacture" element={<DisputePage />} />
        </Route>

        {/* Back-Office: Login / Role Selector (no layout) */}
        <Route path="/back-office" element={<BOLoginPage />} />

        {/* Back-Office: Authenticated pages */}
        <Route element={<BOAuthGuard><BackOfficeLayout /></BOAuthGuard>}>
          <Route path="/back-office/commandes-telephone" element={<PhoneOrderPage />} />
          <Route path="/back-office/logistique" element={<LogisticsPage />} />
          <Route path="/back-office/facturation" element={<InvoicingPage />} />
          <Route path="/back-office/avoirs" element={<CreditNotesPage />} />
          <Route path="/back-office/parametrage" element={<ConfigPage />} />
          <Route path="/back-office/bi" element={<BIDashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
