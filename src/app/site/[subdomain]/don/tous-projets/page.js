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