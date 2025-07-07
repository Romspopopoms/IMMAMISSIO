// src/app/site/[subdomain]/sacrements/SacrementsPageClient.js
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Heart, Droplets, Cross, Book, CircleEllipsis, Sparkles, HandHeart, Upload, ArrowRight, Star, Church, BookOpen } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEditable } from '../../../../hooks/useEditable'
import EditBar from '../../../../components/EditBar'

const sacrementIcons = {
  bapteme: Droplets,
  eucharistie: Book,
  confirmation: Sparkles,
  mariage: CircleEllipsis,
  reconciliation: Heart,
  malades: HandHeart,
  ordination: Cross
}

const sacrementColors = {
  bapteme: { from: 'from-blue-500', to: 'to-cyan-500', bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-200' },
  eucharistie: { from: 'from-amber-500', to: 'to-orange-500', bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200' },
  confirmation: { from: 'from-red-500', to: 'to-pink-500', bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200' },
  mariage: { from: 'from-pink-500', to: 'to-rose-500', bg: 'bg-pink-50', text: 'text-pink-700', ring: 'ring-pink-200' },
  reconciliation: { from: 'from-green-500', to: 'to-emerald-500', bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-200' },
  malades: { from: 'from-purple-500', to: 'to-violet-500', bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-200' },
  ordination: { from: 'from-indigo-500', to: 'to-blue-600', bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-200' }
}

const sacrementsData = {
  bapteme: {
    id: 'bapteme',
    nom: 'Baptême',
    titre: 'Le Baptême',
    sousTitre: 'Naître à la vie de Dieu',
    description: 'Par le baptême, nous sommes libérés du péché et régénérés comme fils de Dieu ; nous devenons membres du Christ et nous sommes incorporés à l\'Église et faits participants de sa mission.',
    citation: 'Catéchisme de l\'Église catholique n° 1213',
    image: 'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=1920&h=1080&fit=crop',
    contenu: {
      intro: 'Le baptême est le premier des sacrements de l\'initiation chrétienne. Il est la porte d\'entrée dans la vie chrétienne.',
      details: [
        'Le baptême nous fait naître à la vie nouvelle en Christ',
        'Il nous incorpore à l\'Église',
        'Il efface le péché originel et tous les péchés personnels',
        'Il nous fait enfants de Dieu'
      ],
      pratique: {
        titre: 'En pratique',
        preparation: 'Pour demander le baptême, prenez contact avec l\'accueil paroissial. Une préparation est proposée :',
        modalites: [
          'Pour les bébés : rencontres avec d\'autres parents',
          'Pour les enfants : parcours adapté à leur âge',
          'Pour les adultes : catéchuménat sur environ 2 ans'
        ]
      }
    }
  },
  eucharistie: {
    id: 'eucharistie',
    nom: 'Eucharistie',
    titre: 'L\'Eucharistie',
    sousTitre: 'Le sacrement de l\'amour',
    description: 'L\'Eucharistie est la source et le sommet de toute la vie chrétienne. Elle est le sacrement par excellence de l\'unité de l\'Église.',
    image: 'https://images.unsplash.com/photo-1571516444810-9e7d46b85374?w=1920&h=1080&fit=crop',
    contenu: {
      intro: 'L\'Eucharistie, aussi appelée communion, est le sacrement qui nous unit au Christ et qui construit l\'Église.',
      details: [
        'Présence réelle du Christ sous les espèces du pain et du vin',
        'Mémorial de la Passion, de la mort et de la résurrection du Christ',
        'Sacrifice qui actualise l\'unique sacrifice du Christ',
        'Communion qui nous unit au Christ et à nos frères'
      ],
      pratique: {
        titre: 'La première communion',
        preparation: 'La préparation à la première communion se fait généralement :',
        modalites: [
          'Pour les enfants : à partir du CE2, parcours sur 2 ans',
          'Pour les adultes : dans le cadre du catéchuménat',
          'Célébration généralement en mai ou juin'
        ]
      }
    }
  },
  confirmation: {
    id: 'confirmation',
    nom: 'Confirmation',
    titre: 'La Confirmation',
    sousTitre: 'Le don de l\'Esprit Saint',
    description: 'Par le sacrement de confirmation, les baptisés sont plus parfaitement liés à l\'Église, pourvus d\'une force spéciale de l\'Esprit Saint.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=1080&fit=crop',
    contenu: {
      intro: 'La confirmation parfait la grâce baptismale ; elle donne l\'Esprit Saint pour nous enraciner plus profondément dans notre vie d\'enfant de Dieu.',
      details: [
        'Don de l\'Esprit Saint comme à la Pentecôte',
        'Affermissement dans la foi',
        'Force pour témoigner',
        'Marque spirituelle indélébile'
      ],
      pratique: {
        titre: 'Se préparer à la confirmation',
        preparation: 'La confirmation est proposée :',
        modalites: [
          'Aux jeunes à partir de la 3ème',
          'Aux adultes à tout âge',
          'Préparation sur une année avec retraites et temps forts',
          'Célébration présidée par l\'évêque'
        ]
      }
    }
  },
  mariage: {
    id: 'mariage',
    nom: 'Mariage',
    titre: 'Le Mariage',
    sousTitre: 'L\'alliance d\'un homme et d\'une femme',
    description: 'Le mariage est le sacrement qui unit un homme et une femme dans l\'amour et la fidélité pour toute la vie.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop',
    contenu: {
      intro: 'Le mariage est un sacrement par lequel un homme et une femme s\'unissent pour toute leur vie devant Dieu et devant l\'Église.',
      details: [
        'Alliance indissoluble',
        'Fidélité mutuelle',
        'Ouverture à la vie',
        'Grâce pour vivre l\'amour au quotidien'
      ],
      pratique: {
        titre: 'Se marier à l\'église',
        preparation: 'Pour vous marier à l\'église :',
        modalites: [
          'Prendre contact au moins 6 mois à l\'avance',
          'Parcours de préparation avec d\'autres couples',
          'Rencontres avec le prêtre ou le diacre',
          'Constitution du dossier administratif'
        ]
      }
    }
  },
  reconciliation: {
    id: 'reconciliation',
    nom: 'Réconciliation',
    titre: 'La Réconciliation',
    sousTitre: 'Le sacrement du pardon',
    description: 'Le sacrement de réconciliation nous réconcilie avec Dieu et avec nos frères. Il nous donne la paix du cœur.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
    contenu: {
      intro: 'Le sacrement de réconciliation, aussi appelé confession, est le sacrement de la miséricorde de Dieu.',
      details: [
        'Pardon de tous les péchés',
        'Réconciliation avec Dieu et l\'Église',
        'Paix intérieure retrouvée',
        'Force pour progresser'
      ],
      pratique: {
        titre: 'Se confesser',
        preparation: 'Pour recevoir le sacrement :',
        modalites: [
          'Permanences de confession chaque samedi',
          'Possibilité de prendre rendez-vous',
          'Célébrations pénitentielles avant Noël et Pâques',
          'Accompagnement spirituel possible'
        ]
      }
    }
  },
  malades: {
    id: 'malades',
    nom: 'Onction des Malades',
    titre: 'L\'Onction des Malades',
    sousTitre: 'Le réconfort dans l\'épreuve',
    description: 'L\'onction des malades apporte réconfort, paix et courage pour supporter chrétiennement les souffrances de la maladie ou de la vieillesse.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&h=1080&fit=crop',
    contenu: {
      intro: 'Ce sacrement est destiné à réconforter ceux qui sont éprouvés par la maladie ou la vieillesse.',
      details: [
        'Force spirituelle dans l\'épreuve',
        'Union aux souffrances du Christ',
        'Grâce de guérison si Dieu le veut',
        'Préparation au passage vers le Père'
      ],
      pratique: {
        titre: 'Recevoir l\'onction',
        preparation: 'Pour demander ce sacrement :',
        modalites: [
          'Pour une personne malade ou âgée',
          'À domicile ou à l\'hôpital',
          'Célébration communautaire possible',
          'Contacter le prêtre de la paroisse'
        ]
      }
    }
  },
  ordination: {
    id: 'ordination',
    nom: 'Ordination',
    titre: 'L\'Ordination',
    sousTitre: 'Le sacrement du service',
    description: 'Par l\'ordination, des hommes sont consacrés pour servir le Christ et l\'Église comme diacres, prêtres ou évêques.',
    image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=1920&h=1080&fit=crop',
    contenu: {
      intro: 'Le sacrement de l\'ordre est le sacrement par lequel des hommes sont ordonnés pour le service de l\'Église.',
      details: [
        'Trois degrés : diaconat, presbytérat, épiscopat',
        'Configuration au Christ serviteur',
        'Mission d\'enseigner, sanctifier et gouverner',
        'Don total de soi au service de l\'Église'
      ],
      pratique: {
        titre: 'Discerner l\'appel',
        preparation: 'Si vous ressentez un appel :',
        modalites: [
          'Accompagnement spirituel',
          'Année de propédeutique',
          'Formation au séminaire (6 ans)',
          'Contact avec le service des vocations'
        ]
      }
    }
  }
}

export default function SacrementsPageClient({ paroisse: initialParoisse }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState(null)
  
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

  useEffect(() => {
    // Scroll to section if hash in URL
    const hash = window.location.hash.replace('#', '')
    if (hash && sacrementsData[hash]) {
      setTimeout(() => {
        const element = document.getElementById(hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }, [])

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
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
              <Link href={`/site/${paroisse.subdomain}/paroisse${isEditMode ? '?edit=true' : ''}`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">La Paroisse</Link>
              <Link href={`/site/${paroisse.subdomain}/pastorale${isEditMode ? '?edit=true' : ''}`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Pastorale</Link>
              <Link href={`/site/${paroisse.subdomain}/sacrements${isEditMode ? '?edit=true' : ''}`} className="text-sm font-medium text-blue-600 border-b-2 border-blue-600">Sacrements</Link>
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

      {/* Hero Section - CORRIGÉ */}
      <section className="relative h-[600px] mt-16 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transform scale-105"
          style={{ 
            backgroundImage: `url('${getValue('sacrementsHeroImage', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=1080&fit=crop')}')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-blue-900/70 to-indigo-900/80" />
        
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
                      updateField('sacrementsHeroImage', reader.result)
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
                  Les Sept Sacrements
                </span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Les Sacrements
                </span>
                <br />
                de l'Église
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed italic">
                « Les sacrements sont des signes efficaces de la grâce,<br />
                institués par le Christ et confiés à l'Église, par lesquels<br />
                la vie divine nous est dispensée. »
              </p>
              
              <p className="text-lg text-white/80 mb-10">
                Catéchisme de l'Église catholique n° 1131
              </p>
              
              <div className="flex justify-center">
                <button 
                  onClick={() => {
                    document.getElementById('sacrements-nav')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    })
                  }}
                  className="bg-white text-purple-900 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
                >
                  <Heart className="w-5 h-5 inline mr-2" />
                  Découvrir les sacrements
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation des sacrements - CORRIGÉ */}
      <section id="sacrements-nav" className="bg-white/95 backdrop-blur-md py-4 shadow-lg sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center">
            <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-hide max-w-full">
              {Object.values(sacrementsData).map((sacrement) => {
                const Icon = sacrementIcons[sacrement.id] || Heart
                const colors = sacrementColors[sacrement.id]
                
                return (
                  <button
                    key={sacrement.id}
                    onClick={() => scrollToSection(sacrement.id)}
                    className={`group flex-shrink-0 bg-white rounded-xl p-3 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 ring-1 ring-gray-200 hover:${colors.ring} min-w-[120px]`}
                  >
                    <div className={`w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-r ${colors.from} ${colors.to} flex items-center justify-center transform group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-xs text-gray-900 group-hover:text-purple-600 transition-colors text-center leading-tight">
                      {sacrement.nom}
                    </h3>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Sections détaillées - Modernisées */}
      <main>
        {Object.values(sacrementsData).map((sacrement, index) => {
          const Icon = sacrementIcons[sacrement.id] || Heart
          const colors = sacrementColors[sacrement.id]
          
          return (
            <section 
              key={sacrement.id} 
              id={sacrement.id}
              className={`relative py-20 ${index % 2 === 0 ? 'bg-white' : 'bg-gradient-to-br from-gray-50 to-blue-50'}`}
            >
              <div className="max-w-7xl mx-auto px-4">
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 0 ? '' : 'lg:grid-flow-col-dense'}`}>
                  
                  {/* Image */}
                  <div className={`relative ${index % 2 === 0 ? '' : 'lg:col-start-2'}`}>
                    <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl group">
                      <div 
                        className="absolute inset-0 bg-cover bg-center transform scale-105 group-hover:scale-110 transition-transform duration-700"
                        style={{ backgroundImage: `url('${getValue(`sacrement${sacrement.id}Image`, sacrement.image)}')` }}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-br ${colors.from}/20 ${colors.to}/30`} />
                      
                      {/* Badge du sacrement */}
                      <div className="absolute top-6 left-6">
                        <div className={`bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg`}>
                          <Icon className={`w-8 h-8 ${colors.text}`} />
                        </div>
                      </div>
                      
                      {/* Bouton pour changer l'image en mode édition */}
                      {isEditMode && (
                        <div className="absolute top-6 right-6">
                          <label className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg flex items-center cursor-pointer hover:bg-white transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  const reader = new FileReader()
                                  reader.onloadend = () => {
                                    updateField(`sacrement${sacrement.id}Image`, reader.result)
                                  }
                                  reader.readAsDataURL(file)
                                }
                              }}
                              className="hidden"
                            />
                            <Upload className="w-4 h-4 mr-2" />
                            Changer
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className={`${index % 2 === 0 ? '' : 'lg:col-start-1'}`}>
                    <div className="space-y-6">
                      
                      {/* En-tête */}
                      <div>
                        <span className={`inline-flex items-center px-4 py-2 rounded-full ${colors.bg} ${colors.text} text-sm font-medium mb-4`}>
                          <Icon className="w-4 h-4 mr-2" />
                          Sacrement
                        </span>
                        
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                          {sacrement.titre}
                        </h2>
                        
                        <p className={`text-xl ${colors.text} mb-6 italic font-medium`}>
                          {sacrement.sousTitre}
                        </p>
                      </div>
                      
                      {/* Description principale */}
                      <div className={`${colors.bg} rounded-2xl p-8 shadow-lg`}>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                          <Icon className={`w-6 h-6 mr-3 ${colors.text}`} />
                          Le sacrement {sacrement.id === 'ordination' ? 'de l\'ordre' : `${sacrement.id === 'malades' ? 'de l\'onction des malades' : `du ${sacrement.nom.toLowerCase()}`}`}
                        </h3>
                        
                        <p className="text-gray-700 mb-6 leading-relaxed">
                          {sacrement.contenu.intro}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                          {sacrement.contenu.details.map((detail, idx) => (
                            <div key={idx} className="flex items-start bg-white rounded-xl p-4 shadow-sm">
                              <div className={`w-2 h-2 rounded-full ${colors.from} ${colors.to} bg-gradient-to-r mt-2 mr-3 flex-shrink-0`}></div>
                              <span className="text-gray-700 text-sm leading-relaxed">{detail}</span>
                            </div>
                          ))}
                        </div>

                        {/* Section pratique */}
                        <div className="border-t border-gray-200 pt-6">
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                            <BookOpen className={`w-5 h-5 mr-2 ${colors.text}`} />
                            {sacrement.contenu.pratique.titre}
                          </h4>
                          
                          <p className="text-gray-700 mb-4 leading-relaxed">
                            {sacrement.contenu.pratique.preparation}
                          </p>
                          
                          <div className="space-y-2">
                            {sacrement.contenu.pratique.modalites.map((modalite, idx) => (
                              <div key={idx} className="flex items-start">
                                <ArrowRight className={`w-4 h-4 mr-2 mt-0.5 ${colors.text} flex-shrink-0`} />
                                <span className="text-gray-600 text-sm leading-relaxed">{modalite}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Contact pour certains sacrements */}
                      {['bapteme', 'mariage', 'malades'].includes(sacrement.id) && (
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                          <h5 className="font-bold text-gray-900 mb-3 flex items-center">
                            <Icon className={`w-5 h-5 mr-2 ${colors.text}`} />
                            Pour toute demande
                          </h5>
                          <div className="space-y-2 text-sm text-gray-600">
                            {paroisse.email && (
                              <p className="flex items-center">
                                <span className="font-medium mr-2">Email :</span>
                                <a href={`mailto:${paroisse.email}`} className="text-blue-600 hover:text-blue-700">
                                  {paroisse.email}
                                </a>
                              </p>
                            )}
                            {paroisse.telephone && (
                              <p className="flex items-center">
                                <span className="font-medium mr-2">Téléphone :</span>
                                <a href={`tel:${paroisse.telephone}`} className="text-blue-600 hover:text-blue-700">
                                  {paroisse.telephone}
                                </a>
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )
        })}
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

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}