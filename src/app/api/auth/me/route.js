// ============================================================================
// FICHIER 4 : src/app/api/auth/me/route.js - Vérifier l'auth
// ============================================================================
import { NextResponse } from 'next/server'
import { getServerAuth } from '../../../../lib/auth'

export async function GET() {
  try {
    const user = await getServerAuth()
    
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Préparer les données utilisateur (sans le password)
    const userData = {
      id: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      paroisseId: user.paroisseId,
      paroisse: user.paroisse,
      permissions: user.permissions
    }

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error('Erreur vérification auth:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}