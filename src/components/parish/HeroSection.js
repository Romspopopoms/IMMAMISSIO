'use client'
import Link from 'next/link'
import { Church, Heart, Upload, Calendar } from 'lucide-react'
import { EditableText } from '../Editable'

export default function HeroSection({ paroisse, isEditMode, getValue, updateField }) {
  return (
    <section className="relative min-h-[400px] sm:min-h-[450px] lg:min-h-[500px] mt-16 overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center transform scale-105"
        style={{ 
          backgroundImage: `url('${getValue('headerImage', 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1920&h=1080&fit=crop')}')`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-green-900/80" />
      
      {/* Floating elements */}
      <div className="hidden sm:block absolute top-10 sm:top-20 right-4 sm:right-20 opacity-20">
        <Church className="w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 text-white animate-pulse" />
      </div>
      <div className="hidden sm:block absolute bottom-10 sm:bottom-20 left-4 sm:left-20 opacity-10">
        <Heart className="w-12 h-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 text-white animate-bounce" />
      </div>
      
      {/* Bouton pour changer l'image en mode édition */}
      {isEditMode && (
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20">
          <label className="bg-white/90 backdrop-blur-sm px-2 sm:px-4 py-2 rounded-lg sm:rounded-xl shadow-lg flex items-center cursor-pointer hover:bg-white transition-colors">
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
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Changer l'image</span>
          </label>
        </div>
      )}
      
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <span className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <Church className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                <EditableText
                  value={getValue('welcomeText', 'Bienvenue')}
                  onChange={(value) => updateField('welcomeText', value)}
                  isEditMode={isEditMode}
                  className="text-white text-xs sm:text-sm font-medium"
                />
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 sm:mb-4 leading-tight px-4">
              <EditableText
                value={getValue('headerTitle', 'À la paroisse')}
                onChange={(value) => updateField('headerTitle', value)}
                isEditMode={isEditMode}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white"
              />
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent break-words">
                {paroisse.nom}
              </span>
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg text-white/90 mb-4 sm:mb-6 max-w-2xl mx-auto leading-relaxed italic px-4">
              <EditableText
                value={getValue('headerSubtitle', 'Une communauté accueillante qui vit sa foi au quotidien et partage l\'amour du Christ.')}
                onChange={(value) => updateField('headerSubtitle', value)}
                isEditMode={isEditMode}
                className="text-sm sm:text-base md:text-lg text-white/90 italic"
                multiline={true}
              />
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 px-4">
              <Link 
                href={`/site/${paroisse.subdomain}/paroisse${isEditMode ? '?edit=true' : ''}`}
                className="bg-white text-blue-900 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-semibold text-sm sm:text-base hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl text-center"
              >
                <Church className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                <EditableText
                  value={getValue('discoverButtonText', 'Découvrir notre paroisse')}
                  onChange={(value) => updateField('discoverButtonText', value)}
                  isEditMode={isEditMode}
                  className=""
                />
              </Link>
              <Link 
                href={`/site/${paroisse.subdomain}/agenda${isEditMode ? '?edit=true' : ''}`}
                className="bg-transparent border-2 border-white text-white px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-semibold text-sm sm:text-base hover:bg-white hover:text-blue-900 transition-all transform hover:scale-105 text-center"
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                Voir les événements
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}