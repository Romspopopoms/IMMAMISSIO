'use client'
import { Clock, Church, Hand, Heart } from 'lucide-react'
import { EditableText } from '../Editable'

const joursSemaine = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

export default function ScheduleSection({ paroisse, isEditMode, getValue, updateField }) {
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
  )
}