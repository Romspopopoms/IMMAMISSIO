// ============================================================================
// src/app/api/secteurs/route.js - Version corrigée
// ============================================================================
import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getServerAuth, hasPermission } from '../../../lib/auth'

// GET - Récupérer tous les secteurs de la paroisse
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

    const secteurs = await prisma.secteur.findMany({
      where: {
        paroisseId: user.paroisseId,
        actif: true
      },
      include: {
        responsables: {
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

    return NextResponse.json({ secteurs })

  } catch (error) {
    console.error('Erreur lors de la récupération des secteurs:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau secteur
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
    const { nom, description, couleur, icone, ordre = 0 } = body

    // Validation des données
    if (!nom) {
      return NextResponse.json(
        { error: 'Le nom du secteur est obligatoire' },
        { status: 400 }
      )
    }

    // Vérifier qu'il n'y a pas déjà un secteur avec ce nom dans la paroisse
    const existingSecteur = await prisma.secteur.findFirst({
      where: {
        nom,
        paroisseId: user.paroisseId,
        actif: true
      }
    })

    if (existingSecteur) {
      return NextResponse.json(
        { error: 'Un secteur avec ce nom existe déjà' },
        { status: 400 }
      )
    }

    // Créer le secteur
    const secteur = await prisma.secteur.create({
      data: {
        nom,
        description,
        couleur: couleur || '#6B7280', // Gris par défaut
        icone: icone || 'Users', // Icône par défaut
        ordre,
        paroisseId: user.paroisseId,
        actif: true
      },
      include: {
        responsables: {
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
      message: 'Secteur créé avec succès',
      secteur
    })

  } catch (error) {
    console.error('Erreur lors de la création du secteur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour l'ordre des secteurs
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
    const { secteurs } = body // Array d'objets { id, ordre }

    if (!Array.isArray(secteurs)) {
      return NextResponse.json(
        { error: 'Format de données invalide' },
        { status: 400 }
      )
    }

    // Mettre à jour l'ordre dans une transaction
    await prisma.$transaction(async (tx) => {
      for (const secteur of secteurs) {
        await tx.secteur.update({
          where: {
            id: secteur.id,
            paroisseId: user.paroisseId
          },
          data: {
            ordre: secteur.ordre
          }
        })
      }
    })

    return NextResponse.json({
      message: 'Ordre des secteurs mis à jour avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'ordre des secteurs:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}