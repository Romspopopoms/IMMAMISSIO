// ============================================================================
// src/app/api/membres/route.js - Version corrigée
// ============================================================================
import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getServerAuth, hasPermission, hashPassword } from '../../../lib/auth'

// GET - Récupérer tous les membres de la paroisse
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

    const membres = await prisma.membre.findMany({
      where: {
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
                nom: true
              }
            }
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ membres })

  } catch (error) {
    console.error('Erreur lors de la récupération des membres:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau membre
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
    const { 
      nom, 
      prenom, 
      email, 
      telephone, 
      photo, 
      createAccount, 
      permissions = [],
      conseils = [], // Array d'objets { conseilId, fonction }
      secteurs = []  // Array d'objets { secteurId, fonction }
    } = body

    // Validation des données
    if (!nom || !prenom) {
      return NextResponse.json(
        { error: 'Le nom et le prénom sont obligatoires' },
        { status: 400 }
      )
    }

    // Créer le membre dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      let userId = null
      let tempPassword = null
      
      // Créer un compte utilisateur si demandé
      if (createAccount && email) {
        // Vérifier que l'email n'existe pas déjà
        const existingUser = await tx.user.findUnique({
          where: { email }
        })
        
        if (existingUser) {
          throw new Error('Un utilisateur avec cet email existe déjà')
        }
        
        // Générer un mot de passe temporaire
        tempPassword = 'temp_' + Math.random().toString(36).slice(-8)
        const hashedPassword = await hashPassword(tempPassword)
        
        // Créer l'utilisateur
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
        
        // Créer les permissions si spécifiées
        if (permissions.length > 0) {
          await tx.adminPermission.create({
            data: {
              userId: newUser.id,
              sectionsAutorisees: permissions.join(','),
              permissions: 'read,write'
            }
          })
        }
      }

      // Créer le membre
      const membre = await tx.membre.create({
        data: {
          nom,
          prenom,
          email,
          telephone,
          photo,
          paroisseId: user.paroisseId,
          userId,
          actif: true
        }
      })

      // Ajouter aux conseils
      if (conseils.length > 0) {
        for (const conseil of conseils) {
          await tx.appartenanceConseil.create({
            data: {
              membreId: membre.id,
              conseilId: conseil.conseilId,
              fonction: conseil.fonction || 'Membre'
            }
          })
        }
      }

      // Ajouter aux secteurs
      if (secteurs.length > 0) {
        for (const secteur of secteurs) {
          await tx.responsabiliteSecteur.create({
            data: {
              membreId: membre.id,
              secteurId: secteur.secteurId,
              fonction: secteur.fonction || 'Responsable'
            }
          })
        }
      }

      // Récupérer le membre complet avec relations
      const membreComplet = await tx.membre.findUnique({
        where: { id: membre.id },
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
                  nom: true
                }
              }
            }
          }
        }
      })

      return { membre: membreComplet, tempPassword }
    })

    return NextResponse.json({
      message: 'Membre créé avec succès',
      membre: result.membre,
      ...(result.tempPassword && { 
        tempPassword: result.tempPassword,
        note: 'Mot de passe temporaire généré. Demandez au membre de le changer lors de sa première connexion.'
      })
    })

  } catch (error) {
    console.error('Erreur lors de la création du membre:', error)
    
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