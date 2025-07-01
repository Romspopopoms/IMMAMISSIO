// src/lib/stripe-utils.js
import stripe from './stripe'
import { prisma } from './prisma'

export async function processStripePaymentSuccess(sessionId) {
  try {
    // 1. Récupérer la session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    console.log('🔍 Session Stripe récupérée:', {
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      donId: session.metadata?.donId
    })

    if (!session.metadata?.donId) {
      throw new Error('Don ID manquant dans les métadonnées')
    }

    // 2. Récupérer le don
    let don = await prisma.don.findUnique({
      where: { id: session.metadata.donId },
      include: { donateur: true }
    })

    if (!don) {
      throw new Error('Don introuvable')
    }

    // 3. Vérifier et mettre à jour le statut si nécessaire
    if (session.payment_status === 'paid' && session.status === 'complete' && don.statut !== 'complete') {
      console.log('🎯 Validation du don...')
      
      don = await prisma.don.update({
        where: { id: don.id },
        data: {
          statut: 'complete',
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent
        },
        include: { donateur: true }
      })

      console.log('✅ Don validé:', don.id)

      // 4. Recalculer les collectes des projets
      await updateProjectCollections()
    }

    return {
      success: true,
      don,
      message: 'Paiement traité avec succès'
    }

  } catch (error) {
    console.error('❌ Erreur traitement paiement:', error)
    return {
      success: false,
      don: null,
      error: error.message
    }
  }
}

async function updateProjectCollections() {
  try {
    console.log('🔄 Mise à jour des collectes...')
    
    // Récupérer tous les dons validés
    const donsValides = await prisma.don.findMany({
      where: { statut: 'complete' },
      select: { projetId: true, montant: true }
    })

    // Calculer les totaux par projet
    const totauxParProjet = {}
    donsValides.forEach(don => {
      totauxParProjet[don.projetId] = (totauxParProjet[don.projetId] || 0) + don.montant
    })

    console.log('📊 Totaux par projet:', totauxParProjet)

    // Option 1: Mettre à jour les projets en base de données
    const projetsDB = await prisma.projet.findMany({
      where: { actif: true }
    })

    for (const projet of projetsDB) {
      const nouvelleCollecte = totauxParProjet[projet.id] || 0
      if (projet.collecte !== nouvelleCollecte) {
        await prisma.projet.update({
          where: { id: projet.id },
          data: { collecte: nouvelleCollecte }
        })
        console.log(`✅ Projet ${projet.id}: collecte mise à jour (${nouvelleCollecte}€)`)
      }
    }

    // Option 2: Mettre à jour les configurations des paroisses
    // (si tu veux garder la compatibilité avec l'ancien système)
    const paroisses = await prisma.paroisse.findMany({
      where: {
        configSite: { not: null }
      }
    })

    for (const paroisse of paroisses) {
      if (paroisse.configSite?.projetsDons) {
        const configSite = { ...paroisse.configSite }
        let updated = false

        // Mettre à jour projetsDonsUne
        if (configSite.projetsDonsUne) {
          configSite.projetsDonsUne = configSite.projetsDonsUne.map(projet => {
            const nouvelleCollecte = totauxParProjet[projet.id] || 0
            if (projet.collecte !== nouvelleCollecte) {
              updated = true
              return { ...projet, collecte: nouvelleCollecte }
            }
            return projet
          })
        }

        // Mettre à jour les projets thématiques
        const themes = ['vieparoissiale', 'charite', 'projets', 'pelerinage', 'missions', 'quete', 'denier']
        for (const theme of themes) {
          const fieldName = `projets${theme.charAt(0).toUpperCase() + theme.slice(1)}`
          if (configSite[fieldName]) {
            configSite[fieldName] = configSite[fieldName].map(projet => {
              const nouvelleCollecte = totauxParProjet[projet.id] || 0
              if (projet.collecte !== nouvelleCollecte) {
                updated = true
                return { ...projet, collecte: nouvelleCollecte }
              }
              return projet
            })
          }
        }

        // Sauvegarder si des changements ont été faits
        if (updated) {
          await prisma.paroisse.update({
            where: { id: paroisse.id },
            data: { configSite }
          })
          console.log(`✅ Paroisse ${paroisse.nom}: collectes mises à jour`)
        }
      }
    }

    console.log('✅ Toutes les collectes ont été mises à jour')
    
  } catch (error) {
    console.error('❌ Erreur mise à jour collectes:', error)
    throw error
  }
}