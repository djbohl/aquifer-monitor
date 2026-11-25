import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { initBotId } from 'botid/client/core'
import App from './App.jsx'

if (import.meta.env.PROD) {
  initBotId({ protect: [{ path: '/api/usgs/*', method: 'GET' }] })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>
)
