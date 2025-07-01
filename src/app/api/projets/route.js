// ============================================================================
// FICHIER CORRIGÉ : src/app/api/projets/route.js - API Projets sans limitation
// ============================================================================
import { NextResponse } from 'next/server'
import { getServerAuth, hasPermission } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

// ============================================================================
// GET - Récupérer tous les projets (PUBLIC pour le site OU PROTÉGÉ pour admin)
// ============================================================================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const paroisseId = searchParams.get('paroisseId')
    const theme = searchParams.get('theme')
    const alaune = searchParams.get('alaune')
    const actif = searchParams.get('actif')

    // ✅ Si paroisseId fourni → appel public depuis le site
    if (paroisseId) {
      // Appel public - pas d'auth requise
      return await getPublicProjets(paroisseId, theme, alaune)
    }

    // ✅ Sinon → appel depuis le dashboard - auth requise
    const user = await getServerAuth()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      )
    }

    if (!hasPermission(user, 'dons', 'read')) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    return await getAdminProjets(user, theme, alaune, actif)

  } catch (error) {
    console.error('❌ Erreur récupération projets:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des projets' },
      { status: 500 }
    )
  }
}

// ✅ Fonction pour récupérer les projets publics (site web)
async function getPublicProjets(paroisseId, theme, alaune) {
  const where = {
    paroisseId: paroisseId,
    actif: true
  }

  if (theme) {
    where.theme = theme
  }

  if (alaune === 'true') {
    where.alaune = true
  }

  const projets = await prisma.projet.findMany({
    where,
    orderBy: [
      { ordre: 'asc' },
      { alaune: 'desc' },
      { createdAt: 'desc' }
    ]
  })

  // ✅ Calculer les montants collectés pour chaque projet
  const projetsAvecStats = await Promise.all(
    projets.map(async (projet) => {
      const donStats = await prisma.don.aggregate({
        where: {
          projetId: projet.id,
          statut: 'complete'
        },
        _sum: {
          montant: true
        },
        _count: {
          id: true
        }
      })
      
      return {
        ...projet,
        collecte: donStats._sum.montant || 0,
        nombreDonateurs: donStats._count || 0
      }
    })
  )

  return NextResponse.json({ 
    success: true,
    projets: projetsAvecStats 
  })
}

// ✅ Fonction pour récupérer les projets admin (dashboard)
async function getAdminProjets(user, theme, alaune, actif) {
  const where = {
    paroisseId: user.paroisseId
  }

  if (theme) {
    where.theme = theme
  }

  if (alaune !== null) {
    where.alaune = alaune === 'true'
  }

  if (actif !== null) {
    where.actif = actif === 'true'
  }

  // ✅ Super admin peut voir toutes les paroisses
  if (user.role === 'SUPER_ADMIN') {
    delete where.paroisseId
  }

  const projets = await prisma.projet.findMany({
    where,
    include: {
      paroisse: {
        select: {
          id: true,
          nom: true,
          subdomain: true
        }
      }
    },
    orderBy: [
      { alaune: 'desc' },
      { ordre: 'asc' },
      { createdAt: 'desc' }
    ]
  })

  // ✅ Ajouter les statistiques détaillées pour les admins
  const projetsWithStats = await Promise.all(
    projets.map(async (projet) => {
      const donStats = await prisma.don.aggregate({
        where: {
          projetId: projet.id,
          statut: 'complete'
        },
        _sum: {
          montant: true
        },
        _count: {
          id: true
        }
      })

      return {
        ...projet,
        collecte: donStats._sum.montant || 0,
        nombreDonateurs: donStats._count || 0
      }
    })
  )

  return NextResponse.json({
    success: true,
    projets: projetsWithStats
  })
}

// ============================================================================
// POST - Créer un nouveau projet (PROTÉGÉ)
// ============================================================================
export async function POST(request) {
  try {
    // ✅ Vérifier l'authentification avec cookies
    const user = await getServerAuth()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      )
    }

    // ✅ Vérifier les permissions
    if (!hasPermission(user, 'dons', 'write')) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes pour créer des projets' },
        { status: 403 }
      )
    }

    const data = await request.json()
    const { titre, description, objectif, image, theme, alaune, actif } = data

    // ✅ Validation des données
    if (!titre || titre.trim().length < 3) {
      return NextResponse.json(
        { error: 'Le titre doit contenir au moins 3 caractères' },
        { status: 400 }
      )
    }

    if (!description || description.trim().length < 10) {
      return NextResponse.json(
        { error: 'La description doit contenir au moins 10 caractères' },
        { status: 400 }
      )
    }

    if (!objectif || objectif < 100 || objectif > 1000000) {
      return NextResponse.json(
        { error: 'L\'objectif doit être entre 100€ et 1 000 000€' },
        { status: 400 }
      )
    }

    if (!theme) {
      return NextResponse.json(
        { error: 'Une thématique est requise' },
        { status: 400 }
      )
    }

    // ✅ SUPPRIMÉ : Vérification des limites de plan (n'existe pas dans votre système)

    // ✅ Créer le projet sans limitation
    const projet = await prisma.projet.create({
      data: {
        titre: titre.trim(),
        description: description.trim(),
        objectif: parseInt(objectif),
        image: image || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&h=600&fit=crop',
        theme: theme,
        alaune: alaune || false,
        ordre: 0, // Par défaut
        actif: actif !== false,
        paroisseId: user.paroisseId
      },
      include: {
        paroisse: {
          select: {
            nom: true,
            subdomain: true
          }
        }
      }
    })

    console.log('✅ Projet créé:', projet.id, 'par', user.email)

    return NextResponse.json({
      success: true,
      projet: {
        id: projet.id,
        titre: projet.titre,
        description: projet.description,
        objectif: projet.objectif,
        theme: projet.theme,
        alaune: projet.alaune,
        paroisse: projet.paroisse
      }
    })

  } catch (error) {
    console.error('❌ Erreur création projet:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Un projet avec ce titre existe déjà' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création du projet' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PATCH - Mettre à jour un projet (PROTÉGÉ)
// ============================================================================
export async function PATCH(request) {
  try {
    // ✅ Vérifier l'authentification avec cookies
    const user = await getServerAuth()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      )
    }

    // ✅ Vérifier les permissions
    if (!hasPermission(user, 'dons', 'write')) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      )
    }

    const data = await request.json()
    const { id, titre, description, objectif, image, theme, alaune, ordre, actif } = data

    if (!id) {
      return NextResponse.json(
        { error: 'ID du projet requis' },
        { status: 400 }
      )
    }

    // ✅ Vérifier que le projet appartient à la paroisse de l'utilisateur
    const existingProjet = await prisma.projet.findFirst({
      where: {
        id: id,
        paroisseId: user.paroisseId
      }
    })

    if (!existingProjet) {
      return NextResponse.json(
        { error: 'Projet non trouvé ou non autorisé' },
        { status: 404 }
      )
    }

    // ✅ Validation des nouvelles données
    if (titre && titre.trim().length < 3) {
      return NextResponse.json(
        { error: 'Le titre doit contenir au moins 3 caractères' },
        { status: 400 }
      )
    }

    if (description && description.trim().length < 10) {
      return NextResponse.json(
        { error: 'La description doit contenir au moins 10 caractères' },
        { status: 400 }
      )
    }

    if (objectif && (objectif < 100 || objectif > 1000000)) {
      return NextResponse.json(
        { error: 'L\'objectif doit être entre 100€ et 1 000 000€' },
        { status: 400 }
      )
    }

    // ✅ Mettre à jour le projet
    const updateData = {}
    
    if (titre !== undefined) updateData.titre = titre.trim()
    if (description !== undefined) updateData.description = description.trim()
    if (objectif !== undefined) updateData.objectif = parseInt(objectif)
    if (image !== undefined) updateData.image = image
    if (theme !== undefined) updateData.theme = theme
    if (alaune !== undefined) updateData.alaune = alaune
    if (ordre !== undefined) updateData.ordre = ordre
    if (actif !== undefined) updateData.actif = actif

    const projet = await prisma.projet.update({
      where: { id: id },
      data: updateData,
      include: {
        paroisse: {
          select: {
            nom: true,
            subdomain: true
          }
        }
      }
    })

    console.log('✅ Projet mis à jour:', projet.id, 'par', user.email)
    
    return NextResponse.json({
      success: true,
      projet
    })

  } catch (error) {
    console.error('❌ Erreur mise à jour projet:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du projet' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Supprimer (désactiver) un projet (PROTÉGÉ)
// ============================================================================
export async function DELETE(request) {
  try {
    // ✅ Vérifier l'authentification avec cookies
    const user = await getServerAuth()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      )
    }

    // ✅ Vérifier les permissions (seuls les admins peuvent supprimer)
    if (!hasPermission(user, 'dons', 'write') || user.role === 'ADMIN_SPECIALISE') {
      return NextResponse.json(
        { error: 'Permissions insuffisantes pour supprimer des projets' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const projetId = searchParams.get('id')

    if (!projetId) {
      return NextResponse.json(
        { error: 'ID du projet requis' },
        { status: 400 }
      )
    }

    // ✅ Vérifier que le projet appartient à la paroisse de l'utilisateur
    const existingProjet = await prisma.projet.findFirst({
      where: {
        id: projetId,
        paroisseId: user.paroisseId
      }
    })

    if (!existingProjet) {
      return NextResponse.json(
        { error: 'Projet non trouvé ou non autorisé' },
        { status: 404 }
      )
    }

    // ✅ Vérifier s'il y a des dons pour ce projet
    const nombreDons = await prisma.don.count({
      where: {
        projetId: projetId,
        statut: 'complete'
      }
    })

    if (nombreDons > 0) {
      // ✅ Désactiver seulement s'il y a des dons (pour garder l'historique)
      const projet = await prisma.projet.update({
        where: { id: projetId },
        data: { 
          actif: false,
          alaune: false // Retirer de la une aussi
        }
      })

      console.log('✅ Projet désactivé:', projet.id, 'par', user.email)
      
      return NextResponse.json({
        success: true,
        message: 'Projet désactivé avec succès (historique des dons conservé)',
        projet
      })
    } else {
      // ✅ Suppression complète s'il n'y a pas de dons
      await prisma.projet.delete({
        where: { id: projetId }
      })

      console.log('✅ Projet supprimé:', projetId, 'par', user.email)
      
      return NextResponse.json({
        success: true,
        message: 'Projet supprimé définitivement'
      })
    }

  } catch (error) {
    console.error('❌ Erreur suppression projet:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du projet' },
      { status: 500 }
    )
  }
}