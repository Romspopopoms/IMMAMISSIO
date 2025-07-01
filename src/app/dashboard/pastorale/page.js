// ============================================================================
// src/app/dashboard/pastorale/page.js - Page serveur corrigée
// ============================================================================
import { redirect } from 'next/navigation'
import { getServerAuth, hasPermission } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'
import PastoraleClient from './PastoraleClient'

/**
 * Charge les données pastorales
 */
async function getPastoraleData(paroisseId) {
  try {
    console.log('🔍 Chargement données pastorales pour:', paroisseId)

    // ✅ Charger les prêtres depuis la table Pretre
    const pretres = await prisma.pretre.findMany({
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
        }
      },
      orderBy: [
        { fonction: 'asc' }, // Curé en premier
        { nom: 'asc' }
      ]
    })

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
                email: true
              }
            }
          }
        }
      },
      orderBy: { ordre: 'asc' }
    })

    // ✅ Charger les conseils avec membres (corriger le nom de table)
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
                telephone: true
              }
            }
          }
        }
      },
      orderBy: { ordre: 'asc' }
    })

    // ✅ Charger tous les membres (pour les stats)
    const membres = await prisma.membre.findMany({
      where: {
        paroisseId,
        actif: true
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true
      }
    })

    // ✅ Sérialiser toutes les données
    const data = {
      pretres: pretres.map(pretre => ({
        id: String(pretre.id),
        nom: String(pretre.nom || ''),
        prenom: pretre.prenom ? String(pretre.prenom) : null,
        email: String(pretre.email || ''),
        telephone: pretre.telephone ? String(pretre.telephone) : null,
        fonction: String(pretre.fonction), // Fonction depuis la table Pretre
        photo: pretre.photo ? String(pretre.photo) : null,
        bio: pretre.bio ? String(pretre.bio) : null,
        createdAt: pretre.createdAt.toISOString(),
        userId: pretre.userId ? String(pretre.userId) : null // Peut être null
      })),
      
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
            email: String(resp.membre.email || '')
          }
        })),
        createdAt: secteur.createdAt.toISOString()
      })),
      
      conseils: conseils.map(conseil => ({
        id: String(conseil.id),
        nom: String(conseil.nom),
        description: conseil.description ? String(conseil.description) : null,
        type: String(conseil.type),
        paroisseId: String(conseil.paroisseId),
        membres: conseil.membres.map(membreConseil => ({
          id: String(membreConseil.id),
          fonction: String(membreConseil.fonction || 'Membre'),
          membre: {
            id: String(membreConseil.membre.id),
            nom: String(membreConseil.membre.nom || ''),
            prenom: membreConseil.membre.prenom ? String(membreConseil.membre.prenom) : null,
            email: String(membreConseil.membre.email || ''),
            telephone: membreConseil.membre.telephone ? String(membreConseil.membre.telephone) : null
          }
        })),
        createdAt: conseil.createdAt.toISOString()
      })),
      
      membres: membres.map(membre => ({
        id: String(membre.id),
        nom: String(membre.nom || ''),
        prenom: membre.prenom ? String(membre.prenom) : null,
        email: String(membre.email || '')
      }))
    }

    console.log('✅ Données pastorales chargées:', {
      pretres: data.pretres.length,
      secteurs: data.secteurs.length,
      conseils: data.conseils.length,
      membres: data.membres.length
    })

    return data

  } catch (error) {
    console.error('❌ Erreur chargement données pastorales:', error)
    return {
      pretres: [],
      secteurs: [],
      conseils: [],
      membres: []
    }
  }
}

export default async function PastoralePage() {
  try {
    console.log('🚀 Chargement page pastorale')

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
      redirect('/dashboard?error=permission-denied')
    }

    console.log('✅ Utilisateur authentifié:', user.email, 'role:', user.role)

    // ✅ Charger les données pastorales
    const pastoraleData = await getPastoraleData(user.paroisseId)

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

    console.log('✅ Rendu de la page pastorale avec', pastoraleData.pretres.length, 'prêtres')

    // ✅ Passer les données sérialisées au composant client
    return (
      <PastoraleClient 
        user={userSerialized}
        initialData={pastoraleData}
      />
    )

  } catch (error) {
    console.error('❌ Erreur page pastorale:', error)
    redirect('/dashboard?error=pastorale-load-failed')
  }
}

export async function generateMetadata() {
  return {
    title: 'Gestion Pastorale - Dashboard',
    description: 'Gérez les secteurs, prêtres et conseil paroissial'
  }
}