// ============================================================================
// src/components/ModalAddMembre.js - Version corrigée
// ============================================================================
'use client'
import { useState, useEffect } from 'react'
import { X, User, UserPlus, Mail, Phone, Camera, ArrowLeft, Shield, Settings, Check, Users, Building, Loader, Plus, Trash2 } from 'lucide-react'

export default function ModalAddMembre({ 
  isOpen, 
  onClose, 
  onSuccess,
  editingMembre = null,
  availableConseils = [],
  availableSecteurs = [],
  user // ✅ Reçu en prop au lieu d'utiliser useAuth()
}) {
  const [step, setStep] = useState(1) // 1: choix, 2: formulaire
  const [createAccount, setCreateAccount] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    photo: '',
    // Relations
    conseils: [], // [{ conseilId, fonction }]
    secteurs: [], // [{ secteurId, fonction }]
    // Pour compte utilisateur
    permissions: []
  })

  // Mode édition : pré-remplir le formulaire
  useEffect(() => {
    if (editingMembre) {
      setFormData({
        nom: editingMembre.nom || '',
        prenom: editingMembre.prenom || '',
        email: editingMembre.email || '',
        telephone: editingMembre.telephone || '',
        photo: editingMembre.photo || '',
        conseils: editingMembre.appartenances?.map(app => ({
          conseilId: app.conseil.id,
          fonction: app.fonction
        })) || [],
        secteurs: editingMembre.responsabilites?.map(resp => ({
          secteurId: resp.secteur.id,
          fonction: resp.fonction
        })) || [],
        permissions: []
      })
      setCreateAccount(!!editingMembre.userId)
      setStep(2) // Aller directement au formulaire en mode édition
    }
  }, [editingMembre])

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
        createAccount: createAccount && !editingMembre?.userId,
        removeAccount: editingMembre?.userId && !createAccount,
        permissions: createAccount ? formData.permissions : []
      }

      let response
      
      if (editingMembre) {
        // Mode édition
        response = await fetch(`/api/membres/${editingMembre.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include', // ✅ Utiliser les cookies au lieu du token
          body: JSON.stringify(submitData)
        })
      } else {
        // Mode création
        response = await fetch('/api/membres', {
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
      
      // Afficher le mot de passe temporaire si généré
      if (result.tempPassword) {
        alert(`Membre ${editingMembre ? 'modifié' : 'ajouté'} avec succès!\n\nMot de passe temporaire: ${result.tempPassword}\n\nVeuillez le transmettre à la personne pour qu'elle puisse se connecter.`)
      }

      onSuccess?.(result.membre)
      handleClose()
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!editingMembre) {
      setStep(1)
      setCreateAccount(false)
    }
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      photo: '',
      conseils: [],
      secteurs: [],
      permissions: []
    })
    setError('')
    setLoading(false)
    onClose()
  }

  const addConseil = () => {
    setFormData({
      ...formData,
      conseils: [...formData.conseils, { conseilId: '', fonction: 'Membre' }]
    })
  }

  const updateConseil = (index, field, value) => {
    const newConseils = [...formData.conseils]
    newConseils[index][field] = value
    setFormData({ ...formData, conseils: newConseils })
  }

  const removeConseil = (index) => {
    const newConseils = formData.conseils.filter((_, i) => i !== index)
    setFormData({ ...formData, conseils: newConseils })
  }

  const addSecteur = () => {
    setFormData({
      ...formData,
      secteurs: [...formData.secteurs, { secteurId: '', fonction: 'Responsable' }]
    })
  }

  const updateSecteur = (index, field, value) => {
    const newSecteurs = [...formData.secteurs]
    newSecteurs[index][field] = value
    setFormData({ ...formData, secteurs: newSecteurs })
  }

  const removeSecteur = (index) => {
    const newSecteurs = formData.secteurs.filter((_, i) => i !== index)
    setFormData({ ...formData, secteurs: newSecteurs })
  }

  const fonctionsConseil = ['Président', 'Vice-président', 'Trésorier', 'Secrétaire', 'Membre']
  const fonctionsSecteur = ['Responsable', 'Responsable adjoint', 'Coordinateur']

  const permissionsDisponibles = [
    { id: 'actualites', label: 'Actualités', description: 'Créer et modifier les articles' },
    { id: 'evenements', label: 'Événements', description: 'Gérer le planning et l\'agenda' },
    { id: 'pastorale', label: 'Équipe pastorale', description: 'Voir les informations de l\'équipe' }
  ]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 text-white bg-gradient-to-r from-blue-600 to-cyan-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">
                  {editingMembre ? 'Modifier' : 'Ajouter'} un Membre
                </h2>
                <p className="text-white/80">Membre laïc de la paroisse</p>
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
          {!editingMembre && (
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
          {step === 1 && !editingMembre ? (
            // Étape 1: Choix du type de membre (seulement en création)
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Type de membre laïc
                </h3>
                <p className="text-lg text-gray-600">
                  Souhaitez-vous créer un compte d'accès pour cette personne ?
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Option sans compte */}
                <button
                  onClick={() => handleChoice(false)}
                  className="group p-8 bg-gradient-to-br from-gray-50 to-slate-50 rounded-3xl border-2 border-gray-200 hover:border-blue-400 hover:from-blue-50 hover:to-cyan-50 transition-all duration-300 text-left transform hover:scale-105 hover:shadow-xl"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-slate-500 rounded-2xl flex items-center justify-center group-hover:from-blue-500 group-hover:to-cyan-500 transition-all duration-300">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-2xl font-bold text-gray-900">
                        Membre simple
                      </h3>
                      <p className="text-blue-600 font-medium">Affichage public</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                    Ajouter cette personne aux conseils et secteurs. 
                    Elle sera visible sur le site mais n'aura pas d'accès administrateur.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-green-600">
                      <Check className="w-5 h-5 mr-3" />
                      <span className="font-medium">Visible sur la page équipe</span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <Check className="w-5 h-5 mr-3" />
                      <span className="font-medium">Membre de conseils/secteurs</span>
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
                  className="group p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl border-2 border-blue-200 hover:border-blue-400 hover:from-blue-100 hover:to-cyan-100 transition-all duration-300 text-left transform hover:scale-105 hover:shadow-xl"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:from-blue-600 group-hover:to-cyan-600 transition-all duration-300">
                      <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-2xl font-bold text-gray-900">
                        Membre avec compte
                      </h3>
                      <p className="text-blue-600 font-medium">Accès spécialisé</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                    Créer un compte d'accès pour que cette personne puisse gérer 
                    ses sections et contribuer au site web de la paroisse.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-green-600">
                      <Check className="w-5 h-5 mr-3" />
                      <span className="font-medium">Accès spécialisé au tableau de bord</span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <Check className="w-5 h-5 mr-3" />
                      <span className="font-medium">Peut gérer ses domaines</span>
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
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Informations du membre
                </h3>
                <p className="text-gray-600">
                  {editingMembre 
                    ? `Modification de ${editingMembre.prenom} ${editingMembre.nom}`
                    : createAccount ? 'Membre avec accès spécialisé' : 'Membre sans compte utilisateur'
                  }
                </p>
              </div>

              {/* Photo de profil */}
              <div className="flex items-center space-x-8 p-6 bg-blue-50 rounded-2xl">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-2xl overflow-hidden shadow-lg">
                    {formData.photo ? (
                      <img 
                        src={formData.photo} 
                        alt="Photo de profil" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-12 h-12 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-3 rounded-2xl cursor-pointer hover:bg-blue-700 transition-all shadow-lg transform hover:scale-105">
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
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Photo du membre</h4>
                  <p className="text-gray-600 mb-4">
                    Ajoutez une photo qui sera affichée sur la page équipe pastorale
                  </p>
                  <p className="text-sm text-blue-600">
                    Formats acceptés : JPG, PNG • Taille recommandée : 400x400px
                  </p>
                </div>
              </div>

              {/* Informations personnelles */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <User className="w-6 h-6 mr-3 text-blue-600" />
                  Informations personnelles
                </h4>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-bold text-gray-900 mb-3">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg"
                      placeholder="Prénom"
                      required
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
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg"
                      placeholder="Nom de famille"
                      required
                    />
                  </div>
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

              {/* Appartenances aux conseils */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Building className="w-6 h-6 mr-3 text-purple-600" />
                  Conseils paroissiaux
                </h4>
                
                <div className="space-y-4">
                  {formData.conseils.map((conseil, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl">
                      <div className="flex-1 grid md:grid-cols-2 gap-4">
                        <select
                          value={conseil.conseilId}
                          onChange={(e) => updateConseil(index, 'conseilId', e.target.value)}
                          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all"
                          required
                        >
                          <option value="">Sélectionner un conseil</option>
                          {availableConseils.map(c => (
                            <option key={c.id} value={c.id}>{c.nom}</option>
                          ))}
                        </select>
                        
                        <select
                          value={conseil.fonction}
                          onChange={(e) => updateConseil(index, 'fonction', e.target.value)}
                          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all"
                        >
                          {fonctionsConseil.map(f => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeConseil(index)}
                        className="p-3 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addConseil}
                    className="w-full p-4 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 hover:border-purple-400 hover:bg-purple-50 transition-all flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Ajouter à un conseil
                  </button>
                </div>
              </div>

              {/* Responsabilités de secteurs */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-orange-600" />
                  Secteurs d'activités
                </h4>
                
                <div className="space-y-4">
                  {formData.secteurs.map((secteur, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-orange-50 rounded-xl">
                      <div className="flex-1 grid md:grid-cols-2 gap-4">
                        <select
                          value={secteur.secteurId}
                          onChange={(e) => updateSecteur(index, 'secteurId', e.target.value)}
                          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all"
                          required
                        >
                          <option value="">Sélectionner un secteur</option>
                          {availableSecteurs.map(s => (
                            <option key={s.id} value={s.id}>{s.nom}</option>
                          ))}
                        </select>
                        
                        <select
                          value={secteur.fonction}
                          onChange={(e) => updateSecteur(index, 'fonction', e.target.value)}
                          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all"
                        >
                          {fonctionsSecteur.map(f => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeSecteur(index)}
                        className="p-3 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addSecteur}
                    className="w-full p-4 border-2 border-dashed border-orange-300 rounded-xl text-orange-600 hover:border-orange-400 hover:bg-orange-50 transition-all flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Assigner à un secteur
                  </button>
                </div>
              </div>

              {/* Option compte utilisateur en mode édition */}
              {editingMembre && (
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
                        {editingMembre.userId ? 'Conserver le compte utilisateur' : 'Créer un compte utilisateur'}
                      </label>
                      <p className="text-sm text-gray-600">
                        {editingMembre.userId 
                          ? 'Décocher pour supprimer l\'accès au tableau de bord'
                          : 'Permettre l\'accès spécialisé au tableau de bord'
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
                    <Settings className="w-6 h-6 mr-3" />
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
            {step === 2 && !editingMembre ? (
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
                  className="px-8 py-3 text-white rounded-2xl font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                        : editingMembre 
                          ? 'Modifier le membre'
                          : createAccount 
                            ? 'Créer et inviter' 
                            : 'Ajouter le membre'
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