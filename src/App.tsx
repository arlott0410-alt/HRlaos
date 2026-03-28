import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { RequireAuth } from '@/components/RequireAuth'
import { TenantGate } from '@/components/TenantGate'
import { TenantProvider } from '@/context/TenantContext'
import { AttendancePage } from '@/features/attendance/AttendancePage'
import { EmployeePage } from '@/features/employee/EmployeePage'
import { LeavePage } from '@/features/leave/LeavePage'
import { PayrollPage } from '@/features/payroll/PayrollPage'
import { ReportsPage } from '@/features/reports/ReportsPage'
import { Dashboard } from '@/pages/Dashboard'
import { Login } from '@/pages/Login'
import { Settings } from '@/pages/Settings'

export function App() {
  return (
    <TenantProvider>
      <TenantGate>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<RequireAuth />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/employee" element={<EmployeePage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/payroll" element={<PayrollPage />} />
                <Route path="/leave" element={<LeavePage />} />
                <Route path="/reports" element={<ReportsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TenantGate>
    </TenantProvider>
  )
}
