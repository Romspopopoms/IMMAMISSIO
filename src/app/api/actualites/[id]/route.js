// ============================================================================
// src/app/api/actualites/[id]/route.js - API mise à jour avec cookies
// ============================================================================
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getServerAuth } from '../../../../lib/auth'

// GET - Récupérer une actualité spécifique
export async function GET(request, { params }) {
  try {
    const { id } = await params
    const user = await getServerAuth()
    
    if (!user || !user.paroisseId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const actualite = await prisma.actualite.findFirst({
      where: {
        id: id,
        paroisseId: user.paroisseId
      },
      include: {
        auteur: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            email: true
          }
        },
        paroisse: {
          select: {
            id: true,
            nom: true,
            subdomain: true
          }
        }
      }
    })

    if (!actualite) {
      return NextResponse.json(
        { error: 'Actualité non trouvée' },
        { status: 404 }
      )
    }

    // Sérialiser l'actualité
    const actualiteSerialise = {
      ...actualite,
      id: String(actualite.id),
      paroisseId: String(actualite.paroisseId),
      auteurId: String(actualite.auteurId),
      publiee: Boolean(actualite.publiee),
      datePubli: actualite.datePubli ? actualite.datePubli.toISOString() : null,
      createdAt: actualite.createdAt.toISOString(),
      updatedAt: actualite.updatedAt.toISOString(),
      auteur: actualite.auteur ? {
        ...actualite.auteur,
        id: String(actualite.auteur.id)
      } : null,
      paroisse: actualite.paroisse ? {
        ...actualite.paroisse,
        id: String(actualite.paroisse.id)
      } : null
    }

    return NextResponse.json({ actualite: actualiteSerialise })

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'actualité:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour complètement une actualité
export async function PUT(request, { params }) {
  try {
    const { id } = await params
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
        { error: 'Permissions insuffisantes pour modifier une actualité' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { titre, contenu, image, publiee, datePubli } = body

    // Validation des données
    if (!titre || !contenu) {
      return NextResponse.json(
        { error: 'Le titre et le contenu sont obligatoires' },
        { status: 400 }
      )
    }

    // Validation du titre
    if (titre.length < 3 || titre.length > 200) {
      return NextResponse.json(
        { error: 'Le titre doit contenir entre 3 et 200 caractères' },
        { status: 400 }
      )
    }

    // Validation du contenu
    if (contenu.length < 10) {
      return NextResponse.json(
        { error: 'Le contenu doit contenir au moins 10 caractères' },
        { status: 400 }
      )
    }

    // Vérifier que l'actualité existe et appartient à la paroisse
    const existingActualite = await prisma.actualite.findFirst({
      where: {
        id: id,
        paroisseId: user.paroisseId
      }
    })

    if (!existingActualite) {
      return NextResponse.json(
        { error: 'Actualité non trouvée' },
        { status: 404 }
      )
    }

    // Mettre à jour l'actualité
    const actualite = await prisma.actualite.update({
      where: { id: id },
      data: {
        titre: titre.trim(),
        contenu: contenu.trim(),
        image: image ? image.trim() : null,
        publiee: Boolean(publiee) || false,
        datePubli: publiee ? (datePubli ? new Date(datePubli) : new Date()) : null,
        updatedAt: new Date()
      },
      include: {
        auteur: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            email: true
          }
        }
      }
    })

    // Sérialiser l'actualité modifiée
    const actualiteSerialise = {
      ...actualite,
      id: String(actualite.id),
      paroisseId: String(actualite.paroisseId),
      auteurId: String(actualite.auteurId),
      publiee: Boolean(actualite.publiee),
      datePubli: actualite.datePubli ? actualite.datePubli.toISOString() : null,
      createdAt: actualite.createdAt.toISOString(),
      updatedAt: actualite.updatedAt.toISOString(),
      auteur: actualite.auteur ? {
        ...actualite.auteur,
        id: String(actualite.auteur.id)
      } : null
    }

    return NextResponse.json({
      message: 'Actualité mise à jour avec succès',
      actualite: actualiteSerialise
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'actualité:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PATCH - Mettre à jour partiellement une actualité
export async function PATCH(request, { params }) {
  try {
    const { id } = await params
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
        { error: 'Permissions insuffisantes pour modifier une actualité' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Vérifier que l'actualité existe et appartient à la paroisse
    const existingActualite = await prisma.actualite.findFirst({
      where: {
        id: id,
        paroisseId: user.paroisseId
      }
    })

    if (!existingActualite) {
      return NextResponse.json(
        { error: 'Actualité non trouvée' },
        { status: 404 }
      )
    }

    // Préparer les données à mettre à jour
    const updateData = {
      updatedAt: new Date()
    }

    // Traiter chaque champ individuellement
    if (body.titre !== undefined) {
      if (!body.titre || body.titre.length < 3 || body.titre.length > 200) {
        return NextResponse.json(
          { error: 'Le titre doit contenir entre 3 et 200 caractères' },
          { status: 400 }
        )
      }
      updateData.titre = body.titre.trim()
    }

    if (body.contenu !== undefined) {
      if (!body.contenu || body.contenu.length < 10) {
        return NextResponse.json(
          { error: 'Le contenu doit contenir au moins 10 caractères' },
          { status: 400 }
        )
      }
      updateData.contenu = body.contenu.trim()
    }

    if (body.image !== undefined) {
      updateData.image = body.image ? body.image.trim() : null
    }

    if (body.publiee !== undefined) {
      updateData.publiee = Boolean(body.publiee)
      // Si on publie, mettre à jour la date de publication
      if (body.publiee && !existingActualite.datePubli) {
        updateData.datePubli = new Date()
      }
      // Si on dépublie, on peut garder la date de publication
    }

    if (body.datePubli !== undefined) {
      updateData.datePubli = body.datePubli ? new Date(body.datePubli) : null
    }

    // Mettre à jour l'actualité
    const actualite = await prisma.actualite.update({
      where: { id: id },
      data: updateData,
      include: {
        auteur: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            email: true
          }
        }
      }
    })

    // Sérialiser l'actualité modifiée
    const actualiteSerialise = {
      ...actualite,
      id: String(actualite.id),
      paroisseId: String(actualite.paroisseId),
      auteurId: String(actualite.auteurId),
      publiee: Boolean(actualite.publiee),
      datePubli: actualite.datePubli ? actualite.datePubli.toISOString() : null,
      createdAt: actualite.createdAt.toISOString(),
      updatedAt: actualite.updatedAt.toISOString(),
      auteur: actualite.auteur ? {
        ...actualite.auteur,
        id: String(actualite.auteur.id)
      } : null
    }

    return NextResponse.json({
      message: 'Actualité mise à jour avec succès',
      actualite: actualiteSerialise
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'actualité:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une actualité
export async function DELETE(request, { params }) {
  try {
    const { id } = await params
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
        { error: 'Permissions insuffisantes pour supprimer une actualité' },
        { status: 403 }
      )
    }

    // Vérifier que l'actualité existe et appartient à la paroisse
    const existingActualite = await prisma.actualite.findFirst({
      where: {
        id: id,
        paroisseId: user.paroisseId
      }
    })

    if (!existingActualite) {
      return NextResponse.json(
        { error: 'Actualité non trouvée' },
        { status: 404 }
      )
    }

    // Supprimer l'actualité
    await prisma.actualite.delete({
      where: { id: id }
    })

    return NextResponse.json({
      message: 'Actualité supprimée avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'actualité:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}