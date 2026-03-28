import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const langs = [
  { code: 'lo', label: 'ລາວ' },
  { code: 'en', label: 'EN' },
  { code: 'th', label: 'ไทย' },
] as const

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5">
      <span className="sr-only">{t('common.language')}</span>
      {langs.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          className={cn(
            'rounded-md px-2 py-1 text-xs font-medium',
            i18n.language === code ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50',
          )}
          onClick={() => void i18n.changeLanguage(code)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
