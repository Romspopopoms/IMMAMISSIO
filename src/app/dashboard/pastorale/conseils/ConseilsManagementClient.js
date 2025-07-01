// ============================================================================
// src/app/dashboard/pastorale/conseils/ConseilsManagementClient.js
// ============================================================================
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Plus, Edit3, Trash2, Users, Building, Search, 
  CheckCircle, AlertTriangle, Settings, Mail, Phone,
  Calendar, MoreVertical, UserPlus, UserMinus, Crown,
  Info, ChevronDown, Filter, Activity
} from 'lucide-react'

// Import du modal conseil
import ModalAddConseil from '../../../../components/ModalAddConseil'

export default function ConseilsManagementClient({ user, initialData }) {
  const router = useRouter()
  
  // ✅ États pour les données
  const [conseils, setConseils] = useState(initialData.conseils || [])
  const [membresDisponibles] = useState(initialData.membresDisponibles || [])
  
  // ✅ États pour les modals et UI
  const [showModalConseil, setShowModalConseil] = useState(false)
  const [editingConseil, setEditingConseil] = useState(null)
  const [selectedConseil, setSelectedConseil] = useState(null)
  const [showMembres, setShowMembres] = useState({})
  
  // ✅ États UI
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // all, economique, pastoral, custom

  // ✅ Vérifier les permissions
  const canWrite = user && ['CURE', 'PAROISSE_ADMIN', 'PRETRE'].includes(user.role)

  // ✅ Fonction de déconnexion
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
      setLoading(true)
      window.location.reload()
    } catch (error) {
      console.error('Erreur rechargement:', error)
      showMessage('Erreur lors du rechargement des données', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Gestionnaires des modals
  const handleConseilSuccess = () => {
    setShowModalConseil(false)
    setEditingConseil(null)
    showMessage('Conseil mis à jour avec succès', 'success')
    reloadData()
  }

  const handleEdit = (conseil) => {
    setEditingConseil(conseil)
    setShowModalConseil(true)
  }

  const handleAdd = () => {
    setEditingConseil(null)
    setShowModalConseil(true)
  }

  // ✅ Supprimer un conseil
  const handleDelete = async (conseilId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce conseil ?')) return

    try {
      setLoading(true)
      
      const res = await fetch(`/api/conseils/${conseilId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erreur lors de la suppression')
      }

      showMessage('Conseil supprimé avec succès', 'success')
      reloadData()
      
    } catch (error) {
      console.error('Erreur suppression:', error)
      showMessage(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Ajouter/retirer un membre
  const handleMembreAction = async (conseilId, membreId, action, fonction = 'Membre') => {
    try {
      setLoading(true)
      
      let res
      if (action === 'add') {
        res = await fetch('/api/relations', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'add_to_conseil',
            membreId,
            conseilId,
            fonction
          })
        })
      } else {
        res = await fetch(`/api/relations?action=remove_from_conseil&membreId=${membreId}&conseilId=${conseilId}&fonction=${fonction}`, {
          method: 'DELETE',
          credentials: 'include'
        })
      }

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erreur lors de l\'opération')
      }

      showMessage(`Membre ${action === 'add' ? 'ajouté' : 'retiré'} avec succès`, 'success')
      reloadData()
      
    } catch (error) {
      console.error('Erreur membre:', error)
      showMessage(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (text, type) => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => setMessage(''), 5000)
  }

  // ✅ Filtrage par recherche et type
  const filteredConseils = conseils.filter(conseil => {
    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      if (
        !conseil.nom.toLowerCase().includes(searchLower) &&
        !(conseil.description && conseil.description.toLowerCase().includes(searchLower))
      ) {
        return false
      }
    }

    // Filtre par type
    if (filterType !== 'all' && conseil.type !== filterType) {
      return false
    }

    return true
  })

  // ✅ Toggle affichage membres
  const toggleMembres = (conseilId) => {
    setShowMembres(prev => ({
      ...prev,
      [conseilId]: !prev[conseilId]
    }))
  }

  // ✅ Types de conseils avec leurs infos
  const typesConseils = {
    'economique': {
      label: 'Conseil économique',
      description: 'Gestion financière et administrative',
      color: 'green',
      icon: '💰'
    },
    'pastoral': {
      label: 'Conseil pastoral',
      description: 'Animation pastorale et spirituelle',
      color: 'purple',
      icon: '⛪'
    },
    'custom': {
      label: 'Conseil personnalisé',
      description: 'Autre type de conseil',
      color: 'blue',
      icon: '🏛️'
    }
  }

  // ✅ Statistiques
  const totalConseils = conseils.length
  const conseilsEconomiques = conseils.filter(c => c.type === 'economique').length
  const conseilsPastoraux = conseils.filter(c => c.type === 'pastoral').length
  const conseilsCustom = conseils.filter(c => c.type === 'custom').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/pastorale"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Équipe Pastorale
              </Link>
              <div className="text-gray-300">|</div>
              <h1 className="text-xl font-semibold text-gray-900">
                Gestion des Conseils
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.paroisse?.nom || 'Paroisse'}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
              >
                <Settings className="w-4 h-4 mr-1" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message de feedback */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className={`border rounded-md p-3 ${
            messageType === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-center">
              {messageType === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertTriangle className="w-5 h-5 mr-2" />
              )}
              <p className="text-sm">{message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header avec actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Conseils paroissiaux ({filteredConseils.length})
            </h2>
            <p className="text-gray-600 mt-1">
              Gérez les instances consultatives de votre paroisse
            </p>
          </div>
          
          {canWrite && (
            <button
              onClick={handleAdd}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau conseil
            </button>
          )}
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <Building className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalConseils}</p>
                <p className="text-sm text-gray-600">Total conseils</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 text-lg">
                💰
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{conseilsEconomiques}</p>
                <p className="text-sm text-gray-600">Économiques</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 text-lg">
                ⛪
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{conseilsPastoraux}</p>
                <p className="text-sm text-gray-600">Pastoraux</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 text-lg">
                🏛️
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{conseilsCustom}</p>
                <p className="text-sm text-gray-600">Personnalisés</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un conseil..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Filtre par type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">Tous les types</option>
              <option value="economique">Conseils économiques</option>
              <option value="pastoral">Conseils pastoraux</option>
              <option value="custom">Conseils personnalisés</option>
            </select>
          </div>
        </div>

        {/* Liste des conseils */}
        {filteredConseils.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchTerm || filterType !== 'all' 
                ? 'Aucun conseil trouvé' 
                : 'Aucun conseil créé'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType !== 'all'
                ? `Aucun conseil ne correspond à vos critères`
                : 'Commencez par créer votre premier conseil paroissial'
              }
            </p>
            {!searchTerm && filterType === 'all' && canWrite && (
              <button
                onClick={handleAdd}
                className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 flex items-center mx-auto"
              >
                <Plus className="w-5 h-5 mr-2" />
                Créer le premier conseil
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConseils.map((conseil) => (
              <div key={conseil.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* En-tête du conseil */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                        conseil.type === 'economique' ? 'bg-green-100' :
                        conseil.type === 'pastoral' ? 'bg-purple-100' : 'bg-blue-100'
                      }`}>
                        {typesConseils[conseil.type]?.icon || '🏛️'}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {conseil.nom}
                        </h3>
                        {conseil.description && (
                          <p className="text-gray-600 mt-1">{conseil.description}</p>
                        )}
                        <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            conseil.type === 'economique' ? 'bg-green-100 text-green-800' :
                            conseil.type === 'pastoral' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {typesConseils[conseil.type]?.label || 'Conseil personnalisé'}
                          </span>
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {conseil.membres.length} membre{conseil.membres.length > 1 ? 's' : ''}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(conseil.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {canWrite && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleMembres(conseil.id)}
                          className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                          title="Gérer les membres"
                        >
                          <ChevronDown 
                            className={`w-4 h-4 transition-transform ${
                              showMembres[conseil.id] ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => handleEdit(conseil)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Modifier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(conseil.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section membres (extensible) */}
                {showMembres[conseil.id] && (
                  <div className="border-t bg-gray-50">
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-900">
                          Membres du conseil
                        </h4>
                        {canWrite && (
                          <div className="text-sm">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleMembreAction(conseil.id, e.target.value, 'add')
                                  e.target.value = ''
                                }
                              }}
                              className="border border-gray-300 rounded-md px-3 py-1"
                            >
                              <option value="">Ajouter un membre</option>
                              {membresDisponibles
                                .filter(membre => !conseil.membres.some(memb => memb.membre.id === membre.id))
                                .map(membre => (
                                  <option key={membre.id} value={membre.id}>
                                    {membre.nomComplet}
                                  </option>
                                ))
                              }
                            </select>
                          </div>
                        )}
                      </div>
                      
                      {conseil.membres.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          Aucun membre assigné
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {conseil.membres.map((membre) => (
                            <div key={membre.id} className="bg-white rounded-lg p-4 border">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-3 flex-1">
                                  <div className="w-12 h-12 bg-gradient-to-br from-purple-200 to-blue-300 rounded-xl overflow-hidden flex-shrink-0">
                                    {membre.membre.photo ? (
                                      <img 
                                        src={membre.membre.photo} 
                                        alt={`${membre.membre.prenom} ${membre.membre.nom}`} 
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Users className="w-6 h-6 text-purple-600" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900">
                                      {membre.membre.prenom} {membre.membre.nom}
                                    </h5>
                                    <p className="text-sm text-purple-600 font-medium">
                                      {membre.fonction}
                                    </p>
                                    <div className="mt-2 space-y-1">
                                      {membre.membre.email && (
                                        <div className="flex items-center text-xs text-gray-600">
                                          <Mail className="w-3 h-3 mr-1" />
                                          {membre.membre.email}
                                        </div>
                                      )}
                                      {membre.membre.telephone && (
                                        <div className="flex items-center text-xs text-gray-600">
                                          <Phone className="w-3 h-3 mr-1" />
                                          {membre.membre.telephone}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {canWrite && (
                                  <button
                                    onClick={() => handleMembreAction(
                                      conseil.id, 
                                      membre.membre.id, 
                                      'remove', 
                                      membre.fonction
                                    )}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Retirer du conseil"
                                  >
                                    <UserMinus className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info sur les conseils */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Info className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-2 text-purple-900">
                À propos des conseils paroissiaux
              </h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h5 className="font-semibold text-purple-800 mb-2">💰 Conseil économique</h5>
                  <p className="text-purple-700 leading-relaxed">
                    Gère les finances, le patrimoine et les aspects administratifs de la paroisse.
                  </p>
                </div>
                <div>
                  <h5 className="font-semibold text-purple-800 mb-2">⛪ Conseil pastoral</h5>
                  <p className="text-purple-700 leading-relaxed">
                    Accompagne la mission pastorale et propose des orientations spirituelles.
                  </p>
                </div>
                <div>
                  <h5 className="font-semibold text-purple-800 mb-2">🏛️ Conseils personnalisés</h5>
                  <p className="text-purple-700 leading-relaxed">
                    Autres instances consultatives selon les besoins spécifiques de votre paroisse.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal conseil */}
      {showModalConseil && (
        <ModalAddConseil
          isOpen={showModalConseil}
          onClose={() => {
            setShowModalConseil(false)
            setEditingConseil(null)
          }}
          onSuccess={handleConseilSuccess}
          editingConseil={editingConseil}
          user={user}
        />
      )}
    </div>
  )
}