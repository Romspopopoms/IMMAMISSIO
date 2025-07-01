// ============================================================================
// src/app/site/[subdomain]/activites/[categorie]/CategorieActivitesClient.js - Composant client
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
  ArrowLeft,
  Search,
  Filter,
  Music,
  Baby,
  GraduationCap,
  UserCheck,
  Palette,
  Wrench,
  HandHeart,
  Info,
  Contact
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEditable } from '../../../../../hooks/useEditable'
import { EditableText, EditableImage } from '../../../../../components/Editable'
import EditBar from '../../../../../components/EditBar'

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

export default function CategorieActivitesClient({ paroisse: initialParoisse, section: initialSection, isEditMode: initialEditMode = false }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
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
  const section = initialSection

  // Filtrer les activités selon la recherche
  const filteredActivites = section.activites.filter(activite => {
    if (searchTerm === '') return true
    
    return activite.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
           activite.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           activite.responsable?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           activite.lieu?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const IconComponent = categoryIcons[section.nom] || Users
  const gradientColor = section.couleur || defaultColors[section.nom] || 'from-gray-500 to-gray-600'

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
            backgroundImage: `url('${section.image || getValue(`${section.nom}HeaderImage`, 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&h=1080&fit=crop')}')`
          }}
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor}/80 via-purple-900/70 to-indigo-900/80`} />
        
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
                      updateField(`${section.nom}HeaderImage`, reader.result)
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
          <IconComponent className="w-32 h-32 text-white animate-pulse" />
        </div>
        <div className="absolute bottom-20 left-20 opacity-10">
          <Users className="w-24 h-24 text-white animate-bounce" />
        </div>
        
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="max-w-4xl mx-auto text-center">
              {/* Breadcrumb */}
              <nav className="flex items-center justify-center space-x-2 text-white/80 text-sm mb-8">
                <Link href={`/site/${paroisse.subdomain}${isEditMode ? '?edit=true' : ''}`} className="hover:text-white transition-colors">
                  Accueil
                </Link>
                <span>/</span>
                <Link href={`/site/${paroisse.subdomain}/activites${isEditMode ? '?edit=true' : ''}`} className="hover:text-white transition-colors">
                  Activités
                </Link>
                <span>/</span>
                <span className="text-white font-medium">{section.titre}</span>
              </nav>

              {/* Badge catégorie */}
              <div className="mb-8">
                <span className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 backdrop-blur-md text-white text-lg font-medium mb-6">
                  <IconComponent className="w-6 h-6 mr-3" />
                  {section.titre}
                </span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  {section.titre}
                </span>
              </h1>
              
              {section.description && (
                <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
                  {section.description}
                </p>
              )}

              {/* Statistiques */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-10">
                <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4">
                  <div className="text-3xl font-bold text-white">{section.activites.length}</div>
                  <div className="text-white/80 text-sm">
                    {section.activites.length > 1 ? 'Activités' : 'Activité'}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => {
                    document.getElementById('activites-section')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    })
                  }}
                  className="bg-white text-purple-900 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-purple-50 transition-all transform hover:scale-105 shadow-xl"
                >
                  <Star className="w-5 h-5 inline mr-2" />
                  Découvrir les activités
                </button>
                <Link 
                  href={`/site/${paroisse.subdomain}/activites${isEditMode ? '?edit=true' : ''}`}
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-purple-900 transition-all transform hover:scale-105"
                >
                  <ArrowLeft className="w-5 h-5 inline mr-2" />
                  Toutes les activités
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Description détaillée */}
      {section.contenu && (
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <Info className="w-8 h-8 mr-4 text-purple-600" />
                À propos de nos activités {section.titre}
              </h2>
              
              <div className="prose prose-lg max-w-none">
                <EditableText
                  value={getValue(`${section.nom}Content`, section.contenu?.description || 'Contenu à ajouter...')}
                  onChange={(value) => updateField(`${section.nom}Content`, value)}
                  isEditMode={isEditMode}
                  className="text-gray-800 text-lg leading-relaxed"
                  multiline
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section Recherche */}
      <section className="py-12 bg-gradient-to-br from-slate-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Rechercher une activité</h2>
            </div>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom, description, responsable..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section Activités */}
      <section id="activites-section" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-4">
              <IconComponent className="w-4 h-4 mr-2" />
              {section.titre}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Nos Activités {section.titre}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {filteredActivites.length > 1 
                ? `${filteredActivites.length} activités disponibles`
                : filteredActivites.length === 1 
                ? '1 activité disponible'
                : 'Aucune activité trouvée'
              }
            </p>
          </div>
          
          {filteredActivites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredActivites.map((activite) => (
                <Link
                  key={activite.id}
                  href={`/site/${paroisse.subdomain}/activites/${section.nom}/${activite.id}${isEditMode ? '?edit=true' : ''}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    {activite.image ? (
                      <Image
                        src={activite.image}
                        alt={activite.titre}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${gradientColor} flex items-center justify-center`}>
                        <IconComponent className="w-16 h-16 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  </div>
                  
                  {/* Contenu */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                      {activite.titre}
                    </h3>
                    
                    {activite.description && (
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {activite.description}
                      </p>
                    )}
                    
                    {/* Informations pratiques */}
                    <div className="space-y-3 mb-4">
                      {activite.horaires && (
                        <div className="flex items-center text-gray-500">
                          <Clock className="w-4 h-4 mr-3 flex-shrink-0" />
                          <span className="text-sm">{activite.horaires}</span>
                        </div>
                      )}
                      
                      {activite.lieu && (
                        <div className="flex items-center text-gray-500">
                          <MapPin className="w-4 h-4 mr-3 flex-shrink-0" />
                          <span className="text-sm">{activite.lieu}</span>
                        </div>
                      )}
                      
                      {(activite.ageMin || activite.ageMax) && (
                        <div className="flex items-center text-gray-500">
                          <Users className="w-4 h-4 mr-3 flex-shrink-0" />
                          <span className="text-sm">
                            {activite.ageMin && activite.ageMax 
                              ? `${activite.ageMin}-${activite.ageMax} ans`
                              : activite.ageMin 
                              ? `Dès ${activite.ageMin} ans`
                              : `Jusqu'à ${activite.ageMax} ans`
                            }
                          </span>
                        </div>
                      )}
                      
                      {activite.responsable && (
                        <div className="flex items-center text-gray-500">
                          <Contact className="w-4 h-4 mr-3 flex-shrink-0" />
                          <span className="text-sm">{activite.responsable}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Bouton */}
                    <div className={`w-full bg-gradient-to-r ${gradientColor} text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all group-hover:scale-105 text-center`}>
                      En savoir plus
                      <ArrowRight className="w-4 h-4 inline ml-2" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-500 mb-2">Aucune activité trouvée</h3>
              <p className="text-gray-400">Essayez avec d'autres mots-clés</p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Section Contact */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Vous souhaitez rejoindre nos activités {section.titre} ?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              N'hésitez pas à nous contacter pour plus d'informations
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              {paroisse.telephone && (
                <a 
                  href={`tel:${paroisse.telephone}`}
                  className="flex items-center justify-center px-8 py-4 bg-blue-100 text-blue-700 rounded-2xl hover:bg-blue-200 transition-all transform hover:scale-105 font-semibold"
                >
                  <Phone className="w-5 h-5 mr-3" />
                  {paroisse.telephone}
                </a>
              )}
              
              {paroisse.email && (
                <a 
                  href={`mailto:${paroisse.email}`}
                  className="flex items-center justify-center px-8 py-4 bg-purple-100 text-purple-700 rounded-2xl hover:bg-purple-200 transition-all transform hover:scale-105 font-semibold"
                >
                  <Mail className="w-5 h-5 mr-3" />
                  Nous écrire
                </a>
              )}
            </div>
          </div>
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
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}