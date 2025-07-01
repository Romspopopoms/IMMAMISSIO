// ============================================================================
// src/app/dashboard/dons/edit/[id]/EditProjectClient.js - VERSION FINALE
// ============================================================================
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Upload, 
  Target, 
  Euro, 
  Save, 
  Eye, 
  Image as ImageIcon,
  FileText,
  Settings,
  X,
  Trash2,
  AlertTriangle,
  Edit3,
  ExternalLink,
  CheckCircle
} from 'lucide-react'

export default function EditProjectClient({ projectId, user }) {
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [themes, setThemes] = useState([])
  const [originalProject, setOriginalProject] = useState(null)
  const [originalTheme, setOriginalTheme] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    objectif: '',
    image: '',
    theme: 'une'
  })
  
  const [projectStats, setProjectStats] = useState({
    collecteReelle: 0,
    nombreDonateurs: 0
  })

  useEffect(() => {
    if (user?.paroisseId && projectId) {
      loadProject()
      loadThemes()
    }
  }, [user, projectId])

  // Validation en temps réel
  const validateField = (field, value) => {
    const newErrors = { ...errors }
    
    switch (field) {
      case 'titre':
        if (!value || value.length < 3) {
          newErrors.titre = 'Le titre doit contenir au moins 3 caractères'
        } else {
          delete newErrors.titre
        }
        break
      case 'description':
        if (!value || value.length < 10) {
          newErrors.description = 'La description doit contenir au moins 10 caractères'
        } else {
          delete newErrors.description
        }
        break
      case 'objectif':
        const montant = parseInt(value)
        if (!value || montant < 100) {
          newErrors.objectif = 'L\'objectif doit être d\'au moins 100€'
        } else if (montant > 1000000) {
          newErrors.objectif = 'L\'objectif ne peut pas dépasser 1 000 000€'
        } else {
          delete newErrors.objectif
        }
        break
    }
    
    setErrors(newErrors)
  }

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
    validateField(field, value)
  }

  const loadProject = async () => {
    try {
      const response = await fetch(`/api/projets/${projectId}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        
        // ✅ CORRECTION CRITIQUE: Sérialiser complètement l'objet projet
        const projetSerialized = {
          id: String(data.projet.id),
          titre: String(data.projet.titre || ''),
          description: String(data.projet.description || ''),
          objectif: Number(data.projet.objectif || 0),
          image: data.projet.image ? String(data.projet.image) : null,
          theme: String(data.projet.theme || 'une'),
          alaune: Boolean(data.projet.alaune),
          createdAt: data.projet.createdAt ? String(data.projet.createdAt) : null,
          updatedAt: data.projet.updatedAt ? String(data.projet.updatedAt) : null
        }
        
        setOriginalProject(projetSerialized)
        setOriginalTheme(projetSerialized.theme)
        
        // Mettre à jour le formulaire avec les données sérialisées
        setFormData({
          titre: projetSerialized.titre,
          description: projetSerialized.description,
          objectif: projetSerialized.objectif.toString(),
          image: projetSerialized.image || '',
          theme: projetSerialized.theme
        })

        // ✅ Utiliser les statistiques de l'API (sérialisées)
        if (data.statistiques) {
          setProjectStats({
            collecteReelle: Number(data.statistiques.totalCollecte || 0),
            nombreDonateurs: Number(data.statistiques.totalDonateurs || 0)
          })
        }
      } else {
        throw new Error('Projet non trouvé')
      }
    } catch (error) {
      console.error('Erreur chargement projet:', error)
      setErrors({ load: 'Erreur lors du chargement du projet' })
      router.push('/dashboard/dons')
    } finally {
      setLoading(false)
    }
  }

  const loadThemes = () => {
    // ✅ Utiliser directement des thèmes par défaut
    const defaultThemes = [
      { id: 'vie-paroissiale', label: 'Vie paroissiale' },
      { id: 'charite', label: 'Charité' },
      { id: 'patrimoine', label: 'Patrimoine' },
      { id: 'jeunesse', label: 'Jeunesse' },
      { id: 'missions', label: 'Missions' },
      { id: 'liturgie', label: 'Liturgie' }
    ]
    
    setThemes(defaultThemes)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validation de l'image
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, image: 'Veuillez sélectionner un fichier image valide' })
        return
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        setErrors({ ...errors, image: 'L\'image ne doit pas dépasser 5MB' })
        return
      }

      // Supprimer l'erreur d'image si elle existe
      const newErrors = { ...errors }
      delete newErrors.image
      setErrors(newErrors)

      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})

    try {
      // Validation finale
      validateField('titre', formData.titre)
      validateField('description', formData.description)
      validateField('objectif', formData.objectif)

      if (Object.keys(errors).length > 0) {
        throw new Error('Veuillez corriger les erreurs dans le formulaire')
      }

      const updatedProject = {
        titre: formData.titre.trim(),
        description: formData.description.trim(),
        objectif: parseInt(formData.objectif),
        image: formData.image,
        theme: formData.theme
      }

      const response = await fetch(`/api/projets/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updatedProject)
      })

      if (response.ok) {
        setSuccessMessage('Projet mis à jour avec succès!')
        setTimeout(() => {
          router.push('/dashboard/dons?success=project-updated')
        }, 1500)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setErrors({ submit: error.message })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)

    try {
      const response = await fetch(`/api/projets/${projectId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        router.push('/dashboard/dons?success=project-deleted')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setErrors({ delete: error.message })
    } finally {
      setSaving(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">Chargement du projet...</p>
        </div>
      </div>
    )
  }

  const getThemeName = (themeId) => {
    if (themeId === 'une') return 'À la une'
    const theme = themes.find(t => t.id === themeId)
    return theme ? theme.label : themeId
  }

  const getPercentage = (collecte, objectif) => {
    return Math.min(Math.round((collecte / objectif) * 100), 100)
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount)
  }

  const isFormValid = formData.titre && formData.description && formData.objectif && 
                     Object.keys(errors).length === 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link 
                href="/dashboard/dons"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Éditer le projet
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user?.paroisse?.subdomain && (
                <Link
                  href={`/site/${user.paroisse.subdomain}/don/projet/${projectId}`}
                  target="_blank"
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Voir sur le site
                </Link>
              )}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl mb-8 flex items-center">
            <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Erreur lors de la sauvegarde</h3>
              <p className="text-sm">{errors.submit}</p>
            </div>
          </div>
        )}

        {errors.load && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Erreur de chargement</h3>
              <p className="text-sm">{errors.load}</p>
            </div>
          </div>
        )}
        
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Edit3 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Éditer <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">"{formData.titre}"</span>
          </h1>
          {originalTheme && (
            <div className="flex items-center justify-center space-x-4 text-gray-600">
              <span>Thématique actuelle :</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                {getThemeName(originalTheme)}
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Image du projet */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <ImageIcon className="w-6 h-6 mr-3 text-blue-600" />
              Image du projet
            </h2>
            
            {formData.image ? (
              <div className="relative group">
                <img 
                  src={formData.image} 
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
                      onClick={() => setFormData({ ...formData, image: '' })}
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
                    Choisissez une image qui représente bien votre projet (max 5MB)
                  </p>
                  <div className="bg-blue-100 text-blue-700 px-6 py-3 rounded-xl inline-flex items-center font-medium">
                    <Upload className="w-5 h-5 mr-2" />
                    Parcourir les fichiers
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
            
            {errors.image && (
              <p className="mt-4 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {errors.image}
              </p>
            )}
          </div>

          {/* Informations du projet */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FileText className="w-6 h-6 mr-3 text-blue-600" />
              Informations du projet
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  Titre du projet *
                </label>
                <input
                  type="text"
                  value={formData.titre}
                  onChange={(e) => handleInputChange('titre', e.target.value)}
                  placeholder="Ex: Rénovation du clocher"
                  className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all text-lg ${
                    errors.titre ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                  required
                />
                {errors.titre && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {errors.titre}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  Description du projet *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Décrivez votre projet, son importance, les travaux nécessaires..."
                  rows={5}
                  className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all resize-none text-lg ${
                    errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                  required
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  Objectif de collecte *
                </label>
                <div className="relative">
                  <Euro className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <input
                    type="number"
                    value={formData.objectif}
                    onChange={(e) => handleInputChange('objectif', e.target.value)}
                    placeholder="10000"
                    min="100"
                    max="1000000"
                    className={`w-full pl-16 pr-6 py-4 text-lg font-bold border-2 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all ${
                      errors.objectif ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`}
                    required
                  />
                  <span className="absolute right-6 top-1/2 transform -translate-y-1/2 text-lg font-bold text-gray-600">€</span>
                </div>
                {errors.objectif && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {errors.objectif}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Thématique */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Settings className="w-6 h-6 mr-3 text-blue-600" />
              Thématique du projet
            </h2>
            
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">
                Choisir une thématique
              </label>
              <select
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg"
              >
                <option value="une">À la une (page d'accueil)</option>
                {themes.map(theme => (
                  <option key={theme.id} value={theme.id}>{theme.label}</option>
                ))}
              </select>
              
              {formData.theme !== originalTheme && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="text-yellow-800 font-medium">
                      Le projet sera déplacé de "{getThemeName(originalTheme)}" vers "{getThemeName(formData.theme)}"
                    </span>
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <Link
                  href="/dashboard/dons/themes"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Gérer les thématiques
                </Link>
              </div>
            </div>
          </div>

          {/* Preview */}
          {formData.titre && formData.objectif && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Eye className="w-6 h-6 mr-3 text-blue-600" />
                Aperçu du projet
              </h2>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg max-w-md">
                <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                  <img 
                    src={formData.image || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&h=600&fit=crop'} 
                    alt="Aperçu"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {projectStats.collecteReelle >= parseInt(formData.objectif || 0) ? 'Objectif atteint' : `${getPercentage(projectStats.collecteReelle, parseInt(formData.objectif || 1))}%`}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{formData.titre}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{formData.description}</p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{formatAmount(projectStats.collecteReelle)}€ collectés</span>
                    <span>Objectif : {parseInt(formData.objectif || 0).toLocaleString()}€</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all ${
                        projectStats.collecteReelle >= parseInt(formData.objectif || 0)
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-gradient-to-r from-blue-500 to-purple-600'
                      }`}
                      style={{ width: `${getPercentage(projectStats.collecteReelle, parseInt(formData.objectif || 1))}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>{projectStats.nombreDonateurs} donateur(s)</span>
                  {projectStats.collecteReelle >= parseInt(formData.objectif || 0) && (
                    <span className="text-green-600 font-bold">✓ Objectif atteint</span>
                  )}
                </div>
                <button type="button" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium">
                  Contribuer
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-8 py-4 border-2 border-red-300 text-red-700 rounded-2xl hover:bg-red-50 hover:border-red-400 transition-all font-medium flex items-center"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Supprimer le projet
            </button>
            
            <div className="flex space-x-4">
              <Link
                href="/dashboard/dons"
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-100 hover:border-gray-400 transition-all font-medium"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={saving || !isFormValid}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all transform hover:scale-105 shadow-lg disabled:transform-none flex items-center"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Sauvegarder les modifications
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Modal de suppression */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Supprimer le projet
                </h3>
                <p className="text-gray-600 mb-8">
                  Êtes-vous sûr de vouloir supprimer le projet <strong>"{formData.titre}"</strong> ?
                  Cette action est irréversible et supprimera également tous les dons associés.
                </p>
                
                {errors.delete && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
                    {errors.delete}
                  </div>
                )}
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={saving}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-medium disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-bold transition-all flex items-center justify-center"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5 mr-2" />
                        Supprimer définitivement
                      </>
                    )}
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