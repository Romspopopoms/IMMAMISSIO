// src/components/ModalContribuer.js
'use client'
import { useState, useEffect } from 'react'
import { X, Euro, CreditCard, Heart, Mail, User, Phone, Gift, ArrowRight, ArrowLeft, Shield, Check, Calculator } from 'lucide-react'
import { getStripe } from '../lib/stripe-client'

export default function ModalContribuer({ 
  isOpen, 
  onClose, 
  projet,
  paroisseId,
  onSuccess
}) {
  const [step, setStep] = useState(1) // 1: montant, 2: infos, 3: paiement
  const [formData, setFormData] = useState({
    montant: '',
    montantAutre: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    anonyme: false,
    message: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !projet) return null

  const montantsPredefinis = [10, 20, 50, 100, 200, 500]

  const getMontantFinal = () => {
    return formData.montant === 'autre' 
      ? parseInt(formData.montantAutre) 
      : parseInt(formData.montant)
  }

  const handleMontantSelect = (montant) => {
    setFormData({ ...formData, montant, montantAutre: '' })
  }

  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/dons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projetId: projet.id,
          montant: getMontantFinal(),
          donateur: formData.anonyme ? null : {
            nom: formData.nom,
            prenom: formData.prenom,
            email: formData.email,
            telephone: formData.telephone
          },
          message: formData.message,
          anonyme: formData.anonyme,
          paroisseId: paroisseId
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Rediriger vers Stripe Checkout
        const stripe = await getStripe()
        if (stripe && data.sessionId) {
          const { error } = await stripe.redirectToCheckout({
            sessionId: data.sessionId
          })
          
          if (error) {
            console.error('Erreur Stripe:', error)
            alert('Erreur lors du paiement')
          }
        }
      } else {
        alert('Erreur lors du traitement du don')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep(1)
    setFormData({
      montant: '',
      montantAutre: '',
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      anonyme: false,
      message: ''
    })
    onClose()
  }

  const canProceed = () => {
    if (step === 1) {
      return formData.montant && (formData.montant !== 'autre' || (formData.montantAutre && parseInt(formData.montantAutre) > 0))
    }
    if (step === 2) {
      if (formData.anonyme) return true
      
      // Validation email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return formData.nom && formData.email && emailRegex.test(formData.email)
    }
    return true
  }

  const getDeduction = () => {
    const montant = getMontantFinal()
    return Math.round(montant * 0.66)
  }

  const getCoutReel = () => {
    return getMontantFinal() - getDeduction()
  }

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Choisir le montant'
      case 2: return 'Vos informations'
      case 3: return 'Confirmation'
      default: return ''
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Modernisé */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Gift className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Faire un don</h2>
              <p className="text-emerald-100">{projet.titre}</p>
            </div>
          </div>
          
          {/* Progress steps */}
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step >= stepNum ? 'bg-white text-emerald-600' : 'bg-white/20 text-white/70'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className="w-12 h-0.5 mx-2 bg-white/30">
                    <div className={`h-full bg-white transition-all duration-300 ${step > stepNum ? 'w-full' : 'w-0'}`}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <p className="text-emerald-100 text-sm mt-2">{getStepTitle()}</p>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Votre contribution
                </h3>
                <p className="text-gray-600">
                  Choisissez le montant de votre don pour soutenir ce projet
                </p>
              </div>
              
              {/* Montants prédéfinis - Modernisés */}
              <div className="grid grid-cols-3 gap-4">
                {montantsPredefinis.map((montant) => (
                  <button
                    key={montant}
                    onClick={() => handleMontantSelect(montant.toString())}
                    className={`group relative p-6 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 ${
                      formData.montant === montant.toString()
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-2 border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <Euro className="w-6 h-6 mx-auto mb-2" />
                    {montant}€
                    {formData.montant === montant.toString() && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Montant libre - Modernisé */}
              <div className="space-y-4">
                <button
                  onClick={() => handleMontantSelect('autre')}
                  className={`w-full p-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                    formData.montant === 'autre'
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-2 border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-3">
                    <Calculator className="w-6 h-6" />
                    <span>Montant personnalisé</span>
                  </div>
                </button>

                {formData.montant === 'autre' && (
                  <div className="relative">
                    <Euro className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                    <input
                      type="number"
                      value={formData.montantAutre}
                      onChange={(e) => setFormData({ ...formData, montantAutre: e.target.value })}
                      placeholder="Entrez votre montant"
                      min="1"
                      className="w-full pl-14 pr-5 py-5 text-xl font-bold border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* Calculateur de déduction fiscale */}
              {getMontantFinal() > 0 && (
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                      <Calculator className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h4 className="text-lg font-bold text-emerald-900">Avantage fiscal</h4>
                  </div>
                  
                  <div className="space-y-3 text-emerald-800">
                    <div className="flex justify-between items-center">
                      <span>Votre don :</span>
                      <span className="font-bold text-xl">{getMontantFinal()}€</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Déduction fiscale (66%) :</span>
                      <span className="font-bold text-emerald-600">-{getDeduction()}€</span>
                    </div>
                    <div className="border-t border-emerald-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">Coût réel pour vous :</span>
                        <span className="font-bold text-2xl text-emerald-700">{getCoutReel()}€</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Vos coordonnées
                </h3>
                <p className="text-gray-600">
                  Pour votre reçu fiscal et votre suivi de don
                </p>
              </div>

              {/* Don anonyme */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <label className="flex items-center space-x-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.anonyme}
                    onChange={(e) => setFormData({ ...formData, anonyme: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded border-2 border-gray-300"
                  />
                  <div>
                    <span className="text-lg font-bold text-gray-900">Don anonyme</span>
                    <p className="text-sm text-gray-600">Votre nom ne sera pas affiché publiquement</p>
                  </div>
                </label>
              </div>

              {!formData.anonyme && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-lg font-bold text-gray-900 mb-3">
                        Prénom *
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.prenom}
                          onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all text-lg"
                          placeholder="Votre prénom"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-lg font-bold text-gray-900 mb-3">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all text-lg"
                        placeholder="Votre nom"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-bold text-gray-900 mb-3">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all text-lg"
                        placeholder="votre@email.fr"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-bold text-gray-900 mb-3">
                      Téléphone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.telephone}
                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all text-lg"
                        placeholder="01 23 45 67 89"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  Message de soutien
                  <span className="text-sm font-normal text-gray-500 ml-2">(optionnel)</span>
                </label>
                <div className="relative">
                  <Heart className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    placeholder="Partagez vos encouragements avec la communauté..."
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all resize-none text-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Récapitulatif de votre don
                </h3>
                <p className="text-gray-600">
                  Vérifiez vos informations avant de procéder au paiement
                </p>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg text-gray-600">Projet :</span>
                  <span className="font-bold text-lg text-gray-900">{projet.titre}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg text-gray-600">Montant du don :</span>
                  <span className="font-bold text-2xl text-emerald-600">{getMontantFinal()}€</span>
                </div>
                
                {!formData.anonyme && (
                  <div className="flex items-center justify-between">
                    <span className="text-lg text-gray-600">Donateur :</span>
                    <span className="font-bold text-lg text-gray-900">{formData.prenom} {formData.nom}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-300 pt-6">
                  <div className="flex items-center justify-between text-emerald-600">
                    <span className="text-lg">Déduction fiscale :</span>
                    <span className="font-bold text-xl">-{getDeduction()}€</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-gray-900">Coût réel :</span>
                    <span className="font-bold text-2xl text-emerald-700">{getCoutReel()}€</span>
                  </div>
                </div>
              </div>

              {formData.message && (
                <div className="bg-pink-50 border border-pink-200 rounded-2xl p-6">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-pink-600" />
                    Votre message
                  </h4>
                  <p className="text-gray-700 italic">"{formData.message}"</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900">Paiement sécurisé</h4>
                    <p className="text-sm text-blue-700">
                      Vous allez être redirigé vers notre plateforme de paiement sécurisé Stripe
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Modernisé */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 rounded-b-3xl">
          <div className="flex justify-between items-center">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour
              </button>
            ) : (
              <div></div>
            )}
            
            <div className="flex space-x-4">
              <button
                onClick={handleClose}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-100 hover:border-gray-400 transition-all font-medium"
              >
                Annuler
              </button>
              
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all transform hover:scale-105 shadow-lg disabled:transform-none"
                >
                  <div className="flex items-center space-x-2">
                    <span>Continuer</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 font-bold transition-all transform hover:scale-105 shadow-lg disabled:transform-none"
                >
                  <div className="flex items-center space-x-2">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Traitement...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        <span>Procéder au paiement</span>
                      </>
                    )}
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}