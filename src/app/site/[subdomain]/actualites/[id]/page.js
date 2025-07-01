// src/app/site/[subdomain]/actualites/[id]/page.js
import { notFound } from 'next/navigation'
import { prisma } from '../../../../../lib/prisma'
import ActualiteDetailClient from './ActualiteDetailClient'

export async function generateMetadata({ params }) {
  const { subdomain, id } = await params
  
  const actualite = await prisma.actualite.findFirst({
    where: {
      id: id, // Enlever parseInt car id est un String (cuid)
      publiee: true,
      paroisse: {
        subdomain,
        actif: true
      }
    },
    include: {
      paroisse: {
        select: { nom: true }
      }
    }
  })

  if (!actualite) {
    return {
      title: 'Actualité non trouvée'
    }
  }

  return {
    title: `${actualite.titre} - ${actualite.paroisse.nom}`,
    description: actualite.contenu.substring(0, 160) + '...',
    openGraph: {
      title: actualite.titre,
      description: actualite.contenu.substring(0, 160) + '...',
      images: actualite.image ? [actualite.image] : [],
    }
  }
}

export default async function ActualiteDetailPage({ params }) {
  const { subdomain, id } = await params
  
  const [actualite, paroisse] = await Promise.all([
    // Actualité avec auteur
    prisma.actualite.findFirst({
      where: {
        id: id, // Enlever parseInt car id est un String (cuid)
        publiee: true,
        paroisse: {
          subdomain,
          actif: true
        }
      },
      include: {
        auteur: {
          select: {
            prenom: true,
            nom: true
          }
        }
      }
    }),

    // Paroisse avec actualités récentes pour la sidebar
    prisma.paroisse.findFirst({
      where: {
        subdomain,
        actif: true
      },
      include: {
        actualites: {
          where: {
            publiee: true,
            id: { not: id } // Enlever parseInt car id est un String (cuid)
          },
          orderBy: { datePubli: 'desc' },
          take: 5,
          select: {
            id: true,
            titre: true,
            image: true,
            datePubli: true
          }
        }
      }
    })
  ])

  if (!actualite || !paroisse) {
    notFound()
  }

  return <ActualiteDetailClient actualite={actualite} paroisse={paroisse} />
}