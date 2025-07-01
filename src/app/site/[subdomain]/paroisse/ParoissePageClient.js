// src/app/site/[subdomain]/paroisse/ParoissePageClient.js
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Upload, Plus, Trash2, Church, Heart, Clock, Users, Star, BookOpen, ArrowRight } from 'lucide-react'
import { useEditable } from '../../../../hooks/useEditable'
import { EditableText, EditableImage } from '../../../../components/Editable'
import EditBar from '../../../../components/EditBar'

export default function ParoissePageClient({ paroisse: initialParoisse }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
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

  // Gérer les clochers - SANS DONNÉES MOCKUP
  const [clochers, setClochers] = useState(getValue('paroisseClochers', []))

  const ajouterClocher = () => {
    const nouveauClocher = {
      id: Date.now(),
      image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&h=300&fit=crop',
      titre: 'Nouvelle église'
    }
    const nouveauxClochers = [...clochers, nouveauClocher]
    setClochers(nouveauxClochers)
    updateField('paroisseClochers', nouveauxClochers)
  }

  const supprimerClocher = (id) => {
    const nouveauxClochers = clochers.filter(c => c.id !== id)
    setClochers(nouveauxClochers)
    updateField('paroisseClochers', nouveauxClochers)
  }

  const modifierClocher = (id, field, value) => {
    const nouveauxClochers = clochers.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    )
    setClochers(nouveauxClochers)
    updateField('paroisseClochers', nouveauxClochers)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <EditBar 
        isEditMode={isEditMode}
        hasChanges={hasChanges}
        saving={saving}
        onSave={saveChanges}
        onExit={exitEditMode}
      />
      
      {/* Header - CORRIGÉ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href={`/site/${paroisse.subdomain}${isEditMode ? '?edit=true' : ''}`} className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ImaMissio
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href={`/site/${paroisse.subdomain}/paroisse${isEditMode ? '?edit=true' : ''}`} className="text-sm font-medium text-blue-600 border-b-2 border-blue-600">La Paroisse</Link>
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
      </header>

      {/* Hero Section - CORRIGÉE */}
      <section className="relative h-[600px] mt-16 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transform scale-105"
          style={{ 
            backgroundImage: `url('${getValue('paroisseHeroImage', 'https://images.unsplash.com/photo-1570962278406-8fb5b4b2df70?w=1920&h=1080&fit=crop')}')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-indigo-900/80" />
        
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
                      updateField('paroisseHeroImage', reader.result)
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
                  Communauté Paroissiale
                </span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-black text-white mb-8 leading-tight">
                <EditableText
                  value={getValue('paroisseHeroTitle', "Jésus t'attend")}
                  onChange={(value) => updateField('paroisseHeroTitle', value)}
                  isEditMode={isEditMode}
                  className="text-6xl md:text-7xl font-black text-white leading-tight"
                />
              </h1>
              
              <button 
                onClick={() => {
                  document.getElementById('decouvrir-section')?.scrollIntoView({ 
                    behavior: 'smooth' 
                  })
                }}
                className="bg-white text-blue-900 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
              >
                <Heart className="w-5 h-5 inline mr-2" />
                Découvrir notre paroisse
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main>
        
        {/* Section 1: DÉCOUVREZ LA PAROISSE - Modernisée */}
        <section id="decouvrir-section" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
                <Users className="w-4 h-4 mr-2" />
                Bienvenue
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                <EditableText
                  value={getValue('paroisseSection1Title', 'Découvrez la Paroisse')}
                  onChange={(value) => updateField('paroisseSection1Title', value)}
                  isEditMode={isEditMode}
                  className="text-4xl md:text-5xl font-bold text-gray-900"
                />
              </h2>
            </div>
            
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl shadow-2xl p-12 transform hover:scale-105 transition-all duration-300">
              <div className="max-w-4xl mx-auto text-center">
                <div className="text-xl md:text-2xl leading-relaxed space-y-6">
                  <EditableText
                    value={getValue('paroisseDecouvrezContent', `Nous sommes heureux de vous accueillir sur le site de notre paroisse, un lieu de prière, de partage et de vie spirituelle au cœur de ${paroisse.ville || 'notre ville'}. 

Que vous soyez résident, de passage ou simplement curieux, nous vous invitons à découvrir notre communauté paroissiale et à participer à nos activités.`)}
                    onChange={(value) => updateField('paroisseDecouvrezContent', value)}
                    isEditMode={isEditMode}
                    className="text-white text-xl md:text-2xl whitespace-pre-wrap leading-relaxed"
                    multiline={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Image intermédiaire - Modernisée */}
        <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl group">
              <EditableImage
                src={getValue('paroisseImage1', 'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=1200&h=600&fit=crop')}
                onChange={(value) => updateField('paroisseImage1', value)}
                isEditMode={isEditMode}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                alt="Intérieur de l'église"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        </section>

        {/* Section 2: UN LIEU DE PARTAGE ET DE FOI - Modernisée */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-4">
                <Heart className="w-4 h-4 mr-2" />
                Communauté
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                <EditableText
                  value={getValue('paroisseSection2Title', 'Un Lieu de Partage et de Foi')}
                  onChange={(value) => updateField('paroisseSection2Title', value)}
                  isEditMode={isEditMode}
                  className="text-4xl md:text-5xl font-bold text-gray-900"
                />
              </h2>
            </div>
            
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-3xl shadow-2xl p-12 transform hover:scale-105 transition-all duration-300">
              <div className="max-w-4xl mx-auto text-center">
                <div className="text-xl md:text-2xl leading-relaxed">
                  <EditableText
                    value={getValue('paroissePartageContent', `Lieu d'accueil et de rencontre, notre paroisse offre à chacun la possibilité de vivre sa foi en communauté. Que vous soyez pratiquant régulier ou en recherche spirituelle, vous y trouverez un espace d'écoute, de fraternité et de prière où chacun peut grandir dans sa relation avec Dieu et avec les autres.`)}
                    onChange={(value) => updateField('paroissePartageContent', value)}
                    isEditMode={isEditMode}
                    className="text-white text-xl md:text-2xl leading-relaxed"
                    multiline={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: HISTOIRE DE LA PAROISSE - Modernisée */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mb-4">
                <BookOpen className="w-4 h-4 mr-2" />
                Patrimoine
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                <EditableText
                  value={getValue('paroisseHistoireTitle', `Histoire de la Paroisse ${paroisse.nom}`)}
                  onChange={(value) => updateField('paroisseHistoireTitle', value)}
                  isEditMode={isEditMode}
                  className="text-4xl md:text-5xl font-bold text-gray-900"
                />
              </h2>
            </div>
            
            <div className="bg-white rounded-3xl shadow-xl p-12">
              <div className="prose prose-xl max-w-none text-center">
                <EditableText
                  value={getValue('paroisseHistoireContent', `La paroisse ${paroisse.nom} trouve ses racines au cœur de ${paroisse.ville || 'notre communauté'}. Édifiée au XIIe siècle, l'église paroissiale a traversé les âges, témoin silencieux de la foi et de l'histoire locale.

Au fil des siècles, elle a connu bien des transformations, des restaurations et des embellissements. Les générations successives ont laissé leur empreinte, enrichissant ce patrimoine spirituel et architectural.

Aujourd'hui, notre paroisse continue d'être un lieu vivant, où se croisent tradition et modernité, dans le respect de notre héritage tout en étant tournés vers l'avenir.`)}
                  onChange={(value) => updateField('paroisseHistoireContent', value)}
                  isEditMode={isEditMode}
                  className="text-gray-700 text-xl leading-relaxed whitespace-pre-wrap"
                  multiline={true}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Les différents clochers - CORRIGÉE */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-4">
                <Church className="w-4 h-4 mr-2" />
                Nos Églises
              </span>
              <div className="flex items-center justify-center gap-8">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                  <EditableText
                    value={getValue('paroisseClochersTitle', 'Nos Églises et Chapelles')}
                    onChange={(value) => updateField('paroisseClochersTitle', value)}
                    isEditMode={isEditMode}
                    className="text-4xl md:text-5xl font-bold text-gray-900"
                  />
                </h2>
                {isEditMode && (
                  <button
                    onClick={ajouterClocher}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-2xl flex items-center hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Ajouter
                  </button>
                )}
              </div>
            </div>
            
            {clochers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {clochers.map((clocher, index) => (
                  <div key={clocher.id} className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={clocher.image}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        alt={clocher.titre}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      
                      {/* Menu d'actions en mode édition */}
                      {isEditMode && (
                        <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all">
                          {/* Bouton changer image */}
                          <label className="bg-blue-500/90 backdrop-blur-sm text-white p-2 rounded-xl cursor-pointer hover:bg-blue-600 transform hover:scale-105 transition-all flex items-center justify-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  const reader = new FileReader()
                                  reader.onloadend = () => {
                                    modifierClocher(clocher.id, 'image', reader.result)
                                  }
                                  reader.readAsDataURL(file)
                                }
                              }}
                              className="hidden"
                            />
                            <Upload className="w-4 h-4" />
                          </label>
                          
                          {/* Bouton supprimer */}
                          <button
                            onClick={() => supprimerClocher(clocher.id)}
                            className="bg-red-500/90 backdrop-blur-sm text-white p-2 rounded-xl hover:bg-red-600 transform hover:scale-105 transition-all flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-gray-900 text-center">
                        <EditableText
                          value={clocher.titre}
                          onChange={(value) => modifierClocher(clocher.id, 'titre', value)}
                          isEditMode={isEditMode}
                          className="text-2xl font-bold text-gray-900"
                        />
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Church className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune église ajoutée</h3>
                <p className="text-gray-600 mb-6">Commencez par ajouter les églises et chapelles de votre paroisse</p>
                {isEditMode && (
                  <button
                    onClick={ajouterClocher}
                    className="bg-green-600 text-white px-6 py-3 rounded-2xl flex items-center mx-auto hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Ajouter la première église
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

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
              <Link href={`/site/${paroisse.subdomain}/agenda`} className="text-gray-400 hover:text-white transition-colors">
                Agenda
              </Link>
              <Link href={`/site/${paroisse.subdomain}/don`} className="text-gray-400 hover:text-white transition-colors">
                Faire un don
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}