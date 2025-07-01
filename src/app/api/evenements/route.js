// ============================================================================
// src/app/api/evenements/route.js - API mise à jour avec cookies
// ============================================================================
import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getServerAuth } from '../../../lib/auth'

// GET - Récupérer tous les événements de la paroisse
export async function GET(request) {
  try {
    const user = await getServerAuth()
    
    if (!user || !user.paroisseId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const evenements = await prisma.evenement.findMany({
      where: {
        paroisseId: user.paroisseId
      },
      orderBy: {
        dateDebut: 'desc'
      }
    })

    // Sérialiser les événements
    const evenementsSerializes = evenements.map(evenement => ({
      ...evenement,
      id: String(evenement.id),
      paroisseId: String(evenement.paroisseId),
      dateDebut: evenement.dateDebut.toISOString(),
      dateFin: evenement.dateFin ? evenement.dateFin.toISOString() : null,
      maxParticipants: evenement.maxParticipants ? Number(evenement.maxParticipants) : null,
      createdAt: evenement.createdAt.toISOString(),
      updatedAt: evenement.updatedAt.toISOString()
    }))

    return NextResponse.json({ evenements: evenementsSerializes })

  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouvel événement
export async function POST(request) {
  try {
    const user = await getServerAuth()
    
    if (!user || !user.paroisseId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Vérifier les permissions d'écriture
    if (!['CURE', 'PAROISSE_ADMIN', 'PRETRE'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes pour créer un événement' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { titre, description, dateDebut, dateFin, lieu, maxParticipants } = body

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

    // Créer l'événement
    const evenement = await prisma.evenement.create({
      data: {
        titre: titre.trim(),
        description: description ? description.trim() : null,
        dateDebut: startDate,
        dateFin: endDate,
        lieu: lieu ? lieu.trim() : null,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        paroisseId: user.paroisseId,
        inscriptions: null // Pas d'inscriptions par défaut
      }
    })

    // Sérialiser l'événement créé
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
      message: 'Événement créé avec succès',
      evenement: evenementSerialise
    })

  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}