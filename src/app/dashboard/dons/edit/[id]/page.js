// ============================================================================
// src/app/dashboard/dons/edit/[id]/page.js - Page serveur
// ============================================================================
import { redirect } from 'next/navigation'
import { getServerAuth, hasPermission } from '../../../../../lib/auth'
import EditProjectClient from './EditProjectClient'

export default async function EditProjectPage({ params }) {
  try {
    // ✅ Authentification côté serveur
    const user = await getServerAuth()
    
    if (!user) {
      redirect('/login')
    }

    // ✅ Vérifier les permissions
    if (!hasPermission(user, 'dons', 'write')) {
      redirect('/dashboard/dons?error=permission-denied')
    }

    if (!user.paroisseId) {
      redirect('/dashboard?error=no-paroisse')
    }

    // ✅ Récupérer l'ID du projet de manière sécurisée
    const resolvedParams = await params
    const projectId = String(resolvedParams.id)

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

    // ✅ Passer les données sérialisées au composant client
    return (
      <EditProjectClient 
        projectId={projectId}
        user={userSerialized}
      />
    )

  } catch (error) {
    console.error('❌ Erreur page edit projet:', error)
    redirect('/dashboard/dons?error=load-failed')
  }
}

export async function generateMetadata({ params }) {
  return {
    title: 'Éditer le projet - Dashboard',
    description: 'Modifier les informations de votre projet de collecte'
  }
}