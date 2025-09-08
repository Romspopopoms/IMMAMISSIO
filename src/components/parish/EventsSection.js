'use client'
import Link from 'next/link'
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react'
import { EditableText } from '../Editable'
import Carousel from '../ui/Carousel'

export default function EventsSection({ paroisse, isEditMode, getValue, updateField }) {
  // Ne pas afficher la section s'il n'y a pas d'événements
  if (!paroisse.evenements || paroisse.evenements.length === 0) {
    return null
  }

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12">
          <div className="mb-6 sm:mb-0 text-center sm:text-left">
            <span className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium mb-4">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Prochainement
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              <EditableText
                value={getValue('eventsTitle', 'Événements à venir')}
                onChange={(value) => updateField('eventsTitle', value)}
                isEditMode={isEditMode}
                className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900"
              />
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Ne manquez aucun moment fort de notre communauté
            </p>
          </div>
          <Link 
            href={`/site/${paroisse.subdomain}/agenda${isEditMode ? '?edit=true' : ''}`}
            className="hidden lg:flex items-center bg-white text-blue-600 border-2 border-blue-600 px-4 lg:px-6 py-2 lg:py-3 rounded-2xl text-sm font-semibold hover:bg-blue-50 transition-all"
          >
            <Calendar className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
            Voir l'agenda complet
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <div className="flex space-x-4 sm:space-x-6 pb-4" style={{ width: 'max-content' }}>
            {paroisse.evenements.slice(0, 6).map((event) => (
              <div key={event.id} className="flex-shrink-0 w-64 sm:w-72">
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden h-72 sm:h-80">
                  <div className="relative h-20 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-xl sm:text-2xl font-bold">
                        {new Date(event.dateDebut).getDate()}
                      </div>
                      <div className="text-xs sm:text-sm uppercase tracking-wider">
                        {new Date(event.dateDebut).toLocaleDateString('fr-FR', { month: 'short' })}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {event.titre}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                      {event.description?.substring(0, 100)}...
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center text-xs text-gray-500 mb-3 space-y-1 sm:space-y-0">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        {new Date(event.dateDebut).toLocaleDateString('fr-FR')}
                      </div>
                      {event.lieu && (
                        <div className="flex items-center sm:ml-4">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          <span className="truncate max-w-32">{event.lieu}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors text-xs sm:text-sm">
                      <span>En savoir plus</span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bouton mobile pour voir l'agenda complet */}
        <div className="lg:hidden mt-8 text-center">
          <Link 
            href={`/site/${paroisse.subdomain}/agenda${isEditMode ? '?edit=true' : ''}`}
            className="inline-flex items-center bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-blue-50 transition-all"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Voir l'agenda complet
          </Link>
        </div>
      </div>
    </section>
  )
}