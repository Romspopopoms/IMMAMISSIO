'use client'
import Link from 'next/link'
import { FileText, Eye, ArrowRight } from 'lucide-react'
import { EditableText } from '../Editable'
import Carousel from '../ui/Carousel'

export default function NewsSection({ paroisse, isEditMode, getValue, updateField }) {
  // Ne pas afficher la section s'il n'y a pas d'actualités
  if (!paroisse.actualites || paroisse.actualites.length === 0) {
    return null
  }

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <div>
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-4">
              <FileText className="w-4 h-4 mr-2" />
              À la une
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <EditableText
                value={getValue('newsTitle', 'Dernières actualités')}
                onChange={(value) => updateField('newsTitle', value)}
                isEditMode={isEditMode}
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900"
              />
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
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
            <div key={actu.id} className="flex-shrink-0 w-72 sm:w-80">
              <Link href={`/site/${paroisse.subdomain}/actualites/${actu.id}${isEditMode ? '?edit=true' : ''}`} className="block group">
                <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden h-80 sm:h-90">
                  <div className="relative h-40 sm:h-48 overflow-hidden">
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
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
                      {actu.titre}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2 leading-relaxed">
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
  )
}