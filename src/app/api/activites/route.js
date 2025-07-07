// ============================================================================
// src/app/api/activites/route.js - API CRUD pour les activités
// ============================================================================
import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getServerAuth } from '../../../lib/auth'

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
    // Utiliser getServerAuth au lieu de NextAuth
    const user = await getServerAuth()
    
    if (!user) {
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

// PUT - Mettre à jour une activité
export async function PUT(request) {
  try {
    const user = await getServerAuth()
    
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const data = await request.json()
    const { id, ...updateData } = data

    if (!id) {
      return NextResponse.json({ error: 'ID de l\'activité requis' }, { status: 400 })
    }

    // Vérifier que l'activité existe et appartient à la paroisse de l'utilisateur
    const existingActivite = await prisma.activite.findUnique({
      where: { id },
      select: { paroisseId: true }
    })

    if (!existingActivite) {
      return NextResponse.json({ error: 'Activité non trouvée' }, { status: 404 })
    }

    if (existingActivite.paroisseId !== user.paroisseId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Mettre à jour l'activité
    const activite = await prisma.activite.update({
      where: { id },
      data: {
        ...updateData,
        ageMin: updateData.ageMin ? parseInt(updateData.ageMin) : null,
        ageMax: updateData.ageMax ? parseInt(updateData.ageMax) : null,
        ordre: updateData.ordre ? parseInt(updateData.ordre) : undefined
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

    return NextResponse.json(activite)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'activité:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'activité' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une activité (soft delete)
export async function DELETE(request) {
  try {
    const user = await getServerAuth()
    
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID de l\'activité requis' }, { status: 400 })
    }

    // Vérifier que l'activité existe et appartient à la paroisse de l'utilisateur
    const existingActivite = await prisma.activite.findUnique({
      where: { id },
      select: { paroisseId: true }
    })

    if (!existingActivite) {
      return NextResponse.json({ error: 'Activité non trouvée' }, { status: 404 })
    }

    if (existingActivite.paroisseId !== user.paroisseId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Soft delete : marquer comme inactive
    await prisma.activite.update({
      where: { id },
      data: { actif: false }
    })

    return NextResponse.json({ success: true, message: 'Activité supprimée' })
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'activité:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'activité' },
      { status: 500 }
    )
  }
}