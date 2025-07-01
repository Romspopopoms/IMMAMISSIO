// ============================================================================
// src/app/api/actualites/route.js - API mise à jour avec cookies
// ============================================================================
import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getServerAuth } from '../../../lib/auth'

// GET - Récupérer toutes les actualités de la paroisse
export async function GET(request) {
  try {
    const user = await getServerAuth()
    
    if (!user || !user.paroisseId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const status = searchParams.get('status') // 'published', 'draft', 'all'
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Construire les conditions de filtrage
    let whereConditions = {
      paroisseId: user.paroisseId
    }

    if (status === 'published') {
      whereConditions.publiee = true
    } else if (status === 'draft') {
      whereConditions.publiee = false
    }

    if (search) {
      whereConditions.OR = [
        { titre: { contains: search, mode: 'insensitive' } },
        { contenu: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [actualites, total] = await Promise.all([
      prisma.actualite.findMany({
        where: whereConditions,
        include: {
          auteur: {
            select: {
              id: true,
              prenom: true,
              nom: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.actualite.count({
        where: whereConditions
      })
    ])

    // Sérialiser les actualités
    const actualitesSerializes = actualites.map(actualite => ({
      ...actualite,
      id: String(actualite.id),
      paroisseId: String(actualite.paroisseId),
      auteurId: String(actualite.auteurId),
      publiee: Boolean(actualite.publiee),
      datePubli: actualite.datePubli ? actualite.datePubli.toISOString() : null,
      createdAt: actualite.createdAt.toISOString(),
      updatedAt: actualite.updatedAt.toISOString(),
      auteur: actualite.auteur ? {
        ...actualite.auteur,
        id: String(actualite.auteur.id)
      } : null
    }))

    return NextResponse.json({
      actualites: actualitesSerializes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(total),
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des actualités:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle actualité
export async function POST(request) {
  try {
    const user = await getServerAuth()
    
    if (!user || !user.paroisseId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Vérifier les permissions d'écriture
    if (!['CURE', 'PAROISSE_ADMIN', 'PRETRE'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes pour créer une actualité' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { titre, contenu, image, publiee = false, datePubli } = body

    // Validation des données
    if (!titre || !contenu) {
      return NextResponse.json(
        { error: 'Le titre et le contenu sont obligatoires' },
        { status: 400 }
      )
    }

    // Validation du titre
    if (titre.length < 3 || titre.length > 200) {
      return NextResponse.json(
        { error: 'Le titre doit contenir entre 3 et 200 caractères' },
        { status: 400 }
      )
    }

    // Validation du contenu
    if (contenu.length < 10) {
      return NextResponse.json(
        { error: 'Le contenu doit contenir au moins 10 caractères' },
        { status: 400 }
      )
    }

    console.log('Creating actualite with user:', { 
      userId: user.id, 
      paroisseId: user.paroisseId,
      role: user.role 
    })

    // Créer l'actualité avec les relations connectées
    const actualite = await prisma.actualite.create({
      data: {
        titre: titre.trim(),
        contenu: contenu.trim(),
        image: image ? image.trim() : null,
        publiee: Boolean(publiee),
        datePubli: publiee ? (datePubli ? new Date(datePubli) : new Date()) : null,
        // Utiliser connect pour les relations
        paroisse: {
          connect: { id: user.paroisseId }
        },
        auteur: {
          connect: { id: user.id }
        }
      },
      include: {
        auteur: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            email: true
          }
        },
        paroisse: {
          select: {
            id: true,
            nom: true,
            subdomain: true
          }
        }
      }
    })

    // Sérialiser l'actualité créée
    const actualiteSerialise = {
      ...actualite,
      id: String(actualite.id),
      paroisseId: String(actualite.paroisseId),
      auteurId: String(actualite.auteurId),
      publiee: Boolean(actualite.publiee),
      datePubli: actualite.datePubli ? actualite.datePubli.toISOString() : null,
      createdAt: actualite.createdAt.toISOString(),
      updatedAt: actualite.updatedAt.toISOString(),
      auteur: {
        ...actualite.auteur,
        id: String(actualite.auteur.id)
      },
      paroisse: {
        ...actualite.paroisse,
        id: String(actualite.paroisse.id)
      }
    }

    return NextResponse.json({
      message: 'Actualité créée avec succès',
      actualite: actualiteSerialise
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création de l\'actualité:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour toutes les actualités (non utilisé, mais disponible)
export async function PUT(request) {
  return NextResponse.json(
    { error: 'Méthode non autorisée. Utilisez PATCH pour modifier une actualité spécifique.' },
    { status: 405 }
  )
}

// DELETE - Supprimer toutes les actualités (non utilisé, mais disponible)
export async function DELETE(request) {
  return NextResponse.json(
    { error: 'Méthode non autorisée. Utilisez DELETE sur une actualité spécifique.' },
    { status: 405 }
  )
}