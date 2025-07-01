// ============================================================================
// src/app/api/settings/paroisse/route.js - API pour sauvegarder les infos de contact
// ============================================================================
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getServerAuth } from '../../../../lib/auth'

export async function PUT(request) {
  try {
    // Vérifier l'authentification
    const user = await getServerAuth()
    
    if (!user || !user.paroisseId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier les permissions
    if (!['CURE', 'PAROISSE_ADMIN', 'PRETRE'].includes(user.role)) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
    }

    // Récupérer les données du body
    const { adresse, ville, codePostal, telephone, email } = await request.json()

    // Mettre à jour les informations de contact de la paroisse
    const updatedParoisse = await prisma.paroisse.update({
      where: { id: user.paroisseId },
      data: {
        adresse: String(adresse || ''),
        ville: String(ville || ''),
        codePostal: String(codePostal || ''),
        telephone: String(telephone || ''),
        email: String(email || '')
      }
    })

    return NextResponse.json({ 
      message: 'Informations de contact mises à jour avec succès',
      paroisse: {
        id: updatedParoisse.id,
        adresse: updatedParoisse.adresse,
        ville: updatedParoisse.ville,
        codePostal: updatedParoisse.codePostal,
        telephone: updatedParoisse.telephone,
        email: updatedParoisse.email
      }
    })
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour des informations de contact:', error)
    return NextResponse.json({ 
      error: 'Erreur serveur lors de la sauvegarde' 
    }, { status: 500 })
  }
}