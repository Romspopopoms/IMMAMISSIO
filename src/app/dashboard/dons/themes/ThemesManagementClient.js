// ============================================================================
// FICHIER 2 : src/app/dashboard/dons/themes/ThemesManagementClient.js - Client sécurisé
// ============================================================================
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2, 
  Settings, 
  Heart, 
  Target, 
  Users, 
  Euro, 
  Gift, 
  Star,
  Church,
  Upload,
  X,
  Save,
  AlertTriangle,
  Eye,
  Move,
  CheckCircle
} from 'lucide-react'

export default function ThemesManagementClient({ initialThemes = [], user }) {
  const [themes, setThemes] = useState(initialThemes)
  const [saving, setSaving] = useState(false)
  const [editingTheme, setEditingTheme] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const [showNewThemeForm, setShowNewThemeForm] = useState(false)
  const [newTheme, setNewTheme] = useState({
    label: '',
    icon: 'Heart',
    image: ''
  })
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [reorderMode, setReorderMode] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const iconOptions = [
    { value: 'Heart', label: 'Cœur', component: Heart },
    { value: 'Church', label: 'Église', component: Church },
    { value: 'Target', label: 'Cible', component: Target },
    { value: 'Users', label: 'Utilisateurs', component: Users },
    { value: 'Euro', label: 'Euro', component: Euro },
    { value: 'Gift', label: 'Cadeau', component: Gift },
    { value: 'Star', label: 'Étoile', component: Star }
  ]

  const showSuccess = (message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 5000)
  }

  const handleImageUpload = (e, type = 'new') => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (type === 'new') {
          setNewTheme({ ...newTheme, image: reader.result })
        } else if (type === 'edit') {
          setEditingTheme({ ...editingTheme, image: reader.result })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const createTheme = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const themeId = newTheme.label.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      const themeData = {
        id: themeId,
        label: newTheme.label,
        icon: newTheme.icon,
        image: newTheme.image || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=300&fit=crop'
      }

      // ✅ Appel API sécurisé avec cookies
      const response = await fetch('/api/paroisse/config', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // ✅ Inclure les cookies d'auth
        body: JSON.stringify({
          configSite: {
            donThemes: [...themes, themeData]
          }
        })
      })

      if (response.ok) {
        // ✅ Mise à jour optimiste
        const newThemeWithStats = { 
          ...themeData, 
          nombreProjets: 0, 
          projetsConfig: 0,
          projetsDB: 0
        }
        setThemes([...themes, newThemeWithStats])
        setNewTheme({ label: '', icon: 'Heart', image: '' })
        setShowNewThemeForm(false)
        showSuccess('Thématique créée avec succès !')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur serveur')
      }
    } catch (error) {
      console.error('Erreur création thème:', error)
      alert(`Erreur lors de la création du thème: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const updateTheme = async (themeId) => {
    setSaving(true)

    try {
      const updatedThemes = themes.map(theme =>
        theme.id === themeId ? editingTheme : theme
      )

      // ✅ Appel API sécurisé avec cookies
      const response = await fetch('/api/paroisse/config', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // ✅ Inclure les cookies d'auth
        body: JSON.stringify({
          configSite: {
            donThemes: updatedThemes
          }
        })
      })

      if (response.ok) {
        // ✅ Mise à jour optimiste
        setThemes(updatedThemes)
        setEditingTheme(null)
        showSuccess('Thématique modifiée avec succès !')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur serveur')
      }
    } catch (error) {
      console.error('Erreur modification thème:', error)
      alert(`Erreur lors de la modification du thème: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const deleteTheme = async (themeId) => {
    setSaving(true)

    try {
      const updatedThemes = themes.filter(theme => theme.id !== themeId)

      // ✅ Appel API sécurisé avec cookies
      const response = await fetch('/api/paroisse/config', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // ✅ Inclure les cookies d'auth
        body: JSON.stringify({
          configSite: {
            donThemes: updatedThemes
          }
        })
      })

      if (response.ok) {
        // ✅ Mise à jour optimiste
        setThemes(updatedThemes)
        setShowDeleteModal(null)
        showSuccess('Thématique supprimée avec succès !')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur serveur')
      }
    } catch (error) {
      console.error('Erreur suppression thème:', error)
      alert(`Erreur lors de la suppression du thème: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      return
    }

    const newThemes = [...themes]
    const draggedTheme = newThemes[draggedIndex]
    
    // Supprimer l'élément de sa position actuelle
    newThemes.splice(draggedIndex, 1)
    
    // L'insérer à sa nouvelle position
    newThemes.splice(dropIndex, 0, draggedTheme)
    
    setThemes(newThemes)
    setDraggedIndex(null)
    
    // Sauvegarder automatiquement le nouvel ordre
    saveThemesOrder(newThemes)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const saveThemesOrder = async (newThemesOrder) => {
    try {
      // ✅ Appel API sécurisé avec cookies
      const response = await fetch('/api/paroisse/config', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // ✅ Inclure les cookies d'auth
        body: JSON.stringify({
          configSite: {
            donThemes: newThemesOrder
          }
        })
      })

      if (response.ok) {
        showSuccess('Ordre des thématiques sauvegardé !')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur sauvegarde ordre:', error)
      alert(`Erreur lors de la sauvegarde de l'ordre: ${error.message}`)
      // Recharger pour revenir à l'état serveur
      window.location.reload()
    }
  }

  const getIconComponent = (iconName) => {
    const iconOption = iconOptions.find(option => option.value === iconName)
    return iconOption ? iconOption.component : Heart
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Message de succès */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span className="font-medium">{successMessage}</span>
          <button 
            onClick={() => setSuccessMessage('')}
            className="ml-4 p-1 hover:bg-green-700 rounded"
          >
            ×
          </button>
        </div>
      )}

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
                Gestion des Thématiques
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user?.paroisse?.subdomain && (
                <Link
                  href={`/site/${user.paroisse.subdomain}/don`}
                  target="_blank"
                  className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Voir sur le site
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Settings className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Thématiques</span> de dons
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Organisez vos projets de collecte par thématiques pour une meilleure navigation
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mes thématiques</h2>
            <p className="text-gray-600">{themes.length} thématique(s) créée(s)</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {themes.length > 1 && (
              <button
                onClick={() => setReorderMode(!reorderMode)}
                className={`inline-flex items-center px-6 py-3 rounded-2xl transition-all font-semibold ${
                  reorderMode 
                    ? 'bg-orange-600 text-white hover:bg-orange-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Move className="w-5 h-5 mr-2" />
                {reorderMode ? 'Terminer' : 'Réorganiser'}
              </button>
            )}
            
            <button
              onClick={() => setShowNewThemeForm(true)}
              className="inline-flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle thématique
            </button>
          </div>
        </div>

        {/* Mode réorganisation - Instructions */}
        {reorderMode && themes.length > 1 && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-3xl p-6 mb-8">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mr-4">
                <Move className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-orange-900 mb-1">
                  Mode réorganisation activé
                </h3>
                <p className="text-orange-800">
                  Glissez-déposez les thématiques pour choisir leur ordre d'affichage sur votre site. 
                  L'ordre sera sauvegardé automatiquement.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Nouvelle thématique */}
        {showNewThemeForm && (
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Créer une nouvelle thématique</h3>
              <button
                onClick={() => {
                  setShowNewThemeForm(false)
                  setNewTheme({ label: '', icon: 'Heart', image: '' })
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={createTheme} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-3">
                    Nom de la thématique *
                  </label>
                  <input
                    type="text"
                    value={newTheme.label}
                    onChange={(e) => setNewTheme({ ...newTheme, label: e.target.value })}
                    placeholder="Ex: Aide humanitaire"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-3">
                    Icône
                  </label>
                  <select
                    value={newTheme.icon}
                    onChange={(e) => setNewTheme({ ...newTheme, icon: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all"
                  >
                    {iconOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  Image de fond (optionnelle)
                </label>
                {newTheme.image ? (
                  <div className="relative">
                    <img src={newTheme.image} alt="Aperçu" className="w-full h-32 object-cover rounded-xl" />
                    <button
                      type="button"
                      onClick={() => setNewTheme({ ...newTheme, image: '' })}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 hover:bg-purple-50 transition-all">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <span className="text-gray-600 font-medium">Ajouter une image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'new')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewThemeForm(false)
                    setNewTheme({ label: '', icon: 'Heart', image: '' })
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving || !newTheme.label}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Création...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Créer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des thématiques - Partie simplifiée pour garder la taille raisonnable */}
        {themes.length > 0 ? (
          <div className="grid gap-6">
            {themes.map((theme, index) => {
              const IconComponent = getIconComponent(theme.icon)
              const isEditing = editingTheme?.id === theme.id
              const isDragging = draggedIndex === index
              const isDropTarget = reorderMode && !isDragging
              const canDelete = theme.nombreProjets === 0

              return (
                <div 
                  key={theme.id} 
                  className={`bg-white rounded-3xl shadow-lg overflow-hidden transition-all duration-200 ${
                    isDragging ? 'opacity-50 scale-95' : ''
                  } ${
                    isDropTarget ? 'cursor-move' : ''
                  } ${
                    reorderMode && !isEditing ? 'hover:shadow-xl transform hover:scale-[1.02]' : ''
                  }`}
                  draggable={reorderMode && !isEditing}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  {reorderMode && !isEditing && (
                    <div className="bg-orange-100 px-6 py-2 flex items-center justify-between">
                      <div className="flex items-center text-orange-700">
                        <Move className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Position {index + 1}</span>
                      </div>
                      <span className="text-xs text-orange-600">Glissez pour déplacer</span>
                    </div>
                  )}
                  
                  {isEditing ? (
                    /* Mode édition */
                    <div className="p-8">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Modifier la thématique</h3>
                        <button
                          onClick={() => setEditingTheme(null)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-lg font-bold text-gray-900 mb-3">
                              Nom de la thématique
                            </label>
                            <input
                              type="text"
                              value={editingTheme?.label || ''}
                              onChange={(e) => setEditingTheme({ ...editingTheme, label: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-lg font-bold text-gray-900 mb-3">
                              Icône
                            </label>
                            <select
                              value={editingTheme?.icon || 'Heart'}
                              onChange={(e) => setEditingTheme({ ...editingTheme, icon: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all"
                            >
                              {iconOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                          <button
                            onClick={() => setEditingTheme(null)}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-medium"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={() => updateTheme(theme.id)}
                            disabled={saving}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 font-bold transition-all flex items-center"
                          >
                            {saving ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Sauvegarde...
                              </>
                            ) : (
                              <>
                                <Save className="w-5 h-5 mr-2" />
                                Sauvegarder
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Mode affichage */
                    <div className="flex">
                      {/* Image */}
                      <div 
                        className="w-48 h-32 bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center relative overflow-hidden"
                        style={theme.image ? { backgroundImage: `url(${theme.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                      >
                        <div className="absolute inset-0 bg-black/30"></div>
                        <IconComponent className="w-12 h-12 text-white relative z-10" />
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{theme.label}</h3>
                            <p className="text-gray-600 mb-4">
                              {theme.nombreProjets} projet(s) dans cette thématique
                              {theme.projetsDB > 0 && theme.projetsConfig > 0 && (
                                <span className="text-sm text-gray-500 block">
                                  ({theme.projetsDB} en base, {theme.projetsConfig} en config)
                                </span>
                              )}
                            </p>
                            
                            {theme.nombreProjets > 0 && user?.paroisse?.subdomain && (
                              <Link
                                href={`/site/${user.paroisse.subdomain}/don/${theme.id}`}
                                target="_blank"
                                className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                <span>Voir les projets sur le site</span>
                              </Link>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {!reorderMode && (
                              <>
                                <button
                                  onClick={() => setEditingTheme(theme)}
                                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                  title="Modifier"
                                >
                                  <Edit3 className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => setShowDeleteModal(theme)}
                                  className={`p-2 transition-colors ${
                                    canDelete 
                                      ? 'text-gray-400 hover:text-red-600' 
                                      : 'text-gray-300 cursor-not-allowed'
                                  }`}
                                  title={canDelete ? "Supprimer" : "Impossible de supprimer - contient des projets"}
                                  disabled={!canDelete}
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            {reorderMode && (
                              <div className="flex items-center text-orange-600">
                                <Move className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                        </div>

                        {!canDelete && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-orange-600 flex items-center">
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Cette thématique contient des projets et ne peut pas être supprimée
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Settings className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune thématique</h3>
            <p className="text-gray-600 mb-6">
              Créez votre première thématique pour organiser vos projets de collecte
            </p>
            <button
              onClick={() => setShowNewThemeForm(true)}
              className="inline-flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Créer ma première thématique
            </button>
          </div>
        )}

        {/* Modal de suppression */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Supprimer la thématique
                </h3>
                <p className="text-gray-600 mb-8">
                  Êtes-vous sûr de vouloir supprimer la thématique <strong>"{showDeleteModal.label}"</strong> ?
                  Cette action est irréversible.
                </p>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => deleteTheme(showDeleteModal.id)}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-bold transition-all flex items-center justify-center"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5 mr-2" />
                        Supprimer
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