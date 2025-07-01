// ============================================================================
// src/components/ModalAddPretre.js - Version corrigée
// ============================================================================
'use client'
import { useState, useEffect } from 'react'
import { User, UserPlus, Mail, Phone, Camera, ArrowLeft, Shield, Check, Crown, Loader, X } from 'lucide-react'

export default function ModalAddPretre({ 
  isOpen, 
  onClose, 
  onSuccess,
  editingPretre = null,
  user // ✅ Reçu en prop au lieu d'utiliser useAuth()
}) {
  const [step, setStep] = useState(1) // 1: choix, 2: formulaire
  const [createAccount, setCreateAccount] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    fonction: '',
    email: '',
    telephone: '',
    photo: '',
    bio: '',
    ordre: 0,
    // Pour compte utilisateur
    permissions: ['pastorale', 'actualites', 'evenements'] // Permissions par défaut pour prêtres
  })

  // Mode édition : pré-remplir le formulaire
  useEffect(() => {
    if (editingPretre) {
      setFormData({
        nom: editingPretre.nom || '',
        prenom: editingPretre.prenom || '',
        fonction: editingPretre.fonction || '',
        email: editingPretre.email || '',
        telephone: editingPretre.telephone || '',
        photo: editingPretre.photo || '',
        bio: editingPretre.bio || '',
        ordre: editingPretre.ordre || 0,
        permissions: ['pastorale', 'actualites', 'evenements']
      })
      setCreateAccount(!!editingPretre.userId)
      setStep(2) // Aller directement au formulaire en mode édition
    }
  }, [editingPretre])

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

  if (!isOpen) return null

  const handleChoice = (withAccount) => {
    setCreateAccount(withAccount)
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const submitData = {
        ...formData,
        createAccount: createAccount && !editingPretre?.userId,
        removeAccount: editingPretre?.userId && !createAccount,
        permissions: createAccount ? formData.permissions : []
      }

      let response
      
      if (editingPretre) {
        response = await fetch(`/api/pretres/${editingPretre.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include', // ✅ Utiliser les cookies au lieu du token
          body: JSON.stringify(submitData)
        })
      } else {
        response = await fetch('/api/pretres', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include', // ✅ Utiliser les cookies au lieu du token
          body: JSON.stringify(submitData)
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erreur ${response.status}`)
      }

      const result = await response.json()
      
      if (result.tempPassword) {
        alert(`Prêtre ${editingPretre ? 'modifié' : 'ajouté'} avec succès!\n\nMot de passe temporaire: ${result.tempPassword}\n\nVeuillez le transmettre au prêtre pour qu'il puisse se connecter.`)
      }

      onSuccess?.(result.pretre)
      handleClose()
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!editingPretre) {
      setStep(1)
      setCreateAccount(false)
    }
    setFormData({
      nom: '',
      prenom: '',
      fonction: '',
      email: '',
      telephone: '',
      photo: '',
      bio: '',
      ordre: 0,
      permissions: ['pastorale', 'actualites', 'evenements']
    })
    setError('')
    setLoading(false)
    onClose()
  }

  const fonctionsValides = [
    'Curé', 
    'Vicaire', 
    'Prêtre auxiliaire', 
    'Prêtre coopérateur', 
    'Diacre', 
    'Séminariste',
    'Autre'
  ]

  const permissionsDisponibles = [
    { id: 'pastorale', label: 'Équipe pastorale', description: 'Gérer les prêtres et membres' },
    { id: 'actualites', label: 'Actualités', description: 'Créer et modifier les articles' },
    { id: 'evenements', label: 'Événements', description: 'Gérer le planning et l\'agenda' },
    { id: 'horaires', label: 'Horaires', description: 'Modifier les horaires de messes' },
    { id: 'dons', label: 'Dons', description: 'Gérer les projets de collecte' }
  ]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">
                  {editingPretre ? 'Modifier' : 'Ajouter'} un Prêtre
                </h2>
                <p className="text-white/80">Équipe presbytérale</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 transform hover:scale-105"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress indicator - seulement en mode création */}
          {!editingPretre && (
            <div className="mt-6 flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-white' : 'text-white/50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-white/20' : 'bg-white/10'}`}>
                  1
                </div>
                <span className="text-sm font-medium">Type de membre</span>
              </div>
              <div className="flex-1 h-0.5 bg-white/30">
                <div className={`h-full bg-white transition-all duration-300 ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
              </div>
              <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-white' : 'text-white/50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-white/20' : 'bg-white/10'}`}>
                  2
                </div>
                <span className="text-sm font-medium">Informations</span>
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          {step === 1 && !editingPretre ? (
            // Étape 1: Choix du type de membre
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Type de membre presbytéral
                </h3>
                <p className="text-lg text-gray-600">
                  Souhaitez-vous créer un compte d'accès pour ce prêtre ?
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Option sans compte */}
                <button
                  onClick={() => handleChoice(false)}
                  className="group p-8 bg-gradient-to-br from-gray-50 to-slate-50 rounded-3xl border-2 border-gray-200 hover:border-purple-400 hover:from-purple-50 hover:to-indigo-50 transition-all duration-300 text-left transform hover:scale-105 hover:shadow-xl"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-slate-500 rounded-2xl flex items-center justify-center group-hover:from-purple-500 group-hover:to-indigo-500 transition-all duration-300">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-2xl font-bold text-gray-900">
                        Affichage uniquement
                      </h3>
                      <p className="text-purple-600 font-medium">Pas d'accès administrateur</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                    Ajouter ce prêtre à l'équipe presbytérale pour affichage public. 
                    Il sera visible sur le site mais n'aura pas d'accès au tableau de bord.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-green-600">
                      <Check className="w-5 h-5 mr-3" />
                      <span className="font-medium">Visible sur la page "Équipe pastorale"</span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <Check className="w-5 h-5 mr-3" />
                      <span className="font-medium">Coordonnées affichées</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <X className="w-5 h-5 mr-3" />
                      <span>Pas d'accès au tableau de bord</span>
                    </div>
                  </div>
                </button>

                {/* Option avec compte */}
                <button
                  onClick={() => handleChoice(true)}
                  className="group p-8 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl border-2 border-purple-200 hover:border-purple-400 hover:from-purple-100 hover:to-indigo-100 transition-all duration-300 text-left transform hover:scale-105 hover:shadow-xl"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center group-hover:from-purple-600 group-hover:to-indigo-600 transition-all duration-300">
                      <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-2xl font-bold text-gray-900">
                        Avec accès administrateur
                      </h3>
                      <p className="text-purple-600 font-medium">Compte utilisateur</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                    Créer un compte d'accès pour que ce prêtre puisse gérer 
                    certaines parties du site web de la paroisse.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-green-600">
                      <Check className="w-5 h-5 mr-3" />
                      <span className="font-medium">Accès au tableau de bord</span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <Check className="w-5 h-5 mr-3" />
                      <span className="font-medium">Peut gérer ses sections</span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <Check className="w-5 h-5 mr-3" />
                      <span className="font-medium">Mot de passe temporaire généré</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            // Étape 2: Formulaire
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* En-tête du formulaire */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Informations du prêtre
                </h3>
                <p className="text-gray-600">
                  {editingPretre 
                    ? `Modification de ${editingPretre.prenom} ${editingPretre.nom}`
                    : createAccount ? 'Prêtre avec accès administrateur' : 'Prêtre sans compte utilisateur'
                  }
                </p>
              </div>

              {/* Photo de profil */}
              <div className="flex items-center space-x-8 p-6 bg-purple-50 rounded-2xl">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-200 to-indigo-300 rounded-2xl overflow-hidden shadow-lg">
                    {formData.photo ? (
                      <img 
                        src={formData.photo} 
                        alt="Photo de profil" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Crown className="w-12 h-12 text-purple-600" />
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 bg-purple-600 text-white p-3 rounded-2xl cursor-pointer hover:bg-purple-700 transition-all shadow-lg transform hover:scale-105">
                    <Camera className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setFormData({ ...formData, photo: reader.result })
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Photo du prêtre</h4>
                  <p className="text-gray-600 mb-4">
                    Ajoutez une photo qui sera affichée sur la page équipe pastorale
                  </p>
                  <p className="text-sm text-purple-600">
                    Formats acceptés : JPG, PNG • Taille recommandée : 400x400px
                  </p>
                </div>
              </div>

              {/* Informations personnelles */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Crown className="w-6 h-6 mr-3 text-purple-600" />
                  Informations personnelles
                </h4>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-bold text-gray-900 mb-3">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all text-lg"
                      placeholder="Prénom"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-lg font-bold text-gray-900 mb-3">
                      Nom de famille <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all text-lg"
                      placeholder="Nom de famille"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-lg font-bold text-gray-900 mb-3">
                    Fonction <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.fonction}
                    onChange={(e) => setFormData({ ...formData, fonction: e.target.value })}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all text-lg"
                    required
                  >
                    <option value="">Sélectionner une fonction</option>
                    {fonctionsValides.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Informations de contact */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Mail className="w-6 h-6 mr-3 text-green-600" />
                  Informations de contact
                </h4>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-bold text-gray-900 mb-3">
                      Adresse email
                      {createAccount && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all text-lg"
                      placeholder="email@paroisse.fr"
                      required={createAccount}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-lg font-bold text-gray-900 mb-3">
                      Numéro de téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all text-lg"
                      placeholder="01 23 45 67 89"
                    />
                  </div>
                </div>
              </div>

              {/* Biographie */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Crown className="w-6 h-6 mr-3 text-purple-600" />
                  Biographie
                </h4>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all text-lg resize-none"
                  placeholder="Parcours, formation, ministère, message d'accueil..."
                />
              </div>

              {/* Option compte utilisateur en mode édition */}
              {editingPretre && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                  <div className="flex items-center p-4 bg-white rounded-xl mb-4">
                    <input
                      type="checkbox"
                      id="createAccount"
                      checked={createAccount}
                      onChange={(e) => setCreateAccount(e.target.checked)}
                      className="w-5 h-5 mr-4 text-blue-600 rounded"
                    />
                    <div>
                      <label htmlFor="createAccount" className="text-lg font-medium text-gray-900 cursor-pointer">
                        {editingPretre.userId ? 'Conserver le compte utilisateur' : 'Créer un compte utilisateur'}
                      </label>
                      <p className="text-sm text-gray-600">
                        {editingPretre.userId 
                          ? 'Décocher pour supprimer l\'accès au tableau de bord'
                          : 'Permettre l\'accès au tableau de bord avec un mot de passe temporaire'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Permissions d'accès */}
              {createAccount && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                  <h4 className="text-xl font-bold text-blue-900 mb-6 flex items-center">
                    <Shield className="w-6 h-6 mr-3" />
                    Permissions d'accès
                  </h4>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {permissionsDisponibles.map(permission => (
                      <label 
                        key={permission.id}
                        className="flex items-center p-4 bg-white rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          value={permission.id}
                          checked={formData.permissions.includes(permission.id)}
                          onChange={(e) => {
                            const newPermissions = e.target.checked
                              ? [...formData.permissions, permission.id]
                              : formData.permissions.filter(p => p !== permission.id)
                            setFormData({ ...formData, permissions: newPermissions })
                          }}
                          className="w-5 h-5 mr-4 text-blue-600 rounded"
                        />
                        <div>
                          <span className="font-medium text-gray-900">{permission.label}</span>
                          <p className="text-sm text-gray-600">{permission.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 rounded-b-3xl">
          <div className="flex justify-between items-center">
            {step === 2 && !editingPretre ? (
              <button
                onClick={() => setStep(1)}
                className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                disabled={loading}
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
                disabled={loading}
              >
                Annuler
              </button>
              
              {step === 2 && (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3 text-white rounded-2xl font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <div className="flex items-center space-x-2">
                    {loading ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <UserPlus className="w-5 h-5" />
                    )}
                    <span>
                      {loading 
                        ? 'Sauvegarde...' 
                        : editingPretre 
                          ? 'Modifier le prêtre'
                          : createAccount 
                            ? 'Créer et inviter' 
                            : 'Ajouter le prêtre'
                      }
                    </span>
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