// ============================================================================
// src/app/api/auth/logout/route.js - Logout sécurisé
// ============================================================================
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    // ✅ Attendre le cookieStore
    const cookieStore = await cookies()
    
    // ✅ Supprimer le cookie
    cookieStore.delete('auth-token')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur logout:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    )
  }
}