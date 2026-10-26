import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import App from './App.tsx'
import { queryClient } from './lib/queryClient.ts'
import { useAuthStore } from './hooks/useAuth.ts'
import { registerPushSubscription } from './features/notifications/push.ts'
import '@fontsource-variable/inter'
import './index.css'

const uiPreview = import.meta.env.VITE_UI_PREVIEW === 'true'
const publicPreviewPaths = new Set(['/', '/login', '/forgot-password', '/set-password'])

// Request persistent storage so Chrome doesn't wipe localStorage (auth tokens)
// when "Clear Cookies/Site Data on Close" is enabled on mobile.
navigator.storage?.persist?.()

if (!uiPreview && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(() => {
      registerPushSubscription()
    })
  })
}

async function bootstrap() {
  // Seed the preview session before React mounts so deep links (for example
  // /team-members) are not bounced to /dashboard by the auth listener.
  if (uiPreview && !publicPreviewPaths.has(window.location.pathname)) {
    const { previewEmployee, previewUser } = await import('./dev/preview/data.ts')
    useAuthStore.getState().setAuth(previewUser, previewEmployee)
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <App />
          </ThemeProvider>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>,
  )
}

void bootstrap()
