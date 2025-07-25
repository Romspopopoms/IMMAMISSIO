// ============================================================================
// src/app/dashboard/actualites/[id]/edit/page.js - Page mise à jour avec cookies (DESIGN COMPLET)
// ============================================================================
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  Eye,
  Upload,
  X,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Edit3,
  FileText,
  Image as ImageIcon,
  Clock,
  Lightbulb,
  ExternalLink
} from 'lucide-react'

export default function EditActualitePage({ params }) {
  const router = useRouter()
  const [actualiteId, setActualiteId] = useState(null)
  const [user, setUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingActualite, setLoadingActualite] = useState(true)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' or 'error'
  const [preview, setPreview] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // État du formulaire
  const [formData, setFormData] = useState({
    titre: '',
    contenu: '',
    image: '',
    publiee: false,
    datePubli: ''
  })

  // État pour l'upload d'image
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setActualiteId(resolvedParams.id)
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
          router.push('/dashboard/actualites')
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

  // Charger l'actualité
  const fetchActualite = async () => {
    try {
      const res = await fetch(`/api/actualites/${actualiteId}`, {
        credentials: 'include'
      })
      
      if (res.ok) {
        const data = await res.json()
        const actualite = data.actualite
        
        setFormData({
          titre: actualite.titre,
          contenu: actualite.contenu,
          image: actualite.image || '',
          publiee: actualite.publiee,
          datePubli: actualite.datePubli ? 
            new Date(actualite.datePubli).toISOString().slice(0, 16) : ''
        })
        
        if (actualite.image) {
          setImagePreview(actualite.image)
        }
      } else {
        setMessage('Actualité non trouvée')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      setMessage('Erreur lors du chargement de l\'actualité')
      setMessageType('error')
    } finally {
      setLoadingActualite(false)
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
    if (user && actualiteId) {
      fetchActualite()
    }
  }, [user, actualiteId])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview('')
    setFormData(prev => ({
      ...prev,
      image: ''
    }))
  }

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const submitData = {
        ...formData,
        publiee: !isDraft && formData.publiee
      }

      const res = await fetch(`/api/actualites/${actualiteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(submitData)
      })

      if (res.ok) {
        const data = await res.json()
        setMessage(
          isDraft 
            ? 'Actualité sauvegardée en brouillon !' 
            : 'Actualité mise à jour avec succès !'
        )
        setMessageType('success')
        
        // Rediriger vers la liste après 2 secondes
        setTimeout(() => {
          router.push('/dashboard/actualites')
        }, 2000)
      } else {
        const errorData = await res.json()
        setMessage(errorData.error || 'Erreur lors de la mise à jour')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      setMessage('Erreur lors de la mise à jour de l\'actualité')
      setMessageType('error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/actualites/${actualiteId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (res.ok) {
        setMessage('Actualité supprimée avec succès')
        setMessageType('success')
        setTimeout(() => {
          router.push('/dashboard/actualites')
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

  const handleSaveDraft = (e) => {
    handleSubmit(e, true)
  }

  const handlePublish = (e) => {
    handleSubmit(e, false)
  }

  if (loading || loadingActualite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">Chargement de l'actualité...</p>
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
                href="/dashboard/actualites"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Éditer l'actualité
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setPreview(!preview)}
                className={`flex items-center px-4 py-2 rounded-xl transition-all font-medium ${
                  preview 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Eye className="w-4 h-4 mr-2" />
                {preview ? 'Édition' : 'Aperçu'}
              </button>
              
              <Link
                href={`/site/${user?.paroisse?.subdomain}/actualites/${actualiteId}`}
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Voir sur le site
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
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Edit3 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Éditer <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">"{formData.titre}"</span>
          </h1>
          <div className="flex items-center justify-center space-x-4 text-gray-600">
            <span>Statut actuel :</span>
            <span className={`px-3 py-1 rounded-full font-medium ${
              formData.publiee 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {formData.publiee ? 'Publié' : 'Brouillon'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulaire principal */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Image de couverture */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <ImageIcon className="w-6 h-6 mr-3 text-blue-600" />
                Image de couverture
              </h2>
              
              {imagePreview ? (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Aperçu"
                    className="w-full h-64 object-cover rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                    <div className="flex space-x-4">
                      <label className="bg-white text-gray-900 px-6 py-3 rounded-xl font-medium cursor-pointer hover:bg-gray-100 transition-colors">
                        Changer
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="bg-red-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-600 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all group">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-100 transition-colors">
                      <Upload className="w-10 h-10 text-gray-400 group-hover:text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Ajouter une image</h3>
                    <p className="text-gray-600 mb-4">
                      Choisissez une image qui illustre bien votre actualité
                    </p>
                    <div className="bg-blue-100 text-blue-700 px-6 py-3 rounded-xl inline-flex items-center font-medium">
                      <Upload className="w-5 h-5 mr-2" />
                      Parcourir les fichiers
                    </div>
                    <p className="text-sm text-gray-500 mt-3">
                      PNG, JPG, GIF jusqu'à 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Contenu de l'actualité */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-blue-600" />
                Contenu de l'actualité
              </h2>
              
              <form onSubmit={handlePublish} className="space-y-6">
                
                {/* Titre */}
                <div>
                  <label htmlFor="titre" className="block text-lg font-bold text-gray-900 mb-3">
                    Titre de l'actualité *
                  </label>
                  <input
                    type="text"
                    id="titre"
                    name="titre"
                    value={formData.titre}
                    onChange={handleInputChange}
                    placeholder="Ex: Nouvelle programmation de la chorale"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg"
                    required
                  />
                </div>

                {/* Contenu */}
                <div>
                  <label htmlFor="contenu" className="block text-lg font-bold text-gray-900 mb-3">
                    Contenu *
                  </label>
                  <textarea
                    id="contenu"
                    name="contenu"
                    value={formData.contenu}
                    onChange={handleInputChange}
                    rows={12}
                    placeholder="Rédigez le contenu de votre actualité... Décrivez les détails, les dates importantes, les informations pratiques..."
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none text-lg"
                    required
                  />
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-sm text-gray-500">
                      {formData.contenu.length} caractères
                    </p>
                    {formData.contenu.length > 500 && (
                      <span className="text-green-600 text-sm font-medium">Bonne longueur ✓</span>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Options de publication */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-blue-600" />
                Options de publication
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-2xl">
                  <input
                    type="checkbox"
                    id="publiee"
                    name="publiee"
                    checked={formData.publiee}
                    onChange={handleInputChange}
                    className="mt-1 w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <label htmlFor="publiee" className="block text-lg font-bold text-gray-900 mb-1">
                      Publier immédiatement
                    </label>
                    <p className="text-gray-600">
                      Rendre cette actualité visible sur votre site dès la sauvegarde
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="datePubli" className="block text-lg font-bold text-gray-900 mb-3">
                    Date de publication personnalisée (optionnel)
                  </label>
                  <input
                    type="datetime-local"
                    id="datePubli"
                    name="datePubli"
                    value={formData.datePubli}
                    onChange={handleInputChange}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Si vide, la date actuelle sera utilisée lors de la publication
                  </p>
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
                Supprimer l'actualité
              </button>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleSaveDraft}
                  disabled={saving || !formData.titre || !formData.contenu}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all flex items-center"
                >
                  <Clock className="w-5 h-5 mr-2" />
                  Sauvegarder brouillon
                </button>
                
                <button
                  onClick={handlePublish}
                  disabled={saving || !formData.titre || !formData.contenu}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all transform hover:scale-105 shadow-lg disabled:transform-none flex items-center"
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
                  {/* Aperçu de l'actualité */}
                  <div className="border-2 border-gray-200 rounded-2xl p-4 bg-gray-50">
                    {formData.image && (
                      <img
                        src={formData.image}
                        alt="Aperçu"
                        className="w-full h-32 object-cover rounded-xl mb-4"
                      />
                    )}
                    
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      {formData.titre || 'Titre de l\'actualité'}
                    </h4>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>
                        {formData.datePubli 
                          ? new Date(formData.datePubli).toLocaleDateString('fr-FR')
                          : new Date().toLocaleDateString('fr-FR')
                        }
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {formData.contenu 
                        ? formData.contenu.substring(0, 200) + (formData.contenu.length > 200 ? '...' : '')
                        : 'Contenu de l\'actualité...'
                      }
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Link
                      href={`/site/${user?.paroisse?.subdomain}/actualites/${actualiteId}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Voir sur le site
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Statut */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Statut</h4>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        formData.publiee ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <span className={`font-medium ${
                        formData.publiee ? 'text-green-700' : 'text-yellow-700'
                      }`}>
                        {formData.publiee ? 'Publié' : 'Brouillon'}
                      </span>
                    </div>
                  </div>

                  {/* Actions rapides */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Actions rapides</h4>
                    <div className="space-y-3">
                      <Link
                        href={`/site/${user?.paroisse?.subdomain}/actualites/${actualiteId}`}
                        target="_blank"
                        className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Voir sur le site
                      </Link>
                      <Link
                        href="/dashboard/actualites"
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
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Dernière modification</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        <span>{formData.contenu.length} caractères</span>
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
                          Vérifiez l'orthographe et la grammaire
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
                          Ajoutez une image de qualité
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
                  Supprimer l'actualité
                </h3>
                <p className="text-gray-600 mb-8">
                  Êtes-vous sûr de vouloir supprimer cette actualité <strong>"{formData.titre}"</strong> ?
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