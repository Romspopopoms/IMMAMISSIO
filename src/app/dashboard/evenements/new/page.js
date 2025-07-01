// ============================================================================
// src/app/dashboard/evenements/new/page.js - Page mise à jour avec cookies (DESIGN COMPLET)
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
  Plus,
  Eye,
  CalendarDays,
  ExternalLink,
  Lightbulb
} from 'lucide-react'

export default function NewEvenementPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [preview, setPreview] = useState(false)

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    lieu: '',
    maxParticipants: ''
  })

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
      const res = await fetch('/api/evenements', {
        method: 'POST',
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
        setMessage('Événement créé avec succès !')
        setMessageType('success')
        
        // Rediriger vers la liste après 2 secondes
        setTimeout(() => {
          router.push('/dashboard/evenements')
        }, 2000)
      } else {
        const errorData = await res.json()
        setMessage(errorData.error || 'Erreur lors de la création')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      setMessage('Erreur lors de la création de l\'événement')
      setMessageType('error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">Chargement...</p>
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
                Nouvel Événement
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
            <Plus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Créer un <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">nouvel événement</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Organisez et partagez les événements de votre paroisse avec votre communauté
          </p>
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
                    <p className="text-sm text-gray-500 mt-2">
                      Laissez vide si l'événement n'a pas d'heure de fin précise
                    </p>
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
                  <p className="text-sm text-gray-500 mt-2">
                    Optionnel - utile pour les événements avec places limitées (pèlerinages, repas...)
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
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
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Créer l'événement
                  </>
                )}
              </button>
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
                    Aide & Conseils
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
                      <div className="w-3 h-3 rounded-full mr-3 bg-yellow-500"></div>
                      <span className="font-medium text-yellow-700">En création</span>
                    </div>
                  </div>

                  {/* Conseils */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Conseils</h4>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-blue-600 font-bold text-sm">1</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Choisissez un titre clair qui décrit bien l'événement
                        </p>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-purple-600 font-bold text-sm">2</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Ajoutez une description détaillée avec le programme
                        </p>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-green-600 font-bold text-sm">3</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Précisez le lieu et les conditions de participation
                        </p>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-orange-600 font-bold text-sm">4</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Vérifiez les dates et heures avant de publier
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Types d'événements */}
                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Exemples d'événements</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>• Messes spéciales (Noël, Pâques...)</div>
                      <div>• Pèlerinages et sorties</div>
                      <div>• Concerts et spectacles</div>
                      <div>• Formations et conférences</div>
                      <div>• Repas paroissiaux</div>
                      <div>• Activités jeunes</div>
                    </div>
                  </div>

                  {/* Informations */}
                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Informations</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <CalendarDays className="w-4 h-4 mr-2" />
                        <span>Création le {new Date().toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center">
                        <AlignLeft className="w-4 h-4 mr-2" />
                        <span>{formData.description.length} caractères saisis</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}