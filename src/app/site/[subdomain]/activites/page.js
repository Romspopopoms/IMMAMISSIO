// ============================================================================
// src/app/site/[subdomain]/activites/page.js - Page principale des activités
// ============================================================================
import { notFound } from 'next/navigation'
import { prisma } from '../../../../lib/prisma'
import ActivitesPageClient from './ActivitesPageClient'

export async function generateMetadata({ params }) {
  const { subdomain } = await params
  
  const paroisse = await prisma.paroisse.findUnique({
    where: { subdomain, actif: true },
    select: { nom: true }
  })

  if (!paroisse) {
    return { title: 'Paroisse non trouvée' }
  }

  return {
    title: `Les Activités - ${paroisse.nom}`,
    description: `Découvrez toutes les activités proposées par ${paroisse.nom} : jeunesse, catéchèse, musique, solidarité et bien plus encore.`,
    openGraph: {
      title: `Les Activités - ${paroisse.nom}`,
      description: `Découvrez toutes les activités proposées par ${paroisse.nom}`,
      siteName: paroisse.nom
    }
  }
}

export default async function ActivitesPage({ params, searchParams }) {
  const { subdomain } = await params
  const { edit } = await searchParams || {}
  
  const [paroisse, sections] = await Promise.all([
    // Paroisse
    prisma.paroisse.findUnique({
      where: { 
        subdomain,
        actif: true 
      }
    }),

    // Sections avec leurs activités
    prisma.section.findMany({
      where: {
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
      },
      orderBy: { ordre: 'asc' }
    })
  ])

  if (!paroisse) {
    notFound()
  }

  return (
    <ActivitesPageClient 
      paroisse={paroisse} 
      sections={sections}
      isEditMode={edit === 'true'}
    />
  )
}