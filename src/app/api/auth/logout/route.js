// ============================================================================
// src/app/api/auth/logout/route.js - Logout sécurisé
// ============================================================================
import { NextResponse } from 'next/server'
import { clearAuthCookie } from '../../../../lib/auth'

export async function POST(request) {
  try {
    // ✅ Supprimer le cookie sécurisé
    await clearAuthCookie()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur logout:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    )
  }
}