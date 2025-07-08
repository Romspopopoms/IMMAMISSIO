// ============================================================================
// src/app/dashboard/pastorale/membres/page.js - Page serveur
// ============================================================================
import { redirect } from 'next/navigation'
import { getServerAuth, hasPermission } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import MembresManagementClient from './MembresManagementClient'

export const dynamic = 'force-dynamic'

/**
 * Charge les membres avec leurs relations
 */
async function getMembresData(paroisseId) {
  try {
    console.log('🔍 Chargement membres pour:', paroisseId)

    // ✅ Charger les membres avec leurs relations
    const membres = await prisma.membre.findMany({
      where: { 
        paroisseId,
        actif: true 
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        },
        appartenances: {
          include: {
            conseil: {
              select: {
                id: true,
                nom: true,
                type: true
              }
            }
          }
        },
        responsabilites: {
          include: {
            secteur: {
              select: {
                id: true,
                nom: true,
                couleur: true,
                icone: true
              }
            }
          }
        }
      },
      orderBy: { nom: 'asc' }
    })

    // ✅ Charger les conseils disponibles
    const conseils = await prisma.conseil.findMany({
      where: {
        paroisseId,
        actif: true
      },
      select: {
        id: true,
        nom: true,
        type: true,
        description: true
      },
      orderBy: { ordre: 'asc' }
    })

    // ✅ Charger les secteurs disponibles
    const secteurs = await prisma.secteur.findMany({
      where: {
        paroisseId,
        actif: true
      },
      select: {
        id: true,
        nom: true,
        couleur: true,
        icone: true,
        description: true
      },
      orderBy: { ordre: 'asc' }
    })

    // ✅ Sérialiser toutes les données
    const data = {
      membres: membres.map(membre => ({
        id: String(membre.id),
        nom: String(membre.nom || ''),
        prenom: membre.prenom ? String(membre.prenom) : null,
        email: String(membre.email || ''),
        telephone: membre.telephone ? String(membre.telephone) : null,
        photo: membre.photo ? String(membre.photo) : null,
        userId: membre.userId ? String(membre.userId) : null,
        user: membre.user ? {
          id: String(membre.user.id),
          email: String(membre.user.email),
          role: String(membre.user.role)
        } : null,
        appartenances: membre.appartenances.map(app => ({
          id: String(app.id),
          fonction: String(app.fonction || 'Membre'),
          conseil: {
            id: String(app.conseil.id),
            nom: String(app.conseil.nom),
            type: String(app.conseil.type)
          }
        })),
        responsabilites: membre.responsabilites.map(resp => ({
          id: String(resp.id),
          fonction: String(resp.fonction || 'Responsable'),
          secteur: {
            id: String(resp.secteur.id),
            nom: String(resp.secteur.nom),
            couleur: String(resp.secteur.couleur || '#6B7280'),
            icone: String(resp.secteur.icone || 'Users')
          }
        })),
        createdAt: membre.createdAt.toISOString()
      })),
      
      conseilsDisponibles: conseils.map(conseil => ({
        id: String(conseil.id),
        nom: String(conseil.nom),
        type: String(conseil.type),
        description: conseil.description ? String(conseil.description) : null
      })),

      secteursDisponibles: secteurs.map(secteur => ({
        id: String(secteur.id),
        nom: String(secteur.nom),
        couleur: String(secteur.couleur || '#6B7280'),
        icone: String(secteur.icone || 'Users'),
        description: secteur.description ? String(secteur.description) : null
      }))
    }

    console.log('✅ Membres chargés:', data.membres.length)
    return data

  } catch (error) {
    console.error('❌ Erreur chargement membres:', error)
    return {
      membres: [],
      conseilsDisponibles: [],
      secteursDisponibles: []
    }
  }
}

export default async function MembresManagementPage() {
  try {
    console.log('🚀 Chargement page gestion membres')

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

    // ✅ Charger les données des membres
    const membresData = await getMembresData(user.paroisseId)

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

    console.log('✅ Rendu de la page gestion membres')

    // ✅ Passer les données sérialisées au composant client
    return (
      <MembresManagementClient 
        user={userSerialized}
        initialData={membresData}
      />
    )

  } catch (error) {
    console.error('❌ Erreur page gestion membres:', error)
    redirect('/dashboard/pastorale?error=membres-load-failed')
  }
}

export async function generateMetadata() {
  return {
    title: 'Gestion des Membres - Dashboard',
    description: 'Gérez les membres laïcs de votre paroisse'
  }
}