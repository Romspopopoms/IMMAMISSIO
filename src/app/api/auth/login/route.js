// ============================================================================
// src/app/api/auth/login/route.js - Login sécurisé
// ============================================================================
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyPassword, generateToken } from '../../../../lib/auth'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    // Validation des données
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // Trouver l'utilisateur avec ses relations
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        paroisse: {
          select: {
            id: true,
            nom: true,
            subdomain: true,
            plan: true,
            actif: true
          }
        },
        permissions: {
          select: {
            sectionsAutorisees: true,
            permissions: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier le mot de passe
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier que la paroisse est active (si applicable)
    if (user.paroisse && !user.paroisse.actif) {
      return NextResponse.json(
        { error: 'Compte suspendu. Contactez l\'administrateur.' },
        { status: 403 }
      )
    }

    // Générer le token avec 'userId' (cohérent avec verifyToken)
    const token = generateToken({ userId: user.id })

    // Stocker dans un cookie sécurisé
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,              // Pas accessible en JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,   // 7 jours
      path: '/'
    })

    // Préparer les données utilisateur (sans le password)
    const userData = {
      id: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      paroisseId: user.paroisseId,
      paroisse: user.paroisse,
      permissions: user.permissions
    }

    return NextResponse.json({
      success: true,
      user: userData
    })

  } catch (error) {
    console.error('Erreur login:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la connexion' },
      { status: 500 }
    )
  }
}