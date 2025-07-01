// src/app/site/[subdomain]/paroisse/page.js
import { notFound } from 'next/navigation'
import { prisma } from '../../../../lib/prisma'
import ParoissePageClient from './ParoissePageClient'

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
    title: `La Paroisse - ${paroisse.nom}`,
    description: `Découvrez la paroisse ${paroisse.nom} et son histoire`
  }
}

export default async function ParoissePage({ params }) {
  const { subdomain } = await params
  
  const paroisse = await prisma.paroisse.findUnique({
    where: { subdomain },
    include: {
      pretres: true,
      sections: true,
      horaires: true,
      actualites: {
        orderBy: { datePubli: 'desc' },
        take: 5
      },
      evenements: {
        where: {
          dateDebut: {
            gte: new Date()
          }
        },
        orderBy: { dateDebut: 'asc' },
        take: 5
      },
      sacrements: true
    }
  })

  if (!paroisse) {
    notFound()
  }

  return <ParoissePageClient paroisse={paroisse} />
}