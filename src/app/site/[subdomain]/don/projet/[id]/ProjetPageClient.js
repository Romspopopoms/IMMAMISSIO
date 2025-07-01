// src/app/site/[subdomain]/don/projet/[id]/ProjetPageClient.js
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowLeft, Heart, Euro, Users, Calendar, Share2, Facebook, Twitter, Mail, Target, CheckCircle, Clock, MessageCircle, Gift, TrendingUp, Award } from 'lucide-react'
import { useEditable } from '../../../../../../hooks/useEditable'
import EditBar from '../../../../../../components/EditBar'
import ModalContribuer from '../../../../../../components/ModalContribuer'

export default function ProjetPageClient({ paroisse: initialParoisse, projet: initialProjet, dons: initialDons }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showContribuerModal, setShowContribuerModal] = useState(false)
  
  // Hook d'édition pour le contenu statique uniquement
  const {
    isEditMode,
    hasChanges,
    saving,
    saveChanges,
    exitEditMode,
    data
  } = useEditable(initialParoisse)

  // Utiliser les données mises à jour
  const paroisse = { ...initialParoisse, ...data }
  
  // Utiliser directement le projet initial (pas de modification possible)
  const projet = initialProjet
  const dons = initialDons

  // ✅ Utiliser directement projet.collecte calculé côté serveur
  const totalCollecte = projet.collecte || 0

  const getPercentage = (collecte, objectif) => {
    return Math.min(Math.round((collecte / objectif) * 100), 100)
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const donateursPublics = dons.filter(don => !don.anonyme && don.donateur)
  const totalDonateurs = dons.length
  const resteACollecter = Math.max(0, projet.objectif - totalCollecte)
  const objectifAtteint = totalCollecte >= projet.objectif

  const handleShare = (platform) => {
    const shareUrl = `${window.location.origin}/site/${paroisse.subdomain}/don/projet/${projet.id}`
    const shareText = `Soutenez le projet "${projet.titre}" de la paroisse ${paroisse.nom}`
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      email: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`
    }
    
    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400')
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
      <section className="relative h-[600px] mt-16 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transform scale-105"
          style={{ 
            backgroundImage: `url('${projet.image}')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-green-900/80" />
        
        {/* Floating elements */}
        <div className="absolute top-20 right-20 opacity-20">
          <Target className="w-32 h-32 text-white animate-pulse" />
        </div>
        <div className="absolute bottom-20 left-20 opacity-10">
          <Heart className="w-24 h-24 text-white animate-bounce" />
        </div>
        
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
        
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="text-center max-w-4xl mx-auto">
              <div className="mb-8">
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium mb-6">
                  {objectifAtteint ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Objectif atteint !
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      En cours
                    </>
                  )}
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
                {projet.titre}
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
                {projet.description}
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button 
                  onClick={() => setShowContribuerModal(true)}
                  className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-xl"
                >
                  <Heart className="w-5 h-5 inline mr-2" />
                  Contribuer maintenant
                </button>
                <button 
                  onClick={() => {
                    document.getElementById('partage-section')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    })
                  }}
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-blue-900 transition-all transform hover:scale-105"
                >
                  <Share2 className="w-5 h-5 inline mr-2" />
                  Partager le projet
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Section */}
      <section className="py-12 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
                <TrendingUp className="w-4 h-4 mr-2" />
                Progression du projet
              </div>
              <div className="text-6xl font-black text-gray-900 mb-2">
                {getPercentage(totalCollecte, projet.objectif)}%
              </div>
              <div className="text-lg text-gray-600">de l'objectif atteint</div>
            </div>
            
            {/* Barre de progression XXL */}
            <div className="w-full bg-gray-200 rounded-full h-8 mb-8 overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 transition-all duration-2000 ease-out relative overflow-hidden"
                style={{ width: `${getPercentage(totalCollecte, projet.objectif)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-3 gap-8 text-center">
              <div className="group">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Euro className="w-10 h-10 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatAmount(totalCollecte)}€
                </div>
                <div className="text-sm text-gray-600 font-medium">Collectés</div>
              </div>
              
              <div className="group">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Target className="w-10 h-10 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatAmount(projet.objectif)}€
                </div>
                <div className="text-sm text-gray-600 font-medium">Objectif</div>
              </div>
              
              <div className="group">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {totalDonateurs}
                </div>
                <div className="text-sm text-gray-600 font-medium">Donateurs</div>
              </div>
            </div>

            {/* Message de motivation */}
            {objectifAtteint ? (
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">🎉 Objectif atteint !</h3>
                <p className="text-green-700">
                  Grâce à votre générosité, ce projet a pu voir le jour. Merci à tous les donateurs !
                </p>
              </div>
            ) : (
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl text-center">
                <h3 className="text-xl font-bold text-blue-800 mb-2">Il reste {formatAmount(resteACollecter)}€ à collecter</h3>
                <p className="text-blue-700">
                  Votre soutien peut faire la différence pour atteindre l'objectif !
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Description détaillée */}
              <div className="bg-white rounded-3xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mr-4">
                    <MessageCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">À propos du projet</h2>
                </div>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {projet.description}
                  </p>
                </div>
              </div>

              {/* Liste des donateurs */}
              {donateursPublics.length > 0 && (
                <div className="bg-white rounded-3xl shadow-lg p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mr-4">
                      <Heart className="w-6 h-6 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Nos généreux donateurs</h2>
                  </div>
                  <div className="space-y-4">
                    {donateursPublics.slice(0, 10).map((don) => (
                      <div key={don.id} className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl hover:shadow-md transition-all">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {don.donateur.prenom.charAt(0)}{don.donateur.nom.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="font-bold text-gray-900">
                              {don.donateur.prenom} {don.donateur.nom}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(don.createdAt)}
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                          {formatAmount(don.montant)}€
                        </div>
                      </div>
                    ))}
                    {donateursPublics.length > 10 && (
                      <div className="text-center text-gray-500 pt-4 font-medium">
                        ... et {donateursPublics.length - 10} autres généreux donateurs
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Bouton de don */}
              <div className="bg-white rounded-3xl shadow-lg p-8">
                <button
                  onClick={() => setShowContribuerModal(true)}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-6 rounded-2xl font-bold text-xl hover:from-green-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 mb-6"
                >
                  <Gift className="w-6 h-6 inline mr-3" />
                  Contribuer au projet
                </button>
                
                <div className="text-center space-y-3">
                  <div className="p-4 bg-green-50 rounded-2xl">
                    <p className="text-green-800 font-bold mb-1">
                      💰 Déduction fiscale de 66%
                    </p>
                    <p className="text-sm text-green-700">
                      Un don de 100€ ne vous coûte que 34€
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Reçu fiscal automatique par email
                  </p>
                </div>
              </div>

              {/* Partage */}
              <div id="partage-section" className="bg-white rounded-3xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mr-4">
                    <Share2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Partager ce projet</h3>
                </div>
                <div className="space-y-4">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-full flex items-center justify-center p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
                  >
                    <Facebook className="w-5 h-5 mr-3" />
                    Partager sur Facebook
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full flex items-center justify-center p-4 bg-sky-500 text-white rounded-2xl hover:bg-sky-600 transition-all transform hover:scale-105 shadow-lg"
                  >
                    <Twitter className="w-5 h-5 mr-3" />
                    Partager sur Twitter
                  </button>
                  <button
                    onClick={() => handleShare('email')}
                    className="w-full flex items-center justify-center p-4 bg-gray-600 text-white rounded-2xl hover:bg-gray-700 transition-all transform hover:scale-105 shadow-lg"
                  >
                    <Mail className="w-5 h-5 mr-3" />
                    Partager par email
                  </button>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-white rounded-3xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Une question ?</h3>
                </div>
                <div className="space-y-4 text-gray-600">
                  {paroisse.email && (
                    <div className="flex items-center p-3 bg-blue-50 rounded-xl">
                      <Mail className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <a href={`mailto:${paroisse.email}`} className="font-medium text-blue-600 hover:text-blue-700">
                          {paroisse.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {paroisse.telephone && (
                    <div className="flex items-center p-3 bg-green-50 rounded-xl">
                      <Users className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <div className="text-sm text-gray-500">Téléphone</div>
                        <a href={`tel:${paroisse.telephone}`} className="font-medium text-green-600 hover:text-green-700">
                          {paroisse.telephone}
                        </a>
                      </div>
                    </div>
                  )}
                  {paroisse.adresse && (
                    <div className="flex items-start p-3 bg-purple-50 rounded-xl">
                      <Target className="w-5 h-5 text-purple-600 mr-3 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-500">Adresse</div>
                        <div className="font-medium text-purple-600">
                          {paroisse.adresse}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de contribution */}
      <ModalContribuer
        isOpen={showContribuerModal}
        onClose={() => setShowContribuerModal(false)}
        projet={projet}
        paroisseId={paroisse.id}
        onSuccess={(montant) => {
          // ✅ Après un don, on peut recharger la page pour voir les nouvelles données
          // Ou implémenter une mise à jour optimiste si besoin
          console.log('Don effectué:', montant)
          window.location.reload() // Simple mais efficace
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