'use client'
import Link from 'next/link'
import { Church, Heart, Upload, Calendar } from 'lucide-react'
import { EditableText } from '../Editable'

export default function HeroSection({ paroisse, isEditMode, getValue, updateField }) {
  return (
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
  )
}