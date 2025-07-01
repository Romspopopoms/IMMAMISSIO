'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Calendar, User, ArrowLeft, Share2, Facebook, Twitter, Clock, BookOpen, Home, ChevronRight } from 'lucide-react'
import { useEditable } from '../../../../../hooks/useEditable'
import EditBar from '../../../../../components/EditBar'

export default function ActualiteDetailClient({ actualite, paroisse: initialParoisse }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Hook d'édition
  const {
    isEditMode,
    hasChanges,
    saving,
    updateField,
    saveChanges,
    exitEditMode,
    getValue,
    data
  } = useEditable(initialParoisse)

  // Utiliser les données mises à jour
  const paroisse = { ...initialParoisse, ...data }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  
  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(actualite.titre)}`, '_blank')
  }

  // Filtrer les autres actualités (exclure l'actuelle)
  const otherActualites = paroisse.actualites.filter(actu => actu.id !== actualite.id).slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <EditBar 
        isEditMode={isEditMode}
        hasChanges={hasChanges}
        saving={saving}
        onSave={saveChanges}
        onExit={exitEditMode}
      />
      
      {/* Header - CORRIGÉ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href={`/site/${paroisse.subdomain}${isEditMode ? '?edit=true' : ''}`} className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ImaMissio
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href={`/site/${paroisse.subdomain}/paroisse${isEditMode ? '?edit=true' : ''}`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                La Paroisse
              </Link>
              <Link href={`/site/${paroisse.subdomain}/pastorale${isEditMode ? '?edit=true' : ''}`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Pastorale
              </Link>
              <Link href={`/site/${paroisse.subdomain}/sacrements${isEditMode ? '?edit=true' : ''}`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Sacrements
              </Link>
              <Link href={`/site/${paroisse.subdomain}/actualites${isEditMode ? '?edit=true' : ''}`} className="text-sm font-medium text-blue-600 border-b-2 border-blue-600">
                Actualités
              </Link>
              <Link href={`/site/${paroisse.subdomain}/agenda${isEditMode ? '?edit=true' : ''}`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Agenda
              </Link>
              <Link href={`/site/${paroisse.subdomain}/activites${isEditMode ? '?edit=true' : ''}`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Activités
              </Link>
              <Link href={`/site/${paroisse.subdomain}/don${isEditMode ? '?edit=true' : ''}`} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all">
                Don
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Breadcrumb - CORRIGÉ */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
            <Link href={`/site/${paroisse.subdomain}${isEditMode ? '?edit=true' : ''}`} className="hover:text-blue-600 transition-colors flex items-center">
              <Home className="w-4 h-4 mr-1" />
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/site/${paroisse.subdomain}/actualites${isEditMode ? '?edit=true' : ''}`} className="hover:text-blue-600 transition-colors">
              Actualités
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Article</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Article principal */}
            <div className="lg:col-span-2">
              <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
                
                {/* Image de couverture */}
                {actualite.image && (
                  <div className="relative h-64 md:h-96">
                    <img
                      src={actualite.image}
                      alt={actualite.titre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-8">
                  {/* Meta informations */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>
                        {new Date(actualite.datePubli).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    {actualite.auteur && (
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        <span>Par {actualite.auteur.prenom} {actualite.auteur.nom}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{Math.ceil(actualite.contenu.length / 1000)} min de lecture</span>
                    </div>
                  </div>

                  {/* Titre */}
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight">
                    {actualite.titre}
                  </h1>

                  {/* Contenu */}
                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                    {actualite.contenu.split('\n').map((paragraph, index) => (
                      paragraph.trim() && (
                        <p key={index} className="mb-6">
                          {paragraph}
                        </p>
                      )
                    ))}
                  </div>

                  {/* Partage */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Partager cet article</h3>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={shareOnFacebook}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Facebook className="w-4 h-4" />
                            <span>Facebook</span>
                          </button>
                          <button
                            onClick={shareOnTwitter}
                            className="flex items-center space-x-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                          >
                            <Twitter className="w-4 h-4" />
                            <span>Twitter</span>
                          </button>
                        </div>
                      </div>
                      
                      <Link
                        href={`/site/${paroisse.subdomain}/actualites${isEditMode ? '?edit=true' : ''}`}
                        className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour aux actualités
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-8">
                
                {/* Autres actualités */}
                {otherActualites.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Autres actualités</h3>
                    <div className="space-y-4">
                      {otherActualites.map((actu) => (
                        <Link
                          key={actu.id}
                          href={`/site/${paroisse.subdomain}/actualites/${actu.id}${isEditMode ? '?edit=true' : ''}`}
                          className="block group hover:bg-gray-50 rounded-lg p-3 transition-colors"
                        >
                          <div className="flex space-x-3">
                            <div className="flex-shrink-0">
                              {actu.image ? (
                                <img
                                  src={actu.image}
                                  alt={actu.titre}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                  <BookOpen className="w-6 h-6 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2 transition-colors">
                                {actu.titre}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(actu.datePubli).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    
                    <div className="mt-6">
                      <Link
                        href={`/site/${paroisse.subdomain}/actualites${isEditMode ? '?edit=true' : ''}`}
                        className="block text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Voir toutes les actualités
                      </Link>
                    </div>
                  </div>
                )}

                {/* À propos */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{paroisse.nom}</h3>
                  <p className="text-gray-600 mb-6">
                    Découvrez notre communauté paroissiale et participez à la vie spirituelle de notre église.
                  </p>
                  <Link
                    href={`/site/${paroisse.subdomain}/paroisse${isEditMode ? '?edit=true' : ''}`}
                    className="block bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    En savoir plus
                  </Link>
                </div>

                {/* Horaires */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Horaires des célébrations</h3>
                  {paroisse.horaires && paroisse.horaires.length > 0 ? (
                    <div className="space-y-3">
                      {paroisse.horaires
                        .sort((a, b) => a.jourSemaine - b.jourSemaine)
                        .slice(0, 5)
                        .map((horaire, index) => {
                          const joursNoms = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
                          return (
                            <div key={index} className="flex justify-between items-center py-1">
                              <div>
                                <span className="text-gray-600 font-medium">{joursNoms[horaire.jourSemaine]}</span>
                                <span className="text-xs text-gray-500 ml-2 capitalize">({horaire.typeOffice})</span>
                              </div>
                              <span className="font-bold text-gray-900">{horaire.heure}</span>
                            </div>
                          )
                        })}
                      {paroisse.horaires.length > 5 && (
                        <p className="text-xs text-gray-500 text-center mt-2">
                          +{paroisse.horaires.length - 5} autres horaires
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Horaires à venir</p>
                  )}
                  <Link
                    href={`/site/${paroisse.subdomain}/agenda${isEditMode ? '?edit=true' : ''}`}
                    className="block mt-4 text-blue-600 hover:text-blue-700 font-medium text-center"
                  >
                    Voir tous les horaires →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - CORRIGÉ */}
      <footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 mb-4">
            © 2024 {paroisse.nom}. Site créé avec{' '}
            <a href="https://imamissio.com" className="text-blue-400 hover:text-blue-300 transition-colors">
              ImaMissio
            </a>
          </p>
          <div className="flex justify-center space-x-6">
            <Link href={`/site/${paroisse.subdomain}${isEditMode ? '?edit=true' : ''}`} className="text-gray-400 hover:text-white transition-colors">
              Accueil
            </Link>
            <Link href={`/site/${paroisse.subdomain}/actualites${isEditMode ? '?edit=true' : ''}`} className="text-gray-400 hover:text-white transition-colors">
              Actualités
            </Link>
            <Link href={`/site/${paroisse.subdomain}/agenda${isEditMode ? '?edit=true' : ''}`} className="text-gray-400 hover:text-white transition-colors">
              Agenda
            </Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}