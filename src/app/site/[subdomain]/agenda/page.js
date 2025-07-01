// src/app/site/[subdomain]/agenda/page.js
import { notFound } from 'next/navigation'
import { prisma } from '../../../../lib/prisma'
import AgendaPageClient from './AgendaPageClient'

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
    title: `Agenda - ${paroisse.nom}`,
    description: `Découvrez tous les événements et célébrations de ${paroisse.nom}. Horaires des messes, événements spéciaux et activités paroissiales.`
  }
}

export default async function AgendaPage({ params, searchParams }) {
  const { subdomain } = await params
  const { edit } = await searchParams || {}
  
  const paroisse = await prisma.paroisse.findUnique({
    where: { subdomain },
    include: {
      horaires: {
        where: { actif: true },
        orderBy: { jourSemaine: 'asc' }
      },
      evenements: {
        where: { 
          dateDebut: { gte: new Date() }
        },
        orderBy: { dateDebut: 'asc' },
        take: 20
      }
    }
  })

  if (!paroisse || !paroisse.actif) {
    notFound()
  }

  return <AgendaPageClient paroisse={paroisse} isEditMode={edit === 'true'} />
}