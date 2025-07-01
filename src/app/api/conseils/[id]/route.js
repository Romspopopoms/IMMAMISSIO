// ============================================================================
// src/app/api/conseils/[id]/route.js - Version corrigée
// ============================================================================
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getServerAuth, hasPermission } from '../../../../lib/auth'

// GET - Récupérer un conseil spécifique
export async function GET(request, { params }) {
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

    const { id } = await params

    const conseil = await prisma.conseil.findFirst({
      where: {
        id,
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
      }
    })

    if (!conseil) {
      return NextResponse.json(
        { error: 'Conseil non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ conseil })

  } catch (error) {
    console.error('Erreur lors de la récupération du conseil:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un conseil
export async function PUT(request, { params }) {
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

    const { id } = await params
    const body = await request.json()
    const { nom, description, type, ordre, membres = [] } = body

    // Vérifier que le conseil existe et appartient à la paroisse
    const existingConseil = await prisma.conseil.findFirst({
      where: {
        id,
        paroisseId: user.paroisseId,
        actif: true
      }
    })

    if (!existingConseil) {
      return NextResponse.json(
        { error: 'Conseil non trouvé' },
        { status: 404 }
      )
    }

    // Validation
    if (!nom) {
      return NextResponse.json(
        { error: 'Le nom du conseil est obligatoire' },
        { status: 400 }
      )
    }

    // Validation du type
    const typesValides = ['economique', 'pastoral', 'custom']
    if (type && !typesValides.includes(type)) {
      return NextResponse.json(
        { error: 'Type de conseil invalide' },
        { status: 400 }
      )
    }

    // Vérifier qu'il n'y a pas déjà un conseil avec ce nom (sauf celui-ci)
    const existingName = await prisma.conseil.findFirst({
      where: {
        nom,
        paroisseId: user.paroisseId,
        actif: true,
        NOT: { id }
      }
    })

    if (existingName) {
      return NextResponse.json(
        { error: 'Un conseil avec ce nom existe déjà' },
        { status: 400 }
      )
    }

    // Pour les conseils économique et pastoral, vérifier unicité du type
    if ((type === 'economique' || type === 'pastoral') && type !== existingConseil.type) {
      const existingTypeConseil = await prisma.conseil.findFirst({
        where: {
          type,
          paroisseId: user.paroisseId,
          actif: true,
          NOT: { id }
        }
      })

      if (existingTypeConseil) {
        return NextResponse.json(
          { error: `Un conseil ${type} existe déjà dans cette paroisse` },
          { status: 400 }
        )
      }
    }

    // Mettre à jour dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Mettre à jour le conseil
      const updatedConseil = await tx.conseil.update({
        where: { id },
        data: {
          nom,
          description,
          ...(type && { type }),
          ...(ordre !== undefined && { ordre })
        }
      })

      // Gérer les membres si fournis
      if (membres.length >= 0) { // Permet un array vide pour tout supprimer
        // Supprimer les anciennes appartenances
        await tx.appartenanceConseil.deleteMany({
          where: { conseilId: id }
        })
        
        // Ajouter les nouvelles appartenances
        if (membres.length > 0) {
          for (const membre of membres) {
            // Vérifier que le membre existe et appartient à la paroisse
            const membreExists = await tx.membre.findFirst({
              where: {
                id: membre.membreId,
                paroisseId: user.paroisseId,
                actif: true
              }
            })

            if (membreExists) {
              await tx.appartenanceConseil.create({
                data: {
                  membreId: membre.membreId,
                  conseilId: id,
                  fonction: membre.fonction || 'Membre'
                }
              })
            }
          }
        }
      }

      // Récupérer le conseil complet mis à jour
      const conseilComplet = await tx.conseil.findUnique({
        where: { id },
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
        }
      })

      return conseilComplet
    })

    return NextResponse.json({
      message: 'Conseil mis à jour avec succès',
      conseil: result
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du conseil:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un conseil (soft delete)
export async function DELETE(request, { params }) {
  try {
    // ✅ Utiliser le nouveau système d'auth
    const user = await getServerAuth()
    
    if (!user || !user.paroisseId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // ✅ Vérifier les permissions de suppression
    if (!hasPermission(user, 'pastorale', 'write')) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    const { id } = await params

    const existingConseil = await prisma.conseil.findFirst({
      where: {
        id,
        paroisseId: user.paroisseId,
        actif: true
      }
    })

    if (!existingConseil) {
      return NextResponse.json(
        { error: 'Conseil non trouvé' },
        { status: 404 }
      )
    }

    await prisma.$transaction(async (tx) => {
      // Supprimer toutes les appartenances
      await tx.appartenanceConseil.deleteMany({
        where: { conseilId: id }
      })

      // Soft delete du conseil
      await tx.conseil.update({
        where: { id },
        data: { actif: false }
      })
    })

    return NextResponse.json({
      message: 'Conseil supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression du conseil:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}