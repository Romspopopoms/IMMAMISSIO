'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, Calendar, User, Search, ChevronLeft, ChevronRight, Clock, BookOpen, ArrowRight, Filter, Grid, List, Upload } from 'lucide-react'
import { useEditable } from '../../../../hooks/useEditable'
import { EditableText } from '../../../../components/Editable'
import EditBar from '../../../../components/EditBar'

export default function ActualitesListClient({ paroisse: initialParoisse, actualites, pagination }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' ou 'list'
  const router = useRouter()

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

  // Filtrer les actualités par recherche
  const filteredActualites = searchTerm 
    ? actualites.filter(actu => 
        actu.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        actu.contenu.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : actualites

  const handleSearch = (e) => {
    e.preventDefault()
  }

  const goToPage = (pageNum) => {
    const editParam = isEditMode ? '?edit=true' : ''
    router.push(`/site/${paroisse.subdomain}/actualites${editParam}&page=${pageNum}`)
  }

  // Actualité mise en avant (la plus récente)
  const featuredActualite = actualites[0]
  const otherActualites = actualites.slice(1)

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

      {/* Hero Section - CORRIGÉ */}
      <section className="relative h-[600px] mt-16 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transform scale-105"
          style={{ 
            backgroundImage: `url('${getValue('actualitesHeroImage', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&h=1080&fit=crop')}')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-purple-900/70 to-pink-900/80" />
        
        {/* Bouton pour changer l'image en mode édition */}
        {isEditMode && (
          <div className="absolute top-4 left-4 z-20">
            <label className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg flex items-center cursor-pointer hover:bg-white transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      updateField('actualitesHeroImage', reader.result)
                    }
                    reader.readAsDataURL(file)
                  }
                }}
                className="hidden"
              />
              <Upload className="w-5 h-5 mr-2" />
              Changer l'image
            </label>
          </div>
        )}
        
        {/* Floating elements */}
        <div className="absolute top-20 right-20 opacity-20">
          <BookOpen className="w-32 h-32 text-white animate-pulse" />
        </div>
        <div className="absolute bottom-20 left-20 opacity-10">
          <Calendar className="w-24 h-24 text-white animate-bounce" />
        </div>
        
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="text-center max-w-4xl mx-auto">
              <div className="mb-8">
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium mb-6">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Toute l'actualité
                </span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  <EditableText
                    value={getValue('actualitesHeroTitle', 'Actualités')}
                    onChange={(value) => updateField('actualitesHeroTitle', value)}
                    isEditMode={isEditMode}
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"
                  />
                </span>
                <br />
                <EditableText
                  value={getValue('actualitesHeroSubtitle', 'de la Paroisse')}
                  onChange={(value) => updateField('actualitesHeroSubtitle', value)}
                  isEditMode={isEditMode}
                  className="text-white"
                />
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
                <EditableText
                  value={getValue('actualitesHeroDescription', `Suivez toute l'actualité de la paroisse ${paroisse.nom} et ne manquez aucun événement`)}
                  onChange={(value) => updateField('actualitesHeroDescription', value)}
                  isEditMode={isEditMode}
                  className="text-xl md:text-2xl text-white/90"
                  multiline={true}
                />
              </p>
              
              {/* Barre de recherche moderne */}
              <form onSubmit={handleSearch} className="max-w-lg mx-auto mb-8">
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher une actualité..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-white/90 backdrop-blur-md border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-lg placeholder-gray-500"
                  />
                </div>
              </form>

              <div className="flex justify-center">
                <span className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl text-white font-medium">
                  {pagination.totalActualites} actualité{pagination.totalActualites > 1 ? 's' : ''} publiée{pagination.totalActualites > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Breadcrumb & Contrôles */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href={`/site/${paroisse.subdomain}${isEditMode ? '?edit=true' : ''}`} className="hover:text-blue-600 transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Actualités</span>
          </nav>

          {/* Contrôles de vue */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Affichage :</span>
            <div className="flex bg-white rounded-xl p-1 shadow-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Résultats de recherche */}
        {searchTerm && (
          <div className="mb-8 p-4 bg-blue-50 rounded-2xl border border-blue-200">
            <p className="text-blue-800">
              {filteredActualites.length} résultat{filteredActualites.length > 1 ? 's' : ''} 
              pour "<span className="font-semibold">{searchTerm}</span>"
              <button
                onClick={() => setSearchTerm('')}
                className="ml-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Effacer
              </button>
            </p>
          </div>
        )}

        {/* Contenu principal */}
        {filteredActualites.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {searchTerm ? 'Aucun résultat trouvé' : 'Aucune actualité'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Essayez avec d\'autres mots-clés ou parcourez toutes les actualités'
                  : 'Les actualités apparaîtront ici dès qu\'elles seront publiées'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Voir toutes les actualités
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Actualité mise en avant */}
            {!searchTerm && featuredActualite && (
              <div className="mb-16">
                <div className="flex items-center mb-8">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mr-4">
                    À la une
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
                </div>
                
                <Link href={`/site/${paroisse.subdomain}/actualites/${featuredActualite.id}${isEditMode ? '?edit=true' : ''}`}>
                  <article className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                    <div className="grid lg:grid-cols-2 gap-0">
                      <div className="relative h-64 lg:h-full overflow-hidden">
                        {featuredActualite.image ? (
                          <img
                            src={featuredActualite.image}
                            alt={featuredActualite.titre}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <BookOpen className="w-24 h-24 text-white opacity-75" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      
                      <div className="p-8 lg:p-12 flex flex-col justify-center">
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span className="mr-6">
                            {new Date(featuredActualite.datePubli).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                          {featuredActualite.auteur && (
                            <>
                              <User className="w-4 h-4 mr-2" />
                              <span>{featuredActualite.auteur.prenom} {featuredActualite.auteur.nom}</span>
                            </>
                          )}
                        </div>
                        
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 group-hover:text-blue-600 transition-colors">
                          {featuredActualite.titre}
                        </h2>
                        
                        <p className="text-gray-600 text-lg leading-relaxed mb-8 line-clamp-4">
                          {featuredActualite.contenu.substring(0, 200)}...
                        </p>
                        
                        <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                          Lire l'article complet
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              </div>
            )}

            {/* Autres actualités */}
            <div className="mb-16">
              {!searchTerm && otherActualites.length > 0 && (
                <div className="flex items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mr-4">Toutes nos actualités</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                </div>
              )}
              
              {(() => {
                const articlesToShow = searchTerm ? filteredActualites : otherActualites;
                
                if (viewMode === 'grid') {
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {articlesToShow.map((actualite) => (
                        <article key={actualite.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                          <Link href={`/site/${paroisse.subdomain}/actualites/${actualite.id}${isEditMode ? '?edit=true' : ''}`}>
                            <div className="relative h-48 overflow-hidden">
                              {actualite.image ? (
                                <img
                                  src={actualite.image}
                                  alt={actualite.titre}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                  <BookOpen className="w-12 h-12 text-white opacity-75" />
                                </div>
                              )}
                              <div className="absolute top-4 left-4">
                                <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                                  {new Date(actualite.datePubli).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short'
                                  })}
                                </span>
                              </div>
                            </div>
                            
                            <div className="p-6">
                              <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                {actualite.titre}
                              </h3>
                              
                              <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                                {actualite.contenu.substring(0, 120)}...
                              </p>
                              
                              <div className="flex items-center justify-between">
                                {actualite.auteur && (
                                  <div className="flex items-center text-sm text-gray-500">
                                    <User className="w-4 h-4 mr-1" />
                                    <span>{actualite.auteur.prenom}</span>
                                  </div>
                                )}
                                
                                <div className="text-blue-600 font-medium group-hover:text-blue-700 flex items-center">
                                  Lire plus
                                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        </article>
                      ))}
                    </div>
                  );
                } else {
                  return (
                    <div className="space-y-6">
                      {articlesToShow.map((actualite) => (
                        <article key={actualite.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
                          <Link href={`/site/${paroisse.subdomain}/actualites/${actualite.id}${isEditMode ? '?edit=true' : ''}`}>
                            <div className="flex flex-col sm:flex-row">
                              <div className="relative w-full sm:w-64 h-48 sm:h-32 overflow-hidden">
                                {actualite.image ? (
                                  <img
                                    src={actualite.image}
                                    alt={actualite.titre}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <BookOpen className="w-8 h-8 text-white opacity-75" />
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1 p-6">
                                <div className="flex items-center text-sm text-gray-500 mb-2">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  <span className="mr-4">
                                    {new Date(actualite.datePubli).toLocaleDateString('fr-FR', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric'
                                    })}
                                  </span>
                                  {actualite.auteur && (
                                    <>
                                      <User className="w-4 h-4 mr-1" />
                                      <span>{actualite.auteur.prenom} {actualite.auteur.nom}</span>
                                    </>
                                  )}
                                </div>
                                
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                  {actualite.titre}
                                </h3>
                                
                                <p className="text-gray-600 line-clamp-2 mb-3">
                                  {actualite.contenu.substring(0, 150)}...
                                </p>
                                
                                <div className="text-blue-600 font-medium group-hover:text-blue-700 flex items-center">
                                  Lire l'article complet
                                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        </article>
                      ))}
                    </div>
                  );
                }
              })()}
            </div>

            {/* Pagination - CORRIGÉE */}
            {!searchTerm && pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <nav className="flex items-center space-x-2 bg-white rounded-2xl p-2 shadow-lg">
                  <button
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Précédent
                  </button>
                  
                  <div className="flex items-center space-x-1 px-2">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-10 h-10 rounded-xl font-medium transition-all ${
                          pageNum === pagination.page
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer moderne */}
      <footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ImaMissio
              </h3>
            </div>
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
              <Link href={`/site/${paroisse.subdomain}/agenda${isEditMode ? '?edit=true' : ''}`} className="text-gray-400 hover:text-white transition-colors">
                Agenda
              </Link>
              <Link href={`/site/${paroisse.subdomain}/don${isEditMode ? '?edit=true' : ''}`} className="text-gray-400 hover:text-white transition-colors">
                Faire un don
              </Link>
            </div>
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
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}