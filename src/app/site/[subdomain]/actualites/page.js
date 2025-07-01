// src/app/site/[subdomain]/actualites/page.js
import { notFound } from 'next/navigation'
import { prisma } from '../../../../lib/prisma'
import ActualitesListClient from './ActualitesListClient'

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
    title: `Actualités - ${paroisse.nom}`,
    description: `Découvrez toutes les actualités de la paroisse ${paroisse.nom}`
  }
}

export default async function ActualitesListPage({ params, searchParams }) {
  const { subdomain } = await params
  const resolvedSearchParams = await searchParams
  
  const page = parseInt(resolvedSearchParams.page || '1')
  const limit = 12
  const skip = (page - 1) * limit

  const [paroisse, actualites, totalActualites] = await Promise.all([
    // Paroisse
    prisma.paroisse.findUnique({
      where: { 
        subdomain,
        actif: true 
      }
    }),

    // Actualités avec pagination
    prisma.actualite.findMany({
      where: {
        paroisse: {
          subdomain,
          actif: true
        },
        publiee: true
      },
      include: {
        auteur: {
          select: {
            prenom: true,
            nom: true
          }
        }
      },
      orderBy: { datePubli: 'desc' },
      skip,
      take: limit
    }),

    // Compter le total pour la pagination
    prisma.actualite.count({
      where: {
        paroisse: {
          subdomain,
          actif: true
        },
        publiee: true
      }
    })
  ])

  if (!paroisse) {
    notFound()
  }

  const totalPages = Math.ceil(totalActualites / limit)

  return (
    <ActualitesListClient 
      paroisse={paroisse} 
      actualites={actualites}
      pagination={{
        page,
        totalPages,
        totalActualites
      }}
    />
  )
}