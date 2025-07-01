// ============================================================================
// src/app/site/[subdomain]/activites/[categorie]/[id]/ActiviteDetailClient.js - Composant client
// ============================================================================
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Menu, 
  X, 
  Clock, 
  Users, 
  Heart, 
  Book, 
  Church, 
  Hand, 
  Upload, 
  Star, 
  ArrowRight,
  ArrowLeft,
  Share2,
  Copy,
  Info,
  Contact,
  UserCheck,
  Music,
  Baby,
  GraduationCap,
  Palette,
  Wrench,
  HandHeart
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEditable } from '../../../../../../hooks/useEditable'
import { EditableText, EditableImage } from '../../../../../../components/Editable'
import EditBar from '../../../../../../components/EditBar'

// Icônes pour les catégories
const categoryIcons = {
  jeunesse: Baby,
  catechese: Book,
  etudiant: GraduationCap,
  adultes: UserCheck,
  musique: Music,
  ateliers: Wrench,
  solidarite: HandHeart
}

// Couleurs par défaut pour les catégories
const defaultColors = {
  jeunesse: 'from-pink-500 to-red-500',
  catechese: 'from-blue-500 to-indigo-500',
  etudiant: 'from-green-500 to-teal-500',
  adultes: 'from-purple-500 to-violet-500',
  musique: 'from-yellow-500 to-orange-500',
  ateliers: 'from-gray-500 to-slate-500',
  solidarite: 'from-rose-500 to-pink-500'
}

export default function ActiviteDetailClient({ paroisse: initialParoisse, activite: initialActivite, activitesSimilaires, isEditMode: initialEditMode = false }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  
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
  } = useEditable(initialParoisse, initialEditMode)

  // Utiliser les données mises à jour
  const paroisse = { ...initialParoisse, ...data }
  const activite = initialActivite

  const IconComponent = categoryIcons[activite.section.nom] || Users
  const gradientColor = activite.section.couleur || defaultColors[activite.section.nom] || 'from-gray-500 to-gray-600'

  // Copier le lien
  const copyLink = async () => {
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erreur lors de la copie:', error)
    }
  }

  // Partager
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: activite.titre,
          text: activite.description?.substring(0, 100) + '...',
          url: window.location.href
        })
      } catch (error) {
        console.error('Erreur lors du partage:', error)
        copyLink()
      }
    } else {
      copyLink()
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
              <Link href={`/site/${paroisse.subdomain}/activites${isEditMode ? '?edit=true' : ''}`} className="text-sm font-medium text-blue-600 border-b-2 border-blue-600">Activités</Link>
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

      {/* Hero Section */}
      <section className="relative h-[600px] mt-16 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transform scale-105"
          style={{ 
            backgroundImage: `url('${activite.image || getValue('activiteDetailHeaderImage', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&h=1080&fit=crop')}')`
          }}
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor}/80 via-purple-900/70 to-indigo-900/80`} />
        
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
                      updateField('activiteDetailHeaderImage', reader.result)
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
        
        {/* Floating elements */}
        <div className="absolute top-20 right-20 opacity-20">
          <IconComponent className="w-32 h-32 text-white animate-pulse" />
        </div>
        <div className="absolute bottom-20 left-20 opacity-10">
          <Star className="w-24 h-24 text-white animate-bounce" />
        </div>
        
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="max-w-4xl mx-auto text-center">
              {/* Breadcrumb */}
              <nav className="flex items-center justify-center space-x-2 text-white/80 text-sm mb-8">
                <Link href={`/site/${paroisse.subdomain}${isEditMode ? '?edit=true' : ''}`} className="hover:text-white transition-colors">
                  Accueil
                </Link>
                <span>/</span>
                <Link href={`/site/${paroisse.subdomain}/activites${isEditMode ? '?edit=true' : ''}`} className="hover:text-white transition-colors">
                  Activités
                </Link>
                <span>/</span>
                <Link href={`/site/${paroisse.subdomain}/activites/${activite.section.nom}${isEditMode ? '?edit=true' : ''}`} className="hover:text-white transition-colors">
                  {activite.section.titre}
                </Link>
                <span>/</span>
                <span className="text-white font-medium">Activité</span>
              </nav>

              {/* Badge catégorie */}
              <div className="mb-8">
                <span className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 backdrop-blur-md text-white text-lg font-medium mb-6">
                  <IconComponent className="w-6 h-6 mr-3" />
                  {activite.section.titre}
                </span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  {activite.titre}
                </span>
              </h1>
              
              {/* Informations rapides */}
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-white/90 mb-8">
                {activite.horaires && (
                  <div className="flex items-center">
                    <Clock className="w-6 h-6 mr-3" />
                    <span className="text-xl font-medium">{activite.horaires}</span>
                  </div>
                )}
                {activite.lieu && (
                  <div className="flex items-center">
                    <MapPin className="w-6 h-6 mr-3" />
                    <span className="text-xl font-medium">{activite.lieu}</span>
                  </div>
                )}
                {(activite.ageMin || activite.ageMax) && (
                  <div className="flex items-center">
                    <Users className="w-6 h-6 mr-3" />
                    <span className="text-xl font-medium">
                      {activite.ageMin && activite.ageMax 
                        ? `${activite.ageMin}-${activite.ageMax} ans`
                        : activite.ageMin 
                        ? `Dès ${activite.ageMin} ans`
                        : `Jusqu'à ${activite.ageMax} ans`
                      }
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={handleShare}
                  className="bg-white text-purple-900 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-purple-50 transition-all transform hover:scale-105 shadow-xl"
                >
                  <Share2 className="w-5 h-5 inline mr-2" />
                  Partager l'activité
                </button>
                <Link 
                  href={`/site/${paroisse.subdomain}/activites/${activite.section.nom}${isEditMode ? '?edit=true' : ''}`}
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-purple-900 transition-all transform hover:scale-105"
                >
                  <ArrowLeft className="w-5 h-5 inline mr-2" />
                  Retour à {activite.section.titre}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Description */}
            {activite.description && (
              <div className="bg-white rounded-3xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                  <Info className="w-8 h-8 mr-4 text-purple-600" />
                  À propos de cette activité
                </h2>
                
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                    {activite.description}
                  </p>
                </div>
              </div>
            )}

            {/* Informations pratiques */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <Clock className="w-6 h-6 mr-3 text-blue-600" />
                Informations pratiques
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {activite.horaires && (
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2 text-lg">Horaires</h4>
                        <p className="text-gray-700 text-lg">{activite.horaires}</p>
                      </div>
                    </div>
                  )}

                  {activite.lieu && (
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2 text-lg">Lieu</h4>
                        <p className="text-gray-700 text-lg">{activite.lieu}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {(activite.ageMin || activite.ageMax) && (
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2 text-lg">Âge</h4>
                        <p className="text-gray-700 text-lg">
                          {activite.ageMin && activite.ageMax 
                            ? `De ${activite.ageMin} à ${activite.ageMax} ans`
                            : activite.ageMin 
                            ? `À partir de ${activite.ageMin} ans`
                            : `Jusqu'à ${activite.ageMax} ans`
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  {activite.responsable && (
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Contact className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2 text-lg">Responsable</h4>
                        <p className="text-gray-700 text-lg">{activite.responsable}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations complémentaires */}
              {activite.infosComplementaires && (
                <div className="mt-8 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl">
                  <h4 className="font-bold text-gray-900 mb-3">Informations complémentaires</h4>
                  <p className="text-gray-700 leading-relaxed">{activite.infosComplementaires}</p>
                </div>
              )}

              {/* Contact */}
              {activite.contact && (
                <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl">
                  <h4 className="font-bold text-gray-900 mb-3">Contact</h4>
                  <p className="text-gray-700">{activite.contact}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">
                Partager cette activité
              </h3>
              
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleShare}
                  className="flex items-center px-8 py-4 bg-purple-100 text-purple-700 rounded-2xl hover:bg-purple-200 transition-all transform hover:scale-105 font-semibold text-lg"
                >
                  <Share2 className="w-6 h-6 mr-3" />
                  Partager
                </button>
                
                <button
                  onClick={copyLink}
                  className={`flex items-center px-8 py-4 rounded-2xl transition-all transform hover:scale-105 font-semibold text-lg ${
                    copied 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Copy className="w-6 h-6 mr-3" />
                  {copied ? 'Lien copié !' : 'Copier le lien'}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-lg p-8 sticky top-8">
              
              {/* Résumé rapide */}
              <div className="text-center mb-8">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-r ${gradientColor}`}>
                  <IconComponent className="w-10 h-10 text-white" />
                </div>
                
                <span className={`px-4 py-2 rounded-full font-semibold text-sm bg-gradient-to-r ${gradientColor} text-white`}>
                  {activite.section.titre}
                </span>
              </div>

              {/* Détails rapides */}
              <div className="space-y-6 mb-8">
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Détails</h4>
                  <div className="space-y-3">
                    {activite.horaires && (
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-3" />
                        <span className="text-sm">{activite.horaires}</span>
                      </div>
                    )}
                    {activite.lieu && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-3" />
                        <span className="text-sm">{activite.lieu}</span>
                      </div>
                    )}
                    {(activite.ageMin || activite.ageMax) && (
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-3" />
                        <span className="text-sm">
                          {activite.ageMin && activite.ageMax 
                            ? `${activite.ageMin}-${activite.ageMax} ans`
                            : activite.ageMin 
                            ? `Dès ${activite.ageMin} ans`
                            : `Jusqu'à ${activite.ageMax} ans`
                          }
                        </span>
                      </div>
                    )}
                    {activite.responsable && (
                      <div className="flex items-center text-gray-600">
                        <Contact className="w-4 h-4 mr-3" />
                        <span className="text-sm">{activite.responsable}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Navigation</h4>
                <div className="space-y-3">
                  <Link
                    href={`/site/${paroisse.subdomain}/activites/${activite.section.nom}${isEditMode ? '?edit=true' : ''}`}
                    className="flex items-center text-gray-600 hover:text-purple-600 transition-colors font-medium"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à {activite.section.titre}
                  </Link>
                  
                  <Link
                    href={`/site/${paroisse.subdomain}/activites${isEditMode ? '?edit=true' : ''}`}
                    className="flex items-center text-gray-600 hover:text-purple-600 transition-colors font-medium"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Toutes les activités
                  </Link>
                  
                  <Link
                    href={`/site/${paroisse.subdomain}${isEditMode ? '?edit=true' : ''}`}
                    className="flex items-center text-gray-600 hover:text-purple-600 transition-colors font-medium"
                  >
                    <Church className="w-4 h-4 mr-2" />
                    Accueil paroisse
                  </Link>
                </div>
              </div>

              {/* Contact paroisse */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Contact</h4>
                <div className="space-y-3">
                  {paroisse.telephone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-3" />
                      <span className="text-sm">{paroisse.telephone}</span>
                    </div>
                  )}
                  {paroisse.email && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-3" />
                      <span className="text-sm">{paroisse.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activités similaires */}
        {activitesSimilaires.length > 0 && (
          <section className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Autres activités {activite.section.titre}
              </h2>
              <p className="text-gray-600">
                Découvrez d'autres activités qui pourraient vous intéresser
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {activitesSimilaires.map((activiteSimilaire) => (
                <Link
                  key={activiteSimilaire.id}
                  href={`/site/${paroisse.subdomain}/activites/${activite.section.nom}/${activiteSimilaire.id}${isEditMode ? '?edit=true' : ''}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  {activiteSimilaire.image ? (
                    <div className="relative h-48">
                      <Image
                        src={activiteSimilaire.image}
                        alt={activiteSimilaire.titre}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className={`h-48 bg-gradient-to-br ${gradientColor} flex items-center justify-center`}>
                      <IconComponent className="w-12 h-12 text-white" />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      {activiteSimilaire.titre}
                    </h3>
                    {activiteSimilaire.description && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {activiteSimilaire.description}
                      </p>
                    )}
                    <div className="text-purple-600 font-medium text-sm">
                      En savoir plus <ArrowRight className="w-3 h-3 inline ml-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
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
              <Link href={`/site/${paroisse.subdomain}/agenda`} className="text-gray-400 hover:text-white transition-colors">
                Agenda
              </Link>
              <Link href={`/site/${paroisse.subdomain}/actualites`} className="text-gray-400 hover:text-white transition-colors">
                Actualités
              </Link>
              <Link href={`/site/${paroisse.subdomain}/don`} className="text-gray-400 hover:text-white transition-colors">
                Faire un don
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}