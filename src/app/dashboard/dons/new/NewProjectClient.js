// ============================================================================
// src/app/dashboard/dons/new/NewProjectClient.js - Version finale sécurisée
// ============================================================================
'use client'

import { useState } from 'react'
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
  Star,
  Plus,
  X,
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from 'lucide-react'

export default function NewProjectClient({ initialThemes = [], user }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    objectif: '',
    image: '',
    theme: initialThemes.length > 0 ? initialThemes[0].id : 'vie-paroissiale',
    alaune: false,
    newTheme: false
  })
  const [newThemeData, setNewThemeData] = useState({
    label: '',
    icon: 'Heart',
    image: ''
  })

  // ✅ Utiliser directement les thèmes du serveur
  const themes = initialThemes

  // ✅ Validation en temps réel
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

  const handleImageUpload = (e, type = 'project') => {
    const file = e.target.files?.[0]
    if (file) {
      // ✅ Validation de l'image
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image valide')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        alert('L\'image ne doit pas dépasser 5MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        if (type === 'project') {
          setFormData({ ...formData, image: reader.result })
        } else {
          setNewThemeData({ ...newThemeData, image: reader.result })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      // ✅ Validation finale
      validateField('titre', formData.titre)
      validateField('description', formData.description)
      validateField('objectif', formData.objectif)

      if (Object.keys(errors).length > 0) {
        throw new Error('Veuillez corriger les erreurs dans le formulaire')
      }

      let finalTheme = formData.theme

      // Créer un nouveau thème si nécessaire
      if (formData.newTheme && newThemeData.label) {
        if (!newThemeData.label || newThemeData.label.length < 3) {
          throw new Error('Le nom de la thématique doit contenir au moins 3 caractères')
        }

        const themeId = newThemeData.label.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
        
        // ✅ Vérifier que l'ID n'existe pas déjà
        if (themes.some(t => t.id === themeId)) {
          throw new Error('Une thématique avec ce nom existe déjà')
        }

        const newTheme = {
          id: themeId,
          label: newThemeData.label,
          icon: newThemeData.icon,
          image: newThemeData.image || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=300&fit=crop'
        }

        // ✅ Appel API sécurisé pour créer le thème
        const configResponse = await fetch('/api/paroisse/config', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include', // ✅ Inclure les cookies d'auth
          body: JSON.stringify({
            configSite: {
              donThemes: [...themes, newTheme]
            }
          })
        })

        if (!configResponse.ok) {
          const errorData = await configResponse.json()
          throw new Error(errorData.error || 'Erreur lors de la création du thème')
        }

        finalTheme = themeId
      }

      // Créer le projet
      const projectData = {
        titre: formData.titre.trim(),
        description: formData.description.trim(),
        objectif: parseInt(formData.objectif),
        image: formData.image || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&h=600&fit=crop',
        theme: finalTheme,
        alaune: formData.alaune,
        actif: true
      }

      // ✅ Appel API sécurisé pour créer le projet
      const response = await fetch('/api/projets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // ✅ Inclure les cookies d'auth
        body: JSON.stringify(projectData)
      })

      if (response.ok) {
        // ✅ Redirection avec message de succès
        router.push('/dashboard/dons?success=project-created')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création du projet')
      }

    } catch (error) {
      console.error('Erreur:', error)
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  const iconOptions = [
    { value: 'Heart', label: 'Cœur' },
    { value: 'Church', label: 'Église' },
    { value: 'Target', label: 'Cible' },
    { value: 'Users', label: 'Utilisateurs' },
    { value: 'Euro', label: 'Euro' },
    { value: 'Gift', label: 'Cadeau' },
    { value: 'Star', label: 'Étoile' }
  ]

  // ✅ Vérifier si le formulaire est valide
  const isFormValid = formData.titre && formData.description && formData.objectif && 
                     Object.keys(errors).length === 0 &&
                     (!formData.newTheme || (newThemeData.label && newThemeData.label.length >= 3))

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
                Nouveau Projet
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user?.paroisse?.subdomain && (
                <Link
                  href={`/site/${user.paroisse.subdomain}/don`}
                  target="_blank"
                  className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Voir le site
                </Link>
              )}
              <Link
                href="/dashboard/dons"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Annuler
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Plus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Créer un <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">nouveau projet</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Lancez une nouvelle collecte de fonds pour votre paroisse
          </p>
        </div>

        {/* ✅ Message d'erreur global */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Erreur lors de la création</h3>
              <p className="text-sm">{errors.submit}</p>
            </div>
          </div>
        )}

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
                        onChange={(e) => handleImageUpload(e, 'project')}
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
                  onChange={(e) => handleImageUpload(e, 'project')}
                  className="hidden"
                />
              </label>
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
                
                {/* Suggestions */}
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-3">Suggestions :</p>
                  <div className="flex flex-wrap gap-3">
                    {[5000, 10000, 25000, 50000, 100000].map((montant) => (
                      <button
                        key={montant}
                        type="button"
                        onClick={() => handleInputChange('objectif', montant.toString())}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors text-sm font-medium"
                      >
                        {montant.toLocaleString()}€
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Settings className="w-6 h-6 mr-3 text-blue-600" />
              Configuration du projet
            </h2>
            
            <div className="space-y-6">
              {/* Checkbox À la une */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.alaune}
                    onChange={(e) => setFormData({ ...formData, alaune: e.target.checked })}
                    className="w-5 h-5 text-yellow-600 rounded border-2 border-gray-300"
                  />
                  <div>
                    <span className="text-lg font-bold text-gray-900 flex items-center">
                      <Star className="w-5 h-5 mr-2 text-yellow-600" />
                      Mettre à la une
                    </span>
                    <p className="text-sm text-gray-600">
                      Le projet sera affiché sur la page d'accueil des dons
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  Thématique du projet
                </label>
                <select
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value, newTheme: false })}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg"
                >
                  {themes.map(theme => (
                    <option key={theme.id} value={theme.id}>{theme.label}</option>
                  ))}
                </select>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.newTheme}
                    onChange={(e) => setFormData({ ...formData, newTheme: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded border-2 border-gray-300"
                  />
                  <span className="text-lg font-bold text-gray-900">
                    Créer une nouvelle thématique
                  </span>
                </label>
              </div>

              {formData.newTheme && (
                <div className="bg-blue-50 rounded-2xl p-6 space-y-4">
                  <div>
                    <label className="block text-lg font-bold text-gray-900 mb-3">
                      Nom de la thématique *
                    </label>
                    <input
                      type="text"
                      value={newThemeData.label}
                      onChange={(e) => setNewThemeData({ ...newThemeData, label: e.target.value })}
                      placeholder="Ex: Aide humanitaire"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                      required={formData.newTheme}
                    />
                    {formData.newTheme && newThemeData.label && newThemeData.label.length < 3 && (
                      <p className="mt-2 text-sm text-red-600">
                        Le nom doit contenir au moins 3 caractères
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-lg font-bold text-gray-900 mb-3">
                      Icône
                    </label>
                    <select
                      value={newThemeData.icon}
                      onChange={(e) => setNewThemeData({ ...newThemeData, icon: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    >
                      {iconOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-lg font-bold text-gray-900 mb-3">
                      Image de fond (optionnelle)
                    </label>
                    {newThemeData.image ? (
                      <div className="relative">
                        <img src={newThemeData.image} alt="Aperçu thème" className="w-full h-32 object-cover rounded-xl" />
                        <button
                          type="button"
                          onClick={() => setNewThemeData({ ...newThemeData, image: '' })}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400">
                        <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                        <span className="text-gray-600">Ajouter une image (max 5MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'theme')}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}
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
                    0%
                  </div>
                  {formData.alaune && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      À la une
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{formData.titre}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{formData.description}</p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>0€ collectés</span>
                    <span>Objectif : {parseInt(formData.objectif || 0).toLocaleString()}€</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full w-0"></div>
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium">
                  Contribuer
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/dashboard/dons"
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-100 hover:border-gray-400 transition-all font-medium"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="px-8 py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-2xl hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all transform hover:scale-105 shadow-lg disabled:transform-none flex items-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Création...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Créer le projet
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}