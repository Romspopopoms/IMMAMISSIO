// ============================================================================
// src/app/dashboard/pastorale/PastoraleClient.js - Composant client mis à jour
// ============================================================================
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Plus, Users, Crown, Edit3, Trash2, Phone, Mail, 
  Building, Settings, UserPlus, Shield, Calendar, MessageCircle,
  Palette, Music, Heart, Book, Lightbulb, Target, Star, 
  CheckCircle, AlertTriangle, ExternalLink, TrendingUp, Activity,
  UserCheck, User, Search, MoreVertical, Clock, Loader
} from 'lucide-react'

// Import uniquement du modal prêtre (les autres sont maintenant des pages séparées)
import ModalAddPretre from '../../../components/ModalAddPretre'

const SECTEUR_ICONS = {
  'Users': Users,
  'Heart': Heart,
  'Music': Music,
  'Book': Book,
  'Lightbulb': Lightbulb,
  'Target': Target,
  'Star': Star,
  'Building': Building,
  'Calendar': Calendar,
  'MessageCircle': MessageCircle,
  'Shield': Shield
}

export default function PastoraleClient({ user, initialData }) {
  const router = useRouter()
  
  // ✅ États pour les données (initialisés avec les données du serveur)
  const [pretres, setPretres] = useState(initialData.pretres || [])
  const [secteurs] = useState(initialData.secteurs || [])
  const [conseils] = useState(initialData.conseils || [])
  const [membres] = useState(initialData.membres || [])
  
  // ✅ États pour les modals (seulement pour les prêtres)
  const [showModalPretre, setShowModalPretre] = useState(false)
  const [editingPretre, setEditingPretre] = useState(null)
  
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

  // ✅ Recharger les données après modification
  const reloadData = async () => {
    try {
      setLoading(true)
      // Actualiser la page pour recharger les données côté serveur
      window.location.reload()
    } catch (error) {
      console.error('Erreur rechargement:', error)
      showMessage('Erreur lors du rechargement des données', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Gestionnaires des modals (seulement pour les prêtres)
  const handlePretreSuccess = () => {
    setShowModalPretre(false)
    setEditingPretre(null)
    showMessage('Prêtre mis à jour avec succès', 'success')
    reloadData()
  }

  const handleAddPretre = () => {
    setEditingPretre(null)
    setShowModalPretre(true)
  }

  const handleEditPretre = (pretre) => {
    setEditingPretre(pretre)
    setShowModalPretre(true)
  }

  // ✅ Supprimer un prêtre
  const handleDeletePretre = async (pretreId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce prêtre ?')) return

    try {
      setLoading(true)
      
      const res = await fetch(`/api/pretres/${pretreId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erreur lors de la suppression')
      }

      showMessage('Prêtre supprimé avec succès', 'success')
      reloadData()
      
    } catch (error) {
      console.error('Erreur suppression:', error)
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

  // ✅ Fonction de filtrage pour la recherche (seulement pour les prêtres)
  const filteredPretres = pretres.filter(pretre => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      pretre.nom.toLowerCase().includes(searchLower) ||
      pretre.prenom?.toLowerCase().includes(searchLower) ||
      pretre.fonction.toLowerCase().includes(searchLower)
    )
  })

  // Statistiques
  const totalPretres = pretres.length
  const totalMembres = membres.length
  const totalConseils = conseils.length
  const totalSecteurs = secteurs.length

  const quickActions = [
    {
      title: 'Ajouter un prêtre',
      description: 'Équipe presbytérale',
      icon: Crown,
      action: () => handleAddPretre(),
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      title: 'Gérer les membres',
      description: 'Conseils et secteurs',
      icon: Users,
      action: () => router.push('/dashboard/pastorale/membres'),
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Gérer les conseils',
      description: 'Instances de gouvernance',
      icon: Building,
      action: () => router.push('/dashboard/pastorale/conseils'),
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Gérer les secteurs',
      description: 'Domaines d\'activité',
      icon: Shield,
      action: () => router.push('/dashboard/pastorale/secteurs'),
      gradient: 'from-orange-500 to-red-500'
    }
  ]

  const statsData = [
    {
      title: 'Prêtres',
      value: totalPretres.toString(),
      icon: Crown,
      change: 'Équipe presbytérale',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      title: 'Membres laïcs',
      value: totalMembres.toString(),
      icon: Users,
      change: 'Conseils et secteurs',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Conseils',
      value: totalConseils.toString(),
      icon: Building,
      change: 'Instances de gouvernance',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Secteurs',
      value: totalSecteurs.toString(),
      icon: Shield,
      change: 'Domaines d\'activités',
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
                href="/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Équipe Pastorale
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href={`/site/${user?.paroisse?.subdomain}/pastorale`}
                target="_blank"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Voir la page
              </Link>
              
              {canWrite && (
                <button
                  onClick={() => handleAddPretre()}
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Ajouter
                </button>
              )}
              
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
      </header>

      {/* Message de statut */}
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
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Équipe <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Pastorale</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Gérez votre équipe presbytérale, vos conseils paroissiaux et vos responsables de secteurs
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-12">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher dans l'équipe pastorale..."
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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

        {/* Actions rapides */}
        {canWrite && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Actions rapides</h2>
                <p className="text-gray-600">Gérez votre équipe en quelques clics</p>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Activity className="w-4 h-4 mr-2" />
                Gestion des équipes
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon
                return (
                  <button
                    key={index}
                    onClick={action.action}
                    className="group relative"
                  >
                    <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden h-full">
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                      <div className="relative z-10">
                        <div className={`w-16 h-16 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {action.description}
                        </p>
                        <div className="flex items-center text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Gérer</span>
                          <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Équipe presbytérale */}
        <div className="mb-12">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Équipe Presbytérale</h2>
                  <p className="text-gray-600">Prêtres, diacres et séminaristes</p>
                </div>
              </div>
              
              {canWrite && (
                <button
                  onClick={() => handleAddPretre()}
                  className="inline-flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Ajouter un prêtre
                </button>
              )}
            </div>

            {filteredPretres.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Crown className="w-12 h-12 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {searchTerm ? 'Aucun prêtre trouvé' : 'Aucun prêtre ajouté'}
                </h3>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  {searchTerm 
                    ? `Aucun prêtre ne correspond à "${searchTerm}"`
                    : 'Commencez par ajouter les membres de votre équipe presbytérale'
                  }
                </p>
                {!searchTerm && canWrite && (
                  <button
                    onClick={() => handleAddPretre()}
                    className="inline-flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all font-bold transform hover:scale-105 shadow-lg"
                  >
                    <Plus className="w-6 h-6 mr-3" />
                    Ajouter le premier prêtre
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPretres.map((pretre) => (
                  <div key={pretre.id} className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl overflow-hidden flex-shrink-0">
                        {pretre.photo ? (
                          <img src={pretre.photo} alt={`${pretre.prenom} ${pretre.nom}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Crown className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {canWrite && (
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEditPretre(pretre)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors bg-white rounded-xl shadow-sm"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeletePretre(pretre.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-xl shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {pretre.prenom} {pretre.nom}
                      </h3>
                      <p className="text-purple-700 font-medium mb-3">{pretre.fonction}</p>
                      
                      <div className="space-y-2 mb-4">
                        {pretre.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2" />
                            {pretre.email}
                          </div>
                        )}
                        {pretre.telephone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                            {pretre.telephone}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        {pretre.userId ? (
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
                        
                        <div className="text-xs text-gray-400">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {new Date(pretre.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Secteurs, Membres et Conseils */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Secteurs */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Secteurs</h3>
                <p className="text-gray-600">Domaines d'activités</p>
              </div>
            </div>
            
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4 text-3xl font-bold">{totalSecteurs}</p>
              <p className="text-gray-500 mb-4">secteur{totalSecteurs > 1 ? 's' : ''} d'activité{totalSecteurs > 1 ? 's' : ''}</p>
              {canWrite && (
                <Link 
                  href="/dashboard/pastorale/secteurs"
                  className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                >
                  Gérer les secteurs →
                </Link>
              )}
            </div>
          </div>

          {/* Membres laïcs */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Membres Laïcs</h3>
                <p className="text-gray-600">Conseils et secteurs</p>
              </div>
            </div>
            
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4 text-3xl font-bold">{totalMembres}</p>
              <p className="text-gray-500 mb-4">membre{totalMembres > 1 ? 's' : ''} actif{totalMembres > 1 ? 's' : ''}</p>
              {canWrite && (
                <Link 
                  href="/dashboard/pastorale/membres"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Gérer les membres →
                </Link>
              )}
            </div>
          </div>

          {/* Conseils paroissiaux */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Conseils</h3>
                <p className="text-gray-600">Instances de gouvernance</p>
              </div>
            </div>
            
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4 text-3xl font-bold">{totalConseils}</p>
              <p className="text-gray-500 mb-4">conseil{totalConseils > 1 ? 's' : ''} configuré{totalConseils > 1 ? 's' : ''}</p>
              {canWrite && (
                <Link 
                  href="/dashboard/pastorale/conseils"
                  className="text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  Gérer les conseils →
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal prêtre */}
      {showModalPretre && (
        <ModalAddPretre
          isOpen={showModalPretre}
          onClose={() => {
            setShowModalPretre(false)
            setEditingPretre(null)
          }}
          onSuccess={handlePretreSuccess}
          editingPretre={editingPretre}
          user={user}
        />
      )}
    </div>
  )
}