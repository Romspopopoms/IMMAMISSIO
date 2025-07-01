// src/app/site/[subdomain]/don/DonPageClient.js
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Upload, Euro, Heart, Church, Target, Eye, Gift, Users, BookOpen, Globe } from 'lucide-react'
import { useEditable } from '../../../../hooks/useEditable'
import { EditableText, EditableImage } from '../../../../components/Editable'
import EditBar from '../../../../components/EditBar'
import ModalContribuer from '../../../../components/ModalContribuer'

export default function DonPageClient({ paroisse: initialParoisse, projetsALaUne: initialProjets = [] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showContribuerModal, setShowContribuerModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  
  // Hook d'édition pour le contenu statique uniquement
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

  // Thématiques par défaut (lecture seule)
  const defaultThemes = [
    {
      id: 'vie-paroissiale',
      label: 'Vie paroissiale',
      icon: 'Church',
      image: 'https://images.unsplash.com/photo-1564659107532-82c0df3cc0f1?w=400&h=300&fit=crop'
    },
    {
      id: 'charite',
      label: 'Charité',
      icon: 'Heart',
      image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop'
    },
    {
      id: 'projets',
      label: 'Projets',
      icon: 'Target',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop'
    },
    {
      id: 'pelerinage',
      label: 'Pèlerinage',
      icon: 'Users',
      image: 'https://images.unsplash.com/photo-1533000971552-6a962ff0b9f9?w=400&h=300&fit=crop'
    },
    {
      id: 'missions',
      label: 'Missions',
      icon: 'Globe',
      image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&h=300&fit=crop'
    },
    {
      id: 'quete',
      label: 'Quête',
      icon: 'Heart',
      image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=300&fit=crop'
    },
    {
      id: 'denier',
      label: 'Denier',
      icon: 'Euro',
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop'
    }
  ]

  // Utiliser les thèmes depuis la config ou les thèmes par défaut
  const themes = getValue('donThemes', defaultThemes)
  
  // Utiliser les projets passés en props depuis le serveur
  const projetsALaUne = initialProjets

  const getPercentage = (collecte, objectif) => {
    return Math.min(Math.round((collecte / objectif) * 100), 100)
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount)
  }

  // Fonction pour obtenir l'icône
  const getIconComponent = (iconName) => {
    const icons = {
      Church, Heart, Target, Users, Globe, Euro, Gift, BookOpen
    }
    return icons[iconName] || Church
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
      
      {/* Header */}
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

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200">
            <div className="px-4 py-2 space-y-1">
              <Link href={`/site/${paroisse.subdomain}/paroisse${isEditMode ? '?edit=true' : ''}`} className="block py-2 text-sm text-gray-700">La Paroisse</Link>
              <Link href={`/site/${paroisse.subdomain}/pastorale${isEditMode ? '?edit=true' : ''}`} className="block py-2 text-sm text-gray-700">Pastorale</Link>
              <Link href={`/site/${paroisse.subdomain}/sacrements${isEditMode ? '?edit=true' : ''}`} className="block py-2 text-sm text-gray-700">Sacrements</Link>
              <Link href={`/site/${paroisse.subdomain}/actualites${isEditMode ? '?edit=true' : ''}`} className="block py-2 text-sm text-gray-700">Actualités</Link>
              <Link href={`/site/${paroisse.subdomain}/agenda${isEditMode ? '?edit=true' : ''}`} className="block py-2 text-sm text-gray-700">Agenda</Link>
              <Link href={`/site/${paroisse.subdomain}/activites${isEditMode ? '?edit=true' : ''}`} className="block py-2 text-sm text-gray-700">Activités</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative h-[500px] mt-16 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('${getValue('donHeroImage', 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1920&h=1080&fit=crop')}')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-blue-900/70" />
        
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
                      updateField('donHeroImage', reader.result)
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
        
        <div className="relative z-10 h-full flex items-center justify-center text-center text-white px-4">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-light mb-6">
              <EditableText
                value={getValue('donHeroTitle', 'Soutenez votre église')}
                onChange={(value) => updateField('donHeroTitle', value)}
                isEditMode={isEditMode}
                className="text-5xl md:text-6xl font-light text-white"
              />
            </h1>
            <p className="text-xl md:text-2xl italic font-light mb-8">
              <EditableText
                value={getValue('donHeroSubtitle', 'Participez à la mission de notre paroisse :\nchaque don compte !')}
                onChange={(value) => updateField('donHeroSubtitle', value)}
                isEditMode={isEditMode}
                className="text-xl md:text-2xl italic font-light text-white"
                multiline={true}
              />
            </p>
            
            {/* Bouton Déduction fiscale */}
            <div className="inline-flex items-center bg-green-600/90 backdrop-blur-sm text-white px-6 py-3 rounded-full">
              <Gift className="w-5 h-5 mr-2" />
              <span className="font-medium">Déduction fiscale</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section Thématiques */}
      <section className="py-8 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {themes.map((theme) => {
              const IconComponent = getIconComponent(theme.icon)
              
              return (
                <div key={theme.id} className="group relative w-32 sm:w-36">
                  <Link 
                    href={`/site/${paroisse.subdomain}/don/${theme.id}${isEditMode ? '?edit=true' : ''}`}
                    className="block relative h-20 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url('${theme.image}')` }}
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                    
                    <div className="relative z-10 h-full flex flex-col items-center justify-center text-white p-3">
                      <IconComponent className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-center leading-tight">
                        {theme.label}
                      </span>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Section Collecte à la une */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              <EditableText
                value={getValue('donCollecteTitle', 'Collecte à la une')}
                onChange={(value) => updateField('donCollecteTitle', value)}
                isEditMode={isEditMode}
                className="text-3xl font-bold text-gray-900"
              />
            </h2>
          </div>

          {projetsALaUne.length > 0 ? (
            <>
              <div className="grid md:grid-cols-3 gap-8">
                {projetsALaUne.map((projet) => (
                  <div key={projet.id} className="bg-white rounded-xl shadow-lg overflow-hidden group relative">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={projet.image} 
                        alt={projet.titre}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      
                      {/* Badge de pourcentage */}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-gray-900">
                        {getPercentage(projet.collecte, projet.objectif)}%
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {projet.titre}
                      </h3>
                      <p className="text-gray-600 mb-6 line-clamp-3">
                        {projet.description}
                      </p>

                      {/* Barre de progression */}
                      <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>{formatAmount(projet.collecte)}€ collectés</span>
                          <span>Objectif : {formatAmount(projet.objectif)}€</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                            style={{ width: `${getPercentage(projet.collecte, projet.objectif)}%` }}
                          />
                        </div>
                        {projet.collecte >= projet.objectif && (
                          <p className="text-sm text-green-600 font-medium mt-2">
                            🎉 Objectif atteint !
                          </p>
                        )}
                      </div>

                      {/* Bouton Contribuer */}
                      <button 
                        onClick={() => {
                          setSelectedProject(projet)
                          setShowContribuerModal(true)
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                      >
                        Contribuer
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bouton voir tous les projets */}
              <div className="text-center mt-12">
                <Link 
                  href={`/site/${paroisse.subdomain}/don/tous-projets${isEditMode ? '?edit=true' : ''}`}
                  className="inline-block bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  Voir tous les projets
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun projet à la une</h3>
              <p className="text-gray-600">
                Aucun projet de collecte n'est actuellement mis en avant.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Modal pour contribuer */}
      <ModalContribuer
        isOpen={showContribuerModal}
        onClose={() => {
          setShowContribuerModal(false)
          setSelectedProject(null)
        }}
        projet={selectedProject}
        paroisseId={paroisse.id}
        onSuccess={(montant) => {
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        }}
      />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 {paroisse.nom}. Site créé avec{' '}
            <a href="https://imamissio.com" className="text-blue-400 hover:text-blue-300">
              ImaMissio
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}