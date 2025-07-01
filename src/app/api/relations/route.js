// ============================================================================
// src/app/api/relations/route.js - Version corrigée
// ============================================================================
import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getServerAuth, hasPermission } from '../../../lib/auth'

// POST - Ajouter un membre à un conseil ou secteur
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
    const { action, membreId, conseilId, secteurId, fonction } = body

    // Validation
    if (!action || !membreId) {
      return NextResponse.json(
        { error: 'Action et membreId sont requis' },
        { status: 400 }
      )
    }

    if (action === 'add_to_conseil' && !conseilId) {
      return NextResponse.json(
        { error: 'conseilId requis pour cette action' },
        { status: 400 }
      )
    }

    if (action === 'add_to_secteur' && !secteurId) {
      return NextResponse.json(
        { error: 'secteurId requis pour cette action' },
        { status: 400 }
      )
    }

    // Vérifier que le membre existe et appartient à la paroisse
    const membre = await prisma.membre.findFirst({
      where: {
        id: membreId,
        paroisseId: user.paroisseId,
        actif: true
      }
    })

    if (!membre) {
      return NextResponse.json(
        { error: 'Membre non trouvé' },
        { status: 404 }
      )
    }

    let result
    
    if (action === 'add_to_conseil') {
      // Vérifier que le conseil existe
      const conseil = await prisma.conseil.findFirst({
        where: {
          id: conseilId,
          paroisseId: user.paroisseId,
          actif: true
        }
      })

      if (!conseil) {
        return NextResponse.json(
          { error: 'Conseil non trouvé' },
          { status: 404 }
        )
      }

      // Vérifier que le membre n'est pas déjà dans ce conseil
      const existingAppartenance = await prisma.appartenanceConseil.findUnique({
        where: {
          membreId_conseilId: {
            membreId,
            conseilId
          }
        }
      })

      if (existingAppartenance) {
        return NextResponse.json(
          { error: 'Le membre fait déjà partie de ce conseil' },
          { status: 400 }
        )
      }

      // Ajouter au conseil
      result = await prisma.appartenanceConseil.create({
        data: {
          membreId,
          conseilId,
          fonction: fonction || 'Membre'
        },
        include: {
          membre: {
            select: {
              id: true,
              nom: true,
              prenom: true
            }
          },
          conseil: {
            select: {
              id: true,
              nom: true,
              type: true
            }
          }
        }
      })

    } else if (action === 'add_to_secteur') {
      // Vérifier que le secteur existe
      const secteur = await prisma.secteur.findFirst({
        where: {
          id: secteurId,
          paroisseId: user.paroisseId,
          actif: true
        }
      })

      if (!secteur) {
        return NextResponse.json(
          { error: 'Secteur non trouvé' },
          { status: 404 }
        )
      }

      // Vérifier que le membre n'est pas déjà responsable de ce secteur avec cette fonction
      const existingResponsabilite = await prisma.responsabiliteSecteur.findUnique({
        where: {
          membreId_secteurId_fonction: {
            membreId,
            secteurId,
            fonction: fonction || 'Responsable'
          }
        }
      })

      if (existingResponsabilite) {
        return NextResponse.json(
          { error: 'Le membre a déjà cette fonction dans ce secteur' },
          { status: 400 }
        )
      }

      // Ajouter au secteur
      result = await prisma.responsabiliteSecteur.create({
        data: {
          membreId,
          secteurId,
          fonction: fonction || 'Responsable'
        },
        include: {
          membre: {
            select: {
              id: true,
              nom: true,
              prenom: true
            }
          },
          secteur: {
            select: {
              id: true,
              nom: true,
              couleur: true,
              icone: true
            }
          }
        }
      })
    }

    return NextResponse.json({
      message: 'Relation ajoutée avec succès',
      relation: result
    })

  } catch (error) {
    console.error('Erreur lors de l\'ajout de la relation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une relation
export async function DELETE(request) {
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

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const membreId = searchParams.get('membreId')
    const conseilId = searchParams.get('conseilId')
    const secteurId = searchParams.get('secteurId')
    const fonction = searchParams.get('fonction')

    // Validation
    if (!action || !membreId) {
      return NextResponse.json(
        { error: 'Action et membreId sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que le membre appartient à la paroisse
    const membre = await prisma.membre.findFirst({
      where: {
        id: membreId,
        paroisseId: user.paroisseId
      }
    })

    if (!membre) {
      return NextResponse.json(
        { error: 'Membre non trouvé' },
        { status: 404 }
      )
    }

    if (action === 'remove_from_conseil' && conseilId) {
      // Supprimer du conseil
      const deleted = await prisma.appartenanceConseil.deleteMany({
        where: {
          membreId,
          conseilId
        }
      })

      if (deleted.count === 0) {
        return NextResponse.json(
          { error: 'Relation non trouvée' },
          { status: 404 }
        )
      }

    } else if (action === 'remove_from_secteur' && secteurId) {
      // Supprimer du secteur
      const whereCondition = {
        membreId,
        secteurId
      }

      // Si une fonction spécifique est précisée, l'inclure
      if (fonction) {
        whereCondition.fonction = fonction
      }

      const deleted = await prisma.responsabiliteSecteur.deleteMany({
        where: whereCondition
      })

      if (deleted.count === 0) {
        return NextResponse.json(
          { error: 'Relation non trouvée' },
          { status: 404 }
        )
      }

    } else {
      return NextResponse.json(
        { error: 'Action ou paramètres invalides' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Relation supprimée avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression de la relation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT - Modifier une relation (changer de fonction)
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
    const { action, membreId, conseilId, secteurId, ancienneFonction, nouvelleFonction } = body

    // Validation
    if (!action || !membreId || !nouvelleFonction) {
      return NextResponse.json(
        { error: 'Action, membreId et nouvelleFonction sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que le membre appartient à la paroisse
    const membre = await prisma.membre.findFirst({
      where: {
        id: membreId,
        paroisseId: user.paroisseId
      }
    })

    if (!membre) {
      return NextResponse.json(
        { error: 'Membre non trouvé' },
        { status: 404 }
      )
    }

    let result

    if (action === 'update_conseil_fonction' && conseilId) {
      // Mettre à jour la fonction dans le conseil
      result = await prisma.appartenanceConseil.updateMany({
        where: {
          membreId,
          conseilId
        },
        data: {
          fonction: nouvelleFonction
        }
      })

    } else if (action === 'update_secteur_fonction' && secteurId) {
      // Pour les secteurs, on doit supprimer et recréer car la fonction fait partie de la clé unique
      await prisma.$transaction(async (tx) => {
        // Supprimer l'ancienne responsabilité
        await tx.responsabiliteSecteur.deleteMany({
          where: {
            membreId,
            secteurId,
            ...(ancienneFonction && { fonction: ancienneFonction })
          }
        })

        // Créer la nouvelle responsabilité
        result = await tx.responsabiliteSecteur.create({
          data: {
            membreId,
            secteurId,
            fonction: nouvelleFonction
          }
        })
      })

    } else {
      return NextResponse.json(
        { error: 'Action ou paramètres invalides' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Fonction mise à jour avec succès',
      result
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la fonction:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}