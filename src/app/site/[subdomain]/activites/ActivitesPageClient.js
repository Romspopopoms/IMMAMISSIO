// ============================================================================
// src/app/site/[subdomain]/activites/ActivitesPageClient.js - Composant client
// ============================================================================
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Menu, 
  X, 
  Clock, 
  Users, 
  Heart, 
  Book, 
  Church, 
  Hand, 
  Upload, 
  Star, 
  ArrowRight,
  Search,
  Filter,
  Music,
  Baby,
  GraduationCap,
  UserCheck,
  Palette,
  Wrench,
  HandHeart
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEditable } from '../../../../hooks/useEditable'
import { EditableText, EditableImage } from '../../../../components/Editable'
import EditBar from '../../../../components/EditBar'

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

// Couleurs par défaut pour les catégories
const defaultColors = {
  jeunesse: 'from-pink-500 to-red-500',
  catechese: 'from-blue-500 to-indigo-500',
  etudiant: 'from-green-500 to-teal-500',
  adultes: 'from-purple-500 to-violet-500',
  musique: 'from-yellow-500 to-orange-500',
  ateliers: 'from-gray-500 to-slate-500',
  solidarite: 'from-rose-500 to-pink-500'
}

export default function ActivitesPageClient({ paroisse: initialParoisse, sections: initialSections, isEditMode: initialEditMode = false }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
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
  } = useEditable(initialParoisse, initialEditMode)

  // Utiliser les données mises à jour
  const paroisse = { ...initialParoisse, ...data }
  const sections = initialSections

  // Filtrer les sections selon la recherche et la catégorie
  const filteredSections = sections.filter(section => {
    const matchesSearch = searchTerm === '' || 
      section.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.activites.some(activite => 
        activite.titre.toLowerCase().includes(searchTerm.toLowerCase())
      )
    
    const matchesCategory = selectedCategory === 'all' || section.nom === selectedCategory
    
    return matchesSearch && matchesCategory && section.activites.length > 0
  })

  // Statistiques
  const totalActivites = sections.reduce((acc, section) => acc + section.activites.length, 0)
  const totalCategories = sections.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <EditBar 
        isEditMode={isEditMode}
        hasChanges={hasChanges}
        saving={saving}
        onSave={saveChanges}
        onExit={exitEditMode}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href={`/site/${paroisse.subdomain}${isEditMode ? '?edit=true' : ''}`} className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ImaMissio
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href={`/site/${paroisse.subdomain}/paroisse${isEditMode ? '?edit=true' : ''}`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">La Paroisse</Link>
              <Link href={`/site/${paroisse.subdomain}/pastorale${isEditMode ? '?edit=true' : ''}`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Pastorale</Link>
              <Link href={`/site/${paroisse.subdomain}/sacrements${isEditMode ? '?edit=true' : ''}`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Sacrements</Link>
              <Link href={`/site/${paroisse.subdomain}/actualites${isEditMode ? '?edit=true' : ''}`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Actualités</Link>
              <Link href={`/site/${paroisse.subdomain}/agenda${isEditMode ? '?edit=true' : ''}`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Agenda</Link>
              <Link href={`/site/${paroisse.subdomain}/activites${isEditMode ? '?edit=true' : ''}`} className="text-sm font-medium text-blue-600 border-b-2 border-blue-600">Activités</Link>
              <Link href={`/site/${paroisse.subdomain}/don${isEditMode ? '?edit=true' : ''}`} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all">Don</Link>
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

      {/* Hero Section */}
      <section className="relative h-[600px] mt-16 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transform scale-105"
          style={{ 
            backgroundImage: `url('${getValue('activitesHeaderImage', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&h=1080&fit=crop')}')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-blue-900/70 to-indigo-900/80" />
        
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
                      updateField('activitesHeaderImage', reader.result)
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
          <Users className="w-32 h-32 text-white animate-pulse" />
        </div>
        <div className="absolute bottom-20 left-20 opacity-10">
          <Heart className="w-24 h-24 text-white animate-bounce" />
        </div>
        
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="text-center max-w-4xl mx-auto">
              <div className="mb-8">
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium mb-6">
                  <Star className="w-4 h-4 mr-2" />
                  Vie Paroissiale
                </span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
                <EditableText
                  value={getValue('activitesTitle', "Les Activités")}
                  onChange={(value) => updateField('activitesTitle', value)}
                  isEditMode={isEditMode}
                  className="text-6xl md:text-7xl font-black text-white leading-tight"
                />
                <br />
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  de la Paroisse
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
                <EditableText
                  value={getValue('activitesSubtitle', 'Découvrez toutes nos activités et rejoignez notre communauté')}
                  onChange={(value) => updateField('activitesSubtitle', value)}
                  isEditMode={isEditMode}
                  className="text-xl md:text-2xl text-white/90"
                />
              </p>

              {/* Statistiques */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-10">
                <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4">
                  <div className="text-3xl font-bold text-white">{totalActivites}</div>
                  <div className="text-white/80 text-sm">Activités</div>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4">
                  <div className="text-3xl font-bold text-white">{totalCategories}</div>
                  <div className="text-white/80 text-sm">Catégories</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => {
                    document.getElementById('categories-section')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    })
                  }}
                  className="bg-white text-purple-900 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-purple-50 transition-all transform hover:scale-105 shadow-xl"
                >
                  <Users className="w-5 h-5 inline mr-2" />
                  Découvrir les activités
                </button>
                <button 
                  onClick={() => {
                    document.getElementById('search-section')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    })
                  }}
                  className="bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/30 transition-all border border-white/30"
                >
                  <Search className="w-5 h-5 inline mr-2" />
                  Rechercher
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Recherche et Filtres */}
      <section id="search-section" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-3xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Trouvez l'activité qui vous correspond</h2>
              <p className="text-gray-600">Utilisez les filtres ci-dessous pour découvrir nos activités</p>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Barre de recherche */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher une activité..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  />
                </div>
              </div>
              
              {/* Filtre par catégorie */}
              <div className="lg:w-80">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg bg-white"
                >
                  <option value="all">Toutes les catégories</option>
                  {sections.map(section => (
                    <option key={section.id} value={section.nom}>
                      {section.titre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Catégories */}
      <section id="categories-section" className="py-20 bg-gradient-to-br from-slate-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-4">
              <Heart className="w-4 h-4 mr-2" />
              Nos Activités
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <EditableText
                value={getValue('categoriesTitle', 'Découvrez nos Catégories')}
                onChange={(value) => updateField('categoriesTitle', value)}
                isEditMode={isEditMode}
                className="text-4xl md:text-5xl font-bold text-gray-900"
              />
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une diversité d'activités pour tous les âges et tous les goûts
            </p>
          </div>
          
          {filteredSections.length > 0 ? (
            <div className="space-y-16">
              {filteredSections.map((section) => {
                const IconComponent = categoryIcons[section.nom] || Users
                const gradientColor = section.couleur || defaultColors[section.nom] || 'from-gray-500 to-gray-600'
                
                return (
                  <div key={section.id} className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    {/* Header de la catégorie */}
                    <div className={`bg-gradient-to-r ${gradientColor} p-8`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-6">
                            <IconComponent className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-3xl font-bold text-white mb-2">{section.titre}</h3>
                            {section.description && (
                              <p className="text-white/90 text-lg">{section.description}</p>
                            )}
                          </div>
                        </div>
                        <Link
                          href={`/site/${paroisse.subdomain}/activites/${section.nom}${isEditMode ? '?edit=true' : ''}`}
                          className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl font-medium hover:bg-white/30 transition-all"
                        >
                          Voir tout
                          <ArrowRight className="w-4 h-4 inline ml-2" />
                        </Link>
                      </div>
                    </div>
                    
                    {/* Grille des activités */}
                    <div className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {section.activites.slice(0, 4).map((activite) => (
                          <Link
                            key={activite.id}
                            href={`/site/${paroisse.subdomain}/activites/${section.nom}/${activite.id}${isEditMode ? '?edit=true' : ''}`}
                            className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 hover:shadow-lg transition-all transform hover:-translate-y-1 border border-gray-100"
                          >
                            {activite.image && (
                              <div className="relative h-32 mb-4 rounded-xl overflow-hidden">
                                <Image
                                  src={activite.image}
                                  alt={activite.titre}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                            )}
                            
                            <h4 className="font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                              {activite.titre}
                            </h4>
                            
                            {activite.description && (
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {activite.description}
                              </p>
                            )}
                            
                            <div className="space-y-2 text-xs text-gray-500">
                              {activite.horaires && (
                                <div className="flex items-center">
                                  <Clock className="w-3 h-3 mr-2" />
                                  {activite.horaires}
                                </div>
                              )}
                              {activite.lieu && (
                                <div className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-2" />
                                  {activite.lieu}
                                </div>
                              )}
                              {(activite.ageMin || activite.ageMax) && (
                                <div className="flex items-center">
                                  <Users className="w-3 h-3 mr-2" />
                                  {activite.ageMin && activite.ageMax 
                                    ? `${activite.ageMin}-${activite.ageMax} ans`
                                    : activite.ageMin 
                                    ? `Dès ${activite.ageMin} ans`
                                    : `Jusqu'à ${activite.ageMax} ans`
                                  }
                                </div>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                      
                      {section.activites.length > 4 && (
                        <div className="text-center mt-8">
                          <Link
                            href={`/site/${paroisse.subdomain}/activites/${section.nom}${isEditMode ? '?edit=true' : ''}`}
                            className={`inline-flex items-center px-8 py-4 bg-gradient-to-r ${gradientColor} text-white rounded-2xl font-semibold hover:shadow-lg transition-all transform hover:scale-105`}
                          >
                            Voir les {section.activites.length - 4} autres activités
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-500 mb-2">Aucune activité trouvée</h3>
              <p className="text-gray-400">Essayez avec d'autres mots-clés ou filtres</p>
            </div>
          )}
        </div>
      </section>

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
              <Link href={`/site/${paroisse.subdomain}`} className="text-gray-400 hover:text-white transition-colors">
                Accueil
              </Link>
              <Link href={`/site/${paroisse.subdomain}/agenda`} className="text-gray-400 hover:text-white transition-colors">
                Agenda
              </Link>
              <Link href={`/site/${paroisse.subdomain}/actualites`} className="text-gray-400 hover:text-white transition-colors">
                Actualités
              </Link>
              <Link href={`/site/${paroisse.subdomain}/don`} className="text-gray-400 hover:text-white transition-colors">
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
      `}</style>
    </div>
  )
}