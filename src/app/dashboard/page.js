// ============================================================================
// src/app/dashboard/page.js - Page serveur
// ============================================================================
import { redirect } from 'next/navigation'
import { getServerAuth } from '../../lib/auth'
import { prisma } from '../../lib/prisma'
import DashboardClient from './DashboardClient'

/**
 * Charge les statistiques de la paroisse
 */
async function getDashboardStats(paroisseId) {
  try {
    console.log('🔍 Chargement des stats pour:', paroisseId)

    // ✅ Statistiques des actualités
    const actualitesCount = await prisma.actualite.count({
      where: {
        paroisseId: paroisseId,
        publiee: true
      }
    })

    // ✅ Statistiques des événements à venir
    const now = new Date()
    const evenementsCount = await prisma.evenement.count({
      where: {
        paroisseId: paroisseId,
        dateDebut: {
          gte: now
        }
      }
    })

    // ✅ Statistiques des projets de dons
    const projetsCount = await prisma.projet.count({
      where: {
        paroisseId: paroisseId,
        actif: true
      }
    })

    // ✅ Statistiques des dons
    // D'abord récupérer les projets de la paroisse avec leurs objectifs
    const projetsParoisse = await prisma.projet.findMany({
      where: {
        paroisseId: paroisseId,
        actif: true
      },
      select: {
        id: true,
        objectif: true
      }
    })

    const projetIdsArray = projetsParoisse.map(p => p.id)

    // Ensuite calculer les stats des dons pour ces projets
    const donStats = projetIdsArray.length > 0 ? await prisma.don.aggregate({
      where: {
        projetId: {
          in: projetIdsArray
        },
        statut: 'complete'
      },
      _sum: {
        montant: true
      },
      _count: {
        id: true
      }
    }) : { _sum: { montant: 0 }, _count: 0 }

    // ✅ Compter les objectifs atteints
    const objectifsAtteints = projetIdsArray.length > 0 ? await Promise.all(
      projetsParoisse.map(async (projet) => {
        const donProjet = await prisma.don.aggregate({
          where: {
            projetId: projet.id,
            statut: 'complete'
          },
          _sum: {
            montant: true
          }
        })
        const collecte = donProjet._sum.montant || 0
        return collecte >= projet.objectif
      })
    ).then(results => results.filter(Boolean).length) : 0

    const stats = {
      actualites: Number(actualitesCount),
      evenements: Number(evenementsCount),
      projets: Number(projetsCount),
      totalDons: Number(donStats._sum.montant || 0),
      objectifsAtteints: Number(objectifsAtteints),
      nombreDons: Number(donStats._count || 0)
    }

    console.log('✅ Stats chargées:', stats)
    return stats

  } catch (error) {
    console.error('❌ Erreur chargement stats:', error)
    return {
      actualites: 0,
      evenements: 0,
      projets: 0,
      totalDons: 0,
      objectifsAtteints: 0,
      nombreDons: 0
    }
  }
}

export default async function DashboardPage() {
  try {
    console.log('🚀 Chargement du dashboard')

    // ✅ Authentification côté serveur
    const user = await getServerAuth()
    
    if (!user) {
      redirect('/login')
    }

    if (!user.paroisseId) {
      redirect('/onboarding')
    }

    console.log('✅ Utilisateur authentifié:', user.email)

    // ✅ Charger les statistiques
    const stats = await getDashboardStats(user.paroisseId)

    // ✅ Sérialiser l'objet user pour le composant client
    const userSerialized = {
      id: String(user.id),
      email: String(user.email || ''),
      role: String(user.role || 'PAROISSIEN'),
      nom: user.nom ? String(user.nom) : null,
      prenom: user.prenom ? String(user.prenom) : null,
      paroisseId: user.paroisseId ? String(user.paroisseId) : null,
      paroisse: user.paroisse ? {
        id: String(user.paroisse.id),
        nom: String(user.paroisse.nom || ''),
        subdomain: user.paroisse.subdomain ? String(user.paroisse.subdomain) : null
      } : null
    }

    console.log('✅ Rendu du dashboard avec:', {
      stats,
      userSerialized: true
    })

    // ✅ Passer les données sérialisées au composant client
    return (
      <DashboardClient 
        user={userSerialized}
        initialStats={stats}
      />
    )

  } catch (error) {
    console.error('❌ Erreur dashboard:', error)
    
    // ✅ Fallback en cas d'erreur
    const user = await getServerAuth()
    const userSerialized = user ? {
      id: String(user.id),
      email: String(user.email || ''),
      role: String(user.role || 'PAROISSIEN'),
      nom: user.nom ? String(user.nom) : null,
      prenom: user.prenom ? String(user.prenom) : null,
      paroisseId: user.paroisseId ? String(user.paroisseId) : null,
      paroisse: user.paroisse ? {
        id: String(user.paroisse.id),
        nom: String(user.paroisse.nom || ''),
        subdomain: user.paroisse.subdomain ? String(user.paroisse.subdomain) : null
      } : null
    } : null

    return (
      <DashboardClient 
        user={userSerialized}
        initialStats={{
          actualites: 0,
          evenements: 0,
          projets: 0,
          totalDons: 0,
          objectifsAtteints: 0,
          nombreDons: 0
        }}
      />
    )
  }
}

export async function generateMetadata() {
  return {
    title: 'Dashboard - ImaMissio',
    description: 'Tableau de bord de gestion de votre paroisse'
  }
}