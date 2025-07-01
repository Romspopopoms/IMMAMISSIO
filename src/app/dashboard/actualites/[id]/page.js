// ============================================================================
// src/app/dashboard/actualites/[id]/page.js - Page de consultation avec cookies
// ============================================================================
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit3,
  Share2,
  Copy,
  Calendar,
  Clock,
  User,
  FileText,
  Eye,
  ExternalLink,
  Trash2,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Heart,
  Bookmark
} from 'lucide-react'

export default function ActualiteDetailPage({ params }) {
  const router = useRouter()
  const [actualiteId, setActualiteId] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actualite, setActualite] = useState(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setActualiteId(resolvedParams.id)
    }
    getParams()
  }, [params])

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

  // Charger l'actualité
  const fetchActualite = async () => {
    try {
      const res = await fetch(`/api/actualites/${actualiteId}`, {
        credentials: 'include'
      })
      
      if (res.ok) {
        const data = await res.json()
        setActualite(data.actualite)
      } else {
        setMessage('Actualité non trouvée')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      setMessage('Erreur lors du chargement de l\'actualité')
      setMessageType('error')
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
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (user && actualiteId) {
      fetchActualite()
    }
  }, [user, actualiteId])

  // Supprimer l'actualité
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/actualites/${actualiteId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (res.ok) {
        setMessage('Actualité supprimée avec succès')
        setMessageType('success')
        setTimeout(() => {
          router.push('/dashboard/actualites')
        }, 1000)
      } else {
        setMessage('Erreur lors de la suppression')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setMessage('Erreur lors de la suppression')
      setMessageType('error')
    }
    setShowDeleteModal(false)
  }

  // Copier le lien
  const copyLink = async () => {
    try {
      const url = `${window.location.origin}/site/${user?.paroisse?.subdomain}/actualites/${actualiteId}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erreur lors de la copie:', error)
    }
  }

  // Partager
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: actualite?.titre,
          text: actualite?.contenu.substring(0, 100) + '...',
          url: `${window.location.origin}/site/${user?.paroisse?.subdomain}/actualites/${actualiteId}`
        })
      } catch (error) {
        console.error('Erreur lors du partage:', error)
        copyLink()
      }
    } else {
      copyLink()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">Chargement de l'actualité...</p>
        </div>
      </div>
    )
  }

  if (!user || !actualite) return null

  const canEdit = ['CURE', 'PAROISSE_ADMIN', 'PRETRE'].includes(user.role)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link
                href="/dashboard/actualites"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Actualité
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleShare}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors rounded-xl hover:bg-blue-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </button>
              
              <Link
                href={`/site/${user?.paroisse?.subdomain}/actualites/${actualiteId}`}
                target="_blank"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Voir sur le site
              </Link>
              
              {canEdit && (
                <>
                  <Link
                    href={`/dashboard/actualites/${actualiteId}/edit`}
                    className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-medium"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Modifier
                  </Link>
                  
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </button>
                </>
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

      {/* Message de succès/erreur */}
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
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {actualite.titre}
            </span>
          </h1>
          <div className="flex items-center justify-center space-x-6 text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              <span>
                {actualite.datePubli 
                  ? new Date(actualite.datePubli).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : new Date(actualite.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                }
              </span>
            </div>
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              <span>{actualite.auteur?.prenom} {actualite.auteur?.nom}</span>
            </div>
            <span className={`px-3 py-1 rounded-full font-medium ${
              actualite.publiee 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {actualite.publiee ? 'Publié' : 'Brouillon'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Image de couverture */}
            {actualite.image && (
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                <img
                  src={actualite.image}
                  alt={actualite.titre}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            {/* Contenu de l'actualité */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">
                  {actualite.contenu}
                </div>
              </div>
            </div>

            {/* Actions d'engagement */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Actions
              </h3>
              
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleShare}
                  className="flex items-center px-6 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all transform hover:scale-105 font-medium"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Partager
                </button>
                
                <button
                  onClick={copyLink}
                  className={`flex items-center px-6 py-3 rounded-xl transition-all transform hover:scale-105 font-medium ${
                    copied 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Copy className="w-5 h-5 mr-2" />
                  {copied ? 'Copié !' : 'Copier le lien'}
                </button>
                
                <Link
                  href={`/site/${user?.paroisse?.subdomain}/actualites/${actualiteId}`}
                  target="_blank"
                  className="flex items-center px-6 py-3 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-all transform hover:scale-105 font-medium"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Voir sur le site
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-lg p-8 sticky top-8">
              
              {/* Informations */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Informations
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Statut</h4>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        actualite.publiee ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <span className={`font-medium ${
                        actualite.publiee ? 'text-green-700' : 'text-yellow-700'
                      }`}>
                        {actualite.publiee ? 'Publié' : 'Brouillon'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Auteur</h4>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {actualite.auteur?.prenom} {actualite.auteur?.nom}
                        </p>
                        <p className="text-sm text-gray-600">
                          {actualite.auteur?.role?.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Dates</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          Créé le {new Date(actualite.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>
                          Modifié le {new Date(actualite.updatedAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      {actualite.datePubli && (
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-2" />
                          <span>
                            Publié le {new Date(actualite.datePubli).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Contenu</h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="w-4 h-4 mr-2" />
                      <span>{actualite.contenu.length} caractères</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions de gestion */}
              {canEdit && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Gestion</h4>
                  <div className="space-y-3">
                    <Link
                      href={`/dashboard/actualites/${actualiteId}/edit`}
                      className="flex items-center w-full px-4 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-medium"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Modifier l'actualité
                    </Link>
                    
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center w-full px-4 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer l'actualité
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation rapide */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Navigation</h4>
                <div className="space-y-3">
                  <Link
                    href="/dashboard/actualites"
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors font-medium"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à la liste
                  </Link>
                  
                  <Link
                    href="/dashboard/actualites/new"
                    className="flex items-center text-blue-600 hover:text-blue-700 transition-colors font-medium"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Nouvelle actualité
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de suppression */}
        {showDeleteModal && (
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
                  Êtes-vous sûr de vouloir supprimer cette actualité <strong>"{actualite.titre}"</strong> ?
                  Cette action est irréversible.
                </p>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
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