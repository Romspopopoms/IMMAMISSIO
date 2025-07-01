// ============================================================================
// src/app/dashboard/activites/sections/page.js - Page serveur
// ============================================================================
import { redirect } from 'next/navigation'
import { getServerAuth, hasPermission } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import SectionsManagementClient from './SectionsManagementClient'

export default async function SectionsManagementPage() {
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
    const [sections, stats] = await Promise.all([
      // Sections avec leurs activités
      prisma.section.findMany({
        where: {
          paroisseId: user.paroisseId
        },
        include: {
          activites: {
            where: { actif: true },
            orderBy: { ordre: 'asc' }
          }
        },
        orderBy: { ordre: 'asc' }
      }),

      // Statistiques
      prisma.section.aggregate({
        where: {
          paroisseId: user.paroisseId
        },
        _count: {
          id: true
        }
      })
    ])

    // ✅ Calculer les stats détaillées
    const sectionsAvecActivites = sections.filter(s => s.activites.length > 0).length
    const totalActivites = sections.reduce((acc, s) => acc + s.activites.length, 0)

    const statsData = {
      totalSections: stats._count.id,
      sectionsAvecActivites,
      sectionsSansActivites: stats._count.id - sectionsAvecActivites,
      totalActivites
    }

    return (
      <SectionsManagementClient 
        user={user}
        initialData={{
          sections,
          stats: statsData
        }}
      />
    )
  } catch (error) {
    console.error('Erreur chargement sections:', error)
    redirect('/dashboard')
  }
}