// ============================================================================
// src/app/api/secteurs/[id]/route.js - Version corrigée
// ============================================================================
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getServerAuth, hasPermission } from '../../../../lib/auth'

// GET - Récupérer un secteur spécifique
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

    const secteur = await prisma.secteur.findFirst({
      where: {
        id,
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
      }
    })

    if (!secteur) {
      return NextResponse.json(
        { error: 'Secteur non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ secteur })

  } catch (error) {
    console.error('Erreur lors de la récupération du secteur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un secteur
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
    const { nom, description, couleur, icone, ordre, responsables = [] } = body

    // Vérifier que le secteur existe et appartient à la paroisse
    const existingSecteur = await prisma.secteur.findFirst({
      where: {
        id,
        paroisseId: user.paroisseId,
        actif: true
      }
    })

    if (!existingSecteur) {
      return NextResponse.json(
        { error: 'Secteur non trouvé' },
        { status: 404 }
      )
    }

    // Validation
    if (!nom) {
      return NextResponse.json(
        { error: 'Le nom du secteur est obligatoire' },
        { status: 400 }
      )
    }

    // Vérifier qu'il n'y a pas déjà un secteur avec ce nom (sauf celui-ci)
    const existingName = await prisma.secteur.findFirst({
      where: {
        nom,
        paroisseId: user.paroisseId,
        actif: true,
        NOT: { id }
      }
    })

    if (existingName) {
      return NextResponse.json(
        { error: 'Un secteur avec ce nom existe déjà' },
        { status: 400 }
      )
    }

    // Validation de la couleur (format hex)
    if (couleur && !/^#[0-9A-F]{6}$/i.test(couleur)) {
      return NextResponse.json(
        { error: 'Format de couleur invalide (doit être un code hex comme #FF0000)' },
        { status: 400 }
      )
    }

    // Mettre à jour dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Mettre à jour le secteur
      const updatedSecteur = await tx.secteur.update({
        where: { id },
        data: {
          nom,
          description,
          ...(couleur && { couleur }),
          ...(icone && { icone }),
          ...(ordre !== undefined && { ordre })
        }
      })

      // Gérer les responsables si fournis
      if (responsables.length >= 0) { // Permet un array vide pour tout supprimer
        // Supprimer les anciennes responsabilités
        await tx.responsabiliteSecteur.deleteMany({
          where: { secteurId: id }
        })
        
        // Ajouter les nouvelles responsabilités
        if (responsables.length > 0) {
          for (const responsable of responsables) {
            // Vérifier que le membre existe et appartient à la paroisse
            const membreExists = await tx.membre.findFirst({
              where: {
                id: responsable.membreId,
                paroisseId: user.paroisseId,
                actif: true
              }
            })

            if (membreExists) {
              await tx.responsabiliteSecteur.create({
                data: {
                  membreId: responsable.membreId,
                  secteurId: id,
                  fonction: responsable.fonction || 'Responsable'
                }
              })
            }
          }
        }
      }

      // Récupérer le secteur complet mis à jour
      const secteurComplet = await tx.secteur.findUnique({
        where: { id },
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
        }
      })

      return secteurComplet
    })

    return NextResponse.json({
      message: 'Secteur mis à jour avec succès',
      secteur: result
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du secteur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un secteur (soft delete)
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

    const existingSecteur = await prisma.secteur.findFirst({
      where: {
        id,
        paroisseId: user.paroisseId,
        actif: true
      }
    })

    if (!existingSecteur) {
      return NextResponse.json(
        { error: 'Secteur non trouvé' },
        { status: 404 }
      )
    }

    await prisma.$transaction(async (tx) => {
      // Supprimer toutes les responsabilités
      await tx.responsabiliteSecteur.deleteMany({
        where: { secteurId: id }
      })

      // Soft delete du secteur
      await tx.secteur.update({
        where: { id },
        data: { actif: false }
      })
    })

    return NextResponse.json({
      message: 'Secteur supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression du secteur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}