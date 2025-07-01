// ============================================================================
// src/app/site/[subdomain]/evenements/[id]/page.js - Page publique détail événement
// ============================================================================
import { notFound } from 'next/navigation'
import { prisma } from '../../../../../lib/prisma'
import EvenementDetailClient from './EvenementDetailClient'

export async function generateMetadata({ params }) {
  const { subdomain, id } = await params
  
  const evenement = await prisma.evenement.findFirst({
    where: {
      id,
      paroisse: {
        subdomain,
        actif: true
      }
    },
    include: {
      paroisse: {
        select: {
          nom: true
        }
      }
    }
  })

  if (!evenement) {
    return {
      title: 'Événement non trouvé'
    }
  }

  return {
    title: `${evenement.titre} - ${evenement.paroisse.nom}`,
    description: evenement.description?.substring(0, 160) || `Découvrez les détails de l'événement ${evenement.titre} organisé par ${evenement.paroisse.nom}`,
    openGraph: {
      title: evenement.titre,
      description: evenement.description?.substring(0, 160)
      // Suppression complète du type pour éviter l'erreur
    }
  }
}

export default async function EvenementDetailPage({ params, searchParams }) {
  const { subdomain, id } = await params
  const { edit } = await searchParams || {}
  
  const [paroisse, evenement] = await Promise.all([
    // Paroisse
    prisma.paroisse.findUnique({
      where: { 
        subdomain,
        actif: true 
      }
    }),

    // Événement avec détails
    prisma.evenement.findFirst({
      where: {
        id,
        paroisse: {
          subdomain,
          actif: true
        }
      }
    })
  ])

  if (!paroisse || !evenement) {
    notFound()
  }

  return (
    <EvenementDetailClient 
      paroisse={paroisse} 
      evenement={evenement}
      isEditMode={edit === 'true'}
    />
  )
}