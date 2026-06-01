import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<div className="p-8 font-serif text-3xl text-bordeaux-800">Le Canard Dodu — Connexion</div>} />
        <Route path="/back-office" element={<div className="p-8 text-xl">Back Office — Sélection du rôle</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
