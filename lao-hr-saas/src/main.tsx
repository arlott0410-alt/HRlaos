import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { registerSW } from 'virtual:pwa-register'
import { initI18n } from '@/i18n'
import { router } from '@/router'
import { subscribeAuthStore, useAuthStore } from '@/stores/authStore'
import { useTenantStore } from '@/stores/tenantStore'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60_000 },
  },
})

registerSW({ immediate: true })

async function bootstrap() {
  await initI18n()
  subscribeAuthStore()
  await Promise.all([useTenantStore.getState().init(), useAuthStore.getState().initialize()])
}

function AppRoot() {
  const [ready, setReady] = useState(false)
  const [bootError, setBootError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        setBootError(null)
        await bootstrap()
      } catch (e) {
        console.error('bootstrap failed', e)
        setBootError(e instanceof Error ? e.message : 'bootstrap failed')
      } finally {
        setReady(true)
      }
    })()
  }, [])

  if (!ready) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600" aria-hidden />
      </div>
    )
  }

  if (bootError) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
        <p className="text-sm font-medium text-danger-700">Bootstrap error</p>
        <p className="max-w-md text-xs text-slate-600">{bootError}</p>
        <p className="max-w-md text-xs text-slate-500">
          Check browser console. Ensure <code className="rounded bg-slate-200 px-1">lao-hr-saas/.env</code>{' '}
          has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then refresh.
        </p>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="bottom-center" />
    </QueryClientProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>,
)
