// ============================================================================
// FICHIER 1 : src/app/dashboard/dons/themes/page.js - Page serveur sécurisée
// ============================================================================
import { redirect } from 'next/navigation'
import { getServerAuth, hasPermission } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import ThemesManagementClient from './ThemesManagementClient'

// Fonction pour charger les thèmes avec leurs statistiques
async function getThemesWithStats(paroisseId) {
  try {
    const paroisse = await prisma.paroisse.findUnique({
      where: { id: paroisseId },
      select: {
        configSite: true
      }
    })

    if (!paroisse?.configSite?.donThemes) {
      return []
    }

    const themes = paroisse.configSite.donThemes
    
    // ✅ Ajouter les statistiques pour chaque thème
    const themesWithStats = await Promise.all(
      themes.map(async (theme) => {
        const fieldName = `projets${theme.id.charAt(0).toUpperCase() + theme.id.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())}`
        const projets = paroisse.configSite[fieldName] || []
        
        // ✅ Compter les projets en base aussi pour ce thème
        const projetsDBCount = await prisma.projet.count({
          where: {
            paroisseId: paroisseId,
            theme: theme.id,
            actif: true
          }
        })

        return {
          ...theme,
          nombreProjets: projets.length + projetsDBCount,
          projetsConfig: projets.length,
          projetsDB: projetsDBCount
        }
      })
    )

    return themesWithStats
  } catch (error) {
    console.error('Erreur chargement thèmes:', error)
    return []
  }
}

export default async function ThemesManagementPage() {
  // ✅ Authentification avec le nouveau système
  const user = await getServerAuth()
  
  if (!user) {
    redirect('/login')
  }

  // ✅ Vérifier les permissions
  if (!hasPermission(user, 'dons', 'write')) {
    redirect('/dashboard/dons?error=permission-denied')
  }

  // ✅ Charger les données côté serveur
  const themes = await getThemesWithStats(user.paroisseId)

  // ✅ Passer les données au composant client
  return <ThemesManagementClient initialThemes={themes} user={user} />
}

export async function generateMetadata() {
  return {
    title: 'Gestion des Thématiques - Dashboard',
    description: 'Gérez les thématiques de vos projets de collecte de fonds'
  }
}
