// ============================================================================
// src/app/dashboard/evenements/page.js - Navigation corrigée vers page consultation
// ============================================================================
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Plus, 
  Calendar,
  MapPin,
  Clock,
  Users,
  Edit3,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  Eye,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  TrendingUp,
  Activity,
  CalendarDays,
  Star,
  ChevronDown
} from 'lucide-react'

export default function EvenementsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [evenements, setEvenements] = useState([])
  const [loadingEvenements, setLoadingEvenements] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, upcoming, past
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [evenementToDelete, setEvenementToDelete] = useState(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  // Vérifier l'authentification
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        router.push('/login')
        return false
      }
      return true
    } catch (error) {
      console.error('Erreur auth:', error)
      router.push('/login')
      return false
    }
  }

  // Charger les événements
  const fetchEvenements = async () => {
    try {
      const res = await fetch('/api/evenements', {
        credentials: 'include'
      })
      
      if (res.ok) {
        const data = await res.json()
        setEvenements(data.evenements || [])
      } else if (res.status === 401) {
        router.push('/login')
      } else {
        console.error('Erreur lors du chargement des événements')
      }
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error)
    } finally {
      setLoadingEvenements(false)
    }
  }

  // Supprimer un événement
  const handleDeleteEvenement = async () => {
    if (!evenementToDelete) return

    try {
      const res = await fetch(`/api/evenements/${evenementToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (res.ok) {
        setEvenements(prev => prev.filter(e => e.id !== evenementToDelete.id))
        setMessage('Événement supprimé avec succès')
        setMessageType('success')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('Erreur lors de la suppression')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setMessage('Erreur lors de la suppression')
      setMessageType('error')
    }
    
    setShowDeleteModal(false)
    setEvenementToDelete(null)
  }

  // Déconnexion
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      router.push('/login')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      router.push('/login')
    }
  }

  useEffect(() => {
    const init = async () => {
      const isAuth = await checkAuth()
      if (isAuth) {
        await fetchEvenements()
        setLoading(false)
      }
    }
    init()
  }, [])

  // Filtrer les événements
  const filteredEvenements = evenements.filter(evenement => {
    const matchesSearch = evenement.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (evenement.description && evenement.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const now = new Date()
    const eventDate = new Date(evenement.dateDebut)
    
    let matchesFilter = true
    if (filterStatus === 'upcoming') {
      matchesFilter = eventDate >= now
    } else if (filterStatus === 'past') {
      matchesFilter = eventDate < now
    }
    
    return matchesSearch && matchesFilter
  })

  // Statistiques
  const now = new Date()
  const upcomingEvents = evenements.filter(e => new Date(e.dateDebut) >= now)
  const pastEvents = evenements.filter(e => new Date(e.dateDebut) < now)
  const thisWeekEvents = evenements.filter(e => {
    const eventDate = new Date(e.dateDebut)
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return eventDate >= now && eventDate <= oneWeekFromNow
  })

  const canWrite = user && ['CURE', 'PAROISSE_ADMIN', 'PRETRE'].includes(user.role)

  if (loading || loadingEvenements) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">Chargement des événements...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const statsData = [
    {
      title: 'Total événements',
      value: evenements.length.toString(),
      icon: Calendar,
      change: 'Créés au total',
      gradient: 'from-blue-500 to-purple-500'
    },
    {
      title: 'À venir',
      value: upcomingEvents.length.toString(),
      icon: Clock,
      change: 'Événements programmés',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Cette semaine',
      value: thisWeekEvents.length.toString(),
      icon: CalendarDays,
      change: 'Prochains 7 jours',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      title: 'Terminés',
      value: pastEvents.length.toString(),
      icon: CheckCircle,
      change: 'Événements passés',
      gradient: 'from-gray-500 to-slate-500'
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
                Gestion des Événements
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
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
                  href="/dashboard/evenements/new"
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nouvel événement
                </Link>
              )}

              {user && (
                <span className="text-sm text-gray-600">
                  {user.email}
                </span>
              )}

              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800 transition-colors"
              >
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
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Gestion des <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Événements</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Organisez et gérez tous les événements de votre paroisse en un seul endroit
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

        {/* Filtres et Actions */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Mes événements</h2>
              <p className="text-gray-600">Gérez votre calendrier paroissial</p>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              {canWrite && (
                <Link
                  href="/dashboard/evenements/new"
                  className="inline-flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nouvel événement
                </Link>
              )}
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un événement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
              >
                <option value="all">Tous les événements</option>
                <option value="upcoming">À venir</option>
                <option value="past">Passés</option>
              </select>
            </div>
          </div>

          {/* Liste des événements */}
          {filteredEvenements.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {evenements.length === 0 ? 'Aucun événement' : 'Aucun événement trouvé'}
              </h3>
              <p className="text-gray-600 mb-6">
                {evenements.length === 0 
                  ? 'Créez votre premier événement pour animer votre paroisse'
                  : 'Essayez de modifier vos critères de recherche'
                }
              </p>
              {evenements.length === 0 && canWrite && (
                <Link
                  href="/dashboard/evenements/new"
                  className="inline-flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Créer mon premier événement
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredEvenements.map((evenement) => {
                const eventDate = new Date(evenement.dateDebut)
                const isPast = eventDate < new Date()
                const isThisWeek = thisWeekEvents.some(e => e.id === evenement.id)
                
                return (
                  <div key={evenement.id} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start space-x-6">
                      {/* Date badge */}
                      <div className={`flex-shrink-0 w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-white font-bold ${
                        isPast 
                          ? 'bg-gradient-to-br from-gray-500 to-slate-500' 
                          : isThisWeek
                          ? 'bg-gradient-to-br from-orange-500 to-red-500'
                          : 'bg-gradient-to-br from-purple-500 to-indigo-500'
                      }`}>
                        <span className="text-sm opacity-90">
                          {eventDate.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()}
                        </span>
                        <span className="text-xl">
                          {eventDate.getDate()}
                        </span>
                      </div>

                      {/* Contenu */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <Link 
                                href={`/dashboard/evenements/${evenement.id}`}
                                className="group"
                              >
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors cursor-pointer">
                                  {evenement.titre}
                                </h3>
                              </Link>
                              {isThisWeek && !isPast && (
                                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold">
                                  Cette semaine
                                </span>
                              )}
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                isPast 
                                  ? 'bg-gray-100 text-gray-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {isPast ? 'Terminé' : 'À venir'}
                              </span>
                            </div>
                            
                            {evenement.description && (
                              <p className="text-gray-600 mb-3 line-clamp-2">
                                {evenement.description}
                              </p>
                            )}
                          </div>
                          
                          {canWrite && (
                            <div className="flex items-center space-x-2 ml-4">
                              <Link
                                href={`/dashboard/evenements/${evenement.id}/edit`}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Modifier"
                              >
                                <Edit3 className="w-5 h-5" />
                              </Link>
                              
                              <button
                                onClick={() => {
                                  setEvenementToDelete(evenement)
                                  setShowDeleteModal(true)
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Meta informations */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex flex-wrap gap-4 text-gray-600">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>
                                {eventDate.toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            
                            {evenement.lieu && (
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span>{evenement.lieu}</span>
                              </div>
                            )}
                            
                            {evenement.maxParticipants && (
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                <span>Max {evenement.maxParticipants}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/dashboard/evenements/${evenement.id}`}
                              className="flex items-center text-purple-600 hover:text-purple-700 font-medium"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Consulter
                            </Link>
                            <span className="text-gray-300">•</span>
                            <Link
                              href={`/site/${user.paroisse?.subdomain}/agenda`}
                              target="_blank"
                              className="flex items-center text-green-600 hover:text-green-700 font-medium"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Agenda public
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Modal de suppression */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Supprimer l'événement
                </h3>
                <p className="text-gray-600 mb-8">
                  Êtes-vous sûr de vouloir supprimer l'événement <strong>"{evenementToDelete?.titre}"</strong> ?
                  Cette action est irréversible.
                </p>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteEvenement}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold"
                  >
                    Supprimer définitivement
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}