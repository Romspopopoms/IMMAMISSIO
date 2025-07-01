// src/app/site/[subdomain]/don/[theme]/page.js
import { notFound } from 'next/navigation'
import { prisma } from '../../../../../lib/prisma'
import ThemePageClient from './ThemePageClient'

export async function generateMetadata({ params }) {
  const { subdomain, theme } = await params
  
  const paroisse = await prisma.paroisse.findUnique({
    where: { subdomain }
  })

  if (!paroisse) {
    return {
      title: 'Paroisse non trouvée'
    }
  }

  // Formater le nom du thème pour l'affichage
  const themeName = theme.charAt(0).toUpperCase() + theme.slice(1).replace('-', ' ')

  return {
    title: `Dons ${themeName} - ${paroisse.nom}`,
    description: `Découvrez tous les projets de dons liés à ${themeName.toLowerCase()} de la paroisse ${paroisse.nom}`
  }
}

export default async function ThemePage({ params }) {
  const { subdomain, theme } = await params
  
  const paroisse = await prisma.paroisse.findUnique({
    where: { subdomain }
  })

  if (!paroisse) {
    notFound()
  }

  // Valider que le thème existe dans les thématiques de la paroisse
  const themes = paroisse.configSite?.donThemes || []
  const themeExists = themes.some(t => t.id === theme)
  
  // Si le thème n'existe pas dans la config mais est dans les thèmes par défaut, on l'accepte
  const defaultThemes = [
    'vie-paroissiale', 'charite', 'projets', 'pelerinage', 
    'missions', 'quete', 'denier'
  ]
  
  if (!themeExists && !defaultThemes.includes(theme)) {
    notFound()
  }

  // Charger les projets pour cette thématique depuis la base de données
  let projets = []
  
  try {
    // Charger les projets depuis la table Projet
    projets = await prisma.projet.findMany({
      where: {
        paroisseId: paroisse.id,
        theme: theme,
        actif: true
      },
      orderBy: {
        ordre: 'asc'
      }
    })

    // Calculer le montant collecté pour chaque projet
    for (let i = 0; i < projets.length; i++) {
      const dons = await prisma.don.findMany({
        where: {
          projetId: projets[i].id,
          statut: 'complete'
        }
      })
      projets[i].collecte = dons.reduce((total, don) => total + don.montant, 0)
    }

  } catch (error) {
    console.error('Erreur lors du chargement des projets:', error)
    projets = []
  }

  return (
    <ThemePageClient 
      paroisse={paroisse} 
      theme={theme}
      projets={projets}
    />
  )
}