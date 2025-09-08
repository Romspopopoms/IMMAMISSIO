'use client'
import Link from 'next/link'
import { Star, ArrowRight, Church, Calendar, Book, Users, FileText, Heart } from 'lucide-react'
import { EditableText } from '../Editable'

export default function NavigationSection({ paroisse, isEditMode, getValue, updateField }) {
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
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
            <Star className="w-4 h-4 mr-2" />
            Navigation
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
            <EditableText
              value={getValue('navigationTitle', 'Explorez notre paroisse')}
              onChange={(value) => updateField('navigationTitle', value)}
              isEditMode={isEditMode}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900"
            />
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            <EditableText
              value={getValue('navigationSubtitle', 'Découvrez toutes les facettes de notre communauté paroissiale')}
              onChange={(value) => updateField('navigationSubtitle', value)}
              isEditMode={isEditMode}
              className="text-base sm:text-lg text-gray-600"
            />
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {navigationCards.map((card, index) => (
            <Link
              key={index}
              href={`${card.href}${isEditMode ? '?edit=true' : ''}`}
              className="group"
            >
              <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden h-64 sm:h-72">
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-90`}></div>
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-white p-4 sm:p-6 text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{card.label}</h3>
                  <p className="text-white/90 mb-4 leading-relaxed text-sm">{card.description}</p>
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
  )
}