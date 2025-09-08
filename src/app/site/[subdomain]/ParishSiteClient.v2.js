'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Phone, Mail, ChevronLeft, ChevronRight, Menu, X, Clock, Users, Heart, Book, Church, Hand, FileText, Upload, Star, ArrowRight, Play, Eye, Gift } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEditable } from '../../../hooks/useEditable'
import { EditableText, EditableImage } from '../../../components/Editable'
import EditBar from '../../../components/EditBar'

// Composants refactorisés importés
import HeroSection from '../../../components/parish/HeroSection'
import NavigationSection from '../../../components/parish/NavigationSection'
import NewsSection from '../../../components/parish/NewsSection'
import Carousel from '../../../components/ui/Carousel'

const joursSemaine = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

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
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-2 space-y-1">
              <Link href={`/site/${paroisse.subdomain}/paroisse${isEditMode ? '?edit=true' : ''}`} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 transition-colors">La Paroisse</Link>
              <Link href={`/site/${paroisse.subdomain}/pastorale${isEditMode ? '?edit=true' : ''}`} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 transition-colors">Pastorale</Link>
              <Link href={`/site/${paroisse.subdomain}/sacrements${isEditMode ? '?edit=true' : ''}`} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 transition-colors">Sacrements</Link>
              <Link href={`/site/${paroisse.subdomain}/actualites${isEditMode ? '?edit=true' : ''}`} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 transition-colors">Actualités</Link>
              <Link href={`/site/${paroisse.subdomain}/agenda${isEditMode ? '?edit=true' : ''}`} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 transition-colors">Agenda</Link>
              <Link href={`/site/${paroisse.subdomain}/activites${isEditMode ? '?edit=true' : ''}`} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 transition-colors">Activités</Link>
              <Link href={`/site/${paroisse.subdomain}/don${isEditMode ? '?edit=true' : ''}`} className="block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded-lg text-base font-medium mx-3 my-2 text-center">Don</Link>
            </div>
          </div>
        )}
      </header>

      {/* ===== SECTIONS REFACTORISÉES ===== */}
      
      {/* Hero Section */}
      <HeroSection 
        paroisse={paroisse}
        isEditMode={isEditMode}
        getValue={getValue}
        updateField={updateField}
      />

      {/* Navigation Section */}
      <NavigationSection 
        paroisse={paroisse}
        isEditMode={isEditMode}
        getValue={getValue}
        updateField={updateField}
      />

      {/* News Section */}
      <NewsSection 
        paroisse={paroisse}
        isEditMode={isEditMode}
        getValue={getValue}
        updateField={updateField}
      />

      {/* ===== SECTIONS NON ENCORE REFACTORISÉES (temporaire) ===== */}

      {/* Section Horaires - À REFACTORISER */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-4">
              <Clock className="w-4 h-4 mr-2" />
              Horaires
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <EditableText
                value={getValue('scheduleTitle', 'Horaires des célébrations')}
                onChange={(value) => updateField('scheduleTitle', value)}
                isEditMode={isEditMode}
                className="text-4xl md:text-5xl font-bold text-gray-900"
              />
            </h2>
            <p className="text-xl text-gray-600">
              Retrouvez-nous pour nos temps de prière et de célébration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
            {joursSemaine.map((jour, index) => {
              const hoursForDay = horairesByDay[index] || []
              const isToday = new Date().getDay() === index
              
              return (
                <div key={jour} className={`relative group ${isToday ? 'ring-2 ring-blue-500' : ''}`}>
                  <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 h-full border-2 border-transparent hover:border-blue-200">
                    {isToday && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                          Aujourd'hui
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <h3 className={`text-xl font-bold mb-2 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                        {jour}
                      </h3>
                      <div className={`w-12 h-1 mx-auto rounded-full ${isToday ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                    </div>

                    <div className="space-y-4">
                      {hoursForDay.length > 0 ? (
                        hoursForDay.map((horaire) => (
                          <div key={horaire.id} className="flex items-center justify-between bg-gray-50 rounded-2xl p-4">
                            <div>
                              <div className="font-semibold text-gray-900">{horaire.heure}</div>
                              <div className="text-sm text-gray-600">{horaire.type}</div>
                            </div>
                            {horaire.type === 'Messe' && <Church className="w-5 h-5 text-blue-500" />}
                            {horaire.type === 'Confession' && <Hand className="w-5 h-5 text-green-500" />}
                            {horaire.type === 'Adoration' && <Heart className="w-5 h-5 text-purple-500" />}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-gray-400 mb-2">
                            <Clock className="w-8 h-8 mx-auto" />
                          </div>
                          <p className="text-gray-500 text-sm">Pas de célébration</p>
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

      {/* Section Événements - À REFACTORISER */}
      {paroisse.evenements && paroisse.evenements.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-16">
              <div>
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
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
                  Ne manquez aucun moment fort de notre communauté
                </p>
              </div>
              <Link 
                href={`/site/${paroisse.subdomain}/agenda${isEditMode ? '?edit=true' : ''}`}
                className="hidden md:flex items-center bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-2xl font-semibold hover:bg-blue-50 transition-all"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Voir l'agenda complet
              </Link>
            </div>
            
            <Carousel>
              {paroisse.evenements.slice(0, 6).map((event) => (
                <div key={event.id} className="flex-shrink-0 w-80">
                  <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden h-96">
                    <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="text-3xl font-bold">
                          {new Date(event.dateDebut).getDate()}
                        </div>
                        <div className="text-sm uppercase tracking-wider">
                          {new Date(event.dateDebut).toLocaleDateString('fr-FR', { month: 'short' })}
                        </div>
                      </div>
                    </div>
                    <div className="p-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                        {event.titre}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                        {event.description?.substring(0, 100)}...
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mb-6">
                        <Clock className="w-4 h-4 mr-2" />
                        {new Date(event.dateDebut).toLocaleDateString('fr-FR')}
                        {event.lieu && (
                          <>
                            <MapPin className="w-4 h-4 ml-4 mr-2" />
                            {event.lieu}
                          </>
                        )}
                      </div>
                      <div className="flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors">
                        <span>En savoir plus</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        </section>
      )}

      {/* Section Contact - À REFACTORISER */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-orange-800 text-sm font-medium mb-6">
                <MapPin className="w-4 h-4 mr-2" />
                Contact
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                <EditableText
                  value={getValue('contactTitle', 'Venez nous rencontrer')}
                  onChange={(value) => updateField('contactTitle', value)}
                  isEditMode={isEditMode}
                  className="text-4xl md:text-5xl font-bold text-gray-900"
                />
              </h2>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mr-4">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Adresse</h3>
                    <p className="text-gray-600">
                      <EditableText
                        value={getValue('contactAddress', `${paroisse.adresse || ''}, ${paroisse.ville || ''} ${paroisse.codePostal || ''}`)}
                        onChange={(value) => updateField('contactAddress', value)}
                        isEditMode={isEditMode}
                        className=""
                        multiline={true}
                      />
                    </p>
                  </div>
                </div>

                {paroisse.telephone && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mr-4">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Téléphone</h3>
                      <p className="text-gray-600">{paroisse.telephone}</p>
                    </div>
                  </div>
                )}

                {paroisse.email && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mr-4">
                      <Mail className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                      <p className="text-gray-600">{paroisse.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl overflow-hidden shadow-2xl">
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="w-16 h-16 mx-auto mb-4" />
                    <p>Carte à intégrer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - À REFACTORISER */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <Link href={`/site/${paroisse.subdomain}${isEditMode ? '?edit=true' : ''}`} className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ImaMissio
              </Link>
              <p className="text-gray-400 mt-2">Plateforme de gestion paroissiale</p>
            </div>
            
            <div className="flex space-x-8">
              <Link href={`/site/${paroisse.subdomain}/paroisse${isEditMode ? '?edit=true' : ''}`} className="text-gray-300 hover:text-white transition-colors">La Paroisse</Link>
              <Link href={`/site/${paroisse.subdomain}/actualites${isEditMode ? '?edit=true' : ''}`} className="text-gray-300 hover:text-white transition-colors">Actualités</Link>
              <Link href={`/site/${paroisse.subdomain}/agenda${isEditMode ? '?edit=true' : ''}`} className="text-gray-300 hover:text-white transition-colors">Agenda</Link>
              <Link href={`/site/${paroisse.subdomain}/don${isEditMode ? '?edit=true' : ''}`} className="text-gray-300 hover:text-white transition-colors">Don</Link>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 {paroisse.nom}. Tous droits réservés. 
              <span className="ml-2">Propulsé par <span className="text-blue-400 font-semibold">ImaMissio</span></span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}