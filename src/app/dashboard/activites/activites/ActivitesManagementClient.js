// ============================================================================
// src/app/dashboard/activites/activites/ActivitesManagementClient.js - Design moderne
// ============================================================================
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, Plus, Search, Edit3, Trash2, Settings, Activity, 
  Clock, MapPin, Users, UserCheck, CheckCircle, AlertTriangle, 
  Eye, ExternalLink, Filter, Calendar, Phone, Upload,
  Baby, Book, GraduationCap, Music, Wrench, HandHeart,
  X, FileImage, Type, Hash, TrendingUp, MoreVertical
} from 'lucide-react'

// Icônes pour les sections
const sectionIcons = {
  jeunesse: Baby,
  catechese: Book,
  etudiant: GraduationCap,
  adultes: UserCheck,
  musique: Music,
  ateliers: Wrench,
  solidarite: HandHeart
}

export default function ActivitesManagementClient({ user, initialData }) {
  const router = useRouter()
  
  // ✅ États pour les données
  const [activites, setActivites] = useState(initialData.activites || [])
  const [sections] = useState(initialData.sections || [])
  const [stats] = useState(initialData.stats || {})
  
  // ✅ États UI
  const [loading, setLoading] = useState(false)
  const [loadingActivites, setLoadingActivites] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSection, setFilterSection] = useState('all')
  const [selectedActivites, setSelectedActivites] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  
  // ✅ États pour les modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedActivite, setSelectedActivite] = useState(null)
  const [itemToDelete, setItemToDelete] = useState(null)
  
  // ✅ États pour le formulaire
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    sectionId: '',
    horaires: '',
    lieu: '',
    ageMin: '',
    ageMax: '',
    contact: '',
    responsable: '',
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
      setLoadingActivites(true)
      const response = await fetch('/api/activites', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setActivites(data.activites || [])
      }
    } catch (error) {
      console.error('Erreur rechargement:', error)
    } finally {
      setLoadingActivites(false)
    }
  }

  // ✅ Filtrage des activités
  const filteredActivites = activites.filter(activite => {
    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      if (
        !activite.titre.toLowerCase().includes(searchLower) &&
        !activite.description?.toLowerCase().includes(searchLower) &&
        !activite.responsable?.toLowerCase().includes(searchLower) &&
        !activite.section?.titre.toLowerCase().includes(searchLower)
      ) {
        return false
      }
    }

    // Filtre par section
    if (filterSection !== 'all' && activite.section?.nom !== filterSection) {
      return false
    }

    return true
  })

  // ✅ Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      sectionId: sections[0]?.id || '',
      horaires: '',
      lieu: '',
      ageMin: '',
      ageMax: '',
      contact: '',
      responsable: '',
      image: '',
      ordre: 0
    })
  }

  // ✅ Ouvrir le modal de création
  const openCreateModal = () => {
    resetForm()
    setSelectedActivite(null)
    setShowCreateModal(true)
  }

  // ✅ Ouvrir le modal d'édition
  const openEditModal = (activite) => {
    setFormData({
      titre: activite.titre || '',
      description: activite.description || '',
      sectionId: activite.sectionId || '',
      horaires: activite.horaires || '',
      lieu: activite.lieu || '',
      ageMin: activite.ageMin?.toString() || '',
      ageMax: activite.ageMax?.toString() || '',
      contact: activite.contact || '',
      responsable: activite.responsable || '',
      image: activite.image || '',
      ordre: activite.ordre || 0
    })
    setSelectedActivite(activite)
    setShowEditModal(true)
  }

  // ✅ Ouvrir le modal de suppression
  const openDeleteModal = (activite) => {
    setItemToDelete(activite)
    setShowDeleteModal(true)
  }

  // ✅ Créer une activité
  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const dataToSend = {
        ...formData,
        ageMin: formData.ageMin ? parseInt(formData.ageMin) : null,
        ageMax: formData.ageMax ? parseInt(formData.ageMax) : null
      }

      const response = await fetch('/api/activites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dataToSend)
      })

      const data = await response.json()

      if (response.ok) {
        showMessage('Activité créée avec succès !', 'success')
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

  // ✅ Modifier une activité
  const handleEdit = async (e) => {
    e.preventDefault()
    if (!selectedActivite) return
    
    setLoading(true)

    try {
      const dataToSend = {
        ...formData,
        ageMin: formData.ageMin ? parseInt(formData.ageMin) : null,
        ageMax: formData.ageMax ? parseInt(formData.ageMax) : null
      }

      const response = await fetch(`/api/activites/${selectedActivite.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dataToSend)
      })

      const data = await response.json()

      if (response.ok) {
        showMessage('Activité modifiée avec succès !', 'success')
        setShowEditModal(false)
        setSelectedActivite(null)
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

  // ✅ Supprimer une activité
  const handleDelete = async () => {
    if (!itemToDelete) return
    
    setLoading(true)

    try {
      const response = await fetch(`/api/activites/${itemToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        showMessage('Activité supprimée avec succès !', 'success')
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
      setSelectedActivites(filteredActivites.map(a => a.id))
    } else {
      setSelectedActivites([])
    }
  }

  const handleSelectItem = (id, checked) => {
    if (checked) {
      setSelectedActivites([...selectedActivites, id])
    } else {
      setSelectedActivites(selectedActivites.filter(i => i !== id))
    }
  }

  // ✅ Actions groupées
  const handleBulkAction = async () => {
    if (!bulkAction || selectedActivites.length === 0) return

    if (bulkAction === 'delete') {
      if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedActivites.length} activité(s) ?`)) {
        try {
          await Promise.all(
            selectedActivites.map(id => 
              fetch(`/api/activites/${id}`, {
                method: 'DELETE',
                credentials: 'include'
              })
            )
          )
          setActivites(activites.filter(a => !selectedActivites.includes(a.id)))
          setSelectedActivites([])
          setBulkAction('')
          showMessage('Activités supprimées avec succès !', 'success')
        } catch (error) {
          console.error('Erreur lors de la suppression en masse:', error)
          showMessage('Erreur lors de la suppression', 'error')
        }
      }
    }
  }

  // ✅ Obtenir l'icône d'une section
  const getSectionIcon = (sectionNom) => {
    const IconComponent = sectionIcons[sectionNom] || Activity
    return IconComponent
  }

  // ✅ Obtenir la section par ID
  const getSectionById = (sectionId) => {
    return sections.find(s => s.id === sectionId)
  }

  const canWrite = user && ['PAROISSE_ADMIN', 'SUPER_ADMIN'].includes(user.role)

  // ✅ Stats pour l'affichage
  const statsData = [
    {
      title: 'Activités créées',
      value: stats.totalActivites?.toString() || '0',
      icon: Activity,
      change: 'Total des activités',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Avec responsable',
      value: stats.activitesAvecResponsable?.toString() || '0',
      icon: UserCheck,
      change: 'Bien organisées',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Avec horaires',
      value: stats.activitesAvecHoraires?.toString() || '0',
      icon: Clock,
      change: 'Planifiées',
      gradient: 'from-purple-500 to-indigo-500'
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
                Activités
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Gestion des Activités
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href={`/site/${user?.paroisse?.subdomain}/activites`}
                target="_blank"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Voir la page
              </Link>
              
              <span className="text-sm text-gray-600">
                {user?.paroisse?.nom || 'Paroisse'}
              </span>
              
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
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Gestion des <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Activités</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Créez, modifiez et organisez vos activités paroissiales pour dynamiser votre communauté
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {statsData.map((stat, index) => {
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Mes activités</h2>
              <p className="text-gray-600">Gérez vos activités paroissiales</p>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              {selectedActivites.length > 0 && canWrite && (
                <div className="flex items-center space-x-2">
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  >
                    <option value="">Actions groupées ({selectedActivites.length})</option>
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
                  disabled={sections.length === 0}
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nouvelle activité
                </button>
              )}
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une activité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
              >
                <option value="all">Toutes les sections</option>
                {sections.map(section => (
                  <option key={section.id} value={section.nom}>
                    {section.titre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {sections.length === 0 && (
            <div className="mb-6 p-4 bg-orange-50 rounded-xl">
              <p className="text-orange-700 text-sm">
                ⚠️ Vous devez d'abord créer des sections avant de pouvoir ajouter des activités.
                <Link href="/dashboard/activites/sections" className="font-semibold hover:underline ml-1">
                  Créer des sections →
                </Link>
              </p>
            </div>
          )}

          {/* Liste des activités */}
          {loadingActivites ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des activités...</p>
            </div>
          ) : filteredActivites.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchTerm || filterSection !== 'all' ? 'Aucun résultat' : 'Aucune activité'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterSection !== 'all' 
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Créez votre première activité pour dynamiser votre communauté'
                }
              </p>
              {(!searchTerm && filterSection === 'all') && canWrite && sections.length > 0 && (
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Créer ma première activité
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Header avec sélection */}
              {filteredActivites.length > 0 && canWrite && (
                <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-2xl">
                  <input
                    type="checkbox"
                    checked={selectedActivites.length === filteredActivites.length && filteredActivites.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="mr-4 w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600 font-medium">
                    {selectedActivites.length > 0 
                      ? `${selectedActivites.length} activité(s) sélectionnée(s)`
                      : 'Tout sélectionner'
                    }
                  </span>
                </div>
              )}

              {/* Grid des activités */}
              <div className="grid gap-6">
                {filteredActivites.map((activite) => {
                  const section = activite.section
                  const IconComponent = getSectionIcon(section?.nom)
                  
                  return (
                    <div key={activite.id} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 hover:shadow-lg transition-all">
                      <div className="flex items-start space-x-6">
                        {/* Checkbox */}
                        {canWrite && (
                          <input
                            type="checkbox"
                            checked={selectedActivites.includes(activite.id)}
                            onChange={(e) => handleSelectItem(activite.id, e.target.checked)}
                            className="mt-2 w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        )}

                        {/* Image */}
                        <div className="relative w-32 h-32 flex-shrink-0">
                          {activite.image ? (
                            <img 
                              src={activite.image} 
                              alt={activite.titre}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center">
                              <Activity className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          
                          {/* Badge section */}
                          {section && (
                            <div className="absolute top-2 left-2">
                              <div 
                                className="flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs font-bold"
                                style={{ backgroundColor: section.couleur || '#6B7280' }}
                              >
                                <IconComponent className="w-3 h-3" />
                                {section.titre}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Contenu */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors cursor-pointer">
                                {activite.titre}
                              </h3>
                              {activite.description && (
                                <p className="text-gray-600 line-clamp-2 mb-3">{activite.description}</p>
                              )}
                              
                              {/* Informations pratiques */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                                {activite.horaires && (
                                  <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2 text-blue-500" />
                                    <span>{activite.horaires}</span>
                                  </div>
                                )}
                                
                                {activite.lieu && (
                                  <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-red-500" />
                                    <span>{activite.lieu}</span>
                                  </div>
                                )}
                                
                                {(activite.ageMin || activite.ageMax) && (
                                  <div className="flex items-center">
                                    <Users className="w-4 h-4 mr-2 text-green-500" />
                                    <span>
                                      {activite.ageMin && activite.ageMax 
                                        ? `${activite.ageMin}-${activite.ageMax} ans`
                                        : activite.ageMin 
                                        ? `Dès ${activite.ageMin} ans`
                                        : `Jusqu'à ${activite.ageMax} ans`
                                      }
                                    </span>
                                  </div>
                                )}
                                
                                {activite.responsable && (
                                  <div className="flex items-center">
                                    <UserCheck className="w-4 h-4 mr-2 text-purple-500" />
                                    <span>{activite.responsable}</span>
                                  </div>
                                )}
                                
                                {activite.contact && (
                                  <div className="flex items-center">
                                    <Phone className="w-4 h-4 mr-2 text-orange-500" />
                                    <span>{activite.contact}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            {canWrite && (
                              <div className="flex items-center space-x-2 ml-4">
                                <Link
                                  href={`/site/${user?.paroisse?.subdomain}/activites/${section?.nom}/${activite.id}`}
                                  target="_blank"
                                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                  title="Voir la page publique"
                                >
                                  <Eye className="w-5 h-5" />
                                </Link>
                                <button
                                  onClick={() => openEditModal(activite)}
                                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                  title="Modifier"
                                >
                                  <Edit3 className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => openDeleteModal(activite)}
                                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Meta informations */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center text-gray-600">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>
                                  Créée le {new Date(activite.createdAt).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/site/${user?.paroisse?.subdomain}/activites/${section?.nom}/${activite.id}`}
                                target="_blank"
                                className="flex items-center text-green-600 hover:text-green-700 font-medium"
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                Site public
                              </Link>
                            </div>
                          </div>
                        </div>
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
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
              
              {/* Header du modal */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-8 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">
                        {showCreateModal ? 'Nouvelle Activité' : 'Modifier l\'Activité'}
                      </h2>
                      <p className="text-blue-100 mt-1">
                        {showCreateModal 
                          ? 'Créez une nouvelle activité pour votre paroisse'
                          : 'Modifiez les informations de cette activité'
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
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      {formData.sectionId && getSectionById(formData.sectionId) ? (
                        React.createElement(getSectionIcon(getSectionById(formData.sectionId).nom), {
                          className: "w-8 h-8 text-blue-600"
                        })
                      ) : (
                        <Activity className="w-8 h-8 text-blue-600" />
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Informations de l'activité
                    </h3>
                    <p className="text-gray-600">
                      Remplissez les détails pour créer une activité attrayante
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
                            Titre de l'activité *
                          </label>
                          <input
                            type="text"
                            value={formData.titre}
                            onChange={(e) => setFormData({...formData, titre: e.target.value})}
                            className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg font-medium"
                            placeholder="Ex: Scouts, Catéchisme CM1, Chorale..."
                            required
                          />
                        </div>

                        {/* Section */}
                        <div className="mb-6">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Section *
                          </label>
                          <select
                            value={formData.sectionId}
                            onChange={(e) => setFormData({...formData, sectionId: e.target.value})}
                            className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all bg-white text-lg"
                            required
                          >
                            <option value="">Choisir une section</option>
                            {sections.map(section => {
                              return (
                                <option key={section.id} value={section.id}>
                                  {section.titre}
                                </option>
                              )
                            })}
                          </select>
                          {formData.sectionId && (
                            <div className="mt-2 flex items-center text-sm text-blue-600">
                              {React.createElement(getSectionIcon(getSectionById(formData.sectionId)?.nom), {
                                className: "w-4 h-4 mr-1"
                              })}
                              Section: {getSectionById(formData.sectionId)?.titre}
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none"
                            placeholder="Décrivez l'activité, ses objectifs, ce qu'elle apporte..."
                            rows="4"
                          />
                          <div className="text-sm text-gray-500 mt-1">
                            {formData.description.length} caractères
                          </div>
                        </div>
                      </div>

                      {/* Image */}
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <FileImage className="w-5 h-5 mr-2 text-purple-600" />
                          Image de l'activité
                        </h4>
                        
                        {formData.image ? (
                          <div className="relative group">
                            <img
                              src={formData.image}
                              alt="Aperçu"
                              className="w-full h-48 object-cover rounded-2xl"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                              <div className="flex space-x-3">
                                <button
                                  type="button"
                                  onClick={() => setFormData({...formData, image: ''})}
                                  className="bg-red-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-red-600 transition-colors"
                                >
                                  Supprimer
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all group">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors">
                              <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Ajouter une image</h3>
                            <p className="text-gray-600 mb-4">
                              URL de l'image qui illustre l'activité
                            </p>
                            <input
                              type="url"
                              value={formData.image}
                              onChange={(e) => setFormData({...formData, image: e.target.value})}
                              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                              placeholder="https://exemple.com/image.jpg"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Colonne droite - Détails pratiques */}
                    <div className="space-y-6">
                      
                      {/* Horaires et lieu */}
                      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <Clock className="w-5 h-5 mr-2 text-green-600" />
                          Planification
                        </h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Horaires
                            </label>
                            <input
                              type="text"
                              value={formData.horaires}
                              onChange={(e) => setFormData({...formData, horaires: e.target.value})}
                              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all"
                              placeholder="Ex: Mercredi 14h-16h, Samedi 10h-12h"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Lieu
                            </label>
                            <input
                              type="text"
                              value={formData.lieu}
                              onChange={(e) => setFormData({...formData, lieu: e.target.value})}
                              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all"
                              placeholder="Ex: Salle paroissiale, Église, Extérieur"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Âges */}
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <Users className="w-5 h-5 mr-2 text-orange-600" />
                          Public cible
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Âge minimum
                            </label>
                            <input
                              type="number"
                              value={formData.ageMin}
                              onChange={(e) => setFormData({...formData, ageMin: e.target.value})}
                              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all"
                              placeholder="Ex: 6"
                              min="0"
                              max="100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Âge maximum
                            </label>
                            <input
                              type="number"
                              value={formData.ageMax}
                              onChange={(e) => setFormData({...formData, ageMax: e.target.value})}
                              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all"
                              placeholder="Ex: 12"
                              min="0"
                              max="100"
                            />
                          </div>
                        </div>
                        
                        {(formData.ageMin || formData.ageMax) && (
                          <div className="mt-3 p-3 bg-orange-100 rounded-xl">
                            <p className="text-orange-700 text-sm font-medium">
                              📅 Tranche d'âge : {
                                formData.ageMin && formData.ageMax 
                                  ? `${formData.ageMin}-${formData.ageMax} ans`
                                  : formData.ageMin 
                                  ? `Dès ${formData.ageMin} ans`
                                  : `Jusqu'à ${formData.ageMax} ans`
                              }
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Responsable et contact */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <UserCheck className="w-5 h-5 mr-2 text-purple-600" />
                          Encadrement
                        </h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Responsable
                            </label>
                            <input
                              type="text"
                              value={formData.responsable}
                              onChange={(e) => setFormData({...formData, responsable: e.target.value})}
                              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all"
                              placeholder="Nom du responsable de l'activité"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Contact
                            </label>
                            <input
                              type="text"
                              value={formData.contact}
                              onChange={(e) => setFormData({...formData, contact: e.target.value})}
                              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all"
                              placeholder="Téléphone ou email de contact"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Ordre */}
                      <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <Hash className="w-5 h-5 mr-2 text-gray-600" />
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
                            placeholder="0"
                          />
                          <p className="text-sm text-gray-500 mt-2">
                            Plus le nombre est petit, plus l'activité apparaîtra en premier
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Aperçu */}
                  {(formData.titre || formData.description) && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Eye className="w-5 h-5 mr-2 text-blue-600" />
                        Aperçu de l'activité
                      </h4>
                      
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="flex items-start space-x-4">
                          {formData.image && (
                            <img
                              src={formData.image}
                              alt="Aperçu"
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {formData.sectionId && (
                                <span 
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs font-bold"
                                  style={{ backgroundColor: getSectionById(formData.sectionId)?.couleur || '#6B7280' }}
                                >
                                  {React.createElement(getSectionIcon(getSectionById(formData.sectionId)?.nom), {
                                    className: "w-3 h-3"
                                  })}
                                  {getSectionById(formData.sectionId)?.titre}
                                </span>
                              )}
                            </div>
                            <h5 className="font-bold text-gray-900 mb-1">
                              {formData.titre || 'Titre de l\'activité'}
                            </h5>
                            {formData.description && (
                              <p className="text-gray-600 text-sm mb-2">
                                {formData.description.substring(0, 100)}
                                {formData.description.length > 100 && '...'}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                              {formData.horaires && (
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formData.horaires}
                                </span>
                              )}
                              {formData.lieu && (
                                <span className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {formData.lieu}
                                </span>
                              )}
                              {formData.responsable && (
                                <span className="flex items-center">
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  {formData.responsable}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                    disabled={loading || !formData.titre || !formData.sectionId}
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
                        {showCreateModal ? 'Créer l\'activité' : 'Modifier l\'activité'}
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
                  Supprimer l'activité
                </h3>
                <p className="text-gray-600 mb-8">
                  Êtes-vous sûr de vouloir supprimer l'activité <strong>"{itemToDelete.titre}"</strong> ?
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
                    Supprimer
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