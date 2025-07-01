// ============================================================================
// src/app/dashboard/pastorale/membres/MembresManagementClient.js
// ============================================================================
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Plus, Edit3, Trash2, Users, Shield, Search, 
  CheckCircle, AlertTriangle, Settings, Mail, Phone,
  Calendar, MoreVertical, UserPlus, UserMinus, Building,
  Crown, User, UserCheck, Filter, ChevronDown, Loader
} from 'lucide-react'

// Import du modal membre
import ModalAddMembre from '../../../../components/ModalAddMembre'

const SECTEUR_ICONS = {
  'Users': Users,
  'Heart': ({ className, style }) => <div className={className} style={style}>❤️</div>,
  'Music': ({ className, style }) => <div className={className} style={style}>🎵</div>,
  'Book': ({ className, style }) => <div className={className} style={style}>📚</div>,
  'Lightbulb': ({ className, style }) => <div className={className} style={style}>💡</div>,
  'Target': ({ className, style }) => <div className={className} style={style}>🎯</div>,
  'Star': ({ className, style }) => <div className={className} style={style}>⭐</div>,
  'Building': ({ className, style }) => <div className={className} style={style}>🏢</div>,
  'Calendar': Calendar,
  'MessageCircle': ({ className, style }) => <div className={className} style={style}>💬</div>,
  'Shield': Shield
}

export default function MembresManagementClient({ user, initialData }) {
  const router = useRouter()
  
  // ✅ États pour les données
  const [membres, setMembres] = useState(initialData.membres || [])
  const [conseilsDisponibles] = useState(initialData.conseilsDisponibles || [])
  const [secteursDisponibles] = useState(initialData.secteursDisponibles || [])
  
  // ✅ États pour les modals et UI
  const [showModalMembre, setShowModalMembre] = useState(false)
  const [editingMembre, setEditingMembre] = useState(null)
  const [selectedMembre, setSelectedMembre] = useState(null)
  const [showDetails, setShowDetails] = useState({})
  
  // ✅ États UI
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // all, with-account, without-account
  const [filterConseil, setFilterConseil] = useState('')
  const [filterSecteur, setFilterSecteur] = useState('')

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
  const handleMembreSuccess = () => {
    setShowModalMembre(false)
    setEditingMembre(null)
    showMessage('Membre mis à jour avec succès', 'success')
    reloadData()
  }

  const handleEdit = (membre) => {
    setEditingMembre(membre)
    setShowModalMembre(true)
  }

  const handleAdd = () => {
    setEditingMembre(null)
    setShowModalMembre(true)
  }

  // ✅ Supprimer un membre
  const handleDelete = async (membreId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) return

    try {
      setLoading(true)
      
      const res = await fetch(`/api/membres/${membreId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erreur lors de la suppression')
      }

      showMessage('Membre supprimé avec succès', 'success')
      reloadData()
      
    } catch (error) {
      console.error('Erreur suppression:', error)
      showMessage(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Retirer d'un conseil/secteur
  const handleRetirer = async (membreId, type, relationId) => {
    if (!confirm(`Êtes-vous sûr de vouloir retirer ce membre de ce ${type} ?`)) return

    try {
      setLoading(true)
      
      let url
      if (type === 'conseil') {
        url = `/api/relations?action=remove_from_conseil&membreId=${membreId}&conseilId=${relationId}`
      } else {
        url = `/api/relations?action=remove_from_secteur&membreId=${membreId}&secteurId=${relationId}`
      }

      const res = await fetch(url, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erreur lors de la suppression')
      }

      showMessage(`Membre retiré du ${type} avec succès`, 'success')
      reloadData()
      
    } catch (error) {
      console.error('Erreur suppression relation:', error)
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

  // ✅ Afficher l'icône d'un secteur
  const getSecteurIcon = (iconName, couleur) => {
    const IconComponent = SECTEUR_ICONS[iconName] || Users
    return <IconComponent className="w-4 h-4" style={{ color: couleur }} />
  }

  // ✅ Filtrage des membres
  const filteredMembres = membres.filter(membre => {
    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      if (
        !membre.nom.toLowerCase().includes(searchLower) &&
        !membre.prenom?.toLowerCase().includes(searchLower) &&
        !membre.email.toLowerCase().includes(searchLower)
      ) {
        return false
      }
    }

    // Filtre par type de compte
    if (filterType === 'with-account' && !membre.userId) return false
    if (filterType === 'without-account' && membre.userId) return false

    // Filtre par conseil
    if (filterConseil && !membre.appartenances.some(app => app.conseil.id === filterConseil)) {
      return false
    }

    // Filtre par secteur
    if (filterSecteur && !membre.responsabilites.some(resp => resp.secteur.id === filterSecteur)) {
      return false
    }

    return true
  })

  // ✅ Toggle affichage détails
  const toggleDetails = (membreId) => {
    setShowDetails(prev => ({
      ...prev,
      [membreId]: !prev[membreId]
    }))
  }

  // ✅ Statistiques
  const totalMembres = membres.length
  const membresAvecCompte = membres.filter(m => m.userId).length
  const membresSansCompte = totalMembres - membresAvecCompte

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
                Gestion des Membres
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
              Membres laïcs ({filteredMembres.length})
            </h2>
            <p className="text-gray-600 mt-1">
              Gérez les membres des conseils et secteurs
            </p>
          </div>
          
          {canWrite && (
            <button
              onClick={handleAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau membre
            </button>
          )}
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalMembres}</p>
                <p className="text-sm text-gray-600">Total membres</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{membresAvecCompte}</p>
                <p className="text-sm text-gray-600">Avec compte</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{membresSansCompte}</p>
                <p className="text-sm text-gray-600">Sans compte</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un membre..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filtre par type de compte */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="with-account">Avec compte</option>
              <option value="without-account">Sans compte</option>
            </select>

            {/* Filtre par conseil */}
            <select
              value={filterConseil}
              onChange={(e) => setFilterConseil(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les conseils</option>
              {conseilsDisponibles.map(conseil => (
                <option key={conseil.id} value={conseil.id}>{conseil.nom}</option>
              ))}
            </select>

            {/* Filtre par secteur */}
            <select
              value={filterSecteur}
              onChange={(e) => setFilterSecteur(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les secteurs</option>
              {secteursDisponibles.map(secteur => (
                <option key={secteur.id} value={secteur.id}>{secteur.nom}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Liste des membres */}
        {filteredMembres.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchTerm || filterType !== 'all' || filterConseil || filterSecteur 
                ? 'Aucun membre trouvé' 
                : 'Aucun membre ajouté'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType !== 'all' || filterConseil || filterSecteur
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez par ajouter votre premier membre laïc'
              }
            </p>
            {!searchTerm && !filterConseil && !filterSecteur && filterType === 'all' && canWrite && (
              <button
                onClick={handleAdd}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 flex items-center mx-auto"
              >
                <Plus className="w-5 h-5 mr-2" />
                Ajouter le premier membre
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMembres.map((membre) => (
              <div key={membre.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* En-tête du membre */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-xl overflow-hidden flex-shrink-0">
                        {membre.photo ? (
                          <img 
                            src={membre.photo} 
                            alt={`${membre.prenom} ${membre.nom}`} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="w-8 h-8 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {membre.prenom} {membre.nom}
                        </h3>
                        <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
                          {membre.email && (
                            <span className="flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {membre.email}
                            </span>
                          )}
                          {membre.telephone && (
                            <span className="flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {membre.telephone}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center mt-2 space-x-4 text-sm">
                          {membre.userId ? (
                            <span className="inline-flex items-center text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                              <UserCheck className="w-3 h-3 mr-1" />
                              Compte actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              <User className="w-3 h-3 mr-1" />
                              Pas de compte
                            </span>
                          )}
                          <span className="text-gray-400">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {new Date(membre.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {canWrite && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleDetails(membre.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Voir les détails"
                        >
                          <ChevronDown 
                            className={`w-4 h-4 transition-transform ${
                              showDetails[membre.id] ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => handleEdit(membre)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Modifier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(membre.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Aperçu des affiliations */}
                  <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Building className="w-4 h-4 mr-1" />
                      {membre.appartenances.length} conseil{membre.appartenances.length > 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      {membre.responsabilites.length} secteur{membre.responsabilites.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Section détails (extensible) */}
                {showDetails[membre.id] && (
                  <div className="border-t bg-gray-50">
                    <div className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        
                        {/* Conseils */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <Building className="w-4 h-4 mr-2 text-purple-600" />
                            Conseils paroissiaux
                          </h4>
                          {membre.appartenances.length === 0 ? (
                            <p className="text-gray-500 text-sm">Aucun conseil</p>
                          ) : (
                            <div className="space-y-2">
                              {membre.appartenances.map((app) => (
                                <div key={app.id} className="bg-white rounded-lg p-3 border flex justify-between items-center">
                                  <div>
                                    <p className="font-medium text-gray-900">{app.conseil.nom}</p>
                                    <p className="text-sm text-purple-600">{app.fonction}</p>
                                  </div>
                                  {canWrite && (
                                    <button
                                      onClick={() => handleRetirer(membre.id, 'conseil', app.conseil.id)}
                                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                      title="Retirer du conseil"
                                    >
                                      <UserMinus className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Secteurs */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <Shield className="w-4 h-4 mr-2 text-orange-600" />
                            Secteurs d'activités
                          </h4>
                          {membre.responsabilites.length === 0 ? (
                            <p className="text-gray-500 text-sm">Aucun secteur</p>
                          ) : (
                            <div className="space-y-2">
                              {membre.responsabilites.map((resp) => (
                                <div key={resp.id} className="bg-white rounded-lg p-3 border flex justify-between items-center">
                                  <div className="flex items-center space-x-3">
                                    <div 
                                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                                      style={{ backgroundColor: resp.secteur.couleur + '20' }}
                                    >
                                      {getSecteurIcon(resp.secteur.icone, resp.secteur.couleur)}
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">{resp.secteur.nom}</p>
                                      <p className="text-sm text-orange-600">{resp.fonction}</p>
                                    </div>
                                  </div>
                                  {canWrite && (
                                    <button
                                      onClick={() => handleRetirer(membre.id, 'secteur', resp.secteur.id)}
                                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                      title="Retirer du secteur"
                                    >
                                      <UserMinus className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal membre */}
      {showModalMembre && (
        <ModalAddMembre
          isOpen={showModalMembre}
          onClose={() => {
            setShowModalMembre(false)
            setEditingMembre(null)
          }}
          onSuccess={handleMembreSuccess}
          editingMembre={editingMembre}
          availableConseils={conseilsDisponibles}
          availableSecteurs={secteursDisponibles}
          user={user}
        />
      )}
    </div>
  )
}