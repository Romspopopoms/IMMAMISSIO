// src/app/site/[subdomain]/don/projet/[id]/page.js
import { notFound } from 'next/navigation'
import { prisma } from '../../../../../../lib/prisma'
import ProjetPageClient from './ProjetPageClient'

export async function generateMetadata({ params }) {
  const { subdomain, id } = await params
  
  const paroisse = await prisma.paroisse.findUnique({
    where: { subdomain }
  })

  if (!paroisse) {
    return {
      title: 'Paroisse non trouvé'
    }
  }

  // Chercher le projet avec la fonction unifiée
  const projet = await findProjet(id, paroisse)

  if (!projet) {
    return {
      title: 'Projet non trouvé'
    }
  }

  return {
    title: `${projet.titre} - ${paroisse.nom}`,
    description: projet.description || `Soutenez le projet "${projet.titre}" de la paroisse ${paroisse.nom}`
  }
}

// Fonction unifiée pour chercher un projet (DB puis configuration)
async function findProjet(id, paroisse) {
  try {
    // 1. Chercher d'abord dans la table Projet (base de données)
    const projetDB = await prisma.projet.findFirst({
      where: {
        id: id,
        paroisseId: paroisse.id,
        actif: true
      }
    })

    if (projetDB) {
      // Calculer le montant collecté depuis les dons
      const dons = await prisma.don.findMany({
        where: {
          projetId: id,
          statut: 'complete'
        }
      })
      projetDB.collecte = dons.reduce((total, don) => total + don.montant, 0)
      return projetDB
    }

    // 2. Si pas trouvé en DB, chercher dans la configuration du site
    if (paroisse.configSite) {
      let projet = null

      // Chercher dans les projets à la une
      const projetsUne = paroisse.configSite.projetsDonsUne || []
      projet = projetsUne.find(p => p.id === id)
      
      // Si pas trouvé, chercher dans les projets thématiques
      if (!projet) {
        const themes = [
          'vieparoissiale', 'charite', 'projets', 'pelerinage', 
          'missions', 'quete', 'denier'
        ]
        
        for (const theme of themes) {
          const fieldName = `projets${theme.charAt(0).toUpperCase() + theme.slice(1)}`
          const projetsTheme = paroisse.configSite[fieldName] || []
          const found = projetsTheme.find(p => p.id === id)
          if (found) {
            projet = found
            break
          }
        }
      }

      // Si trouvé dans la config, récupérer les dons réels
      if (projet) {
        try {
          const dons = await prisma.don.findMany({
            where: {
              projetId: id,
              statut: 'complete'
            }
          })
          projet.collecte = dons.reduce((total, don) => total + don.montant, 0)
        } catch (error) {
          console.error('Erreur chargement dons:', error)
          projet.collecte = projet.collecte || 0
        }
        return projet
      }
    }

    return null
  } catch (error) {
    console.error('Erreur recherche projet:', error)
    return null
  }
}

export default async function ProjetPage({ params }) {
  const { subdomain, id } = await params
  
  const paroisse = await prisma.paroisse.findUnique({
    where: { subdomain }
  })

  if (!paroisse) {
    notFound()
  }

  // Chercher le projet avec la fonction unifiée
  const projet = await findProjet(id, paroisse)

  if (!projet) {
    notFound()
  }

  // Récupérer les dons pour ce projet
  let dons = []
  try {
    dons = await prisma.don.findMany({
      where: {
        projetId: id,
        statut: 'complete'
      },
      include: {
        donateur: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  } catch (error) {
    console.error('Erreur chargement dons:', error)
    dons = []
  }

  return <ProjetPageClient paroisse={paroisse} projet={projet} dons={dons} />
}