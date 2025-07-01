// src/app/site/[subdomain]/don/success/page.js - Version corrigée
import { notFound } from 'next/navigation'
import { prisma } from '../../../../../lib/prisma'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Home, Heart } from 'lucide-react'
import { processStripePaymentSuccess } from '../../../../../lib/stripe-utils'

export default async function DonSuccessPage({ params, searchParams }) {
  const { subdomain } = await params
  const { session_id: sessionId } = await searchParams

  const paroisse = await prisma.paroisse.findUnique({
    where: { subdomain }
  })

  if (!paroisse) {
    notFound()
  }

  let don = null
  let paymentProcessed = false

  // ✅ Traitement du paiement déplacé dans une fonction utilitaire
  if (sessionId) {
    try {
      const result = await processStripePaymentSuccess(sessionId)
      don = result.don
      paymentProcessed = result.success
      
      console.log('💰 Résultat traitement paiement:', {
        success: result.success,
        donId: result.don?.id,
        message: result.message
      })
    } catch (error) {
      console.error('❌ Erreur traitement paiement:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header de succès */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">
            Don effectué avec succès !
          </h1>
          <p className="text-green-50">
            Merci pour votre générosité
          </p>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {/* Statut de mise à jour */}
          {paymentProcessed && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-blue-800 text-sm font-medium">
                ✅ Votre don a été validé et comptabilisé !
              </p>
            </div>
          )}

          {/* Détails du don */}
          {don && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Récapitulatif de votre don</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Montant :</span>
                  <span className="font-medium text-green-600 text-lg">{don.montant}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut :</span>
                  <span className={`font-medium ${
                    don.statut === 'complete' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {don.statut === 'complete' ? '✅ Confirmé' : '⏳ En cours'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Projet :</span>
                  <span className="font-medium">{don.projetId}</span>
                </div>
                {!don.anonyme && don.donateur && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Donateur :</span>
                    <span className="font-medium">
                      {don.donateur.prenom} {don.donateur.nom}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Avantage fiscal */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <Heart className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-semibold text-blue-900">Avantage fiscal</span>
            </div>
            <p className="text-sm text-blue-800 text-center">
              Votre don est déductible des impôts à hauteur de 66%.
            </p>
            {don && (
              <p className="text-xs text-blue-700 mt-1 text-center">
                Ce don de {don.montant}€ ne vous coûte réellement que {don.montant - Math.round(don.montant * 0.66)}€
              </p>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="space-y-3">
            <Link
              href={`/site/${subdomain}/don`}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Voir l'impact de votre don
            </Link>
            
            <Link
              href={`/site/${subdomain}`}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <Home className="w-5 h-5 mr-2" />
              Retour à l'accueil
            </Link>
          </div>

          {/* Message d'information */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous recevrez un email de confirmation avec votre reçu fiscal dans les prochaines minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Génération des métadonnées
export async function generateMetadata({ params }) {
  const { subdomain } = await params
  
  const paroisse = await prisma.paroisse.findUnique({
    where: { subdomain }
  })

  return {
    title: `Don effectué - ${paroisse?.nom || 'Paroisse'}`,
    description: 'Merci pour votre don ! Votre générosité nous permet de poursuivre notre mission.',
    robots: 'noindex, nofollow',
  }
}