// ============================================================================
// src/app/api/membres/[id]/route.js - Version corrigée
// ============================================================================
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getServerAuth, hasPermission, hashPassword } from '../../../../lib/auth'

// GET - Récupérer un membre spécifique
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

    const membre = await prisma.membre.findFirst({
      where: {
        id,
        paroisseId: user.paroisseId,
        actif: true
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        },
        appartenances: {
          include: {
            conseil: {
              select: {
                id: true,
                nom: true,
                type: true
              }
            }
          }
        },
        responsabilites: {
          include: {
            secteur: {
              select: {
                id: true,
                nom: true,
                couleur: true,
                icone: true
              }
            }
          }
        }
      }
    })

    if (!membre) {
      return NextResponse.json(
        { error: 'Membre non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ membre })

  } catch (error) {
    console.error('Erreur lors de la récupération du membre:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un membre
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
    const { 
      nom, 
      prenom, 
      email, 
      telephone, 
      photo, 
      createAccount,
      removeAccount,
      permissions = [],
      conseils = [], // [{ conseilId, fonction }]
      secteurs = []  // [{ secteurId, fonction }]
    } = body

    // Vérifier que le membre existe et appartient à la paroisse
    const existingMembre = await prisma.membre.findFirst({
      where: {
        id,
        paroisseId: user.paroisseId,
        actif: true
      },
      include: {
        user: true,
        appartenances: true,
        responsabilites: true
      }
    })

    if (!existingMembre) {
      return NextResponse.json(
        { error: 'Membre non trouvé' },
        { status: 404 }
      )
    }

    // Validation
    if (!nom || !prenom) {
      return NextResponse.json(
        { error: 'Le nom et le prénom sont obligatoires' },
        { status: 400 }
      )
    }

    // Mettre à jour dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      let userId = existingMembre.userId
      let tempPassword = null

      // Gestion du compte utilisateur
      if (removeAccount && existingMembre.userId) {
        await tx.user.delete({
          where: { id: existingMembre.userId }
        })
        userId = null
      } else if (createAccount && !existingMembre.userId && email) {
        const existingUser = await tx.user.findUnique({
          where: { email }
        })
        
        if (existingUser) {
          throw new Error('Un utilisateur avec cet email existe déjà')
        }
        
        tempPassword = 'temp_' + Math.random().toString(36).slice(-8)
        const hashedPassword = await hashPassword(tempPassword)
        
        const newUser = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            nom,
            prenom,
            role: 'ADMIN_SPECIALISE',
            paroisseId: user.paroisseId
          }
        })
        
        userId = newUser.id
        
        if (permissions.length > 0) {
          await tx.adminPermission.create({
            data: {
              userId: newUser.id,
              sectionsAutorisees: permissions.join(','),
              permissions: 'read,write'
            }
          })
        }
      } else if (existingMembre.userId && email) {
        await tx.user.update({
          where: { id: existingMembre.userId },
          data: {
            email,
            nom,
            prenom
          }
        })
        
        const existingPermission = await tx.adminPermission.findFirst({
          where: { userId: existingMembre.userId }
        })
        
        if (permissions.length > 0) {
          if (existingPermission) {
            await tx.adminPermission.update({
              where: { id: existingPermission.id },
              data: {
                sectionsAutorisees: permissions.join(','),
                permissions: 'read,write'
              }
            })
          } else {
            await tx.adminPermission.create({
              data: {
                userId: existingMembre.userId,
                sectionsAutorisees: permissions.join(','),
                permissions: 'read,write'
              }
            })
          }
        } else if (existingPermission) {
          await tx.adminPermission.delete({
            where: { id: existingPermission.id }
          })
        }
      }

      // Mettre à jour le membre
      const updatedMembre = await tx.membre.update({
        where: { id },
        data: {
          nom,
          prenom,
          email,
          telephone,
          photo,
          userId
        }
      })

      // Gérer les appartenances aux conseils
      // Supprimer les anciennes appartenances
      await tx.appartenanceConseil.deleteMany({
        where: { membreId: id }
      })
      
      // Ajouter les nouvelles appartenances
      if (conseils.length > 0) {
        for (const conseil of conseils) {
          await tx.appartenanceConseil.create({
            data: {
              membreId: id,
              conseilId: conseil.conseilId,
              fonction: conseil.fonction || 'Membre'
            }
          })
        }
      }

      // Gérer les responsabilités de secteurs
      // Supprimer les anciennes responsabilités
      await tx.responsabiliteSecteur.deleteMany({
        where: { membreId: id }
      })
      
      // Ajouter les nouvelles responsabilités
      if (secteurs.length > 0) {
        for (const secteur of secteurs) {
          await tx.responsabiliteSecteur.create({
            data: {
              membreId: id,
              secteurId: secteur.secteurId,
              fonction: secteur.fonction || 'Responsable'
            }
          })
        }
      }

      // Récupérer le membre complet mis à jour
      const membreComplet = await tx.membre.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true
            }
          },
          appartenances: {
            include: {
              conseil: {
                select: {
                  id: true,
                  nom: true,
                  type: true
                }
              }
            }
          },
          responsabilites: {
            include: {
              secteur: {
                select: {
                  id: true,
                  nom: true,
                  couleur: true,
                  icone: true
                }
              }
            }
          }
        }
      })

      return { membre: membreComplet, tempPassword }
    })

    return NextResponse.json({
      message: 'Membre mis à jour avec succès',
      membre: result.membre,
      ...(result.tempPassword && { 
        tempPassword: result.tempPassword,
        note: 'Nouveau mot de passe temporaire généré.'
      })
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du membre:', error)
    
    if (error.message === 'Un utilisateur avec cet email existe déjà') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un membre (soft delete)
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

    const existingMembre = await prisma.membre.findFirst({
      where: {
        id,
        paroisseId: user.paroisseId,
        actif: true
      },
      include: {
        user: true
      }
    })

    if (!existingMembre) {
      return NextResponse.json(
        { error: 'Membre non trouvé' },
        { status: 404 }
      )
    }

    await prisma.$transaction(async (tx) => {
      // Supprimer les relations
      await tx.appartenanceConseil.deleteMany({
        where: { membreId: id }
      })
      
      await tx.responsabiliteSecteur.deleteMany({
        where: { membreId: id }
      })

      // Soft delete du membre
      await tx.membre.update({
        where: { id },
        data: { actif: false }
      })

      // Optionnel : gérer le compte utilisateur associé
      if (existingMembre.userId) {
        await tx.user.update({
          where: { id: existingMembre.userId },
          data: { 
            // On peut choisir de garder le compte ou le supprimer
            // paroisseId: null
          }
        })
      }
    })

    return NextResponse.json({
      message: 'Membre supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression du membre:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}