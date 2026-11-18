import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { FournisseurUtilisateur } from './contexts/ContexteUtilisateur.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter lit et modifie l'adresse du navigateur (comme createWebHistory en Vue Router) */}
    <BrowserRouter>
      <FournisseurUtilisateur>
        <App />
      </FournisseurUtilisateur>
    </BrowserRouter>
  </StrictMode>,
)