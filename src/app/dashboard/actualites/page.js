// ============================================================================
// src/app/dashboard/actualites/page.js - Navigation corrigée vers page consultation
// ============================================================================
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye,
  Calendar,
  User,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  TrendingUp,
  Activity,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function ActualitesPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actualites, setActualites] = useState([])
  const [loadingActualites, setLoadingActualites] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, published, draft
  const [selectedActualites, setSelectedActualites] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  
  // Vérifier l'authentification
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
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

  // Charger les actualités
  const fetchActualites = async () => {
    try {
      const res = await fetch('/api/actualites', {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setActualites(data.actualites || [])
      } else if (res.status === 401) {
        router.push('/login')
      } else {
        console.error('Erreur API:', res.status, res.statusText)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des actualités:', error)
    } finally {
      setLoadingActualites(false)
    }
  }

  // Supprimer une actualité
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/actualites/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (res.ok) {
        setActualites(actualites.filter(a => a.id !== id))
        setShowDeleteModal(false)
        setItemToDelete(null)
      } else {
        alert('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression')
    }
  }

  // Basculer le statut de publication
  const handleTogglePublish = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/actualites/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          publiee: !currentStatus
        })
      })
      
      if (res.ok) {
        setActualites(actualites.map(a => 
          a.id === id ? { ...a, publiee: !currentStatus } : a
        ))
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
    }
  }

  // Actions groupées
  const handleBulkAction = async () => {
    if (!bulkAction || selectedActualites.length === 0) return

    if (bulkAction === 'delete') {
      if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedActualites.length} actualité(s) ?`)) {
        try {
          await Promise.all(
            selectedActualites.map(id => 
              fetch(`/api/actualites/${id}`, {
                method: 'DELETE',
                credentials: 'include'
              })
            )
          )
          setActualites(actualites.filter(a => !selectedActualites.includes(a.id)))
          setSelectedActualites([])
          setBulkAction('')
        } catch (error) {
          console.error('Erreur lors de la suppression en masse:', error)
        }
      }
    } else if (bulkAction === 'publish') {
      try {
        await Promise.all(
          selectedActualites.map(id => 
            fetch(`/api/actualites/${id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({ publiee: true })
            })
          )
        )
        setActualites(actualites.map(a => 
          selectedActualites.includes(a.id) ? { ...a, publiee: true } : a
        ))
        setSelectedActualites([])
        setBulkAction('')
      } catch (error) {
        console.error('Erreur lors de la publication en masse:', error)
      }
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
        await fetchActualites()
        setLoading(false)
      }
    }
    init()
  }, [])

  // Filtrer les actualités
  const filteredActualites = actualites.filter(actu => {
    const matchesSearch = actu.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         actu.contenu.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'published' && actu.publiee) ||
                         (filterStatus === 'draft' && !actu.publiee)
    
    return matchesSearch && matchesFilter
  })

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedActualites(filteredActualites.map(a => a.id))
    } else {
      setSelectedActualites([])
    }
  }

  const handleSelectItem = (id, checked) => {
    if (checked) {
      setSelectedActualites([...selectedActualites, id])
    } else {
      setSelectedActualites(selectedActualites.filter(i => i !== id))
    }
  }

  const canWrite = user && ['CURE', 'PAROISSE_ADMIN', 'PRETRE'].includes(user.role)

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

  const statsData = [
    {
      title: 'Actualités publiées',
      value: actualites.filter(a => a.publiee).length.toString(),
      icon: CheckCircle,
      change: 'Visibles sur le site',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Brouillons',
      value: actualites.filter(a => !a.publiee).length.toString(),
      icon: Clock,
      change: 'En attente de publication',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'Total actualités',
      value: actualites.length.toString(),
      icon: FileText,
      change: 'Créées au total',
      gradient: 'from-blue-500 to-purple-500'
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
                href="/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Gestion des Actualités
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href={`/site/${user.paroisse?.subdomain}/actualites`}
                target="_blank"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Voir sur le site
              </Link>
              
              {canWrite && (
                <Link
                  href="/dashboard/actualites/new"
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nouvelle actualité
                </Link>
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

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Gestion des <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Actualités</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Créez, modifiez et publiez vos actualités paroissiales pour tenir votre communauté informée
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Mes actualités</h2>
              <p className="text-gray-600">Gérez vos actualités et leur publication</p>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              {selectedActualites.length > 0 && canWrite && (
                <div className="flex items-center space-x-2">
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  >
                    <option value="">Actions groupées ({selectedActualites.length})</option>
                    <option value="publish">Publier</option>
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
                <Link
                  href="/dashboard/actualites/new"
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nouvelle actualité
                </Link>
              )}
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une actualité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
              >
                <option value="all">Toutes les actualités</option>
                <option value="published">Publiées</option>
                <option value="draft">Brouillons</option>
              </select>
            </div>
          </div>

          {/* Liste des actualités */}
          {loadingActualites ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des actualités...</p>
            </div>
          ) : filteredActualites.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchTerm || filterStatus !== 'all' ? 'Aucun résultat' : 'Aucune actualité'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Créez votre première actualité pour informer votre communauté'
                }
              </p>
              {(!searchTerm && filterStatus === 'all') && canWrite && (
                <Link
                  href="/dashboard/actualites/new"
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Créer ma première actualité
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Header avec sélection */}
              {filteredActualites.length > 0 && canWrite && (
                <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-2xl">
                  <input
                    type="checkbox"
                    checked={selectedActualites.length === filteredActualites.length && filteredActualites.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="mr-4 w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600 font-medium">
                    {selectedActualites.length > 0 
                      ? `${selectedActualites.length} actualité(s) sélectionnée(s)`
                      : 'Tout sélectionner'
                    }
                  </span>
                </div>
              )}

              {/* Grid des actualités */}
              <div className="grid gap-6">
                {filteredActualites.map((actu) => (
                  <div key={actu.id} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start space-x-6">
                      {/* Checkbox */}
                      {canWrite && (
                        <input
                          type="checkbox"
                          checked={selectedActualites.includes(actu.id)}
                          onChange={(e) => handleSelectItem(actu.id, e.target.checked)}
                          className="mt-2 w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      )}

                      {/* Image */}
                      <div className="relative w-32 h-32 flex-shrink-0">
                        {actu.image ? (
                          <img 
                            src={actu.image} 
                            alt={actu.titre}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        
                        <div className="absolute top-2 left-2">
                          {canWrite ? (
                            <button
                              onClick={() => handleTogglePublish(actu.id, actu.publiee)}
                              className={`px-2 py-1 rounded-full text-xs font-bold ${
                                actu.publiee
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {actu.publiee ? 'Publié' : 'Brouillon'}
                            </button>
                          ) : (
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              actu.publiee
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {actu.publiee ? 'Publié' : 'Brouillon'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Contenu */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <Link 
                              href={`/dashboard/actualites/${actu.id}`}
                              className="group"
                            >
                              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors cursor-pointer">
                                {actu.titre}
                              </h3>
                            </Link>
                            <p className="text-gray-600 line-clamp-2">{actu.contenu?.substring(0, 150)}...</p>
                          </div>
                          
                          {canWrite && (
                            <div className="flex items-center space-x-2 ml-4">
                              <Link
                                href={`/dashboard/actualites/${actu.id}/edit`}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Modifier"
                              >
                                <Edit3 className="w-5 h-5" />
                              </Link>
                              <button
                                onClick={() => {
                                  setItemToDelete(actu)
                                  setShowDeleteModal(true)
                                }}
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
                                {actu.datePubli 
                                  ? new Date(actu.datePubli).toLocaleDateString('fr-FR')
                                  : `Créé le ${new Date(actu.createdAt).toLocaleDateString('fr-FR')}`
                                }
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <User className="w-4 h-4 mr-1" />
                              <span>
                                {actu.auteur ? `${actu.auteur.prenom} ${actu.auteur.nom}` : 'Anonyme'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/dashboard/actualites/${actu.id}`}
                              className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Consulter
                            </Link>
                            <span className="text-gray-300">•</span>
                            <Link
                              href={`/site/${user.paroisse?.subdomain}/actualites/${actu.id}`}
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
                ))}
              </div>
            </>
          )}
        </div>

        {/* Modal de suppression */}
        {showDeleteModal && itemToDelete && (
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
                  Êtes-vous sûr de vouloir supprimer l'actualité <strong>"{itemToDelete.titre}"</strong> ?
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
                    onClick={() => handleDelete(itemToDelete.id)}
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