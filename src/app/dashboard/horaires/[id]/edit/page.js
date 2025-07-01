// ============================================================================
// src/app/dashboard/horaires/[id]/edit/page.js - Page édition mise à jour
// ============================================================================
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  Clock,
  Calendar,
  AlignLeft,
  CheckCircle,
  AlertTriangle,
  Church,
  Trash2,
  Edit3,
  Eye,
  ExternalLink,
  Lightbulb,
  CalendarDays,
  Users,
  Heart,
  Book,
  Bell,
  Sparkles,
  Settings
} from 'lucide-react'

const joursSemaine = [
  { value: 0, label: 'Dimanche' },
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' }
]

const typesOffice = [
  { value: 'messe', label: 'Messe', emoji: '🍞', color: 'from-blue-500 to-cyan-500', icon: Heart },
  { value: 'confession', label: 'Confession', emoji: '🙏', color: 'from-green-500 to-emerald-500', icon: Users },
  { value: 'adoration', label: 'Adoration eucharistique', emoji: '✨', color: 'from-yellow-500 to-orange-500', icon: Sparkles },
  { value: 'vepres', label: 'Vêpres', emoji: '🎵', color: 'from-purple-500 to-indigo-500', icon: Bell },
  { value: 'chapelet', label: 'Chapelet', emoji: '📿', color: 'from-pink-500 to-rose-500', icon: Book },
  { value: 'permanence', label: 'Permanence d\'accueil', emoji: '👥', color: 'from-gray-500 to-slate-500', icon: Users },
  { value: 'autre', label: 'Autre célébration', emoji: '⛪', color: 'from-indigo-500 to-purple-500', icon: Church }
]

export default function EditHorairePage({ params }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [horaireId, setHoraireId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loadingHoraire, setLoadingHoraire] = useState(true)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [preview, setPreview] = useState(false)

  const [formData, setFormData] = useState({
    jourSemaine: 0,
    heure: '',
    typeOffice: 'messe',
    description: ''
  })

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setHoraireId(resolvedParams.id)
    }
    getParams()
  }, [params])

  // ✅ Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth()
  }, [])

  // ✅ Charger l'horaire après authentification
  useEffect(() => {
    if (user && horaireId) {
      fetchHoraire()
    }
  }, [user, horaireId])

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

  // ✅ Vérifier les permissions
  const canWrite = user && ['CURE', 'PAROISSE_ADMIN', 'PRETRE'].includes(user.role)

  // ✅ Fonction de chargement de l'horaire mise à jour
  const fetchHoraire = async () => {
    try {
      const res = await fetch(`/api/horaires/${horaireId}`, {
        credentials: 'include' // ✅ Utiliser les cookies au lieu du token
      })
      
      if (res.ok) {
        const data = await res.json()
        const horaire = data.horaire
        
        setFormData({
          jourSemaine: horaire.jourSemaine,
          heure: horaire.heure,
          typeOffice: horaire.typeOffice,
          description: horaire.description || ''
        })
      } else {
        showMessage('Horaire non trouvé', 'error')
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      showMessage('Erreur lors du chargement de l\'horaire', 'error')
    } finally {
      setLoadingHoraire(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }))
  }

  const showMessage = (text, type) => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => setMessage(''), 5000)
  }

  // ✅ Fonction de soumission mise à jour
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!canWrite) {
      showMessage('Vous n\'avez pas les permissions pour modifier des horaires', 'error')
      return
    }

    setSaving(true)
    setMessage('')

    // Validation
    if (!formData.heure || formData.jourSemaine === undefined) {
      showMessage('Le jour et l\'heure sont obligatoires', 'error')
      setSaving(false)
      return
    }

    // Validation de l'heure
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(formData.heure)) {
      showMessage('Format d\'heure invalide (utilisez HH:MM)', 'error')
      setSaving(false)
      return
    }

    try {
      const res = await fetch(`/api/horaires/${horaireId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // ✅ Utiliser les cookies au lieu du token
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        const data = await res.json()
        showMessage('Horaire mis à jour avec succès !', 'success')
        
        // Rediriger vers la liste après 2 secondes
        setTimeout(() => {
          router.push('/dashboard/horaires')
        }, 2000)
      } else {
        const errorData = await res.json()
        showMessage(errorData.error || 'Erreur lors de la mise à jour', 'error')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      showMessage('Erreur lors de la mise à jour de l\'horaire', 'error')
    } finally {
      setSaving(false)
    }
  }

  // ✅ Fonction de suppression mise à jour
  const handleDelete = async () => {
    if (!canWrite) {
      showMessage('Vous n\'avez pas les permissions pour supprimer des horaires', 'error')
      return
    }

    try {
      const res = await fetch(`/api/horaires/${horaireId}`, {
        method: 'DELETE',
        credentials: 'include' // ✅ Utiliser les cookies au lieu du token
      })
      
      if (res.ok) {
        showMessage('Horaire supprimé avec succès', 'success')
        setTimeout(() => {
          router.push('/dashboard/horaires')
        }, 1000)
      } else {
        const errorData = await res.json()
        showMessage(errorData.error || 'Erreur lors de la suppression', 'error')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      showMessage('Erreur lors de la suppression', 'error')
    }
    setShowDeleteModal(false)
  }

  if (loading || loadingHoraire) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">Chargement de l'horaire...</p>
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
          <p className="text-gray-600 mb-6">Vous n'avez pas les permissions pour modifier des horaires.</p>
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

  const selectedType = typesOffice.find(t => t.value === formData.typeOffice)
  const selectedJour = joursSemaine.find(j => j.value === formData.jourSemaine)

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
                Éditer l'horaire
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.paroisse?.nom || 'Paroisse'}
              </span>
              
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
                target="_blank"
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
            <Edit3 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Éditer <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">l'horaire</span>
          </h1>
          <div className="flex items-center justify-center space-x-4 text-gray-600">
            {selectedJour && formData.heure && (
              <>
                <span>Programmé :</span>
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">
                  {selectedJour.label} à {formData.heure}
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
                <Clock className="w-6 h-6 mr-3 text-orange-600" />
                Modifier l'horaire
              </h2>
              
              <form id="horaire-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Jour de la semaine */}
                <div>
                  <label htmlFor="jourSemaine" className="block text-lg font-bold text-gray-900 mb-3">
                    Jour de la semaine *
                  </label>
                  <select
                    id="jourSemaine"
                    name="jourSemaine"
                    value={formData.jourSemaine}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all text-lg"
                    required
                  >
                    {joursSemaine.map((jour) => (
                      <option key={jour.value} value={jour.value}>
                        {jour.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Heure */}
                <div>
                  <label htmlFor="heure" className="block text-lg font-bold text-gray-900 mb-3">
                    Heure *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                    <input
                      type="time"
                      id="heure"
                      name="heure"
                      value={formData.heure}
                      onChange={handleInputChange}
                      className="w-full pl-16 pr-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all text-lg"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Format 24h (ex: 09:00, 18:30)
                  </p>
                </div>

                {/* Type d'office */}
                <div>
                  <label htmlFor="typeOffice" className="block text-lg font-bold text-gray-900 mb-3">
                    Type de célébration *
                  </label>
                  <select
                    id="typeOffice"
                    name="typeOffice"
                    value={formData.typeOffice}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all text-lg"
                    required
                  >
                    {typesOffice.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.emoji} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-lg font-bold text-gray-900 mb-3">
                    Description (optionnel)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Ex: Messe des familles, Confession de 16h à 17h, Adoration avec chants..."
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all resize-none text-lg"
                  />
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-sm text-gray-500">
                      {formData.description.length} caractères
                    </p>
                    {formData.description.length > 20 && (
                      <span className="text-green-600 text-sm font-medium">Bonne description ✓</span>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Types d'offices disponibles */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Church className="w-6 h-6 mr-3 text-purple-600" />
                Changer le type d'office
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {typesOffice.map((type) => {
                  const IconComponent = type.icon
                  const isSelected = formData.typeOffice === type.value
                  
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, typeOffice: type.value }))}
                      className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        isSelected 
                          ? 'border-orange-500 bg-orange-50 shadow-lg' 
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${type.color} rounded-2xl flex items-center justify-center ${
                          isSelected ? 'scale-110' : 'group-hover:scale-105'
                        } transition-transform`}>
                          <span className="text-xl">{type.emoji}</span>
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className={`font-bold ${isSelected ? 'text-orange-900' : 'text-gray-900'}`}>
                            {type.label}
                          </h3>
                          <p className={`text-sm ${isSelected ? 'text-orange-700' : 'text-gray-600'}`}>
                            {type.value === 'messe' && 'Célébration eucharistique'}
                            {type.value === 'confession' && 'Sacrement de réconciliation'}
                            {type.value === 'adoration' && 'Adoration du Saint-Sacrement'}
                            {type.value === 'vepres' && 'Prière du soir'}
                            {type.value === 'chapelet' && 'Prière mariale'}
                            {type.value === 'permanence' && 'Accueil et accompagnement'}
                            {type.value === 'autre' && 'Autre type de célébration'}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-6 h-6 text-orange-600" />
                        )}
                      </div>
                    </button>
                  )
                })}
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
                Supprimer l'horaire
              </button>
              
              <div className="flex space-x-4">
                <Link
                  href="/dashboard/horaires"
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-100 hover:border-gray-400 transition-all font-medium"
                >
                  Annuler
                </Link>
                
                <button
                  type="submit"
                  form="horaire-form"
                  disabled={saving || !formData.heure}
                  className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all transform hover:scale-105 shadow-lg disabled:transform-none flex items-center"
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
                  {/* Aperçu de l'horaire */}
                  <div className="border-2 border-gray-200 rounded-2xl p-6 bg-gray-50">
                    <div className="flex items-start space-x-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${selectedType?.color || 'from-gray-500 to-slate-500'} rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0`}>
                        <span className="text-2xl">{selectedType?.emoji || '⛪'}</span>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">
                          {selectedJour?.label} à {formData.heure || '--:--'}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {selectedType?.label || 'Type non sélectionné'}
                        </p>
                        
                        {formData.description && (
                          <p className="text-sm text-gray-600 bg-white p-3 rounded-xl border">
                            {formData.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Link
                      href={`/site/${user?.paroisse?.subdomain}/agenda`}
                      target="_blank"
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
                        href="/dashboard/horaires"
                        className="flex items-center text-gray-600 hover:text-gray-700 font-medium"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour aux horaires
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
                          Vérifiez l'heure avant de sauvegarder
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
                          Informez les fidèles des changements
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