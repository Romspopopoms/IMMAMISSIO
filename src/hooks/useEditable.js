// ============================================================================
// src/hooks/useEditable.js - Hook sécurisé SANS localStorage
// ============================================================================
'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'

export function useEditable(initialData = {}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, hasPermission } = useAuth()
  const [isEditMode, setIsEditMode] = useState(false)
  const [data, setData] = useState(initialData)
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)

  // ✅ Vérifier le mode édition dans l'URL + permissions
  useEffect(() => {
    const editParam = searchParams.get('edit') === 'true'
    const canEdit = user && (
      hasPermission('site', 'write') || 
      hasPermission('dons', 'write') ||
      user.role === 'PAROISSE_ADMIN' ||
      user.role === 'SUPER_ADMIN'
    )
    setIsEditMode(editParam && canEdit)
  }, [searchParams, user, hasPermission])

  // ✅ Mettre à jour les données quand initialData change
  useEffect(() => {
    setData(initialData)
  }, [initialData])

  // Mettre à jour une valeur
  const updateField = (field, value) => {
    setData(prev => ({
      ...prev,
      configSite: {
        ...prev.configSite,
        [field]: value
      }
    }))
    setHasChanges(true)
  }

  // ✅ Mettre à jour une valeur profonde (ex: configSite.donThemes[0].label)
  const updateNestedField = (path, value) => {
    setData(prev => {
      const newData = { ...prev }
      const keys = path.split('.')
      let current = newData
      
      // Naviguer jusqu'à l'avant-dernier niveau
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]
        if (!(key in current)) {
          current[key] = {}
        }
        current[key] = { ...current[key] }
        current = current[key]
      }
      
      // Définir la valeur finale
      current[keys[keys.length - 1]] = value
      return newData
    })
    setHasChanges(true)
  }

  // ✅ Sauvegarder les changements - Version sécurisée
  const saveChanges = async () => {
    if (!user) {
      showErrorMessage('Vous devez être connecté pour sauvegarder')
      return false
    }

    setSaving(true)
    try {
      // ✅ Appel API sécurisé avec cookies
      const response = await fetch('/api/paroisse/config', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // ✅ Inclure les cookies d'auth
        body: JSON.stringify({ 
          configSite: data.configSite 
        })
      })

      if (response.ok) {
        setHasChanges(false)
        showSuccessMessage('Modifications sauvegardées')
        return true
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      showErrorMessage(error.message || 'Erreur lors de la sauvegarde')
      return false
    } finally {
      setSaving(false)
    }
  }

  // ✅ Sauvegarder automatiquement (debounced)
  const saveChangesDebounced = useDebouncedCallback(saveChanges, 2000)

  // ✅ Auto-save quand il y a des changements
  const enableAutoSave = () => {
    if (hasChanges && !saving) {
      saveChangesDebounced()
    }
  }

  // Quitter le mode édition
  const exitEditMode = async () => {
    if (hasChanges) {
      const shouldSave = confirm('Voulez-vous sauvegarder vos modifications ?')
      if (shouldSave) {
        const saved = await saveChanges()
        if (!saved) {
          // Ne pas quitter le mode édition si la sauvegarde a échoué
          return
        }
      } else {
        // Reset les données si on ne sauvegarde pas
        setData(initialData)
        setHasChanges(false)
      }
    }
    
    // Retirer ?edit=true de l'URL
    const params = new URLSearchParams(searchParams)
    params.delete('edit')
    const newUrl = params.toString() ? `?${params.toString()}` : ''
    router.push(`${window.location.pathname}${newUrl}`)
  }

  // ✅ Entrer en mode édition
  const enterEditMode = () => {
    if (!user) {
      showErrorMessage('Vous devez être connecté pour modifier le site')
      return
    }

    const params = new URLSearchParams(searchParams)
    params.set('edit', 'true')
    router.push(`${window.location.pathname}?${params.toString()}`)
  }

  // ✅ Fonction helper pour obtenir une valeur avec support des chemins profonds
  const getValue = (field, defaultValue = '') => {
    if (field.includes('.')) {
      // Support pour les chemins profonds comme "donThemes.0.label"
      const keys = field.split('.')
      let current = data
      for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
          current = current[key]
        } else {
          return defaultValue
        }
      }
      return current
    }
    
    // Chemin simple
    return data.configSite?.[field] || defaultValue
  }

  // ✅ Fonction pour reset les changements
  const resetChanges = () => {
    setData(initialData)
    setHasChanges(false)
  }

  // ✅ Fonction pour vérifier si l'utilisateur peut éditer
  const canEdit = user && (
    hasPermission('site', 'write') || 
    hasPermission('dons', 'write') ||
    user.role === 'PAROISSE_ADMIN' ||
    user.role === 'SUPER_ADMIN'
  )

  return {
    // États
    isEditMode,
    hasChanges,
    saving,
    canEdit,
    data,
    
    // Actions
    updateField,
    updateNestedField,
    saveChanges,
    enableAutoSave,
    exitEditMode,
    enterEditMode,
    resetChanges,
    
    // Helpers
    getValue
  }
}

// ============================================================================
// Fonctions utilitaires
// ============================================================================

// ✅ Hook pour débouncer les appels
function useDebouncedCallback(callback, delay) {
  const [timeoutId, setTimeoutId] = useState(null)

  const debouncedCallback = (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    const newTimeoutId = setTimeout(() => {
      callback(...args)
    }, delay)
    
    setTimeoutId(newTimeoutId)
  }

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [timeoutId])

  return debouncedCallback
}

// ✅ Messages de notification améliorés
function showSuccessMessage(message) {
  // Supprimer les anciens messages
  removeExistingMessages()
  
  const successDiv = document.createElement('div')
  successDiv.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg z-[9999] flex items-center animate-slide-in'
  successDiv.innerHTML = `
    <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>
    <span class="font-medium">${message}</span>
    <button class="ml-4 p-1 hover:bg-green-700 rounded transition-colors" onclick="this.parentElement.remove()">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  `
  successDiv.setAttribute('data-notification', 'true')
  document.body.appendChild(successDiv)
  
  // Auto-remove après 5 secondes
  setTimeout(() => {
    if (successDiv.parentElement) {
      successDiv.classList.add('animate-slide-out')
      setTimeout(() => successDiv.remove(), 300)
    }
  }, 5000)
}

function showErrorMessage(message) {
  // Supprimer les anciens messages
  removeExistingMessages()
  
  const errorDiv = document.createElement('div')
  errorDiv.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-4 rounded-xl shadow-lg z-[9999] flex items-center animate-slide-in'
  errorDiv.innerHTML = `
    <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    <span class="font-medium">${message}</span>
    <button class="ml-4 p-1 hover:bg-red-700 rounded transition-colors" onclick="this.parentElement.remove()">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  `
  errorDiv.setAttribute('data-notification', 'true')
  document.body.appendChild(errorDiv)
  
  // Auto-remove après 7 secondes (plus long pour les erreurs)
  setTimeout(() => {
    if (errorDiv.parentElement) {
      errorDiv.classList.add('animate-slide-out')
      setTimeout(() => errorDiv.remove(), 300)
    }
  }, 7000)
}

function removeExistingMessages() {
  const existingMessages = document.querySelectorAll('[data-notification="true"]')
  existingMessages.forEach(msg => msg.remove())
}
