// src/app/api/paroisse/[subdomain]/route.js
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(request, { params }) {
  try {
    // Dans Next.js 15, il faut awaiter params
    const { subdomain } = await params

    const paroisse = await prisma.paroisse.findUnique({
      where: { 
        subdomain,
        actif: true 
      },
      include: {
        pretres: {
          where: { actif: true },
          orderBy: { ordre: 'asc' }
        },
        actualites: {
          where: { publiee: true },
          orderBy: { datePubli: 'desc' },
          take: 10,
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
          take: 10
        },
        sections: {
          where: { actif: true },
          orderBy: { ordre: 'asc' }
        }
      }
    })

    if (!paroisse) {
      return NextResponse.json(
        { error: 'Paroisse non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(paroisse)

  } catch (error) {
    console.error('Erreur lors de la récupération de la paroisse:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}