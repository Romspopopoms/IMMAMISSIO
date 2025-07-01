// ============================================================================
// src/app/api/horaires/duplicate/route.js - API duplication mise à jour
// ============================================================================
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getServerAuth } from '../../../../lib/auth'

// POST - Dupliquer des horaires
export async function POST(request) {
  try {
    // ✅ Utiliser le nouveau système d'authentification
    const user = await getServerAuth()
    
    if (!user || !user.paroisseId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // ✅ Vérifier les permissions d'écriture
    const canWrite = ['CURE', 'PAROISSE_ADMIN', 'PRETRE'].includes(user.role)
    if (!canWrite) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { horaires } = body

    // Validation des données
    if (!horaires || !Array.isArray(horaires) || horaires.length === 0) {
      return NextResponse.json(
        { error: 'Aucun horaire à dupliquer fourni' },
        { status: 400 }
      )
    }

    // Validation de chaque horaire
    const validTypes = ['messe', 'confession', 'adoration', 'vepres', 'chapelet', 'permanence', 'autre']
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/

    for (const horaire of horaires) {
      const { jourSemaine, heure, typeOffice } = horaire

      // Validation du jour de la semaine
      const jourSemaineInt = parseInt(jourSemaine)
      if (isNaN(jourSemaineInt) || jourSemaineInt < 0 || jourSemaineInt > 6) {
        return NextResponse.json(
          { error: `Jour de la semaine invalide: ${jourSemaine}` },
          { status: 400 }
        )
      }

      // Validation de l'heure
      if (!heure || !timeRegex.test(heure)) {
        return NextResponse.json(
          { error: `Format d'heure invalide: ${heure}` },
          { status: 400 }
        )
      }

      // Validation du type d'office
      if (!typeOffice || !validTypes.includes(typeOffice)) {
        return NextResponse.json(
          { error: `Type d'office invalide: ${typeOffice}` },
          { status: 400 }
        )
      }
    }

    // Récupérer les horaires existants pour éviter les doublons
    const existingHoraires = await prisma.horaire.findMany({
      where: {
        paroisseId: user.paroisseId,
        actif: true
      },
      select: {
        jourSemaine: true,
        heure: true,
        typeOffice: true
      }
    })

    // Créer un Set pour une recherche rapide des doublons
    const existingSet = new Set(
      existingHoraires.map(h => `${h.jourSemaine}-${h.heure}-${h.typeOffice}`)
    )

    // Filtrer les horaires à créer (éviter les doublons)
    const horairesToCreate = []
    const duplicatesSkipped = []

    for (const horaire of horaires) {
      const key = `${parseInt(horaire.jourSemaine)}-${horaire.heure}-${horaire.typeOffice}`
      
      if (existingSet.has(key)) {
        duplicatesSkipped.push(horaire)
      } else {
        horairesToCreate.push({
          jourSemaine: parseInt(horaire.jourSemaine),
          heure: horaire.heure,
          typeOffice: horaire.typeOffice,
          description: horaire.description || null,
          paroisseId: user.paroisseId,
          actif: true
        })
      }
    }

    // Si aucun horaire à créer
    if (horairesToCreate.length === 0) {
      return NextResponse.json({
        message: 'Aucun horaire créé - tous existent déjà',
        created: 0,
        skipped: duplicatesSkipped.length,
        duplicates: duplicatesSkipped
      })
    }

    // Créer les horaires en batch
    const createdHoraires = await prisma.horaire.createMany({
      data: horairesToCreate
    })

    // Récupérer les horaires créés pour les retourner
    const newHoraires = await prisma.horaire.findMany({
      where: {
        paroisseId: user.paroisseId,
        actif: true,
        OR: horairesToCreate.map(h => ({
          jourSemaine: h.jourSemaine,
          heure: h.heure,
          typeOffice: h.typeOffice
        }))
      },
      orderBy: [
        { jourSemaine: 'asc' },
        { heure: 'asc' }
      ]
    })

    // ✅ Sérialiser les données de réponse
    const newHorairesSerialises = newHoraires.map(horaire => ({
      id: String(horaire.id),
      jourSemaine: Number(horaire.jourSemaine),
      heure: String(horaire.heure),
      typeOffice: String(horaire.typeOffice),
      description: horaire.description ? String(horaire.description) : null,
      paroisseId: String(horaire.paroisseId),
      actif: Boolean(horaire.actif),
      createdAt: horaire.createdAt.toISOString(),
      updatedAt: horaire.updatedAt.toISOString()
    }))

    return NextResponse.json({
      message: `${createdHoraires.count} horaire(s) dupliqué(s) avec succès`,
      created: createdHoraires.count,
      skipped: duplicatesSkipped.length,
      horaires: newHorairesSerialises,
      duplicates: duplicatesSkipped.length > 0 ? duplicatesSkipped : undefined
    })

  } catch (error) {
    console.error('Erreur lors de la duplication des horaires:', error)
    
    // Gestion spécifique des erreurs Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Conflit de données - certains horaires existent déjà' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur serveur lors de la duplication' },
      { status: 500 }
    )
  }
}