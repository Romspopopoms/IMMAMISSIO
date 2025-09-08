'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Phone, Mail, ChevronLeft, ChevronRight, Menu, X, Clock, Users, Heart, Book, Church, Hand, FileText, Upload, Star, ArrowRight, Play, Eye, Gift } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEditable } from '../../../hooks/useEditable'
import { EditableText, EditableImage } from '../../../components/Editable'
import EditBar from '../../../components/EditBar'

const joursSemaine = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

// Composant Carousel modernisé
function Carousel({ children, className = "" }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollContainerRef = useRef(null)

  const itemsCount = Array.isArray(children) ? children.length : 1
  const maxIndex = Math.max(0, itemsCount - 3) // 3 cartes visibles

  const scrollTo = (index) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const itemWidth = 384 // Largeur d'une carte + gap
      container.scrollTo({
        left: itemWidth * index,
        behavior: 'smooth'
      })
      setCurrentIndex(index)
    }
  }

  const handlePrev = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (currentIndex > 0) {
      scrollTo(currentIndex - 1)
    }
  }

  const handleNext = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (currentIndex < maxIndex) {
      scrollTo(currentIndex + 1)
    }
  }

  const showArrows = itemsCount > 3

  return (
    <div className={`relative ${className}`}>
      {showArrows && (
        <>
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`absolute -left-6 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl transition-all ${
              currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:scale-110 hover:bg-white'
            }`}
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex >= maxIndex}
            className={`absolute -right-6 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl transition-all ${
              currentIndex >= maxIndex ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:scale-110 hover:bg-white'
            }`}
          >
            <ChevronRight className="w-6 h-6 text-gray-900" />
          </button>
        </>
      )}

      <div className="overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export default function ParishSiteClient({ paroisse: initialParoisse }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

  // Regrouper les horaires par jour
  const horairesByDay = paroisse.horaires.reduce((acc, horaire) => {
    const jour = horaire.jourSemaine
    if (!acc[jour]) {
      acc[jour] = []
    }
    acc[jour].push(horaire)
    return acc
  }, {})

  // Cartes de navigation principales - MODERNISÉES
  const navigationCards = [
    { 
      label: "La Paroisse", 
      href: `/site/${paroisse.subdomain}/paroisse`,
      icon: <Church className="w-8 h-8 mb-3" />,
      gradient: "from-blue-500 to-cyan-500",
      description: "Notre histoire et notre mission"
    },
    { 
      label: "Événements", 
      href: `/site/${paroisse.subdomain}/agenda`,
      icon: <Calendar className="w-8 h-8 mb-3" />,
      gradient: "from-purple-500 to-pink-500",
      description: "Prochains rendez-vous"
    },
    { 
      label: "Sacrements", 
      href: `/site/${paroisse.subdomain}/sacrements`,
      icon: <Book className="w-8 h-8 mb-3" />,
      gradient: "from-green-500 to-emerald-500",
      description: "Les 7 sacrements de l'Église"
    },
    { 
      label: "Jeunesse", 
      href: `/site/${paroisse.subdomain}/activites/jeunesse`,
      icon: <Users className="w-8 h-8 mb-3" />,
      gradient: "from-orange-500 to-red-500",
      description: "Activités pour les jeunes"
    },
    { 
      label: "Actualités", 
      href: `/site/${paroisse.subdomain}/actualites`,
      icon: <FileText className="w-8 h-8 mb-3" />,
      gradient: "from-indigo-500 to-purple-500",
      description: "Dernières nouvelles"
    },
    { 
      label: "Faire un Don", 
      href: `/site/${paroisse.subdomain}/don`,
      icon: <Heart className="w-8 h-8 mb-3" />,
      gradient: "from-rose-500 to-pink-500",
      description: "Soutenir notre paroisse"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <EditBar 
        isEditMode={isEditMode}
        hasChanges={hasChanges}
        saving={saving}
        onSave={saveChanges}
        onExit={exitEditMode}
      />

      {/* Header - MODERNISÉ */}
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
              <Link href={`/site/${paroisse.subdomain}/activites${isEditMode ? '?edit=true' : ''}`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Activités</Link>
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

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200">
            <div className="px-4 py-2 space-y-1">
              <Link href={`/site/${paroisse.subdomain}/paroisse${isEditMode ? '?edit=true' : ''}`} className="block py-2 text-sm text-gray-700">La Paroisse</Link>
              <Link href={`/site/${paroisse.subdomain}/pastorale${isEditMode ? '?edit=true' : ''}`} className="block py-2 text-sm text-gray-700">Pastorale</Link>
              <Link href={`/site/${paroisse.subdomain}/sacrements${isEditMode ? '?edit=true' : ''}`} className="block py-2 text-sm text-gray-700">Sacrements</Link>
              <Link href={`/site/${paroisse.subdomain}/actualites${isEditMode ? '?edit=true' : ''}`} className="block py-2 text-sm text-gray-700">Actualités</Link>
              <Link href={`/site/${paroisse.subdomain}/agenda${isEditMode ? '?edit=true' : ''}`} className="block py-2 text-sm text-gray-700">Agenda</Link>
              <Link href={`/site/${paroisse.subdomain}/activites${isEditMode ? '?edit=true' : ''}`} className="block py-2 text-sm text-gray-700">Activités</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section - COMPLÈTEMENT MODERNISÉ */}
      <section className="relative h-[700px] mt-16 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transform scale-105"
          style={{ 
            backgroundImage: `url('${getValue('headerImage', 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1920&h=1080&fit=crop')}')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-green-900/80" />
        
        {/* Floating elements */}
        <div className="absolute top-20 right-20 opacity-20">
          <Church className="w-32 h-32 text-white animate-pulse" />
        </div>
        <div className="absolute bottom-20 left-20 opacity-10">
          <Heart className="w-24 h-24 text-white animate-bounce" />
        </div>
        
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
                      updateField('headerImage', reader.result)
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
        
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="text-center max-w-4xl mx-auto">
              <div className="mb-8">
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium mb-6">
                  <Church className="w-4 h-4 mr-2" />
                  <EditableText
                    value={getValue('welcomeText', 'Bienvenue')}
                    onChange={(value) => updateField('welcomeText', value)}
                    isEditMode={isEditMode}
                    className="text-white text-sm font-medium"
                  />
                </span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
                <EditableText
                  value={getValue('headerTitle', 'À la paroisse')}
                  onChange={(value) => updateField('headerTitle', value)}
                  isEditMode={isEditMode}
                  className="text-6xl md:text-7xl font-black text-white"
                />
                <br />
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  {paroisse.nom}
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed italic">
                <EditableText
                  value={getValue('headerSubtitle', 'Une communauté accueillante qui vit sa foi au quotidien et partage l\'amour du Christ.')}
                  onChange={(value) => updateField('headerSubtitle', value)}
                  isEditMode={isEditMode}
                  className="text-xl md:text-2xl text-white/90 italic"
                  multiline={true}
                />
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link 
                  href={`/site/${paroisse.subdomain}/paroisse${isEditMode ? '?edit=true' : ''}`}
                  className="bg-white text-blue-900 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
                >
                  <Church className="w-5 h-5 inline mr-2" />
                  <EditableText
                    value={getValue('discoverButtonText', 'Découvrir notre paroisse')}
                    onChange={(value) => updateField('discoverButtonText', value)}
                    isEditMode={isEditMode}
                    className=""
                  />
                </Link>
                <Link 
                  href={`/site/${paroisse.subdomain}/agenda${isEditMode ? '?edit=true' : ''}`}
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-blue-900 transition-all transform hover:scale-105"
                >
                  <Calendar className="w-5 h-5 inline mr-2" />
                  Voir les événements
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Navigation - MODERNISÉE */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
              <Star className="w-4 h-4 mr-2" />
              Navigation
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <EditableText
                value={getValue('navigationTitle', 'Explorez notre paroisse')}
                onChange={(value) => updateField('navigationTitle', value)}
                isEditMode={isEditMode}
                className="text-4xl md:text-5xl font-bold text-gray-900"
              />
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              <EditableText
                value={getValue('navigationSubtitle', 'Découvrez toutes les facettes de notre communauté paroissiale')}
                onChange={(value) => updateField('navigationSubtitle', value)}
                isEditMode={isEditMode}
                className="text-xl text-gray-600"
              />
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {navigationCards.map((card, index) => (
              <Link
                key={index}
                href={`${card.href}${isEditMode ? '?edit=true' : ''}`}
                className="group"
              >
                <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden h-80">
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-90`}></div>
                  <div className="relative z-10 h-full flex flex-col items-center justify-center text-white p-8 text-center">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      {card.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{card.label}</h3>
                    <p className="text-white/90 mb-6 leading-relaxed">{card.description}</p>
                    <div className="flex items-center text-sm font-medium opacity-90 group-hover:opacity-100 transition-opacity">
                      <span>Découvrir</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section Actualités - MODERNISÉE */}
      {paroisse.actualites && paroisse.actualites.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-16">
              <div>
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-4">
                  <FileText className="w-4 h-4 mr-2" />
                  À la une
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  <EditableText
                    value={getValue('newsTitle', 'Dernières actualités')}
                    onChange={(value) => updateField('newsTitle', value)}
                    isEditMode={isEditMode}
                    className="text-4xl md:text-5xl font-bold text-gray-900"
                  />
                </h2>
                <p className="text-xl text-gray-600">
                  Restez informé de la vie de notre communauté
                </p>
              </div>
              <Link 
                href={`/site/${paroisse.subdomain}/actualites${isEditMode ? '?edit=true' : ''}`}
                className="hidden md:flex items-center bg-white text-purple-600 border-2 border-purple-600 px-6 py-3 rounded-2xl font-semibold hover:bg-purple-50 transition-all"
              >
                <Eye className="w-5 h-5 mr-2" />
                Voir toutes
              </Link>
            </div>
            
            <Carousel>
              {paroisse.actualites.slice(0, 6).map((actu) => (
                <div key={actu.id} className="flex-shrink-0 w-80">
                  <Link href={`/site/${paroisse.subdomain}/actualites/${actu.id}${isEditMode ? '?edit=true' : ''}`} className="block group">
                    <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden h-96">
                      <div className="relative h-48 overflow-hidden">
                        <div 
                          className="absolute inset-0 bg-cover bg-center transform scale-105 group-hover:scale-110 transition-transform duration-700"
                          style={{ 
                            backgroundImage: `url('${actu.image || 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=400&h=400&fit=crop'}')`
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 text-white">
                          <span className="text-xs uppercase tracking-wider bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                            {actu.datePubli ? new Date(actu.datePubli).toLocaleDateString('fr-FR', { 
                              day: 'numeric', 
                              month: 'short'
                            }) : 'Actualité'}
                          </span>
                        </div>
                      </div>
                      <div className="p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
                          {actu.titre}
                        </h3>
                        <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                          {actu.contenu?.substring(0, 120)}...
                        </p>
                        <div className="flex items-center text-purple-600 font-medium group-hover:text-purple-700 transition-colors">
                          <span>Lire la suite</span>
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </Carousel>
          </div>
        </section>
      )}

      {/* Section Horaires - MODERNISÉE */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-4">
              <Clock className="w-4 h-4 mr-2" />
              Horaires des célébrations
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <EditableText
                value={getValue('scheduleTitle', 'Messes et célébrations')}
                onChange={(value) => updateField('scheduleTitle', value)}
                isEditMode={isEditMode}
                className="text-4xl md:text-5xl font-bold text-gray-900"
              />
            </h2>
            <p className="text-xl text-gray-600">
              Rejoignez-nous pour nos temps de prière et de célébration
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-6">
            {[0, 1, 2, 3, 4, 5, 6].map((jourIndex) => {
              const dayHoraires = horairesByDay[jourIndex] || []
              const isToday = new Date().getDay() === jourIndex
              
              return (
                <div key={jourIndex} className={`group relative ${isToday ? 'lg:col-span-1 md:col-span-1' : ''}`}>
                  <div className={`bg-gradient-to-br from-slate-600 to-slate-800 text-white rounded-2xl p-6 h-80 shadow-lg hover:shadow-xl transition-all duration-300 ${
                    isToday ? 'ring-4 ring-blue-400 ring-opacity-50 scale-105' : 'hover:scale-105'
                  }`}>
                    {isToday && (
                      <div className="absolute -top-2 -right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Aujourd'hui
                      </div>
                    )}
                    
                    <div className="text-center h-full flex flex-col">
                      <h4 className="text-xl font-bold mb-6 text-center">{joursSemaine[jourIndex]}</h4>
                      
                      {dayHoraires.length > 0 ? (
                        <div className="space-y-4 flex-1 flex flex-col justify-center">
                          {dayHoraires.map((horaire, idx) => (
                            <div key={idx} className="text-center">
                              <div className="text-2xl font-bold mb-1">{horaire.heure}</div>
                              <div className="text-sm opacity-90 capitalize bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                                {horaire.typeOffice}
                              </div>
                              {horaire.description && (
                                <div className="text-xs opacity-75 mt-2">{horaire.description}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center">
                            <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p className="text-sm opacity-75">Pas de célébration</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Section Événements - MODERNISÉE avec liens corrigés */}
      {paroisse.evenements && paroisse.evenements.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-16">
              <div>
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-orange-800 text-sm font-medium mb-4">
                  <Calendar className="w-4 h-4 mr-2" />
                  Prochainement
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  <EditableText
                    value={getValue('eventsTitle', 'Événements à venir')}
                    onChange={(value) => updateField('eventsTitle', value)}
                    isEditMode={isEditMode}
                    className="text-4xl md:text-5xl font-bold text-gray-900"
                  />
                </h2>
                <p className="text-xl text-gray-600">
                  Ne manquez aucun de nos temps forts
                </p>
              </div>
              <Link 
                href={`/site/${paroisse.subdomain}/agenda${isEditMode ? '?edit=true' : ''}`}
                className="hidden md:flex items-center bg-white text-orange-600 border-2 border-orange-600 px-6 py-3 rounded-2xl font-semibold hover:bg-orange-50 transition-all"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Voir l'agenda
              </Link>
            </div>
            
            <Carousel>
              {paroisse.evenements.slice(0, 6).map((event) => (
                <div key={event.id} className="flex-shrink-0 w-80">
                  <Link href={`/site/${paroisse.subdomain}/evenements/${event.id}${isEditMode ? '?edit=true' : ''}`} className="block group">
                    <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden h-96">
                      <div className="relative h-48 bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 to-pink-600/90"></div>
                        <div className="relative z-10 h-full flex items-center justify-center text-white">
                          <div className="text-center">
                            <div className="text-4xl font-black mb-2">
                              {new Date(event.dateDebut).getDate()}
                            </div>
                            <div className="text-lg font-bold uppercase tracking-wider">
                              {new Date(event.dateDebut).toLocaleDateString('fr-FR', { month: 'short' })}
                            </div>
                            <div className="text-sm opacity-90 mt-2">
                              {new Date(event.dateDebut).getFullYear()}
                            </div>
                          </div>
                        </div>
                        <div className="absolute bottom-4 right-4">
                          <Calendar className="w-6 h-6 text-white/70" />
                        </div>
                      </div>
                      <div className="p-8">
                        <h3 className="font-bold text-xl mb-3 text-gray-900 line-clamp-2">{event.titre}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">{event.description}</p>
                        {event.lieu && (
                          <div className="flex items-center text-sm text-gray-500 mb-4">
                            <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                            <span className="line-clamp-1">{event.lieu}</span>
                          </div>
                        )}
                        <div className="flex items-center text-orange-600 font-medium group-hover:text-orange-700 transition-colors">
                          <span>En savoir plus</span>
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </Carousel>
          </div>
        </section>
      )}

      {/* Section Contact - MODERNISÉE */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
              <Mail className="w-4 h-4 mr-2" />
              Contact
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <EditableText
                value={getValue('contactTitle', 'Nous contacter')}
                onChange={(value) => updateField('contactTitle', value)}
                isEditMode={isEditMode}
                className="text-4xl md:text-5xl font-bold text-gray-900"
              />
            </h2>
            <p className="text-xl text-gray-600">
              N'hésitez pas à nous joindre pour toute question
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-8 text-gray-900 flex items-center">
                <Church className="w-8 h-8 mr-3 text-blue-600" />
                Paroisse {paroisse.nom}
              </h3>
              <div className="space-y-6">
                {paroisse.adresse && (
                  <div className="flex items-start p-4 bg-white rounded-2xl shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-gray-700 flex-1">
                      <div className="font-medium mb-1">Adresse</div>
                      <div>
                        <EditableText
                          value={getValue('contactAddress', paroisse.adresse)}
                          onChange={(value) => updateField('contactAddress', value)}
                          isEditMode={isEditMode}
                          className="text-gray-700"
                        />
                      </div>
                      {paroisse.ville && (
                        <div>
                          <EditableText
                            value={getValue('contactPostalCode', paroisse.codePostal)}
                            onChange={(value) => updateField('contactPostalCode', value)}
                            isEditMode={isEditMode}
                            className="text-gray-700 inline"
                          />
                          {' '}
                          <EditableText
                            value={getValue('contactCity', paroisse.ville)}
                            onChange={(value) => updateField('contactCity', value)}
                            isEditMode={isEditMode}
                            className="text-gray-700 inline"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {paroisse.telephone && (
                  <div className="flex items-center p-4 bg-white rounded-2xl shadow-sm">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 mb-1">Téléphone</div>
                      <EditableText
                        value={getValue('contactPhone', paroisse.telephone)}
                        onChange={(value) => updateField('contactPhone', value)}
                        isEditMode={isEditMode}
                        className="text-gray-700"
                      />
                    </div>
                  </div>
                )}
                {paroisse.email && (
                  <div className="flex items-center p-4 bg-white rounded-2xl shadow-sm">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                      <Mail className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 mb-1">Email</div>
                      <EditableText
                        value={getValue('contactEmail', paroisse.email)}
                        onChange={(value) => updateField('contactEmail', value)}
                        isEditMode={isEditMode}
                        className="text-gray-700"
                      />
                    </div>
                  </div>
                )}
              </div>
              <button className="mt-8 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                <Mail className="w-5 h-5 inline mr-2" />
                Nous écrire
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl overflow-hidden shadow-lg h-96">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.991441398707!2d2.2922926!3d48.8583701!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e2964e34e2d%3A0x8ddca9ee380ef7e0!2sTour%20Eiffel!5e0!3m2!1sfr!2sfr!4v1635959040828!5m2!1sfr!2sfr"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy"
                className="rounded-3xl"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - MODERNISÉ */}
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
              <Link href={`/site/${paroisse.subdomain}/paroisse`} className="text-gray-400 hover:text-white transition-colors">
                La Paroisse
              </Link>
              <Link href={`/site/${paroisse.subdomain}/actualites`} className="text-gray-400 hover:text-white transition-colors">
                Actualités
              </Link>
              <Link href={`/site/${paroisse.subdomain}/agenda`} className="text-gray-400 hover:text-white transition-colors">
                Agenda
              </Link>
              <Link href={`/site/${paroisse.subdomain}/don`} className="text-gray-400 hover:text-white transition-colors">
                Faire un don
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
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
      `}</style>
    </div>
  )
}