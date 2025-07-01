// src/app/site/[subdomain]/pastorale/PastoralePageClient.js
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Upload, Mail, Phone, Users, Heart, Crown, Building, Star, UserCheck, User, Shield } from 'lucide-react'
import { useEditable } from '../../../../hooks/useEditable'
import { EditableText, EditableImage } from '../../../../components/Editable'
import EditBar from '../../../../components/EditBar'

export default function PastoralePageClient({ paroisse: initialParoisse }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // États pour les données API
  const [pretres, setPretres] = useState([])
  const [membres, setMembres] = useState([])
  const [conseils, setConseils] = useState([])
  const [secteurs, setSecteurs] = useState([])
  const [loading, setLoading] = useState(true)
  
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

  // Charger les données depuis l'API (lecture seule)
  useEffect(() => {
    fetchPastoraleData()
  }, [])

  const fetchPastoraleData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      // Charger en parallèle
      const [pretresRes, membresRes, conseilsRes, secteursRes] = await Promise.all([
        fetch('/api/pretres', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => ({ ok: false })),
        fetch('/api/membres', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => ({ ok: false })),
        fetch('/api/conseils', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => ({ ok: false })),
        fetch('/api/secteurs', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => ({ ok: false }))
      ])

      if (pretresRes.ok) {
        const data = await pretresRes.json()
        setPretres(data.pretres || [])
      }

      if (membresRes.ok) {
        const data = await membresRes.json()
        setMembres(data.membres || [])
      }

      if (conseilsRes.ok) {
        const data = await conseilsRes.json()
        setConseils(data.conseils || [])
      }

      if (secteursRes.ok) {
        const data = await secteursRes.json()
        setSecteurs(data.secteurs || [])
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  // Organiser les membres par conseil
  const getMembresParConseil = (conseilId) => {
    return membres.filter(membre => 
      membre.appartenances?.some(app => app.conseil.id === conseilId)
    )
  }

  // Organiser les responsables par secteur
  const getResponsablesParSecteur = (secteurId) => {
    return membres.filter(membre => 
      membre.responsabilites?.some(resp => resp.secteur.id === secteurId)
    )
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
              <Link href={`/site/${initialParoisse.subdomain}${isEditMode ? '?edit=true' : ''}`} className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ImaMissio
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href={`/site/${initialParoisse.subdomain}/paroisse${isEditMode ? '?edit=true' : ''}`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">La Paroisse</Link>
              <Link href={`/site/${initialParoisse.subdomain}/pastorale${isEditMode ? '?edit=true' : ''}`} className="text-sm font-medium text-blue-600 border-b-2 border-blue-600">Pastorale</Link>
              <Link href={`/site/${initialParoisse.subdomain}/sacrements${isEditMode ? '?edit=true' : ''}`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Sacrements</Link>
              <Link href={`/site/${initialParoisse.subdomain}/actualites${isEditMode ? '?edit=true' : ''}`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Actualités</Link>
              <Link href={`/site/${initialParoisse.subdomain}/agenda${isEditMode ? '?edit=true' : ''}`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Agenda</Link>
              <Link href={`/site/${initialParoisse.subdomain}/activites${isEditMode ? '?edit=true' : ''}`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Activités</Link>
              <Link href={`/site/${initialParoisse.subdomain}/don${isEditMode ? '?edit=true' : ''}`} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all">Don</Link>
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
            backgroundImage: `url('${getValue('pastoraleHeroImage', 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1920&h=800&fit=crop')}')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-blue-900/70 to-purple-900/80" />
        
        <div className="absolute top-20 right-20 opacity-20">
          <Users className="w-32 h-32 text-white animate-pulse" />
        </div>
        <div className="absolute bottom-20 left-20 opacity-10">
          <Heart className="w-24 h-24 text-white animate-bounce" />
        </div>
        
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
                      updateField('pastoraleHeroImage', reader.result)
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
                  <Users className="w-4 h-4 mr-2" />
                  Équipe & Organisation
                </span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
                <EditableText
                  value={getValue('pastoraleHeroTitle', 'Notre Équipe')}
                  onChange={(value) => updateField('pastoraleHeroTitle', value)}
                  isEditMode={isEditMode}
                  className="text-6xl md:text-7xl font-black text-white"
                />
                <br />
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Pastorale
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
                <EditableText
                  value={getValue('pastoraleHeroSubtitle', "L'équipe pastorale est au service de la communauté paroissiale. Elle accompagne les fidèles dans leur chemin de foi et coordonne les différentes activités de la paroisse.")}
                  onChange={(value) => updateField('pastoraleHeroSubtitle', value)}
                  isEditMode={isEditMode}
                  className="text-xl md:text-2xl text-white/90"
                  multiline={true}
                />
              </p>
              
              <button 
                onClick={() => {
                  document.getElementById('equipe-section')?.scrollIntoView({ 
                    behavior: 'smooth' 
                  })
                }}
                className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
              >
                <Users className="w-5 h-5 inline mr-2" />
                Découvrir l'équipe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main>
        
        {/* Section Équipe Presbytérale */}
        <section id="equipe-section" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
                <Crown className="w-4 h-4 mr-2" />
                Direction Spirituelle
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                <EditableText
                  value={getValue('pastoraleEquipeTitle', 'L\'équipe presbytérale')}
                  onChange={(value) => updateField('pastoraleEquipeTitle', value)}
                  isEditMode={isEditMode}
                  className="text-4xl md:text-5xl font-bold text-gray-900"
                />
              </h2>
            </div>
            
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement de l'équipe...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pretres.length > 0 ? (
                  pretres.map((pretre) => (
                    <div key={pretre.id} className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
                      <div className="relative">
                        <div className="relative h-80 overflow-hidden">
                          <img
                            src={pretre.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'}
                            alt={`${pretre.prenom} ${pretre.nom}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          
                          <div className="absolute top-4 left-4">
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                              {pretre.fonction}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-8">
                          <h3 className="text-2xl font-bold text-black mb-4">
                            {pretre.prenom} {pretre.nom}
                          </h3>
                          
                          {pretre.bio && (
                            <p className="text-gray-600 mb-6 line-clamp-3">
                              {pretre.bio}
                            </p>
                          )}
                          
                          <div className="space-y-3 mb-6">
                            {pretre.email && (
                              <div className="flex items-center p-3 bg-blue-50 rounded-xl border border-blue-200">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                                  <Mail className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-gray-900 font-medium text-sm">
                                  {pretre.email}
                                </span>
                              </div>
                            )}
                            {pretre.telephone && (
                              <div className="flex items-center p-3 bg-green-50 rounded-xl border border-green-200">
                                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3">
                                  <Phone className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-gray-900 font-medium text-sm">
                                  {pretre.telephone}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {pretre.userId ? (
                            <div className="flex justify-center">
                              <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-xs font-medium flex items-center">
                                <UserCheck className="w-3 h-3 mr-2" />
                                Compte actif
                              </span>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <span className="bg-gray-100 text-gray-500 px-4 py-2 rounded-full text-xs font-medium flex items-center">
                                <User className="w-3 h-3 mr-2" />
                                Pas de compte
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full">
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Crown className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun prêtre dans l'équipe</h3>
                      <p className="text-gray-600">L'équipe presbytérale sera affichée ici une fois configurée</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Section Conseils */}
        <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-4">
                <Building className="w-4 h-4 mr-2" />
                Organisation
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                <EditableText
                  value={getValue('pastoraleConseilsTitle', 'Les conseils de la paroisse')}
                  onChange={(value) => updateField('pastoraleConseilsTitle', value)}
                  isEditMode={isEditMode}
                  className="text-4xl md:text-5xl font-bold text-gray-900"
                />
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {conseils.map((conseil) => {
                const membresConseil = getMembresParConseil(conseil.id)
                const iconColor = conseil.type === 'economique' ? 'from-green-500 to-emerald-500' :
                                conseil.type === 'pastoral' ? 'from-blue-500 to-purple-500' :
                                'from-indigo-500 to-purple-500'

                return (
                  <div key={conseil.id} className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 transform hover:-translate-y-1">
                    <div className="flex items-center mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${iconColor} rounded-2xl flex items-center justify-center mr-4`}>
                        {conseil.type === 'economique' ? (
                          <Building className="w-8 h-8 text-white" />
                        ) : conseil.type === 'pastoral' ? (
                          <Heart className="w-8 h-8 text-white" />
                        ) : (
                          <Star className="w-8 h-8 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900">{conseil.nom}</h3>
                      </div>
                    </div>
                    
                    {conseil.description && (
                      <p className="text-gray-600 mb-8 leading-relaxed">
                        {conseil.description}
                      </p>
                    )}
                    
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-purple-600" />
                        Membres ({membresConseil.length})
                      </h4>
                      
                      {membresConseil.length > 0 ? (
                        <div className="space-y-2">
                          {membresConseil.map((membre) => {
                            const appartenance = membre.appartenances.find(app => app.conseil.id === conseil.id)
                            return (
                              <div key={membre.id} className="flex items-center justify-between p-3 bg-white rounded-xl">
                                <div>
                                  <span className="font-medium text-gray-900">
                                    {membre.prenom} {membre.nom}
                                  </span>
                                  {appartenance?.fonction && (
                                    <span className="ml-2 text-sm text-purple-600 font-medium">
                                      • {appartenance.fonction}
                                    </span>
                                  )}
                                </div>
                                {membre.userId && (
                                  <UserCheck className="w-4 h-4 text-green-600" />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          Aucun membre assigné
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}

              {conseils.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Building className="w-12 h-12 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun conseil configuré</h3>
                  <p className="text-gray-600">Les conseils paroissiaux seront affichés ici une fois configurés</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section Secteurs */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-orange-800 text-sm font-medium mb-4">
                <Shield className="w-4 h-4 mr-2" />
                Responsabilités
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                <EditableText
                  value={getValue('pastoraleSecteursTitle', 'Secteurs d\'activités')}
                  onChange={(value) => updateField('pastoraleSecteursTitle', value)}
                  isEditMode={isEditMode}
                  className="text-4xl md:text-5xl font-bold text-gray-900"
                />
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {secteurs.map((secteur) => {
                const responsables = getResponsablesParSecteur(secteur.id)
                
                return (
                  <div key={secteur.id} className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 transform hover:-translate-y-1 border">
                    <div className="flex items-center mb-6">
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mr-4"
                        style={{ backgroundColor: secteur.couleur || '#6B7280' }}
                      >
                        <Shield className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900">{secteur.nom}</h3>
                      </div>
                    </div>
                    
                    {secteur.description && (
                      <p className="text-gray-600 mb-8 leading-relaxed">
                        {secteur.description}
                      </p>
                    )}
                    
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-orange-600" />
                        Responsables ({responsables.length})
                      </h4>
                      
                      {responsables.length > 0 ? (
                        <div className="space-y-2">
                          {responsables.map((membre) => {
                            const responsabilite = membre.responsabilites.find(resp => resp.secteur.id === secteur.id)
                            return (
                              <div key={membre.id} className="flex items-center justify-between p-3 bg-white rounded-xl">
                                <div>
                                  <span className="font-medium text-gray-900">
                                    {membre.prenom} {membre.nom}
                                  </span>
                                  {responsabilite?.fonction && (
                                    <span className="ml-2 text-sm text-orange-600 font-medium">
                                      • {responsabilite.fonction}
                                    </span>
                                  )}
                                </div>
                                {membre.userId && (
                                  <UserCheck className="w-4 h-4 text-green-600" />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          Aucun responsable assigné
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}

              {secteurs.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-12 h-12 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun secteur configuré</h3>
                  <p className="text-gray-600">Les secteurs d'activités seront affichés ici une fois configurés</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

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
              © 2024 {initialParoisse.nom}. Site créé avec{' '}
              <a href="https://imamissio.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                ImaMissio
              </a>
            </p>
            <div className="flex justify-center space-x-6">
              <Link href={`/site/${initialParoisse.subdomain}`} className="text-gray-400 hover:text-white transition-colors">
                Accueil
              </Link>
              <Link href={`/site/${initialParoisse.subdomain}/actualites`} className="text-gray-400 hover:text-white transition-colors">
                Actualités
              </Link>
              <Link href={`/site/${initialParoisse.subdomain}/agenda`} className="text-gray-400 hover:text-white transition-colors">
                Agenda
              </Link>
              <Link href={`/site/${initialParoisse.subdomain}/don`} className="text-gray-400 hover:text-white transition-colors">
                Faire un don
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}