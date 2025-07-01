// ============================================================================
// src/app/api/horaires/route.js - API mise à jour avec le nouveau système d'auth
// ============================================================================
import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getServerAuth } from '../../../lib/auth'

// GET - Récupérer tous les horaires de la paroisse
export async function GET(request) {
  try {
    // ✅ Utiliser le nouveau système d'authentification
    const user = await getServerAuth()
    
    if (!user || !user.paroisseId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const horaires = await prisma.horaire.findMany({
      where: {
        paroisseId: user.paroisseId,
        actif: true
      },
      orderBy: [
        { jourSemaine: 'asc' },
        { heure: 'asc' }
      ]
    })

    // ✅ Sérialiser les données pour éviter les erreurs de type
    const horairesSerialises = horaires.map(horaire => ({
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

    return NextResponse.json({ horaires: horairesSerialises })

  } catch (error) {
    console.error('Erreur lors de la récupération des horaires:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouvel horaire
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
    const { jourSemaine, heure, typeOffice, description } = body

    // Convertir jourSemaine en entier
    const jourSemaineInt = parseInt(jourSemaine)

    // Validation des données
    if (jourSemaine === undefined || !heure || !typeOffice) {
      return NextResponse.json(
        { error: 'Le jour, l\'heure et le type d\'office sont obligatoires' },
        { status: 400 }
      )
    }

    // Validation du jour de la semaine
    if (isNaN(jourSemaineInt) || jourSemaineInt < 0 || jourSemaineInt > 6) {
      return NextResponse.json(
        { error: 'Jour de la semaine invalide (0-6)' },
        { status: 400 }
      )
    }

    // Validation de l'heure
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(heure)) {
      return NextResponse.json(
        { error: 'Format d\'heure invalide (HH:MM)' },
        { status: 400 }
      )
    }

    // Validation du type d'office
    const validTypes = ['messe', 'confession', 'adoration', 'vepres', 'chapelet', 'permanence', 'autre']
    if (!validTypes.includes(typeOffice)) {
      return NextResponse.json(
        { error: 'Type d\'office invalide' },
        { status: 400 }
      )
    }

    // Vérifier qu'il n'y a pas déjà un horaire identique
    const existingHoraire = await prisma.horaire.findFirst({
      where: {
        paroisseId: user.paroisseId,
        jourSemaine: jourSemaineInt,
        heure: heure,
        typeOffice: typeOffice,
        actif: true
      }
    })

    if (existingHoraire) {
      return NextResponse.json(
        { error: 'Un horaire identique existe déjà pour ce jour et cette heure' },
        { status: 400 }
      )
    }

    // Créer l'horaire
    const horaire = await prisma.horaire.create({
      data: {
        jourSemaine: jourSemaineInt,
        heure: heure,
        typeOffice: typeOffice,
        description: description || null,
        paroisseId: user.paroisseId,
        actif: true
      }
    })

    // ✅ Sérialiser la réponse
    const horaireSerialise = {
      id: String(horaire.id),
      jourSemaine: Number(horaire.jourSemaine),
      heure: String(horaire.heure),
      typeOffice: String(horaire.typeOffice),
      description: horaire.description ? String(horaire.description) : null,
      paroisseId: String(horaire.paroisseId),
      actif: Boolean(horaire.actif),
      createdAt: horaire.createdAt.toISOString(),
      updatedAt: horaire.updatedAt.toISOString()
    }

    return NextResponse.json({
      message: 'Horaire créé avec succès',
      horaire: horaireSerialise
    })

  } catch (error) {
    console.error('Erreur lors de la création de l\'horaire:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}