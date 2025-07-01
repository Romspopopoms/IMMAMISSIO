
// ============================================================================
// FICHIER 2 : src/app/dashboard/dons/DashboardDonsClient.js - Composant client
// ============================================================================
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Plus, 
  Heart, 
  Target, 
  Euro, 
  Edit3, 
  Eye, 
  Users,
  TrendingUp,
  Settings,
  Filter,
  Search,
  MoreVertical,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

export default function DashboardDonsClient({ 
  initialProjets = [], 
  initialThemes = [], 
  initialStats = {},
  successMessage,
  user
}) {
  // ✅ Utiliser directement les données du serveur
  const [projets] = useState(initialProjets)
  const [themes] = useState(initialThemes)
  const [stats] = useState(initialStats)
  const [filterTheme, setFilterTheme] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuccessMessage, setShowSuccessMessage] = useState(!!successMessage)

  // Masquer le message de succès après 5 secondes
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showSuccessMessage])

  const filteredProjets = projets.filter(projet => {
    const matchesTheme = filterTheme === 'all' || projet.source === filterTheme
    const matchesSearch = projet.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         projet.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesTheme && matchesSearch
  })

  const getPercentage = (collecte, objectif) => {
    if (!objectif || objectif === 0) return 0
    return Math.min(Math.round((collecte / objectif) * 100), 100)
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount || 0)
  }

  const getSourceBadge = (projet) => {
    if (projet.source === 'une') {
      return { label: 'À la une', color: 'bg-yellow-100 text-yellow-800' }
    }
    if (projet.source === 'database') {
      return { label: 'Base de données', color: 'bg-green-100 text-green-800' }
    }
    return { 
      label: projet.themeName || projet.source, 
      color: 'bg-blue-100 text-blue-800' 
    }
  }

  const getSuccessMessageText = (type) => {
    switch (type) {
      case 'project-created':
        return 'Projet créé avec succès !'
      case 'project-updated':
        return 'Projet mis à jour avec succès !'
      case 'project-deleted':
        return 'Projet supprimé avec succès !'
      default:
        return 'Action effectuée avec succès !'
    }
  }

  // ✅ Vérifier les permissions côté client également
  const canEdit = user.role === 'SUPER_ADMIN' || user.role === 'PAROISSE_ADMIN'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Message de succès */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span className="font-medium">{getSuccessMessageText(successMessage)}</span>
          <button 
            onClick={() => setShowSuccessMessage(false)}
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
                href="/dashboard"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Gestion des Dons
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user?.paroisse?.subdomain && (
                <Link
                  href={`/site/${user.paroisse.subdomain}/don`}
                  target="_blank"
                  className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Voir sur le site
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Gestion des <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Dons</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Gérez vos projets de collecte, créez des thématiques et suivez l'évolution de vos dons en temps réel
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                <Euro className="w-7 h-7 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Total collecté
            </p>
            <p className="text-3xl font-black text-gray-900">
              {formatAmount(stats.totalCollecte)}€
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <Target className="w-7 h-7 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Projets actifs
            </p>
            <p className="text-3xl font-black text-gray-900">
              {stats.nombreProjets}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Objectifs atteints
            </p>
            <p className="text-3xl font-black text-gray-900">
              {stats.objectifsAtteints}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-indigo-500" />
            </div>
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Donateurs uniques
            </p>
            <p className="text-3xl font-black text-gray-900">
              {stats.donateursTotal}
            </p>
          </div>
        </div>

        {/* Actions et Filtres */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Mes projets de collecte</h2>
              <p className="text-gray-600">Gérez vos projets et suivez leur progression</p>
            </div>
            
            {/* ✅ Afficher les actions seulement si l'utilisateur a les permissions */}
            {canEdit && (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Link
                  href="/dashboard/dons/themes"
                  className="inline-flex items-center bg-purple-600 text-white px-6 py-3 rounded-2xl hover:bg-purple-700 transition-all font-semibold"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Gérer les thématiques
                </Link>
                <Link
                  href="/dashboard/dons/new"
                  className="inline-flex items-center bg-gradient-to-r from-rose-600 to-pink-600 text-white px-6 py-3 rounded-2xl hover:from-rose-700 hover:to-pink-700 transition-all font-semibold shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nouveau projet
                </Link>
              </div>
            )}
          </div>

          {/* ✅ Message d'information si pas de permissions */}
          {!canEdit && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-blue-800">
                Vous avez accès en lecture seule aux projets de dons. Contactez votre administrateur pour obtenir les permissions d'édition.
              </span>
            </div>
          )}

          {/* Filtres */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un projet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterTheme}
                onChange={(e) => setFilterTheme(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
              >
                <option value="all">Toutes les thématiques</option>
                <option value="une">À la une</option>
                <option value="database">Base de données</option>
                {themes.map(theme => (
                  <option key={theme.id} value={theme.id}>{theme.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Liste des projets */}
          {filteredProjets.length > 0 ? (
            <div className="grid gap-6">
              {filteredProjets.map((projet) => {
                const sourceBadge = getSourceBadge(projet)
                const percentage = getPercentage(projet.collecte || 0, projet.objectif)
                const isCompleted = (projet.collecte || 0) >= projet.objectif
                
                return (
                  <div key={projet.id} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start space-x-6">
                      {/* Image */}
                      <div className="relative w-32 h-32 flex-shrink-0">
                        <img 
                          src={projet.image || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=300&fit=crop'} 
                          alt={projet.titre}
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${sourceBadge.color}`}>
                            {sourceBadge.label}
                          </span>
                        </div>
                      </div>

                      {/* Contenu */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{projet.titre}</h3>
                            <p className="text-gray-600 line-clamp-2">{projet.description}</p>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {user?.paroisse?.subdomain && (
                              <Link
                                href={`/site/${user.paroisse.subdomain}/don/projet/${projet.id}`}
                                target="_blank"
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Voir sur le site"
                              >
                                <Eye className="w-5 h-5" />
                              </Link>
                            )}
                            {/* ✅ Afficher les actions d'édition seulement si autorisé */}
                            {canEdit && (
                              <Link
                                href={`/dashboard/dons/edit/${projet.id}`}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Modifier"
                              >
                                <Edit3 className="w-5 h-5" />
                              </Link>
                            )}
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Progression */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span className="font-medium">
                              {formatAmount(projet.collecte || 0)}€ collectés
                            </span>
                            <span>Objectif : {formatAmount(projet.objectif)}€</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${
                                isCompleted 
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                  : 'bg-gradient-to-r from-blue-500 to-purple-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center text-gray-600">
                              <Users className="w-4 h-4 mr-1" />
                              <span>{projet.nombreDonateurs || 0} donateurs</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              {isCompleted ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                                  <span className="text-green-600 font-medium">Objectif atteint</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-4 h-4 mr-1 text-blue-500" />
                                  <span className="text-blue-600 font-medium">{percentage}% collecté</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchTerm || filterTheme !== 'all' ? 'Aucun projet trouvé' : 'Aucun projet de don'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterTheme !== 'all' 
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Créez votre premier projet de collecte pour commencer'
                }
              </p>
              {(!searchTerm && filterTheme === 'all' && canEdit) && (
                <Link
                  href="/dashboard/dons/new"
                  className="inline-flex items-center bg-gradient-to-r from-rose-600 to-pink-600 text-white px-6 py-3 rounded-2xl hover:from-rose-700 hover:to-pink-700 transition-all font-semibold"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Créer mon premier projet
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}