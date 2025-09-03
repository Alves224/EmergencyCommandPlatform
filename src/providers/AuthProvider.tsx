// YSOD Emergency Command Platform - Authentication Provider
// Mock implementation - replace with real SSO/OIDC
// Saudi Aramco: Company General Use

import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'
import type { User } from '@/types'

interface AuthContextType {
  user?: User
  login: (credentials: { email: string; password: string }) => Promise<void>
  logout: () => void
  isLoading: boolean
}

// Mock user for demo - replace with real authentication
const mockUsers: User[] = [
  {
    id: '875e23ef-7cc3-4fe4-8ba9-bef13d456db0',
    name: 'Incident Commander',
    email: 'ic@aramco.sa',
    role: 'IncidentCommander',
    sites: ['NGL', 'COT', 'YRD', 'BP', 'HUB', 'YST']
  },
  {
    id: 'e9b8604e-5314-4772-ae55-d90ea6f43b17',
    name: 'Dispatcher 1',
    email: 'dispatcher1@aramco.sa',
    role: 'Dispatcher',
    sites: ['YST', 'NGL', 'COT']
  },
  {
    id: '7ba8f419-674e-4f61-8512-a5c7eb25c880',
    name: 'Field Responder 1',
    email: 'responder1@aramco.sa',
    role: 'FieldResponder',
    sites: ['YST']
  },
  {
    id: 'a1e6b90b-be52-4152-aa62-4a0fd0798a24',
    name: 'Security Supervisor',
    email: 'supervisor@aramco.sa',
    role: 'SecuritySupervisor',
    sites: ['YST', 'YRD']
  }
]

const AuthContext = createContext<AuthContextType>({
  login: async () => {},
  logout: () => {},
  isLoading: false
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | undefined>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock auto-login for demo
    setTimeout(() => {
      setUser(mockUsers[0]) // Default to Incident Commander
      setIsLoading(false)
    }, 1000)
  }, [])

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true)
    
    // Mock authentication - replace with real OIDC/SAML
    const foundUser = mockUsers.find(u => u.email === credentials.email)
    
    if (foundUser) {
      setUser(foundUser)
    } else {
      throw new Error('Invalid credentials')
    }
    
    setIsLoading(false)
  }

  const logout = () => {
    setUser(undefined)
    // In real implementation, clear tokens and redirect to SSO logout
  }

  const value = useMemo(() => ({
    user,
    login,
    logout,
    isLoading
  }), [user, isLoading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

// Hook to get current user or throw
export function useCurrentUser(): User {
  const { user } = useAuth()
  if (!user) throw new Error('User not authenticated')
  return user
}