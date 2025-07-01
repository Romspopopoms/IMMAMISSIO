
// ============================================================================
// FICHIER 2 : src/app/api/projets/[projetId]/route.js - API Projet spécifique
// ============================================================================
import { NextResponse } from 'next/server'
import { getServerAuth, hasPermission } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

// ============================================================================
// GET - Récupérer un projet spécifique (PUBLIC)
// ============================================================================
export async function GET(request, { params }) {
  try {
    const { projetId } = await params

    // ✅ Appel public - pas d'auth requise pour voir un projet
    const projet = await prisma.projet.findFirst({
      where: {
        id: projetId,
        actif: true
      },
      include: {
        paroisse: {
          select: {
            id: true,
            nom: true,
            subdomain: true
          }
        }
      }
    })

    if (!projet) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      )
    }

    // ✅ Récupérer les statistiques de dons
    const donStats = await prisma.don.aggregate({
      where: {
        projetId: projetId,
        statut: 'complete'
      },
      _sum: {
        montant: true
      },
      _count: {
        id: true
      }
    })

    const totalCollecte = donStats._sum.montant || 0
    const totalDonateurs = donStats._count || 0

    // ✅ Récupérer les dons récents (pour affichage public)
    const donsRecents = await prisma.don.findMany({
      where: {
        projetId: projetId,
        statut: 'complete',
        anonyme: false // Seulement les dons non-anonymes
      },
      include: {
        donateur: {
          select: {
            nom: true,
            prenom: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Derniers 10 dons
    })

    return NextResponse.json({
      success: true,
      projet: {
        ...projet,
        collecte: totalCollecte
      },
      statistiques: {
        totalCollecte,
        totalDonateurs,
        pourcentage: Math.min(Math.round((totalCollecte / projet.objectif) * 100), 100),
        resteACollecter: Math.max(0, projet.objectif - totalCollecte),
        objectifAtteint: totalCollecte >= projet.objectif
      },
      donsRecents: donsRecents.map(don => ({
        id: don.id,
        montant: don.montant,
        message: don.message,
        createdAt: don.createdAt,
        donateur: don.donateur
      }))
    })

  } catch (error) {
    console.error('❌ Erreur récupération projet:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du projet' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT - Mettre à jour un projet (PROTÉGÉ)
// ============================================================================
export async function PUT(request, { params }) {
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

    const { projetId } = await params
    const data = await request.json()

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

    // ✅ Validation des nouvelles données
    if (data.titre && data.titre.trim().length < 3) {
      return NextResponse.json(
        { error: 'Le titre doit contenir au moins 3 caractères' },
        { status: 400 }
      )
    }

    if (data.description && data.description.trim().length < 10) {
      return NextResponse.json(
        { error: 'La description doit contenir au moins 10 caractères' },
        { status: 400 }
      )
    }

    if (data.objectif && (data.objectif < 100 || data.objectif > 1000000)) {
      return NextResponse.json(
        { error: 'L\'objectif doit être entre 100€ et 1 000 000€' },
        { status: 400 }
      )
    }

    // ✅ Mettre à jour le projet
    const updateData = {}
    
    if (data.titre !== undefined) updateData.titre = data.titre.trim()
    if (data.description !== undefined) updateData.description = data.description.trim()
    if (data.objectif !== undefined) updateData.objectif = parseInt(data.objectif)
    if (data.image !== undefined) updateData.image = data.image
    if (data.theme !== undefined) updateData.theme = data.theme
    if (data.alaune !== undefined) updateData.alaune = data.alaune
    if (data.ordre !== undefined) updateData.ordre = data.ordre
    if (data.actif !== undefined) updateData.actif = data.actif

    const projet = await prisma.projet.update({
      where: { id: projetId },
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
export async function DELETE(request, { params }) {
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

    const { projetId } = await params

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