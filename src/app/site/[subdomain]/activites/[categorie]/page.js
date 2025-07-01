// ============================================================================
// src/app/site/[subdomain]/activites/[categorie]/page.js - Page d'une catégorie
// ============================================================================
import { notFound } from 'next/navigation'
import { prisma } from '../../../../../lib/prisma'
import CategorieActivitesClient from './CategorieActivitesClient'

export async function generateMetadata({ params }) {
  const { subdomain, categorie } = await params
  
  const section = await prisma.section.findFirst({
    where: {
      nom: categorie,
      paroisse: { subdomain, actif: true },
      actif: true
    },
    include: {
      paroisse: {
        select: { nom: true }
      }
    }
  })

  if (!section) {
    return { title: 'Catégorie non trouvée' }
  }

  return {
    title: `${section.titre} - ${section.paroisse.nom}`,
    description: section.description || `Découvrez les activités ${section.titre} proposées par ${section.paroisse.nom}`,
    openGraph: {
      title: `${section.titre} - ${section.paroisse.nom}`,
      description: section.description,
      siteName: section.paroisse.nom
    }
  }
}

export default async function CategorieActivitesPage({ params, searchParams }) {
  const { subdomain, categorie } = await params
  const { edit } = await searchParams || {}
  
  const [paroisse, section] = await Promise.all([
    // Paroisse
    prisma.paroisse.findUnique({
      where: { 
        subdomain,
        actif: true 
      }
    }),

    // Section avec ses activités
    prisma.section.findFirst({
      where: {
        nom: categorie,
        paroisse: {
          subdomain,
          actif: true
        },
        actif: true
      },
      include: {
        activites: {
          where: { actif: true },
          orderBy: { ordre: 'asc' }
        }
      }
    })
  ])

  if (!paroisse || !section) {
    notFound()
  }

  return (
    <CategorieActivitesClient 
      paroisse={paroisse} 
      section={section}
      isEditMode={edit === 'true'}
    />
  )
}