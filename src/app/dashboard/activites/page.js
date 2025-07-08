// ============================================================================
// src/app/dashboard/activites/page.js - Page serveur gestion activités
// ============================================================================
import { redirect } from 'next/navigation'
import { getServerAuth, hasPermission } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'
import ActivitesDashboardClient from './ActivitesDashboardClient'

export const dynamic = 'force-dynamic'

/**
 * Charge les données des activités et sections
 */
async function getActivitesData(paroisseId) {
  try {
    console.log('🔍 Chargement données activités pour:', paroisseId)

    // ✅ Charger les sections avec leurs activités
    const sections = await prisma.section.findMany({
      where: { 
        paroisseId,
        actif: true 
      },
      include: {
        activites: {
          where: { actif: true },
          orderBy: { ordre: 'asc' }
        }
      },
      orderBy: { ordre: 'asc' }
    })

    // ✅ Charger toutes les activités pour les stats
    const totalActivites = await prisma.activite.count({
      where: {
        paroisseId,
        actif: true
      }
    })

    // ✅ Sérialiser toutes les données
    const data = {
      sections: sections.map(section => ({
        id: String(section.id),
        nom: String(section.nom),
        titre: String(section.titre),
        description: section.description ? String(section.description) : null,
        couleur: section.couleur ? String(section.couleur) : '#6B7280',
        icone: section.icone ? String(section.icone) : 'Users',
        image: section.image ? String(section.image) : null,
        ordre: Number(section.ordre || 0),
        paroisseId: String(section.paroisseId),
        contenu: section.contenu ? section.contenu : null,
        activites: section.activites.map(activite => ({
          id: String(activite.id),
          titre: String(activite.titre),
          description: activite.description ? String(activite.description) : null,
          image: activite.image ? String(activite.image) : null,
          horaires: activite.horaires ? String(activite.horaires) : null,
          lieu: activite.lieu ? String(activite.lieu) : null,
          ageMin: activite.ageMin ? Number(activite.ageMin) : null,
          ageMax: activite.ageMax ? Number(activite.ageMax) : null,
          contact: activite.contact ? String(activite.contact) : null,
          responsable: activite.responsable ? String(activite.responsable) : null,
          infosComplementaires: activite.infosComplementaires ? String(activite.infosComplementaires) : null,
          ordre: Number(activite.ordre || 0),
          createdAt: activite.createdAt.toISOString()
        })),
        createdAt: section.createdAt.toISOString()
      })),
      
      stats: {
        totalSections: sections.length,
        totalActivites: Number(totalActivites),
        sectionsAvecActivites: sections.filter(s => s.activites.length > 0).length,
        sectionsSansActivites: sections.filter(s => s.activites.length === 0).length
      }
    }

    console.log('✅ Données activités chargées:', {
      sections: data.sections.length,
      totalActivites: data.stats.totalActivites
    })

    return data

  } catch (error) {
    console.error('❌ Erreur chargement données activités:', error)
    return {
      sections: [],
      stats: {
        totalSections: 0,
        totalActivites: 0,
        sectionsAvecActivites: 0,
        sectionsSansActivites: 0
      }
    }
  }
}

export default async function ActivitesDashboardPage() {
  try {
    console.log('🚀 Chargement page dashboard activités')

    // ✅ Authentification côté serveur
    const user = await getServerAuth()
    
    if (!user) {
      redirect('/login')
    }

    if (!user.paroisseId) {
      redirect('/onboarding')
    }

    // ✅ Vérifier les permissions pour la gestion des activités
    if (!hasPermission(user, 'activites', 'read')) {
      redirect('/dashboard?error=permission-denied')
    }

    console.log('✅ Utilisateur authentifié:', user.email, 'role:', user.role)

    // ✅ Charger les données des activités
    const activitesData = await getActivitesData(user.paroisseId)

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

    console.log('✅ Rendu de la page dashboard activités')

    // ✅ Passer les données sérialisées au composant client
    return (
      <ActivitesDashboardClient 
        user={userSerialized}
        initialData={activitesData}
      />
    )

  } catch (error) {
    console.error('❌ Erreur page dashboard activités:', error)
    redirect('/dashboard?error=activites-load-failed')
  }
}

export async function generateMetadata() {
  return {
    title: 'Gestion des Activités - Dashboard',
    description: 'Gérez les sections et activités de votre paroisse'
  }
}