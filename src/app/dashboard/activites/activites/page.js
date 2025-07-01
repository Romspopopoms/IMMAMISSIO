// ============================================================================
// src/app/dashboard/activites/activites/page.js - Page serveur
// ============================================================================
import { redirect } from 'next/navigation'
import { getServerAuth, hasPermission } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import ActivitesManagementClient from './ActivitesManagementClient'

export default async function ActivitesManagementPage() {
  // ✅ Vérifier l'authentification
  const user = await getServerAuth()
  if (!user) {
    redirect('/login')
  }

  // ✅ Vérifier les permissions
  if (!hasPermission(user, 'activites', 'write')) {
    redirect('/dashboard')
  }

  try {
    // ✅ Charger les données
    const [activites, sections, stats] = await Promise.all([
      // Activités avec leur section
      prisma.activite.findMany({
        where: {
          paroisseId: user.paroisseId
        },
        include: {
          section: {
            select: {
              id: true,
              nom: true,
              titre: true,
              couleur: true,
              icone: true
            }
          }
        },
        orderBy: [
          { section: { ordre: 'asc' } },
          { ordre: 'asc' },
          { titre: 'asc' }
        ]
      }),

      // Sections disponibles
      prisma.section.findMany({
        where: {
          paroisseId: user.paroisseId
        },
        orderBy: { ordre: 'asc' }
      }),

      // Statistiques
      prisma.activite.aggregate({
        where: {
          paroisseId: user.paroisseId,
          actif: true
        },
        _count: {
          id: true
        }
      })
    ])

    // ✅ Calculer les stats détaillées
    const activitesParSection = {}
    activites.forEach(activite => {
      const sectionNom = activite.section.nom
      if (!activitesParSection[sectionNom]) {
        activitesParSection[sectionNom] = 0
      }
      activitesParSection[sectionNom]++
    })

    const activitesAvecHoraires = activites.filter(a => a.horaires).length
    const activitesAvecResponsable = activites.filter(a => a.responsable).length
    const activitesAvecAges = activites.filter(a => a.ageMin || a.ageMax).length

    const statsData = {
      totalActivites: stats._count.id,
      activitesParSection,
      sectionsAvecActivites: Object.keys(activitesParSection).length,
      activitesAvecHoraires,
      activitesAvecResponsable,
      activitesAvecAges,
      pourcentageComplet: Math.round((activitesAvecResponsable / (stats._count.id || 1)) * 100)
    }

    return (
      <ActivitesManagementClient 
        user={user}
        initialData={{
          activites,
          sections,
          stats: statsData
        }}
      />
    )
  } catch (error) {
    console.error('Erreur chargement activités:', error)
    redirect('/dashboard')
  }
}