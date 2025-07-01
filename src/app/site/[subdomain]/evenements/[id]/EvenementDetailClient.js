// ============================================================================
// src/app/site/[subdomain]/evenements/[id]/EvenementDetailClient.js - Composant client
// ============================================================================
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X, 
  Clock, 
  Users, 
  Heart, 
  Book, 
  Church, 
  Hand, 
  FileText, 
  Upload, 
  Star, 
  ArrowRight, 
  Share2,
  Copy,
  Timer,
  CalendarDays,
  UserCheck,
  AlertCircle,
  Info,
  ExternalLink,
  ArrowLeft
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEditable } from '../../../../../hooks/useEditable'
import { EditableText, EditableImage } from '../../../../../components/Editable'
import EditBar from '../../../../../components/EditBar'

const moisFrancais = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

export default function EvenementDetailClient({ paroisse: initialParoisse, evenement: initialEvenement, isEditMode: initialEditMode = false }) {
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
  const evenement = initialEvenement

  const eventDate = new Date(evenement.dateDebut)
  const eventEndDate = evenement.dateFin ? new Date(evenement.dateFin) : null
  const isPast = eventDate < new Date()
  const isToday = eventDate.toDateString() === new Date().toDateString()
  const isTomorrow = eventDate.toDateString() === new Date(Date.now() + 86400000).toDateString()
  const isThisWeek = () => {
    const now = new Date()
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return eventDate >= now && eventDate <= oneWeekFromNow
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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
          title: evenement.titre,
          text: evenement.description?.substring(0, 100) + '...',
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
              <Link href={`/site/${paroisse.subdomain}/agenda${isEditMode ? '?edit=true' : ''}`} className="text-sm font-medium text-blue-600 border-b-2 border-blue-600">Agenda</Link>
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

      {/* Hero Section */}
      <section className="relative h-[600px] mt-16 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transform scale-105"
          style={{ 
            backgroundImage: `url('${getValue('eventDetailHeaderImage', 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920&h=1080&fit=crop')}')`
          }}
        />
        <div className={`absolute inset-0 ${
          isPast 
            ? 'bg-gradient-to-br from-gray-900/80 via-slate-900/70 to-gray-900/80' 
            : isThisWeek()
            ? 'bg-gradient-to-br from-orange-900/80 via-red-900/70 to-pink-900/80'
            : 'bg-gradient-to-br from-purple-900/80 via-indigo-900/70 to-blue-900/80'
        }`} />
        
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
                      updateField('eventDetailHeaderImage', reader.result)
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
          <Calendar className="w-32 h-32 text-white animate-pulse" />
        </div>
        <div className="absolute bottom-20 left-20 opacity-10">
          <Clock className="w-24 h-24 text-white animate-bounce" />
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
                <Link href={`/site/${paroisse.subdomain}/agenda${isEditMode ? '?edit=true' : ''}`} className="hover:text-white transition-colors">
                  Agenda
                </Link>
                <span>/</span>
                <span className="text-white font-medium">Événement</span>
              </nav>

              {/* Statut de l'événement */}
              <div className="mb-8">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-white text-sm font-medium mb-6 ${
                  isPast 
                    ? 'bg-white/20 backdrop-blur-md' 
                    : isToday
                    ? 'bg-red-500/90 backdrop-blur-md animate-pulse'
                    : isTomorrow
                    ? 'bg-orange-500/90 backdrop-blur-md'
                    : isThisWeek()
                    ? 'bg-yellow-500/90 backdrop-blur-md'
                    : 'bg-white/20 backdrop-blur-md'
                }`}>
                  <Calendar className="w-4 h-4 mr-2" />
                  {isPast ? 'Événement terminé' : 
                   isToday ? "Aujourd'hui !" :
                   isTomorrow ? 'Demain' :
                   isThisWeek() ? 'Cette semaine' : 'À venir'}
                </span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
                <span className={`${
                  isPast 
                    ? 'text-white' 
                    : 'bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent'
                }`}>
                  {evenement.titre}
                </span>
              </h1>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-white/90 mb-8">
                <div className="flex items-center">
                  <CalendarDays className="w-6 h-6 mr-3" />
                  <span className="text-xl font-medium">{formatDate(eventDate)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-6 h-6 mr-3" />
                  <span className="text-xl font-medium">
                    {formatTime(eventDate)}
                    {eventEndDate && ` - ${formatTime(eventEndDate)}`}
                  </span>
                </div>
                {evenement.lieu && (
                  <div className="flex items-center">
                    <MapPin className="w-6 h-6 mr-3" />
                    <span className="text-xl font-medium">{evenement.lieu}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={handleShare}
                  className="bg-white text-purple-900 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-purple-50 transition-all transform hover:scale-105 shadow-xl"
                >
                  <Share2 className="w-5 h-5 inline mr-2" />
                  Partager l'événement
                </button>
                <Link 
                  href={`/site/${paroisse.subdomain}/agenda${isEditMode ? '?edit=true' : ''}`}
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-purple-900 transition-all transform hover:scale-105"
                >
                  <ArrowLeft className="w-5 h-5 inline mr-2" />
                  Retour à l'agenda
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
            {evenement.description && (
              <div className="bg-white rounded-3xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                  <Info className="w-8 h-8 mr-4 text-purple-600" />
                  À propos de cet événement
                </h2>
                
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                    {evenement.description}
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
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <CalendarDays className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2 text-lg">Date</h4>
                      <p className="text-gray-700 text-lg">{formatDate(eventDate)}</p>
                      {eventEndDate && eventEndDate.toDateString() !== eventDate.toDateString() && (
                        <p className="text-gray-600 mt-1">Jusqu'au {formatDate(eventEndDate)}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2 text-lg">Horaires</h4>
                      <div className="text-gray-700 text-lg">
                        <p>Début : {formatTime(eventDate)}</p>
                        {eventEndDate && (
                          <p>Fin : {formatTime(eventEndDate)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {evenement.lieu && (
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2 text-lg">Lieu</h4>
                        <p className="text-gray-700 text-lg">{evenement.lieu}</p>
                      </div>
                    </div>
                  )}

                  {evenement.maxParticipants && (
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2 text-lg">Participants</h4>
                        <p className="text-gray-700 text-lg">Maximum {evenement.maxParticipants} personnes</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">
                Partager cet événement
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
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                  isPast 
                    ? 'bg-gradient-to-r from-gray-500 to-slate-500' 
                    : isThisWeek()
                    ? 'bg-gradient-to-r from-orange-500 to-red-500'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                }`}>
                  <div className="text-center text-white">
                    <div className="text-2xl font-black">
                      {eventDate.getDate()}
                    </div>
                    <div className="text-xs font-bold uppercase">
                      {moisFrancais[eventDate.getMonth()].substring(0, 3)}
                    </div>
                  </div>
                </div>
                
                <span className={`px-4 py-2 rounded-full font-semibold text-sm ${
                  isPast 
                    ? 'bg-gray-100 text-gray-700' 
                    : isToday
                    ? 'bg-red-100 text-red-700'
                    : isTomorrow
                    ? 'bg-orange-100 text-orange-700'
                    : isThisWeek()
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {isPast ? 'Terminé' : 
                   isToday ? "Aujourd'hui" :
                   isTomorrow ? 'Demain' :
                   isThisWeek() ? 'Cette semaine' : 'À venir'}
                </span>
              </div>

              {/* Détails rapides */}
              <div className="space-y-6 mb-8">
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Détails</h4>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-3" />
                      <span className="text-sm">
                        {formatTime(eventDate)}
                        {eventEndDate && ` - ${formatTime(eventEndDate)}`}
                      </span>
                    </div>
                    {evenement.lieu && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-3" />
                        <span className="text-sm">{evenement.lieu}</span>
                      </div>
                    )}
                    {evenement.maxParticipants && (
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-3" />
                        <span className="text-sm">Max {evenement.maxParticipants} participants</span>
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
                    href={`/site/${paroisse.subdomain}/agenda${isEditMode ? '?edit=true' : ''}`}
                    className="flex items-center text-gray-600 hover:text-purple-600 transition-colors font-medium"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à l'agenda
                  </Link>
                  
                  <Link
                    href={`/site/${paroisse.subdomain}${isEditMode ? '?edit=true' : ''}`}
                    className="flex items-center text-gray-600 hover:text-purple-600 transition-colors font-medium"
                  >
                    <Church className="w-4 h-4 mr-2" />
                    Accueil paroisse
                  </Link>
                  
                  <Link
                    href={`/site/${paroisse.subdomain}/actualites${isEditMode ? '?edit=true' : ''}`}
                    className="flex items-center text-gray-600 hover:text-purple-600 transition-colors font-medium"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Actualités
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
    </div>
  )
}