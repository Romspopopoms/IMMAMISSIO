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
  )
}