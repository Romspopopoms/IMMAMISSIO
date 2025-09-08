'use client'
import { MapPin, Phone, Mail } from 'lucide-react'
import { EditableText } from '../Editable'

export default function ContactSection({ paroisse, isEditMode, getValue, updateField }) {
  return (
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
              {/* Google Maps intégrée avec l'adresse de la paroisse */}
              {paroisse.adresse && paroisse.ville ? (
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: '1.5rem' }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${paroisse.adresse}, ${paroisse.codePostal || ''} ${paroisse.ville}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  title={`Localisation de ${paroisse.nom}`}
                />
              ) : (
                // Fallback si pas d'adresse complète
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-500 p-8">
                    <MapPin className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Localisation</p>
                    <p className="text-sm">
                      {paroisse.ville ? `${paroisse.ville}` : 'Adresse à configurer'}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Lien vers Google Maps externe */}
            {paroisse.adresse && paroisse.ville && (
              <div className="absolute bottom-4 right-4">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${paroisse.adresse}, ${paroisse.codePostal || ''} ${paroisse.ville}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition-all hover:shadow-xl transform hover:scale-105"
                  title="Ouvrir dans Google Maps"
                >
                  <MapPin className="w-5 h-5" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}