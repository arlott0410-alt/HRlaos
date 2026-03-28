import type { User } from '@supabase/supabase-js'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  getCurrentUser,
  getUserProfile,
  onAuthStateChange,
  signOut as authSignOut,
} from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/lib/supabase'

type UserProfile = Tables<'user_profiles'>
type Organization = Tables<'organizations'>

type AuthState = {
  user: User | null
  profile: UserProfile | null
  organization: Organization | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setOrganization: (organization: Organization | null) => void
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  initialize: () => Promise<void>
}

async function fetchOrganization(orgId: string): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .maybeSingle()
  if (error) {
    console.error('fetchOrganization', error.message)
    return null
  }
  return data
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      organization: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setProfile: (profile) => set({ profile }),

      setOrganization: (organization) => set({ organization }),

      signOut: async () => {
        await authSignOut()
        set({
          user: null,
          profile: null,
          organization: null,
          isAuthenticated: false,
        })
      },

      refreshProfile: async () => {
        const profile = await getUserProfile()
        set({ profile })
        if (profile?.org_id) {
          const org = await fetchOrganization(profile.org_id)
          set({ organization: org })
        } else {
          set({ organization: null })
        }
      },

      initialize: async () => {
        set({ isLoading: true })
        const user = await getCurrentUser()
        set({
          user,
          isAuthenticated: !!user,
        })
        if (user) {
          await get().refreshProfile()
        } else {
          set({ profile: null, organization: null })
        }
        set({ isLoading: false })
      },
    }),
    {
      name: 'hrlaos-auth-cache',
      partialize: (s) => ({
        profile: s.profile,
        organization: s.organization,
      }),
    },
  ),
)

let subscribed = false
export function subscribeAuthStore() {
  if (subscribed) return
  subscribed = true
  onAuthStateChange((_event, session) => {
    const user = session?.user ?? null
    useAuthStore.setState({
      user,
      isAuthenticated: !!user,
    })
    if (user) {
      void useAuthStore.getState().refreshProfile()
    } else {
      useAuthStore.setState({ profile: null, organization: null })
    }
  })
}
