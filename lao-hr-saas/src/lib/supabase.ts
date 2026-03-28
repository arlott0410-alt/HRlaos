import { createClient } from '@supabase/supabase-js'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          subdomain: string
          plan: string
          status: string
          features: Json
          max_employees: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          subdomain: string
          plan?: string
          status?: string
          features?: Json
          max_employees?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          subdomain?: string
          plan?: string
          status?: string
          features?: Json
          max_employees?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          org_id: string
          role: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          org_id: string
          role?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          role?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_profiles_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      departments: {
        Row: {
          id: string
          org_id: string
          name: string
          code: string | null
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          code?: string | null
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          code?: string | null
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      positions: {
        Row: {
          id: string
          org_id: string
          department_id: string | null
          title: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          department_id?: string | null
          title: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          department_id?: string | null
          title?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          id: string
          org_id: string
          user_profile_id: string | null
          department_id: string | null
          position_id: string | null
          employee_code: string | null
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          date_of_birth: string | null
          gender: string | null
          province: string | null
          district: string | null
          village: string | null
          address_line: string | null
          hired_on: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_profile_id?: string | null
          department_id?: string | null
          position_id?: string | null
          employee_code?: string | null
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          province?: string | null
          district?: string | null
          village?: string | null
          address_line?: string | null
          hired_on?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          user_profile_id?: string | null
          department_id?: string | null
          position_id?: string | null
          employee_code?: string | null
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          province?: string | null
          district?: string | null
          village?: string | null
          address_line?: string | null
          hired_on?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      attendance_records: {
        Row: {
          id: string
          org_id: string
          employee_id: string
          work_date: string
          clock_in_at: string | null
          clock_out_at: string | null
          status: string
          late_minutes: number | null
          overtime_minutes: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          employee_id: string
          work_date: string
          clock_in_at?: string | null
          clock_out_at?: string | null
          status?: string
          late_minutes?: number | null
          overtime_minutes?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          employee_id?: string
          work_date?: string
          clock_in_at?: string | null
          clock_out_at?: string | null
          status?: string
          late_minutes?: number | null
          overtime_minutes?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      leave_types: {
        Row: {
          id: string
          org_id: string | null
          code: string
          name_lo: string
          name_en: string | null
          max_days_per_year: number | null
          is_paid: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          code: string
          name_lo: string
          name_en?: string | null
          max_days_per_year?: number | null
          is_paid?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          code?: string
          name_lo?: string
          name_en?: string | null
          max_days_per_year?: number | null
          is_paid?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      leave_requests: {
        Row: {
          id: string
          org_id: string
          employee_id: string
          leave_type_id: string
          start_date: string
          end_date: string
          days_requested: number
          status: string
          reason: string | null
          decided_by: string | null
          decided_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          employee_id: string
          leave_type_id: string
          start_date: string
          end_date: string
          days_requested: number
          status?: string
          reason?: string | null
          decided_by?: string | null
          decided_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          employee_id?: string
          leave_type_id?: string
          start_date?: string
          end_date?: string
          days_requested?: number
          status?: string
          reason?: string | null
          decided_by?: string | null
          decided_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      leave_balances: {
        Row: {
          id: string
          org_id: string
          employee_id: string
          leave_type_id: string
          year: number
          entitled_days: number
          used_days: number
          carried_over: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          employee_id: string
          leave_type_id: string
          year: number
          entitled_days?: number
          used_days?: number
          carried_over?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          employee_id?: string
          leave_type_id?: string
          year?: number
          entitled_days?: number
          used_days?: number
          carried_over?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      lao_public_holidays: {
        Row: {
          id: string
          holiday_date: string
          name_lo: string
          name_en: string | null
          is_national: boolean
          created_at: string
        }
        Insert: {
          id?: string
          holiday_date: string
          name_lo: string
          name_en?: string | null
          is_national?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          holiday_date?: string
          name_lo?: string
          name_en?: string | null
          is_national?: boolean
          created_at?: string
        }
        Relationships: []
      }
      payroll_runs: {
        Row: {
          id: string
          org_id: string
          period_start: string
          period_end: string
          status: string
          processed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          period_start: string
          period_end: string
          status?: string
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          period_start?: string
          period_end?: string
          status?: string
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      payroll_items: {
        Row: {
          id: string
          org_id: string
          payroll_run_id: string
          employee_id: string
          gross_pay: number
          tax_amount: number
          nssf_amount: number
          other_deductions: number
          net_pay: number
          currency: string
          payslip_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          payroll_run_id: string
          employee_id: string
          gross_pay: number
          tax_amount?: number
          nssf_amount?: number
          other_deductions?: number
          net_pay: number
          currency?: string
          payslip_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          payroll_run_id?: string
          employee_id?: string
          gross_pay?: number
          tax_amount?: number
          nssf_amount?: number
          other_deductions?: number
          net_pay?: number
          currency?: string
          payslip_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          org_id: string
          user_id: string | null
          title: string
          body: string | null
          type: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id?: string | null
          title: string
          body?: string | null
          type?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string | null
          title?: string
          body?: string | null
          type?: string | null
          read_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          org_id: string
          actor_id: string | null
          action: string
          table_name: string
          record_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          actor_id?: string | null
          action: string
          table_name: string
          record_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          actor_id?: string | null
          action?: string
          table_name?: string
          record_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      get_org_id_by_subdomain: {
        Args: { p_subdomain: string }
        Returns: string | null
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T] extends { Row: infer R } ? R : never

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.warn('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set.')
}

export const supabase = createClient<Database>(url ?? '', anonKey ?? '')
