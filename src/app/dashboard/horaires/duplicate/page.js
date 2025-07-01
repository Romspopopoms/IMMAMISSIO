// ============================================================================
// src/app/dashboard/horaires/duplicate/page.js - Page duplication mise à jour
// ============================================================================
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Copy,
  Clock,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Church,
  ArrowRight,
  Users,
  Heart,
  Book,
  Bell,
  Sparkles,
  Check,
  X,
  Settings
} from 'lucide-react'

const joursSemaine = [
  { value: 0, label: 'Dimanche', short: 'DIM' },
  { value: 1, label: 'Lundi', short: 'LUN' },
  { value: 2, label: 'Mardi', short: 'MAR' },
  { value: 3, label: 'Mercredi', short: 'MER' },
  { value: 4, label: 'Jeudi', short: 'JEU' },
  { value: 5, label: 'Vendredi', short: 'VEN' },
  { value: 6, label: 'Samedi', short: 'SAM' }
]

const typesOffice = [
  { value: 'messe', label: 'Messe', emoji: '🍞', color: 'from-blue-500 to-cyan-500' },
  { value: 'confession', label: 'Confession', emoji: '🙏', color: 'from-green-500 to-emerald-500' },
  { value: 'adoration', label: 'Adoration', emoji: '✨', color: 'from-yellow-500 to-orange-500' },
  { value: 'vepres', label: 'Vêpres', emoji: '🎵', color: 'from-purple-500 to-indigo-500' },
  { value: 'chapelet', label: 'Chapelet', emoji: '📿', color: 'from-pink-500 to-rose-500' },
  { value: 'permanence', label: 'Permanence', emoji: '👥', color: 'from-gray-500 to-slate-500' },
  { value: 'autre', label: 'Autre', emoji: '⛪', color: 'from-indigo-500 to-purple-500' }
]

export default function DuplicateHorairesPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [horaires, setHoraires] = useState([])
  const [loadingHoraires, setLoadingHoraires] = useState(true)
  const [selectedSourceDay, setSelectedSourceDay] = useState(null)
  const [selectedTargetDays, setSelectedTargetDays] = useState([])
  const [selectedHoraires, setSelectedHoraires] = useState([])
  const [duplicating, setDuplicating] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  // ✅ Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth()
  }, [])

  // ✅ Charger les horaires après authentification
  useEffect(() => {
    if (user && user.paroisseId) {
      fetchHoraires()
    }
  }, [user])

  // ✅ Nouvelle fonction d'authentification
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Erreur auth:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Fonction de déconnexion mise à jour
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      if (res.ok) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Erreur logout:', error)
    }
  }

  // ✅ Fonction de chargement des horaires mise à jour
  const fetchHoraires = async () => {
    try {
      const res = await fetch('/api/horaires', {
        credentials: 'include' // ✅ Utiliser les cookies au lieu du token
      })
      
      if (res.ok) {
        const data = await res.json()
        setHoraires(data.horaires)
      } else {
        console.error('Erreur lors du chargement des horaires')
        showMessage('Erreur lors du chargement des horaires', 'error')
      }
    } catch (error) {
      console.error('Erreur lors du chargement des horaires:', error)
      showMessage('Erreur lors du chargement des horaires', 'error')
    } finally {
      setLoadingHoraires(false)
    }
  }

  const showMessage = (text, type) => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => setMessage(''), 5000)
  }

  // ✅ Vérifier les permissions
  const canWrite = user && ['CURE', 'PAROISSE_ADMIN', 'PRETRE'].includes(user.role)

  // Regrouper les horaires par jour
  const horairesByDay = horaires.reduce((acc, horaire) => {
    const jour = horaire.jourSemaine
    if (!acc[jour]) {
      acc[jour] = []
    }
    acc[jour].push(horaire)
    return acc
  }, {})

  // Trier les horaires par heure
  Object.keys(horairesByDay).forEach(jour => {
    horairesByDay[jour].sort((a, b) => a.heure.localeCompare(b.heure))
  })

  const handleSourceDaySelect = (dayIndex) => {
    setSelectedSourceDay(dayIndex)
    setSelectedHoraires([])
    setSelectedTargetDays([])
  }

  const handleHoraireToggle = (horaire) => {
    setSelectedHoraires(prev => {
      const isSelected = prev.some(h => h.id === horaire.id)
      if (isSelected) {
        return prev.filter(h => h.id !== horaire.id)
      } else {
        return [...prev, horaire]
      }
    })
  }

  const handleTargetDayToggle = (dayIndex) => {
    if (dayIndex === selectedSourceDay) return // Ne pas permettre de dupliquer sur le même jour
    
    setSelectedTargetDays(prev => {
      const isSelected = prev.includes(dayIndex)
      if (isSelected) {
        return prev.filter(d => d !== dayIndex)
      } else {
        return [...prev, dayIndex]
      }
    })
  }

  // ✅ Fonction de duplication mise à jour
  const handleDuplicate = async () => {
    if (selectedHoraires.length === 0 || selectedTargetDays.length === 0) {
      showMessage('Sélectionnez des horaires et des jours de destination', 'error')
      return
    }

    if (!canWrite) {
      showMessage('Vous n\'avez pas les permissions pour dupliquer des horaires', 'error')
      return
    }

    setDuplicating(true)
    setMessage('')

    try {
      const duplications = []
      
      for (const targetDay of selectedTargetDays) {
        for (const horaire of selectedHoraires) {
          duplications.push({
            jourSemaine: targetDay,
            heure: horaire.heure,
            typeOffice: horaire.typeOffice,
            description: horaire.description
          })
        }
      }

      const res = await fetch('/api/horaires/duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // ✅ Utiliser les cookies au lieu du token
        body: JSON.stringify({ horaires: duplications })
      })

      if (res.ok) {
        const data = await res.json()
        showMessage(`${data.created} horaire(s) dupliqué(s) avec succès !`, 'success')
        
        // Recharger les horaires et réinitialiser
        await fetchHoraires()
        setSelectedSourceDay(null)
        setSelectedTargetDays([])
        setSelectedHoraires([])
        
        // Rediriger après 3 secondes
        setTimeout(() => {
          router.push('/dashboard/horaires')
        }, 3000)
      } else {
        const errorData = await res.json()
        showMessage(errorData.error || 'Erreur lors de la duplication', 'error')
      }
    } catch (error) {
      console.error('Erreur lors de la duplication:', error)
      showMessage('Erreur lors de la duplication des horaires', 'error')
    } finally {
      setDuplicating(false)
    }
  }

  if (loading || loadingHoraires) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">Chargement des horaires...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  if (!canWrite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Accès non autorisé</h2>
          <p className="text-gray-600 mb-6">Vous n'avez pas les permissions pour dupliquer des horaires.</p>
          <Link 
            href="/dashboard/horaires"
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux horaires
          </Link>
        </div>
      </div>
    )
  }

  const sourceDayHoraires = selectedSourceDay !== null ? (horairesByDay[selectedSourceDay] || []) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link
                href="/dashboard/horaires"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dupliquer des Horaires
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.paroisse?.nom || 'Paroisse'}
              </span>
              
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
              >
                <Settings className="w-4 h-4 mr-1" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Message de statut */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className={`p-6 rounded-2xl flex items-center shadow-lg ${
            messageType === 'success' 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
              : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200'
          }`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 ${
              messageType === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {messageType === 'success' ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div>
              <p className={`font-bold text-lg ${
                messageType === 'success' ? 'text-green-900' : 'text-red-900'
              }`}>
                {messageType === 'success' ? 'Succès !' : 'Erreur'}
              </p>
              <p className={`${
                messageType === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message}
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Copy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Dupliquer des <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">horaires</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Copiez facilement vos horaires existants vers d'autres jours de la semaine
          </p>
        </div>

        {/* Processus de duplication */}
        <div className="space-y-8">
          
          {/* Étape 1: Sélection du jour source */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">1</span>
              Choisissez le jour à copier
            </h2>
            
            <div className="grid grid-cols-7 gap-4">
              {joursSemaine.map((jour) => {
                const dayHoraires = horairesByDay[jour.value] || []
                const isSelected = selectedSourceDay === jour.value
                
                return (
                  <button
                    key={jour.value}
                    onClick={() => handleSourceDaySelect(jour.value)}
                    disabled={dayHoraires.length === 0}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 shadow-lg' 
                        : dayHoraires.length > 0 
                        ? 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white' 
                        : 'border-gray-200 bg-gray-100'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 font-bold text-white ${
                        isSelected 
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                          : dayHoraires.length > 0 
                          ? 'bg-gradient-to-br from-gray-500 to-slate-500' 
                          : 'bg-gray-300'
                      }`}>
                        {jour.short}
                      </div>
                      <h3 className={`font-bold mb-2 ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                        {jour.label}
                      </h3>
                      <p className={`text-sm ${
                        isSelected ? 'text-blue-700' : dayHoraires.length > 0 ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {dayHoraires.length} horaire{dayHoraires.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Étape 2: Sélection des horaires */}
          {selectedSourceDay !== null && (
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">2</span>
                Sélectionnez les horaires à dupliquer
              </h2>
              
              {sourceDayHoraires.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun horaire pour ce jour</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sourceDayHoraires.map((horaire) => {
                    const typeInfo = typesOffice.find(t => t.value === horaire.typeOffice) || typesOffice[6]
                    const isSelected = selectedHoraires.some(h => h.id === horaire.id)
                    
                    return (
                      <button
                        key={horaire.id}
                        onClick={() => handleHoraireToggle(horaire)}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 text-left ${
                          isSelected 
                            ? 'border-purple-500 bg-purple-50 shadow-lg' 
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${typeInfo.color} rounded-xl flex items-center justify-center text-white font-bold`}>
                            <span className="text-lg">{typeInfo.emoji}</span>
                          </div>
                          
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'border-purple-500 bg-purple-500' 
                              : 'border-gray-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className={`font-bold text-lg mb-2 ${isSelected ? 'text-purple-900' : 'text-gray-900'}`}>
                            {horaire.heure}
                          </h3>
                          <p className={`text-sm font-medium mb-1 ${isSelected ? 'text-purple-700' : 'text-gray-600'}`}>
                            {typeInfo.label}
                          </p>
                          {horaire.description && (
                            <p className={`text-sm ${isSelected ? 'text-purple-600' : 'text-gray-500'}`}>
                              {horaire.description}
                            </p>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Étape 3: Sélection des jours de destination */}
          {selectedHoraires.length > 0 && (
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">3</span>
                Choisissez les jours de destination
              </h2>
              
              <div className="grid grid-cols-7 gap-4 mb-8">
                {joursSemaine.map((jour) => {
                  const isSourceDay = selectedSourceDay === jour.value
                  const isSelected = selectedTargetDays.includes(jour.value)
                  
                  return (
                    <button
                      key={jour.value}
                      onClick={() => handleTargetDayToggle(jour.value)}
                      disabled={isSourceDay}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                        isSelected 
                          ? 'border-green-500 bg-green-50 shadow-lg' 
                          : isSourceDay 
                          ? 'border-gray-200 bg-gray-100' 
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-between mx-auto mb-3 font-bold text-white ${
                          isSelected 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                            : isSourceDay 
                            ? 'bg-gray-300' 
                            : 'bg-gradient-to-br from-gray-500 to-slate-500'
                        }`}>
                          <span className="flex-1 text-center">{jour.short}</span>
                          {isSelected && <Check className="w-4 h-4 mr-1" />}
                          {isSourceDay && <X className="w-4 h-4 mr-1 text-gray-500" />}
                        </div>
                        <h3 className={`font-bold mb-2 ${
                          isSelected ? 'text-green-900' : isSourceDay ? 'text-gray-500' : 'text-gray-900'
                        }`}>
                          {jour.label}
                        </h3>
                        <p className={`text-sm ${
                          isSelected ? 'text-green-700' : isSourceDay ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {isSourceDay ? 'Source' : isSelected ? 'Destination' : 'Disponible'}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Résumé et action */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                      <ArrowRight className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Résumé de la duplication</h3>
                      <p className="text-gray-700">
                        <strong>{selectedHoraires.length}</strong> horaire{selectedHoraires.length > 1 ? 's' : ''} 
                        → <strong>{selectedTargetDays.length}</strong> jour{selectedTargetDays.length > 1 ? 's' : ''} 
                        = <strong>{selectedHoraires.length * selectedTargetDays.length}</strong> nouveau{selectedHoraires.length * selectedTargetDays.length > 1 ? 'x' : ''} horaire{selectedHoraires.length * selectedTargetDays.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleDuplicate}
                    disabled={duplicating || selectedTargetDays.length === 0}
                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all transform hover:scale-105 shadow-lg disabled:transform-none flex items-center"
                  >
                    {duplicating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Duplication...
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 mr-2" />
                        Dupliquer maintenant
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}