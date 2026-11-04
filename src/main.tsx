import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import { LanguageProvider } from './i18n.tsx'
import { ThemeProvider } from './theme.tsx'
import App from './App.tsx'
import Blueprint from './pages/Blueprint.tsx'
import Status from './pages/Status.tsx'

// Входы секций анимируются только при живом JS: без него всё видно сразу.
document.documentElement.classList.add('js')

// SPA на GitHub Pages: dist/404.html = копия index.html (см. build script),
// поэтому прямые заходы на /blueprint работают.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/blueprint" element={<Blueprint />} />
          <Route path="/status" element={<Status />} />
          <Route path="*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
)
