// ============================================================================
// FICHIER 2 : src/app/register/page.js - Register sécurisé
// ============================================================================
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, Building, ArrowRight, ArrowLeft, Check } from 'lucide-react'

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Infos personnelles
    prenom: '',
    nom: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Infos paroisse
    paroisseNom: '',
    paroisseAdresse: '',
    paroisseVille: '',
    paroisseCodePostal: '',
    paroisseSubdomain: '',
    paroisseTelephone: '',
    paroisseEmail: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { register, user, loading: authLoading } = useAuth()
  const router = useRouter()

  // ✅ Rediriger si déjà connecté
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  // ✅ Afficher un loader pendant la vérification d'auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Vérification...</p>
        </div>
      </div>
    )
  }

  // ✅ Ne pas afficher la page si déjà connecté
  if (user) {
    return null
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  const generateSubdomain = (nom) => {
    return nom
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleParoisseNomChange = (e) => {
    const nom = e.target.value
    setFormData({
      ...formData,
      paroisseNom: nom,
      paroisseSubdomain: generateSubdomain(nom)
    })
  }

  const nextStep = () => {
    // ✅ Validation étape 1 renforcée
    if (!formData.email || !formData.password || !formData.prenom || !formData.nom) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    // ✅ Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez saisir une adresse email valide')
      return
    }
    
    setError('')
    setStep(2)
  }

  const prevStep = () => {
    setStep(1)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // ✅ Validation finale
    if (!formData.paroisseNom || !formData.paroisseSubdomain) {
      setError('Le nom de la paroisse est obligatoire')
      setLoading(false)
      return
    }

    // ✅ Validation subdomain
    if (formData.paroisseSubdomain.length < 3) {
      setError('L\'adresse du site doit contenir au moins 3 caractères')
      setLoading(false)
      return
    }

    try {
      const registrationData = {
        email: formData.email,
        password: formData.password,
        nom: formData.nom,
        prenom: formData.prenom,
        role: 'PAROISSE_ADMIN',
        paroisse: {
          nom: formData.paroisseNom,
          adresse: formData.paroisseAdresse,
          ville: formData.paroisseVille,
          codePostal: formData.paroisseCodePostal,
          telephone: formData.paroisseTelephone,
          email: formData.paroisseEmail,
          subdomain: formData.paroisseSubdomain
        }
      }

      // ✅ Appel de la fonction register du contexte (mise à jour)
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ Inclure les cookies
        body: JSON.stringify(registrationData)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // ✅ Pas besoin de localStorage, le contexte va se recharger
        router.push('/dashboard')
      } else {
        setError(result.error || 'Erreur lors de l\'inscription')
      }
    } catch (error) {
      console.error('Erreur inscription:', error)
      setError('Une erreur est survenue lors de l\'inscription')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ImaMissio
            </h1>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Créer votre paroisse
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Lancez votre site paroissial en quelques minutes
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[1, 2].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step >= stepNumber 
                  ? 'bg-blue-600 text-white shadow-lg scale-110' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step > stepNumber ? (
                  <Check className="w-4 h-4" />
                ) : (
                  stepNumber
                )}
              </div>
              {stepNumber < 2 && (
                <div className={`w-12 h-1 mx-2 transition-all ${
                  step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Infos personnelles */}
        {step === 1 && (
          <form className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Vos informations personnelles
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Vous serez l'administrateur principal de votre paroisse
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  id="prenom"
                  name="prenom"
                  type="text"
                  required
                  value={formData.prenom}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Jean"
                />
              </div>
              
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  required
                  value={formData.nom}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Dupont"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Minimum 6 caractères"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Confirmez votre mot de passe"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                <div className="w-4 h-4 rounded-full bg-red-200 flex items-center justify-center mr-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                </div>
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={nextStep}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-all font-semibold transform hover:scale-[1.02] flex items-center justify-center"
            >
              Continuer
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </form>
        )}

        {/* Step 2: Infos paroisse */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Informations de votre paroisse
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Ces informations apparaîtront sur votre site web
              </p>
            </div>
            
            <div>
              <label htmlFor="paroisseNom" className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la paroisse *
              </label>
              <input
                id="paroisseNom"
                name="paroisseNom"
                type="text"
                required
                value={formData.paroisseNom}
                onChange={handleParoisseNomChange}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Paroisse Saint-Pierre"
              />
            </div>

            <div>
              <label htmlFor="paroisseSubdomain" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse de votre site web *
              </label>
              <div className="flex">
                <input
                  id="paroisseSubdomain"
                  name="paroisseSubdomain"
                  type="text"
                  required
                  value={formData.paroisseSubdomain}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="saint-pierre"
                />
                <span className="bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg px-3 py-3 text-gray-600 text-sm whitespace-nowrap">
                  .imamissio.com
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Votre site sera accessible à l'adresse : <span className="font-medium">{formData.paroisseSubdomain || 'votre-paroisse'}.imamissio.com</span>
              </p>
            </div>

            <div>
              <label htmlFor="paroisseAdresse" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse complète
              </label>
              <input
                id="paroisseAdresse"
                name="paroisseAdresse"
                type="text"
                value={formData.paroisseAdresse}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="123 Rue de l'Église"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="paroisseVille" className="block text-sm font-medium text-gray-700 mb-1">
                  Ville
                </label>
                <input
                  id="paroisseVille"
                  name="paroisseVille"
                  type="text"
                  value={formData.paroisseVille}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Paris"
                />
              </div>
              
              <div>
                <label htmlFor="paroisseCodePostal" className="block text-sm font-medium text-gray-700 mb-1">
                  Code postal
                </label>
                <input
                  id="paroisseCodePostal"
                  name="paroisseCodePostal"
                  type="text"
                  value={formData.paroisseCodePostal}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="75001"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="paroisseTelephone" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  id="paroisseTelephone"
                  name="paroisseTelephone"
                  type="tel"
                  value={formData.paroisseTelephone}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="01 23 45 67 89"
                />
              </div>
              
              <div>
                <label htmlFor="paroisseEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email paroisse
                </label>
                <input
                  id="paroisseEmail"
                  name="paroisseEmail"
                  type="email"
                  value={formData.paroisseEmail}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="contact@paroisse.fr"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                <div className="w-4 h-4 rounded-full bg-red-200 flex items-center justify-center mr-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                </div>
                {error}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-all font-semibold flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Création...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Créer ma paroisse
                    <Check className="w-4 h-4 ml-2" />
                  </div>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Lien connexion */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
              Se connecter
            </Link>
          </p>
        </div>

        {/* Retour accueil */}
        <div className="text-center">
          <Link 
            href="/" 
            className="text-gray-600 hover:text-gray-900 text-sm transition-colors inline-flex items-center"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}