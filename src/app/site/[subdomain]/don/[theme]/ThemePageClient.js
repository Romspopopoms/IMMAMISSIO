// src/app/site/[subdomain]/don/[theme]/ThemePageClient.js
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Upload, Euro, Heart, Church, Target, Eye, ArrowLeft, CheckCircle, Clock } from 'lucide-react'
import { useEditable } from '../../../../../hooks/useEditable'
import { EditableText } from '../../../../../components/Editable'
import EditBar from '../../../../../components/EditBar'
import ModalContribuer from '../../../../../components/ModalContribuer'

export default function ThemePageClient({ paroisse: initialParoisse, theme, projets: initialProjets = [] }) {
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
    getValue
  } = useEditable(initialParoisse)

  // Utiliser directement les données passées en props
  const paroisse = initialParoisse
  const projets = initialProjets // ← Les projets doivent venir du serveur via props

  // Obtenir les thématiques
  const themes = getValue('donThemes', [])
  const currentTheme = themes.find(t => t.id === theme) || {
    id: theme,
    label: theme.charAt(0).toUpperCase() + theme.slice(1).replace('-', ' '),
    icon: 'Church',
    image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1920&h=1080&fit=crop'
  }

  // Calculs statiques basés sur les données initiales
  const getPercentage = (projet) => {
    const collecte = projet.collecte || 0
    return Math.min(Math.round((collecte / projet.objectif) * 100), 100)
  }

  const getCollecte = (projet) => {
    return projet.collecte || 0
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount)
  }

  const totalCollecte = projets.reduce((acc, projet) => acc + getCollecte(projet), 0)
  const projetsCompletes = projets.filter(p => getCollecte(p) >= p.objectif).length

  // Fonction pour obtenir l'icône
  const getIconComponent = (iconName) => {
    const icons = {
      Church, Heart, Target, Euro, CheckCircle, Clock
    }
    return icons[iconName] || Church
  }

  const IconComponent = getIconComponent(currentTheme.icon)

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
      <section className="relative h-[400px] mt-16 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transform scale-105"
          style={{ 
            backgroundImage: `url('${currentTheme.image}')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-indigo-900/80" />
        
        {/* Bouton retour */}
        <div className="absolute top-4 left-4 z-20">
          <Link 
            href={`/site/${paroisse.subdomain}/don${isEditMode ? '?edit=true' : ''}`}
            className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg flex items-center hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour aux dons
          </Link>
        </div>
        
        {/* Bouton pour changer l'image en mode édition */}
        {isEditMode && (
          <div className="absolute top-4 right-4 z-20">
            <label className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg flex items-center cursor-pointer hover:bg-white transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      const themes = getValue('donThemes', [])
                      const updatedThemes = themes.map(t => 
                        t.id === theme ? { ...t, image: reader.result } : t
                      )
                      updateField('donThemes', updatedThemes)
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
                  <IconComponent className="w-4 h-4 mr-2" />
                  Thématique
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
                <EditableText
                  value={getValue(`theme${theme.charAt(0).toUpperCase() + theme.slice(1).replace('-', '')}Title`, currentTheme.label)}
                  onChange={(value) => updateField(`theme${theme.charAt(0).toUpperCase() + theme.slice(1).replace('-', '')}Title`, value)}
                  isEditMode={isEditMode}
                  className="text-5xl md:text-6xl font-black text-white"
                />
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                <EditableText
                  value={getValue(`theme${theme.charAt(0).toUpperCase() + theme.slice(1).replace('-', '')}Subtitle`, `Découvrez tous les projets liés à ${currentTheme.label.toLowerCase()} et soutenez ceux qui vous tiennent à cœur.`)}
                  onChange={(value) => updateField(`theme${theme.charAt(0).toUpperCase() + theme.slice(1).replace('-', '')}Subtitle`, value)}
                  isEditMode={isEditMode}
                  className="text-xl md:text-2xl text-white/90"
                  multiline={true}
                />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques de la thématique */}
      <section className="py-8 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div className="group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{projets.length}</div>
              <div className="text-sm text-gray-600">Projets actifs</div>
            </div>
            
            <div className="group">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Euro className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatAmount(totalCollecte)}€
              </div>
              <div className="text-sm text-gray-600">Collectés au total</div>
            </div>
            
            <div className="group">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {projetsCompletes}
              </div>
              <div className="text-sm text-gray-600">Objectifs atteints</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Projets */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
              <IconComponent className="w-4 h-4 mr-2" />
              Tous les projets
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {projets.length} projet{projets.length !== 1 ? 's' : ''} pour {currentTheme.label.toLowerCase()}
            </h2>
          </div>

          {projets.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projets.map((projet) => (
                <div key={projet.id} className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={projet.image} 
                      alt={projet.titre}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    
                    {/* Badge de statut */}
                    <div className="absolute top-4 left-4">
                      {getCollecte(projet) >= projet.objectif ? (
                        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Objectif atteint !
                        </span>
                      ) : (
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          En cours
                        </span>
                      )}
                    </div>
                    
                    {/* Pourcentage */}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-gray-900">
                      {getPercentage(projet)}%
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-8">
                    <Link href={`/site/${paroisse.subdomain}/don/projet/${projet.id}${isEditMode ? '?edit=true' : ''}`}>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors cursor-pointer">
                        {projet.titre}
                      </h3>
                    </Link>
                    <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">
                      {projet.description}
                    </p>

                    {/* Barre de progression moderne */}
                    <div className="mb-8">
                      <div className="flex justify-between text-sm text-gray-600 mb-3">
                        <span className="font-medium">{formatAmount(getCollecte(projet))}€ collectés</span>
                        <span>Objectif : {formatAmount(projet.objectif)}€</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-blue-600 transition-all duration-1000 ease-out relative overflow-hidden"
                          style={{ width: `${getPercentage(projet)}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"></div>
                        </div>
                      </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex space-x-3">
                      <Link
                        href={`/site/${paroisse.subdomain}/don/projet/${projet.id}${isEditMode ? '?edit=true' : ''}`}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors text-center flex items-center justify-center group"
                      >
                        <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                        Voir plus
                      </Link>
                      <button 
                        onClick={() => {
                          setSelectedProject(projet)
                          setShowContribuerModal(true)
                        }}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Heart className="w-4 h-4 inline mr-2" />
                        Contribuer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <IconComponent className="w-16 h-16 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Aucun projet pour {currentTheme.label.toLowerCase()}</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Aucun projet n'est actuellement disponible pour cette thématique.
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
          console.log('Don effectué avec succès:', montant)
          setShowContribuerModal(false)
          setSelectedProject(null)
          window.location.reload() // Pour voir les nouveaux montants

        }}
      />

      {/* Footer */}
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
              <Link href={`/site/${paroisse.subdomain}/don`} className="text-gray-400 hover:text-white transition-colors">
                Dons
              </Link>
              <Link href={`/site/${paroisse.subdomain}/actualites`} className="text-gray-400 hover:text-white transition-colors">
                Actualités
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}