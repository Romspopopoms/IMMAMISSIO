// ============================================================================
// src/components/ModalAddProject.js - Version mise à jour pour l'API
// ============================================================================
'use client'
import { useState, useEffect } from 'react'
import { X, Upload, Euro, Target, Image, FileText, Info, Plus, Edit, AlertTriangle, CheckCircle } from 'lucide-react'

export default function ModalAddProject({ 
  isOpen, 
  onClose, 
  onAdd,
  editingProject = null,
  themes = []
}) {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    objectif: '',
    image: '',
    theme: themes.length > 0 ? themes[0].id : 'vie-paroissiale',
    alaune: false
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    if (editingProject) {
      setFormData({
        titre: editingProject.titre || '',
        description: editingProject.description || '',
        objectif: editingProject.objectif?.toString() || '',
        image: editingProject.image || '',
        theme: editingProject.theme || (themes.length > 0 ? themes[0].id : 'vie-paroissiale'),
        alaune: editingProject.alaune || false
      })
    } else {
      setFormData({
        titre: '',
        description: '',
        objectif: '',
        image: '',
        theme: themes.length > 0 ? themes[0].id : 'vie-paroissiale',
        alaune: false
      })
    }
    setErrors({})
    setSuccessMessage('')
  }, [editingProject, themes])

  if (!isOpen) return null

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

      const projectData = {
        titre: formData.titre.trim(),
        description: formData.description.trim(),
        objectif: parseInt(formData.objectif),
        image: formData.image || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&h=600&fit=crop',
        theme: formData.theme,
        alaune: formData.alaune,
        actif: true
      }

      let response

      if (editingProject) {
        // ✅ Mise à jour via API
        response = await fetch(`/api/projets/${editingProject.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(projectData)
        })
      } else {
        // ✅ Création via API
        response = await fetch('/api/projets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(projectData)
        })
      }

      if (response.ok) {
        const result = await response.json()
        setSuccessMessage(editingProject ? 'Projet mis à jour avec succès!' : 'Projet créé avec succès!')
        
        // ✅ Notifier le parent avec les nouvelles données
        if (onAdd) {
          onAdd(result.projet || projectData)
        }

        // ✅ Fermer la modale après 1.5s
        setTimeout(() => {
          handleClose()
        }, 1500)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde')
      }

    } catch (error) {
      console.error('Erreur:', error)
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      titre: '',
      description: '',
      objectif: '',
      image: '',
      theme: themes.length > 0 ? themes[0].id : 'vie-paroissiale',
      alaune: false
    })
    setErrors({})
    setSuccessMessage('')
    onClose()
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // ✅ Validation de l'image
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

  const isEdit = !!editingProject
  const IconComponent = isEdit ? Edit : Plus

  // ✅ Vérifier si le formulaire est valide
  const isFormValid = formData.titre && formData.description && formData.objectif && 
                     Object.keys(errors).length === 0

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Target className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">
                  {isEdit ? 'Modifier le Projet' : 'Nouveau Projet'}
                </h2>
                <p className="text-orange-100">
                  {isEdit ? 'Mettre à jour votre collecte' : 'Créer une nouvelle collecte de fonds'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          
          {/* Messages */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center">
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center">
              <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Erreur lors de la sauvegarde</h3>
                <p className="text-sm">{errors.submit}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Image upload */}
            <div className="space-y-4">
              <label className="block text-xl font-bold text-gray-900">
                Image du projet
              </label>
              
              <div className="relative">
                {formData.image ? (
                  <div className="relative group">
                    <img 
                      src={formData.image} 
                      alt="Aperçu du projet" 
                      className="w-full h-64 object-cover rounded-2xl shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                      <div className="flex space-x-4">
                        <label className="bg-white/90 backdrop-blur-sm text-gray-900 px-6 py-3 rounded-xl font-medium cursor-pointer hover:bg-white transition-colors">
                          <Upload className="w-5 h-5 inline mr-2" />
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
                          className="bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-medium hover:bg-red-600 transition-colors"
                        >
                          <X className="w-5 h-5 inline mr-2" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 group">
                      <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-100 transition-colors">
                        <Image className="w-10 h-10 text-gray-400 group-hover:text-orange-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Ajouter une image</h3>
                      <p className="text-gray-600 mb-4">
                        Choisissez une image représentative de votre projet (max 5MB)
                      </p>
                      <div className="bg-orange-100 text-orange-700 px-6 py-3 rounded-xl inline-flex items-center font-medium">
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
            </div>

            {/* Titre */}
            <div className="space-y-4">
              <label className="block text-xl font-bold text-gray-900">
                Titre du projet *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.titre}
                  onChange={(e) => handleInputChange('titre', e.target.value)}
                  placeholder="Ex: Rénovation du clocher de l'église"
                  className={`w-full px-6 py-5 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-orange-100 transition-all placeholder-gray-400 ${
                    errors.titre ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
                  }`}
                  required
                />
                <FileText className="absolute right-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              </div>
              {errors.titre && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {errors.titre}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-4">
              <label className="block text-xl font-bold text-gray-900">
                Description du projet *
              </label>
              <div className="relative">
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Décrivez votre projet, son importance pour la communauté, les travaux nécessaires..."
                  rows={5}
                  className={`w-full px-6 py-5 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-orange-100 transition-all resize-none placeholder-gray-400 ${
                    errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
                  }`}
                  required
                />
              </div>
              {errors.description && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Objectif */}
            <div className="space-y-4">
              <label className="block text-xl font-bold text-gray-900">
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
                  className={`w-full pl-16 pr-6 py-5 text-lg font-bold border-2 rounded-2xl focus:ring-4 focus:ring-orange-100 transition-all ${
                    errors.objectif ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
                  }`}
                  required
                />
                <span className="absolute right-6 top-1/2 transform -translate-y-1/2 text-lg font-bold text-gray-600">€</span>
              </div>
              {errors.objectif && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {errors.objectif}
                </p>
              )}
              
              {/* Suggestions de montants */}
              {!formData.objectif && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-3">Suggestions :</p>
                  <div className="flex flex-wrap gap-3">
                    {[5000, 10000, 25000, 50000, 100000].map((montant) => (
                      <button
                        key={montant}
                        type="button"
                        onClick={() => handleInputChange('objectif', montant.toString())}
                        className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-colors text-sm font-medium"
                      >
                        {montant.toLocaleString()}€
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Thématique */}
            <div className="space-y-4">
              <label className="block text-xl font-bold text-gray-900">
                Thématique du projet
              </label>
              <select
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                className="w-full px-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all"
              >
                {themes.map(theme => (
                  <option key={theme.id} value={theme.id}>{theme.label}</option>
                ))}
              </select>
            </div>

            {/* À la une */}
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
                    <Target className="w-5 h-5 mr-2 text-yellow-600" />
                    Mettre à la une
                  </span>
                  <p className="text-sm text-gray-600">
                    Le projet sera affiché sur la page d'accueil des dons
                  </p>
                </div>
              </label>
            </div>

            {/* Preview de l'objectif */}
            {formData.objectif && parseInt(formData.objectif) > 0 && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6">
                <h4 className="font-bold text-orange-900 mb-3 flex items-center">
                  <Target className="w-6 h-6 mr-3" />
                  Aperçu de l'objectif
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-orange-800">Objectif total :</span>
                    <span className="text-2xl font-bold text-orange-900">
                      {parseInt(formData.objectif).toLocaleString()}€
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full w-0 transition-all"></div>
                  </div>
                  <p className="text-sm text-orange-700">
                    La collecte démarrera à 0€ et sera mise à jour au fur et à mesure des dons
                  </p>
                </div>
              </div>
            )}

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Info className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 mb-2">Informations importantes</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• La collecte démarre à 0€ automatiquement</li>
                    <li>• Les montants collectés sont mis à jour en temps réel</li>
                    <li>• Les donateurs peuvent suivre l'avancement du projet</li>
                    <li>• Vous pouvez modifier le projet à tout moment</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 rounded-b-3xl">
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-100 hover:border-gray-400 transition-all font-medium disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !isFormValid}
              className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all transform hover:scale-105 shadow-lg disabled:transform-none flex items-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isEdit ? 'Modification...' : 'Création...'}
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <IconComponent className="w-5 h-5" />
                  <span>{isEdit ? 'Modifier le projet' : 'Créer le projet'}</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}