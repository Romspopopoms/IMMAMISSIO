// src/app/site/[subdomain]/don/tous-projets/page.js
import { notFound } from 'next/navigation'
import { prisma } from '../../../../../lib/prisma'
import TousProjetsPageClient from './TousProjetsPageClient'

export async function generateMetadata({ params }) {
  const { subdomain } = await params
  
  const paroisse = await prisma.paroisse.findUnique({
    where: { subdomain }
  })

  if (!paroisse) {
    return {
      title: 'Paroisse non trouvée'
    }
  }

  return {
    title: `Tous les projets de dons - ${paroisse.nom}`,
    description: `Découvrez l'ensemble des projets de dons de la paroisse ${paroisse.nom} et choisissez celui qui vous tient le plus à cœur.`
  }
}

// ✅ Fonction pour collecter tous les projets avec leurs dons
async function getAllProjectsWithDons(paroisse) {
  const allProjects = []
  
  // 1. Chercher les projets en base de données d'abord
  try {
    const projetsDB = await prisma.projet.findMany({
      where: {
        paroisseId: paroisse.id,
        actif: true
      }
    })

    // Calculer les dons pour chaque projet DB
    for (const projet of projetsDB) {
      const dons = await prisma.don.findMany({
        where: {
          projetId: projet.id,
          statut: 'complete'
        }
      })
      const collecte = dons.reduce((total, don) => total + don.montant, 0)
      
      allProjects.push({
        ...projet,
        collecte,
        source: 'database',
        themeName: 'Base de données'
      })
    }
  } catch (error) {
    console.error('Erreur chargement projets DB:', error)
  }

  // 2. Ajouter les projets de la configuration (si pas déjà en DB)
  if (paroisse.configSite) {
    // Projets à la une
    const projetsUne = paroisse.configSite.projetsDonsUne || []
    for (const projet of projetsUne) {
      // Vérifier qu'il n'existe pas déjà en DB
      const exists = allProjects.find(p => p.id === projet.id)
      if (!exists) {
        try {
          const dons = await prisma.don.findMany({
            where: {
              projetId: projet.id,
              statut: 'complete'
            }
          })
          const collecte = dons.reduce((total, don) => total + don.montant, 0)
          
          allProjects.push({
            ...projet,
            collecte,
            source: 'une',
            themeName: 'À la une'
          })
        } catch (error) {
          console.error(`Erreur chargement dons projet ${projet.id}:`, error)
          allProjects.push({
            ...projet,
            collecte: projet.collecte || 0,
            source: 'une',
            themeName: 'À la une'
          })
        }
      }
    }

    // Projets thématiques
    const themes = [
      { id: 'vieparoissiale', label: 'Vie paroissiale' },
      { id: 'charite', label: 'Charité' },
      { id: 'projets', label: 'Projets' },
      { id: 'pelerinage', label: 'Pèlerinage' },
      { id: 'missions', label: 'Missions' },
      { id: 'quete', label: 'Quête' },
      { id: 'denier', label: 'Denier' }
    ]

    for (const theme of themes) {
      const fieldName = `projets${theme.id.charAt(0).toUpperCase() + theme.id.slice(1)}`
      const projetsTheme = paroisse.configSite[fieldName] || []
      
      for (const projet of projetsTheme) {
        // Vérifier qu'il n'existe pas déjà
        const exists = allProjects.find(p => p.id === projet.id)
        if (!exists) {
          try {
            const dons = await prisma.don.findMany({
              where: {
                projetId: projet.id,
                statut: 'complete'
              }
            })
            const collecte = dons.reduce((total, don) => total + don.montant, 0)
            
            allProjects.push({
              ...projet,
              collecte,
              source: theme.id,
              themeName: theme.label
            })
          } catch (error) {
            console.error(`Erreur chargement dons projet ${projet.id}:`, error)
            allProjects.push({
              ...projet,
              collecte: projet.collecte || 0,
              source: theme.id,
              themeName: theme.label
            })
          }
        }
      }
    }
  }

  return allProjects
}

export default async function TousProjetsPage({ params }) {
  const { subdomain } = await params
  
  const paroisse = await prisma.paroisse.findUnique({
    where: { subdomain }
  })

  if (!paroisse) {
    notFound()
  }

  // ✅ Charger tous les projets avec leurs dons côté serveur
  const allProjects = await getAllProjectsWithDons(paroisse)

  return <TousProjetsPageClient paroisse={paroisse} projets={allProjects} />
}

// ====================================================================
// CLIENT COMPONENT - Version simplifiée
// ====================================================================

// src/app/site/[subdomain]/don/tous-projets/TousProjetsPageClient.js
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Upload, Plus, Trash2, Edit3, Euro, Heart, Church, Target, Eye, ArrowLeft, CheckCircle, Clock, Filter, Search, Grid, List } from 'lucide-react'
import { useEditable } from '../../../../../hooks/useEditable'
import { EditableText } from '../../../../../components/Editable'
import EditBar from '../../../../../components/EditBar'
import ModalAddProject from '../../../../../components/ModalAddProject'
import ModalContribuer from '../../../../../components/ModalContribuer'

export default function TousProjetsPageClient({ paroisse: initialParoisse, projets: initialProjets = [] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showContribuerModal, setShowContribuerModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [editingProject, setEditingProject] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, active, completed
  const [viewMode, setViewMode] = useState('grid') // grid, list
  
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
  
  // ✅ Utiliser directement les projets du serveur
  const allProjects = initialProjets

  // ✅ Fonctions simplifiées utilisant projet.collecte
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

  // ✅ Calculs basés sur les données serveur
  const totalCollecte = allProjects.reduce((acc, projet) => acc + getCollecte(projet), 0)
  const projetsCompletes = allProjects.filter(p => getCollecte(p) >= p.objectif).length

  // Filtrer et rechercher les projets
  const filteredProjects = allProjects.filter(projet => {
    // Filtre de recherche
    const matchesSearch = projet.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         projet.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filtre de statut
    const collecte = getCollecte(projet)
    const isCompleted = collecte >= projet.objectif
    
    let matchesStatus = true
    if (filterStatus === 'active') {
      matchesStatus = !isCompleted
    } else if (filterStatus === 'completed') {
      matchesStatus = isCompleted
    }
    
    return matchesSearch && matchesStatus
  })

  // Gestion des projets (pour le mode édition)
  const addProject = (projectData) => {
    const newProject = {
      ...projectData,
      id: Date.now().toString(),
      collecte: 0
    }
    const updatedProjects = getValue('projetsDonsUne', [])
    updatedProjects.push(newProject)
    updateField('projetsDonsUne', updatedProjects)
  }

  const updateProject = (projectId, projectData) => {
    // Trouver dans quelle source se trouve le projet
    const project = allProjects.find(p => p.id === projectId)
    if (!project) return
    
    if (project.source === 'une') {
      const projects = getValue('projetsDonsUne', [])
      const updatedProjects = projects.map(p => 
        p.id === projectId ? { ...p, ...projectData } : p
      )
      updateField('projetsDonsUne', updatedProjects)
    } else if (project.source !== 'database') {
      const fieldName = `projets${project.source.charAt(0).toUpperCase() + project.source.slice(1).replace('-', '')}`
      const projects = getValue(fieldName, [])
      const updatedProjects = projects.map(p => 
        p.id === projectId ? { ...p, ...projectData } : p
      )
      updateField(fieldName, updatedProjects)
    }
    // Note: Les projets en base de données nécessitent une API séparée
  }

  const deleteProject = (projectId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      const project = allProjects.find(p => p.id === projectId)
      if (!project) return
      
      if (project.source === 'une') {
        const projects = getValue('projetsDonsUne', [])
        const updatedProjects = projects.filter(p => p.id !== projectId)
        updateField('projetsDonsUne', updatedProjects)
      } else if (project.source !== 'database') {
        const fieldName = `projets${project.source.charAt(0).toUpperCase() + project.source.slice(1).replace('-', '')}`
        const projects = getValue(fieldName, [])
        const updatedProjects = projects.filter(p => p.id !== projectId)
        updateField(fieldName, updatedProjects)
      }
      // Note: Les projets en base de données nécessitent une API séparée
    }
  }

  const getSourceBadge = (project) => {
    if (project.source === 'une') {
      return { label: 'À la une', color: 'bg-yellow-100 text-yellow-800' }
    }
    if (project.source === 'database') {
      return { label: 'Base de données', color: 'bg-green-100 text-green-800' }
    }
    return { label: project.themeName || project.source, color: 'bg-blue-100 text-blue-800' }
  }

  // Fonction pour obtenir l'icône
  const getIconComponent = (iconName) => {
    const icons = {
      Church, Heart, Target, Euro, CheckCircle, Clock
    }
    return icons[iconName] || Target
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
      <section className="relative h-[400px] mt-16 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transform scale-105"
          style={{ 
            backgroundImage: `url('${getValue('tousProjetsDonHeroImage', 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1920&h=1080&fit=crop')}')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-blue-900/70 to-green-900/80" />
        
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
                      updateField('tousProjetsDonHeroImage', reader.result)
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
                  <Target className="w-4 h-4 mr-2" />
                  Tous nos projets
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
                <EditableText
                  value={getValue('tousProjetsDonTitle', 'Tous les projets')}
                  onChange={(value) => updateField('tousProjetsDonTitle', value)}
                  isEditMode={isEditMode}
                  className="text-5xl md:text-6xl font-black text-white"
                />
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                <EditableText
                  value={getValue('tousProjetsDonSubtitle', 'Découvrez l\'ensemble de nos projets et choisissez celui qui vous tient le plus à cœur pour faire la différence.')}
                  onChange={(value) => updateField('tousProjetsDonSubtitle', value)}
                  isEditMode={isEditMode}
                  className="text-xl md:text-2xl text-white/90"
                  multiline={true}
                />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques globales */}
      <section className="py-8 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{allProjects.length}</div>
              <div className="text-sm text-gray-600">Projets totaux</div>
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
            
            <div className="group">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {allProjects.filter(p => getCollecte(p) < p.objectif).length}
              </div>
              <div className="text-sm text-gray-600">En cours</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filtres et recherche */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
            
            {/* Recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un projet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Filtres */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                >
                  <option value="all">Tous les projets</option>
                  <option value="active">En cours</option>
                  <option value="completed">Objectifs atteints</option>
                </select>
              </div>

              {/* Boutons de vue */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Bouton ajouter en mode édition */}
              {isEditMode && (
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nouveau projet
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Liste des projets */}
      <section className="py-12 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Résultats de recherche */}
          <div className="mb-8">
            <p className="text-gray-600">
              {filteredProjects.length} projet{filteredProjects.length !== 1 ? 's' : ''} 
              {searchTerm && ` trouvé${filteredProjects.length !== 1 ? 's' : ''} pour "${searchTerm}"`}
              {filterStatus !== 'all' && ` (${filterStatus === 'active' ? 'en cours' : 'objectifs atteints'})`}
            </p>
          </div>

          {filteredProjects.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}>
              {filteredProjects.map((projet) => {
                const sourceBadge = getSourceBadge(projet)
                
                return (
                  <div key={projet.id} className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden relative">
                    {/* Actions en mode édition */}
                    {isEditMode && projet.source !== 'database' && (
                      <div className="absolute top-2 right-2 z-10 flex flex-col space-y-2">
                        <button
                          onClick={() => {
                            setEditingProject(projet)
                            setShowProjectModal(true)
                          }}
                          className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg hover:bg-white transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteProject(projet.id)}
                          className="bg-red-600/90 backdrop-blur-sm text-white p-2 rounded-lg shadow-lg hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Image */}
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={projet.image} 
                        alt={projet.titre}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      
                      {/* Badge source */}
                      <div className="absolute top-2 left-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${sourceBadge.color}`}>
                          {sourceBadge.label}
                        </span>
                      </div>
                      
                      {/* Badge statut */}
                      <div className="absolute bottom-2 right-2">
                        {getCollecte(projet) >= projet.objectif ? (
                          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Atteint !
                          </span>
                        ) : (
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                            {getPercentage(projet)}%
                          </span>
                        )}
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

                      {/* Barre de progression */}
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
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <Search className="w-16 h-16 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {searchTerm ? 'Aucun projet trouvé' : 'Aucun projet disponible'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm 
                  ? `Aucun projet ne correspond à votre recherche "${searchTerm}".`
                  : 'Aucun projet de don n\'est actuellement disponible.'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Modal pour ajouter/éditer un projet */}
      <ModalAddProject
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false)
          setEditingProject(null)
        }}
        onAdd={editingProject ? (data) => updateProject(editingProject.id, data) : addProject}
        editingProject={editingProject}
      />

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
          // ✅ Recharger la page pour voir les nouvelles données
          window.location.reload()
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