// ============================================================================
// src/components/ModalAddSecteur.js - Version corrigée
// ============================================================================
'use client'
import { useState, useEffect } from 'react'
import { X, Shield, Info, Plus, Loader, Palette, Music, Heart, MessageCircle, Users, Book, Lightbulb } from 'lucide-react'

export default function ModalAddSecteur({ 
  isOpen, 
  onClose, 
  onSuccess,
  editingSecteur = null,
  user // ✅ Reçu en prop au lieu d'utiliser useAuth()
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    couleur: '#6B7280',
    icone: 'Users',
    ordre: 0
  })

  // Mode édition : pré-remplir le formulaire
  useEffect(() => {
    if (editingSecteur) {
      setFormData({
        nom: editingSecteur.nom || '',
        description: editingSecteur.description || '',
        couleur: editingSecteur.couleur || '#6B7280',
        icone: editingSecteur.icone || 'Users',
        ordre: editingSecteur.ordre || 0
      })
    }
  }, [editingSecteur])

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

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // ✅ Utiliser le nouveau système d'auth avec cookies
      let response
      
      if (editingSecteur) {
        // Mode édition
        response = await fetch(`/api/secteurs/${editingSecteur.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include', // ✅ Utiliser les cookies au lieu du token
          body: JSON.stringify(formData)
        })
      } else {
        // Mode création
        response = await fetch('/api/secteurs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include', // ✅ Utiliser les cookies au lieu du token
          body: JSON.stringify(formData)
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erreur ${response.status}`)
      }

      const result = await response.json()
      onSuccess?.(result.secteur)
      handleClose()
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      nom: '',
      description: '',
      couleur: '#6B7280',
      icone: 'Users',
      ordre: 0
    })
    setError('')
    setLoading(false)
    onClose()
  }

  const secteursTypes = [
    { nom: 'Liturgie et musique', couleur: '#7C3AED', icone: 'Music' },
    { nom: 'Catéchèse', couleur: '#2563EB', icone: 'Book' },
    { nom: 'Charité et solidarité', couleur: '#DC2626', icone: 'Heart' },
    { nom: 'Communication', couleur: '#EA580C', icone: 'MessageCircle' },
    { nom: 'Animation jeunesse', couleur: '#16A34A', icone: 'Users' },
    { nom: 'Formation', couleur: '#7C2D12', icone: 'Lightbulb' }
  ]

  const iconesDisponibles = [
    { name: 'Users', component: Users, label: 'Personnes' },
    { name: 'Music', component: Music, label: 'Musique' },
    { name: 'Book', component: Book, label: 'Livre' },
    { name: 'Heart', component: Heart, label: 'Cœur' },
    { name: 'MessageCircle', component: MessageCircle, label: 'Communication' },
    { name: 'Lightbulb', component: Lightbulb, label: 'Idée' },
    { name: 'Shield', component: Shield, label: 'Bouclier' }
  ]

  const couleursDisponibles = [
    '#7C3AED', '#2563EB', '#DC2626', '#EA580C', 
    '#16A34A', '#7C2D12', '#9333EA', '#0EA5E9',
    '#EF4444', '#F59E0B', '#10B981', '#8B5CF6'
  ]

  const selectSecteurType = (secteur) => {
    setFormData({
      ...formData,
      nom: secteur.nom,
      couleur: secteur.couleur,
      icone: secteur.icone
    })
  }

  const getIconComponent = (iconName) => {
    const icon = iconesDisponibles.find(i => i.name === iconName)
    return icon ? icon.component : Users
  }

  const IconComponent = getIconComponent(formData.icone)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {editingSecteur ? 'Modifier' : 'Nouveau'} Secteur
                </h2>
                <p className="text-white/80 text-sm">
                  {editingSecteur ? 'Modifier les informations du secteur' : 'Définir un domaine d\'activité'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 transform hover:scale-105"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          
          {/* Secteurs prédéfinis */}
          {!editingSecteur && (
            <div className="space-y-3">
              <label className="block text-lg font-bold text-gray-900">
                Secteurs courants
              </label>
              <p className="text-gray-600 mb-4">
                Cliquez sur un secteur pour pré-remplir le formulaire, ou créez le vôtre
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {secteursTypes.map((secteur, index) => {
                  const IconSecteur = getIconComponent(secteur.icone)
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectSecteurType(secteur)}
                      className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-left border border-gray-200 hover:border-orange-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: secteur.couleur + '20' }}
                        >
                          <IconSecteur 
                            className="w-5 h-5" 
                            style={{ color: secteur.couleur }}
                          />
                        </div>
                        <span className="font-medium text-gray-900">{secteur.nom}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Nom du secteur */}
          <div className="space-y-3">
            <label className="block text-lg font-bold text-gray-900">
              Nom du secteur <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="ex: Animation liturgique, Jeunesse, Formation..."
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 text-lg placeholder-gray-400"
                autoFocus
                required
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Shield className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label className="block text-lg font-bold text-gray-900">
              Description
              <span className="text-sm font-normal text-gray-500 ml-2">(optionnelle)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Activités et missions de ce secteur..."
              rows={3}
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 text-lg placeholder-gray-400 resize-none"
            />
          </div>

          {/* Couleur */}
          <div className="space-y-3">
            <label className="block text-lg font-bold text-gray-900">
              Couleur du secteur
            </label>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-16 h-16 rounded-2xl border-2 border-gray-200 flex items-center justify-center"
                  style={{ backgroundColor: formData.couleur }}
                >
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <input
                  type="color"
                  value={formData.couleur}
                  onChange={(e) => setFormData({ ...formData, couleur: e.target.value })}
                  className="w-20 h-12 border-2 border-gray-200 rounded-xl cursor-pointer"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={formData.couleur}
                    onChange={(e) => setFormData({ ...formData, couleur: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all font-mono"
                    placeholder="#6B7280"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-6 gap-2">
                {couleursDisponibles.map(couleur => (
                  <button
                    key={couleur}
                    type="button"
                    onClick={() => setFormData({ ...formData, couleur })}
                    className={`w-full h-12 rounded-xl transition-all transform hover:scale-110 ${
                      formData.couleur === couleur ? 'ring-4 ring-orange-200' : ''
                    }`}
                    style={{ backgroundColor: couleur }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Icône */}
          <div className="space-y-3">
            <label className="block text-lg font-bold text-gray-900">
              Icône du secteur
            </label>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
              {iconesDisponibles.map(icone => {
                const IconeComponent = icone.component
                return (
                  <button
                    key={icone.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, icone: icone.name })}
                    className={`p-4 rounded-xl transition-all transform hover:scale-110 ${
                      formData.icone === icone.name 
                        ? 'bg-orange-100 border-2 border-orange-400' 
                        : 'bg-gray-100 border-2 border-gray-200 hover:border-orange-200'
                    }`}
                    title={icone.label}
                  >
                    <IconeComponent 
                      className={`w-6 h-6 mx-auto ${
                        formData.icone === icone.name ? 'text-orange-600' : 'text-gray-600'
                      }`} 
                    />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Ordre d'affichage */}
          <div className="space-y-3">
            <label className="block text-lg font-bold text-gray-900">
              Ordre d'affichage
            </label>
            <input
              type="number"
              value={formData.ordre}
              onChange={(e) => setFormData({ ...formData, ordre: parseInt(e.target.value) || 0 })}
              min="0"
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 text-lg"
              placeholder="0"
            />
            <p className="text-sm text-gray-500">
              Ordre d'affichage sur la page (0 = premier)
            </p>
          </div>

          {/* Preview */}
          {formData.nom.trim() && (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <Plus className="w-4 h-4 text-green-600" />
                </div>
                Aperçu
              </h4>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center space-x-3 mb-2">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: formData.couleur }}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h5 className="font-bold text-lg text-gray-900">{formData.nom}</h5>
                </div>
                {formData.description.trim() && (
                  <p className="text-gray-600 mb-3">{formData.description}</p>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-1" />
                  <span>Aucun responsable désigné</span>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 rounded-b-3xl">
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleClose}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 font-medium"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.nom.trim() || loading}
              className="px-8 py-3 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              <div className="flex items-center space-x-2">
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                <span>
                  {loading 
                    ? 'Sauvegarde...' 
                    : editingSecteur 
                      ? 'Modifier le secteur'
                      : 'Créer le secteur'
                  }
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}