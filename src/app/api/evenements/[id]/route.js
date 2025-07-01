// ============================================================================
// src/app/api/evenements/[id]/route.js - API mise à jour avec cookies
// ============================================================================
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getServerAuth } from '../../../../lib/auth'

// GET - Récupérer un événement spécifique
export async function GET(request, { params }) {
  try {
    const user = await getServerAuth()
    const { id } = await params
    
    if (!user || !user.paroisseId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const evenement = await prisma.evenement.findFirst({
      where: {
        id: id,
        paroisseId: user.paroisseId
      }
    })

    if (!evenement) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      )
    }

    // Sérialiser l'événement
    const evenementSerialise = {
      ...evenement,
      id: String(evenement.id),
      paroisseId: String(evenement.paroisseId),
      dateDebut: evenement.dateDebut.toISOString(),
      dateFin: evenement.dateFin ? evenement.dateFin.toISOString() : null,
      maxParticipants: evenement.maxParticipants ? Number(evenement.maxParticipants) : null,
      createdAt: evenement.createdAt.toISOString(),
      updatedAt: evenement.updatedAt.toISOString()
    }

    return NextResponse.json({ evenement: evenementSerialise })

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT - Modifier un événement
export async function PUT(request, { params }) {
  try {
    const user = await getServerAuth()
    const { id } = await params
    
    if (!user || !user.paroisseId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Vérifier les permissions d'écriture
    if (!['CURE', 'PAROISSE_ADMIN', 'PRETRE'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes pour modifier un événement' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { titre, description, dateDebut, dateFin, lieu, maxParticipants } = body

    // Vérifier que l'événement existe et appartient à la paroisse
    const evenementExistant = await prisma.evenement.findFirst({
      where: {
        id: id,
        paroisseId: user.paroisseId
      }
    })

    if (!evenementExistant) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      )
    }

    // Validation des données
    if (!titre || !dateDebut) {
      return NextResponse.json(
        { error: 'Le titre et la date de début sont obligatoires' },
        { status: 400 }
      )
    }

    // Validation des dates
    const startDate = new Date(dateDebut)
    const endDate = dateFin ? new Date(dateFin) : null
    
    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: 'Date de début invalide' },
        { status: 400 }
      )
    }

    if (endDate && (isNaN(endDate.getTime()) || endDate < startDate)) {
      return NextResponse.json(
        { error: 'La date de fin ne peut pas être antérieure à la date de début' },
        { status: 400 }
      )
    }

    // Validation du nombre maximum de participants
    if (maxParticipants && (isNaN(maxParticipants) || maxParticipants < 1)) {
      return NextResponse.json(
        { error: 'Le nombre maximum de participants doit être un nombre positif' },
        { status: 400 }
      )
    }

    // Mettre à jour l'événement
    const evenement = await prisma.evenement.update({
      where: {
        id: id
      },
      data: {
        titre: titre.trim(),
        description: description ? description.trim() : null,
        dateDebut: startDate,
        dateFin: endDate,
        lieu: lieu ? lieu.trim() : null,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null
      }
    })

    // Sérialiser l'événement modifié
    const evenementSerialise = {
      ...evenement,
      id: String(evenement.id),
      paroisseId: String(evenement.paroisseId),
      dateDebut: evenement.dateDebut.toISOString(),
      dateFin: evenement.dateFin ? evenement.dateFin.toISOString() : null,
      maxParticipants: evenement.maxParticipants ? Number(evenement.maxParticipants) : null,
      createdAt: evenement.createdAt.toISOString(),
      updatedAt: evenement.updatedAt.toISOString()
    }

    return NextResponse.json({
      message: 'Événement modifié avec succès',
      evenement: evenementSerialise
    })

  } catch (error) {
    console.error('Erreur lors de la modification de l\'événement:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un événement
export async function DELETE(request, { params }) {
  try {
    const user = await getServerAuth()
    const { id } = await params
    
    if (!user || !user.paroisseId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Vérifier les permissions d'écriture
    if (!['CURE', 'PAROISSE_ADMIN', 'PRETRE'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes pour supprimer un événement' },
        { status: 403 }
      )
    }

    // Vérifier que l'événement existe et appartient à la paroisse
    const evenementExistant = await prisma.evenement.findFirst({
      where: {
        id: id,
        paroisseId: user.paroisseId
      }
    })

    if (!evenementExistant) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer l'événement
    await prisma.evenement.delete({
      where: {
        id: id
      }
    })

    return NextResponse.json({
      message: 'Événement supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}