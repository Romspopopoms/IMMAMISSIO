// ============================================================================
// src/app/api/conseils/route.js - Version corrigée
// ============================================================================
import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getServerAuth, hasPermission } from '../../../lib/auth'

// GET - Récupérer tous les conseils de la paroisse
export async function GET(request) {
  try {
    // ✅ Utiliser le nouveau système d'auth
    const user = await getServerAuth()
    
    if (!user || !user.paroisseId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // ✅ Vérifier les permissions
    if (!hasPermission(user, 'pastorale', 'read')) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    const conseils = await prisma.conseil.findMany({
      where: {
        paroisseId: user.paroisseId,
        actif: true
      },
      include: {
        membres: {
          include: {
            membre: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    role: true
                  }
                }
              }
            }
          },
          orderBy: [
            { createdAt: 'asc' }
          ]
        }
      },
      orderBy: [
        { ordre: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    return NextResponse.json({ conseils })

  } catch (error) {
    console.error('Erreur lors de la récupération des conseils:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau conseil
export async function POST(request) {
  try {
    // ✅ Utiliser le nouveau système d'auth
    const user = await getServerAuth()
    
    if (!user || !user.paroisseId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // ✅ Vérifier les permissions d'écriture
    if (!hasPermission(user, 'pastorale', 'write')) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { nom, description, type = 'custom', ordre = 0 } = body

    // Validation des données
    if (!nom) {
      return NextResponse.json(
        { error: 'Le nom du conseil est obligatoire' },
        { status: 400 }
      )
    }

    // Validation du type
    const typesValides = ['economique', 'pastoral', 'custom']
    if (!typesValides.includes(type)) {
      return NextResponse.json(
        { error: 'Type de conseil invalide' },
        { status: 400 }
      )
    }

    // Vérifier qu'il n'y a pas déjà un conseil avec ce nom dans la paroisse
    const existingConseil = await prisma.conseil.findFirst({
      where: {
        nom,
        paroisseId: user.paroisseId,
        actif: true
      }
    })

    if (existingConseil) {
      return NextResponse.json(
        { error: 'Un conseil avec ce nom existe déjà' },
        { status: 400 }
      )
    }

    // Pour les conseils économique et pastoral, vérifier qu'il n'en existe pas déjà un
    if (type === 'economique' || type === 'pastoral') {
      const existingTypeConseil = await prisma.conseil.findFirst({
        where: {
          type,
          paroisseId: user.paroisseId,
          actif: true
        }
      })

      if (existingTypeConseil) {
        return NextResponse.json(
          { error: `Un conseil ${type} existe déjà dans cette paroisse` },
          { status: 400 }
        )
      }
    }

    // Créer le conseil
    const conseil = await prisma.conseil.create({
      data: {
        nom,
        description,
        type,
        ordre,
        paroisseId: user.paroisseId,
        actif: true
      },
      include: {
        membres: {
          include: {
            membre: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    role: true
                  }
                }
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Conseil créé avec succès',
      conseil
    })

  } catch (error) {
    console.error('Erreur lors de la création du conseil:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour l'ordre des conseils
export async function PUT(request) {
  try {
    // ✅ Utiliser le nouveau système d'auth
    const user = await getServerAuth()
    
    if (!user || !user.paroisseId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // ✅ Vérifier les permissions d'écriture
    if (!hasPermission(user, 'pastorale', 'write')) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { conseils } = body // Array d'objets { id, ordre }

    if (!Array.isArray(conseils)) {
      return NextResponse.json(
        { error: 'Format de données invalide' },
        { status: 400 }
      )
    }

    // Mettre à jour l'ordre dans une transaction
    await prisma.$transaction(async (tx) => {
      for (const conseil of conseils) {
        await tx.conseil.update({
          where: {
            id: conseil.id,
            paroisseId: user.paroisseId
          },
          data: {
            ordre: conseil.ordre
          }
        })
      }
    })

    return NextResponse.json({
      message: 'Ordre des conseils mis à jour avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'ordre des conseils:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}