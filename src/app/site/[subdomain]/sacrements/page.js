// src/app/site/[subdomain]/sacrements/page.js
import { notFound } from 'next/navigation'
import { prisma } from '../../../../lib/prisma'
import SacrementsPageClient from './SacrementsPageClient'

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
    title: `Les Sacrements - ${paroisse.nom}`,
    description: `Découvrez les sept sacrements proposés par la paroisse ${paroisse.nom}`
  }
}

export default async function SacrementsPage({ params }) {
  const { subdomain } = await params
  
  const paroisse = await prisma.paroisse.findUnique({
    where: { subdomain },
    include: {
      sacrements: {
        where: { actif: true },
        orderBy: { createdAt: 'asc' }
      },
      pretres: {
        where: { actif: true },
        orderBy: { ordre: 'asc' }
      }
    }
  })

  if (!paroisse) {
    notFound()
  }

  return <SacrementsPageClient paroisse={paroisse} />
}