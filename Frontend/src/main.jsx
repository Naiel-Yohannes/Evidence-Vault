import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--card)',
          color: 'var(--card-foreground)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          fontSize: '0.875rem',
          fontFamily: 'var(--font-sans)',
          boxShadow: '0 4px 12px oklch(0 0 0 / 10%)',
        },
        success: {
          iconTheme: {
            primary: 'oklch(0.5 0.14 155)',
            secondary: 'oklch(0.98 0.01 155)',
          },
        },
        error: {
          iconTheme: {
            primary: 'oklch(0.6 0.16 25)',
            secondary: 'oklch(0.98 0.01 88)',
          },
        },
      }}
    />
  </StrictMode>,
)
