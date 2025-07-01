// ============================================================================
// src/app/api/activites/route.js - API CRUD pour les activités
// ============================================================================
import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

// GET - Récupérer toutes les activités d'une paroisse ou d'une section
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const paroisseId = searchParams.get('paroisseId')
    const sectionId = searchParams.get('sectionId')
    const subdomain = searchParams.get('subdomain')

    let whereClause = {}

    if (paroisseId) {
      whereClause.paroisseId = paroisseId
    } else if (subdomain) {
      whereClause.paroisse = { subdomain }
    }

    if (sectionId) {
      whereClause.sectionId = sectionId
    }

    const activites = await prisma.activite.findMany({
      where: {
        ...whereClause,
        actif: true
      },
      include: {
        section: true,
        paroisse: {
          select: {
            nom: true,
            subdomain: true
          }
        }
      },
      orderBy: [
        { ordre: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(activites)
  } catch (error) {
    console.error('Erreur lors de la récupération des activités:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des activités' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle activité
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const data = await request.json()
    const {
      titre,
      description,
      image,
      horaires,
      lieu,
      ageMin,
      ageMax,
      contact,
      responsable,
      infosComplementaires,
      sectionId,
      paroisseId,
      ordre = 0
    } = data

    // Vérifier que l'utilisateur a les droits sur cette paroisse
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { paroisse: true }
    })

    if (!user || user.paroisseId !== paroisseId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const activite = await prisma.activite.create({
      data: {
        titre,
        description,
        image,
        horaires,
        lieu,
        ageMin: ageMin ? parseInt(ageMin) : null,
        ageMax: ageMax ? parseInt(ageMax) : null,
        contact,
        responsable,
        infosComplementaires,
        sectionId,
        paroisseId,
        ordre: parseInt(ordre)
      },
      include: {
        section: true,
        paroisse: {
          select: {
            nom: true,
            subdomain: true
          }
        }
      }
    })

    return NextResponse.json(activite, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de l\'activité:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'activité' },
      { status: 500 }
    )
  }
}
