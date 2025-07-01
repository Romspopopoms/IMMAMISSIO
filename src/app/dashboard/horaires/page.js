// ============================================================================
// src/app/dashboard/horaires/page.js - Page mise à jour avec le nouveau système d'auth
// ============================================================================
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Plus, 
  Clock,
  Calendar,
  Edit3,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Church,
  ExternalLink,
  TrendingUp,
  Activity,
  Eye,
  Star,
  ArrowRight,
  Users,
  Bell,
  Heart,
  Book,
  Sparkles,
  Settings
} from 'lucide-react'

const joursSemaine = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const typesOffice = [
  { value: 'messe', label: 'Messe', emoji: '🍞', color: 'from-blue-500 to-cyan-500' },
  { value: 'confession', label: 'Confession', emoji: '🙏', color: 'from-green-500 to-emerald-500' },
  { value: 'adoration', label: 'Adoration', emoji: '✨', color: 'from-yellow-500 to-orange-500' },
  { value: 'vepres', label: 'Vêpres', emoji: '🎵', color: 'from-purple-500 to-indigo-500' },
  { value: 'chapelet', label: 'Chapelet', emoji: '📿', color: 'from-pink-500 to-rose-500' },
  { value: 'permanence', label: 'Permanence', emoji: '👥', color: 'from-gray-500 to-slate-500' },
  { value: 'autre', label: 'Autre', emoji: '⛪', color: 'from-indigo-500 to-purple-500' }
]

export default function HorairesPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [horaires, setHoraires] = useState([])
  const [loadingHoraires, setLoadingHoraires] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [horaireToDelete, setHoraireToDelete] = useState(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  // ✅ Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth()
  }, [])

  // ✅ Nouvelle fonction d'authentification
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        
        if (data.user?.paroisseId) {
          fetchHoraires()
        }
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

  // ✅ Fonction de suppression mise à jour
  const handleDeleteHoraire = async () => {
    if (!horaireToDelete) return

    try {
      const res = await fetch(`/api/horaires/${horaireToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include' // ✅ Utiliser les cookies au lieu du token
      })
      
      if (res.ok) {
        setHoraires(prev => prev.filter(h => h.id !== horaireToDelete.id))
        showMessage('Horaire supprimé avec succès', 'success')
      } else {
        const errorData = await res.json()
        showMessage(errorData.error || 'Erreur lors de la suppression', 'error')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      showMessage('Erreur lors de la suppression', 'error')
    }
    
    setShowDeleteModal(false)
    setHoraireToDelete(null)
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

  // Statistiques
  const statsByType = horaires.reduce((acc, horaire) => {
    acc[horaire.typeOffice] = (acc[horaire.typeOffice] || 0) + 1
    return acc
  }, {})

  const totalOffices = horaires.length
  const joursActifs = Object.keys(horairesByDay).length
  const officesPrincipaux = statsByType.messe || 0

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

  const quickActions = [
    {
      title: 'Nouvel horaire',
      description: 'Ajouter messe ou office',
      icon: Plus,
      href: '/dashboard/horaires/new',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Planifier la semaine',
      description: 'Vue d\'ensemble horaires',
      icon: Calendar,
      href: '#planning',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      title: 'Dupliquer horaires',
      description: 'Copier vers autre jour',
      icon: Clock,
      href: '/dashboard/horaires/duplicate',
      gradient: 'from-orange-500 to-red-500'
    }
  ]

  const statsData = [
    {
      title: 'Total des offices',
      value: totalOffices.toString(),
      icon: Church,
      change: 'Offices programmés',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Jours actifs',
      value: joursActifs.toString(),
      icon: Calendar,
      change: 'Jours de la semaine',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Messes',
      value: officesPrincipaux.toString(),
      icon: Heart,
      change: 'Célébrations principales',
      gradient: 'from-rose-500 to-pink-500'
    },
    {
      title: 'Types d\'offices',
      value: Object.keys(statsByType).length.toString(),
      icon: Star,
      change: 'Différents types',
      gradient: 'from-orange-500 to-red-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Gestion des Horaires
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.paroisse?.nom || 'Paroisse'}
              </span>
              
              <Link
                href={`/site/${user?.paroisse?.subdomain}/agenda`}
                target="_blank"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Voir l'agenda
              </Link>
              
              {canWrite && (
                <Link
                  href="/dashboard/horaires/new"
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nouvel horaire
                </Link>
              )}
              
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
            <Clock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Horaires & <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Célébrations</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Organisez et publiez les horaires de vos messes et offices pour votre communauté
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statsData.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div key={index} className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
                </div>
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                    {stat.value}
                  </p>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {stat.change}
                </p>
              </div>
            )
          })}
        </div>

        {/* Actions rapides */}
        {canWrite && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Actions rapides</h2>
                <p className="text-gray-600">Gérez vos horaires en quelques clics</p>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Activity className="w-4 h-4 mr-2" />
                Gestion des horaires
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon
                return (
                  <Link
                    key={index}
                    href={action.href}
                    target={action.external ? "_blank" : undefined}
                    onClick={action.href === '#planning' ? (e) => {
                      e.preventDefault()
                      document.querySelector('#planning-section')?.scrollIntoView({ behavior: 'smooth' })
                    } : undefined}
                    className="group relative"
                  >
                    <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden h-full">
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                      <div className="relative z-10">
                        <div className={`w-16 h-16 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {action.description}
                        </p>
                        <div className="flex items-center text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Accéder</span>
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Stats par type d'office */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Types d'offices</h2>
              <p className="text-gray-600">Répartition de vos célébrations</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {typesOffice.map((type) => {
              const count = statsByType[type.value] || 0
              return (
                <div key={type.value} className="group bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${type.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <span className="text-2xl">{type.emoji}</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{count}</p>
                    <p className="text-sm font-semibold text-gray-600">{type.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Planning hebdomadaire */}
        <div id="planning-section" className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Planning hebdomadaire</h2>
              <p className="text-gray-600">Vue d'ensemble de vos horaires</p>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-2" />
              {horaires.length} horaire{horaires.length > 1 ? 's' : ''} au total
            </div>
          </div>

          {horaires.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Aucun horaire défini</h3>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Commencez par ajouter les horaires de vos messes et célébrations pour informer votre communauté.
              </p>
              {canWrite && (
                <Link
                  href="/dashboard/horaires/new"
                  className="inline-flex items-center bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-2xl hover:from-orange-700 hover:to-red-700 transition-all font-bold transform hover:scale-105 shadow-lg"
                >
                  <Plus className="w-6 h-6 mr-3" />
                  Ajouter le premier horaire
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-7 gap-4 min-w-[1200px]">
                {[0, 1, 2, 3, 4, 5, 6].map((jourIndex) => {
                  const dayHoraires = horairesByDay[jourIndex] || []
                  const isToday = new Date().getDay() === jourIndex
                  
                  return (
                    <div key={jourIndex} className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all ${
                      isToday 
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      {/* Header du jour */}
                      <div className="text-center mb-4">
                        <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center font-bold text-white mb-2 ${
                          isToday 
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-500' 
                            : 'bg-gradient-to-br from-gray-500 to-slate-500'
                        }`}>
                          {joursSemaine[jourIndex].substring(0, 2)}
                        </div>
                        <h3 className={`font-bold text-lg ${isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                          {joursSemaine[jourIndex]}
                        </h3>
                        {isToday && (
                          <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded-full">
                            Aujourd'hui
                          </span>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {dayHoraires.length} office{dayHoraires.length > 1 ? 's' : ''}
                        </div>
                      </div>
                      
                      {/* Horaires du jour */}
                      <div className="space-y-3 min-h-[200px]">
                        {dayHoraires.length === 0 ? (
                          <div className="text-center py-8">
                            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                              <Clock className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500 mb-2">Aucun office</p>
                            {canWrite && (
                              <Link
                                href="/dashboard/horaires/new"
                                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 font-medium"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Ajouter
                              </Link>
                            )}
                          </div>
                        ) : (
                          dayHoraires.map((horaire) => {
                            const typeInfo = typesOffice.find(t => t.value === horaire.typeOffice) || typesOffice[6]
                            return (
                              <div
                                key={horaire.id}
                                className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-3 hover:shadow-md transition-all duration-300 group cursor-pointer"
                              >
                                {/* Heure et type */}
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <div className={`w-8 h-8 bg-gradient-to-br ${typeInfo.color} rounded-lg flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform`}>
                                      <span>{typeInfo.emoji}</span>
                                    </div>
                                    <div>
                                      <p className="font-bold text-gray-900 text-sm">
                                        {horaire.heure}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {/* Actions */}
                                  {canWrite && (
                                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Link
                                        href={`/dashboard/horaires/${horaire.id}/edit`}
                                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors bg-white rounded-md"
                                        title="Modifier"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                      </Link>
                                      
                                      <button
                                        onClick={() => {
                                          setHoraireToDelete(horaire)
                                          setShowDeleteModal(true)
                                        }}
                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-md"
                                        title="Supprimer"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Type et description */}
                                <div>
                                  <p className="text-xs font-medium text-gray-700 capitalize mb-1">
                                    {typeInfo.label}
                                  </p>
                                  
                                  {horaire.description && (
                                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                      {horaire.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Supprimer l'horaire
              </h3>
              <p className="text-gray-600 mb-8">
                Êtes-vous sûr de vouloir supprimer cet horaire ? Cette action est irréversible.
              </p>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteHoraire}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold"
                >
                  Supprimer définitivement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}