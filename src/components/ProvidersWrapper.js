'use client'
import { AuthProvider } from '../contexts/AuthContext'

export default function ProvidersWrapper({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}