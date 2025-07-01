// ============================================================================
// src/components/ModalAddConseil.js - Version corrigée avec conseils prédéfinis
// ============================================================================
'use client'
import { useState, useEffect } from 'react'
import { X, Building, Info, Plus, Loader, Users } from 'lucide-react'

export default function ModalAddConseil({ 
  isOpen, 
  onClose, 
  onSuccess,
  editingConseil = null,
  user // ✅ Reçu en prop au lieu d'utiliser useAuth()
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    type: 'custom',
    ordre: 0
  })

  // Mode édition : pré-remplir le formulaire
  useEffect(() => {
    if (editingConseil) {
      setFormData({
        nom: editingConseil.nom || '',
        description: editingConseil.description || '',
        type: editingConseil.type || 'custom',
        ordre: editingConseil.ordre || 0
      })
    }
  }, [editingConseil])

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
      let response
      
      if (editingConseil) {
        // Mode édition
        response = await fetch(`/api/conseils/${editingConseil.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(formData)
        })
      } else {
        // Mode création
        response = await fetch('/api/conseils', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(formData)
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erreur ${response.status}`)
      }

      const result = await response.json()
      onSuccess?.(result.conseil)
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
      type: 'custom',
      ordre: 0
    })
    setError('')
    setLoading(false)
    onClose()
  }

  // ✅ Conseils prédéfinis avec leurs informations complètes
  const conseilsPredéfinis = [
    {
      nom: 'Conseil économique',
      type: 'economique',
      description: 'Gestion des finances, du patrimoine et des aspects administratifs de la paroisse.',
      icon: '💰'
    },
    {
      nom: 'Conseil pastoral',
      type: 'pastoral', 
      description: 'Accompagne la mission pastorale et propose des orientations spirituelles.',
      icon: '⛪'
    },
    {
      nom: 'Conseil pour la famille',
      type: 'custom',
      description: 'Animation pastorale des familles, préparation au mariage et accompagnement.',
      icon: '👨‍👩‍👧‍👦'
    },
    {
      nom: 'Conseil des jeunes',
      type: 'custom',
      description: 'Animation de la pastorale des jeunes et organisation d\'activités.',
      icon: '🎯'
    },
    {
      nom: 'Conseil liturgique',
      type: 'custom',
      description: 'Organisation des célébrations liturgiques et formation des servants.',
      icon: '📿'
    },
    {
      nom: 'Conseil œcuménique',
      type: 'custom',
      description: 'Relations avec les autres confessions chrétiennes et dialogue interreligieux.',
      icon: '🤝'
    }
  ]

  // ✅ Fonction pour sélectionner un conseil prédéfini
  const selectConseilPredéfini = (conseil) => {
    setFormData({
      nom: conseil.nom,
      type: conseil.type,
      description: conseil.description,
      ordre: 0
    })
  }

  const typesConseils = [
    { value: 'economique', label: 'Conseil économique', description: 'Gestion financière et administrative' },
    { value: 'pastoral', label: 'Conseil pastoral', description: 'Animation pastorale et spirituelle' },
    { value: 'custom', label: 'Conseil personnalisé', description: 'Autre type de conseil' }
  ]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Building className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {editingConseil ? 'Modifier' : 'Nouveau'} Conseil
                </h2>
                <p className="text-white/80 text-sm">
                  {editingConseil ? 'Modifier les informations du conseil' : 'Créer un organe consultatif'}
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
          
          {/* Conseils prédéfinis - seulement en mode création */}
          {!editingConseil && (
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-2">
                  Conseils courants
                </label>
                <p className="text-gray-600 mb-4">
                  Cliquez sur un conseil pour pré-remplir le formulaire, ou créez le vôtre
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {conseilsPredéfinis.map((conseil, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectConseilPredéfini(conseil)}
                    className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 rounded-2xl transition-all text-left border-2 border-purple-200 hover:border-purple-400 transform hover:scale-105"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl flex-shrink-0">
                        {conseil.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 mb-1 text-sm">
                          {conseil.nom}
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {conseil.description.slice(0, 80)}...
                        </p>
                        <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                          conseil.type === 'economique' ? 'bg-green-100 text-green-700' :
                          conseil.type === 'pastoral' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {typesConseils.find(t => t.value === conseil.type)?.label}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Séparateur */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">
                    ou personnalisez votre conseil
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Nom du conseil */}
          <div className="space-y-3">
            <label className="block text-lg font-bold text-gray-900">
              Nom du conseil <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="ex: Conseil des jeunes, Conseil pour l'économie solidaire..."
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-lg placeholder-gray-400"
                autoFocus={editingConseil} // Auto-focus seulement en mode édition
                required
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Building className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Type de conseil */}
          <div className="space-y-3">
            <label className="block text-lg font-bold text-gray-900">
              Type de conseil
            </label>
            <div className="grid gap-4">
              {typesConseils.map(type => (
                <label 
                  key={type.value}
                  className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                    formData.type === type.value 
                      ? 'border-purple-400 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-200 hover:bg-purple-25'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={formData.type === type.value}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-5 h-5 text-purple-600"
                    />
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-gray-900">{type.label}</div>
                      <div className="text-sm text-gray-600">{type.description}</div>
                    </div>
                  </div>
                </label>
              ))}
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
              placeholder="Mission et rôle de ce conseil dans la paroisse..."
              rows={4}
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-lg placeholder-gray-400 resize-none"
            />
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
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-lg"
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
                  <Building className="w-6 h-6 text-purple-600" />
                  <h5 className="font-bold text-lg text-gray-900">{formData.nom}</h5>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    formData.type === 'economique' ? 'bg-green-100 text-green-700' :
                    formData.type === 'pastoral' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {typesConseils.find(t => t.value === formData.type)?.label}
                  </span>
                </div>
                {formData.description.trim() && (
                  <p className="text-gray-600 mb-3">{formData.description}</p>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-1" />
                  <span>Aucun membre pour le moment</span>
                </div>
              </div>
            </div>
          )}

          {/* Info box */}
          <div className="rounded-2xl p-6 border-l-4 bg-purple-50 border-purple-400">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Info className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-2 text-purple-900">
                  À propos des conseils
                </h4>
                <p className="leading-relaxed text-purple-800">
                  Les conseils sont des organes consultatifs qui participent à la vie de la paroisse. 
                  Ils accompagnent le curé dans sa mission et proposent des initiatives. 
                  Vous pourrez ensuite y ajouter des membres avec leurs fonctions spécifiques.
                </p>
              </div>
            </div>
          </div>
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
              className="px-8 py-3 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
                    : editingConseil 
                      ? 'Modifier le conseil'
                      : 'Créer le conseil'
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