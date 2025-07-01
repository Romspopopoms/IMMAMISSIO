// src/app/site/[subdomain]/page.js
import { notFound } from 'next/navigation'
import { prisma } from '../../../lib/prisma'
import ParishSiteClient from './ParishSiteClient'

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
    title: `${paroisse.nom} - Site paroissial`,
    description: `Site officiel de ${paroisse.nom}. Découvrez nos actualités, horaires des messes, événements et activités.`
  }
}

export default async function ParishSitePage({ params }) {
  const { subdomain } = await params
  
  const paroisse = await prisma.paroisse.findUnique({
    where: { subdomain },
    include: {
      actualites: {
        where: { publiee: true },
        orderBy: { datePubli: 'desc' },
        take: 4,
        include: {
          auteur: {
            select: { prenom: true, nom: true }
          }
        }
      },
      horaires: {
        where: { actif: true },
        orderBy: { jourSemaine: 'asc' }
      },
      sacrements: {
        where: { actif: true },
        orderBy: { createdAt: 'asc' }
      },
      evenements: {
        where: { 
          dateDebut: { gte: new Date() }
        },
        orderBy: { dateDebut: 'asc' },
        take: 4
      },
      sections: {
        where: { actif: true },
        orderBy: { ordre: 'asc' }
      }
    }
  })

  if (!paroisse || !paroisse.actif) {
    notFound()
  }

  return <ParishSiteClient paroisse={paroisse} />
}