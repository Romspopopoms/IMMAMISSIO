// ============================================================================
// src/app/dashboard/evenements/[id]/edit/page.js - Page COMPLÈTE avec design moderne
// ============================================================================
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  Calendar,
  MapPin,
  Clock,
  Users,
  AlignLeft,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Edit3,
  Eye,
  ExternalLink,
  Lightbulb,
  CalendarDays
} from 'lucide-react'

export default function EditEvenementPage({ params }) {
  const router = useRouter()
  const [evenementId, setEvenementId] = useState(null)
  const [user, setUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingEvenement, setLoadingEvenement] = useState(true)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [preview, setPreview] = useState(false)

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    lieu: '',
    maxParticipants: ''
  })

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
        
        // Vérifier les permissions
        if (!['CURE', 'PAROISSE_ADMIN', 'PRETRE'].includes(data.user.role)) {
          router.push('/dashboard/evenements')
          return false
        }
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
        const evenement = data.evenement
        
        setFormData({
          titre: evenement.titre,
          description: evenement.description || '',
          dateDebut: evenement.dateDebut ? 
            new Date(evenement.dateDebut).toISOString().slice(0, 16) : '',
          dateFin: evenement.dateFin ? 
            new Date(evenement.dateFin).toISOString().slice(0, 16) : '',
          lieu: evenement.lieu || '',
          maxParticipants: evenement.maxParticipants || ''
        })
      } else {
        setMessage('Événement non trouvé')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      setMessage('Erreur lors du chargement de l\'événement')
      setMessageType('error')
    } finally {
      setLoadingEvenement(false)
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

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseInt(value) : '') : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    // Validation
    if (!formData.titre || !formData.dateDebut) {
      setMessage('Le titre et la date de début sont obligatoires')
      setMessageType('error')
      setSaving(false)
      return
    }

    // Validation des dates
    const dateDebut = new Date(formData.dateDebut)
    const dateFin = formData.dateFin ? new Date(formData.dateFin) : null
    
    if (dateFin && dateFin < dateDebut) {
      setMessage('La date de fin ne peut pas être antérieure à la date de début')
      setMessageType('error')
      setSaving(false)
      return
    }

    try {
      const res = await fetch(`/api/evenements/${evenementId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          maxParticipants: formData.maxParticipants || null
        })
      })

      if (res.ok) {
        const data = await res.json()
        setMessage('Événement mis à jour avec succès !')
        setMessageType('success')
        
        // Rediriger vers la liste après 2 secondes
        setTimeout(() => {
          router.push('/dashboard/evenements')
        }, 2000)
      } else {
        const errorData = await res.json()
        setMessage(errorData.error || 'Erreur lors de la mise à jour')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      setMessage('Erreur lors de la mise à jour de l\'événement')
      setMessageType('error')
    } finally {
      setSaving(false)
    }
  }

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

  if (loading || loadingEvenement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">Chargement de l'événement...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Éditer l'événement
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setPreview(!preview)}
                className={`flex items-center px-4 py-2 rounded-xl transition-all font-medium ${
                  preview 
                    ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Eye className="w-4 h-4 mr-2" />
                {preview ? 'Édition' : 'Aperçu'}
              </button>
              
              <Link
                href={`/site/${user?.paroisse?.subdomain}/agenda`}
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Voir l'agenda
              </Link>
              
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </button>

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
            <Edit3 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Éditer <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">"{formData.titre}"</span>
          </h1>
          <div className="flex items-center justify-center space-x-4 text-gray-600">
            {formData.dateDebut && (
              <>
                <span>Programmé pour le :</span>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                  {new Date(formData.dateDebut).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulaire principal */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Informations générales */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-blue-600" />
                Informations de l'événement
              </h2>
              
              <form id="evenement-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Titre */}
                <div>
                  <label htmlFor="titre" className="block text-lg font-bold text-gray-900 mb-3">
                    Titre de l'événement *
                  </label>
                  <input
                    type="text"
                    id="titre"
                    name="titre"
                    value={formData.titre}
                    onChange={handleInputChange}
                    placeholder="Ex: Pèlerinage à Lourdes, Concert de Noël..."
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-lg font-bold text-gray-900 mb-3">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    placeholder="Décrivez votre événement, son programme, les informations pratiques..."
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none text-lg"
                  />
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-sm text-gray-500">
                      {formData.description.length} caractères
                    </p>
                    {formData.description.length > 100 && (
                      <span className="text-green-600 text-sm font-medium">Bonne description ✓</span>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Dates et lieu */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Clock className="w-6 h-6 mr-3 text-purple-600" />
                Planification
              </h2>
              
              <div className="space-y-6">
                {/* Dates et heures */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="dateDebut" className="block text-lg font-bold text-gray-900 mb-3">
                      Date et heure de début *
                    </label>
                    <input
                      type="datetime-local"
                      id="dateDebut"
                      name="dateDebut"
                      value={formData.dateDebut}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all text-lg"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="dateFin" className="block text-lg font-bold text-gray-900 mb-3">
                      Date et heure de fin (optionnel)
                    </label>
                    <input
                      type="datetime-local"
                      id="dateFin"
                      name="dateFin"
                      value={formData.dateFin}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all text-lg"
                    />
                  </div>
                </div>

                {/* Lieu */}
                <div>
                  <label htmlFor="lieu" className="block text-lg font-bold text-gray-900 mb-3">
                    Lieu
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                    <input
                      type="text"
                      id="lieu"
                      name="lieu"
                      value={formData.lieu}
                      onChange={handleInputChange}
                      placeholder="Ex: Église Saint-Pierre, Salle paroissiale..."
                      className="w-full pl-16 pr-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all text-lg"
                    />
                  </div>
                </div>

                {/* Nombre maximum de participants */}
                <div>
                  <label htmlFor="maxParticipants" className="block text-lg font-bold text-gray-900 mb-3">
                    Nombre maximum de participants
                  </label>
                  <div className="relative">
                    <Users className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                    <input
                      type="number"
                      id="maxParticipants"
                      name="maxParticipants"
                      value={formData.maxParticipants}
                      onChange={handleInputChange}
                      placeholder="Laissez vide si illimité"
                      min="1"
                      className="w-full pl-16 pr-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all text-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-8 py-4 border-2 border-red-300 text-red-700 rounded-2xl hover:bg-red-50 hover:border-red-400 transition-all font-medium flex items-center"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Supprimer l'événement
              </button>
              
              <div className="flex space-x-4">
                <Link
                  href="/dashboard/evenements"
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-100 hover:border-gray-400 transition-all font-medium"
                >
                  Annuler
                </Link>
                
                <button
                  type="submit"
                  form="evenement-form"
                  disabled={saving || !formData.titre || !formData.dateDebut}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all transform hover:scale-105 shadow-lg disabled:transform-none flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Mettre à jour
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-lg p-8 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                {preview ? (
                  <>
                    <Eye className="w-5 h-5 mr-2 text-blue-600" />
                    Aperçu
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
                    Informations
                  </>
                )}
              </h3>
              
              {preview ? (
                <div className="space-y-6">
                  {/* Aperçu de l'événement */}
                  <div className="border-2 border-gray-200 rounded-2xl p-6 bg-gray-50">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex flex-col items-center justify-center text-white font-bold flex-shrink-0">
                        {formData.dateDebut ? (
                          <>
                            <span className="text-xs opacity-90">
                              {new Date(formData.dateDebut).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()}
                            </span>
                            <span className="text-lg">
                              {new Date(formData.dateDebut).getDate()}
                            </span>
                          </>
                        ) : (
                          <Calendar className="w-8 h-8" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">
                          {formData.titre || 'Titre de l\'événement'}
                        </h4>
                        
                        {formData.description && (
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {formData.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      {formData.dateDebut && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>
                            {new Date(formData.dateDebut).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })} à {new Date(formData.dateDebut).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                      
                      {formData.lieu && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{formData.lieu}</span>
                        </div>
                      )}
                      
                      {formData.maxParticipants && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          <span>Max {formData.maxParticipants} participants</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Link
                      href={`/site/${user?.paroisse?.subdomain}/agenda`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Voir l'agenda sur le site
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Statut */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Statut</h4>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-3 bg-blue-500"></div>
                      <span className="font-medium text-blue-700">En édition</span>
                    </div>
                  </div>

                  {/* Actions rapides */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Actions rapides</h4>
                    <div className="space-y-3">
                      <Link
                        href={`/site/${user?.paroisse?.subdomain}/agenda`}
                        target="_blank"
                        className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Voir l'agenda sur le site
                      </Link>
                      <Link
                        href="/dashboard/evenements"
                        className="flex items-center text-gray-600 hover:text-gray-700 font-medium"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour à la liste
                      </Link>
                    </div>
                  </div>

                  {/* Informations */}
                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Informations</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <CalendarDays className="w-4 h-4 mr-2" />
                        <span>Dernière modification</span>
                      </div>
                      <div className="flex items-center">
                        <AlignLeft className="w-4 h-4 mr-2" />
                        <span>{formData.description.length} caractères</span>
                      </div>
                    </div>
                  </div>

                  {/* Conseils */}
                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Conseils</h4>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-blue-600 font-bold text-sm">✓</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Vérifiez les dates et heures avant de sauvegarder
                        </p>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-purple-600 font-bold text-sm">✓</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Testez l'aperçu avant de publier
                        </p>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-green-600 font-bold text-sm">✓</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Informez les participants des changements
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                  Êtes-vous sûr de vouloir supprimer l'événement <strong>"{formData.titre}"</strong> ?
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