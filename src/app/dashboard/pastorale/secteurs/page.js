// ============================================================================
// src/app/dashboard/pastorale/secteurs/page.js - Page serveur
// ============================================================================
import { redirect } from 'next/navigation'
import { getServerAuth, hasPermission } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import SecteursManagementClient from './SecteursManagementClient'

export const dynamic = 'force-dynamic'

/**
 * Charge les secteurs avec leurs responsables
 */
async function getSecteursData(paroisseId) {
  try {
    console.log('🔍 Chargement secteurs pour:', paroisseId)

    // ✅ Charger les secteurs avec responsables
    const secteurs = await prisma.secteur.findMany({
      where: { 
        paroisseId,
        actif: true 
      },
      include: {
        responsables: {
          include: {
            membre: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
                telephone: true
              }
            }
          }
        }
      },
      orderBy: { ordre: 'asc' }
    })

    // ✅ Charger tous les membres disponibles pour assignment
    const membresDisponibles = await prisma.membre.findMany({
      where: {
        paroisseId,
        actif: true
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true
      },
      orderBy: { nom: 'asc' }
    })

    // ✅ Sérialiser toutes les données
    const data = {
      secteurs: secteurs.map(secteur => ({
        id: String(secteur.id),
        nom: String(secteur.nom),
        description: secteur.description ? String(secteur.description) : null,
        couleur: secteur.couleur ? String(secteur.couleur) : '#6B7280',
        icone: secteur.icone ? String(secteur.icone) : 'Users',
        ordre: Number(secteur.ordre || 0),
        paroisseId: String(secteur.paroisseId),
        responsables: secteur.responsables.map(resp => ({
          id: String(resp.id),
          fonction: String(resp.fonction),
          membre: {
            id: String(resp.membre.id),
            nom: String(resp.membre.nom || ''),
            prenom: resp.membre.prenom ? String(resp.membre.prenom) : null,
            email: String(resp.membre.email || ''),
            telephone: resp.membre.telephone ? String(resp.membre.telephone) : null
          }
        })),
        createdAt: secteur.createdAt.toISOString()
      })),
      
      membresDisponibles: membresDisponibles.map(membre => ({
        id: String(membre.id),
        nom: String(membre.nom || ''),
        prenom: membre.prenom ? String(membre.prenom) : null,
        email: String(membre.email || ''),
        nomComplet: `${membre.prenom || ''} ${membre.nom}`.trim()
      }))
    }

    console.log('✅ Secteurs chargés:', data.secteurs.length)
    return data

  } catch (error) {
    console.error('❌ Erreur chargement secteurs:', error)
    return {
      secteurs: [],
      membresDisponibles: []
    }
  }
}

export default async function SecteursManagementPage() {
  try {
    console.log('🚀 Chargement page gestion secteurs')

    // ✅ Authentification côté serveur
    const user = await getServerAuth()
    
    if (!user) {
      redirect('/login')
    }

    if (!user.paroisseId) {
      redirect('/onboarding')
    }

    // ✅ Vérifier les permissions pour la gestion pastorale
    if (!hasPermission(user, 'pastorale', 'read')) {
      redirect('/dashboard/pastorale?error=permission-denied')
    }

    console.log('✅ Utilisateur authentifié:', user.email)

    // ✅ Charger les données des secteurs
    const secteursData = await getSecteursData(user.paroisseId)

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

    console.log('✅ Rendu de la page gestion secteurs')

    // ✅ Passer les données sérialisées au composant client
    return (
      <SecteursManagementClient 
        user={userSerialized}
        initialData={secteursData}
      />
    )

  } catch (error) {
    console.error('❌ Erreur page gestion secteurs:', error)
    redirect('/dashboard/pastorale?error=secteurs-load-failed')
  }
}

export async function generateMetadata() {
  return {
    title: 'Gestion des Secteurs - Dashboard',
    description: 'Gérez les secteurs d\'activités de votre paroisse'
  }
}