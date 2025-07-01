// ============================================================================
// src/app/api/pretres/[id]/route.js - Version corrigée
// ============================================================================
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getServerAuth, hasPermission, hashPassword } from '../../../../lib/auth'

// GET - Récupérer un prêtre spécifique
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

    const pretre = await prisma.pretre.findFirst({
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
        }
      }
    })

    if (!pretre) {
      return NextResponse.json(
        { error: 'Prêtre non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ pretre })

  } catch (error) {
    console.error('Erreur lors de la récupération du prêtre:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un prêtre
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
    const { nom, prenom, fonction, email, telephone, photo, bio, ordre, createAccount, removeAccount, permissions = [] } = body

    // Vérifier que le prêtre existe et appartient à la paroisse
    const existingPretre = await prisma.pretre.findFirst({
      where: {
        id,
        paroisseId: user.paroisseId,
        actif: true
      },
      include: {
        user: true
      }
    })

    if (!existingPretre) {
      return NextResponse.json(
        { error: 'Prêtre non trouvé' },
        { status: 404 }
      )
    }

    // Validation des données
    if (!nom || !fonction) {
      return NextResponse.json(
        { error: 'Le nom et la fonction sont obligatoires' },
        { status: 400 }
      )
    }

    // Validation des fonctions valides
    const fonctionsValides = [
      'Curé', 'Vicaire', 'Prêtre auxiliaire', 'Prêtre coopérateur', 
      'Diacre', 'Séminariste', 'Autre'
    ]
    if (!fonctionsValides.includes(fonction)) {
      return NextResponse.json(
        { error: 'Fonction invalide' },
        { status: 400 }
      )
    }

    // Mettre à jour dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      let userId = existingPretre.userId
      let tempPassword = null

      // Gestion du compte utilisateur
      if (removeAccount && existingPretre.userId) {
        // Supprimer le compte utilisateur
        await tx.user.delete({
          where: { id: existingPretre.userId }
        })
        userId = null
      } else if (createAccount && !existingPretre.userId && email) {
        // Créer un nouveau compte utilisateur
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
        
        // Créer les permissions
        if (permissions.length > 0) {
          await tx.adminPermission.create({
            data: {
              userId: newUser.id,
              sectionsAutorisees: permissions.join(','),
              permissions: 'read,write,delete'
            }
          })
        }
      } else if (existingPretre.userId && email) {
        // Mettre à jour le compte utilisateur existant
        await tx.user.update({
          where: { id: existingPretre.userId },
          data: {
            email,
            nom,
            prenom
          }
        })
        
        // Mettre à jour les permissions
        const existingPermission = await tx.adminPermission.findFirst({
          where: { userId: existingPretre.userId }
        })
        
        if (permissions.length > 0) {
          if (existingPermission) {
            await tx.adminPermission.update({
              where: { id: existingPermission.id },
              data: {
                sectionsAutorisees: permissions.join(','),
                permissions: 'read,write,delete'
              }
            })
          } else {
            await tx.adminPermission.create({
              data: {
                userId: existingPretre.userId,
                sectionsAutorisees: permissions.join(','),
                permissions: 'read,write,delete'
              }
            })
          }
        } else if (existingPermission) {
          await tx.adminPermission.delete({
            where: { id: existingPermission.id }
          })
        }
      }

      // Mettre à jour le prêtre
      const updatedPretre = await tx.pretre.update({
        where: { id },
        data: {
          nom,
          prenom,
          fonction,
          email,
          telephone,
          photo,
          bio,
          userId,
          ...(ordre !== undefined && { ordre })
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true
            }
          }
        }
      })

      return { pretre: updatedPretre, tempPassword }
    })

    return NextResponse.json({
      message: 'Prêtre mis à jour avec succès',
      pretre: result.pretre,
      ...(result.tempPassword && { 
        tempPassword: result.tempPassword,
        note: 'Nouveau mot de passe temporaire généré.'
      })
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du prêtre:', error)
    
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

// DELETE - Supprimer un prêtre (soft delete)
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

    // Vérifier que le prêtre existe et appartient à la paroisse
    const existingPretre = await prisma.pretre.findFirst({
      where: {
        id,
        paroisseId: user.paroisseId,
        actif: true
      },
      include: {
        user: true
      }
    })

    if (!existingPretre) {
      return NextResponse.json(
        { error: 'Prêtre non trouvé' },
        { status: 404 }
      )
    }

    // Soft delete dans une transaction
    await prisma.$transaction(async (tx) => {
      // Marquer le prêtre comme inactif
      await tx.pretre.update({
        where: { id },
        data: { actif: false }
      })

      // Optionnel : désactiver aussi le compte utilisateur associé
      if (existingPretre.userId) {
        await tx.user.update({
          where: { id: existingPretre.userId },
          data: { 
            // On peut choisir de garder le compte actif ou pas
            // paroisseId: null // Retirer de la paroisse
          }
        })
      }
    })

    return NextResponse.json({
      message: 'Prêtre supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression du prêtre:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}