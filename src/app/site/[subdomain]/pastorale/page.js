// src/app/site/[subdomain]/pastorale/page.js
import { notFound } from 'next/navigation'
import { prisma } from '../../../../lib/prisma'
import PastoralePageClient from './PastoralePageClient'

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
    title: `Équipe Pastorale - ${paroisse.nom}`,
    description: `Découvrez l'équipe pastorale de la paroisse ${paroisse.nom}`
  }
}

export default async function PastoralePage({ params }) {
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

  return <PastoralePageClient paroisse={paroisse} />
}