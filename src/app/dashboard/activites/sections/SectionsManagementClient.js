// ============================================================================
// src/app/dashboard/activites/sections/SectionsManagementClient.js - Design moderne complet
// ============================================================================
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Plus, Search, Edit3, Trash2, Settings, 
  Activity, Building, CheckCircle, AlertTriangle, Eye, ExternalLink,
  Baby, Book, GraduationCap, UserCheck, Music, Wrench, HandHeart,
  Palette, Type, FileImage, X, TrendingUp, MoreVertical, Filter
} from 'lucide-react'

// Icônes disponibles pour les sections
const availableIcons = {
  jeunesse: { icon: Baby, label: 'Jeunesse' },
  catechese: { icon: Book, label: 'Catéchèse' },
  etudiant: { icon: GraduationCap, label: 'Étudiants' },
  adultes: { icon: UserCheck, label: 'Adultes' },
  musique: { icon: Music, label: 'Musique' },
  ateliers: { icon: Wrench, label: 'Ateliers' },
  solidarite: { icon: HandHeart, label: 'Solidarité' }
}

// Couleurs prédéfinies
const predefinedColors = [
  '#3B82F6', '#8B5CF6', '#EF4444', '#10B981', 
  '#F59E0B', '#6366F1', '#EC4899', '#14B8A6',
  '#F97316', '#84CC16', '#6B7280', '#06B6D4'
]

export default function SectionsManagementClient({ user, initialData }) {
  const router = useRouter()
  
  // ✅ États pour les données
  const [sections, setSections] = useState(initialData.sections || [])
  const [stats] = useState(initialData.stats || {})
  
  // ✅ États UI
  const [loading, setLoading] = useState(false)
  const [loadingSections, setLoadingSections] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSections, setSelectedSections] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  
  // ✅ États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedSection, setSelectedSection] = useState(null)
  const [itemToDelete, setItemToDelete] = useState(null)
  
  // ✅ États pour le formulaire
  const [formData, setFormData] = useState({
    nom: '',
    titre: '',
    description: '',
    couleur: predefinedColors[0],
    icone: 'jeunesse',
    image: '',
    ordre: 0
  })

  // ✅ Messages de feedback
  const showMessage = (text, type) => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => setMessage(''), 5000)
  }

  // ✅ Déconnexion
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

  // ✅ Recharger les données
  const reloadData = async () => {
    try {
      setLoadingSections(true)
      const response = await fetch('/api/sections', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setSections(data.sections || [])
      }
    } catch (error) {
      console.error('Erreur rechargement:', error)
    } finally {
      setLoadingSections(false)
    }
  }

  // ✅ Filtrage des sections
  const filteredSections = sections.filter(section => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      section.titre.toLowerCase().includes(searchLower) ||
      section.nom.toLowerCase().includes(searchLower) ||
      section.description?.toLowerCase().includes(searchLower)
    )
  })

  // ✅ Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      nom: '',
      titre: '',
      description: '',
      couleur: predefinedColors[0],
      icone: 'jeunesse',
      image: '',
      ordre: sections.length
    })
  }

  // ✅ Ouvrir le modal de création
  const openCreateModal = () => {
    resetForm()
    setSelectedSection(null)
    setShowCreateModal(true)
  }

  // ✅ Ouvrir le modal d'édition
  const openEditModal = (section) => {
    setFormData({
      nom: section.nom || '',
      titre: section.titre || '',
      description: section.description || '',
      couleur: section.couleur || predefinedColors[0],
      icone: section.icone || 'jeunesse',
      image: section.image || '',
      ordre: section.ordre || 0
    })
    setSelectedSection(section)
    setShowEditModal(true)
  }

  // ✅ Ouvrir le modal de suppression
  const openDeleteModal = (section) => {
    setItemToDelete(section)
    setShowDeleteModal(true)
  }

  // ✅ Créer une section
  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        showMessage('Section créée avec succès !', 'success')
        setShowCreateModal(false)
        resetForm()
        reloadData()
      } else {
        showMessage(data.error || 'Erreur lors de la création', 'error')
      }
    } catch (error) {
      console.error('Erreur création:', error)
      showMessage('Erreur de connexion', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Modifier une section
  const handleEdit = async (e) => {
    e.preventDefault()
    if (!selectedSection) return
    
    setLoading(true)

    try {
      const response = await fetch(`/api/sections/${selectedSection.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        showMessage('Section modifiée avec succès !', 'success')
        setShowEditModal(false)
        setSelectedSection(null)
        resetForm()
        reloadData()
      } else {
        showMessage(data.error || 'Erreur lors de la modification', 'error')
      }
    } catch (error) {
      console.error('Erreur modification:', error)
      showMessage('Erreur de connexion', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Supprimer une section
  const handleDelete = async () => {
    if (!itemToDelete) return
    
    setLoading(true)

    try {
      const response = await fetch(`/api/sections/${itemToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        showMessage('Section supprimée avec succès !', 'success')
        setShowDeleteModal(false)
        setItemToDelete(null)
        reloadData()
      } else {
        showMessage(data.error || 'Erreur lors de la suppression', 'error')
      }
    } catch (error) {
      console.error('Erreur suppression:', error)
      showMessage('Erreur de connexion', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Sélection en masse
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedSections(filteredSections.map(s => s.id))
    } else {
      setSelectedSections([])
    }
  }

  const handleSelectItem = (id, checked) => {
    if (checked) {
      setSelectedSections([...selectedSections, id])
    } else {
      setSelectedSections(selectedSections.filter(i => i !== id))
    }
  }

  // ✅ Actions groupées
  const handleBulkAction = async () => {
    if (!bulkAction || selectedSections.length === 0) return

    if (bulkAction === 'delete') {
      if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedSections.length} section(s) ?`)) {
        try {
          await Promise.all(
            selectedSections.map(id => 
              fetch(`/api/sections/${id}`, {
                method: 'DELETE',
                credentials: 'include'
              })
            )
          )
          setSections(sections.filter(s => !selectedSections.includes(s.id)))
          setSelectedSections([])
          setBulkAction('')
          showMessage('Sections supprimées avec succès !', 'success')
        } catch (error) {
          console.error('Erreur lors de la suppression en masse:', error)
          showMessage('Erreur lors de la suppression', 'error')
        }
      }
    }
  }

  // ✅ Générer automatiquement le nom technique
  const generateNomFromTitre = (titre) => {
    return titre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9]/g, '') // Garder seulement lettres et chiffres
      .substring(0, 20)
  }

  // ✅ Obtenir l'icône d'une section
  const getSectionIcon = (iconName) => {
    const iconData = availableIcons[iconName] || availableIcons.jeunesse
    return iconData.icon
  }

  const canWrite = user && ['PAROISSE_ADMIN', 'SUPER_ADMIN'].includes(user.role)

  // ✅ Stats pour l'affichage
  const statsCards = [
    {
      title: 'Total sections',
      value: stats.totalSections?.toString() || '0',
      icon: Building,
      change: 'Catégories créées',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Avec activités',
      value: stats.sectionsAvecActivites?.toString() || '0',
      icon: CheckCircle,
      change: 'Sections configurées',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Sans activités',
      value: stats.sectionsSansActivites?.toString() || '0',
      icon: AlertTriangle,
      change: 'À compléter',
      gradient: 'from-orange-500 to-red-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link
                href="/dashboard/activites"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Gestion des Sections
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href={`/site/${user?.paroisse?.subdomain}/activites`}
                target="_blank"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Voir sur le site
              </Link>
              
              {canWrite && (
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nouvelle section
                </button>
              )}

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

      {/* Message de feedback */}
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
            <Building className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Gestion des <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Sections</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Organisez les catégories d'activités de votre paroisse (jeunesse, catéchèse, musique, etc.)
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {statsCards.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div key={index} className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
                </div>
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                    {stat.value}
                  </p>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {stat.change}
                </p>
              </div>
            )
          })}
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Mes sections</h2>
              <p className="text-gray-600">Gérez vos catégories d'activités</p>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              {selectedSections.length > 0 && canWrite && (
                <div className="flex items-center space-x-2">
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  >
                    <option value="">Actions groupées ({selectedSections.length})</option>
                    <option value="delete">Supprimer</option>
                  </select>
                  <button
                    onClick={handleBulkAction}
                    disabled={!bulkAction}
                    className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                  >
                    Appliquer
                  </button>
                </div>
              )}
              
              {canWrite && (
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nouvelle section
                </button>
              )}
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="relative max-w-md mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une section..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Liste des sections */}
          {loadingSections ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des sections...</p>
            </div>
          ) : filteredSections.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchTerm ? 'Aucune section trouvée' : 'Aucune section créée'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Essayez de modifier votre recherche'
                  : 'Commencez par créer votre première section d\'activités'
                }
              </p>
              {!searchTerm && canWrite && (
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Créer la première section
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Header avec sélection */}
              {filteredSections.length > 0 && canWrite && (
                <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-2xl">
                  <input
                    type="checkbox"
                    checked={selectedSections.length === filteredSections.length && filteredSections.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="mr-4 w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600 font-medium">
                    {selectedSections.length > 0 
                      ? `${selectedSections.length} section(s) sélectionnée(s)`
                      : 'Tout sélectionner'
                    }
                  </span>
                </div>
              )}

              {/* Grid des sections */}
              <div className="grid gap-6">
                {filteredSections.map((section) => {
                  const IconComponent = getSectionIcon(section.icone)
                  
                  return (
                    <div key={section.id} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 hover:shadow-lg transition-all">
                      <div className="flex items-center space-x-6">
                        {/* Checkbox */}
                        {canWrite && (
                          <input
                            type="checkbox"
                            checked={selectedSections.includes(section.id)}
                            onChange={(e) => handleSelectItem(section.id, e.target.checked)}
                            className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        )}

                        {/* Icône et couleur */}
                        <div 
                          className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: section.couleur || '#6B7280' }}
                        >
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        
                        {/* Contenu */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{section.titre}</h3>
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm font-medium">
                              {section.nom}
                            </span>
                          </div>
                          
                          {section.description && (
                            <p className="text-gray-600 mb-2">{section.description}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Activity className="w-4 h-4 mr-1" />
                              {section.activites?.length || 0} activité{(section.activites?.length || 0) > 1 ? 's' : ''}
                            </span>
                            <span className="flex items-center">
                              <Building className="w-4 h-4 mr-1" />
                              Ordre: {section.ordre}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        {canWrite && (
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/site/${user?.paroisse?.subdomain}/activites/${section.nom}`}
                              target="_blank"
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Voir la page publique"
                            >
                              <Eye className="w-5 h-5" />
                            </Link>
                            
                            <button
                              onClick={() => openEditModal(section)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Modifier"
                            >
                              <Edit3 className="w-5 h-5" />
                            </button>
                            
                            <button
                              onClick={() => openDeleteModal(section)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Modal Création/Édition moderne */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
              
              {/* Header du modal */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-8 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                      <Building className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">
                        {showCreateModal ? 'Nouvelle Section' : 'Modifier la Section'}
                      </h2>
                      <p className="text-blue-100 mt-1">
                        {showCreateModal 
                          ? 'Créez une nouvelle catégorie d\'activités'
                          : 'Modifiez les informations de cette section'
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateModal(false)
                      setShowEditModal(false)
                      resetForm()
                    }}
                    className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Contenu du modal */}
              <div className="max-h-[75vh] overflow-y-auto">
                <form onSubmit={showCreateModal ? handleCreate : handleEdit} className="p-8">
                  
                  {/* Hero Section du formulaire */}
                  <div className="text-center mb-8">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: formData.couleur }}
                    >
                      {React.createElement(getSectionIcon(formData.icone), {
                        className: "w-8 h-8 text-white"
                      })}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Configuration de la section
                    </h3>
                    <p className="text-gray-600">
                      Définissez les caractéristiques de votre catégorie d'activités
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Colonne gauche - Informations principales */}
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <Type className="w-5 h-5 mr-2 text-blue-600" />
                          Informations principales
                        </h4>
                        
                        {/* Titre */}
                        <div className="mb-6">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Titre de la section *
                          </label>
                          <input
                            type="text"
                            value={formData.titre}
                            onChange={(e) => {
                              const titre = e.target.value
                              setFormData({
                                ...formData,
                                titre,
                                nom: generateNomFromTitre(titre)
                              })
                            }}
                            className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg font-medium"
                            placeholder="Ex: Jeunesse, Catéchèse, Musique..."
                            required
                          />
                        </div>

                        {/* Nom technique */}
                        <div className="mb-6">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Nom technique (généré automatiquement)
                          </label>
                          <input
                            type="text"
                            value={formData.nom}
                            onChange={(e) => setFormData({...formData, nom: e.target.value})}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-gray-50"
                            placeholder="Ex: jeunesse, catechese..."
                            required
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            Utilisé dans l'URL : /activites/{formData.nom}
                          </p>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description (optionnel)
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none"
                            placeholder="Description de cette section..."
                            rows="3"
                          />
                        </div>
                      </div>

                      {/* Ordre */}
                      <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <Building className="w-5 h-5 mr-2 text-gray-600" />
                          Paramètres d'affichage
                        </h4>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Ordre d'affichage
                          </label>
                          <input
                            type="number"
                            value={formData.ordre}
                            onChange={(e) => setFormData({...formData, ordre: parseInt(e.target.value) || 0})}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-gray-100 focus:border-gray-500 transition-all"
                            min="0"
                          />
                          <p className="text-sm text-gray-500 mt-2">
                            Plus le nombre est petit, plus la section apparaîtra en premier
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Colonne droite - Personnalisation */}
                    <div className="space-y-6">
                      
                      {/* Icône */}
                      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <Activity className="w-5 h-5 mr-2 text-green-600" />
                          Icône de la section
                        </h4>
                        
                        <div className="grid grid-cols-4 gap-3">
                          {Object.entries(availableIcons).map(([key, iconData]) => {
                            const IconComponent = iconData.icon
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => setFormData({...formData, icone: key})}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center hover:scale-105 ${
                                  formData.icone === key
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <IconComponent className="w-6 h-6 mb-1" />
                                <span className="text-xs font-medium">{iconData.label}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Couleur */}
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <Palette className="w-5 h-5 mr-2 text-orange-600" />
                          Couleur de la section
                        </h4>
                        
                        <div className="flex flex-wrap gap-3 mb-4">
                          {predefinedColors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setFormData({...formData, couleur: color})}
                              className={`w-12 h-12 rounded-xl transition-all hover:scale-110 ${
                                formData.couleur === color 
                                  ? 'ring-4 ring-blue-200 scale-110' 
                                  : ''
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Couleur personnalisée
                          </label>
                          <input
                            type="color"
                            value={formData.couleur}
                            onChange={(e) => setFormData({...formData, couleur: e.target.value})}
                            className="w-full h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Image */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <FileImage className="w-5 h-5 mr-2 text-purple-600" />
                          Image d'en-tête (optionnel)
                        </h4>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            URL de l'image
                          </label>
                          <input
                            type="url"
                            value={formData.image}
                            onChange={(e) => setFormData({...formData, image: e.target.value})}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all"
                            placeholder="https://exemple.com/image.jpg"
                          />
                          <p className="text-sm text-gray-500 mt-2">
                            Image utilisée en en-tête de la page de cette section
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Aperçu */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <Eye className="w-5 h-5 mr-2 text-blue-600" />
                      Aperçu de la section
                    </h4>
                    
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: formData.couleur }}
                        >
                          {React.createElement(getSectionIcon(formData.icone), {
                            className: "w-6 h-6 text-white"
                          })}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-gray-900 mb-1">
                            {formData.titre || 'Titre de la section'}
                          </h5>
                          {formData.description && (
                            <p className="text-gray-600 text-sm mb-2">
                              {formData.description.substring(0, 100)}
                              {formData.description.length > 100 && '...'}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>URL: /activites/{formData.nom}</span>
                            <span>•</span>
                            <span>Ordre: {formData.ordre}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer avec boutons */}
              <div className="bg-gray-50 px-8 py-6 flex justify-between items-center border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  * Champs obligatoires
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setShowEditModal(false)
                      resetForm()
                    }}
                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-100 hover:border-gray-400 font-medium transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={showCreateModal ? handleCreate : handleEdit}
                    disabled={loading || !formData.titre || !formData.nom}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all transform hover:scale-105 shadow-lg disabled:transform-none flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        {showCreateModal ? 'Création...' : 'Modification...'}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        {showCreateModal ? 'Créer la section' : 'Modifier la section'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de suppression */}
        {showDeleteModal && itemToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Supprimer la section
                </h3>
                <p className="text-gray-600 mb-2">
                  Êtes-vous sûr de vouloir supprimer la section <strong>"{itemToDelete.titre}"</strong> ?
                </p>
                {itemToDelete.activites?.length > 0 && (
                  <div className="mt-4 p-4 bg-red-50 rounded-xl mb-6">
                    <p className="text-red-700 text-sm">
                      ⚠️ Cette section contient {itemToDelete.activites.length} activité{itemToDelete.activites.length > 1 ? 's' : ''}. 
                      Elles seront également supprimées.
                    </p>
                  </div>
                )}
                <p className="text-red-600 text-sm mb-8">
                  Cette action est irréversible.
                </p>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false)
                      setItemToDelete(null)
                    }}
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