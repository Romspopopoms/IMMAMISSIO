// ============================================================================
// src/app/api/paroisse/config/route.js - Mise à jour avec cookies
// ============================================================================
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getServerAuth } from '../../../../lib/auth'

// GET - Récupérer la configuration actuelle
export async function GET(request) {
  try {
    const user = await getServerAuth()
    
    if (!user || !user.paroisseId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const paroisse = await prisma.paroisse.findUnique({
      where: { id: user.paroisseId },
      select: { 
        configSite: true,
        adresse: true,
        ville: true,
        codePostal: true,
        telephone: true,
        email: true
      }
    })

    if (!paroisse) {
      return NextResponse.json(
        { error: 'Paroisse non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      configSite: paroisse.configSite || {},
      contact: {
        adresse: paroisse.adresse,
        ville: paroisse.ville,
        codePostal: paroisse.codePostal,
        telephone: paroisse.telephone,
        email: paroisse.email
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération de la config:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PATCH - Mettre à jour uniquement la configuration du site
export async function PATCH(request) {
  try {
    const user = await getServerAuth()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur peut modifier la configuration
    if (!user.paroisseId || !['CURE', 'PAROISSE_ADMIN', 'PRETRE'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès refusé. Permissions insuffisantes pour modifier la configuration.' },
        { status: 403 }
      )
    }

    const { configSite } = await request.json()
    
    if (!configSite || typeof configSite !== 'object') {
      return NextResponse.json(
        { error: 'Configuration invalide' },
        { status: 400 }
      )
    }

    // Validation des données
    const validatedConfig = {}
    
    if (configSite.headerImage !== undefined) {
      validatedConfig.headerImage = String(configSite.headerImage || '')
    }
    
    if (configSite.headerTitle !== undefined) {
      validatedConfig.headerTitle = String(configSite.headerTitle || 'À la paroisse')
    }
    
    if (configSite.theme !== undefined) {
      validatedConfig.theme = String(configSite.theme || 'default')
    }

    // Récupérer la configuration actuelle
    const currentParoisse = await prisma.paroisse.findUnique({
      where: { id: user.paroisseId },
      select: { configSite: true }
    })

    // Fusionner avec la configuration existante
    const mergedConfig = {
      ...(currentParoisse?.configSite || {}),
      ...validatedConfig
    }

    // Mettre à jour uniquement configSite
    const updatedParoisse = await prisma.paroisse.update({
      where: { id: user.paroisseId },
      data: {
        configSite: mergedConfig
      },
      select: {
        id: true,
        nom: true,
        configSite: true
      }
    })

    return NextResponse.json({
      message: 'Configuration mise à jour avec succès',
      configSite: updatedParoisse.configSite
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la config:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT - Remplacer complètement la configuration
export async function PUT(request) {
  try {
    const user = await getServerAuth()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur peut modifier la configuration
    if (!user.paroisseId || !['CURE', 'PAROISSE_ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Accès refusé. Seuls les administrateurs peuvent remplacer la configuration.' },
        { status: 403 }
      )
    }

    const { configSite } = await request.json()
    
    // Validation et nettoyage de la configuration
    const validatedConfig = {}
    
    if (configSite) {
      if (configSite.headerImage !== undefined) {
        validatedConfig.headerImage = String(configSite.headerImage || '')
      }
      
      if (configSite.headerTitle !== undefined) {
        validatedConfig.headerTitle = String(configSite.headerTitle || 'À la paroisse')
      }
      
      if (configSite.theme !== undefined) {
        validatedConfig.theme = String(configSite.theme || 'default')
      }
    }

    // Remplacer complètement la configuration
    const updatedParoisse = await prisma.paroisse.update({
      where: { id: user.paroisseId },
      data: {
        configSite: validatedConfig
      },
      select: {
        id: true,
        nom: true,
        configSite: true
      }
    })

    return NextResponse.json({
      message: 'Configuration remplacée avec succès',
      configSite: updatedParoisse.configSite
    })

  } catch (error) {
    console.error('Erreur lors du remplacement de la config:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}