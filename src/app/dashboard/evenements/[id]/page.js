// ============================================================================
// src/app/dashboard/evenements/[id]/page.js - Page de consultation avec cookies
// ============================================================================
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit3,
  Share2,
  Copy,
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  FileText,
  Eye,
  ExternalLink,
  Trash2,
  AlertTriangle,
  CheckCircle,
  CalendarDays,
  Timer,
  Star,
  Info,
  Lightbulb
} from 'lucide-react'

export default function EvenementDetailPage({ params }) {
  const router = useRouter()
  const [evenementId, setEvenementId] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [evenement, setEvenement] = useState(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setEvenementId(resolvedParams.id)
    }
    getParams()
  }, [params])

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

  // Charger l'événement
  const fetchEvenement = async () => {
    try {
      const res = await fetch(`/api/evenements/${evenementId}`, {
        credentials: 'include'
      })
      
      if (res.ok) {
        const data = await res.json()
        setEvenement(data.evenement)
      } else {
        setMessage('Événement non trouvé')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      setMessage('Erreur lors du chargement de l\'événement')
      setMessageType('error')
    }
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
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (user && evenementId) {
      fetchEvenement()
    }
  }, [user, evenementId])

  // Supprimer l'événement
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/evenements/${evenementId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (res.ok) {
        setMessage('Événement supprimé avec succès')
        setMessageType('success')
        setTimeout(() => {
          router.push('/dashboard/evenements')
        }, 1000)
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
  }

  // Copier le lien
  const copyLink = async () => {
    try {
      const url = `${window.location.origin}/site/${user?.paroisse?.subdomain}/agenda`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erreur lors de la copie:', error)
    }
  }

  // Partager
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: evenement?.titre,
          text: evenement?.description?.substring(0, 100) + '...',
          url: `${window.location.origin}/site/${user?.paroisse?.subdomain}/agenda`
        })
      } catch (error) {
        console.error('Erreur lors du partage:', error)
        copyLink()
      }
    } else {
      copyLink()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">Chargement de l'événement...</p>
        </div>
      </div>
    )
  }

  if (!user || !evenement) return null

  const canEdit = ['CURE', 'PAROISSE_ADMIN', 'PRETRE'].includes(user.role)
  const eventDate = new Date(evenement.dateDebut)
  const eventEndDate = evenement.dateFin ? new Date(evenement.dateFin) : null
  const isPast = eventDate < new Date()
  const isThisWeek = () => {
    const now = new Date()
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return eventDate >= now && eventDate <= oneWeekFromNow
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link
                href="/dashboard/evenements"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Événement
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleShare}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-purple-600 transition-colors rounded-xl hover:bg-purple-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </button>
              
              <Link
                href={`/site/${user?.paroisse?.subdomain}/agenda`}
                target="_blank"
                className="flex items-center text-gray-600 hover:text-purple-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Voir l'agenda
              </Link>
              
              {canEdit && (
                <>
                  <Link
                    href={`/dashboard/evenements/${evenementId}/edit`}
                    className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors font-medium"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Modifier
                  </Link>
                  
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </button>
                </>
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

      {/* Message de succès/erreur */}
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
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
            isPast 
              ? 'bg-gradient-to-r from-gray-500 to-slate-500' 
              : isThisWeek()
              ? 'bg-gradient-to-r from-orange-500 to-red-500'
              : 'bg-gradient-to-r from-purple-500 to-indigo-500'
          }`}>
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {evenement.titre}
            </span>
          </h1>
          <div className="flex items-center justify-center space-x-6 text-gray-600 mb-4">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              <span>{formatDate(eventDate)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              <span>
                {formatTime(eventDate)}
                {eventEndDate && ` - ${formatTime(eventEndDate)}`}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <span className={`px-4 py-2 rounded-full font-medium ${
              isPast 
                ? 'bg-gray-100 text-gray-700' 
                : isThisWeek()
                ? 'bg-orange-100 text-orange-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {isPast ? 'Événement terminé' : isThisWeek() ? 'Cette semaine' : 'À venir'}
            </span>
            {isThisWeek() && !isPast && (
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium text-sm">
                Bientôt !
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Informations principales */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Info className="w-6 h-6 mr-3 text-purple-600" />
                Détails de l'événement
              </h2>
              
              <div className="space-y-6">
                {/* Description */}
                {evenement.description && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                    <div className="prose prose-lg max-w-none">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {evenement.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Informations pratiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {evenement.lieu && (
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Lieu</h4>
                        <p className="text-gray-600">{evenement.lieu}</p>
                      </div>
                    </div>
                  )}

                  {evenement.maxParticipants && (
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Participants</h4>
                        <p className="text-gray-600">Maximum {evenement.maxParticipants} personnes</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Horaires</h4>
                      <p className="text-gray-600">
                        Début : {formatTime(eventDate)}
                        {eventEndDate && (
                          <>
                            <br />
                            Fin : {formatTime(eventEndDate)}
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CalendarDays className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Date complète</h4>
                      <p className="text-gray-600">{formatDate(eventDate)}</p>
                      {eventEndDate && eventEndDate.toDateString() !== eventDate.toDateString() && (
                        <p className="text-gray-600">au {formatDate(eventEndDate)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions d'engagement */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Actions
              </h3>
              
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleShare}
                  className="flex items-center px-6 py-3 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-all transform hover:scale-105 font-medium"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Partager
                </button>
                
                <button
                  onClick={copyLink}
                  className={`flex items-center px-6 py-3 rounded-xl transition-all transform hover:scale-105 font-medium ${
                    copied 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Copy className="w-5 h-5 mr-2" />
                  {copied ? 'Copié !' : 'Copier le lien'}
                </button>
                
                <Link
                  href={`/site/${user?.paroisse?.subdomain}/agenda`}
                  target="_blank"
                  className="flex items-center px-6 py-3 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition-all transform hover:scale-105 font-medium"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Voir l'agenda
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-lg p-8 sticky top-8">
              
              {/* Informations rapides */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Informations
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Statut</h4>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        isPast ? 'bg-gray-500' : isThisWeek() ? 'bg-orange-500' : 'bg-green-500'
                      }`}></div>
                      <span className={`font-medium ${
                        isPast ? 'text-gray-700' : isThisWeek() ? 'text-orange-700' : 'text-green-700'
                      }`}>
                        {isPast ? 'Terminé' : isThisWeek() ? 'Cette semaine' : 'À venir'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Dates</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          Créé le {new Date(evenement.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>
                          Modifié le {new Date(evenement.updatedAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {(evenement.lieu || evenement.maxParticipants) && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Détails</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        {evenement.lieu && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{evenement.lieu}</span>
                          </div>
                        )}
                        {evenement.maxParticipants && (
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            <span>Max {evenement.maxParticipants} participants</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions de gestion */}
              {canEdit && (
                <div className="border-t border-gray-200 pt-6 mb-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Gestion</h4>
                  <div className="space-y-3">
                    <Link
                      href={`/dashboard/evenements/${evenementId}/edit`}
                      className="flex items-center w-full px-4 py-3 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors font-medium"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Modifier l'événement
                    </Link>
                    
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center w-full px-4 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer l'événement
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation rapide */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Navigation</h4>
                <div className="space-y-3">
                  <Link
                    href="/dashboard/evenements"
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors font-medium"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à la liste
                  </Link>
                  
                  <Link
                    href="/dashboard/evenements/new"
                    className="flex items-center text-purple-600 hover:text-purple-700 transition-colors font-medium"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Nouvel événement
                  </Link>
                </div>
              </div>

              {/* Conseils */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Conseils
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      <span className="text-purple-600 font-bold text-sm">💡</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Partagez l'événement pour augmenter la participation
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-bold text-sm">📅</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Vérifiez les détails avant la publication
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                  Êtes-vous sûr de vouloir supprimer l'événement <strong>"{evenement.titre}"</strong> ?
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
                    onClick={handleDelete}
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