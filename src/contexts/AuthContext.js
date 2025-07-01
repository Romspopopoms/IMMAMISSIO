// ============================================================================
// FICHIER 3 : src/contexts/AuthContext.js - Context auth sécurisé COMPLET
// ============================================================================
'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ✅ Vérifier l'auth au démarrage via l'API /auth/me
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // ✅ Appel API pour vérifier l'auth (cookie sera envoyé automatiquement)
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include' // ✅ Inclure les cookies
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Erreur vérification auth:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ Inclure les cookies
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Erreur de connexion')
      }

      // ✅ Mettre à jour l'état local (les données viennent du serveur)
      setUser(data.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      // ✅ Appel API pour supprimer le cookie
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Erreur logout:', error)
    } finally {
      // ✅ Nettoyer l'état local
      setUser(null)
    }
  }

  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ Inclure les cookies
        body: JSON.stringify(userData)
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription')
      }

      // ✅ Mettre à jour l'état local
      setUser(data.user)
      return { success: true, message: data.message }
    } catch (error) {
      console.error('Erreur inscription:', error)
      return { success: false, error: error.message }
    }
  }

  const hasPermission = (section, action = 'read') => {
    if (!user) return false
    if (user.role === 'SUPER_ADMIN') return true
    if (user.role === 'PAROISSE_ADMIN') return true
    
    if (user.role === 'ADMIN_SPECIALISE') {
      const permissions = user.permissions || []
      return permissions.some(perm => {
        const sectionsAutorisees = perm.sectionsAutorisees.split(',')
        const permissionsAutorisees = perm.permissions.split(',')
        return sectionsAutorisees.includes(section) && permissionsAutorisees.includes(action)
      })
    }
    
    return action === 'read'
  }

  // ✅ Fonction pour rafraîchir les données utilisateur
  const refreshUser = async () => {
    await checkAuth()
  }

  const value = {
    user,
    login,
    logout,
    register,
    loading,
    isAuthenticated: !!user,
    hasPermission,
    checkAuth,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}