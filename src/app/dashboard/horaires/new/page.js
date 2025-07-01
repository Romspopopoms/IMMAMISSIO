// ============================================================================
// src/app/dashboard/horaires/new/page.js - Page création d'horaire mise à jour
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
  Plus,
  Eye,
  ExternalLink,
  Lightbulb,
  Star,
  CalendarDays,
  Bell,
  Heart,
  Book,
  Users,
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

export default function NewHorairePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [preview, setPreview] = useState(false)

  const [formData, setFormData] = useState({
    jourSemaine: 0,
    heure: '',
    typeOffice: 'messe',
    description: ''
  })

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
      showMessage('Vous n\'avez pas les permissions pour créer des horaires', 'error')
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
      const res = await fetch('/api/horaires', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // ✅ Utiliser les cookies au lieu du token
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        const data = await res.json()
        showMessage('Horaire créé avec succès !', 'success')
        
        // Rediriger vers la liste après 2 secondes
        setTimeout(() => {
          router.push('/dashboard/horaires')
        }, 2000)
      } else {
        const errorData = await res.json()
        showMessage(errorData.error || 'Erreur lors de la création', 'error')
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      showMessage('Erreur lors de la création de l\'horaire', 'error')
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

  if (!canWrite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Accès non autorisé</h2>
          <p className="text-gray-600 mb-6">Vous n'avez pas les permissions pour créer des horaires.</p>
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
                Nouvel Horaire
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
            <Plus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Créer un <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">nouvel horaire</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ajoutez un horaire de messe ou d'office pour informer votre communauté
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulaire principal */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Informations générales */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Clock className="w-6 h-6 mr-3 text-orange-600" />
                Planification de l'office
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
                Types d'offices disponibles
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
            <div className="flex justify-end space-x-4">
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
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Créer l'horaire
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
                      <div className="w-3 h-3 rounded-full mr-3 bg-yellow-500"></div>
                      <span className="font-medium text-yellow-700">En création</span>
                    </div>
                  </div>

                  {/* Conseils par type */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Conseils par type</h4>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="bg-blue-50 p-3 rounded-xl">
                        <p className="font-medium text-blue-900 mb-1">🍞 Messes</p>
                        <p>Indiquez l'heure de début de la célébration</p>
                      </div>
                      
                      <div className="bg-green-50 p-3 rounded-xl">
                        <p className="font-medium text-green-900 mb-1">🙏 Confessions</p>
                        <p>Précisez la tranche horaire dans la description</p>
                      </div>
                      
                      <div className="bg-yellow-50 p-3 rounded-xl">
                        <p className="font-medium text-yellow-900 mb-1">✨ Adoration</p>
                        <p>Mentionnez la durée si elle est limitée</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <p className="font-medium text-gray-900 mb-1">👥 Permanence</p>
                        <p>Indiquez les heures d'ouverture/fermeture</p>
                      </div>
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

                  {/* Actions rapides */}
                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Actions rapides</h4>
                    <div className="space-y-2">
                      <Link
                        href="/dashboard/horaires"
                        className="flex items-center text-gray-600 hover:text-gray-700 font-medium text-sm"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour aux horaires
                      </Link>
                      <Link
                        href={`/site/${user?.paroisse?.subdomain}/agenda`}
                        target="_blank"
                        className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Voir l'agenda public
                      </Link>
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