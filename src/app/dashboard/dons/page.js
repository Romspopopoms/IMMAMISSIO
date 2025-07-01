// ============================================================================
// src/app/dashboard/dons/page.js - Version corrigée avec sérialisation complète
// ============================================================================
import { redirect } from 'next/navigation'
import { getServerAuth, hasPermission } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'
import DashboardDonsClient from './DashboardDonsClient'

/**
 * Charge tous les projets avec leurs statistiques de dons
 */
async function getProjectsWithStats(paroisseId) {
  try {
    console.log('🔍 Chargement des projets pour la paroisse:', paroisseId)

    // ✅ 1. Charger tous les projets de la base de données
    const projetsDB = await prisma.projet.findMany({
      where: {
        paroisseId: paroisseId,
        actif: true
      },
      orderBy: [
        { alaune: 'desc' },
        { ordre: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    console.log('📊 Projets trouvés en DB:', projetsDB.length)

    // ✅ 2. Calculer les stats pour chaque projet de manière optimisée
    const projetsWithStats = await Promise.all(
      projetsDB.map(async (projet) => {
        try {
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

          // ✅ CORRECTION : Sérialisation complète manuelle
          return {
            id: String(projet.id),
            titre: String(projet.titre || ''),
            description: String(projet.description || ''),
            objectif: Number(projet.objectif || 0),
            image: projet.image ? String(projet.image) : null,
            theme: String(projet.theme || 'general'),
            alaune: Boolean(projet.alaune),
            actif: Boolean(projet.actif),
            ordre: Number(projet.ordre || 0),
            createdAt: projet.createdAt ? projet.createdAt.toISOString() : null,
            updatedAt: projet.updatedAt ? projet.updatedAt.toISOString() : null,
            source: 'database',
            themeName: getThemeName(projet.theme),
            collecte: Number(donStats._sum.montant || 0),
            nombreDonateurs: Number(donStats._count || 0)
          }
        } catch (error) {
          console.error('❌ Erreur stats pour projet:', projet.id, error)
          // ✅ Fallback sérialisé aussi
          return {
            id: String(projet.id),
            titre: String(projet.titre || ''),
            description: String(projet.description || ''),
            objectif: Number(projet.objectif || 0),
            image: projet.image ? String(projet.image) : null,
            theme: String(projet.theme || 'general'),
            alaune: Boolean(projet.alaune),
            actif: Boolean(projet.actif),
            ordre: Number(projet.ordre || 0),
            createdAt: projet.createdAt ? projet.createdAt.toISOString() : null,
            updatedAt: projet.updatedAt ? projet.updatedAt.toISOString() : null,
            source: 'database',
            themeName: getThemeName(projet.theme),
            collecte: 0,
            nombreDonateurs: 0
          }
        }
      })
    )

    // ✅ 3. Charger les thèmes disponibles
    const paroisse = await prisma.paroisse.findUnique({
      where: { id: paroisseId },
      select: { configSite: true }
    })

    const configSite = paroisse?.configSite || {}
    const themesData = configSite.donThemes || []

    // ✅ 4. Sérialiser les thèmes aussi
    const themesSerialised = themesData.map(theme => ({
      id: String(theme.id || ''),
      label: String(theme.label || ''),
      icon: String(theme.icon || 'Heart'),
      image: theme.image ? String(theme.image) : null
    }))

    // ✅ 5. Calculer les statistiques globales
    const stats = calculateGlobalStats(projetsWithStats)

    console.log('✅ Données chargées avec succès:', {
      projets: projetsWithStats.length,
      themes: themesSerialised.length,
      stats
    })

    return {
      projets: projetsWithStats,
      themes: themesSerialised,
      stats
    }

  } catch (error) {
    console.error('❌ Erreur chargement projets:', error)
    return { 
      projets: [], 
      themes: [], 
      stats: { totalCollecte: 0, nombreProjets: 0, objectifsAtteints: 0, donateursTotal: 0 } 
    }
  }
}

/**
 * Obtient le nom d'un thème à partir de son ID
 */
function getThemeName(themeId) {
  const defaultThemes = {
    'une': 'À la une',
    'vie-paroissiale': 'Vie paroissiale',
    'charite': 'Charité',
    'patrimoine': 'Patrimoine',
    'jeunesse': 'Jeunesse',
    'missions': 'Missions',
    'liturgie': 'Liturgie'
  }
  
  return defaultThemes[themeId] || themeId
}

/**
 * Calcule les statistiques globales
 */
function calculateGlobalStats(projets) {
  const totalCollecte = projets.reduce((acc, p) => acc + (p.collecte || 0), 0)
  const nombreProjets = projets.length
  const objectifsAtteints = projets.filter(p => (p.collecte || 0) >= p.objectif).length
  
  // Calculer les donateurs uniques (approximation)
  const donateursTotal = projets.reduce((acc, p) => acc + (p.nombreDonateurs || 0), 0)

  return {
    totalCollecte: Number(totalCollecte),
    nombreProjets: Number(nombreProjets),
    objectifsAtteints: Number(objectifsAtteints),
    donateursTotal: Number(donateursTotal)
  }
}

export default async function DashboardDonsPage(props) {
  try {
    console.log('🚀 Chargement de la page Dashboard Dons')

    // ✅ Authentification
    const user = await getServerAuth()
    
    if (!user) {
      console.log('❌ Utilisateur non authentifié')
      redirect('/login')
    }

    console.log('✅ Utilisateur authentifié:', user.email)

    // ✅ Vérification des permissions
    if (!hasPermission(user, 'dons', 'read')) {
      console.log('❌ Permissions insuffisantes pour les dons')
      redirect('/dashboard?error=permission-denied')
    }

    if (!user.paroisseId) {
      console.log('❌ Utilisateur sans paroisse')
      redirect('/dashboard?error=no-paroisse')
    }

    // ✅ Récupérer les search params de manière compatible
    const searchParams = props.searchParams
    let resolvedSearchParams = searchParams
    
    // Si searchParams est une Promise (Next.js 15), l'attendre
    if (searchParams && typeof searchParams.then === 'function') {
      resolvedSearchParams = await searchParams
    }

    const successMessage = resolvedSearchParams?.success || null

    console.log('📋 Message de succès:', successMessage)

    // ✅ Charger toutes les données
    const { projets, themes, stats } = await getProjectsWithStats(user.paroisseId)

    // ✅ CORRECTION CRITIQUE : Sérialiser l'objet user complètement
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

    console.log('✅ Rendu du composant client avec:', {
      projets: projets.length,
      themes: themes.length,
      stats,
      successMessage,
      userSerialized: true
    })

    // ✅ Passer toutes les données sérialisées au composant client
    return (
      <DashboardDonsClient 
        initialProjets={projets}
        initialThemes={themes}
        initialStats={stats}
        successMessage={successMessage}
        user={userSerialized}
      />
    )

  } catch (error) {
    console.error('❌ Erreur fatale dans DashboardDonsPage:', error)
    
    // ✅ Fallback en cas d'erreur avec user sérialisé
    let fallbackUser = null
    try {
      const user = await getServerAuth()
      if (user) {
        fallbackUser = {
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
      }
    } catch (authError) {
      console.error('❌ Erreur auth dans fallback:', authError)
    }

    return (
      <DashboardDonsClient 
        initialProjets={[]}
        initialThemes={[]}
        initialStats={{ totalCollecte: 0, nombreProjets: 0, objectifsAtteints: 0, donateursTotal: 0 }}
        successMessage={null}
        user={fallbackUser}
      />
    )
  }
}

export async function generateMetadata() {
  return {
    title: 'Gestion des Dons - Dashboard',
    description: 'Gérez vos projets de collecte de fonds'
  }
}