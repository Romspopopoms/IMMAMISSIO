// ============================================================================
// src/app/api/horaires/[id]/route.js - API dynamique mise à jour
// ============================================================================
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getServerAuth } from '../../../../lib/auth'

// GET - Récupérer un horaire spécifique
export async function GET(request, { params }) {
  try {
    // ✅ Utiliser le nouveau système d'authentification
    const user = await getServerAuth()
    
    if (!user || !user.paroisseId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { id } = params

    const horaire = await prisma.horaire.findFirst({
      where: {
        id: id,
        paroisseId: user.paroisseId,
        actif: true
      }
    })

    if (!horaire) {
      return NextResponse.json(
        { error: 'Horaire non trouvé' },
        { status: 404 }
      )
    }

    // ✅ Sérialiser les données
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

    return NextResponse.json({ horaire: horaireSerialise })

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'horaire:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT - Modifier un horaire
export async function PUT(request, { params }) {
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

    const { id } = params
    const body = await request.json()
    const { jourSemaine, heure, typeOffice, description } = body

    // Vérifier que l'horaire existe et appartient à la paroisse
    const existingHoraire = await prisma.horaire.findFirst({
      where: {
        id: id,
        paroisseId: user.paroisseId,
        actif: true
      }
    })

    if (!existingHoraire) {
      return NextResponse.json(
        { error: 'Horaire non trouvé' },
        { status: 404 }
      )
    }

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

    // Vérifier qu'il n'y a pas déjà un autre horaire identique
    const duplicateHoraire = await prisma.horaire.findFirst({
      where: {
        paroisseId: user.paroisseId,
        jourSemaine: jourSemaineInt,
        heure: heure,
        typeOffice: typeOffice,
        actif: true,
        id: { not: id } // Exclure l'horaire actuel
      }
    })

    if (duplicateHoraire) {
      return NextResponse.json(
        { error: 'Un horaire identique existe déjà pour ce jour et cette heure' },
        { status: 400 }
      )
    }

    // Mettre à jour l'horaire
    const horaire = await prisma.horaire.update({
      where: { id: id },
      data: {
        jourSemaine: jourSemaineInt,
        heure: heure,
        typeOffice: typeOffice,
        description: description || null,
        updatedAt: new Date()
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
      message: 'Horaire modifié avec succès',
      horaire: horaireSerialise
    })

  } catch (error) {
    console.error('Erreur lors de la modification de l\'horaire:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un horaire
export async function DELETE(request, { params }) {
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

    const { id } = params

    // Vérifier que l'horaire existe et appartient à la paroisse
    const existingHoraire = await prisma.horaire.findFirst({
      where: {
        id: id,
        paroisseId: user.paroisseId,
        actif: true
      }
    })

    if (!existingHoraire) {
      return NextResponse.json(
        { error: 'Horaire non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer l'horaire (suppression logique)
    await prisma.horaire.update({
      where: { id: id },
      data: {
        actif: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Horaire supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'horaire:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}