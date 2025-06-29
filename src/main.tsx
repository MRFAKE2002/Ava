//! Libraries
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

//! CSS
import './index.css'

//! App
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
