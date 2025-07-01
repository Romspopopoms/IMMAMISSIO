// ============================================================================
// src/app/dashboard/pastorale/secteurs/SecteursManagementClient.js
// ============================================================================
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Plus, Edit3, Trash2, Users, Shield, Search, 
  CheckCircle, AlertTriangle, Settings, Mail, Phone,
  Palette, Calendar, MoreVertical, UserPlus, UserMinus
} from 'lucide-react'

// Import du modal secteur
import ModalAddSecteur from '../../../../components/ModalAddSecteur'

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

export default function SecteursManagementClient({ user, initialData }) {
  const router = useRouter()
  
  // ✅ États pour les données
  const [secteurs, setSecteurs] = useState(initialData.secteurs || [])
  const [membresDisponibles] = useState(initialData.membresDisponibles || [])
  
  // ✅ États pour les modals et UI
  const [showModalSecteur, setShowModalSecteur] = useState(false)
  const [editingSecteur, setEditingSecteur] = useState(null)
  const [selectedSecteur, setSelectedSecteur] = useState(null)
  const [showResponsables, setShowResponsables] = useState({})
  
  // ✅ États UI
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

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
  const handleSecteurSuccess = () => {
    setShowModalSecteur(false)
    setEditingSecteur(null)
    showMessage('Secteur mis à jour avec succès', 'success')
    reloadData()
  }

  const handleEdit = (secteur) => {
    setEditingSecteur(secteur)
    setShowModalSecteur(true)
  }

  const handleAdd = () => {
    setEditingSecteur(null)
    setShowModalSecteur(true)
  }

  // ✅ Supprimer un secteur
  const handleDelete = async (secteurId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce secteur ?')) return

    try {
      setLoading(true)
      
      const res = await fetch(`/api/secteurs/${secteurId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erreur lors de la suppression')
      }

      showMessage('Secteur supprimé avec succès', 'success')
      reloadData()
      
    } catch (error) {
      console.error('Erreur suppression:', error)
      showMessage(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Ajouter/retirer un responsable
  const handleResponsableAction = async (secteurId, membreId, action, fonction = 'Responsable') => {
    try {
      setLoading(true)
      
      let res
      if (action === 'add') {
        res = await fetch('/api/relations', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'add_to_secteur',
            membreId,
            secteurId,
            fonction
          })
        })
      } else {
        res = await fetch(`/api/relations?action=remove_from_secteur&membreId=${membreId}&secteurId=${secteurId}&fonction=${fonction}`, {
          method: 'DELETE',
          credentials: 'include'
        })
      }

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erreur lors de l\'opération')
      }

      showMessage(`Responsable ${action === 'add' ? 'ajouté' : 'retiré'} avec succès`, 'success')
      reloadData()
      
    } catch (error) {
      console.error('Erreur responsable:', error)
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
    return <IconComponent className="w-5 h-5" style={{ color: couleur }} />
  }

  // ✅ Filtrage par recherche
  const filteredSecteurs = secteurs.filter(secteur => 
    !searchTerm || 
    secteur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (secteur.description && secteur.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // ✅ Toggle affichage responsables
  const toggleResponsables = (secteurId) => {
    setShowResponsables(prev => ({
      ...prev,
      [secteurId]: !prev[secteurId]
    }))
  }

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
                Gestion des Secteurs
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
              Secteurs d'activités ({filteredSecteurs.length})
            </h2>
            <p className="text-gray-600 mt-1">
              Gérez les secteurs et leurs responsables
            </p>
          </div>
          
          {canWrite && (
            <button
              onClick={handleAdd}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau secteur
            </button>
          )}
        </div>

        {/* Barre de recherche */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un secteur..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        {/* Liste des secteurs */}
        {filteredSecteurs.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchTerm ? 'Aucun secteur trouvé' : 'Aucun secteur créé'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? `Aucun secteur ne correspond à "${searchTerm}"`
                : 'Commencez par créer votre premier secteur d\'activité'
              }
            </p>
            {!searchTerm && canWrite && (
              <button
                onClick={handleAdd}
                className="bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 flex items-center mx-auto"
              >
                <Plus className="w-5 h-5 mr-2" />
                Créer le premier secteur
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSecteurs.map((secteur) => (
              <div key={secteur.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* En-tête du secteur */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: secteur.couleur + '20' }}
                      >
                        {getSecteurIcon(secteur.icone, secteur.couleur)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {secteur.nom}
                        </h3>
                        {secteur.description && (
                          <p className="text-gray-600 mt-1">{secteur.description}</p>
                        )}
                        <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {secteur.responsables.length} responsable{secteur.responsables.length > 1 ? 's' : ''}
                          </span>
                          <span className="flex items-center">
                            <Palette className="w-4 h-4 mr-1" />
                            {secteur.couleur}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {canWrite && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleResponsables(secteur.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Gérer les responsables"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(secteur)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Modifier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(secteur.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section responsables (extensible) */}
                {showResponsables[secteur.id] && (
                  <div className="border-t bg-gray-50">
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-900">
                          Responsables du secteur
                        </h4>
                        {canWrite && (
                          <div className="text-sm">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleResponsableAction(secteur.id, e.target.value, 'add')
                                  e.target.value = ''
                                }
                              }}
                              className="border border-gray-300 rounded-md px-3 py-1"
                            >
                              <option value="">Ajouter un responsable</option>
                              {membresDisponibles
                                .filter(membre => !secteur.responsables.some(resp => resp.membre.id === membre.id))
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
                      
                      {secteur.responsables.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          Aucun responsable assigné
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {secteur.responsables.map((responsable) => (
                            <div key={responsable.id} className="bg-white rounded-lg p-4 border">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">
                                    {responsable.membre.prenom} {responsable.membre.nom}
                                  </h5>
                                  <p className="text-sm text-blue-600 font-medium">
                                    {responsable.fonction}
                                  </p>
                                  <div className="mt-2 space-y-1">
                                    {responsable.membre.email && (
                                      <div className="flex items-center text-sm text-gray-600">
                                        <Mail className="w-3 h-3 mr-2" />
                                        {responsable.membre.email}
                                      </div>
                                    )}
                                    {responsable.membre.telephone && (
                                      <div className="flex items-center text-sm text-gray-600">
                                        <Phone className="w-3 h-3 mr-2" />
                                        {responsable.membre.telephone}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {canWrite && (
                                  <button
                                    onClick={() => handleResponsableAction(
                                      secteur.id, 
                                      responsable.membre.id, 
                                      'remove', 
                                      responsable.fonction
                                    )}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Retirer du secteur"
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
      </div>

      {/* Modal secteur */}
      {showModalSecteur && (
        <ModalAddSecteur
          isOpen={showModalSecteur}
          onClose={() => {
            setShowModalSecteur(false)
            setEditingSecteur(null)
          }}
          onSuccess={handleSecteurSuccess}
          editingSecteur={editingSecteur}
          user={user}
        />
      )}
    </div>
  )
}