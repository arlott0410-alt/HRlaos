import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn, isIOS, isStandaloneDisplay } from '@/lib/utils'

const DISMISS_KEY = 'hr-laos-pwa-dismissed'

export function InstallPWAHint() {
  const { t } = useTranslation()
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [busy, setBusy] = useState(false)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1')
  const [standalone] = useState(isStandaloneDisplay)

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBip)
    return () => window.removeEventListener('beforeinstallprompt', onBip)
  }, [])

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }, [])

  const install = useCallback(async () => {
    if (!deferred) return
    setBusy(true)
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    setBusy(false)
  }, [deferred])

  if (standalone || dismissed) return null

  if (isIOS()) {
    return (
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-20 border-t border-brand-200 bg-white p-4 shadow-lg',
          'safe-area-pb',
        )}
        role="status"
      >
        <div className="mx-auto flex max-w-lg flex-col gap-2">
          <p className="text-sm font-semibold text-slate-800">{t('pwa.iosTitle')}</p>
          <p className="text-sm text-slate-600">{t('pwa.iosBody')}</p>
          <button
            type="button"
            className="self-end text-sm font-medium text-brand-700"
            onClick={dismiss}
          >
            {t('pwa.dismiss')}
          </button>
        </div>
      </div>
    )
  }

  if (!deferred) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-20 border-t border-brand-200 bg-white p-4 shadow-lg"
      role="status"
    >
      <div className="mx-auto flex max-w-lg flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-700">{t('app.tagline')}</p>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700"
            onClick={dismiss}
          >
            {t('pwa.dismiss')}
          </button>
          <button
            type="button"
            className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-60"
            disabled={busy}
            onClick={() => void install()}
          >
            {busy ? t('pwa.installing') : t('pwa.install')}
          </button>
        </div>
      </div>
    </div>
  )
}
