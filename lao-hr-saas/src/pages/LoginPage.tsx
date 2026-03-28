import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { signInWithEmail } from '@/lib/auth'
import { useAuthStore } from '@/stores/authStore'
import { useTenantStore } from '@/stores/tenantStore'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const authLoading = useAuthStore((s) => s.isLoading)
  const orgName = useTenantStore((s) => s.orgName)
  const tenantError = useTenantStore((s) => s.error)
  const orgId = useTenantStore((s) => s.orgId)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  if (authLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
            <Building2 className="h-8 w-8" aria-hidden />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">{t('login.title')}</h1>
          <p className="mt-1 text-sm text-slate-600">{t('login.subtitle')}</p>
          {orgId && orgName && (
            <p className="mt-2 text-xs font-medium text-primary-700">
              {t('login.company_for')}: {orgName}
            </p>
          )}
          {!orgId && tenantError && (
            <p className="mt-2 text-xs text-amber-800">
              {t('tenant.missing')} ({tenantError}). {t('login.dev_slug_hint')}
            </p>
          )}
          {!orgId && !tenantError && (
            <p className="mt-2 text-xs text-slate-500">{t('login.dev_slug_hint')}</p>
          )}
        </div>

        <form
          className="space-y-4"
          onSubmit={handleSubmit(async (values) => {
            const { error } = await signInWithEmail(values.email, values.password)
            if (error) {
              setFormError('root', { message: 'invalid' })
              return
            }
            await useAuthStore.getState().refreshProfile()
            navigate(from, { replace: true })
          })}
        >
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              {t('login.email')}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none ring-primary-500 focus:ring-2"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-danger-600">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              {t('login.password')}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none ring-primary-500 focus:ring-2"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-danger-600">{errors.password.message}</p>
            )}
          </div>
          {errors.root && (
            <p className="rounded-lg bg-danger-50 px-3 py-2 text-center text-sm text-danger-700">
              {t('login.error_invalid')}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : (
              t('login.submit')
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
