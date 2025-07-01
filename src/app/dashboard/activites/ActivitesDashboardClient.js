// ============================================================================
// src/app/dashboard/activites/ActivitesDashboardClient.js - Design moderne
// ============================================================================
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Plus, Activity, Users, Calendar, MapPin, Clock, 
  Settings, ExternalLink, TrendingUp, Search, Filter,
  Baby, Book, GraduationCap, UserCheck, Music, Wrench, HandHeart,
  CheckCircle, AlertTriangle, Edit3, Trash2, Eye, Building,
  MoreVertical, Star, Target
} from 'lucide-react'

// Icônes pour les catégories
const categoryIcons = {
  jeunesse: Baby,
  catechese: Book,
  etudiant: GraduationCap,
  adultes: UserCheck,
  musique: Music,
  ateliers: Wrench,
  solidarite: HandHeart
}

export default function ActivitesDashboardClient({ user, initialData }) {
  const router = useRouter()
  
  // ✅ États pour les données
  const [sections, setSections] = useState(initialData.sections || [])
  const [stats] = useState(initialData.stats || {})
  
  // ✅ États UI
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSection, setFilterSection] = useState('all')

  // ✅ Vérifier les permissions
  const canWrite = user && ['PAROISSE_ADMIN', 'SUPER_ADMIN'].includes(user.role)

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

  const showMessage = (text, type) => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => setMessage(''), 5000)
  }

  // ✅ Afficher l'icône d'une section
  const getSectionIcon = (sectionNom) => {
    const IconComponent = categoryIcons[sectionNom] || Activity
    return IconComponent
  }

  // ✅ Filtrage des sections
  const filteredSections = sections.filter(section => {
    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      if (
        !section.titre.toLowerCase().includes(searchLower) &&
        !section.description?.toLowerCase().includes(searchLower) &&
        !section.activites?.some(activite => 
          activite.titre.toLowerCase().includes(searchLower)
        )
      ) {
        return false
      }
    }

    // Filtre par section
    if (filterSection !== 'all' && section.nom !== filterSection) {
      return false
    }

    return true
  })

  // ✅ Statistiques pour l'affichage
  const statsData = [
    {
      title: 'Sections créées',
      value: stats.totalSections?.toString() || '0',
      icon: Building,
      change: 'Catégories disponibles',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Activités totales',
      value: stats.totalActivites?.toString() || '0',
      icon: Activity,
      change: 'Activités créées',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      title: 'Sections configurées',
      value: stats.sectionsAvecActivites?.toString() || '0',
      icon: CheckCircle,
      change: 'Avec activités',
      gradient: 'from-green-500 to-emerald-500'
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
                Voir sur le site
              </Link>
              
              {canWrite && (
                <Link
                  href="/dashboard/activites/activites"
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nouvelle activité
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
            Organisez et gérez toutes les activités de votre paroisse pour dynamiser votre communauté
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

        {/* Actions rapides */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Actions rapides</h2>
              <p className="text-gray-600">Gérez vos activités en quelques clics</p>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              {canWrite && (
                <>
                  <Link
                    href="/dashboard/activites/sections"
                    className="inline-flex items-center bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg"
                  >
                    <Building className="w-5 h-5 mr-2" />
                    Gérer les sections
                  </Link>
                  
                  <Link
                    href="/dashboard/activites/activites"
                    className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Nouvelle activité
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher dans les sections et activités..."
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

          {/* Vue d'ensemble des sections */}
          {filteredSections.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchTerm || filterSection !== 'all' 
                  ? 'Aucune section trouvée' 
                  : 'Aucune section créée'
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterSection !== 'all'
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Commencez par créer vos premières sections d\'activités'
                }
              </p>
              {(!searchTerm && filterSection === 'all') && canWrite && (
                <Link
                  href="/dashboard/activites/sections"
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Créer la première section
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredSections.map((section) => {
                const IconComponent = getSectionIcon(section.nom)
                
                return (
                  <div key={section.id} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between">
                      
                      {/* Informations de la section */}
                      <div className="flex items-start space-x-6 flex-1">
                        {/* Icône de la section */}
                        <div 
                          className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: section.couleur || '#6B7280' }}
                        >
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        
                        {/* Contenu */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-gray-900">{section.titre}</h3>
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm font-medium">
                              {section.nom}
                            </span>
                          </div>
                          
                          {section.description && (
                            <p className="text-gray-600 mb-4">{section.description}</p>
                          )}
                          
                          {/* Statistiques de la section */}
                          <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <Activity className="w-4 h-4 mr-2 text-blue-500" />
                              <span className="font-medium">
                                {section.activites?.length || 0} activité{(section.activites?.length || 0) > 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-green-500" />
                              <span>Créée le {new Date(section.createdAt).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>

                          {/* Aperçu des activités */}
                          {section.activites?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {section.activites.slice(0, 3).map((activite) => (
                                <div key={activite.id} className="bg-white rounded-xl p-3 border border-gray-100">
                                  <h5 className="font-semibold text-gray-900 text-sm mb-1">{activite.titre}</h5>
                                  <div className="flex items-center text-xs text-gray-500">
                                    {activite.horaires && (
                                      <>
                                        <Clock className="w-3 h-3 mr-1" />
                                        <span className="truncate">{activite.horaires}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {section.activites.length > 3 && (
                                <div className="bg-gray-100 rounded-xl p-3 flex items-center justify-center">
                                  <span className="text-sm text-gray-600 font-medium">
                                    +{section.activites.length - 3} autres
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                              <div className="flex items-center">
                                <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                                <span className="text-orange-700 font-medium">Aucune activité dans cette section</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      {canWrite && (
                        <div className="flex items-center space-x-2 ml-4">
                          <Link
                            href={`/site/${user?.paroisse?.subdomain}/activites/${section.nom}`}
                            target="_blank"
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Voir la page publique"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link
                            href="/dashboard/activites/sections"
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Gérer les sections"
                          >
                            <Edit3 className="w-5 h-5" />
                          </Link>
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Actions rapides pour cette section */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4 text-sm">
                        <Link
                          href={`/site/${user?.paroisse?.subdomain}/activites/${section.nom}`}
                          target="_blank"
                          className="flex items-center text-green-600 hover:text-green-700 font-medium"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Voir sur le site
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link
                          href="/dashboard/activites/activites"
                          className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Ajouter une activité
                        </Link>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Link
                          href="/dashboard/activites/sections"
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          Gérer cette section
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Guide de démarrage */}
        {sections.length === 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Bienvenue dans la gestion des activités !
              </h3>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Commencez par créer vos premières sections d'activités (jeunesse, catéchèse, musique...) 
                puis ajoutez les activités correspondantes pour organiser votre paroisse.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
                <div className="text-left">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <h4 className="font-bold text-gray-900">Créer des sections</h4>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Organisez vos activités par catégories : jeunesse, catéchèse, musique, etc.
                  </p>
                </div>
                
                <div className="text-left">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-purple-600 font-bold">2</span>
                    </div>
                    <h4 className="font-bold text-gray-900">Ajouter des activités</h4>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Détaillez chaque activité avec horaires, lieu, responsable et informations pratiques.
                  </p>
                </div>
              </div>
              
              {canWrite && (
                <Link
                  href="/dashboard/activites/sections"
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all font-bold text-lg shadow-lg transform hover:scale-105"
                >
                  <Plus className="w-6 h-6 mr-3" />
                  Commencer maintenant
                </Link>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}