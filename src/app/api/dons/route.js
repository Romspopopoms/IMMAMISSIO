// ============================================================================
// FICHIER 3 : src/app/api/dons/route.js - Correction API
// ============================================================================
import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getServerAuth, hasPermission } from '../../../lib/auth'
import stripe from '../../../lib/stripe'

// Fonction de validation d'email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Fonction pour obtenir l'URL de base
function getBaseUrl() {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'
  }
  
  return process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'https://votre-domaine.com'
}

// ============================================================================
// POST - Créer un nouveau don (PUBLIC pour les visiteurs)
// ============================================================================
export async function POST(request) {
  try {
    const data = await request.json()
    const { projetId, montant, donateur, message, anonyme, paroisseId } = data

    // ✅ Validation des données d'entrée
    if (!montant || montant < 1) {
      return NextResponse.json(
        { error: 'Le montant doit être supérieur à 0' },
        { status: 400 }
      )
    }

    if (!projetId || !paroisseId) {
      return NextResponse.json(
        { error: 'Projet et paroisse requis' },
        { status: 400 }
      )
    }

    // ✅ Validation de l'email si donateur non anonyme
    if (donateur && donateur.email && !isValidEmail(donateur.email)) {
      return NextResponse.json(
        { error: 'Adresse email invalide' },
        { status: 400 }
      )
    }

    // ✅ Vérifier que le projet existe et appartient à la paroisse
    const projet = await prisma.projet.findFirst({
      where: {
        id: projetId,
        paroisseId: paroisseId,
        actif: true
      }
    })

    if (!projet) {
      return NextResponse.json(
        { error: 'Projet non trouvé ou inactif' },
        { status: 404 }
      )
    }

    // ✅ Vérifier que la paroisse est active
    const paroisse = await prisma.paroisse.findUnique({
      where: { id: paroisseId, actif: true }
    })

    if (!paroisse) {
      return NextResponse.json(
        { error: 'Paroisse non trouvée ou inactive' },
        { status: 404 }
      )
    }

    // ✅ Créer le don dans la base de données
    const don = await prisma.don.create({
      data: {
        projetId,
        montant,
        anonyme,
        message: message || null,
        statut: 'en_attente',
        donateur: donateur && !anonyme ? {
          create: {
            nom: donateur.nom || 'Anonyme',
            prenom: donateur.prenom || '',
            email: donateur.email || '',
            telephone: donateur.telephone || ''
          }
        } : undefined
      },
      include: {
        donateur: true,
        projet: {
          select: {
            titre: true
          }
        }
      }
    })

    // ✅ Obtenir l'URL de base
    const baseUrl = getBaseUrl()
    
    // ✅ Préparer les données pour Stripe
    const sessionData = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Don - ${projet.titre}`,
              description: `Don pour la paroisse ${paroisse.nom}`,
              metadata: {
                donId: don.id.toString(),
                projetId: projetId.toString(),
                paroisseId: paroisseId.toString()
              }
            },
            unit_amount: montant * 100, // Stripe utilise les centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/site/${paroisse.subdomain}/don/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/site/${paroisse.subdomain}/don`,
      metadata: {
        donId: don.id.toString(),
        projetId: projetId.toString(),
        paroisseId: paroisseId.toString()
      },
      submit_type: 'donate',
      billing_address_collection: 'required'
    }

    // ✅ Ajouter l'email seulement s'il est valide
    if (donateur?.email && isValidEmail(donateur.email)) {
      sessionData.customer_email = donateur.email
    }

    // ✅ Créer une session de paiement Stripe
    const session = await stripe.checkout.sessions.create(sessionData)

    console.log('✅ Don créé:', don.id, 'Session Stripe:', session.id)

    return NextResponse.json({
      success: true,
      don,
      sessionId: session.id,
      sessionUrl: session.url
    })

  } catch (error) {
    console.error('❌ Erreur création don:', error)
    
    // ✅ Gestion spécifique des erreurs Stripe
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Erreur de validation: ' + error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création du don' },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET - Récupérer les dons (PROTÉGÉ - admin seulement)
// ============================================================================
export async function GET(request) {
  try {
    // ✅ Vérifier l'authentification
    const user = await getServerAuth()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      )
    }

    // ✅ Vérifier les permissions
    if (!hasPermission(user, 'dons', 'read')) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const projetId = searchParams.get('projetId')
    const statut = searchParams.get('statut')
    const limit = parseInt(searchParams.get('limit')) || 50
    const offset = parseInt(searchParams.get('offset')) || 0

    // ✅ CORRECTION : Construire la clause WHERE sans relations invalides
    const where = {}
    
    if (projetId) {
      where.projetId = projetId
    }
    if (statut) {
      where.statut = statut
    }

    // ✅ Pour filtrer par paroisse, utiliser une sous-requête
    let projetsIds = []
    if (user.role !== 'SUPER_ADMIN') {
      const projetsParoisse = await prisma.projet.findMany({
        where: { paroisseId: user.paroisseId },
        select: { id: true }
      })
      projetsIds = projetsParoisse.map(p => p.id)
      
      if (projetsIds.length > 0) {
        where.projetId = { in: projetsIds }
      } else {
        // Aucun projet pour cette paroisse
        return NextResponse.json({
          success: true,
          dons: [],
          pagination: { total: 0, limit, offset, pages: 0 },
          stats: { totalMontant: 0, totalDons: 0, parStatut: [] }
        })
      }
    }

    // ✅ Récupérer les dons avec pagination
    const [dons, total] = await Promise.all([
      prisma.don.findMany({
        where,
        include: {
          donateur: true,
          projet: {
            select: {
              id: true,
              titre: true,
              paroisse: {
                select: {
                  id: true,
                  nom: true,
                  subdomain: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset
      }),
      prisma.don.count({ where })
    ])

    // ✅ Calculer les statistiques
    const stats = await prisma.don.aggregate({
      where: {
        ...where,
        statut: 'complete'
      },
      _sum: {
        montant: true
      },
      _count: {
        id: true
      }
    })

    // ✅ Grouper par statut
    const statutsCount = await prisma.don.groupBy({
      by: ['statut'],
      where,
      _count: {
        id: true
      },
      _sum: {
        montant: true
      }
    })

    return NextResponse.json({
      success: true,
      dons,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit)
      },
      stats: {
        totalMontant: stats._sum.montant || 0,
        totalDons: stats._count || 0,
        parStatut: statutsCount
      }
    })

  } catch (error) {
    console.error('❌ Erreur récupération dons:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des dons' },
      { status: 500 }
    )
  }
}