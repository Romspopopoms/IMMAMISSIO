'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Phone, Mail, ChevronLeft, ChevronRight, Menu, X, Clock, Users, Heart, Book, Church, Hand, FileText, Upload, Star, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEditable } from '../../../../hooks/useEditable'
import { EditableText, EditableImage } from '../../../../components/Editable'
import EditBar from '../../../../components/EditBar'

const joursSemaine = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const moisFrancais = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

// Types d'offices avec couleurs et icônes
const typesOffice = {
  messe: { icon: '⛪', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700' },
  confession: { icon: '🙏', color: 'from-green-500 to-green-600', bg: 'bg-green-50', text: 'text-green-700' },
  adoration: { icon: '✨', color: 'from-yellow-500 to-yellow-600', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  vepres: { icon: '🎵', color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-700' },
  chapelet: { icon: '📿', color: 'from-pink-500 to-pink-600', bg: 'bg-pink-50', text: 'text-pink-700' },
  permanence: { icon: '👥', color: 'from-gray-500 to-gray-600', bg: 'bg-gray-50', text: 'text-gray-700' },
  autre: { icon: '⭐', color: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-700' }
}

export default function AgendaPageClient({ paroisse: initialParoisse, isEditMode: initialEditMode = false }) {
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
  } = useEditable(initialParoisse, initialEditMode)

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

  // Grouper les événements par mois
  const evenementsByMonth = paroisse.evenements.reduce((acc, event) => {
    const date = new Date(event.dateDebut)
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`
    const monthName = `${moisFrancais[date.getMonth()]} ${date.getFullYear()}`
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        name: monthName,
        events: []
      }
    }
    acc[monthKey].events.push(event)
    return acc
  }, {})

  // Événements à la une (prochains 6)
  const featuredEvents = paroisse.evenements.slice(0, 6)

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
              <Link href={`/site/${paroisse.subdomain}/agenda${isEditMode ? '?edit=true' : ''}`} className="text-sm font-medium text-blue-600 border-b-2 border-blue-600">Agenda</Link>
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
      </header>

      {/* Hero Section */}
      <section className="relative h-[600px] mt-16 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transform scale-105"
          style={{ 
            backgroundImage: `url('${getValue('agendaHeaderImage', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=1080&fit=crop')}')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-indigo-900/80" />
        
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
                      updateField('agendaHeaderImage', reader.result)
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
          <Calendar className="w-32 h-32 text-white animate-pulse" />
        </div>
        <div className="absolute bottom-20 left-20 opacity-10">
          <Clock className="w-24 h-24 text-white animate-bounce" />
        </div>
        
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="text-center max-w-4xl mx-auto">
              <div className="mb-8">
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium mb-6">
                  <Calendar className="w-4 h-4 mr-2" />
                  Planning & Événements
                </span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
                <EditableText
                  value={getValue('agendaTitle', "L'Agenda")}
                  onChange={(value) => updateField('agendaTitle', value)}
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
                  value={getValue('agendaSubtitle', 'Découvrez toutes nos célébrations, événements et moments de partage')}
                  onChange={(value) => updateField('agendaSubtitle', value)}
                  isEditMode={isEditMode}
                  className="text-xl md:text-2xl text-white/90"
                />
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => {
                    document.getElementById('horaires-section')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    })
                  }}
                  className="bg-white text-blue-900 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
                >
                  <Clock className="w-5 h-5 inline mr-2" />
                  Voir les horaires
                </button>
                <button 
                  onClick={() => {
                    document.getElementById('evenements-section')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    })
                  }}
                  className="bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/30 transition-all border border-white/30"
                >
                  <Calendar className="w-5 h-5 inline mr-2" />
                  Prochains événements
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Horaires - Design moderne */}
      <section id="horaires-section" className="py-20 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
              <Clock className="w-4 h-4 mr-2" />
              Célébrations & Offices
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <EditableText
                value={getValue('schedulesTitle', 'Nos Horaires')}
                onChange={(value) => updateField('schedulesTitle', value)}
                isEditMode={isEditMode}
                className="text-4xl md:text-5xl font-bold text-gray-900"
              />
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Retrouvez tous les moments de prière et de célébration de notre communauté
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
            {[0, 1, 2, 3, 4, 5, 6].map((jourIndex) => {
              const dayHoraires = horairesByDay[jourIndex] || []
              const isToday = new Date().getDay() === jourIndex
              
              return (
                <div key={jourIndex} className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${isToday ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
                  <div className={`p-4 text-center ${isToday ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-gray-600 to-gray-700'} text-white`}>
                    <h3 className="font-bold text-lg">{joursSemaine[jourIndex]}</h3>
                    {isToday && <span className="text-xs opacity-90">Aujourd'hui</span>}
                  </div>
                  
                  <div className="p-4">
                    {dayHoraires.length > 0 ? (
                      <div className="space-y-3">
                        {dayHoraires.map((horaire, idx) => {
                          const typeInfo = typesOffice[horaire.typeOffice] || typesOffice.autre
                          return (
                            <div key={idx} className={`${typeInfo.bg} rounded-xl p-4 hover:scale-105 transition-transform`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl">{typeInfo.icon}</span>
                                <span className="font-bold text-xl text-gray-900">{horaire.heure}</span>
                              </div>
                              <p className={`text-base font-semibold capitalize ${typeInfo.text} mb-1`}>
                                {horaire.typeOffice}
                              </p>
                              {horaire.description && (
                                <p className="text-sm text-gray-600 leading-relaxed">{horaire.description}</p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Pas de célébration</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Section Événements à la une */}
      <section id="evenements-section" className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-4">
              <Star className="w-4 h-4 mr-2" />
              À ne pas manquer
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <EditableText
                value={getValue('featuredEventsTitle', 'Prochains Événements')}
                onChange={(value) => updateField('featuredEventsTitle', value)}
                isEditMode={isEditMode}
                className="text-4xl md:text-5xl font-bold text-gray-900"
              />
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Les moments forts de notre communauté qui approchent
            </p>
          </div>
          
          {featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event) => {
                const eventDate = new Date(event.dateDebut)
                const isToday = eventDate.toDateString() === new Date().toDateString()
                const isTomorrow = eventDate.toDateString() === new Date(Date.now() + 86400000).toDateString()
                
                return (
                  <Link 
                    key={event.id} 
                    href={`/site/${paroisse.subdomain}/evenements/${event.id}${isEditMode ? '?edit=true' : ''}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 block"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-purple-600 to-pink-600 overflow-hidden">
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute top-4 left-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isToday ? 'bg-red-500 text-white' : 
                          isTomorrow ? 'bg-orange-500 text-white' : 
                          'bg-white/20 text-white'
                        }`}>
                          {isToday ? "Aujourd'hui" : 
                           isTomorrow ? "Demain" : 
                           eventDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <div className="text-3xl font-black">
                          {eventDate.getDate()}
                        </div>
                        <div className="text-sm font-medium opacity-90">
                          {moisFrancais[eventDate.getMonth()].substring(0, 4).toUpperCase()}
                        </div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Calendar className="w-6 h-6 text-white/70" />
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                        {event.titre}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {event.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {event.lieu && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="truncate max-w-32">{event.lieu}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all group-hover:scale-105 text-center">
                        En savoir plus
                        <ArrowRight className="w-4 h-4 inline ml-2" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-500 mb-2">Aucun événement prévu</h3>
              <p className="text-gray-400">Les prochains événements apparaîtront ici</p>
            </div>
          )}
        </div>
      </section>

      {/* Section Planning complet */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
              <Calendar className="w-4 h-4 mr-2" />
              Planning complet
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <EditableText
                value={getValue('completePlanningTitle', 'Planning de la Paroisse')}
                onChange={(value) => updateField('completePlanningTitle', value)}
                isEditMode={isEditMode}
                className="text-4xl md:text-5xl font-bold text-gray-900"
              />
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Horaires réguliers et événements spéciaux de notre communauté
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Colonne Horaires réguliers */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <Clock className="w-6 h-6 mr-3 text-blue-600" />
                Horaires réguliers
              </h3>
              
              <div className="space-y-6">
                {Object.entries(
                  paroisse.horaires.reduce((acc, horaire) => {
                    const type = horaire.typeOffice
                    if (!acc[type]) acc[type] = []
                    acc[type].push(horaire)
                    return acc
                  }, {})
                ).map(([type, horaires]) => {
                  const typeInfo = typesOffice[type] || typesOffice.autre
                  return (
                    <div key={type} className={`${typeInfo.bg} rounded-2xl p-6`}>
                      <div className="flex items-center mb-4">
                        <span className="text-2xl mr-3">{typeInfo.icon}</span>
                        <h4 className={`text-xl font-bold capitalize ${typeInfo.text}`}>
                          {type}
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {horaires.map((horaire, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-3">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-900">
                                {joursSemaine[horaire.jourSemaine]}
                              </span>
                              <span className="font-bold text-lg text-gray-900">
                                {horaire.heure}
                              </span>
                            </div>
                            {horaire.description && (
                              <p className="text-sm text-gray-600 mt-1">{horaire.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Colonne Événements par mois */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-purple-600" />
                Événements à venir
              </h3>
              
              {Object.keys(evenementsByMonth).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(evenementsByMonth).slice(0, 3).map(([monthKey, monthData]) => (
                    <div key={monthKey} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                      <h4 className="text-xl font-bold text-purple-900 mb-4 flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                        {monthData.name}
                      </h4>
                      
                      <div className="space-y-3">
                        {monthData.events.slice(0, 4).map((event) => (
                          <Link 
                            key={event.id} 
                            href={`/site/${paroisse.subdomain}/evenements/${event.id}${isEditMode ? '?edit=true' : ''}`}
                            className="block bg-white rounded-xl p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                                  {new Date(event.dateDebut).getDate()}
                                </div>
                              </div>
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900 mb-1 hover:text-purple-600 transition-colors">
                                  {event.titre}
                                </h5>
                                <div className="flex items-center text-sm text-gray-500 mb-1">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {new Date(event.dateDebut).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                                {event.lieu && (
                                  <div className="flex items-center text-sm text-gray-500">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    <span className="truncate">{event.lieu}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                        
                        {monthData.events.length > 4 && (
                          <div className="text-center">
                            <span className="text-sm text-gray-500">
                              +{monthData.events.length - 4} autres événements
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-500 mb-2">Aucun événement programmé</h4>
                  <p className="text-gray-400">Les prochains événements apparaîtront ici</p>
                </div>
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