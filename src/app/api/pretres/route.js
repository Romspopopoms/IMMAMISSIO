// ============================================================================
// src/app/api/pretres/route.js - Version corrigée
// ============================================================================
import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getServerAuth, hasPermission, hashPassword } from '../../../lib/auth'

// GET - Récupérer tous les prêtres de la paroisse
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

    const pretres = await prisma.pretre.findMany({
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
        }
      },
      orderBy: [
        { ordre: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    return NextResponse.json({ pretres })

  } catch (error) {
    console.error('Erreur lors de la récupération des prêtres:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau prêtre
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
    const { nom, prenom, fonction, email, telephone, photo, bio, createAccount, permissions = [] } = body

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

    // Créer le prêtre dans une transaction
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
            role: 'ADMIN_SPECIALISE', // Les prêtres ont généralement des droits admin
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
              permissions: 'read,write,delete' // Permissions complètes pour les prêtres
            }
          })
        }
      }

      // Créer le prêtre
      const pretre = await tx.pretre.create({
        data: {
          nom,
          prenom,
          fonction,
          email,
          telephone,
          photo,
          bio,
          paroisseId: user.paroisseId,
          userId,
          ordre: 0, // Sera mis à jour si nécessaire
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

      return { pretre, tempPassword }
    })

    return NextResponse.json({
      message: 'Prêtre créé avec succès',
      pretre: result.pretre,
      ...(result.tempPassword && { 
        tempPassword: result.tempPassword,
        note: 'Mot de passe temporaire généré. Demandez au prêtre de le changer lors de sa première connexion.'
      })
    })

  } catch (error) {
    console.error('Erreur lors de la création du prêtre:', error)
    
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