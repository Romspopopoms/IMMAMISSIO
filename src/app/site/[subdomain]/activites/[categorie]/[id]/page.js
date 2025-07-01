// ============================================================================
// src/app/site/[subdomain]/activites/[categorie]/[id]/page.js - Page détail activité
// ============================================================================
import { notFound } from 'next/navigation'
import { prisma } from '../../../../../../lib/prisma'
import ActiviteDetailClient from './ActiviteDetailClient'

export async function generateMetadata({ params }) {
  const { subdomain, categorie, id } = await params
  
  const activite = await prisma.activite.findFirst({
    where: {
      id,
      section: { nom: categorie },
      paroisse: { subdomain, actif: true },
      actif: true
    },
    include: {
      section: true,
      paroisse: {
        select: { nom: true }
      }
    }
  })

  if (!activite) {
    return { title: 'Activité non trouvée' }
  }

  return {
    title: `${activite.titre} - ${activite.paroisse.nom}`,
    description: activite.description?.substring(0, 160) || `Découvrez l'activité ${activite.titre} proposée par ${activite.paroisse.nom}`,
    openGraph: {
      title: activite.titre,
      description: activite.description?.substring(0, 160),
      siteName: activite.paroisse.nom
    }
  }
}

export default async function ActiviteDetailPage({ params, searchParams }) {
  const { subdomain, categorie, id } = await params
  const { edit } = await searchParams || {}
  
  const [paroisse, activite] = await Promise.all([
    // Paroisse
    prisma.paroisse.findUnique({
      where: { 
        subdomain,
        actif: true 
      }
    }),

    // Activité avec détails
    prisma.activite.findFirst({
      where: {
        id,
        section: { nom: categorie },
        paroisse: {
          subdomain,
          actif: true
        },
        actif: true
      },
      include: {
        section: true
      }
    })
  ])

  if (!paroisse || !activite) {
    notFound()
  }

  // Activités similaires dans la même catégorie
  const activitesSimilaires = await prisma.activite.findMany({
    where: {
      sectionId: activite.sectionId,
      id: { not: activite.id },
      actif: true
    },
    take: 3,
    orderBy: { ordre: 'asc' }
  })

  return (
    <ActiviteDetailClient 
      paroisse={paroisse} 
      activite={activite}
      activitesSimilaires={activitesSimilaires}
      isEditMode={edit === 'true'}
    />
  )
}