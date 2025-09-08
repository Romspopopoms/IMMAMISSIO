// src/app/page.js
import { Check, Smartphone, Globe, Users, Bell, BarChart3, Palette, Shield, ArrowRight, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function HomePage() {
  const fonctionnalites = [
    {
      icon: Globe,
      titre: "Site Web Moderne",
      description: "Un site responsive et élégant généré automatiquement pour votre paroisse"
    },
    {
      icon: Smartphone,
      titre: "Application Mobile",
      description: "App dédiée pour vos paroissiens avec notifications push et mode hors-ligne"
    },
    {
      icon: Users,
      titre: "Gestion Multi-Utilisateurs",
      description: "Admins spécialisés par section (jeunesse, musique, catéchisme...)"
    },
    {
      icon: Bell,
      titre: "Notifications Push",
      description: "Informez instantanément vos paroissiens des événements importants"
    },
    {
      icon: BarChart3,
      titre: "Statistiques Avancées",
      description: "Suivez l'engagement de votre communauté avec des analytics détaillés"
    },
    {
      icon: Palette,
      titre: "Personnalisation",
      description: "Templates modernes et personnalisables selon l'identité de votre paroisse"
    }
  ]

  const plans = [
    {
      nom: "Gratuit",
      prix: "0€",
      periode: "/mois",
      description: "Parfait pour commencer",
      fonctionnalites: [
        "Site web basique",
        "Actualités et horaires",
        "Jusqu'à 2 admins",
        "Support par email"
      ],
      limite: true,
      cta: "Commencer gratuitement"
    },
    {
      nom: "Premium",
      prix: "29€",
      periode: "/mois",
      description: "Pour une paroisse active",
      fonctionnalites: [
        "Tout du plan gratuit",
        "Application mobile",
        "Notifications push",
        "Admins illimités",
        "Statistiques avancées",
        "Support prioritaire"
      ],
      populaire: true,
      cta: "Essayer 30 jours gratuits"
    },
    {
      nom: "Enterprise",
      prix: "99€",
      periode: "/mois",
      description: "Pour les diocèses",
      fonctionnalites: [
        "Tout du plan premium",
        "Multi-paroisses",
        "White-label",
        "Formation personnalisée",
        "Support dédié",
        "API personnalisée"
      ],
      cta: "Nous contacter"
    }
  ]

  const temoignages = [
    {
      nom: "Père Martin",
      paroisse: "Paroisse Saint-Pierre, Paris",
      contenu: "ImaMissio a révolutionné notre communication. Les paroissiens sont plus engagés que jamais !",
      rating: 5
    },
    {
      nom: "Claire Dubois",
      paroisse: "Responsable communication, Lyon",
      contenu: "L'application mobile est fantastique. Nous touchons enfin les jeunes de notre communauté.",
      rating: 5
    },
    {
      nom: "Mgr François",
      paroisse: "Diocèse de Marseille",
      contenu: "Une solution complète qui nous fait gagner un temps précieux dans la gestion quotidienne.",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ImaMissio
              </h1>
            </div>
            <div className="hidden md:flex space-x-6 lg:space-x-8">
              <Link href="#fonctionnalites" className="text-gray-700 hover:text-blue-600 transition-colors text-sm lg:text-base">Fonctionnalités</Link>
              <Link href="#tarifs" className="text-gray-700 hover:text-blue-600 transition-colors text-sm lg:text-base">Tarifs</Link>
              <Link href="#temoignages" className="text-gray-700 hover:text-blue-600 transition-colors text-sm lg:text-base">Témoignages</Link>
              <Link href="/demo" className="text-gray-700 hover:text-blue-600 transition-colors text-sm lg:text-base">Démo</Link>
            </div>
            <div className="flex space-x-2 sm:space-x-4">
              <Link href="/login" className="hidden sm:inline text-gray-700 hover:text-blue-600 transition-colors text-sm lg:text-base">
                Connexion
              </Link>
              <Link href="/register" className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Essayer
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 pb-16 sm:pb-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              La plateforme digitale
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> moderne </span>
              pour votre paroisse
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Site web + application mobile en quelques clics. 
              Connectez votre communauté et modernisez votre communication.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 sm:mb-12">
              <Link href="/register" className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg text-center">
                Créer mon site gratuitement
              </Link>
              <Link href="/demo" className="border-2 border-gray-300 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-colors text-center">
                Voir la démo
              </Link>
            </div>
          </div>
          
          {/* Preview mockups */}
          <div className="relative max-w-6xl mx-auto">
            <div className="relative">
              {/* Desktop mockup */}
              <div className="bg-gray-900 rounded-t-xl p-2 sm:p-3 mx-auto max-w-sm sm:max-w-2xl lg:max-w-4xl">
                <div className="bg-white rounded-lg h-48 sm:h-64 lg:h-96 p-3 sm:p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-3 sm:mb-6">
                    <div className="text-sm sm:text-lg lg:text-xl font-bold text-blue-900">Paroisse Saint-Pierre</div>
                    <div className="flex space-x-1 sm:space-x-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-400 rounded-full"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg h-16 sm:h-24 lg:h-32 mb-3 sm:mb-4 flex items-center justify-center text-white">
                    <span className="text-sm sm:text-xl lg:text-2xl font-bold text-center px-2">Bienvenue dans notre communauté</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="bg-gray-100 rounded p-2 sm:p-3 h-8 sm:h-16 lg:h-20"></div>
                    <div className="bg-gray-100 rounded p-2 sm:p-3 h-8 sm:h-16 lg:h-20"></div>
                    <div className="bg-gray-100 rounded p-2 sm:p-3 h-8 sm:h-16 lg:h-20"></div>
                  </div>
                </div>
              </div>
              
              {/* Mobile mockup */}
              <div className="hidden sm:block absolute -bottom-6 sm:-bottom-10 -right-4 sm:-right-10 w-32 sm:w-48">
                <div className="bg-gray-900 rounded-3xl p-1.5 sm:p-2">
                  <div className="bg-white rounded-2xl h-64 sm:h-96 p-3 sm:p-4">
                    <div className="text-center mb-3 sm:mb-4">
                      <div className="text-xs sm:text-sm font-bold text-blue-900">ImaMissio</div>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="bg-blue-100 rounded-lg p-2 sm:p-3 h-4 sm:h-8"></div>
                      <div className="bg-gray-100 rounded-lg p-2 sm:p-3 h-4 sm:h-8"></div>
                      <div className="bg-gray-100 rounded-lg p-2 sm:p-3 h-4 sm:h-8"></div>
                      <div className="bg-purple-100 rounded-lg p-2 sm:p-3 h-4 sm:h-8"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 sm:py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-sm sm:text-base text-gray-600">Paroisses connectées</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-2">50k+</div>
              <div className="text-sm sm:text-base text-gray-600">Paroissiens actifs</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-sm sm:text-base text-gray-600">Disponibilité</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-2">4.9/5</div>
              <div className="text-sm sm:text-base text-gray-600">Satisfaction client</div>
            </div>
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section id="fonctionnalites" className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Tout ce dont votre paroisse a besoin
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Une solution complète qui modernise votre communication et renforce les liens avec votre communauté
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {fonctionnalites.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div key={index} className="bg-white rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">{feature.titre}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Lancez votre paroisse en ligne en 3 étapes
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6">
                1
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Créez votre compte</h3>
              <p className="text-sm sm:text-base text-gray-600">Inscription gratuite en 2 minutes. Renseignez les informations de base de votre paroisse.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6">
                2
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Personnalisez votre site</h3>
              <p className="text-sm sm:text-base text-gray-600">Ajoutez vos contenus, horaires, activités. Votre site se génère automatiquement.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6">
                3
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Partagez avec vos paroissiens</h3>
              <p className="text-sm sm:text-base text-gray-600">Votre communauté peut maintenant accéder au site et télécharger l'app mobile.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section id="tarifs" className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Des tarifs adaptés à chaque paroisse
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Commencez gratuitement, évoluez selon vos besoins
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {plans.map((plan, index) => (
              <div key={index} className={`bg-white rounded-2xl p-6 sm:p-8 shadow-sm ${plan.populaire ? 'ring-2 ring-blue-600 relative' : ''}`}>
                {plan.populaire && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                      Le plus populaire
                    </span>
                  </div>
                )}
                <div className="text-center mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{plan.nom}</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">{plan.prix}</span>
                    <span className="text-sm sm:text-base text-gray-600">{plan.periode}</span>
                  </div>
                </div>
                
                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {plan.fonctionnalites.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link href="/register" className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-semibold transition-colors text-center block ${
                  plan.populaire 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section id="temoignages" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {temoignages.map((temoignage, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 sm:p-8">
                <div className="flex mb-4">
                  {[...Array(temoignage.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-700 mb-6 italic">"{temoignage.contenu}"</p>
                <div>
                  <div className="font-semibold text-gray-900 text-sm sm:text-base">{temoignage.nom}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{temoignage.paroisse}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6">
            Prêt à moderniser votre paroisse ?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-8">
            Rejoignez les centaines de paroisses qui ont déjà fait le choix d'ImaMissio
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-gray-100 transition-colors text-center">
              Commencer gratuitement
            </Link>
            <Link href="/contact" className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors text-center">
              Planifier une démo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="sm:col-span-2 md:col-span-1">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ImaMissio
              </h3>
              <p className="text-sm sm:text-base text-gray-400 mb-4">
                La plateforme moderne pour connecter votre communauté paroissiale.
              </p>
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li><Link href="#" className="hover:text-white transition-colors">Fonctionnalités</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Tarifs</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Démo</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Templates</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li><Link href="#" className="hover:text-white transition-colors">Centre d'aide</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Formation</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Statut</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li><Link href="#" className="hover:text-white transition-colors">Confidentialité</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Conditions</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400">
            <p className="text-sm sm:text-base">&copy; 2024 ImaMissio. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}