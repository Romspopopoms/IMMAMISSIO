// ============================================================================
// src/app/dashboard/pastorale/conseils/page.js - Page serveur
// ============================================================================
import { redirect } from 'next/navigation'
import { getServerAuth, hasPermission } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import ConseilsManagementClient from './ConseilsManagementClient'

export const dynamic = 'force-dynamic'

/**
 * Charge les conseils avec leurs membres
 */
async function getConseilsData(paroisseId) {
  try {
    console.log('🔍 Chargement conseils pour:', paroisseId)

    // ✅ Charger les conseils avec leurs membres
    const conseils = await prisma.conseil.findMany({
      where: { 
        paroisseId,
        actif: true 
      },
      include: {
        membres: {
          include: {
            membre: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
                telephone: true,
                photo: true
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
      conseils: conseils.map(conseil => ({
        id: String(conseil.id),
        nom: String(conseil.nom),
        description: conseil.description ? String(conseil.description) : null,
        type: String(conseil.type),
        ordre: Number(conseil.ordre || 0),
        paroisseId: String(conseil.paroisseId),
        membres: conseil.membres.map(memb => ({
          id: String(memb.id),
          fonction: String(memb.fonction),
          membre: {
            id: String(memb.membre.id),
            nom: String(memb.membre.nom || ''),
            prenom: memb.membre.prenom ? String(memb.membre.prenom) : null,
            email: String(memb.membre.email || ''),
            telephone: memb.membre.telephone ? String(memb.membre.telephone) : null,
            photo: memb.membre.photo ? String(memb.membre.photo) : null
          }
        })),
        createdAt: conseil.createdAt.toISOString()
      })),
      
      membresDisponibles: membresDisponibles.map(membre => ({
        id: String(membre.id),
        nom: String(membre.nom || ''),
        prenom: membre.prenom ? String(membre.prenom) : null,
        email: String(membre.email || ''),
        nomComplet: `${membre.prenom || ''} ${membre.nom}`.trim()
      }))
    }

    console.log('✅ Conseils chargés:', data.conseils.length)
    return data

  } catch (error) {
    console.error('❌ Erreur chargement conseils:', error)
    return {
      conseils: [],
      membresDisponibles: []
    }
  }
}

export default async function ConseilsManagementPage() {
  try {
    console.log('🚀 Chargement page gestion conseils')

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

    // ✅ Charger les données des conseils
    const conseilsData = await getConseilsData(user.paroisseId)

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

    console.log('✅ Rendu de la page gestion conseils')

    // ✅ Passer les données sérialisées au composant client
    return (
      <ConseilsManagementClient 
        user={userSerialized}
        initialData={conseilsData}
      />
    )

  } catch (error) {
    console.error('❌ Erreur page gestion conseils:', error)
    redirect('/dashboard/pastorale?error=conseils-load-failed')
  }
}

export async function generateMetadata() {
  return {
    title: 'Gestion des Conseils - Dashboard',
    description: 'Gérez les conseils paroissiaux de votre paroisse'
  }
}