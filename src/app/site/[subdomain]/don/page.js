// src/app/site/[subdomain]/don/page.js
import { notFound } from 'next/navigation'
import { prisma } from '../../../../lib/prisma'
import DonPageClient from './DonPageClient'

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
    title: `Faire un don - ${paroisse.nom}`,
    description: `Soutenez les projets de la paroisse ${paroisse.nom} en faisant un don en ligne`
  }
}

export default async function DonPage({ params }) {
  const { subdomain } = await params
  
  const paroisse = await prisma.paroisse.findUnique({
    where: { subdomain }
  })

  if (!paroisse) {
    notFound()
  }

  // Charger les projets à la une depuis la table Projet
  let projetsALaUne = []
  
  try {
    const projets = await prisma.projet.findMany({
      where: {
        paroisseId: paroisse.id,
        actif: true,
        alaune: true // Projets marqués "à la une"
      },
      orderBy: {
        ordre: 'asc'
      },
      take: 6 // Limiter à 6 projets à la une
    })

    // Calculer le montant collecté pour chaque projet
    for (let i = 0; i < projets.length; i++) {
      const dons = await prisma.don.findMany({
        where: {
          projetId: projets[i].id,
          statut: 'complete'
        }
      })
      projets[i].collecte = dons.reduce((total, don) => total + don.montant, 0)
    }

    projetsALaUne = projets

  } catch (error) {
    console.error('Erreur lors du chargement des projets à la une:', error)
    projetsALaUne = []
  }

  return (
    <DonPageClient 
      paroisse={paroisse} 
      projetsALaUne={projetsALaUne}
    />
  )
}